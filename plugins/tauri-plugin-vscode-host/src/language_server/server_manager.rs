use crate::{error::{Error, Result}, models::*};
use dashmap::DashMap;
use std::sync::Arc;
use tracing::info;

/// Manages language server instances
pub struct LanguageServerManager {
    /// Active language servers
    servers: Arc<DashMap<String, LanguageServerInfo>>,
}

impl LanguageServerManager {
    pub fn new() -> Self {
        Self {
            servers: Arc::new(DashMap::new()),
        }
    }
    
    /// Start a language server
    pub async fn start_server(
        &self,
        config: LanguageServerConfig,
        workspace_folders: Vec<String>,
    ) -> Result<String> {
        // TODO: Implement language server startup
        let server_id = config.id.clone();
        
        let info = LanguageServerInfo {
            id: server_id.clone(),
            name: config.name,
            status: LanguageServerStatus::Starting,
            capabilities: None,
            workspace_folders,
            started_at: Some(chrono::Utc::now()),
        };
        
        self.servers.insert(server_id.clone(), info);
        
        info!("Started language server: {}", server_id);
        Ok(server_id)
    }
    
    /// Stop a language server
    pub async fn stop_server(&self, server_id: &str) -> Result<()> {
        self.servers.remove(server_id);
        info!("Stopped language server: {}", server_id);
        Ok(())
    }
    
    /// List active language servers
    pub fn list_servers(&self) -> Vec<LanguageServerInfo> {
        self.servers.iter()
            .map(|entry| entry.value().clone())
            .collect()
    }
}