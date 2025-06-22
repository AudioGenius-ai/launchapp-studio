use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Encryption error: {0}")]
    Encryption(String),

    #[error("Decryption error: {0}")]
    Decryption(String),

    #[error("Key derivation error: {0}")]
    KeyDerivation(String),

    #[error("Storage path error: {0}")]
    StoragePath(String),

    #[error("Item not found: {0}")]
    ItemNotFound(String),

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error(transparent)]
    Tauri(#[from] tauri::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

impl From<aes_gcm::Error> for Error {
    fn from(err: aes_gcm::Error) -> Self {
        Error::Encryption(err.to_string())
    }
}

impl From<argon2::Error> for Error {
    fn from(err: argon2::Error) -> Self {
        Error::KeyDerivation(err.to_string())
    }
}

impl From<argon2::password_hash::Error> for Error {
    fn from(err: argon2::password_hash::Error) -> Self {
        Error::KeyDerivation(err.to_string())
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SerializableError {
    pub message: String,
    pub error_type: String,
}

impl From<Error> for SerializableError {
    fn from(err: Error) -> Self {
        Self {
            message: err.to_string(),
            error_type: match &err {
                Error::Io(_) => "io",
                Error::Serialization(_) => "serialization",
                Error::Encryption(_) => "encryption",
                Error::Decryption(_) => "decryption",
                Error::KeyDerivation(_) => "keyDerivation",
                Error::StoragePath(_) => "storagePath",
                Error::ItemNotFound(_) => "itemNotFound",
                Error::InvalidConfig(_) => "invalidConfig",
                Error::PermissionDenied(_) => "permissionDenied",
                Error::Tauri(_) => "tauri",
            }.to_string(),
        }
    }
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let err = SerializableError {
            message: self.to_string(),
            error_type: match self {
                Error::Io(_) => "io",
                Error::Serialization(_) => "serialization",
                Error::Encryption(_) => "encryption",
                Error::Decryption(_) => "decryption",
                Error::KeyDerivation(_) => "keyDerivation",
                Error::StoragePath(_) => "storagePath",
                Error::ItemNotFound(_) => "itemNotFound",
                Error::InvalidConfig(_) => "invalidConfig",
                Error::PermissionDenied(_) => "permissionDenied",
                Error::Tauri(_) => "tauri",
            }.to_string(),
        };
        err.serialize(serializer)
    }
}