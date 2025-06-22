const COMMANDS: &[&str] = &[
    "start_server",
    "stop_server",
    "list_instances",
    "get_instance",
    "call_tool",
    "get_tools",
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
