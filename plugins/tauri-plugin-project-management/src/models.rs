use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

// Core data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub key: String, // Short key for task prefixes (e.g., "PROJ")
    pub description: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub owner: String,
    pub members: Vec<ProjectMember>,
    pub settings: ProjectSettings,
    pub sprints: Vec<Sprint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMember {
    pub user_id: String,
    pub role: ProjectRole,
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectRole {
    Admin,
    Member,
    Viewer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub task_types: Vec<String>,
    pub statuses: Vec<String>,
    pub priorities: Vec<String>,
    pub workflow: HashMap<String, Vec<String>>,
    pub custom_fields: Vec<CustomField>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomField {
    pub id: String,
    pub name: String,
    pub field_type: CustomFieldType,
    pub required: bool,
    pub options: Option<Vec<String>>, // For select/multi-select fields
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CustomFieldType {
    Text,
    Number,
    Date,
    Select,
    MultiSelect,
    Boolean,
    Url,
    Email,
}

// Task-related structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    pub task_type: String,
    pub assignee: Option<String>,
    pub reporter: String,
    pub labels: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub due_date: Option<DateTime<Utc>>,
    pub estimate: Option<u32>, // hours
    pub time_spent: Option<u32>, // hours
    pub parent_id: Option<String>, // for subtasks
    pub sprint_id: Option<String>,
    pub project_id: String,
    pub comments: Vec<TaskComment>,
    pub attachments: Vec<TaskAttachment>,
    pub checklist: Vec<ChecklistItem>,
    pub custom_fields: HashMap<String, serde_json::Value>,
    pub task_number: u32, // Sequential number within project
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskComment {
    pub id: String,
    pub author: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskAttachment {
    pub id: String,
    pub filename: String,
    pub path: String,
    pub size: u64,
    pub mime_type: String,
    pub created_at: DateTime<Utc>,
    pub uploaded_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChecklistItem {
    pub id: String,
    pub text: String,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
}

// Sprint structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sprint {
    pub id: String,
    pub name: String,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub status: SprintStatus,
    pub goal: String,
    pub project_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SprintStatus {
    Planned,
    Active,
    Completed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SprintReport {
    pub sprint: Sprint,
    pub tasks_completed: Vec<Task>,
    pub tasks_incomplete: Vec<Task>,
    pub total_story_points: u32,
    pub completed_story_points: u32,
    pub burndown_data: Vec<BurndownPoint>,
    pub velocity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BurndownPoint {
    pub date: DateTime<Utc>,
    pub remaining_points: u32,
    pub ideal_remaining: u32,
}

// Document structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String, // MDX content
    pub author: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: Vec<String>,
    pub version: String,
    pub status: DocumentStatus,
    pub parent_id: Option<String>,
    pub template: DocumentTemplate,
    pub permissions: DocumentPermissions,
    pub project_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DocumentStatus {
    Draft,
    Review,
    Published,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DocumentTemplate {
    Page,
    Blog, 
    Requirements,
    ApiDoc,
    Meeting,
    Troubleshooting,
    UserGuide,
    TechnicalSpec,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentPermissions {
    pub read: Vec<String>, // user IDs or team IDs
    pub write: Vec<String>,
    pub admin: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentVersion {
    pub version: String,
    pub content: String,
    pub author: String,
    pub created_at: DateTime<Utc>,
    pub comment: Option<String>,
}

// Search and filter structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskFilter {
    pub status: Option<Vec<String>>,
    pub priority: Option<Vec<String>>,
    pub task_type: Option<Vec<String>>,
    pub assignee: Option<Vec<String>>,
    pub labels: Option<Vec<String>>,
    pub sprint_id: Option<String>,
    pub due_date_from: Option<DateTime<Utc>>,
    pub due_date_to: Option<DateTime<Utc>>,
    pub created_from: Option<DateTime<Utc>>,
    pub created_to: Option<DateTime<Utc>>,
    pub parent_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentFilter {
    pub status: Option<Vec<DocumentStatus>>,
    pub template: Option<Vec<DocumentTemplate>>,
    pub author: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub parent_id: Option<String>,
    pub created_from: Option<DateTime<Utc>>,
    pub created_to: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchQuery {
    pub query: String,
    pub task_filter: Option<TaskFilter>,
    pub document_filter: Option<DocumentFilter>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub tasks: Vec<Task>,
    pub documents: Vec<Document>,
    pub total_count: u32,
}

// Statistics and reporting

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectStatistics {
    pub project_id: String,
    pub total_tasks: u32,
    pub tasks_by_status: HashMap<String, u32>,
    pub tasks_by_priority: HashMap<String, u32>,
    pub tasks_by_type: HashMap<String, u32>,
    pub total_documents: u32,
    pub documents_by_status: HashMap<DocumentStatus, u32>,
    pub active_sprints: u32,
    pub completed_sprints: u32,
    pub total_members: u32,
    pub activity_summary: ActivitySummary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivitySummary {
    pub tasks_created_this_week: u32,
    pub tasks_completed_this_week: u32,
    pub documents_created_this_week: u32,
    pub documents_updated_this_week: u32,
    pub recent_activity: Vec<ActivityItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityItem {
    pub id: String,
    pub activity_type: ActivityType,
    pub user_id: String,
    pub entity_id: String,
    pub entity_type: EntityType,
    pub description: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActivityType {
    Created,
    Updated,
    Deleted,
    Assigned,
    Commented,
    StatusChanged,
    Uploaded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EntityType {
    Task,
    Document,
    Project,
    Sprint,
    Comment,
}

// Request/Response DTOs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub key: String,
    pub description: String,
    pub owner: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateProjectRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub settings: Option<ProjectSettings>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: String,
    pub task_type: String,
    pub priority: String,
    pub assignee: Option<String>,
    pub labels: Vec<String>,
    pub due_date: Option<DateTime<Utc>>,
    pub estimate: Option<u32>,
    pub parent_id: Option<String>,
    pub custom_fields: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTaskRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub assignee: Option<String>,
    pub labels: Option<Vec<String>>,
    pub due_date: Option<DateTime<Utc>>,
    pub estimate: Option<u32>,
    pub time_spent: Option<u32>,
    pub custom_fields: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDocumentRequest {
    pub title: String,
    pub content: String,
    pub template: DocumentTemplate,
    pub tags: Vec<String>,
    pub parent_id: Option<String>,
    pub permissions: DocumentPermissions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateDocumentRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
    pub status: Option<DocumentStatus>,
    pub permissions: Option<DocumentPermissions>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSprintRequest {
    pub name: String,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub goal: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSprintRequest {
    pub name: Option<String>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub goal: Option<String>,
    pub status: Option<SprintStatus>,
}

// Utility functions for model creation

impl Project {
    pub fn new(name: String, key: String, description: String, owner: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            key,
            description,
            created_at: now,
            updated_at: now,
            owner,
            members: vec![ProjectMember {
                user_id: owner.clone(),
                role: ProjectRole::Admin,
                joined_at: now,
            }],
            settings: ProjectSettings::default(),
            sprints: Vec::new(),
        }
    }
}

impl Task {
    pub fn new(
        project_id: String,
        title: String,
        description: String,
        task_type: String,
        priority: String,
        reporter: String,
        task_number: u32,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            description,
            status: "todo".to_string(), // Default status
            priority,
            task_type,
            assignee: None,
            reporter,
            labels: Vec::new(),
            created_at: now,
            updated_at: now,
            due_date: None,
            estimate: None,
            time_spent: None,
            parent_id: None,
            sprint_id: None,
            project_id,
            comments: Vec::new(),
            attachments: Vec::new(),
            checklist: Vec::new(),
            custom_fields: HashMap::new(),
            task_number,
        }
    }

    pub fn get_task_key(&self, project_key: &str) -> String {
        format!("{}-{}", project_key, self.task_number)
    }
}

impl Document {
    pub fn new(
        project_id: String,
        title: String,
        content: String,
        template: DocumentTemplate,
        author: String,
        permissions: DocumentPermissions,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            content,
            author,
            created_at: now,
            updated_at: now,
            tags: Vec::new(),
            version: "1.0.0".to_string(),
            status: DocumentStatus::Draft,
            parent_id: None,
            template,
            permissions,
            project_id,
        }
    }
}

impl Sprint {
    pub fn new(
        project_id: String,
        name: String,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
        goal: String,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            start_date,
            end_date,
            status: SprintStatus::Planned,
            goal,
            project_id,
            created_at: now,
            updated_at: now,
        }
    }
}

impl Default for ProjectSettings {
    fn default() -> Self {
        let mut workflow = HashMap::new();
        workflow.insert("todo".to_string(), vec!["in_progress".to_string()]);
        workflow.insert("in_progress".to_string(), vec!["done".to_string(), "blocked".to_string()]);
        workflow.insert("blocked".to_string(), vec!["todo".to_string(), "in_progress".to_string()]);
        workflow.insert("done".to_string(), vec![]);

        Self {
            task_types: vec![
                "story".to_string(),
                "bug".to_string(), 
                "task".to_string(),
                "epic".to_string(),
                "subtask".to_string(),
            ],
            statuses: vec![
                "todo".to_string(),
                "in_progress".to_string(),
                "done".to_string(),
                "blocked".to_string(),
            ],
            priorities: vec![
                "low".to_string(),
                "medium".to_string(),
                "high".to_string(),
                "urgent".to_string(),
            ],
            workflow,
            custom_fields: Vec::new(),
        }
    }
}