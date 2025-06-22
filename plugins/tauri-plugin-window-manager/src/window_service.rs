use crate::{Error, Result, WindowConfig, WindowInfo, WindowMessage, WindowPosition, WindowSize, WindowState, WindowTheme};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{Emitter, Manager, Runtime, WebviewWindowBuilder};
use uuid::Uuid;

pub struct WindowManagerState<R: Runtime> {
    windows: Arc<Mutex<HashMap<String, WindowInfo>>>,
    window_order: Arc<Mutex<Vec<String>>>,
    active_window: Arc<Mutex<Option<String>>>,
    app_handle: tauri::AppHandle<R>,
}

impl<R: Runtime> WindowManagerState<R> {
    pub fn new(app_handle: tauri::AppHandle<R>) -> Self {
        Self {
            windows: Arc::new(Mutex::new(HashMap::new())),
            window_order: Arc::new(Mutex::new(Vec::new())),
            active_window: Arc::new(Mutex::new(None)),
            app_handle,
        }
    }

    pub fn create_window(&self, config: WindowConfig) -> Result<WindowInfo> {
        // Check if window already exists
        if self.app_handle.get_webview_window(&config.label).is_some() {
            return Err(Error::WindowAlreadyExists(config.label.clone()));
        }

        // Build the window
        let mut builder = WebviewWindowBuilder::new(&self.app_handle, &config.label, tauri::WebviewUrl::App(config.url.unwrap_or_else(|| "index.html".into()).into()));

        if let Some(title) = config.title {
            builder = builder.title(title);
        }
        if let Some(width) = config.width {
            if let Some(height) = config.height {
                builder = builder.inner_size(width as f64, height as f64);
            }
        }
        if let Some(x) = config.x {
            if let Some(y) = config.y {
                builder = builder.position(x as f64, y as f64);
            }
        }
        if let Some(center) = config.center {
            if center {
                builder = builder.center();
            }
        }
        if let Some(resizable) = config.resizable {
            builder = builder.resizable(resizable);
        }
        if let Some(maximized) = config.maximized {
            builder = builder.maximized(maximized);
        }
        if let Some(minimizable) = config.minimizable {
            builder = builder.minimizable(minimizable);
        }
        if let Some(closable) = config.closable {
            builder = builder.closable(closable);
        }
        if let Some(decorations) = config.decorations {
            builder = builder.decorations(decorations);
        }
        if let Some(always_on_top) = config.always_on_top {
            builder = builder.always_on_top(always_on_top);
        }
        if let Some(skip_taskbar) = config.skip_taskbar {
            builder = builder.skip_taskbar(skip_taskbar);
        }
        if let Some(visible) = config.visible {
            builder = builder.visible(visible);
        }
        // Note: transparent() method is not available in WebviewWindowBuilder
        // This feature may need to be implemented differently or removed from the config

        let window = builder.build()?;
        
        // Get window info
        let position = window.outer_position()?;
        let size = window.inner_size()?;
        let is_maximized = window.is_maximized()?;
        let is_minimized = window.is_minimized()?;
        let is_focused = window.is_focused()?;
        let is_visible = window.is_visible()?;
        
        let window_info = WindowInfo {
            id: Uuid::new_v4(),
            label: config.label.clone(),
            title: window.title()?,
            width: size.width,
            height: size.height,
            x: position.x,
            y: position.y,
            is_maximized,
            is_minimized,
            is_focused,
            is_visible,
            theme: config.theme.unwrap_or(WindowTheme::Auto),
        };

        // Store window info
        self.windows.lock().unwrap().insert(config.label.clone(), window_info.clone());
        self.window_order.lock().unwrap().push(config.label.clone());
        if config.focused.unwrap_or(true) {
            *self.active_window.lock().unwrap() = Some(config.label.clone());
        }

        Ok(window_info)
    }

    pub fn close_window(&self, label: &str) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.close()?;
        
        // Remove from state
        self.windows.lock().unwrap().remove(label);
        self.window_order.lock().unwrap().retain(|l| l != label);
        
        let mut active = self.active_window.lock().unwrap();
        if active.as_ref().map(|l| l == label).unwrap_or(false) {
            *active = None;
        }
        
