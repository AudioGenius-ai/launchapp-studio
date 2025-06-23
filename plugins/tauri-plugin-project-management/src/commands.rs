use crate::document_service::DocumentService;
use crate::error::{ProjectManagementError, Result};
use crate::models::*;
use crate::project_service::ProjectService;
use crate::task_service::TaskService;
use tauri::{command, AppHandle, Runtime};

// Project commands

#[command]
pub async fn create_project(
    app: AppHandle<R>,
    request: CreateProjectRequest,
) -> Result<Project> {
    let service = ProjectService::new(app);
    service.create_project(request).await
}

#[command]
pub async fn get_project(app: AppHandle<R>, project_id: String) -> Result<Project> {
    let service = ProjectService::new(app);
    service.get_project(&project_id).await
}

#[command]
pub async fn update_project(
    app: AppHandle<R>,
    project_id: String,
    request: UpdateProjectRequest,
) -> Result<Project> {
    let service = ProjectService::new(app);
    service.update_project(&project_id, request).await
}

#[command]
pub async fn delete_project(app: AppHandle<R>, project_id: String) -> Result<bool> {
    let service = ProjectService::new(app);
    service.delete_project(&project_id).await
}

#[command]
pub async fn list_projects(app: AppHandle<R>) -> Result<Vec<Project>> {
    let service = ProjectService::new(app);
    service.list_projects().await
}

#[command]
pub async fn add_project_member(
    app: AppHandle<R>,
    project_id: String,
    user_id: String,
    role: ProjectRole,
) -> Result<bool> {
    let service = ProjectService::new(app);
    service.add_project_member(&project_id, user_id, role).await
}

#[command]
pub async fn remove_project_member(
    app: AppHandle<R>,
    project_id: String,
    user_id: String,
) -> Result<bool> {
    let service = ProjectService::new(app);
    service.remove_project_member(&project_id, &user_id).await
}

#[command]
pub async fn get_project_settings(
    app: AppHandle<R>,
    project_id: String,
) -> Result<ProjectSettings> {
    let service = ProjectService::new(app);
    service.get_project_settings(&project_id).await
}

#[command]
pub async fn update_project_settings(
    app: AppHandle<R>,
    project_id: String,
    settings: ProjectSettings,
) -> Result<ProjectSettings> {
    let service = ProjectService::new(app);
    service.update_project_settings(&project_id, settings).await
}

// Task commands

#[command]
pub async fn create_task(
    app: AppHandle<R>,
    project_id: String,
    request: CreateTaskRequest,
) -> Result<Task> {
    let service = TaskService::new(app);
    service.create_task(&project_id, request).await
}

#[command]
pub async fn get_task(app: AppHandle<R>, project_id: String, task_id: String) -> Result<Task> {
    let service = TaskService::new(app);
    service.get_task(&project_id, &task_id).await
}

#[command]
pub async fn update_task(
    app: AppHandle<R>,
    project_id: String,
    task_id: String,
    request: UpdateTaskRequest,
) -> Result<Task> {
    let service = TaskService::new(app);
    service.update_task(&project_id, &task_id, request).await
}

#[command]
pub async fn delete_task(app: AppHandle<R>, project_id: String, task_id: String) -> Result<bool> {
    let service = TaskService::new(app);
    service.delete_task(&project_id, &task_id).await
}

#[command]
pub async fn list_tasks(
    app: AppHandle<R>,
    project_id: String,
    filter: Option<TaskFilter>,
) -> Result<Vec<Task>> {
    let service = TaskService::new(app);
    service.list_tasks(&project_id, filter).await
}

#[command]
pub async fn search_tasks(
    app: AppHandle<R>,
    project_id: String,
    query: String,
) -> Result<Vec<Task>> {
    let service = TaskService::new(app);
    service.search_tasks(&project_id, &query).await
}

#[command]
pub async fn move_task_to_sprint(
    app: AppHandle<R>,
    project_id: String,
    task_id: String,
    sprint_id: Option<String>,
) -> Result<bool> {
    let service = TaskService::new(app);
    service.move_task_to_sprint(&project_id, &task_id, sprint_id).await
}

#[command]
pub async fn add_task_comment(
    app: AppHandle<R>,
    project_id: String,
    task_id: String,
    content: String,
    author: String,
) -> Result<TaskComment> {
    let service = TaskService::new(app);
    service.add_task_comment(&project_id, &task_id, content, author).await
}

