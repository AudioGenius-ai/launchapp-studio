use crate::{error::{Error, Result}, models::*, session::TerminalSession, utils::get_default_shell};
use portable_pty::PtySize;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex, RwLock};
use uuid::Uuid;

pub struct TerminalManager {
    sessions: Arc<RwLock<HashMap<String, Arc<Mutex<TerminalSession>>>>>,
    output_sender: mpsc::Sender<TerminalData>,
}

impl TerminalManager {
    pub fn new(output_sender: mpsc::Sender<TerminalData>) -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            output_sender,
        }
    }
    
    pub async fn create_terminal(&self, options: CreateTerminalOptions) -> Result<Terminal> {
        let terminal_id = Uuid::new_v4().to_string();
        let shell = options.shell.unwrap_or_else(get_default_shell);
        let cwd = options.cwd.or_else(|| {
            std::env::current_dir()
                .ok()
                .and_then(|p| p.to_str().map(String::from))
        });
        
        let title = options.title.unwrap_or_else(|| {
            let shell_name = shell.split('/').last().unwrap_or(&shell);
            shell_name.to_string()
        });
        
        let cols = options.cols.unwrap_or(80);
        let rows = options.rows.unwrap_or(24);
        
        let terminal = Terminal {
            id: terminal_id.clone(),
            title,
            shell: shell.clone(),
            cwd: cwd.clone().unwrap_or_default(),
            pid: None,
            is_active: true,
            cols,
            rows,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };
        
        let size = PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        };
        
        let session = TerminalSession::new(
            terminal.clone(),
            shell,
            cwd,
            options.env,
            size,
            self.output_sender.clone(),
        ).map_err(|e| Error::CreateFailed(e.to_string()))?;
        
        let mut sessions = self.sessions.write().await;
        sessions.insert(terminal_id, Arc::new(Mutex::new(session)));
        
        Ok(terminal)
    }
    
    pub async fn handle_command(&self, command: TerminalCommand) -> Result<()> {
        let sessions = self.sessions.read().await;
        let session = sessions
            .get(&command.terminal_id)
            .ok_or_else(|| Error::TerminalNotFound(command.terminal_id.clone()))?;
        
        let mut session_guard = session.lock().await;
        
        match command.command_type {
            TerminalCommandType::Input => {
                if let Some(data) = command.data {
                    if let Ok(text) = serde_json::from_value::<String>(data) {
                        session_guard.write(&text).await
                            .map_err(|e| Error::WriteFailed(e.to_string()))?;
                    }
                }
            }
            TerminalCommandType::Resize => {
                if let Some(data) = command.data {
                    if let Ok(resize) = serde_json::from_value::<(u16, u16)>(data) {
                        session_guard.resize(resize.0, resize.1).await
                            .map_err(|e| Error::ResizeFailed(e.to_string()))?;
                    }
                }
            }
            TerminalCommandType::Clear => {
                // Send clear sequence
                session_guard.write("\x1b[2J\x1b[H").await
                    .map_err(|e| Error::WriteFailed(e.to_string()))?;
            }
            TerminalCommandType::Kill => {
                session_guard.kill().await?;
            }
            TerminalCommandType::Paste => {
                if let Some(data) = command.data {
                    if let Ok(text) = serde_json::from_value::<String>(data) {
                        session_guard.write(&text).await
                            .map_err(|e| Error::WriteFailed(e.to_string()))?;
                    }
                }
            }
        }
        
        Ok(())
    }
    
    pub async fn write_to_terminal(&self, terminal_id: &str, data: &str) -> Result<()> {
        let sessions = self.sessions.read().await;
        let session = sessions
            .get(terminal_id)
            .ok_or_else(|| Error::TerminalNotFound(terminal_id.to_string()))?;
        
        let session_guard = session.lock().await;
        session_guard.write(data).await
            .map_err(|e| Error::WriteFailed(e.to_string()))
    }
    
    pub async fn resize_terminal(&self, terminal_id: &str, cols: u16, rows: u16) -> Result<()> {
        let sessions = self.sessions.read().await;
        let session = sessions
            .get(terminal_id)
            .ok_or_else(|| Error::TerminalNotFound(terminal_id.to_string()))?;
        
        let session_guard = session.lock().await;
        session_guard.resize(cols, rows).await
            .map_err(|e| Error::ResizeFailed(e.to_string()))
    }
    
    pub async fn kill_terminal(&self, terminal_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        if let Some(session_arc) = sessions.remove(terminal_id) {
            let mut session = session_arc.lock().await;
            session.kill().await?;
        } else {
            return Err(Error::TerminalNotFound(terminal_id.to_string()));
        }
        Ok(())
    }
    
    pub async fn get_terminal(&self, terminal_id: &str) -> Result<Terminal> {
        let sessions = self.sessions.read().await;
        let session = sessions
            .get(terminal_id)
            .ok_or_else(|| Error::TerminalNotFound(terminal_id.to_string()))?;
        
        let session_guard = session.lock().await;
        Ok(session_guard.get_terminal().clone())
    }
    
    pub async fn list_terminals(&self) -> Result<Vec<Terminal>> {
        let sessions = self.sessions.read().await;
        let mut terminals = Vec::new();
        
        for session_arc in sessions.values() {
            let session = session_arc.lock().await;
            terminals.push(session.get_terminal().clone());
        }
        
        Ok(terminals)
    }
    
    pub async fn cleanup_dead_terminals(&self) {
        let sessions = self.sessions.read().await;
        let mut dead_terminals = Vec::new();
        
        for (id, session_arc) in sessions.iter() {
            let session = session_arc.lock().await;
            if !session.is_alive().await {
                dead_terminals.push(id.clone());
            }
        }
        
        drop(sessions);
        
        if !dead_terminals.is_empty() {
            let mut sessions = self.sessions.write().await;
            for id in dead_terminals {
                sessions.remove(&id);
                
                // Send exit event
                let _ = self.output_sender.send(TerminalData {
                    data_type: TerminalDataType::Exit,
                    terminal_id: id,
                    data: serde_json::json!(0),
                }).await;
            }
        }
    }
}