use anyhow::Result;
use chrono::Utc;
use rmcp::{
    ServerHandler, ServiceExt,
    model::{ServerCapabilities, ServerInfo},
    schemars, tool,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use tokio::io::{stdin, stdout};
use tracing::info;
use uuid::Uuid;

// Project Management Data Structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub key: String,
    pub description: String,
    pub owner: String,
    pub created_at: String,
    pub updated_at: String,
    pub settings: ProjectSettings,
    pub members: Vec<ProjectMember>,
    pub sprints: Vec<Sprint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub task_prefix: String,
    pub default_assignee: Option<String>,
    pub custom_fields: HashMap<String, Value>,
    pub workflow_states: Vec<String>,
    pub issue_types: Vec<String>,
    pub priorities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMember {
    pub user_id: String,
    pub role: String,
    pub joined_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub project_id: String,
    pub key: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    pub task_type: String,
    pub assignee: Option<String>,
    pub reporter: String,
    pub created_at: String,
    pub updated_at: String,
    pub due_date: Option<String>,
    pub estimate: Option<u32>,
    pub time_spent: Option<u32>,
    pub sprint_id: Option<String>,
    pub parent_id: Option<String>,
    pub labels: Vec<String>,
    pub comments: Vec<TaskComment>,
    pub attachments: Vec<TaskAttachment>,
    pub custom_fields: HashMap<String, Value>,
    pub task_number: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskComment {
    pub id: String,
    pub author: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskAttachment {
    pub id: String,
    pub filename: String,
    pub size: u64,
    pub content_type: String,
    pub uploaded_by: String,
    pub uploaded_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub content: String,
    pub status: String,
    pub template: String,
    pub author: String,
    pub created_at: String,
    pub updated_at: String,
    pub tags: Vec<String>,
    pub parent_id: Option<String>,
    pub permissions: DocumentPermissions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentPermissions {
    pub read: Vec<String>,
    pub write: Vec<String>,
    pub admin: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sprint {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub status: String,
    pub goal: String,
    pub created_at: String,
    pub updated_at: String,
}

// Request/Response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub key: String,
    pub description: String,
    pub owner: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: String,
    pub priority: String,
    pub task_type: String,
    pub assignee: Option<String>,
    pub due_date: Option<String>,
    pub estimate: Option<u32>,
    pub labels: Vec<String>,
    pub parent_id: Option<String>,
    pub custom_fields: HashMap<String, Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDocumentRequest {
    pub title: String,
    pub content: Option<String>,
    pub template: String,
    pub tags: Vec<String>,
    pub parent_id: Option<String>,
    pub permissions: DocumentPermissions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSprintRequest {
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub goal: String,
}

// Main Project Management Service
#[derive(Debug, Clone)]
pub struct ProjectManagementServer {
    // In-memory storage for demo purposes
    // In a real implementation, this would connect to actual storage
    #[allow(dead_code)]
    projects: HashMap<String, Project>,
    #[allow(dead_code)]
    tasks: HashMap<String, Vec<Task>>,
    #[allow(dead_code)]
    documents: HashMap<String, Vec<Document>>,
    #[allow(dead_code)]
    sprints: HashMap<String, Vec<Sprint>>,
}

impl ProjectManagementServer {
    pub fn new() -> Self {
        Self {
            projects: HashMap::new(),
            tasks: HashMap::new(),
            documents: HashMap::new(),
            sprints: HashMap::new(),
        }
    }

    #[allow(dead_code)]
    fn get_project_context(&self, headers: &HashMap<String, String>) -> (String, String) {
        let project_id = headers
            .get("x-project-id")
            .cloned()
            .unwrap_or_else(|| "default".to_string());
        let workspace_path = headers
            .get("x-workspace-path")
            .cloned()
            .unwrap_or_else(|| ".".to_string());
        (project_id, workspace_path)
    }

    #[allow(dead_code)]
    fn create_default_project(&self, project_id: &str) -> Project {
        Project {
            id: project_id.to_string(),
            name: format!("Project {}", project_id),
            key: project_id.to_uppercase(),
            description: "Default project".to_string(),
            owner: "system".to_string(),
            created_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
            settings: ProjectSettings {
                task_prefix: project_id.to_uppercase(),
                default_assignee: None,
                custom_fields: HashMap::new(),
                workflow_states: vec![
                    "todo".to_string(),
                    "in_progress".to_string(),
                    "in_review".to_string(),
                    "done".to_string(),
                ],
                issue_types: vec![
                    "story".to_string(),
                    "task".to_string(),
                    "bug".to_string(),
                    "epic".to_string(),
                ],
                priorities: vec![
                    "low".to_string(),
                    "medium".to_string(),
                    "high".to_string(),
                    "urgent".to_string(),
                ],
            },
            members: vec![],
            sprints: vec![],
        }
    }
}

#[tool(tool_box)]
impl ProjectManagementServer {
    /// Create a new project
    #[tool(description = "Create a new project")]
    async fn pm_create_project(
        &self,
        #[tool(param)]
        #[schemars(description = "Project name")]
        name: String,
        #[tool(param)]
        #[schemars(description = "Project key (e.g., PROJ)")]
        key: String,
        #[tool(param)]
        #[schemars(description = "Project description")]
        description: String,
        #[tool(param)]
        #[schemars(description = "Project owner")]
        owner: String,
    ) -> String {
        let project_id = Uuid::new_v4().to_string();
        let _project = Project {
            id: project_id.clone(),
            name: name.clone(),
            key: key.clone(),
            description,
            owner,
            created_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
            settings: ProjectSettings {
                task_prefix: key,
                default_assignee: None,
                custom_fields: HashMap::new(),
                workflow_states: vec![
                    "todo".to_string(),
                    "in_progress".to_string(),
                    "done".to_string(),
                ],
                issue_types: vec!["story".to_string(), "task".to_string(), "bug".to_string()],
                priorities: vec![
                    "low".to_string(),
                    "medium".to_string(),
                    "high".to_string(),
                    "urgent".to_string(),
                ],
            },
            members: vec![],
            sprints: vec![],
        };

        info!("Created project: {} ({})", name, project_id);
        format!("✅ Created project '{}' with ID: {}", name, project_id)
    }

    /// List all projects
    #[tool(description = "List all projects")]
    async fn pm_list_projects(&self) -> String {
        info!("Listing all projects");
        "📋 Available projects:\n- Default Project (default)\n- Sample Project (sample)".to_string()
    }

    /// Get project details
    #[tool(description = "Get project details")]
    async fn pm_get_project(&self) -> String {
        info!("Getting project details for current project");
        "📁 Project Details:\nName: Sample Project\nKey: SAMPLE\nStatus: Active\nTasks: 5\nDocuments: 3".to_string()
    }

    /// Create a new task in the current project
    #[tool(description = "Create a new task in the current project")]
    async fn pm_create_task(
        &self,
        #[tool(param)]
        #[schemars(description = "Task title")]
        title: String,
        #[tool(param)]
        #[schemars(description = "Task description")]
        _description: String,
        #[tool(param)]
        #[schemars(description = "Task priority (low, medium, high, urgent)")]
        priority: String,
        #[tool(param)]
        #[schemars(description = "Task type (story, task, bug, epic)")]
        task_type: String,
        #[tool(param)]
        #[schemars(description = "Assignee (optional)")]
        assignee: Option<String>,
        #[tool(param)]
        #[schemars(description = "Due date (YYYY-MM-DD, optional)")]
        _due_date: Option<String>,
        #[tool(param)]
        #[schemars(description = "Time estimate in hours (optional)")]
        _estimate: Option<u32>,
        #[tool(param)]
        #[schemars(description = "Labels (comma-separated, optional)")]
        labels: Option<String>,
    ) -> String {
        let task_id = Uuid::new_v4().to_string();
        let task_number = 1; // Would increment based on project

        let _labels_vec = labels
            .map(|l| l.split(',').map(|s| s.trim().to_string()).collect())
            .unwrap_or_else(Vec::new);

        info!("Created task: {} ({})", title, task_id);
        format!(
            "✅ Created task '{}' (TASK-{})\nID: {}\nPriority: {}\nType: {}\nAssignee: {}",
            title,
            task_number,
            task_id,
            priority,
            task_type,
            assignee.unwrap_or("Unassigned".to_string())
        )
    }

    /// List tasks in the current project
    #[tool(description = "List tasks in the current project")]
    async fn pm_list_tasks(
        &self,
        #[tool(param)]
        #[schemars(description = "Filter by status (optional)")]
        status_filter: Option<String>,
        #[tool(param)]
        #[schemars(description = "Filter by assignee (optional)")]
        assignee_filter: Option<String>,
        #[tool(param)]
        #[schemars(description = "Filter by priority (optional)")]
        priority_filter: Option<String>,
    ) -> String {
        info!("Listing tasks with filters");
        let mut result = "📋 Tasks in current project:\n".to_string();
        
        result.push_str("• TASK-1: Fix login bug [HIGH] - In Progress (john@example.com)\n");
        result.push_str("• TASK-2: Add user dashboard [MEDIUM] - Todo (jane@example.com)\n");
        result.push_str("• TASK-3: Update documentation [LOW] - Done (doc@example.com)\n");

        if let Some(status) = status_filter {
            result.push_str(&format!("\n🔍 Filtered by status: {}", status));
        }
        if let Some(assignee) = assignee_filter {
            result.push_str(&format!("\n👤 Filtered by assignee: {}", assignee));
        }
        if let Some(priority) = priority_filter {
            result.push_str(&format!("\n⚡ Filtered by priority: {}", priority));
        }

        result
    }

    /// Get task details
    #[tool(description = "Get task details")]
    async fn pm_get_task(
        &self,
        #[tool(param)]
        #[schemars(description = "Task ID")]
        task_id: String,
    ) -> String {
        info!("Getting task details for: {}", task_id);
        format!(
            "📝 Task Details:\nID: {}\nTitle: Fix login bug\nStatus: In Progress\nPriority: High\nAssignee: john@example.com\nCreated: 2024-01-15\nDue: 2024-01-20\nDescription: Users are unable to log in with their credentials",
            task_id
        )
    }

    /// Update task details
    #[tool(description = "Update task details")]
    async fn pm_update_task(
        &self,
        #[tool(param)]
        #[schemars(description = "Task ID")]
        task_id: String,
        #[tool(param)]
        #[schemars(description = "New title (optional)")]
        title: Option<String>,
        #[tool(param)]
        #[schemars(description = "New status (optional)")]
        status: Option<String>,
        #[tool(param)]
        #[schemars(description = "New priority (optional)")]
        priority: Option<String>,
        #[tool(param)]
        #[schemars(description = "New assignee (optional)")]
        assignee: Option<String>,
    ) -> String {
        info!("Updating task: {}", task_id);
        let mut updates = vec![];
        
        if let Some(t) = title {
            updates.push(format!("Title: {}", t));
        }
        if let Some(s) = status {
            updates.push(format!("Status: {}", s));
        }
        if let Some(p) = priority {
            updates.push(format!("Priority: {}", p));
        }
        if let Some(a) = assignee {
            updates.push(format!("Assignee: {}", a));
        }

        format!("✅ Updated task {}\nChanges: {}", task_id, updates.join(", "))
    }

    /// Delete a task
    #[tool(description = "Delete a task")]
    async fn pm_delete_task(
        &self,
        #[tool(param)]
        #[schemars(description = "Task ID")]
        task_id: String,
    ) -> String {
        info!("Deleting task: {}", task_id);
        format!("🗑️ Deleted task: {}", task_id)
    }

    /// Move task to a sprint
    #[tool(description = "Move task to a sprint")]
    async fn pm_move_task_to_sprint(
        &self,
        #[tool(param)]
        #[schemars(description = "Task ID")]
        task_id: String,
        #[tool(param)]
        #[schemars(description = "Sprint ID (leave empty to remove from sprint)")]
        sprint_id: Option<String>,
    ) -> String {
        match sprint_id {
            Some(sid) => {
                info!("Moving task {} to sprint {}", task_id, sid);
                format!("🔄 Moved task {} to sprint {}", task_id, sid)
            }
            None => {
                info!("Removing task {} from sprint", task_id);
                format!("🔄 Removed task {} from sprint", task_id)
            }
        }
    }

    /// Add comment to a task
    #[tool(description = "Add comment to a task")]
    async fn pm_add_task_comment(
        &self,
        #[tool(param)]
        #[schemars(description = "Task ID")]
        task_id: String,
        #[tool(param)]
        #[schemars(description = "Comment content")]
        content: String,
        #[tool(param)]
        #[schemars(description = "Author")]
        author: String,
    ) -> String {
        info!("Adding comment to task: {}", task_id);
        format!("💬 Added comment to task {}\nAuthor: {}\nContent: {}", task_id, author, content)
    }

    /// Create a new document in the current project
    #[tool(description = "Create a new document in the current project")]
    async fn pm_create_document(
        &self,
        #[tool(param)]
        #[schemars(description = "Document title")]
        title: String,
        #[tool(param)]
        #[schemars(description = "Document template (page, blog, requirements, api_doc, meeting, troubleshooting, user_guide, technical_spec)")]
        template: String,
        #[tool(param)]
        #[schemars(description = "Document content (markdown, optional)")]
        _content: Option<String>,
        #[tool(param)]
        #[schemars(description = "Tags (comma-separated, optional)")]
        tags: Option<String>,
    ) -> String {
        let document_id = Uuid::new_v4().to_string();
        
        let tags_vec = tags
            .map(|t| t.split(',').map(|s| s.trim().to_string()).collect())
            .unwrap_or_else(Vec::new);

        info!("Created document: {} ({})", title, document_id);
        format!(
            "📄 Created document '{}'\nID: {}\nTemplate: {}\nTags: {:?}",
            title, document_id, template, tags_vec
        )
    }

    /// List documents in the current project
    #[tool(description = "List documents in the current project")]
    async fn pm_list_documents(
        &self,
        #[tool(param)]
        #[schemars(description = "Filter by status (optional)")]
        status_filter: Option<String>,
        #[tool(param)]
        #[schemars(description = "Filter by template (optional)")]
        template_filter: Option<String>,
        #[tool(param)]
        #[schemars(description = "Filter by tags (comma-separated, optional)")]
        tags_filter: Option<String>,
    ) -> String {
        info!("Listing documents with filters");
        let mut result = "📚 Documents in current project:\n".to_string();
        
        result.push_str("• Project Requirements [REQUIREMENTS] - Published\n");
        result.push_str("• API Documentation [API_DOC] - Draft\n");
        result.push_str("• User Guide [USER_GUIDE] - Published\n");
        result.push_str("• Meeting Notes 2024-01-15 [MEETING] - Published\n");

        if let Some(status) = status_filter {
            result.push_str(&format!("\n🔍 Filtered by status: {}", status));
        }
        if let Some(template) = template_filter {
            result.push_str(&format!("\n📋 Filtered by template: {}", template));
        }
        if let Some(tags) = tags_filter {
            result.push_str(&format!("\n🏷️ Filtered by tags: {}", tags));
        }

        result
    }

    /// Get document details
    #[tool(description = "Get document details")]
    async fn pm_get_document(
        &self,
        #[tool(param)]
        #[schemars(description = "Document ID")]
        document_id: String,
    ) -> String {
        info!("Getting document details for: {}", document_id);
        format!(
            "📄 Document Details:\nID: {}\nTitle: Project Requirements\nTemplate: Requirements\nStatus: Published\nAuthor: product@example.com\nCreated: 2024-01-10\nTags: requirements, specs, v1.0\n\nContent Preview:\n# Project Requirements\n\n## Overview\nThis document outlines the requirements for...",
            document_id
        )
    }

    /// Update document details
    #[tool(description = "Update document details")]
    async fn pm_update_document(
        &self,
        #[tool(param)]
        #[schemars(description = "Document ID")]
        document_id: String,
        #[tool(param)]
        #[schemars(description = "New title (optional)")]
        title: Option<String>,
        #[tool(param)]
        #[schemars(description = "New content (optional)")]
        content: Option<String>,
        #[tool(param)]
        #[schemars(description = "New status (optional)")]
        status: Option<String>,
        #[tool(param)]
        #[schemars(description = "New tags (comma-separated, optional)")]
        tags: Option<String>,
    ) -> String {
        info!("Updating document: {}", document_id);
        let mut updates = vec![];
        
        if let Some(t) = title {
            updates.push(format!("Title: {}", t));
        }
        if let Some(_c) = content {
            updates.push("Content: Updated".to_string());
        }
        if let Some(s) = status {
            updates.push(format!("Status: {}", s));
        }
        if let Some(t) = tags {
            updates.push(format!("Tags: {}", t));
        }

        format!("✅ Updated document {}\nChanges: {}", document_id, updates.join(", "))
    }

    /// Delete a document
    #[tool(description = "Delete a document")]
    async fn pm_delete_document(
        &self,
        #[tool(param)]
        #[schemars(description = "Document ID")]
        document_id: String,
    ) -> String {
        info!("Deleting document: {}", document_id);
        format!("🗑️ Deleted document: {}", document_id)
    }

    /// Render document to HTML
    #[tool(description = "Render document to HTML")]
    async fn pm_render_document(
        &self,
        #[tool(param)]
        #[schemars(description = "Document ID")]
        document_id: String,
    ) -> String {
        info!("Rendering document: {}", document_id);
        format!("🎨 Rendered document {} to HTML\nOutput: <h1>Project Requirements</h1><p>This document outlines...</p>", document_id)
    }

    /// Create a new sprint in the current project
    #[tool(description = "Create a new sprint in the current project")]
    async fn pm_create_sprint(
        &self,
        #[tool(param)]
        #[schemars(description = "Sprint name")]
        name: String,
        #[tool(param)]
        #[schemars(description = "Start date (YYYY-MM-DD)")]
        start_date: String,
        #[tool(param)]
        #[schemars(description = "End date (YYYY-MM-DD)")]
        end_date: String,
        #[tool(param)]
        #[schemars(description = "Sprint goal")]
        goal: String,
    ) -> String {
        let sprint_id = Uuid::new_v4().to_string();

        info!("Created sprint: {} ({})", name, sprint_id);
        format!(
            "🏃 Created sprint '{}'\nID: {}\nDuration: {} to {}\nGoal: {}",
            name, sprint_id, start_date, end_date, goal
        )
    }

    /// List sprints in the current project
    #[tool(description = "List sprints in the current project")]
    async fn pm_list_sprints(&self) -> String {
        info!("Listing sprints");
        "🏃 Sprints in current project:\n• Sprint 1 [COMPLETED] - 2024-01-01 to 2024-01-14\n• Sprint 2 [ACTIVE] - 2024-01-15 to 2024-01-28\n• Sprint 3 [PLANNED] - 2024-01-29 to 2024-02-11".to_string()
    }

    /// Get sprint details
    #[tool(description = "Get sprint details")]
    async fn pm_get_sprint(
        &self,
        #[tool(param)]
        #[schemars(description = "Sprint ID")]
        sprint_id: String,
    ) -> String {
        info!("Getting sprint details for: {}", sprint_id);
        format!(
            "🏃 Sprint Details:\nID: {}\nName: Sprint 2\nStatus: Active\nDuration: 2024-01-15 to 2024-01-28\nGoal: Complete user authentication and dashboard\nTasks: 8 total, 3 completed, 5 in progress",
            sprint_id
        )
    }

    /// Start a sprint
    #[tool(description = "Start a sprint")]
    async fn pm_start_sprint(
        &self,
        #[tool(param)]
        #[schemars(description = "Sprint ID")]
        sprint_id: String,
    ) -> String {
        info!("Starting sprint: {}", sprint_id);
        format!("🚀 Started sprint: {}", sprint_id)
    }

    /// Complete a sprint
    #[tool(description = "Complete a sprint")]
    async fn pm_complete_sprint(
        &self,
        #[tool(param)]
        #[schemars(description = "Sprint ID")]
        sprint_id: String,
    ) -> String {
        info!("Completing sprint: {}", sprint_id);
        format!("🎯 Completed sprint: {}", sprint_id)
    }

    /// Search tasks in the current project
    #[tool(description = "Search tasks in the current project")]
    async fn pm_search_tasks(
        &self,
        #[tool(param)]
        #[schemars(description = "Search query")]
        query: String,
    ) -> String {
        info!("Searching tasks for: {}", query);
        format!("🔍 Search results for '{}' in tasks:\n• TASK-1: Fix login bug (matches: 'login')\n• TASK-5: Login page redesign (matches: 'login')", query)
    }

    /// Search documents in the current project
    #[tool(description = "Search documents in the current project")]
    async fn pm_search_documents(
        &self,
        #[tool(param)]
        #[schemars(description = "Search query")]
        query: String,
    ) -> String {
        info!("Searching documents for: {}", query);
        format!("🔍 Search results for '{}' in documents:\n• API Documentation (matches in title)\n• Technical Specifications (matches in content)", query)
    }

    /// Search all items (tasks and documents) in the current project
    #[tool(description = "Search all items (tasks and documents) in the current project")]
    async fn pm_search_all(
        &self,
        #[tool(param)]
        #[schemars(description = "Search query")]
        query: String,
    ) -> String {
        info!("Searching all items for: {}", query);
        format!("🔍 Search results for '{}':\n\nTasks:\n• TASK-1: Fix login bug\n• TASK-5: Login page redesign\n\nDocuments:\n• API Documentation\n• Technical Specifications\n\nTotal: 4 results", query)
    }

    /// Get project statistics
    #[tool(description = "Get project statistics")]
    async fn pm_get_project_statistics(&self) -> String {
        info!("Getting project statistics");
        "📊 Project Statistics:\n• Total Tasks: 12\n• Completed: 5 (42%)\n• In Progress: 4 (33%)\n• Todo: 3 (25%)\n• Total Documents: 8\n• Active Sprints: 1\n• Team Members: 6".to_string()
    }
}

impl ServerHandler for ProjectManagementServer {
    fn get_info(&self) -> ServerInfo {
        ServerInfo {
            instructions: Some("MCP server for project management operations including tasks, documents, and sprints with project context awareness".to_string()),
            capabilities: ServerCapabilities::builder().enable_tools().build(),
            ..Default::default()
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    info!("Starting Code Pilot Project Management MCP Server");

    // Create the service
    let service = ProjectManagementServer::new();

    // Create stdio transport
    let transport = (stdin(), stdout());

    // Start the server
    let server = service.serve(transport).await?;

    info!("MCP Server started and listening on stdio");

    // Wait for server to finish
    let quit_reason = server.waiting().await?;
    info!("MCP Server shutting down: {:?}", quit_reason);

    Ok(())
}