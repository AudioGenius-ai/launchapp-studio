use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::McpWebserverExt;

#[command]
pub async fn start_server<R: Runtime>(
    app: AppHandle<R>,
    config: McpServerConfig,
) -> Result<McpServerInstance> {
    app.mcp_webserver().start_server(config).await
}

#[command]
pub async fn stop_server<R: Runtime>(
    app: AppHandle<R>,
    instance_id: String,
) -> Result<()> {
    app.mcp_webserver().stop_server(instance_id).await
}

#[command]
pub async fn list_instances<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<McpServerInstance>> {
    app.mcp_webserver().list_instances().await
}

#[command]
pub async fn get_instance<R: Runtime>(
    app: AppHandle<R>,
    instance_id: String,
) -> Result<Option<McpServerInstance>> {
    app.mcp_webserver().get_instance(instance_id).await
}

#[command]
pub async fn call_tool<R: Runtime>(
    app: AppHandle<R>,
    request: CallToolRequest,
) -> Result<CallToolResponse> {
    app.mcp_webserver().call_tool(request).await
}

#[command]
pub async fn get_tools<R: Runtime>(
    app: AppHandle<R>,
    instance_id: String,
) -> Result<Vec<McpToolInfo>> {
    app.mcp_webserver().get_tools(instance_id).await
}