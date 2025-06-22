const COMMANDS: &[&str] = &[
    // Project commands
    "create_project",
    "get_project", 
    "update_project",
    "delete_project",
    "list_projects",
    "add_project_member",
    "remove_project_member",
    "get_project_settings",
    "update_project_settings",
    
    // Task commands
    "create_task",
    "get_task",
    "update_task", 
    "delete_task",
    "list_tasks",
    "search_tasks",
    "move_task_to_sprint",
    "add_task_comment",
    "remove_task_comment",
    "upload_task_attachment",
    "remove_task_attachment",
    "get_task_history",
    "bulk_update_tasks",
    
    // Sprint commands
    "create_sprint",
    "get_sprint",
    "update_sprint",
    "delete_sprint",
    "list_sprints",
    "start_sprint",
    "complete_sprint",
    "get_sprint_report",
    "add_task_to_sprint",
    "remove_task_from_sprint",
    
    // Document commands
    "create_document",
    "get_document",
    "update_document",
    "delete_document", 
    "list_documents",
    "search_documents",
    "get_document_history",
    "render_document",
    "create_document_from_template",
    "get_document_templates",
    "export_document",
    
    // Utility commands
    "get_project_statistics",
    "search_all",
    "export_project",
    "import_project",
    "validate_project_data",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}