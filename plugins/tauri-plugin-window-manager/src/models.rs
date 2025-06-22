use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowConfig {
    pub label: String,
    pub title: Option<String>,
    pub url: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub center: Option<bool>,
    pub resizable: Option<bool>,
    pub maximized: Option<bool>,
    pub minimizable: Option<bool>,
    pub closable: Option<bool>,
    pub decorations: Option<bool>,
    pub always_on_top: Option<bool>,
    pub skip_taskbar: Option<bool>,
    pub visible: Option<bool>,
    pub focused: Option<bool>,
    pub theme: Option<WindowTheme>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WindowTheme {
    Light,
    Dark,
    Auto,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowInfo {
    pub id: Uuid,
    pub label: String,
    pub title: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub is_maximized: bool,
    pub is_minimized: bool,
    pub is_focused: bool,
    pub is_visible: bool,
    pub theme: WindowTheme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowMessage {
    pub from: String,
    pub to: String,
    pub message_type: String,
    pub payload: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowSize {
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowState {
    pub windows: HashMap<String, WindowInfo>,
    pub active_window: Option<String>,
    pub window_order: Vec<String>,
}
