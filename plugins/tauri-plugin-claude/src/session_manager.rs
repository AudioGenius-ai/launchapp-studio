use std::path::PathBuf;
use tokio::fs;
use crate::{Result, models::*};

pub struct SessionManager {
    sessions_dir: PathBuf,
}

impl SessionManager {
    pub fn new(sessions_dir: PathBuf) -> Self {
        Self { sessions_dir }
    }

    /// Persist a session to disk
    pub async fn persist_session(&self, session: &ClaudeSession) -> Result<()> {
        // Create sessions directory if it doesn't exist
        fs::create_dir_all(&self.sessions_dir).await?;

        let persisted = PersistedClaudeSession {
            id: session.id.clone(),
            workspace_path: session.workspace_path.clone(),
            log_file_path: session.log_file_path.clone(),
            created_at: session.created_at,
            last_activity: session.last_activity,
        };

        let session_file = self.sessions_dir.join(format!("{}.json", session.id));
        let content = serde_json::to_string_pretty(&persisted)?;
        fs::write(session_file, content).await?;

        Ok(())
    }

    /// Load all persisted sessions
    pub async fn load_sessions(&self) -> Result<Vec<PersistedClaudeSession>> {
        let mut sessions = Vec::new();

        if !self.sessions_dir.exists() {
            return Ok(sessions);
        }

        let mut entries = fs::read_dir(&self.sessions_dir).await?;
        
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            
            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(content) = fs::read_to_string(&path).await {
                    if let Ok(session) = serde_json::from_str::<PersistedClaudeSession>(&content) {
                        sessions.push(session);
                    }
                }
            }
        }

        Ok(sessions)
    }

    /// Delete a persisted session
    pub async fn delete_session(&self, session_id: &str) -> Result<()> {
        let session_file = self.sessions_dir.join(format!("{}.json", session_id));
        if session_file.exists() {
            fs::remove_file(session_file).await?;
        }
        Ok(())
    }
}