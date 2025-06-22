use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use zeroize::Zeroize;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageItem {
    pub key: String,
    pub value: serde_json::Value,
    pub created_at: i64,
    pub updated_at: i64,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedStorageItem {
    pub key: String,
    pub encrypted_data: String,
    pub nonce: String,
    pub salt: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageConfig {
    pub base_path: PathBuf,
    pub namespace: Option<String>,
    pub auto_sync: bool,
    pub compression: bool,
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self {
            base_path: directories::BaseDirs::new()
                .map(|dirs| dirs.home_dir().join(".launchapp"))
                .unwrap_or_else(|| PathBuf::from(".launchapp")),
            namespace: None,
            auto_sync: true,
            compression: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageInfo {
    pub base_path: String,
    pub namespace: Option<String>,
    pub total_items: usize,
    pub encrypted_items: usize,
    pub total_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetItemOptions {
    pub key: String,
    pub value: serde_json::Value,
    pub namespace: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetEncryptedItemOptions {
    pub key: String,
    pub value: serde_json::Value,
    pub password: String,
    pub namespace: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetItemOptions {
    pub key: String,
    pub namespace: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetEncryptedItemOptions {
    pub key: String,
    pub password: String,
    pub namespace: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveItemOptions {
    pub key: String,
    pub namespace: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListKeysOptions {
    pub namespace: Option<String>,
    pub include_encrypted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClearOptions {
    pub namespace: Option<String>,
    pub include_encrypted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyInfo {
    pub key: String,
    pub is_encrypted: bool,
    pub size: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Zeroize)]
#[zeroize(drop)]
pub struct EncryptionKey {
    pub key: Vec<u8>,
}