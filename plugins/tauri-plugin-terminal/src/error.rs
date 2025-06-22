use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Terminal not found: {0}")]
    TerminalNotFound(String),
    
    #[error("Failed to create terminal: {0}")]
    CreateFailed(String),
    
    #[error("Failed to write to terminal: {0}")]
    WriteFailed(String),
    
    #[error("Failed to resize terminal: {0}")]
    ResizeFailed(String),
    
    #[error("PTY error: {0}")]
    PtyError(String),
    
    #[error("Terminal error: {0}")]
    TerminalError(String),
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("Generic error: {0}")]
    Generic(#[from] anyhow::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, Error>;