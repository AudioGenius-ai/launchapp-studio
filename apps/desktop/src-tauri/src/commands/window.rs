use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn create_project_window(
    app_handle: AppHandle,
    project_id: String,
) -> Result<(), String> {
    let window_label = format!("project-{}", project_id);
    
    // Check if window already exists
    if app_handle.get_webview_window(&window_label).is_some() {
        return Ok(());
    }
    
    app_handle
        .webview_window_builder(&window_label)
        .title(format!("Code Pilot - Project {}", project_id))
        .inner_size(1200.0, 800.0)
        .build()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn close_window(
    app_handle: AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window(&window_label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn focus_window(
    app_handle: AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window(&window_label) {
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}