use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Session status tracking
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum SessionStatus {
    Starting,
    Streaming,
    Idle,
    Completed,
    Failed(String),
}

/// Active Claude session
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeSession {
    pub id: String,
    pub workspace_path: String,
    pub log_file_path: PathBuf,
    pub pid: Option<u32>,
    pub created_at: u64, // Unix timestamp
    pub status: SessionStatus,
    pub last_activity: u64, // Unix timestamp
}

/// Persisted session for recovery
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistedClaudeSession {
    pub id: String,
    pub workspace_path: String,
    pub log_file_path: PathBuf,
    pub created_at: u64,
    pub last_activity: u64,
}

/// Claude message types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClaudeMessage {
    #[serde(rename = "system")]
    System {
        subtype: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        cwd: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        session_id: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        tools: Option<Vec<String>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        mcp_servers: Option<Vec<String>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        model: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        permission_mode: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        api_key_source: Option<String>,
    },
    #[serde(rename = "assistant")]
    Assistant {
        message: AssistantMessage,
        #[serde(skip_serializing_if = "Option::is_none")]
        parent_tool_use_id: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        session_id: Option<String>,
    },
    #[serde(rename = "user")]
    User {
        message: UserMessage,
        #[serde(skip_serializing_if = "Option::is_none")]
        parent_tool_use_id: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        session_id: Option<String>,
    },
}

/// Assistant message content
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AssistantMessage {
    pub role: String,
    pub content: Vec<ContentBlock>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop_reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop_sequence: Option<String>,
}

/// User message content
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct UserMessage {
    pub role: String,
    pub content: Vec<ContentBlock>,
}

/// Content block types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ContentBlock {
    Text {
        text: String,
    },
    ToolUse {
        id: String,
        name: String,
        input: serde_json::Value,
    },
    ToolResult {
        tool_use_id: String,
        content: Vec<ContentBlock>,
        is_error: Option<bool>,
    },
}

/// Session event types for frontend communication
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionEvent {
    pub session_id: String,
    pub event_type: SessionEventType,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum SessionEventType {
    StatusChanged,
    MessagesUpdated,
    SessionCreated,
    SessionStopped,
    Error,
}

/// Create session options
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSessionOptions {
    pub workspace_path: String,
    pub prompt: Option<String>,
}

/// Send input options
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SendInputOptions {
    pub session_id: String,
    pub input: String,
}