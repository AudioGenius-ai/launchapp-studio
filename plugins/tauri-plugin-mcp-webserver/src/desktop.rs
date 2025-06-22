use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};
use std::sync::Arc;
use crate::models::*;
use crate::process_manager::McpProcessManager;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<McpWebserver<R>> {
  Ok(McpWebserver::new(app.clone()))
}

/// Access to the mcp-webserver APIs.
pub struct McpWebserver<R: Runtime> {
  app: AppHandle<R>,
  process_manager: Arc<McpProcessManager<R>>,
}

impl<R: Runtime> McpWebserver<R> {
  pub fn new(app: AppHandle<R>) -> Self {
    let process_manager = Arc::new(McpProcessManager::new(app.clone()));
    Self {
      app,
      process_manager,
    }
  }

  pub async fn start_server(&self, config: McpServerConfig) -> crate::Result<McpServerInstance> {
    self.process_manager.start_server(config).await
  }

  pub async fn stop_server(&self, instance_id: String) -> crate::Result<()> {
    self.process_manager.stop_server(&instance_id).await
  }

  pub async fn list_instances(&self) -> crate::Result<Vec<McpServerInstance>> {
    Ok(self.process_manager.list_instances().await)
  }

  pub async fn get_instance(&self, instance_id: String) -> crate::Result<Option<McpServerInstance>> {
    Ok(self.process_manager.get_instance(&instance_id).await)
  }

  pub async fn call_tool(&self, request: CallToolRequest) -> crate::Result<CallToolResponse> {
    self.process_manager.call_tool(&request.instance_id, &request.tool_name, request.arguments).await
  }

  pub async fn get_tools(&self, instance_id: String) -> crate::Result<Vec<McpToolInfo>> {
    self.process_manager.get_tools(&instance_id).await
  }
}