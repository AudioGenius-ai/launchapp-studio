use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tauri::{Emitter, Window};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    #[serde(rename = "type")]
    pub template_type: String,
    pub tags: Vec<String>,
    
    // Execution
    pub command: String,
    #[serde(rename = "hasProjectName")]
    pub has_project_name: Option<bool>,
    #[serde(rename = "postCreateCommand")]
    pub post_create_command: Option<String>,
    
    // UI
    pub icon: Option<String>,
    pub logo: Option<String>,
    pub color: Option<TemplateColor>,
    
    // Metadata
    pub author: Option<String>,
    pub version: Option<String>,
    pub framework: Option<String>,
    pub stack: Option<Vec<String>>,
    
    // Links
    #[serde(rename = "repoUrl")]
    pub repo_url: Option<String>,
    #[serde(rename = "demoUrl")]
    pub demo_url: Option<String>,
    #[serde(rename = "docsUrl")]
    pub docs_url: Option<String>,
    
    // Features
    pub features: Option<Vec<String>>,
    pub prerequisites: Option<Vec<String>>,
    #[serde(rename = "isPremium")]
    pub is_premium: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TemplateColor {
    pub from: String,
    pub to: String,
    pub direction: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ProjectCreationOptions {
    pub template: ProjectTemplate,
    #[serde(rename = "projectName")]
    pub project_name: String,
    #[serde(rename = "projectPath")]
    pub project_path: String,
    #[serde(rename = "gitInit")]
    pub git_init: Option<bool>,
    #[serde(rename = "installDependencies")]
    pub install_dependencies: Option<bool>,
    #[serde(rename = "openInEditor")]
    pub open_in_editor: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct TemplateExecutionResult {
    pub success: bool,
    #[serde(rename = "projectPath")]
    pub project_path: String,
    pub error: Option<String>,
    pub output: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PrerequisiteCheck {
    pub name: String,
    pub command: String,
    pub installed: bool,
    pub version: Option<String>,
    #[serde(rename = "requiredVersion")]
    pub required_version: Option<String>,
}

#[tauri::command]
pub async fn get_templates() -> Result<Vec<ProjectTemplate>, String> {
    // For now, return built-in templates
    // In a real implementation, this would load from a JSON file or database
    Ok(get_builtin_templates())
}

#[tauri::command]
pub async fn get_custom_templates() -> Result<Vec<ProjectTemplate>, String> {
    // TODO: Load custom templates from app data directory
    Ok(vec![])
}

#[tauri::command]
pub async fn create_project_from_template(
    options: ProjectCreationOptions,
    window: Window,
) -> Result<TemplateExecutionResult, String> {
    let project_path = PathBuf::from(&options.project_path);
    
    // Create project directory
    if !project_path.exists() {
        std::fs::create_dir_all(&project_path)
            .map_err(|e| format!("Failed to create project directory: {}", e))?;
    }
    
    // Build command
    let mut command = build_template_command(&options.template, &options.project_name);
    
    // Execute command
    window.emit("template:execution:started", &options.template.id).ok();
    
    let output = Command::new("sh")
        .arg("-c")
        .arg(&command)
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;
    
    let success = output.status.success();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    // Emit output events
    if !stdout.is_empty() {
        window.emit("template:execution:output", &stdout).ok();
    }
    if !stderr.is_empty() {
        window.emit("template:execution:error", &stderr).ok();
    }
    
    window.emit("template:execution:completed", &options.template.id).ok();
    
    Ok(TemplateExecutionResult {
        success,
        project_path: project_path.to_string_lossy().to_string(),
        error: if success { None } else { Some(stderr) },
        output: Some(stdout),
    })
}

#[tauri::command]
pub async fn check_command_availability(command: String) -> Result<bool, String> {
    let output = Command::new("which")
        .arg(&command)
        .output()
        .map_err(|e| format!("Failed to check command: {}", e))?;
    
    Ok(output.status.success())
}

#[tauri::command]
pub async fn check_prerequisite(
    name: String,
    required_version: Option<String>,
) -> Result<PrerequisiteCheck, String> {
    // Check if command exists
    let exists = Command::new("which")
        .arg(&name)
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false);
    
    if !exists {
        return Ok(PrerequisiteCheck {
            name: name.clone(),
            command: name,
            installed: false,
            version: None,
            required_version,
        });
    }
    
    // Try to get version
    let version = get_command_version(&name);
    
    Ok(PrerequisiteCheck {
        name: name.clone(),
        command: name,
        installed: true,
        version,
        required_version,
    })
}

#[tauri::command]
pub async fn execute_template_command(
    command: String,
    cwd: String,
    window: Window,
) -> Result<(), String> {
    window.emit("command:execution:started", &command).ok();
    
    let output = Command::new("sh")
        .arg("-c")
        .arg(&command)
        .current_dir(&cwd)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    if !stdout.is_empty() {
        window.emit("command:execution:output", &stdout).ok();
    }
    if !stderr.is_empty() {
        window.emit("command:execution:error", &stderr).ok();
    }
    
    window.emit("command:execution:completed", &command).ok();
    
    if output.status.success() {
        Ok(())
    } else {
        Err(format!("Command failed: {}", stderr))
    }
}

#[tauri::command]
pub async fn save_custom_template(_template: ProjectTemplate) -> Result<(), String> {
    // TODO: Save to app data directory
    Ok(())
}

#[tauri::command]
pub async fn remove_custom_template(_id: String) -> Result<(), String> {
    // TODO: Remove from app data directory
    Ok(())
}

#[tauri::command]
pub async fn import_template_from_url(_url: String) -> Result<ProjectTemplate, String> {
    // TODO: Fetch and parse template from URL
    Err("Not implemented yet".to_string())
}

// Helper functions

fn build_template_command(template: &ProjectTemplate, project_name: &str) -> String {
    let mut command = template.command.clone();
    
    // Add project name if needed
    if template.has_project_name.unwrap_or(true) {
        // Special handling for different template types
        match template.template_type.as_str() {
            "vite" => {
                command.push_str(&format!(" {} --template", project_name));
            }
            "tauri" => {
                command.push_str(&format!(" {}", project_name));
            }
            _ => {
                command.push_str(&format!(" {}", project_name));
            }
        }
    }
    
    command
}

fn get_command_version(command: &str) -> Option<String> {
    let version_flag = match command {
        "node" | "npm" | "pnpm" | "yarn" => "--version",
        "python" | "python3" => "--version",
        "cargo" | "rustc" => "--version",
        "git" => "--version",
        _ => "--version",
    };
    
    Command::new(command)
        .arg(version_flag)
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
            } else {
                None
            }
        })
}

