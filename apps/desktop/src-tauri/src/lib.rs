mod commands;

use std::collections::HashMap;
use std::sync::Mutex;
use commands::project::{ProjectStore, Project};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ProjectStore(Mutex::new(HashMap::<String, Project>::new())))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::project::create_project,
            commands::project::update_project,
            commands::project::delete_project,
            commands::project::get_project,
            commands::project::list_projects,
            commands::project::open_project,
            commands::project::validate_project_path,
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
