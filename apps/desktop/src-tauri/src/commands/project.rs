use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub settings: ProjectSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub git_enabled: bool,
    pub default_branch: String,
    pub ai_provider: Option<String>,
    pub extensions: Vec<String>,
}

impl Default for ProjectSettings {
    fn default() -> Self {
        Self {
            git_enabled: true,
            default_branch: String::from("main"),
            ai_provider: None,
            extensions: Vec::new(),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectDto {
    pub name: String,
    pub path: String,
    pub description: Option<String>,
    pub settings: Option<ProjectSettings>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub settings: Option<ProjectSettings>,
}

#[derive(Debug, Serialize)]
pub struct ProjectListResponse {
    pub projects: Vec<Project>,
    pub total: usize,
}

// In-memory storage for now (will be replaced with SQLite)
pub struct ProjectStore(pub Mutex<HashMap<String, Project>>);

#[tauri::command]
pub async fn create_project(
    store: State<'_, ProjectStore>,
    dto: CreateProjectDto,
) -> Result<Project, String> {
    let mut projects = store.0.lock().map_err(|e| e.to_string())?;
    
    // Check if project already exists at this path
    let exists = projects.values().any(|p| p.path == dto.path);
    if exists {
        return Err(format!("Project already exists at path: {}", dto.path));
    }
    
    let project = Project {
        id: Uuid::new_v4().to_string(),
        name: dto.name,
        path: dto.path,
        description: dto.description,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        settings: dto.settings.unwrap_or_default(),
    };
    
    projects.insert(project.id.clone(), project.clone());
    
    Ok(project)
}

#[tauri::command]
pub async fn update_project(
    store: State<'_, ProjectStore>,
    id: String,
    dto: UpdateProjectDto,
) -> Result<Project, String> {
    let mut projects = store.0.lock().map_err(|e| e.to_string())?;
    
    let project = projects.get_mut(&id).ok_or("Project not found")?;
    
    if let Some(name) = dto.name {
        project.name = name;
    }
    
    if let Some(description) = dto.description {
        project.description = Some(description);
    }
    
    if let Some(settings) = dto.settings {
        project.settings = settings;
    }
    
    project.updated_at = Utc::now();
    
    Ok(project.clone())
}

#[tauri::command]
pub async fn delete_project(
    store: State<'_, ProjectStore>,
    id: String,
) -> Result<(), String> {
    let mut projects = store.0.lock().map_err(|e| e.to_string())?;
    
    projects
        .remove(&id)
        .ok_or("Project not found")?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_project(
    store: State<'_, ProjectStore>,
    id: String,
) -> Result<Project, String> {
    let projects = store.0.lock().map_err(|e| e.to_string())?;
    
    projects
        .get(&id)
        .cloned()
        .ok_or("Project not found".to_string())
}

#[tauri::command]
pub async fn list_projects(
    store: State<'_, ProjectStore>,
) -> Result<ProjectListResponse, String> {
    let projects = store.0.lock().map_err(|e| e.to_string())?;
    
    let mut project_list: Vec<Project> = projects.values().cloned().collect();
    
    // Sort by updated_at descending
    project_list.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    
    let total = project_list.len();
    
    Ok(ProjectListResponse {
        projects: project_list,
        total,
    })
}

#[tauri::command]
pub async fn open_project(
    store: State<'_, ProjectStore>,
    id: String,
) -> Result<Project, String> {
    let mut projects = store.0.lock().map_err(|e| e.to_string())?;
    
    let project = projects.get_mut(&id).ok_or("Project not found")?;
    
    // Update last accessed time
    project.updated_at = Utc::now();
    
    Ok(project.clone())
}

#[tauri::command]
pub async fn validate_project_path(path: String) -> Result<bool, String> {
    // Check if path exists
    let path_obj = std::path::Path::new(&path);
    
    if !path_obj.exists() {
        return Ok(false);
    }
    
    // Check if it's a directory
    if !path_obj.is_dir() {
        return Ok(false);
    }
    
    Ok(true)
}