#[command]
pub async fn remove_task_comment(
    app: AppHandle<R>,
    project_id: String,
    task_id: String,
    comment_id: String,
) -> Result<bool> {
    let service = TaskService::new(app);
    service.remove_task_comment(&project_id, &task_id, &comment_id).await
}

#[command]
pub async fn upload_task_attachment(
    _app: AppHandle,
    _project_id: String,
    _task_id: String,
    _filename: String,
    _data: Vec<u8>,
) -> Result<TaskAttachment> {
    // TODO: Implement file upload logic
    Err(ProjectManagementError::InternalError {
        message: "Not implemented yet".to_string(),
    })
}

#[command]
pub async fn remove_task_attachment(
    _app: AppHandle,
    _project_id: String,
    _task_id: String,
    _attachment_id: String,
) -> Result<bool> {
    // TODO: Implement attachment removal
    Err(ProjectManagementError::InternalError {
        message: "Not implemented yet".to_string(),
    })
}

#[command]
pub async fn get_task_history(
    _app: AppHandle,
    _project_id: String,
    _task_id: String,
) -> Result<Vec<ActivityItem>> {
    // TODO: Implement task history tracking
    Ok(Vec::new())
}

#[command]
pub async fn bulk_update_tasks(
    app: AppHandle<R>,
    project_id: String,
    task_ids: Vec<String>,
    update: UpdateTaskRequest,
) -> Result<Vec<Task>> {
    let service = TaskService::new(app);
    let mut updated_tasks = Vec::new();
    
    for task_id in task_ids {
        match service.update_task(&project_id, &task_id, update.clone()).await {
            Ok(task) => updated_tasks.push(task),
            Err(_) => continue, // Skip failed updates
        }
    }
    
    Ok(updated_tasks)
}

// Sprint commands

#[command]
pub async fn create_sprint(
    app: AppHandle<R>,
    project_id: String,
    request: CreateSprintRequest,
) -> Result<Sprint> {
    let service = ProjectService::new(app);
    service.create_sprint(&project_id, request).await
}

#[command]
pub async fn get_sprint(
    app: AppHandle<R>,
    project_id: String,
    sprint_id: String,
) -> Result<Sprint> {
    let service = ProjectService::new(app);
    service.get_sprint(&project_id, &sprint_id).await
}

#[command]
pub async fn update_sprint(
    app: AppHandle<R>,
    project_id: String,
    sprint_id: String,
    request: UpdateSprintRequest,
) -> Result<Sprint> {
    let service = ProjectService::new(app);
    service.update_sprint(&project_id, &sprint_id, request).await
}

#[command]
pub async fn delete_sprint(
    app: AppHandle<R>,
    project_id: String,
    sprint_id: String,
) -> Result<bool> {
    let service = ProjectService::new(app);
    service.delete_sprint(&project_id, &sprint_id).await
}

#[command]
pub async fn list_sprints(app: AppHandle<R>, project_id: String) -> Result<Vec<Sprint>> {
    let service = ProjectService::new(app);
    service.list_sprints(&project_id).await
}

#[command]
pub async fn start_sprint(app: AppHandle<R>, project_id: String, sprint_id: String) -> Result<bool> {
    let service = ProjectService::new(app);
    service.start_sprint(&project_id, &sprint_id).await
}

#[command]
pub async fn complete_sprint(
    app: AppHandle<R>,
    project_id: String,
    sprint_id: String,
) -> Result<bool> {
    let service = ProjectService::new(app);
    service.complete_sprint(&project_id, &sprint_id).await
}

#[command]
pub async fn get_sprint_report(
    app: AppHandle<R>,
    project_id: String,
    sprint_id: String,
) -> Result<SprintReport> {
    let service = ProjectService::new(app);
    service.get_sprint_report(&project_id, &sprint_id).await
}

#[command]
pub async fn add_task_to_sprint(
    app: AppHandle<R>,
    project_id: String,
    task_id: String,
    sprint_id: String,
) -> Result<bool> {
    let service = TaskService::new(app);
    service.move_task_to_sprint(&project_id, &task_id, Some(sprint_id)).await
}

#[command]
pub async fn remove_task_from_sprint(
    app: AppHandle<R>,
    project_id: String,
    task_id: String,
) -> Result<bool> {
    let service = TaskService::new(app);
    service.move_task_to_sprint(&project_id, &task_id, None).await
}

