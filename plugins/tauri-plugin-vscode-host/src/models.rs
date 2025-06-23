use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
// use uuid::Uuid; // TODO: Enable when needed
use chrono::{DateTime, Utc};

/// Configuration for an extension host instance
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionHostConfig {
    pub workspace_path: String,
    pub extensions_dir: PathBuf,
    pub node_path: Option<PathBuf>,
    pub enable_debugging: bool,
    pub port: Option<u16>,
    pub memory_limit: Option<usize>,
    pub timeout: Option<u64>,
    pub environment: Option<HashMap<String, String>>,
}

/// Status of an extension host
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ExtensionHostStatus {
    Initializing,
    Running,
    Stopped,
    Failed(String),
    Restarting,
}

/// Extension metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Extension {
    pub id: String,
    pub name: String,
    pub version: String,
    pub publisher: String,
    pub display_name: String,
    pub description: Option<String>,
    pub categories: Vec<String>,
    pub activation_events: Vec<String>,
    pub contributes: Option<serde_json::Value>,
    pub engines: HashMap<String, String>,
    pub main: Option<String>,
    pub dependencies: Option<HashMap<String, String>>,
    pub enabled: bool,
}

/// Extension host instance information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionHostInfo {
    pub id: String,
    pub workspace_id: String,
    pub workspace_path: String,
    pub status: ExtensionHostStatus,
    pub loaded_extensions: Vec<Extension>,
    pub api_version: String,
    pub node_version: String,
    pub started_at: Option<DateTime<Utc>>,
    pub memory_usage: Option<usize>,
    pub cpu_usage: Option<f32>,
}

/// Language server configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LanguageServerConfig {
    pub id: String,
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub file_patterns: Vec<String>,
    pub root_patterns: Vec<String>,
    pub initialization_options: Option<serde_json::Value>,
    pub settings: Option<serde_json::Value>,
    pub environment: Option<HashMap<String, String>>,
}

/// Language server instance information
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LanguageServerInfo {
    pub id: String,
    pub name: String,
    pub status: LanguageServerStatus,
    pub capabilities: Option<lsp_types::ServerCapabilities>,
    pub workspace_folders: Vec<String>,
    pub started_at: Option<DateTime<Utc>>,
}

/// Language server status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum LanguageServerStatus {
    Starting,
    Running,
    Stopped,
    Failed(String),
    Restarting,
}

/// Extension source for installation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum ExtensionSource {
    #[serde(rename = "openVsx")]
    OpenVsx {
        extension_id: String,
        version: Option<String>,
    },
    #[serde(rename = "github")]
    GitHub {
        owner: String,
        repo: String,
        release: Option<String>,
    },
    #[serde(rename = "local")]
    Local { path: PathBuf },
    #[serde(rename = "url")]
    Url { url: String },
}

/// Extension installation result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionInstallResult {
    pub extension_id: String,
    pub version: String,
    pub installed_path: PathBuf,
    pub dependencies_installed: Vec<String>,
}

/// Command to execute in extension host
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionCommand {
    pub command: String,
    pub args: Vec<serde_json::Value>,
}

/// Extension host message types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]
pub enum ExtensionHostMessage {
    #[serde(rename = "initialized")]
    Initialized {
        api_version: String,
        node_version: String,
    },
    #[serde(rename = "extensionActivated")]
    ExtensionActivated {
        extension_id: String,
        activation_time: u64,
    },
    #[serde(rename = "extensionDeactivated")]
    ExtensionDeactivated { extension_id: String },
    #[serde(rename = "log")]
    Log {
        level: String,
        message: String,
        source: Option<String>,
    },
    #[serde(rename = "error")]
    Error {
        message: String,
        stack: Option<String>,
        source: Option<String>,
    },
    #[serde(rename = "telemetry")]
    Telemetry {
        event_name: String,
        properties: HashMap<String, serde_json::Value>,
    },
}

/// VSCode API request/response for IPC
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiRequest {
    pub id: String,
    pub method: String,
    pub params: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse {
    pub id: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<ApiError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

/// Extension search query
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionSearchQuery {
    pub query: String,
    pub category: Option<String>,
    pub sort_by: Option<ExtensionSortBy>,
    pub offset: Option<usize>,
    pub limit: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ExtensionSortBy {
    Relevance,
    Downloads,
    Rating,
    Name,
    PublishedDate,
}

/// Extension search result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionSearchResult {
    pub extensions: Vec<ExtensionInfo>,
    pub total: usize,
    pub offset: usize,
}

/// Extension information from registry
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionInfo {
    pub id: String,
    pub name: String,
    pub display_name: String,
    pub publisher: String,
    pub version: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub categories: Vec<String>,
    pub tags: Vec<String>,
    pub downloads: Option<u64>,
    pub rating: Option<f32>,
    pub install_count: Option<u64>,
}

/// Create extension host request
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateExtensionHostRequest {
    pub workspace_path: String,
    pub extensions: Vec<String>,
    pub config: Option<ExtensionHostConfig>,
}

/// Start language server request
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartLanguageServerRequest {
    pub config: LanguageServerConfig,
    pub workspace_folders: Vec<String>,
}

impl Default for ExtensionHostConfig {
    fn default() -> Self {
        Self {
            workspace_path: String::new(),
            extensions_dir: directories::BaseDirs::new()
                .map(|dirs| dirs.data_dir().join("code-pilot-studio").join("extensions"))
                .unwrap_or_else(|| PathBuf::from("./extensions")),
            node_path: None,
            enable_debugging: false,
            port: None,
            memory_limit: Some(512 * 1024 * 1024), // 512MB default
            timeout: Some(30000), // 30 seconds
            environment: None,
        }
    }
}