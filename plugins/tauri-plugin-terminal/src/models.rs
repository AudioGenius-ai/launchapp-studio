use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Terminal {
    pub id: String,
    pub title: String,
    pub shell: String,
    pub cwd: String,
    pub pid: Option<u32>,
    pub is_active: bool,
    pub rows: u16,
    pub cols: u16,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTerminalOptions {
    pub shell: Option<String>,
    pub cwd: Option<String>,
    pub title: Option<String>,
    pub env: Option<HashMap<String, String>>,
    pub cols: Option<u16>,
    pub rows: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalData {
    #[serde(rename = "type")]
    pub data_type: TerminalDataType,
    pub terminal_id: String,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TerminalDataType {
    Output,
    Exit,
    Title,
    Cwd,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalCommand {
    #[serde(rename = "type")]
    pub command_type: TerminalCommandType,
    pub terminal_id: String,
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TerminalCommandType {
    Input,
    Resize,
    Clear,
    Kill,
    Paste,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalResize {
    pub terminal_id: String,
    pub cols: u16,
    pub rows: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellInfo {
    pub path: String,
    pub name: String,
}

impl Default for CreateTerminalOptions {
    fn default() -> Self {
        Self {
            shell: None,
            cwd: None,
            title: None,
            env: None,
            cols: Some(80),
            rows: Some(24),
        }
    }
}