        Ok(())
    }

    pub fn get_window(&self, label: &str) -> Result<WindowInfo> {
        self.windows.lock().unwrap()
            .get(label)
            .cloned()
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))
    }

    pub fn list_windows(&self) -> Result<Vec<WindowInfo>> {
        Ok(self.windows.lock().unwrap().values().cloned().collect())
    }

    pub fn focus_window(&self, label: &str) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.set_focus()?;
        *self.active_window.lock().unwrap() = Some(label.to_string());
        
        Ok(())
    }

    pub fn minimize_window(&self, label: &str) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.minimize()?;
        
        if let Some(info) = self.windows.lock().unwrap().get_mut(label) {
            info.is_minimized = true;
        }
        
        Ok(())
    }

    pub fn maximize_window(&self, label: &str) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.maximize()?;
        
        if let Some(info) = self.windows.lock().unwrap().get_mut(label) {
            info.is_maximized = true;
        }
        
        Ok(())
    }

    pub fn unmaximize_window(&self, label: &str) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.unmaximize()?;
        
        if let Some(info) = self.windows.lock().unwrap().get_mut(label) {
            info.is_maximized = false;
        }
        
        Ok(())
    }

    pub fn set_window_position(&self, label: &str, position: WindowPosition) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: position.x,
            y: position.y,
        }))?;
        
        if let Some(info) = self.windows.lock().unwrap().get_mut(label) {
            info.x = position.x;
            info.y = position.y;
        }
        
        Ok(())
    }

    pub fn set_window_size(&self, label: &str, size: WindowSize) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: size.width,
            height: size.height,
        }))?;
        
        if let Some(info) = self.windows.lock().unwrap().get_mut(label) {
            info.width = size.width;
            info.height = size.height;
        }
        
        Ok(())
    }

    pub fn set_window_title(&self, label: &str, title: &str) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        window.set_title(title)?;
        
        if let Some(info) = self.windows.lock().unwrap().get_mut(label) {
            info.title = title.to_string();
        }
        
        Ok(())
    }

    pub fn send_message(&self, message: WindowMessage) -> Result<()> {
        let window = self.app_handle.get_webview_window(&message.to)
            .ok_or_else(|| Error::WindowNotFound(message.to.clone()))?;
        
        window.emit("window-message", &message)?;
        
        Ok(())
    }

    pub fn broadcast_message(&self, from: &str, message_type: &str, payload: serde_json::Value) -> Result<()> {
        let windows = self.windows.lock().unwrap();
        
        for label in windows.keys() {
            if label != from {
                let message = WindowMessage {
                    from: from.to_string(),
                    to: label.clone(),
                    message_type: message_type.to_string(),
                    payload: payload.clone(),
                };
                
                if let Some(window) = self.app_handle.get_webview_window(label) {
                    let _ = window.emit("window-message", &message);
                }
            }
        }
        
        Ok(())
    }

    pub fn get_window_state(&self) -> Result<WindowState> {
        let windows = self.windows.lock().unwrap().clone();
        let active_window = self.active_window.lock().unwrap().clone();
        let window_order = self.window_order.lock().unwrap().clone();
        
        Ok(WindowState {
            windows,
            active_window,
            window_order,
        })
    }

    pub fn update_window_info(&self, label: &str) -> Result<()> {
        let window = self.app_handle.get_webview_window(label)
            .ok_or_else(|| Error::WindowNotFound(label.to_string()))?;
        
        let position = window.outer_position()?;
        let size = window.inner_size()?;
        let is_maximized = window.is_maximized()?;
        let is_minimized = window.is_minimized()?;
        let is_focused = window.is_focused()?;
        let is_visible = window.is_visible()?;
        
        if let Some(info) = self.windows.lock().unwrap().get_mut(label) {
            info.width = size.width;
            info.height = size.height;
            info.x = position.x;
            info.y = position.y;
            info.is_maximized = is_maximized;
            info.is_minimized = is_minimized;
            info.is_focused = is_focused;
            info.is_visible = is_visible;
        }
        
        Ok(())
    }
}