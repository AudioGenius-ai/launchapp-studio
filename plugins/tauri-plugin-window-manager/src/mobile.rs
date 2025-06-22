use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;
use crate::Result;

#[cfg(target_os = "android")]
const PLUGIN_IDENTIFIER: &str = "com.codepilot.plugins.windowmanager";

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_window_manager);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<WindowManager<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin(PLUGIN_IDENTIFIER, "WindowManagerPlugin")?;
  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_window_manager)?;
  Ok(WindowManager(handle))
}

/// Access to the window-manager APIs.
pub struct WindowManager<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> WindowManager<R> {
    // Mobile platforms typically don't support multiple windows,
    // so these are mostly no-ops or return appropriate errors
    
    pub fn create_window(&self, _config: WindowConfig) -> Result<WindowInfo> {
        Err(crate::Error::WindowOperationFailed("Multiple windows not supported on mobile".into()))
    }

    pub fn close_window(&self, _label: &str) -> Result<()> {
        Err(crate::Error::WindowOperationFailed("Window closing not supported on mobile".into()))
    }

    pub fn get_window(&self, _label: &str) -> Result<WindowInfo> {
        // Return info about the main window
        Ok(WindowInfo {
            id: uuid::Uuid::new_v4(),
            label: "main".to_string(),
            title: "App".to_string(),
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            is_maximized: true,
            is_minimized: false,
            is_focused: true,
            is_visible: true,
            theme: WindowTheme::Auto,
        })
    }

    pub fn list_windows(&self) -> Result<Vec<WindowInfo>> {
        // Only one window on mobile
        Ok(vec![self.get_window("main")?])
    }

    pub fn focus_window(&self, _label: &str) -> Result<()> {
        // No-op on mobile
        Ok(())
    }

    pub fn minimize_window(&self, _label: &str) -> Result<()> {
        // No-op on mobile
        Ok(())
    }

    pub fn maximize_window(&self, _label: &str) -> Result<()> {
        // No-op on mobile
        Ok(())
    }

    pub fn unmaximize_window(&self, _label: &str) -> Result<()> {
        // No-op on mobile
        Ok(())
    }

    pub fn set_window_position(&self, _label: &str, _position: WindowPosition) -> Result<()> {
        Err(crate::Error::WindowOperationFailed("Window positioning not supported on mobile".into()))
    }

    pub fn set_window_size(&self, _label: &str, _size: WindowSize) -> Result<()> {
        Err(crate::Error::WindowOperationFailed("Window sizing not supported on mobile".into()))
    }

    pub fn set_window_title(&self, _label: &str, _title: &str) -> Result<()> {
        // Could potentially update app title on mobile
        Ok(())
    }

    pub fn send_message(&self, _message: WindowMessage) -> Result<()> {
        // No-op on mobile (single window)
        Ok(())
    }

    pub fn broadcast_message(&self, _from: &str, _message_type: &str, _payload: serde_json::Value) -> Result<()> {
        // No-op on mobile (single window)
        Ok(())
    }

    pub fn get_window_state(&self) -> Result<WindowState> {
        let windows = self.list_windows()?;
        let mut window_map = std::collections::HashMap::new();
        for window in &windows {
            window_map.insert(window.label.clone(), window.clone());
        }
        
        Ok(WindowState {
            windows: window_map,
            active_window: Some("main".to_string()),
            window_order: vec!["main".to_string()],
        })
    }

    pub fn update_window_info(&self, _label: &str) -> Result<()> {
        // No-op on mobile
        Ok(())
    }
}