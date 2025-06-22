use crate::commands::project::Project;
use std::collections::HashMap;
use tauri::{AppHandle, Manager};

const PROJECTS_KEY: &str = "projects";
const PROJECTS_NAMESPACE: &str = "projects";

pub async fn save_projects(app_handle: &AppHandle, projects: &HashMap<String, Project>) -> Result<(), String> {
    let storage = app_handle
        .state::<tauri_plugin_storage::Storage>()
        .inner();
    
    let service = storage.service();
    let service = service.lock().await;
    
    let projects_value = serde_json::to_value(projects)
        .map_err(|e| format!("Failed to serialize projects: {}", e))?;
    
    let options = tauri_plugin_storage::models::SetItemOptions {
        key: PROJECTS_KEY.to_string(),
        value: projects_value,
        namespace: Some(PROJECTS_NAMESPACE.to_string()),
        metadata: None,
    };
    
    service.set_item(options).await
        .map_err(|e| format!("Failed to save projects: {}", e))
}

pub async fn load_projects(app_handle: &AppHandle) -> Result<HashMap<String, Project>, String> {
    let storage = app_handle
        .state::<tauri_plugin_storage::Storage>()
        .inner();
    
    let service = storage.service();
    let service = service.lock().await;
    
    let options = tauri_plugin_storage::models::GetItemOptions {
        key: PROJECTS_KEY.to_string(),
        namespace: Some(PROJECTS_NAMESPACE.to_string()),
    };
    
    match service.get_item(options).await {
        Ok(item) => {
            serde_json::from_value::<HashMap<String, Project>>(item.value)
                .map_err(|e| format!("Failed to deserialize projects: {}", e))
        }
        Err(e) if e.to_string().contains("not found") => {
            // No projects saved yet
            Ok(HashMap::new())
        }
        Err(e) => Err(format!("Failed to load projects: {}", e))
    }
}