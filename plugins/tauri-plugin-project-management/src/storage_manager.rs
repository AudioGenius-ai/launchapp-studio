use crate::error::{ProjectManagementError, Result};
use crate::models::*;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tauri_plugin_storage::{Storage, StorageExt};
use tokio::fs;
use walkdir::WalkDir;

pub struct StorageManager {
    app_handle: AppHandle,
}

impl StorageManager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    // Project storage paths
    fn get_project_path(&self, project_id: &str) -> Result<PathBuf> {
        let storage = self.app_handle.storage();
        let base_path = storage.get_storage_path()?;
        Ok(base_path.join("projects").join(project_id))
    }

    fn get_project_metadata_path(&self, project_id: &str) -> Result<PathBuf> {
        Ok(self.get_project_path(project_id)?.join("project.json"))
    }

    fn get_tasks_dir(&self, project_id: &str) -> Result<PathBuf> {
        Ok(self.get_project_path(project_id)?.join("tasks"))
    }

    fn get_task_path(&self, project_id: &str, task_id: &str) -> Result<PathBuf> {
        Ok(self.get_tasks_dir(project_id)?.join(format!("{}.json", task_id)))
    }

    fn get_documents_dir(&self, project_id: &str) -> Result<PathBuf> {
        Ok(self.get_project_path(project_id)?.join("documents"))
    }

    fn get_document_path(&self, project_id: &str, document_id: &str) -> Result<PathBuf> {
        Ok(self.get_documents_dir(project_id)?.join(format!("{}.mdx", document_id)))
    }

    fn get_attachments_dir(&self, project_id: &str) -> Result<PathBuf> {
        Ok(self.get_project_path(project_id)?.join("attachments"))
    }

    fn get_attachment_path(&self, project_id: &str, attachment_id: &str, filename: &str) -> Result<PathBuf> {
        Ok(self.get_attachments_dir(project_id)?.join(attachment_id).join(filename))
    }

    // Project operations
    pub async fn create_project(&self, project: &Project) -> Result<()> {
        let project_path = self.get_project_path(&project.id)?;
        
        // Create project directory structure
        fs::create_dir_all(&project_path).await?;
        fs::create_dir_all(self.get_tasks_dir(&project.id)?).await?;
        fs::create_dir_all(self.get_documents_dir(&project.id)?).await?;
        fs::create_dir_all(self.get_attachments_dir(&project.id)?).await?;

        // Save project metadata
        self.save_project(project).await?;

        Ok(())
    }

    pub async fn save_project(&self, project: &Project) -> Result<()> {
        let project_path = self.get_project_metadata_path(&project.id)?;
        let project_json = serde_json::to_string_pretty(project)?;
        fs::write(project_path, project_json).await?;
        Ok(())
    }

    pub async fn load_project(&self, project_id: &str) -> Result<Project> {
        let project_path = self.get_project_metadata_path(project_id)?;
        
        if !project_path.exists() {
            return Err(ProjectManagementError::ProjectNotFound {
                id: project_id.to_string(),
            });
        }

        let project_json = fs::read_to_string(project_path).await?;
        let project: Project = serde_json::from_str(&project_json)?;
        Ok(project)
    }

    pub async fn delete_project(&self, project_id: &str) -> Result<()> {
        let project_path = self.get_project_path(project_id)?;
        
        if !project_path.exists() {
            return Err(ProjectManagementError::ProjectNotFound {
                id: project_id.to_string(),
            });
        }

        fs::remove_dir_all(project_path).await?;
        Ok(())
    }

    pub async fn list_projects(&self) -> Result<Vec<Project>> {
        let storage = self.app_handle.storage();
        let base_path = storage.get_storage_path()?;
        let projects_path = base_path.join("projects");

        if !projects_path.exists() {
            return Ok(Vec::new());
        }

        let mut projects = Vec::new();
        let mut entries = fs::read_dir(projects_path).await?;

        while let Some(entry) = entries.next_entry().await? {
            if entry.file_type().await?.is_dir() {
                if let Some(project_id) = entry.file_name().to_str() {
                    if let Ok(project) = self.load_project(project_id).await {
                        projects.push(project);
                    }
                }
            }
        }

        // Sort by updated_at descending
        projects.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(projects)
    }

    // Task operations
    pub async fn save_task(&self, task: &Task) -> Result<()> {
        let task_path = self.get_task_path(&task.project_id, &task.id)?;
        let task_json = serde_json::to_string_pretty(task)?;
        fs::write(task_path, task_json).await?;
        Ok(())
    }

    pub async fn load_task(&self, project_id: &str, task_id: &str) -> Result<Task> {
        let task_path = self.get_task_path(project_id, task_id)?;
        
        if !task_path.exists() {
            return Err(ProjectManagementError::TaskNotFound {
                id: task_id.to_string(),
            });
        }

        let task_json = fs::read_to_string(task_path).await?;
        let task: Task = serde_json::from_str(&task_json)?;
        Ok(task)
    }

    pub async fn delete_task(&self, project_id: &str, task_id: &str) -> Result<()> {
        let task_path = self.get_task_path(project_id, task_id)?;
        
        if !task_path.exists() {
            return Err(ProjectManagementError::TaskNotFound {
                id: task_id.to_string(),
            });
        }

        fs::remove_file(task_path).await?;
        Ok(())
    }

    pub async fn list_tasks(&self, project_id: &str) -> Result<Vec<Task>> {
        let tasks_dir = self.get_tasks_dir(project_id)?;

        if !tasks_dir.exists() {
            return Ok(Vec::new());
        }

        let mut tasks = Vec::new();
        let mut entries = fs::read_dir(tasks_dir).await?;

        while let Some(entry) = entries.next_entry().await? {
            if entry.file_type().await?.is_file() {
                if let Some(filename) = entry.file_name().to_str() {
                    if filename.ends_with(".json") {
                        let task_id = filename.trim_end_matches(".json");
                        if let Ok(task) = self.load_task(project_id, task_id).await {
                            tasks.push(task);
                        }
                    }
                }
            }
        }

        // Sort by task number
        tasks.sort_by(|a, b| a.task_number.cmp(&b.task_number));
        Ok(tasks)
    }

    pub async fn get_next_task_number(&self, project_id: &str) -> Result<u32> {
        let tasks = self.list_tasks(project_id).await?;
        let max_number = tasks.iter().map(|t| t.task_number).max().unwrap_or(0);
        Ok(max_number + 1)
    }

    // Document operations
    pub async fn save_document(&self, document: &Document) -> Result<()> {
        let document_path = self.get_document_path(&document.project_id, &document.id)?;
        
        // Create MDX with frontmatter
        let frontmatter = DocumentFrontmatter {
            id: document.id.clone(),
            title: document.title.clone(),
            author: document.author.clone(),
            created_at: document.created_at,
            updated_at: document.updated_at,
            tags: document.tags.clone(),
            version: document.version.clone(),
            status: document.status.clone(),
            parent_id: document.parent_id.clone(),
            template: document.template.clone(),
            permissions: document.permissions.clone(),
        };

        let frontmatter_yaml = serde_yaml::to_string(&frontmatter)
            .map_err(|e| ProjectManagementError::SerializationError { message: e.to_string() })?;

        let mdx_content = format!("---\n{}---\n\n{}", frontmatter_yaml, document.content);
        
        fs::write(document_path, mdx_content).await?;
        Ok(())
    }

    pub async fn load_document(&self, project_id: &str, document_id: &str) -> Result<Document> {
        let document_path = self.get_document_path(project_id, document_id)?;
        
        if !document_path.exists() {
            return Err(ProjectManagementError::DocumentNotFound {
                id: document_id.to_string(),
            });
        }

        let mdx_content = fs::read_to_string(document_path).await?;
        self.parse_mdx_document(project_id, &mdx_content)
    }

    pub async fn delete_document(&self, project_id: &str, document_id: &str) -> Result<()> {
        let document_path = self.get_document_path(project_id, document_id)?;
        
        if !document_path.exists() {
            return Err(ProjectManagementError::DocumentNotFound {
                id: document_id.to_string(),
            });
        }

        fs::remove_file(document_path).await?;
        Ok(())
    }

    pub async fn list_documents(&self, project_id: &str) -> Result<Vec<Document>> {
        let documents_dir = self.get_documents_dir(project_id)?;

        if !documents_dir.exists() {
            return Ok(Vec::new());
        }

        let mut documents = Vec::new();
        let mut entries = fs::read_dir(documents_dir).await?;

        while let Some(entry) = entries.next_entry().await? {
            if entry.file_type().await?.is_file() {
                if let Some(filename) = entry.file_name().to_str() {
                    if filename.ends_with(".mdx") {
                        let document_id = filename.trim_end_matches(".mdx");
                        if let Ok(document) = self.load_document(project_id, document_id).await {
                            documents.push(document);
                        }
                    }
                }
            }
        }

        // Sort by updated_at descending
        documents.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(documents)
    }

    // Attachment operations
    pub async fn save_attachment(&self, project_id: &str, attachment: &TaskAttachment, data: &[u8]) -> Result<()> {
        let attachment_path = self.get_attachment_path(project_id, &attachment.id, &attachment.filename)?;
        
        // Create directory if it doesn't exist
        if let Some(parent) = attachment_path.parent() {
            fs::create_dir_all(parent).await?;
        }

        fs::write(attachment_path, data).await?;
        Ok(())
    }

    pub async fn load_attachment(&self, project_id: &str, attachment_id: &str, filename: &str) -> Result<Vec<u8>> {
        let attachment_path = self.get_attachment_path(project_id, attachment_id, filename)?;
        
        if !attachment_path.exists() {
            return Err(ProjectManagementError::IoError {
                message: "Attachment file not found".to_string(),
            });
        }

        let data = fs::read(attachment_path).await?;
        Ok(data)
    }

    pub async fn delete_attachment(&self, project_id: &str, attachment_id: &str, filename: &str) -> Result<()> {
        let attachment_path = self.get_attachment_path(project_id, attachment_id, filename)?;
        
        if attachment_path.exists() {
            fs::remove_file(&attachment_path).await?;
            
            // Remove directory if empty
            if let Some(parent) = attachment_path.parent() {
                if let Ok(mut entries) = fs::read_dir(parent).await {
                    if entries.next_entry().await?.is_none() {
                        let _ = fs::remove_dir(parent).await;
                    }
                }
            }
        }

        Ok(())
    }

    // Search operations
    pub async fn search_tasks(&self, project_id: &str, query: &str) -> Result<Vec<Task>> {
        let tasks = self.list_tasks(project_id).await?;
        let query_lower = query.to_lowercase();

        let matching_tasks: Vec<Task> = tasks
            .into_iter()
            .filter(|task| {
                task.title.to_lowercase().contains(&query_lower)
                    || task.description.to_lowercase().contains(&query_lower)
                    || task.labels.iter().any(|label| label.to_lowercase().contains(&query_lower))
                    || task.comments.iter().any(|comment| comment.content.to_lowercase().contains(&query_lower))
            })
            .collect();

        Ok(matching_tasks)
    }

    pub async fn search_documents(&self, project_id: &str, query: &str) -> Result<Vec<Document>> {
        let documents = self.list_documents(project_id).await?;
        let query_lower = query.to_lowercase();

        let matching_documents: Vec<Document> = documents
            .into_iter()
            .filter(|doc| {
                doc.title.to_lowercase().contains(&query_lower)
                    || doc.content.to_lowercase().contains(&query_lower)
                    || doc.tags.iter().any(|tag| tag.to_lowercase().contains(&query_lower))
            })
            .collect();

        Ok(matching_documents)
    }

    // Utility methods
    fn parse_mdx_document(&self, project_id: &str, mdx_content: &str) -> Result<Document> {
        // Parse frontmatter
        let parts: Vec<&str> = mdx_content.splitn(3, "---").collect();
        
        if parts.len() != 3 || !parts[0].trim().is_empty() {
            return Err(ProjectManagementError::InvalidMdxContent {
                error: "Invalid frontmatter format".to_string(),
            });
        }

        let frontmatter_yaml = parts[1];
        let content = parts[2].trim_start_matches('\n').to_string();

        let frontmatter: DocumentFrontmatter = serde_yaml::from_str(frontmatter_yaml)
            .map_err(|e| ProjectManagementError::InvalidMdxContent {
                error: format!("Failed to parse frontmatter: {}", e),
            })?;

        Ok(Document {
            id: frontmatter.id,
            title: frontmatter.title,
            content,
            author: frontmatter.author,
            created_at: frontmatter.created_at,
            updated_at: frontmatter.updated_at,
            tags: frontmatter.tags,
            version: frontmatter.version,
            status: frontmatter.status,
            parent_id: frontmatter.parent_id,
            template: frontmatter.template,
            permissions: frontmatter.permissions,
            project_id: project_id.to_string(),
        })
    }

    pub async fn get_project_statistics(&self, project_id: &str) -> Result<ProjectStatistics> {
        let tasks = self.list_tasks(project_id).await?;
        let documents = self.list_documents(project_id).await?;
        let project = self.load_project(project_id).await?;

        let mut tasks_by_status = std::collections::HashMap::new();
        let mut tasks_by_priority = std::collections::HashMap::new();
        let mut tasks_by_type = std::collections::HashMap::new();

        for task in &tasks {
            *tasks_by_status.entry(task.status.clone()).or_insert(0) += 1;
            *tasks_by_priority.entry(task.priority.clone()).or_insert(0) += 1;
            *tasks_by_type.entry(task.task_type.clone()).or_insert(0) += 1;
        }

        let mut documents_by_status = std::collections::HashMap::new();
        for document in &documents {
            *documents_by_status.entry(document.status.clone()).or_insert(0) += 1;
        }

        let active_sprints = project.sprints.iter().filter(|s| matches!(s.status, SprintStatus::Active)).count() as u32;
        let completed_sprints = project.sprints.iter().filter(|s| matches!(s.status, SprintStatus::Completed)).count() as u32;

        // Calculate weekly activity
        let one_week_ago = Utc::now() - chrono::Duration::days(7);
        let tasks_created_this_week = tasks.iter().filter(|t| t.created_at >= one_week_ago).count() as u32;
        let tasks_completed_this_week = tasks.iter().filter(|t| t.status == "done" && t.updated_at >= one_week_ago).count() as u32;
        let documents_created_this_week = documents.iter().filter(|d| d.created_at >= one_week_ago).count() as u32;
        let documents_updated_this_week = documents.iter().filter(|d| d.updated_at >= one_week_ago).count() as u32;

        Ok(ProjectStatistics {
            project_id: project_id.to_string(),
            total_tasks: tasks.len() as u32,
            tasks_by_status,
            tasks_by_priority,
            tasks_by_type,
            total_documents: documents.len() as u32,
            documents_by_status,
            active_sprints,
            completed_sprints,
            total_members: project.members.len() as u32,
            activity_summary: ActivitySummary {
                tasks_created_this_week,
                tasks_completed_this_week,
                documents_created_this_week,
                documents_updated_this_week,
                recent_activity: Vec::new(), // TODO: Implement activity tracking
            },
        })
    }
}

// Helper struct for MDX frontmatter
#[derive(Debug, Serialize, Deserialize)]
struct DocumentFrontmatter {
    id: String,
    title: String,
    author: String,
    created_at: chrono::DateTime<Utc>,
    updated_at: chrono::DateTime<Utc>,
    tags: Vec<String>,
    version: String,
    status: DocumentStatus,
    parent_id: Option<String>,
    template: DocumentTemplate,
    permissions: DocumentPermissions,
}