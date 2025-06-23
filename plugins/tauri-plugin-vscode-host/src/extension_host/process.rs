use crate::{error::{Error, Result}, models::*};
use std::process::{Command, Stdio};
use std::sync::Arc;
use parking_lot::Mutex;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{ChildStdin, ChildStdout, ChildStderr};
use tokio::sync::mpsc;
use uuid::Uuid;
use chrono::Utc;
use std::path::PathBuf;
use tracing::{info, error};

/// Extension host process wrapper
#[derive(Clone)]
pub struct ExtensionHostProcess {
    pub id: String,
    pub workspace_path: String,
    pub config: ExtensionHostConfig,
    process_handle: Arc<Mutex<Option<tokio::task::JoinHandle<()>>>>,
    stdin_tx: mpsc::Sender<String>,
    message_rx: Arc<Mutex<mpsc::Receiver<ExtensionHostMessage>>>,
    status: Arc<Mutex<ExtensionHostStatus>>,
    started_at: Option<chrono::DateTime<Utc>>,
}

impl ExtensionHostProcess {
    /// Create a new extension host process
    pub async fn new(workspace_path: String, config: ExtensionHostConfig) -> Result<Self> {
        let id = Uuid::new_v4().to_string();
        let (stdin_tx, stdin_rx) = mpsc::channel(100);
        let (message_tx, message_rx) = mpsc::channel(100);
        
        let mut host = Self {
            id: id.clone(),
            workspace_path,
            config,
            process_handle: Arc::new(Mutex::new(None)),
            stdin_tx,
            message_rx: Arc::new(Mutex::new(message_rx)),
            status: Arc::new(Mutex::new(ExtensionHostStatus::Initializing)),
            started_at: None,
        };
        
        host.start_process(stdin_rx, message_tx).await?;
        
        Ok(host)
    }
    
