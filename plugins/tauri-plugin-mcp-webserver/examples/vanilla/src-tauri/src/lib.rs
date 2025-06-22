#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_mcp_webserver::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
