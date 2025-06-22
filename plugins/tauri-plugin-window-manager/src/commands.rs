use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::WindowManagerExt;

#[command]
pub(crate) async fn create_window<R: Runtime>(
    app: AppHandle<R>,
    config: WindowConfig,
) -> Result<WindowInfo> {
    app.window_manager().create_window(config)
}

#[command]
pub(crate) async fn close_window<R: Runtime>(
    app: AppHandle<R>,
    label: String,
) -> Result<()> {
    app.window_manager().close_window(&label)
}

#[command]
pub(crate) async fn get_window<R: Runtime>(
    app: AppHandle<R>,
    label: String,
) -> Result<WindowInfo> {
    app.window_manager().get_window(&label)
}

#[command]
pub(crate) async fn list_windows<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Vec<WindowInfo>> {
    app.window_manager().list_windows()
}

#[command]
pub(crate) async fn focus_window<R: Runtime>(
    app: AppHandle<R>,
    label: String,
) -> Result<()> {
    app.window_manager().focus_window(&label)
}

#[command]
pub(crate) async fn minimize_window<R: Runtime>(
    app: AppHandle<R>,
    label: String,
) -> Result<()> {
    app.window_manager().minimize_window(&label)
}

#[command]
pub(crate) async fn maximize_window<R: Runtime>(
    app: AppHandle<R>,
    label: String,
) -> Result<()> {
    app.window_manager().maximize_window(&label)
}

#[command]
pub(crate) async fn unmaximize_window<R: Runtime>(
    app: AppHandle<R>,
    label: String,
) -> Result<()> {
    app.window_manager().unmaximize_window(&label)
}

#[command]
pub(crate) async fn set_window_position<R: Runtime>(
    app: AppHandle<R>,
    label: String,
    position: WindowPosition,
) -> Result<()> {
    app.window_manager().set_window_position(&label, position)
}

#[command]
pub(crate) async fn set_window_size<R: Runtime>(
    app: AppHandle<R>,
    label: String,
    size: WindowSize,
) -> Result<()> {
    app.window_manager().set_window_size(&label, size)
}

#[command]
pub(crate) async fn set_window_title<R: Runtime>(
    app: AppHandle<R>,
    label: String,
    title: String,
) -> Result<()> {
    app.window_manager().set_window_title(&label, &title)
}

#[command]
pub(crate) async fn send_message<R: Runtime>(
    app: AppHandle<R>,
    message: WindowMessage,
) -> Result<()> {
    app.window_manager().send_message(message)
}

#[command]
pub(crate) async fn broadcast_message<R: Runtime>(
    app: AppHandle<R>,
    from: String,
    message_type: String,
    payload: serde_json::Value,
) -> Result<()> {
    app.window_manager().broadcast_message(&from, &message_type, payload)
}

#[command]
pub(crate) async fn get_window_state<R: Runtime>(
    app: AppHandle<R>,
) -> Result<WindowState> {
    app.window_manager().get_window_state()
}

#[command]
pub(crate) async fn update_window_info<R: Runtime>(
    app: AppHandle<R>,
    label: String,
) -> Result<()> {
    app.window_manager().update_window_info(&label)
}
