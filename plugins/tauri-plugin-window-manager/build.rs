const COMMANDS: &[&str] = &[
    "create_window",
    "close_window",
    "get_window",
    "list_windows",
    "focus_window",
    "minimize_window",
    "maximize_window",
    "unmaximize_window",
    "set_window_position",
    "set_window_size",
    "set_window_title",
    "send_message",
    "broadcast_message",
    "get_window_state",
    "update_window_info",
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
