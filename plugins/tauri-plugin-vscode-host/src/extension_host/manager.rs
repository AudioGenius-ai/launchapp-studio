use crate::{error::{Error, Result}, models::*, extension_host::process::ExtensionHostProcess};
use dashmap::DashMap;
use std::sync::Arc;
use parking_lot::RwLock;
use uuid::Uuid;
use tracing::{info, error};

/// Manages multiple extension host instances
pub struct ExtensionHostManager {
    /// Map of host ID to extension host process
    hosts: Arc<DashMap<String, Arc<RwLock<ExtensionHostProcess>>>>,
    /// Map of workspace path to host ID
    workspace_hosts: Arc<DashMap<String, String>>,
    /// Global configuration
    default_config: ExtensionHostConfig,
}

impl ExtensionHostManager {
    /// Create a new extension host manager
    pub fn new() -> Self {
        Self {
            hosts: Arc::new(DashMap::new()),
            workspace_hosts: Arc::new(DashMap::new()),
            default_config: ExtensionHostConfig::default(),
        }
    }
    
    /// Create a new extension host for a workspace
    pub async fn create_host(
        &self,
        workspace_path: String,
        extensions: Vec<String>,
        config: Option<ExtensionHostConfig>,
    ) -> Result<String> {
        // Check if a host already exists for this workspace
        if let Some(existing_id) = self.workspace_hosts.get(&workspace_path) {
            return Ok(existing_id.clone());
        }
        
        // Use provided config or default
        let mut host_config = config.unwrap_or_else(|| self.default_config.clone());
        host_config.workspace_path = workspace_path.clone();
        
        // Create the extension host process
        let host = ExtensionHostProcess::new(workspace_path.clone(), host_config).await?;
        let host_id = host.id.clone();
        
        // Store the host first
        let host = Arc::new(RwLock::new(host));
        self.hosts.insert(host_id.clone(), host.clone());
        self.workspace_hosts.insert(workspace_path, host_id.clone());
        
        // Load requested extensions
        for extension_id in extensions {
            self.load_extension_by_id(&host_id, &extension_id).await?;
        }
        
        info!("Created extension host: {}", host_id);
        Ok(host_id)
    }
    
    /// Stop an extension host
    pub async fn stop_host(&self, host_id: &str) -> Result<()> {
        let host = self.hosts.get(host_id)
            .ok_or_else(|| Error::HostNotFound(host_id.to_string()))?;
        
        let host = host.clone();
        let host = host.write();
        host.stop().await?;
        
        // Remove from maps
        let workspace_path = host.workspace_path.clone();
        drop(host);
        
        self.hosts.remove(host_id);
        self.workspace_hosts.remove(&workspace_path);
        
        info!("Stopped extension host: {}", host_id);
        Ok(())
    }
    
    /// Stop all extension hosts
    pub async fn stop_all_hosts(&self) -> Result<()> {
        let host_ids: Vec<String> = self.hosts.iter()
            .map(|entry| entry.key().clone())
            .collect();
        
        for host_id in host_ids {
            if let Err(e) = self.stop_host(&host_id).await {
                error!("Failed to stop host {}: {}", host_id, e);
            }
        }
        
        Ok(())
    }
    
    /// List all active extension hosts
    pub fn list_hosts(&self) -> Vec<ExtensionHostInfo> {
        self.hosts.iter()
            .map(|entry| {
                let host = entry.value().read();
                ExtensionHostInfo {
                    id: host.id.clone(),
                    workspace_id: host.id.clone(), // For now, use same ID
                    workspace_path: host.workspace_path.clone(),
                    status: host.status(),
                    loaded_extensions: vec![], // TODO: Track loaded extensions
                    api_version: "1.0.0".to_string(),
                    node_version: "18.0.0".to_string(), // TODO: Get actual version
                    started_at: None, // TODO: Track start time
                    memory_usage: None, // TODO: Monitor memory
                    cpu_usage: None, // TODO: Monitor CPU
                }
            })
            .collect()
    }
    
    /// Get information about a specific host
    pub fn get_host_info(&self, host_id: &str) -> Result<ExtensionHostInfo> {
        let host = self.hosts.get(host_id)
            .ok_or_else(|| Error::HostNotFound(host_id.to_string()))?;
        
        let host = host.read();
        Ok(ExtensionHostInfo {
            id: host.id.clone(),
            workspace_id: host.id.clone(),
            workspace_path: host.workspace_path.clone(),
            status: host.status(),
            loaded_extensions: vec![], // TODO: Track loaded extensions
            api_version: "1.0.0".to_string(),
            node_version: "18.0.0".to_string(),
            started_at: None,
            memory_usage: None,
            cpu_usage: None,
        })
    }
    
    /// Execute a command in an extension host
    pub async fn execute_command(
        &self,
        host_id: &str,
        command: ExtensionCommand,
    ) -> Result<serde_json::Value> {
        let host = self.hosts.get(host_id)
            .ok_or_else(|| Error::HostNotFound(host_id.to_string()))?;
        
        let host = host.read();
        
        // Create API request
        let request = ApiRequest {
            id: Uuid::new_v4().to_string(),
            method: format!("command.execute"),
            params: serde_json::json!({
                "command": command.command,
                "args": command.args,
            }),
        };
        
        // Send request
        host.send_api_request(request.clone()).await?;
        
        // TODO: Wait for response with matching request ID
        // For now, return a placeholder
        Ok(serde_json::json!({
            "success": true,
            "requestId": request.id,
        }))
    }
    
    /// Load an extension in a host by ID
    async fn load_extension_by_id(
        &self,
        host_id: &str,
extension_id: &str,
    ) -> Result<()> {
        let host = self.hosts.get(host_id)
            .ok_or_else(|| Error::HostNotFound(host_id.to_string()))?;
        
        let host = host.read();
        
        // Create API request to load extension
        let request = ApiRequest {
            id: Uuid::new_v4().to_string(),
            method: "extension.load".to_string(),
            params: serde_json::json!({
                "extensionId": extension_id,
            }),
        };
        
        host.send_api_request(request).await?;
        
        info!("Loading extension {} in host {}", extension_id, host_id);
        Ok(())
    }
    
    /// Install an extension from a source
    pub async fn install_extension(
        &self,
        source: ExtensionSource,
    ) -> Result<ExtensionInstallResult> {
        // TODO: Implement extension installation
        match source {
            ExtensionSource::OpenVsx { extension_id: _, version: _ } => {
                // Download from Open VSX
                todo!("Implement Open VSX download")
            }
            ExtensionSource::GitHub { owner: _, repo: _, release: _ } => {
                // Download from GitHub releases
                todo!("Implement GitHub download")
            }
            ExtensionSource::Local { path: _ } => {
                // Install from local path
                todo!("Implement local installation")
            }
            ExtensionSource::Url { url: _ } => {
                // Download from URL
                todo!("Implement URL download")
            }
        }
    }
    
    /// Search for extensions
    pub async fn search_extensions(
        &self,
        query: ExtensionSearchQuery,
    ) -> Result<ExtensionSearchResult> {
        // TODO: Implement extension search
        Ok(ExtensionSearchResult {
            extensions: vec![],
            total: 0,
            offset: query.offset.unwrap_or(0),
        })
    }
    
    /// Handle incoming messages from all hosts
    pub async fn handle_messages(&self) {
        // This would be called in a background task to process messages
        // from all extension hosts and route them appropriately
    }
}

impl Default for ExtensionHostManager {
    fn default() -> Self {
        Self::new()
    }
}