    /// Start the extension host process
    async fn start_process(
        &mut self,
        stdin_rx: mpsc::Receiver<String>,
        message_tx: mpsc::Sender<ExtensionHostMessage>,
    ) -> Result<()> {
        // Find Node.js executable
        let node_path = self.find_node_path()?;
        
        // Get extension host runtime path
        let runtime_path = self.get_runtime_path()?;
        
        // Build command
        let mut cmd = Command::new(&node_path);
        cmd.arg(&runtime_path)
            .arg("--workspace")
            .arg(&self.workspace_path)
            .arg("--extensions-dir")
            .arg(&self.config.extensions_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        
        // Set memory limit if configured
        if let Some(memory_limit) = self.config.memory_limit {
            cmd.arg("--max-old-space-size")
                .arg((memory_limit / 1024 / 1024).to_string());
        }
        
        // Add environment variables
        if let Some(env) = &self.config.environment {
            for (key, value) in env {
                cmd.env(key, value);
            }
        }
        
        // Enable debugging if configured
        if self.config.enable_debugging {
            let port = self.config.port.unwrap_or(9229);
            cmd.arg(format!("--inspect={}", port));
        }
        
        // Spawn process
        info!("Starting extension host process for workspace: {}", self.workspace_path);
        let mut child = tokio::process::Command::from(cmd)
            .spawn()
            .map_err(|e| Error::ProcessError(format!("Failed to spawn process: {}", e)))?;
        
        // Get stdin, stdout, stderr
        let stdin = child.stdin.take()
            .ok_or_else(|| Error::ProcessError("Failed to get stdin".to_string()))?;
        let stdout = child.stdout.take()
            .ok_or_else(|| Error::ProcessError("Failed to get stdout".to_string()))?;
        let stderr = child.stderr.take()
            .ok_or_else(|| Error::ProcessError("Failed to get stderr".to_string()))?;
        
        // Store the process ID for later management
        let _pid = child.id();
        
        self.started_at = Some(Utc::now());
        *self.status.lock() = ExtensionHostStatus::Running;
        
        // Spawn tasks for handling I/O
        self.spawn_stdin_handler(stdin, stdin_rx);
        self.spawn_stdout_handler(stdout, message_tx.clone());
        self.spawn_stderr_handler(stderr, message_tx);
        
        // Spawn task to wait for process exit
        let status = self.status.clone();
        let handle = tokio::spawn(async move {
            let _ = child.wait().await;
            *status.lock() = ExtensionHostStatus::Stopped;
        });
        
        *self.process_handle.lock() = Some(handle);
        
        Ok(())
    }
    
    /// Find Node.js executable path
    fn find_node_path(&self) -> Result<PathBuf> {
        if let Some(path) = &self.config.node_path {
            return Ok(path.clone());
        }
        
        // Try to find node in PATH
        which::which("node")
            .or_else(|_| which::which("nodejs"))
            .map_err(|_| Error::NodeNotFound)
    }
    
    /// Get extension host runtime path
    fn get_runtime_path(&self) -> Result<PathBuf> {
        // For now, we'll assume the runtime is in a known location
        // In production, this would be bundled with the plugin
        let runtime_dir = std::env::current_dir()
            .map_err(|e| Error::Io(e))?
            .join("extension-host-runtime");
        
        let runtime_path = runtime_dir.join("dist").join("index.js");
        
        if !runtime_path.exists() {
            return Err(Error::ProcessError(
                format!("Extension host runtime not found at: {:?}", runtime_path)
            ));
        }
        
        Ok(runtime_path)
    }
    
    /// Spawn stdin handler task
    fn spawn_stdin_handler(
        &self,
        stdin: ChildStdin,
        mut stdin_rx: mpsc::Receiver<String>,
    ) {
        tokio::spawn(async move {
            let mut stdin = tokio::io::BufWriter::new(stdin);
            
            while let Some(message) = stdin_rx.recv().await {
                if let Err(e) = stdin.write_all(message.as_bytes()).await {
                    error!("Failed to write to stdin: {}", e);
                    break;
                }
                if let Err(e) = stdin.write_all(b"\n").await {
                    error!("Failed to write newline: {}", e);
                    break;
                }
                if let Err(e) = stdin.flush().await {
                    error!("Failed to flush stdin: {}", e);
                    break;
                }
            }
        });
    }
    
    /// Spawn stdout handler task
    fn spawn_stdout_handler(
        &self,
        stdout: ChildStdout,
        message_tx: mpsc::Sender<ExtensionHostMessage>,
    ) {
        tokio::spawn(async move {
            let mut reader = BufReader::new(stdout);
            let mut line = String::new();
            
            loop {
                match reader.read_line(&mut line).await {
                    Ok(0) => break, // EOF
                    Ok(_) => {
                        let trimmed = line.trim();
                        if !trimmed.is_empty() {
                            // Try to parse as JSON message
                            match serde_json::from_str::<ExtensionHostMessage>(trimmed) {
                                Ok(msg) => {
                                    if let Err(e) = message_tx.send(msg).await {
                                        error!("Failed to send message: {}", e);
                                    }
                                }
                                Err(_) => {
                                    // Not JSON, treat as log message
                                    let log_msg = ExtensionHostMessage::Log {
                                        level: "info".to_string(),
                                        message: trimmed.to_string(),
                                        source: None,
                                    };
                                    if let Err(e) = message_tx.send(log_msg).await {
                                        error!("Failed to send log message: {}", e);
                                    }
                                }
                            }
                        }
                        line.clear();
                    }
                    Err(e) => {
                        error!("Error reading stdout: {}", e);
                        break;
                    }
                }
            }
        });
    }
    
    /// Spawn stderr handler task
    fn spawn_stderr_handler(
        &self,
        stderr: ChildStderr,
        message_tx: mpsc::Sender<ExtensionHostMessage>,
    ) {
        tokio::spawn(async move {
            let mut reader = BufReader::new(stderr);
            let mut line = String::new();
            
            loop {
                match reader.read_line(&mut line).await {
                    Ok(0) => break, // EOF
                    Ok(_) => {
                        let trimmed = line.trim();
                        if !trimmed.is_empty() {
                            let error_msg = ExtensionHostMessage::Error {
                                message: trimmed.to_string(),
                                stack: None,
                                source: None,
                            };
                            if let Err(e) = message_tx.send(error_msg).await {
                                error!("Failed to send error message: {}", e);
                            }
                        }
                        line.clear();
                    }
                    Err(e) => {
                        error!("Error reading stderr: {}", e);
                        break;
                    }
                }
            }
        });
    }
    
    /// Send a message to the extension host
    pub async fn send_message(&self, message: &str) -> Result<()> {
        self.stdin_tx.send(message.to_string()).await
            .map_err(|e| Error::IpcError(format!("Failed to send message: {}", e)))
    }
    
    /// Send an API request
    pub async fn send_api_request(&self, request: ApiRequest) -> Result<()> {
        let message = serde_json::to_string(&request)?;
        self.send_message(&message).await
    }
    
    /// Receive messages from the extension host
    pub async fn receive_message(&self) -> Option<ExtensionHostMessage> {
        self.message_rx.lock().recv().await
    }
    
    /// Get the current status
    pub fn status(&self) -> ExtensionHostStatus {
        self.status.lock().clone()
    }
    
    /// Stop the extension host process
    pub async fn stop(&self) -> Result<()> {
        *self.status.lock() = ExtensionHostStatus::Stopped;
        
        if let Some(handle) = self.process_handle.lock().take() {
            // Cancel the process handle
            handle.abort();
        }
        
        Ok(())
    }
    
    /// Restart the extension host process
    pub async fn restart(&mut self) -> Result<()> {
        info!("Restarting extension host process");
        *self.status.lock() = ExtensionHostStatus::Restarting;
        
        // Stop the current process
        self.stop().await?;
        
        // Wait a bit
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        
        // Start new process
        let (stdin_tx, stdin_rx) = mpsc::channel(100);
        let (message_tx, message_rx) = mpsc::channel(100);
        
        self.stdin_tx = stdin_tx;
        self.message_rx = Arc::new(Mutex::new(message_rx));
        
        self.start_process(stdin_rx, message_tx).await?;
        
        Ok(())
    }
}

