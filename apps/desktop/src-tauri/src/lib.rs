mod commands;

use std::collections::HashMap;
use std::sync::Mutex;
use commands::project::{ProjectStore, Project};
use commands::startup::{FileWatcherState, PreferencesState, ThemeState};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ProjectStore(Mutex::new(HashMap::<String, Project>::new())))
        .manage(FileWatcherState(Mutex::new(HashMap::new())))
        .manage(PreferencesState(Mutex::new(HashMap::new())))
        .manage(ThemeState(Mutex::new("dark".to_string())))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_claude::init())
        .plugin(tauri_plugin_terminal::init())
        .plugin(tauri_plugin_window_manager::init())
        .plugin(tauri_plugin_storage::init())
        .plugin(tauri_plugin_git::init())
        .plugin(tauri_plugin_vscode_host::init())
        .invoke_handler(tauri::generate_handler![
            commands::project::create_project,
            commands::project::get_or_create_project_by_path,
            commands::project::update_project,
            commands::project::delete_project,
            commands::project::get_project,
            commands::project::list_projects,
            commands::project::open_project,
            commands::project::validate_project_path,
            commands::project::get_project_info,
            commands::filesystem::read_directory,
            commands::filesystem::get_home_dir,
            commands::filesystem::read_file,
            commands::filesystem::write_file,
            commands::filesystem::create_file,
            commands::filesystem::create_directory,
            commands::filesystem::delete_file,
            commands::filesystem::rename_file,
            commands::filesystem::copy_file,
            commands::filesystem::move_file,
            commands::filesystem::search_files,
            commands::filesystem::get_file_stats,
            commands::filesystem::path_exists,
            commands::filesystem::watch_directory,
            commands::filesystem::unwatch_directory,
            commands::settings::load_settings,
            commands::settings::save_settings,
            commands::settings::reset_settings,
            commands::settings::get_settings_file_path,
            commands::settings::export_settings,
            commands::settings::import_settings,
            commands::window::create_project_window,
            commands::window::close_window,
            commands::window::focus_window,
            commands::template_commands::get_templates,
            commands::template_commands::get_custom_templates,
            commands::template_commands::create_project_from_template,
            commands::template_commands::check_command_availability,
            commands::template_commands::check_prerequisite,
            commands::template_commands::execute_template_command,
            commands::template_commands::save_custom_template,
            commands::template_commands::remove_custom_template,
            commands::template_commands::import_template_from_url,
            commands::startup::initialize_file_watcher,
            commands::startup::initialize_project_service,
            commands::startup::initialize_theme_service,
            commands::startup::load_user_preferences,
            commands::startup::get_setting,
            commands::startup::check_for_updates,
            commands::startup::save_application_state,
            commands::startup::cleanup_connections,
            commands::startup::log_error,
        ])
        .setup(|app| {
            // Load projects from storage on startup
            let app_handle = app.handle().clone();
            
            tauri::async_runtime::spawn(async move {
                match commands::project_storage::load_projects(&app_handle).await {
                    Ok(projects) => {
                        let project_count = projects.len();
                        let store = app_handle.state::<ProjectStore>();
                        if let Ok(mut store_projects) = store.0.lock() {
                            *store_projects = projects;
                        }
                        println!("Loaded {} projects from storage", project_count);
                    }
                    Err(e) => {
                        eprintln!("Failed to load projects from storage: {}", e);
                    }
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
