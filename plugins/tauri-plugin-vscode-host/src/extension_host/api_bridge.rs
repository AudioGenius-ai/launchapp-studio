use crate::error::{Error, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

/// VSCode API namespace definitions
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VsCodeApi {
    pub window: WindowApi,
    pub workspace: WorkspaceApi,
    pub languages: LanguagesApi,
    pub commands: CommandsApi,
}

/// Window API namespace
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowApi {
    pub show_information_message: bool,
    pub show_error_message: bool,
    pub show_warning_message: bool,
    pub create_output_channel: bool,
    pub create_terminal: bool,
    pub create_webview_panel: bool,
}

/// Workspace API namespace
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceApi {
    pub get_configuration: bool,
    pub on_did_change_configuration: bool,
    pub find_files: bool,
    pub open_text_document: bool,
    pub on_did_change_text_document: bool,
    pub workspace_folders: bool,
}

/// Languages API namespace
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LanguagesApi {
    pub register_completion_item_provider: bool,
    pub register_hover_provider: bool,
    pub register_definition_provider: bool,
    pub register_reference_provider: bool,
    pub register_document_symbol_provider: bool,
    pub set_diagnostics: bool,
}

/// Commands API namespace
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandsApi {
    pub register_command: bool,
    pub execute_command: bool,
    pub get_commands: bool,
}

/// API Bridge for translating between VSCode API and our implementation
pub struct ApiBridge {
    /// Registered API handlers
    handlers: HashMap<String, Box<dyn ApiHandler>>,
}

/// Trait for API method handlers
pub trait ApiHandler: Send + Sync {
    fn handle(&self, params: Value) -> Result<Value>;
}

impl ApiBridge {
    /// Create a new API bridge
    pub fn new() -> Self {
        let mut bridge = Self {
            handlers: HashMap::new(),
        };
        
        // Register default handlers
        bridge.register_default_handlers();
        
        bridge
    }
    
    /// Register default API handlers
    fn register_default_handlers(&mut self) {
        // Window API
        self.register_handler("window.showInformationMessage", ShowMessageHandler {
            level: "info".to_string(),
        });
        self.register_handler("window.showErrorMessage", ShowMessageHandler {
            level: "error".to_string(),
        });
        self.register_handler("window.showWarningMessage", ShowMessageHandler {
            level: "warning".to_string(),
        });
        
        // Workspace API
        self.register_handler("workspace.getConfiguration", GetConfigurationHandler);
        
        // Commands API
        self.register_handler("commands.executeCommand", ExecuteCommandHandler);
    }
    
    /// Register an API handler
    pub fn register_handler<H>(&mut self, method: &str, handler: H)
    where
        H: ApiHandler + 'static,
    {
        self.handlers.insert(method.to_string(), Box::new(handler));
    }
    
    /// Handle an API call
    pub fn handle_api_call(&self, method: &str, params: Value) -> Result<Value> {
        if let Some(handler) = self.handlers.get(method) {
            handler.handle(params)
        } else {
            Err(Error::ApiError(format!("Unknown API method: {}", method)))
        }
    }
    
    /// Get supported API methods
    pub fn get_supported_methods(&self) -> Vec<String> {
        self.handlers.keys().cloned().collect()
    }
}

// Example API handlers

struct ShowMessageHandler {
    level: String,
}

impl ApiHandler for ShowMessageHandler {
    fn handle(&self, params: Value) -> Result<Value> {
        // Extract message from params
        let message = params.get("message")
            .and_then(|v| v.as_str())
            .ok_or_else(|| Error::ApiError("Missing message parameter".to_string()))?;
        
        // TODO: Forward to UI
        Ok(serde_json::json!({
            "action": "showMessage",
            "level": self.level,
            "message": message,
        }))
    }
}

struct GetConfigurationHandler;

impl ApiHandler for GetConfigurationHandler {
    fn handle(&self, params: Value) -> Result<Value> {
        let section = params.get("section")
            .and_then(|v| v.as_str());
        
        // TODO: Get actual configuration
        Ok(serde_json::json!({
            "section": section,
            "value": {}
        }))
    }
}

struct ExecuteCommandHandler;

impl ApiHandler for ExecuteCommandHandler {
    fn handle(&self, params: Value) -> Result<Value> {
        let command = params.get("command")
            .and_then(|v| v.as_str())
            .ok_or_else(|| Error::ApiError("Missing command parameter".to_string()))?;
        
        let args = params.get("args");
        
        // TODO: Execute command
        Ok(serde_json::json!({
            "command": command,
            "args": args,
            "result": null,
        }))
    }
}

/// Message types for UI communication
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum UiMessage {
    ShowMessage {
        level: String,
        message: String,
        actions: Option<Vec<String>>,
    },
    ShowInputBox {
        prompt: String,
        placeholder: Option<String>,
        value: Option<String>,
        password: bool,
    },
    ShowQuickPick {
        items: Vec<QuickPickItem>,
        placeholder: Option<String>,
        can_pick_many: bool,
    },
    CreateOutputChannel {
        name: String,
    },
    AppendToOutputChannel {
        channel: String,
        text: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuickPickItem {
    pub label: String,
    pub description: Option<String>,
    pub detail: Option<String>,
    pub picked: Option<bool>,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_api_bridge() {
        let bridge = ApiBridge::new();
        
        // Test show message
        let result = bridge.handle_api_call(
            "window.showInformationMessage",
            serde_json::json!({
                "message": "Hello, world!"
            })
        ).unwrap();
        
        assert_eq!(result["level"], "info");
        assert_eq!(result["message"], "Hello, world!");
    }
}