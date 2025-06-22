use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Git error: {0}")]
    Git(#[from] git2::Error),
    
    #[error("Repository not found at path: {0}")]
    RepoNotFound(String),
    
    #[error("Branch not found: {0}")]
    BranchNotFound(String),
    
    #[error("Remote not found: {0}")]
    RemoteNotFound(String),
    
    #[error("Commit not found: {0}")]
    CommitNotFound(String),
    
    #[error("File not found: {0}")]
    FileNotFound(String),
    
    #[error("Merge conflict")]
    MergeConflict,
    
    #[error("Uncommitted changes")]
    UncommittedChanges,
    
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("UTF-8 error: {0}")]
    Utf8(#[from] std::str::Utf8Error),
    
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