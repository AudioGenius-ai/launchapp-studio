mod commands;

use std::collections::HashMap;
use std::sync::Mutex;
use commands::project::{ProjectStore, Project};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ProjectStore(Mutex::new(HashMap::<String, Project>::new())))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::project::create_project,
            commands::project::update_project,
            commands::project::delete_project,
            commands::project::get_project,
            commands::project::list_projects,
            commands::project::open_project,
            commands::project::validate_project_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
