use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::VscodeHostExt;

/// Create a new extension host for a workspace
#[command]
pub async fn create_extension_host<R: Runtime>(
    app: AppHandle<R>,
    workspace_path: String,
    extensions: Vec<String>,
    config: Option<ExtensionHostConfig>,
) -> Result<String> {
    app.vscode_host().create_extension_host(workspace_path, extensions, config).await
}

/// Stop an extension host
#[command]
pub async fn stop_extension_host<R: Runtime>(
    app: AppHandle<R>,
    host_id: String,
) -> Result<()> {
    app.vscode_host().stop_extension_host(&host_id).await
}

/// List all active extension hosts
#[command]
pub async fn list_extension_hosts<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<ExtensionHostInfo>> {
    Ok(app.vscode_host().list_extension_hosts())
}

/// Get information about a specific extension host
#[command]
pub async fn get_extension_host_info<R: Runtime>(
    app: AppHandle<R>,
    host_id: String,
) -> Result<ExtensionHostInfo> {
    app.vscode_host().get_extension_host_info(&host_id)
}

/// Execute a command in an extension host
#[command]
pub async fn execute_extension_command<R: Runtime>(
    app: AppHandle<R>,
    host_id: String,
    command: ExtensionCommand,
) -> Result<serde_json::Value> {
    app.vscode_host().execute_extension_command(&host_id, command).await
}

/// Start a language server
#[command]
pub async fn start_language_server<R: Runtime>(
    app: AppHandle<R>,
    config: LanguageServerConfig,
    workspace_folders: Vec<String>,
) -> Result<String> {
    app.vscode_host().start_language_server(config, workspace_folders).await
}

/// Stop a language server
#[command]
pub async fn stop_language_server<R: Runtime>(
    app: AppHandle<R>,
    server_id: String,
) -> Result<()> {
    app.vscode_host().stop_language_server(&server_id).await
}

/// List active language servers
#[command]
pub async fn list_language_servers<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<LanguageServerInfo>> {
    Ok(app.vscode_host().list_language_servers())
}

/// Search for extensions
#[command]
pub async fn search_extensions<R: Runtime>(
    app: AppHandle<R>,
    query: ExtensionSearchQuery,
) -> Result<ExtensionSearchResult> {
    app.vscode_host().search_extensions(query).await
}

/// Install an extension
#[command]
pub async fn install_extension<R: Runtime>(
    app: AppHandle<R>,
    source: ExtensionSource,
) -> Result<ExtensionInstallResult> {
    app.vscode_host().install_extension(source).await
}

/// Uninstall an extension
#[command]
pub async fn uninstall_extension<R: Runtime>(
    app: AppHandle<R>,
    host_id: String,
    extension_id: String,
) -> Result<()> {
    app.vscode_host().uninstall_extension(&host_id, &extension_id).await
}

/// List installed extensions for a host
#[command]
pub async fn list_installed_extensions<R: Runtime>(
    app: AppHandle<R>,
    host_id: String,
) -> Result<Vec<Extension>> {
    app.vscode_host().list_installed_extensions(&host_id).await
}