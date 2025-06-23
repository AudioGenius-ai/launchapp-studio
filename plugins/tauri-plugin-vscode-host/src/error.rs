use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Extension host not found: {0}")]
    HostNotFound(String),
    
    #[error("Extension not found: {0}")]
    ExtensionNotFound(String),
    
    #[error("Language server not found: {0}")]
    LanguageServerNotFound(String),
    
    #[error("Process error: {0}")]
    ProcessError(String),
    
    #[error("IPC error: {0}")]
    IpcError(String),
    
    #[error("Node.js not found")]
    NodeNotFound,
    
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),
    
    #[error("Extension installation failed: {0}")]
    InstallationFailed(String),
    
    #[error("API error: {0}")]
    ApiError(String),
    
    #[error("Timeout error: operation timed out after {0}ms")]
    Timeout(u64),
    
    #[error("Resource limit exceeded: {0}")]
    ResourceLimitExceeded(String),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    
    #[error("Registry error: {0}")]
    RegistryError(String),
    
    #[error(transparent)]
    Io(#[from] std::io::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Unknown error: {0}")]
    Unknown(String),
    
    #[cfg(mobile)]
    #[error(transparent)]
    PluginInvoke(#[from] tauri::plugin::mobile::PluginInvokeError),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::Serialization(err.to_string())
    }
}

impl From<tokio::time::error::Elapsed> for Error {
    fn from(_: tokio::time::error::Elapsed) -> Self {
        Error::Timeout(30000) // Default timeout
    }
}
