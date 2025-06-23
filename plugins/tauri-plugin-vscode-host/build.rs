const COMMANDS: &[&str] = &[
    "create_extension_host",
    "stop_extension_host",
    "list_extension_hosts",
    "get_extension_host_info",
    "execute_extension_command",
    "start_language_server",
    "stop_language_server",
    "list_language_servers",
    "search_extensions",
    "install_extension",
    "uninstall_extension",
    "list_installed_extensions",
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