fn get_builtin_templates() -> Vec<ProjectTemplate> {
    vec![
        // React templates
        ProjectTemplate {
            id: "react-vite".to_string(),
            name: "React + Vite".to_string(),
            description: "Fast React development with Vite".to_string(),
            category: "framework".to_string(),
            template_type: "vite".to_string(),
            command: "npm create vite@latest".to_string(),
            has_project_name: Some(true),
            tags: vec!["react".to_string(), "vite".to_string(), "typescript".to_string()],
            icon: Some("react".to_string()),
            framework: Some("react".to_string()),
            stack: Some(vec!["React".to_string(), "Vite".to_string(), "TypeScript".to_string()]),
            color: Some(TemplateColor {
                from: "#61DAFB".to_string(),
                to: "#282C34".to_string(),
                direction: None,
            }),
            repo_url: Some("https://github.com/vitejs/vite".to_string()),
            ..Default::default()
        },
        
        // Next.js templates
        ProjectTemplate {
            id: "nextjs-app".to_string(),
            name: "Next.js App Router".to_string(),
            description: "Full-stack React framework with App Router".to_string(),
            category: "fullstack".to_string(),
            template_type: "create".to_string(),
            command: "npx create-next-app@latest".to_string(),
            has_project_name: Some(true),
            tags: vec!["nextjs".to_string(), "react".to_string(), "typescript".to_string(), "tailwind".to_string()],
            icon: Some("nextjs".to_string()),
            framework: Some("nextjs".to_string()),
            stack: Some(vec!["Next.js".to_string(), "React".to_string(), "TypeScript".to_string(), "Tailwind CSS".to_string()]),
            color: Some(TemplateColor {
                from: "#000000".to_string(),
                to: "#434343".to_string(),
                direction: None,
            }),
            repo_url: Some("https://github.com/vercel/next.js".to_string()),
            docs_url: Some("https://nextjs.org/docs".to_string()),
            features: Some(vec![
                "App Router".to_string(),
                "Server Components".to_string(),
                "API Routes".to_string(),
                "TypeScript".to_string(),
                "Tailwind CSS".to_string(),
            ]),
            prerequisites: Some(vec!["node >= 18.17.0".to_string()]),
            ..Default::default()
        },
        
        // Tauri template
        ProjectTemplate {
            id: "tauri-app".to_string(),
            name: "Tauri Desktop App".to_string(),
            description: "Build native desktop apps with web technologies".to_string(),
            category: "desktop".to_string(),
            template_type: "tauri".to_string(),
            command: "npm create tauri-app@latest".to_string(),
            has_project_name: Some(true),
            tags: vec!["tauri".to_string(), "desktop".to_string(), "rust".to_string()],
            icon: Some("tauri".to_string()),
            framework: Some("tauri".to_string()),
            stack: Some(vec!["Tauri".to_string(), "Rust".to_string(), "TypeScript".to_string()]),
            color: Some(TemplateColor {
                from: "#FFC131".to_string(),
                to: "#24C8DB".to_string(),
                direction: None,
            }),
            repo_url: Some("https://github.com/tauri-apps/tauri".to_string()),
            docs_url: Some("https://tauri.app".to_string()),
            prerequisites: Some(vec![
                "rust".to_string(),
                "node >= 18".to_string(),
            ]),
            ..Default::default()
        },
        
        // Add more templates as needed...
    ]
}

impl Default for ProjectTemplate {
    fn default() -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name: String::new(),
            description: String::new(),
            category: String::new(),
            template_type: String::new(),
            tags: vec![],
            command: String::new(),
            has_project_name: None,
            post_create_command: None,
            icon: None,
            logo: None,
            color: None,
            author: None,
            version: None,
            framework: None,
            stack: None,
            repo_url: None,
            demo_url: None,
            docs_url: None,
            features: None,
            prerequisites: None,
            is_premium: None,
        }
    }
}