use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Claude CLI not found. Please install Claude CLI first.")]
    ClaudeNotFound,

    #[error("Session not found: {0}")]
    SessionNotFound(String),

    #[error("Failed to start Claude process: {0}")]
    ProcessStartError(String),

    #[error("Failed to communicate with Claude: {0}")]
    CommunicationError(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("File watcher error: {0}")]
    FileWatcher(#[from] notify::Error),

    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("Other error: {0}")]
    Other(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("Error", 2)?;
        state.serialize_field("type", &format!("{:?}", self))?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

pub type Result<T> = std::result::Result<T, Error>;