use tauri::{command, AppHandle, Runtime};
use crate::{
    error::Result,
    models::*,
    TerminalExt,
};

#[command]
pub async fn create_terminal<R: Runtime>(
    app: AppHandle<R>,
    options: CreateTerminalOptions,
) -> Result<Terminal> {
    app.terminal().create_terminal(options).await
}

#[command]
pub async fn write_to_terminal<R: Runtime>(
    app: AppHandle<R>,
    terminal_id: String,
    data: String,
) -> Result<()> {
    app.terminal().write_to_terminal(&terminal_id, &data).await
}

#[command]
pub async fn resize_terminal<R: Runtime>(
    app: AppHandle<R>,
    terminal_id: String,
    cols: u16,
    rows: u16,
) -> Result<()> {
    app.terminal().resize_terminal(&terminal_id, cols, rows).await
}

#[command]
pub async fn kill_terminal<R: Runtime>(
    app: AppHandle<R>,
    terminal_id: String,
) -> Result<()> {
    app.terminal().kill_terminal(&terminal_id).await
}

#[command]
pub async fn handle_terminal_command<R: Runtime>(
    app: AppHandle<R>,
    command: TerminalCommand,
) -> Result<()> {
    app.terminal().handle_command(command).await
}

#[command]
pub async fn get_terminal<R: Runtime>(
    app: AppHandle<R>,
    terminal_id: String,
) -> Result<Terminal> {
    app.terminal().get_terminal(&terminal_id).await
}

#[command]
pub async fn list_terminals<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<Terminal>> {
    app.terminal().list_terminals().await
}

#[command]
pub fn get_available_shells() -> Vec<ShellInfo> {
    crate::utils::get_available_shells()
}

#[command]
pub fn get_default_shell() -> String {
    crate::utils::get_default_shell()
}