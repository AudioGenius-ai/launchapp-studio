const COMMANDS: &[&str] = &[
    "create_terminal",
    "write_to_terminal", 
    "resize_terminal",
    "kill_terminal",
    "handle_terminal_command",
    "get_terminal",
    "list_terminals",
    "get_available_shells",
    "get_default_shell",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}