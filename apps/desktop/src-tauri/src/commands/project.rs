use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{State, AppHandle};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use crate::commands::project_storage::save_projects;

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
pub async fn get_or_create_project_by_path(
    store: State<'_, ProjectStore>,
    app_handle: AppHandle,
    path: String,
    name: Option<String>,
) -> Result<Project, String> {
    let project = {
        let mut projects = store.0.lock().unwrap();
        
        // Check if a project already exists at this path
        for project in projects.values() {
            if project.path == path {
                return Ok(project.clone());
            }
        }
        
        // Create new project if not found
        let project_name = name.unwrap_or_else(|| {
            path.split('/').last().unwrap_or("Untitled Project").to_string()
        });
        
        let project = Project {
            id: Uuid::new_v4().to_string(),
            name: project_name,
            path: path.clone(),
            description: Some(format!("Project at {}", path)),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            settings: ProjectSettings::default(),
        };
        
        projects.insert(project.id.clone(), project.clone());
        project
    }; // Lock is released here
    
    // Now save to storage without holding the lock
    let projects_map = store.0.lock().unwrap().clone();
    save_projects(&app_handle, &projects_map).await?;
    
    Ok(project)
}

#[tauri::command]
pub async fn create_project(
    store: State<'_, ProjectStore>,
    app_handle: AppHandle,
    dto: CreateProjectDto,
) -> Result<Project, String> {
    let project = {
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
        project
    }; // Lock is released here
    
    // Now save to storage without holding the lock
    let projects_map = store.0.lock().map_err(|e| e.to_string())?.clone();
    save_projects(&app_handle, &projects_map).await?;
    
    Ok(project)
}

#[tauri::command]
pub async fn update_project(
    store: State<'_, ProjectStore>,
    app_handle: AppHandle,
    id: String,
    dto: UpdateProjectDto,
) -> Result<Project, String> {
    let result = {
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
        
        project.clone()
    }; // Lock is released here
    
    // Now save to storage without holding the lock
    let projects_map = store.0.lock().map_err(|e| e.to_string())?.clone();
    save_projects(&app_handle, &projects_map).await?;
    
    Ok(result)
}

#[tauri::command]
pub async fn delete_project(
    store: State<'_, ProjectStore>,
    app_handle: AppHandle,
    id: String,
) -> Result<(), String> {
    {
        let mut projects = store.0.lock().map_err(|e| e.to_string())?;
        projects.remove(&id).ok_or("Project not found")?;
    } // Lock is released here
    
    // Now save to storage without holding the lock
    let projects_map = store.0.lock().map_err(|e| e.to_string())?.clone();
    save_projects(&app_handle, &projects_map).await?;
    
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
    _app_handle: AppHandle,
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
    _app_handle: AppHandle,
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

#[derive(Debug, Serialize)]
pub struct ProjectInfo {
    pub name: String,
    pub r#type: String,
    pub language: Option<String>,
    pub framework: Option<String>,
}

#[tauri::command]
pub async fn get_project_info(path: String) -> Result<ProjectInfo, String> {
    let path_obj = std::path::Path::new(&path);
    
    if !path_obj.exists() || !path_obj.is_dir() {
        return Err("Invalid project path".to_string());
    }
    
    // Get project name from directory
    let name = path_obj
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();
    
    // Detect project type and language based on files
    let mut project_type = "generic";
    let mut language = None;
    let mut framework = None;
    
    // Check for common project files
    if path_obj.join("package.json").exists() {
        project_type = "node";
        language = Some("javascript".to_string());
        
        // Try to detect framework
        if path_obj.join("next.config.js").exists() || path_obj.join("next.config.ts").exists() {
            framework = Some("nextjs".to_string());
        } else if path_obj.join("vite.config.js").exists() || path_obj.join("vite.config.ts").exists() {
            framework = Some("vite".to_string());
        } else if path_obj.join("angular.json").exists() {
            framework = Some("angular".to_string());
        } else if path_obj.join("vue.config.js").exists() {
            framework = Some("vue".to_string());
        }
        
        // Check for TypeScript
        if path_obj.join("tsconfig.json").exists() {
            language = Some("typescript".to_string());
        }
    } else if path_obj.join("Cargo.toml").exists() {
        project_type = "rust";
        language = Some("rust".to_string());
        
        // Check for Tauri
        if path_obj.join("src-tauri").exists() {
            framework = Some("tauri".to_string());
        }
    } else if path_obj.join("go.mod").exists() {
        project_type = "go";
        language = Some("go".to_string());
    } else if path_obj.join("pom.xml").exists() {
        project_type = "maven";
        language = Some("java".to_string());
    } else if path_obj.join("build.gradle").exists() || path_obj.join("build.gradle.kts").exists() {
        project_type = "gradle";
        language = Some("java".to_string());
    } else if path_obj.join("requirements.txt").exists() || path_obj.join("setup.py").exists() {
        project_type = "python";
        language = Some("python".to_string());
        
        if path_obj.join("manage.py").exists() {
            framework = Some("django".to_string());
        }
    } else if path_obj.join("Gemfile").exists() {
        project_type = "ruby";
        language = Some("ruby".to_string());
        
        if path_obj.join("config.ru").exists() {
            framework = Some("rails".to_string());
        }
    } else if path_obj.join(".git").exists() {
        project_type = "git";
    }
    
    Ok(ProjectInfo {
        name,
        r#type: project_type.to_string(),
        language,
        framework,
    })
}