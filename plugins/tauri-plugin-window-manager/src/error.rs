use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    
    #[error("Window not found: {0}")]
    WindowNotFound(String),
    
    #[error("Window already exists: {0}")]
    WindowAlreadyExists(String),
    
    #[error("Invalid window configuration")]
    InvalidConfig,
    
    #[error("Window operation failed: {0}")]
    WindowOperationFailed(String),
    
    #[error("Tauri error: {0}")]
    TauriError(#[from] tauri::Error),
    
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    
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
