use tauri::{command, AppHandle, Runtime};
use crate::{ClaudeExt, Result, models::*};

#[command]
pub async fn create_session<R: Runtime>(
    app: AppHandle<R>,
    options: CreateSessionOptions,
) -> Result<ClaudeSession> {
    app.claude()
        .create_session(options.workspace_path, options.prompt)
        .await
}

#[command]
pub async fn send_input<R: Runtime>(
    app: AppHandle<R>,
    options: SendInputOptions,
) -> Result<()> {
    app.claude()
        .send_input(options.session_id, options.input)
        .await
}

#[command]
pub async fn list_sessions<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<ClaudeSession>> {
    app.claude().list_sessions().await
}

#[command]
pub async fn stop_session<R: Runtime>(
    app: AppHandle<R>,
    session_id: String,
) -> Result<()> {
    app.claude().stop_session(session_id).await
}

#[command]
pub async fn recover_sessions<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<ClaudeSession>> {
    app.claude().recover_sessions().await
}

#[command]
pub async fn get_messages<R: Runtime>(
    app: AppHandle<R>,
    session_id: String,
) -> Result<Vec<ClaudeMessage>> {
    app.claude().get_messages(session_id).await
}

#[command]
pub async fn get_mcp_tools<R: Runtime>(
    app: AppHandle<R>,
    workspace_path: String,
) -> Result<Vec<String>> {
    app.claude().get_mcp_tools(workspace_path).await
}