use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};
use std::sync::Arc;

use crate::window_service::WindowManagerState;
use crate::models::*;
use crate::Result;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<WindowManager<R>> {
    let state = Arc::new(WindowManagerState::new(app.clone()));
    Ok(WindowManager(state))
}

/// Access to the window-manager APIs.
pub struct WindowManager<R: Runtime>(Arc<WindowManagerState<R>>);

impl<R: Runtime> WindowManager<R> {
    pub fn create_window(&self, config: WindowConfig) -> Result<WindowInfo> {
        self.0.create_window(config)
    }

    pub fn close_window(&self, label: &str) -> Result<()> {
        self.0.close_window(label)
    }

    pub fn get_window(&self, label: &str) -> Result<WindowInfo> {
        self.0.get_window(label)
    }

    pub fn list_windows(&self) -> Result<Vec<WindowInfo>> {
        self.0.list_windows()
    }

    pub fn focus_window(&self, label: &str) -> Result<()> {
        self.0.focus_window(label)
    }

    pub fn minimize_window(&self, label: &str) -> Result<()> {
        self.0.minimize_window(label)
    }

    pub fn maximize_window(&self, label: &str) -> Result<()> {
        self.0.maximize_window(label)
    }

    pub fn unmaximize_window(&self, label: &str) -> Result<()> {
        self.0.unmaximize_window(label)
    }

    pub fn set_window_position(&self, label: &str, position: WindowPosition) -> Result<()> {
        self.0.set_window_position(label, position)
    }

    pub fn set_window_size(&self, label: &str, size: WindowSize) -> Result<()> {
        self.0.set_window_size(label, size)
    }

    pub fn set_window_title(&self, label: &str, title: &str) -> Result<()> {
        self.0.set_window_title(label, title)
    }

    pub fn send_message(&self, message: WindowMessage) -> Result<()> {
        self.0.send_message(message)
    }

    pub fn broadcast_message(&self, from: &str, message_type: &str, payload: serde_json::Value) -> Result<()> {
        self.0.broadcast_message(from, message_type, payload)
    }

    pub fn get_window_state(&self) -> Result<WindowState> {
        self.0.get_window_state()
    }

    pub fn update_window_info(&self, label: &str) -> Result<()> {
        self.0.update_window_info(label)
    }
}
