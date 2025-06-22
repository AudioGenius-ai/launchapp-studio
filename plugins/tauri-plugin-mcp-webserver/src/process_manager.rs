use crate::models::*;
use crate::error::{Error, Result};
use dashmap::DashMap;
use std::sync::Arc;
use tauri::{AppHandle, Runtime};
use tauri_plugin_shell::{ShellExt, process::CommandEvent};
use tokio::sync::RwLock;
use uuid::Uuid;
use tracing::{error, info, debug};

pub struct McpServerProcess {
    pub instance: McpServerInstance,
    pub child: Arc<RwLock<tauri_plugin_shell::process::CommandChild>>,
    pub health_check_url: Option<String>,
}

pub struct McpProcessManager<R: Runtime> {
    app_handle: AppHandle<R>,
    instances: Arc<DashMap<String, Arc<McpServerProcess>>>,
}

impl<R: Runtime> McpProcessManager<R> {
    pub fn new(app_handle: AppHandle<R>) -> Self {
        Self {
            app_handle,
            instances: Arc::new(DashMap::new()),
        }
    }

    pub async fn start_server(&self, config: McpServerConfig) -> Result<McpServerInstance> {
        let instance_id = Uuid::new_v4().to_string();
        
        // Find an available port
        let port = portpicker::pick_unused_port()
            .ok_or_else(|| Error::PortNotAvailable)?;
        
        info!("Starting MCP server '{}' on port {}", config.name, port);
        
        // Determine if we're using a sidecar or external command
        let command = if config.command == "launchapp-mcp-sidecar" {
            // Use the bundled sidecar
            self.app_handle.shell()
                .sidecar("launchapp-mcp-sidecar")
                .map_err(|e| Error::Server(format!("Failed to create sidecar command: {}", e)))?
        } else {
            // Use external command
            self.app_handle.shell()
                .command(&config.command)
        };
        
        // Add arguments
        let mut command = command.args(&config.args);
        
        // Set environment variables
        command = command.env("MCP_SERVER_PORT", port.to_string());
        if let Some(env_vars) = &config.env {
            for (key, value) in env_vars {
                command = command.env(key, value);
            }
        }
        
        // Set working directory if provided
        if let Some(cwd) = &config.cwd {
            command = command.current_dir(cwd);
        }
        
        // Spawn the process
        let (mut rx, child) = command.spawn()
            .map_err(|e| Error::Server(format!("Failed to spawn process: {}", e)))?;
        
        let pid = child.pid();
        
        // Create the instance
        let instance = McpServerInstance {
            id: instance_id.clone(),
            name: config.name.clone(),
            pid,
            port,
            status: ServerStatus::Starting,
            started_at: chrono::Utc::now(),
            config: config.clone(),
        };
        
        // Start monitoring stdout/stderr
        let instance_id_clone = instance_id.clone();
        let instances = self.instances.clone();
        tokio::spawn(async move {
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(line) => {
                        let line_str = String::from_utf8_lossy(&line);
                        debug!("[{}] stdout: {}", instance_id_clone, line_str);
                    }
                    CommandEvent::Stderr(line) => {
                        let line_str = String::from_utf8_lossy(&line);
                        error!("[{}] stderr: {}", instance_id_clone, line_str);
                    }
                    CommandEvent::Error(err) => {
                        error!("[{}] error: {}", instance_id_clone, err);
                        // Update status to error
                        if let Some(mut entry) = instances.get_mut(&instance_id_clone) {
                            let process = Arc::make_mut(&mut entry);
                            process.instance.status = ServerStatus::Error(err);
                        }
                    }
                    CommandEvent::Terminated(payload) => {
                        info!("[{}] terminated with code: {:?}", instance_id_clone, payload.code);
                        // Update status to stopped
                        if let Some(mut entry) = instances.get_mut(&instance_id_clone) {
                            let process = Arc::make_mut(&mut entry);
                            process.instance.status = ServerStatus::Stopped;
                        }
                    }
                    _ => {}
                }
            }
        });
        
        // Store the process
        let process = Arc::new(McpServerProcess {
            instance: instance.clone(),
            child: Arc::new(RwLock::new(child)),
            health_check_url: Some(format!("http://localhost:{}/health", port)),
        });
        
        self.instances.insert(instance_id.clone(), process.clone());
        
        // Wait a bit for the server to start
        tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
        
        // Check if the server is running
        if let Err(e) = self.check_server_health(&instance_id).await {
            error!("Server health check failed: {}", e);
            // Update status to error
            if let Some(mut entry) = self.instances.get_mut(&instance_id) {
                let process = Arc::make_mut(&mut entry);
                let mut instance = process.instance.clone();
                instance.status = ServerStatus::Error(e.to_string());
                process.instance = instance.clone();
                return Ok(instance);
            }
        } else {
            // Update status to running
            if let Some(mut entry) = self.instances.get_mut(&instance_id) {
                let process = Arc::make_mut(&mut entry);
                process.instance.status = ServerStatus::Running;
                return Ok(process.instance.clone());
            }
        }
        
        Ok(instance)
    }

    pub async fn stop_server(&self, instance_id: &str) -> Result<()> {
        if let Some((_, process)) = self.instances.remove(instance_id) {
            let child = process.child.write().await;
            
            // Kill the process
            if let Err(e) = child.kill() {
                error!("Failed to kill process: {}", e);
                return Err(Error::Server(format!("Failed to stop server: {}", e)));
            }
            
            info!("Stopped MCP server instance: {}", instance_id);
            Ok(())
        } else {
            Err(Error::SessionNotFound(instance_id.to_string()))
        }
    }

    pub async fn list_instances(&self) -> Vec<McpServerInstance> {
        self.instances.iter()
            .map(|entry| entry.value().instance.clone())
            .collect()
    }

    pub async fn get_instance(&self, instance_id: &str) -> Option<McpServerInstance> {
        self.instances.get(instance_id)
            .map(|entry| entry.value().instance.clone())
    }

    async fn check_server_health(&self, instance_id: &str) -> Result<()> {
        if let Some(process) = self.instances.get(instance_id) {
            if let Some(health_url) = &process.health_check_url {
                // Simple HTTP health check
                let response = reqwest::get(health_url).await
                    .map_err(|e| Error::Server(format!("Health check failed: {}", e)))?;
                
                if response.status().is_success() {
                    Ok(())
                } else {
                    Err(Error::Server(format!("Health check returned: {}", response.status())))
                }
            } else {
                // No health check URL, assume it's running
                Ok(())
            }
        } else {
            Err(Error::SessionNotFound(instance_id.to_string()))
        }
    }

    pub async fn call_tool(&self, instance_id: &str, tool_name: &str, arguments: serde_json::Value) -> Result<CallToolResponse> {
        if let Some(process) = self.instances.get(instance_id) {
            let port = process.instance.port;
            let url = format!("http://localhost:{}/mcp", port);
            
            let request = JsonRpcRequest {
                jsonrpc: "2.0".to_string(),
                id: serde_json::json!(1),
                method: "tools/call".to_string(),
                params: Some(serde_json::json!({
                    "name": tool_name,
                    "arguments": arguments
                })),
            };
            
            let client = reqwest::Client::new();
            let response = client.post(&url)
                .json(&request)
                .send()
                .await
                .map_err(|e| Error::Server(format!("Failed to call tool: {}", e)))?;
            
            let json_response: JsonRpcResponse = response.json().await
                .map_err(|e| Error::Server(format!("Invalid response: {}", e)))?;
            
            if let Some(error) = json_response.error {
                return Err(Error::Server(format!("Tool error: {}", error.message)));
            }
            
            if let Some(result) = json_response.result {
                let response: CallToolResponse = serde_json::from_value(result)
                    .map_err(|e| Error::Server(format!("Failed to parse response: {}", e)))?;
                Ok(response)
            } else {
                Err(Error::Server("No result in response".to_string()))
            }
        } else {
            Err(Error::SessionNotFound(instance_id.to_string()))
        }
    }

    pub async fn get_tools(&self, instance_id: &str) -> Result<Vec<McpToolInfo>> {
        if let Some(process) = self.instances.get(instance_id) {
            let port = process.instance.port;
            let url = format!("http://localhost:{}/mcp", port);
            
            let request = JsonRpcRequest {
                jsonrpc: "2.0".to_string(),
                id: serde_json::json!(1),
                method: "tools/list".to_string(),
                params: None,
            };
            
            let client = reqwest::Client::new();
            let response = client.post(&url)
                .json(&request)
                .send()
                .await
                .map_err(|e| Error::Server(format!("Failed to get tools: {}", e)))?;
            
            let json_response: JsonRpcResponse = response.json().await
                .map_err(|e| Error::Server(format!("Invalid response: {}", e)))?;
            
            if let Some(error) = json_response.error {
                return Err(Error::Server(format!("Tools error: {}", error.message)));
            }
            
            if let Some(result) = json_response.result {
                let tools = result.get("tools")
                    .ok_or_else(|| Error::Server("No tools in response".to_string()))?;
                
                let tool_list: Vec<McpToolInfo> = serde_json::from_value(tools.clone())
                    .map_err(|e| Error::Server(format!("Failed to parse tools: {}", e)))?;
                
                Ok(tool_list)
            } else {
                Err(Error::Server("No result in response".to_string()))
            }
        } else {
            Err(Error::SessionNotFound(instance_id.to_string()))
        }
    }
}