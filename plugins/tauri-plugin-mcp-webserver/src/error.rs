use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Io(#[from] std::io::Error),
  
  #[error("Server error: {0}")]
  Server(String),
  
  #[error("Port not available")]
  PortNotAvailable,
  
  #[error("Session not found: {0}")]
  SessionNotFound(String),
  
  #[error("Tool not found: {0}")]
  ToolNotFound(String),
  
  #[error(transparent)]
  Anyhow(#[from] anyhow::Error),
  
  #[error(transparent)]
  SerdeJson(#[from] serde_json::Error),
  
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
