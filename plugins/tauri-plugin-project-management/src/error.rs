use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error, Serialize, Deserialize)]
pub enum ProjectManagementError {
    #[error("Project not found: {id}")]
    ProjectNotFound { id: String },

    #[error("Task not found: {id}")]
    TaskNotFound { id: String },

    #[error("Document not found: {id}")]
    DocumentNotFound { id: String },

    #[error("Sprint not found: {id}")]
    SprintNotFound { id: String },

    #[error("Invalid project key: {key}. Key must be 2-10 uppercase letters")]
    InvalidProjectKey { key: String },

    #[error("Project key already exists: {key}")]
    ProjectKeyExists { key: String },

    #[error("Invalid task status transition from {from} to {to}")]
    InvalidStatusTransition { from: String, to: String },

    #[error("User not authorized for project: {project_id}")]
    Unauthorized { project_id: String },

    #[error("Invalid permission level: {permission}")]
    InvalidPermission { permission: String },

    #[error("Cannot delete project with active tasks")]
    ProjectHasActiveTasks,

    #[error("Cannot delete sprint with assigned tasks")]
    SprintHasAssignedTasks,

    #[error("Sprint is already active")]
    SprintAlreadyActive,

    #[error("Sprint is already completed")]
    SprintAlreadyCompleted,

    #[error("Task cannot be assigned to inactive sprint")]
    InactiveSprint,

    #[error("Document template not supported: {template}")]
    UnsupportedDocumentTemplate { template: String },

    #[error("Invalid MDX content: {error}")]
    InvalidMdxContent { error: String },

    #[error("File size exceeds limit: {size} bytes")]
    FileSizeExceeded { size: u64 },

    #[error("Unsupported file type: {mime_type}")]
    UnsupportedFileType { mime_type: String },

    #[error("Storage error: {message}")]
    StorageError { message: String },

    #[error("Serialization error: {message}")]
    SerializationError { message: String },

    #[error("IO error: {message}")]
    IoError { message: String },

    #[error("Validation error: {field}: {message}")]
    ValidationError { field: String, message: String },

    #[error("Search index error: {message}")]
    SearchIndexError { message: String },

    #[error("Custom field validation error: {field_id}: {message}")]
    CustomFieldError { field_id: String, message: String },

    #[error("Bulk operation failed: {successful_count} succeeded, {failed_count} failed")]
    BulkOperationPartialFailure {
        successful_count: u32,
        failed_count: u32,
    },

    #[error("Export/Import error: {message}")]
    ExportImportError { message: String },

    #[error("Configuration error: {message}")]
    ConfigurationError { message: String },

    #[error("Internal error: {message}")]
    InternalError { message: String },
}

impl From<std::io::Error> for ProjectManagementError {
    fn from(err: std::io::Error) -> Self {
        ProjectManagementError::IoError {
            message: err.to_string(),
        }
    }
}

impl From<serde_json::Error> for ProjectManagementError {
    fn from(err: serde_json::Error) -> Self {
        ProjectManagementError::SerializationError {
            message: err.to_string(),
        }
    }
}

impl From<anyhow::Error> for ProjectManagementError {
    fn from(err: anyhow::Error) -> Self {
        ProjectManagementError::InternalError {
            message: err.to_string(),
        }
    }
}

// Result type alias for convenience
pub type Result<T> = std::result::Result<T, ProjectManagementError>;

// Error response for Tauri commands
#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: String,
    pub details: Option<serde_json::Value>,
}

impl From<ProjectManagementError> for ErrorResponse {
    fn from(err: ProjectManagementError) -> Self {
        let code = match &err {
            ProjectManagementError::ProjectNotFound { .. } => "PROJECT_NOT_FOUND",
            ProjectManagementError::TaskNotFound { .. } => "TASK_NOT_FOUND",
            ProjectManagementError::DocumentNotFound { .. } => "DOCUMENT_NOT_FOUND",
            ProjectManagementError::SprintNotFound { .. } => "SPRINT_NOT_FOUND",
            ProjectManagementError::InvalidProjectKey { .. } => "INVALID_PROJECT_KEY",
            ProjectManagementError::ProjectKeyExists { .. } => "PROJECT_KEY_EXISTS",
            ProjectManagementError::InvalidStatusTransition { .. } => "INVALID_STATUS_TRANSITION",
            ProjectManagementError::Unauthorized { .. } => "UNAUTHORIZED",
            ProjectManagementError::InvalidPermission { .. } => "INVALID_PERMISSION",
            ProjectManagementError::ProjectHasActiveTasks => "PROJECT_HAS_ACTIVE_TASKS",
            ProjectManagementError::SprintHasAssignedTasks => "SPRINT_HAS_ASSIGNED_TASKS",
            ProjectManagementError::SprintAlreadyActive => "SPRINT_ALREADY_ACTIVE",
            ProjectManagementError::SprintAlreadyCompleted => "SPRINT_ALREADY_COMPLETED",
            ProjectManagementError::InactiveSprint => "INACTIVE_SPRINT",
            ProjectManagementError::UnsupportedDocumentTemplate { .. } => "UNSUPPORTED_DOCUMENT_TEMPLATE",
            ProjectManagementError::InvalidMdxContent { .. } => "INVALID_MDX_CONTENT",
            ProjectManagementError::FileSizeExceeded { .. } => "FILE_SIZE_EXCEEDED",
            ProjectManagementError::UnsupportedFileType { .. } => "UNSUPPORTED_FILE_TYPE",
            ProjectManagementError::StorageError { .. } => "STORAGE_ERROR",
            ProjectManagementError::SerializationError { .. } => "SERIALIZATION_ERROR",
            ProjectManagementError::IoError { .. } => "IO_ERROR",
            ProjectManagementError::ValidationError { .. } => "VALIDATION_ERROR",
            ProjectManagementError::SearchIndexError { .. } => "SEARCH_INDEX_ERROR",
            ProjectManagementError::CustomFieldError { .. } => "CUSTOM_FIELD_ERROR",
            ProjectManagementError::BulkOperationPartialFailure { .. } => "BULK_OPERATION_PARTIAL_FAILURE",
            ProjectManagementError::ExportImportError { .. } => "EXPORT_IMPORT_ERROR",
            ProjectManagementError::ConfigurationError { .. } => "CONFIGURATION_ERROR",
            ProjectManagementError::InternalError { .. } => "INTERNAL_ERROR",
        };

        ErrorResponse {
            error: err.to_string(),
            code: code.to_string(),
            details: None,
        }
    }
}

// Validation helpers
pub fn validate_project_key(key: &str) -> Result<()> {
    if key.len() < 2 || key.len() > 10 {
        return Err(ProjectManagementError::InvalidProjectKey {
            key: key.to_string(),
        });
    }

    if !key.chars().all(|c| c.is_ascii_uppercase()) {
        return Err(ProjectManagementError::InvalidProjectKey {
            key: key.to_string(),
        });
    }

    Ok(())
}