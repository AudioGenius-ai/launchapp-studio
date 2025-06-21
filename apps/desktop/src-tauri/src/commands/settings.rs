use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn get_settings_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app_handle.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    // Ensure the directory exists
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    
    Ok(app_dir.join("settings.json"))
}

#[tauri::command]
pub async fn load_settings(app_handle: AppHandle) -> Result<String, String> {
    let settings_path = get_settings_path(&app_handle)?;
    
    if settings_path.exists() {
        fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))
    } else {
        // Return empty string if settings file doesn't exist
        Ok(String::new())
    }
}

#[tauri::command]
pub async fn save_settings(app_handle: AppHandle, settings: String) -> Result<(), String> {
    let settings_path = get_settings_path(&app_handle)?;
    
    // Validate JSON before saving
    serde_json::from_str::<serde_json::Value>(&settings)
        .map_err(|e| format!("Invalid JSON format: {}", e))?;
    
    fs::write(&settings_path, settings)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn reset_settings(app_handle: AppHandle) -> Result<(), String> {
    let settings_path = get_settings_path(&app_handle)?;
    
    if settings_path.exists() {
        fs::remove_file(&settings_path)
            .map_err(|e| format!("Failed to delete settings file: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn get_settings_file_path(app_handle: AppHandle) -> Result<String, String> {
    let settings_path = get_settings_path(&app_handle)?;
    settings_path.to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())
        .map(|s| s.to_string())
}

#[tauri::command]
pub async fn export_settings(app_handle: AppHandle, export_path: String) -> Result<(), String> {
    let settings_path = get_settings_path(&app_handle)?;
    
    if !settings_path.exists() {
        return Err("No settings to export".to_string());
    }
    
    let settings_content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;
    
    fs::write(&export_path, settings_content)
        .map_err(|e| format!("Failed to export settings: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn import_settings(app_handle: AppHandle, import_path: String) -> Result<String, String> {
    let import_content = fs::read_to_string(&import_path)
        .map_err(|e| format!("Failed to read import file: {}", e))?;
    
    // Validate JSON format
    serde_json::from_str::<serde_json::Value>(&import_content)
        .map_err(|e| format!("Invalid settings format: {}", e))?;
    
    // Save the imported settings
    save_settings(app_handle, import_content.clone()).await?;
    
    Ok(import_content)
}