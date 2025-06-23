use serde_json::Value;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{AppHandle, State};

// State for managing file watchers
pub struct FileWatcherState(pub Mutex<HashMap<String, String>>);

// State for managing application preferences
pub struct PreferencesState(pub Mutex<HashMap<String, Value>>);

// State for managing theme
pub struct ThemeState(pub Mutex<String>);

#[tauri::command]
pub async fn initialize_file_watcher(
    _app: AppHandle,
    _state: State<'_, FileWatcherState>,
) -> Result<(), String> {
    // Initialize file watcher service
    // This is a placeholder - actual file watching is handled by filesystem.rs
    Ok(())
}

#[tauri::command]
pub async fn initialize_project_service(_app: AppHandle) -> Result<(), String> {
    // Project service is already initialized in lib.rs setup
    // This command is here for compatibility with frontend expectations
    Ok(())
}

#[tauri::command]
pub async fn initialize_theme_service(
    _app: AppHandle,
    state: State<'_, ThemeState>,
) -> Result<(), String> {
    // Initialize with default theme
    let mut theme = state.0.lock().map_err(|e| e.to_string())?;
    *theme = "dark".to_string();
    Ok(())
}

#[tauri::command]
pub async fn load_user_preferences(
    app: AppHandle,
    state: State<'_, PreferencesState>,
) -> Result<HashMap<String, Value>, String> {
    // Try to load preferences from settings
    let settings_json = crate::commands::settings::load_settings(app).await?;
    
    // Parse JSON string into HashMap
    let settings: HashMap<String, Value> = if settings_json.is_empty() {
        HashMap::new()
    } else {
        serde_json::from_str(&settings_json)
            .map_err(|e| format!("Failed to parse settings: {}", e))?
    };
    
    // Store in state
    let mut prefs = state.0.lock().map_err(|e| e.to_string())?;
    *prefs = settings.clone();
    
    Ok(settings)
}

#[tauri::command]
pub async fn get_setting(
    app: AppHandle,
    key: String,
) -> Result<Value, String> {
    let settings_json = crate::commands::settings::load_settings(app).await?;
    
    // Parse JSON string into HashMap
    let settings: HashMap<String, Value> = if settings_json.is_empty() {
        HashMap::new()
    } else {
        serde_json::from_str(&settings_json)
            .map_err(|e| format!("Failed to parse settings: {}", e))?
    };
    
    Ok(settings.get(&key).cloned().unwrap_or(Value::Null))
}

#[tauri::command]
pub async fn check_for_updates(_app: AppHandle) -> Result<(), String> {
    // Placeholder for update checking
    // In a real implementation, this would check against a release server
    Ok(())
}

#[tauri::command]
pub async fn save_application_state(_app: AppHandle) -> Result<(), String> {
    // Save any pending application state
    // This is handled by individual services (projects, settings, etc.)
    Ok(())
}

#[tauri::command]
pub async fn cleanup_connections(_app: AppHandle) -> Result<(), String> {
    // Cleanup any open connections
    // Terminal and Claude plugins handle their own cleanup
    Ok(())
}

#[tauri::command]
pub async fn log_error(
    _app: AppHandle,
    message: String,
    stack: Option<String>,
) -> Result<(), String> {
    // Log error to console and potentially to file
    eprintln!("Frontend Error: {}", message);
    if let Some(stack_trace) = stack {
        eprintln!("Stack trace: {}", stack_trace);
    }
    Ok(())
}