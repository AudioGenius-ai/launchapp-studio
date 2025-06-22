const COMMANDS: &[&str] = &[
    "set_item",
    "get_item",
    "remove_item",
    "clear",
    "list_keys",
    "set_encrypted_item",
    "get_encrypted_item",
    "set_storage_path",
    "get_storage_path",
    "exists",
    "get_storage_info",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .global_api_script_path("./api-iife.js")
        .build();
}