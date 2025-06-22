use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

mod commands;
mod error;
mod models;
mod project_service;
mod storage_manager;
mod task_service;
mod document_service;
mod utils;

pub use error::*;
pub use models::*;

use commands::*;

/// Initialize the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R>
where
    R: Runtime,
{
    Builder::new("project-management")
        .invoke_handler(tauri::generate_handler![
            // Project commands
            create_project,
            get_project,
            update_project,
            delete_project,
            list_projects,
            add_project_member,
            remove_project_member,
            get_project_settings,
            update_project_settings,
            
            // Task commands
            create_task,
            get_task,
            update_task,
            delete_task,
            list_tasks,
            search_tasks,
            move_task_to_sprint,
            add_task_comment,
            remove_task_comment,
            upload_task_attachment,
            remove_task_attachment,
            get_task_history,
            bulk_update_tasks,
            
            // Sprint commands
            create_sprint,
            get_sprint,
            update_sprint,
            delete_sprint,
            list_sprints,
            start_sprint,
            complete_sprint,
            get_sprint_report,
            add_task_to_sprint,
            remove_task_from_sprint,
            
            // Document commands
            create_document,
            get_document,
            update_document,
            delete_document,
            list_documents,
            search_documents,
            get_document_history,
            render_document,
            create_document_from_template,
            get_document_templates,
            export_document,
            
            // Utility commands
            get_project_statistics,
            search_all,
            export_project,
            import_project,
            validate_project_data,
        ])
        .setup(|app, _api| {
            // Initialize any plugin state here
            log::info!("Project Management plugin initialized");
            Ok(())
        })
        .build()
}

// Re-export commonly used types
pub use crate::models::{
    Project, Task, Document, Sprint, ProjectRole, DocumentStatus, DocumentTemplate,
    TaskFilter, DocumentFilter, SearchQuery, SearchResult, ProjectStatistics,
    CreateProjectRequest, UpdateProjectRequest, CreateTaskRequest, UpdateTaskRequest,
    CreateDocumentRequest, UpdateDocumentRequest, CreateSprintRequest, UpdateSprintRequest,
};

pub use crate::error::{ProjectManagementError, Result, ErrorResponse};