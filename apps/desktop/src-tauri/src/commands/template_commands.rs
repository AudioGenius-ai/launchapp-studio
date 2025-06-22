use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub language: String,
    pub framework: Option<String>,
    pub command: String,
    pub args: Vec<String>,
    pub prerequisites: Vec<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub path: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ProjectCreationOptions {
    pub template_id: String,
    pub project_name: String,
    pub project_path: String,
    pub git_init: Option<bool>,
    #[serde(rename = "installDependencies")]
    pub install_dependencies: Option<bool>,
    #[serde(rename = "openInEditor")]
    pub open_in_editor: Option<bool>,
}

#[tauri::command]
pub async fn get_templates() -> Result<Vec<ProjectTemplate>, String> {
    // Return built-in templates
    Ok(vec![
        ProjectTemplate {
            id: "vite-react".to_string(),
            name: "Vite + React".to_string(),
            description: "Fast React development with Vite".to_string(),
            category: "Frontend".to_string(),
            language: "TypeScript".to_string(),
            framework: Some("React".to_string()),
            command: "npm".to_string(),
            args: vec!["create".to_string(), "vite@latest".to_string()],
            prerequisites: vec!["node".to_string(), "npm".to_string()],
            icon: Some("react".to_string()),
        },
        ProjectTemplate {
            id: "tauri-app".to_string(),
            name: "Tauri App".to_string(),
            description: "Desktop application with Tauri".to_string(),
            category: "Desktop".to_string(),
            language: "Rust".to_string(),
            framework: Some("Tauri".to_string()),
            command: "npm".to_string(),
            args: vec!["create".to_string(), "tauri-app@latest".to_string()],
            prerequisites: vec!["node".to_string(), "npm".to_string(), "rust".to_string()],
            icon: Some("tauri".to_string()),
        },
    ])
}

#[tauri::command]
pub async fn get_custom_templates() -> Result<Vec<CustomTemplate>, String> {
    // TODO: Load from storage
    Ok(vec![])
}

#[tauri::command]
pub async fn create_project_from_template(
    options: ProjectCreationOptions,
) -> Result<CommandResult, String> {
    // TODO: Implement template project creation
    Ok(CommandResult {
        success: true,
        output: format!("Created project {} from template {}", options.project_name, options.template_id),
        error: None,
    })
}

#[tauri::command]
pub async fn check_command_availability(command: String) -> Result<bool, String> {
    match Command::new(&command).arg("--version").output() {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub async fn check_prerequisite(prerequisite: String) -> Result<bool, String> {
    let commands = match prerequisite.as_str() {
        "node" => vec!["node"],
        "npm" => vec!["npm"],
        "yarn" => vec!["yarn"],
        "pnpm" => vec!["pnpm"],
        "rust" => vec!["rustc", "cargo"],
        "python" => vec!["python", "python3"],
        "git" => vec!["git"],
        _ => vec![&prerequisite],
    };
    
    for cmd in commands {
        if check_command_availability(cmd.to_string()).await? {
            return Ok(true);
        }
    }
    
    Ok(false)
}

#[tauri::command]
pub async fn execute_template_command(
    command: String,
    args: Vec<String>,
    working_dir: String,
) -> Result<CommandResult, String> {
    let output = Command::new(&command)
        .args(&args)
        .current_dir(&working_dir)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;
    
    Ok(CommandResult {
        success: output.status.success(),
        output: String::from_utf8_lossy(&output.stdout).to_string(),
        error: if output.status.success() {
            None
        } else {
            Some(String::from_utf8_lossy(&output.stderr).to_string())
        },
    })
}

#[tauri::command]
pub async fn save_custom_template(
    template: CustomTemplate,
) -> Result<(), String> {
    // TODO: Save to storage
    Ok(())
}

#[tauri::command]
pub async fn remove_custom_template(
    template_id: String,
) -> Result<(), String> {
    // TODO: Remove from storage
    Ok(())
}

#[tauri::command]
pub async fn import_template_from_url(
    url: String,
) -> Result<CustomTemplate, String> {
    // TODO: Import template from URL
    Err("Not implemented".to_string())
}