// Document commands

#[command]
pub async fn create_document(
    app: AppHandle<R>,
    project_id: String,
    request: CreateDocumentRequest,
) -> Result<Document> {
    let service = DocumentService::new(app);
    service.create_document(&project_id, request).await
}

#[command]
pub async fn get_document(
    app: AppHandle<R>,
    project_id: String,
    document_id: String,
) -> Result<Document> {
    let service = DocumentService::new(app);
    service.get_document(&project_id, &document_id).await
}

#[command]
pub async fn update_document(
    app: AppHandle<R>,
    project_id: String,
    document_id: String,
    request: UpdateDocumentRequest,
) -> Result<Document> {
    let service = DocumentService::new(app);
    service.update_document(&project_id, &document_id, request).await
}

#[command]
pub async fn delete_document(
    app: AppHandle<R>,
    project_id: String,
    document_id: String,
) -> Result<bool> {
    let service = DocumentService::new(app);
    service.delete_document(&project_id, &document_id).await
}

#[command]
pub async fn list_documents(
    app: AppHandle<R>,
    project_id: String,
    filter: Option<DocumentFilter>,
) -> Result<Vec<Document>> {
    let service = DocumentService::new(app);
    service.list_documents(&project_id, filter).await
}

#[command]
pub async fn search_documents(
    app: AppHandle<R>,
    project_id: String,
    query: String,
) -> Result<Vec<Document>> {
    let service = DocumentService::new(app);
    service.search_documents(&project_id, &query).await
}

#[command]
pub async fn get_document_history(
    app: AppHandle<R>,
    project_id: String,
    document_id: String,
) -> Result<Vec<DocumentVersion>> {
    let service = DocumentService::new(app);
    service.get_document_history(&project_id, &document_id).await
}

#[command]
pub async fn render_document(
    app: AppHandle<R>,
    project_id: String,
    document_id: String,
) -> Result<String> {
    let service = DocumentService::new(app);
    service.render_document(&project_id, &document_id).await
}

#[command]
pub async fn create_document_from_template(
    app: AppHandle<R>,
    project_id: String,
    template: DocumentTemplate,
    title: String,
) -> Result<Document> {
    let service = DocumentService::new(app);
    service.create_document_from_template(&project_id, template, title).await
}

#[command]
pub async fn get_document_templates(app: AppHandle<R>) -> Result<Vec<DocumentTemplate>> {
    let service = DocumentService::new(app);
    service.get_document_templates().await
}

#[command]
pub async fn export_document(
    app: AppHandle<R>,
    project_id: String,
    document_id: String,
    format: String,
) -> Result<Vec<u8>> {
    let service = DocumentService::new(app);
    service.export_document(&project_id, &document_id, &format).await
}

// Utility commands

#[command]
pub async fn get_project_statistics(
    app: AppHandle<R>,
    project_id: String,
) -> Result<ProjectStatistics> {
    let service = ProjectService::new(app);
    service.get_project_statistics(&project_id).await
}

#[command]
pub async fn search_all(
    app: AppHandle<R>,
    project_id: String,
    query: String,
) -> Result<SearchResult> {
    let task_service = TaskService::new(app.clone());
    let document_service = DocumentService::new(app);

    let tasks = task_service.search_tasks(&project_id, &query).await?;
    let documents = document_service.search_documents(&project_id, &query).await?;

    let total_count = tasks.len() + documents.len();

    Ok(SearchResult {
        tasks,
        documents,
        total_count: total_count as u32,
    })
}

#[command]
pub async fn export_project(_app: AppHandle, _project_id: String) -> Result<Vec<u8>> {
    // TODO: Implement project export
    Err(ProjectManagementError::InternalError {
        message: "Not implemented yet".to_string(),
    })
}

#[command]
pub async fn import_project(_app: AppHandle, _data: Vec<u8>) -> Result<Project> {
    // TODO: Implement project import
    Err(ProjectManagementError::InternalError {
        message: "Not implemented yet".to_string(),
    })
}

#[command]
pub async fn validate_project_data(app: AppHandle<R>, project_id: String) -> Result<bool> {
    let service = ProjectService::new(app);
    let _project = service.get_project(&project_id).await?;
    // TODO: Implement validation logic
    Ok(true)
}