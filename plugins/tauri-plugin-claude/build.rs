const COMMANDS: &[&str] = &[
    "create_session",
    "send_input",
    "list_sessions",
    "stop_session",
    "recover_sessions",
    "get_messages",
    "get_mcp_tools",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}