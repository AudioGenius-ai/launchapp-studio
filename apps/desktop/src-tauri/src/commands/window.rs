use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct WindowConfig {
    pub id: String,
    pub title: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub center: Option<bool>,
    pub url: Option<String>,
    pub data: Option<HashMap<String, serde_json::Value>>,
}

#[tauri::command]
pub async fn create_project_window(
    app: AppHandle,
    project_id: String,
    project_path: String,
) -> Result<String, String> {
    let window_id = format!("project-{}", project_id);
    
    // Check if window already exists
    if let Some(window) = app.get_webview_window(&window_id) {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(window_id);
    }
    
    // Create the window URL
    let url = format!("project.html#/project/{}", project_id);
    
    // Create new window
    let window = WebviewWindowBuilder::new(
        &app,
        &window_id,
        WebviewUrl::App(url.into())
    )
    .title(format!("Code Pilot - {}", project_path.split('/').last().unwrap_or("Project")))
    .inner_size(1400.0, 900.0)
    .center()
    .build()
    .map_err(|e| e.to_string())?;
    
    // Store project data in window (escape the path properly for JavaScript)
    let escaped_path = project_path.replace("\\", "\\\\").replace("'", "\\'");
    window.eval(&format!(
        "window.__PROJECT_ID__ = '{}'; window.__PROJECT_PATH__ = '{}'; window.__IS_SAVED_PROJECT__ = true;",
        project_id, escaped_path
    )).map_err(|e| e.to_string())?;
    
    Ok(window_id)
}

#[tauri::command]
pub async fn open_project_directory(
    app: AppHandle,
    directory_path: String,
) -> Result<String, String> {
    // Generate a unique project ID for this directory
    let project_id = Uuid::new_v4().to_string();
    let window_id = format!("project-{}", project_id);
    
    // Check if a window for this path already exists
    // (In a real app, you'd want to store and check this mapping)
    if let Some(window) = app.get_webview_window(&window_id) {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(window_id);
    }
    
    // Extract project name from path
    let project_name = directory_path
        .split('/')
        .last()
        .unwrap_or("Untitled Project");
    
    // Create the window URL
    let url = format!("project.html#/project/{}", project_id);
    
    // Create new window
    let window = WebviewWindowBuilder::new(
        &app,
        &window_id,
        WebviewUrl::App(url.into())
    )
    .title(format!("Code Pilot - {}", project_name))
    .inner_size(1400.0, 900.0)
    .center()
    .build()
    .map_err(|e| e.to_string())?;
    
    // Store project data in window (escape the path properly for JavaScript)
    let escaped_path = directory_path.replace("\\", "\\\\").replace("'", "\\'");
    window.eval(&format!(
        "window.__PROJECT_ID__ = '{}'; window.__PROJECT_PATH__ = '{}'; window.__IS_TEMP__ = true;",
        project_id, escaped_path
    )).map_err(|e| e.to_string())?;
    
    Ok(window_id)
}

#[tauri::command]
pub async fn close_window(
    app: AppHandle,
    window_id: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_id) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn focus_window(
    app: AppHandle,
    window_id: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_id) {
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}