use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::process::Command;
use tauri::{AppHandle, Runtime, Emitter};

use crate::{
    Result, Error,
    models::*,
    session_manager::SessionManager,
    process_manager::ProcessManager,
    file_watcher::FileWatcher,
};

pub struct ClaudeService<R: Runtime> {
    app_data_dir: PathBuf,
    app_handle: AppHandle<R>,
    sessions: Arc<RwLock<HashMap<String, ClaudeSession>>>,
    session_manager: SessionManager,
    process_manager: ProcessManager,
    file_watcher: FileWatcher<R>,
}

impl<R: Runtime> ClaudeService<R> {
    pub fn new(app_data_dir: PathBuf, app_handle: AppHandle<R>) -> Self {
        let session_manager = SessionManager::new(app_data_dir.join("claude_sessions"));
        let file_watcher = FileWatcher::new(app_handle.clone());
        
        Self {
            app_data_dir: app_data_dir.clone(),
            app_handle,
            sessions: Arc::new(RwLock::new(HashMap::new())),
            session_manager,
            process_manager: ProcessManager::new(),
            file_watcher,
        }
    }

    /// Create a new Claude session
    pub async fn create_session(
        &self,
        workspace_path: String,
        prompt: Option<String>,
    ) -> Result<ClaudeSession> {
        // Check if Claude CLI is available
        self.check_claude_available().await?;

        let session_id = uuid::Uuid::new_v4().to_string();
        let logs_dir = self.app_data_dir.join("claude_logs");
        tokio::fs::create_dir_all(&logs_dir).await?;
        
        let log_file_path = logs_dir.join(format!("{}.jsonl", session_id));
        let prompt_text = prompt.unwrap_or_else(|| "You are Claude, an AI assistant.".to_string());

        // Check for MCP config in workspace
        let mcp_config_path = Path::new(&workspace_path).join(".claude-code").join("mcp_config.json");
        let mcp_args = if mcp_config_path.exists() {
            format!(" --mcp-config '{}'", mcp_config_path.display())
        } else {
            String::new()
        };

        // Build command with tee for dual output
        let cmd = format!(
            "claude -p '{}' --verbose --output-format stream-json --permission-mode bypassPermissions{} | tee '{}'",
            prompt_text.replace("'", "'\"'\"'"), // Escape single quotes
            mcp_args,
            log_file_path.display()
        );

        // Start the Claude process
        let mut child = Command::new("sh")
            .args(&["-c", &cmd])
            .current_dir(&workspace_path)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| Error::ProcessStartError(e.to_string()))?;

        let pid = child.id();

        // Create session
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let session = ClaudeSession {
            id: session_id.clone(),
            workspace_path: workspace_path.clone(),
            log_file_path: log_file_path.clone(),
            pid,
            created_at: now,
            status: SessionStatus::Starting,
            last_activity: now,
        };

        // Store session
        self.sessions.write().await.insert(session_id.clone(), session.clone());

        // Persist session for recovery
        self.session_manager.persist_session(&session).await?;

        // Start watching the log file
        self.file_watcher.watch_session(&session).await?;

        // Handle process output
        let session_id_clone = session_id.clone();
        let sessions = self.sessions.clone();
        let app_handle = self.app_handle.clone();
        
        tokio::spawn(async move {
            let _ = child.wait().await;
            
            // Update session status
            if let Some(session) = sessions.write().await.get_mut(&session_id_clone) {
                session.status = SessionStatus::Completed;
                
                // Emit completion event
                let _ = app_handle.emit(
                    "plugin:claude:session-event",
                    SessionEvent {
                        session_id: session_id_clone,
                        event_type: SessionEventType::SessionStopped,
                        data: serde_json::json!({}),
                    },
                );
            }
        });

        Ok(session)
    }

    /// Send input to an existing session
    pub async fn send_input(&self, session_id: &str, input: &str) -> Result<()> {
        let sessions = self.sessions.read().await;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| Error::SessionNotFound(session_id.to_string()))?;

        let log_file_path = &session.log_file_path;
        let workspace_path = &session.workspace_path;

        // Build resume command with input
        let cmd = format!(
            "claude -r '{}' -p '{}' --verbose --output-format stream-json --permission-mode bypassPermissions | tee -a '{}'",
            log_file_path.display(),
            input.replace("'", "'\"'\"'"), // Escape single quotes
            log_file_path.display()
        );

        // Execute command
        let mut child = Command::new("sh")
            .args(&["-c", &cmd])
            .current_dir(workspace_path)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| Error::CommunicationError(e.to_string()))?;

        // Update session
        drop(sessions);
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(session_id) {
            session.status = SessionStatus::Streaming;
            session.last_activity = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();
        }

        // Handle completion
        let session_id_owned = session_id.to_string();
        let sessions_clone = self.sessions.clone();
        
        tokio::spawn(async move {
            let _ = child.wait().await;
            
            // Update status back to idle
            if let Some(session) = sessions_clone.write().await.get_mut(&session_id_owned) {
                session.status = SessionStatus::Idle;
            }
        });

        Ok(())
    }

    /// List all active sessions
    pub async fn list_sessions(&self) -> Result<Vec<ClaudeSession>> {
        let sessions = self.sessions.read().await;
        Ok(sessions.values().cloned().collect())
    }

    /// Stop a session
    pub async fn stop_session(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        
        if let Some(session) = sessions.remove(session_id) {
            // Stop file watching
            self.file_watcher.stop_watching(&session.id).await?;
            
            // Kill process if running
            if let Some(pid) = session.pid {
                self.process_manager.kill_process(pid).await?;
            }

            // Emit stop event
            let _ = self.app_handle.emit(
                "plugin:claude:session-event",
                SessionEvent {
                    session_id: session_id.to_string(),
                    event_type: SessionEventType::SessionStopped,
                    data: serde_json::json!({}),
                },
            );
        }

        Ok(())
    }

    /// Recover sessions from disk
    pub async fn recover_sessions(&self) -> Result<Vec<ClaudeSession>> {
        let persisted_sessions = self.session_manager.load_sessions().await?;
        let mut recovered = Vec::new();

        for persisted in persisted_sessions {
            // Check if log file exists
            if persisted.log_file_path.exists() {
                let session = ClaudeSession {
                    id: persisted.id.clone(),
                    workspace_path: persisted.workspace_path,
                    log_file_path: persisted.log_file_path.clone(),
                    pid: None, // Process won't exist after restart
                    created_at: persisted.created_at,
                    status: SessionStatus::Idle,
                    last_activity: persisted.last_activity,
                };

                // Start watching the log file
                if let Ok(_) = self.file_watcher.watch_session(&session).await {
                    self.sessions.write().await.insert(session.id.clone(), session.clone());
                    recovered.push(session);
                }
            }
        }

        Ok(recovered)
    }

    /// Get messages for a session
    pub async fn get_messages(&self, session_id: &str) -> Result<Vec<ClaudeMessage>> {
        let sessions = self.sessions.read().await;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| Error::SessionNotFound(session_id.to_string()))?;

        // Read log file and parse messages
        let content = tokio::fs::read_to_string(&session.log_file_path).await?;
        let messages: Vec<ClaudeMessage> = content
            .lines()
            .filter_map(|line| serde_json::from_str(line).ok())
            .collect();

        Ok(messages)
    }

    /// Get available MCP tools from workspace config
    pub async fn get_mcp_tools(&self, workspace_path: &str) -> Result<Vec<String>> {
        let mcp_config_path = Path::new(workspace_path)
            .join(".claude-code")
            .join("mcp_config.json");

        if !mcp_config_path.exists() {
            return Ok(Vec::new());
        }

        // Read and parse MCP config
        let config_content = tokio::fs::read_to_string(&mcp_config_path).await?;
        let config: serde_json::Value = serde_json::from_str(&config_content)?;
        
        let mut tools = Vec::new();
        
        // Extract server configurations
        if let Some(servers) = config.get("mcpServers").and_then(|v| v.as_object()) {
            for (server_name, _server_config) in servers {
                if server_name == "project-management" {
                    // Add known project management tools
                    tools.extend(vec![
                        "pm_create_project".to_string(),
                        "pm_list_projects".to_string(),
                        "pm_get_project".to_string(),
                        "pm_create_task".to_string(),
                        "pm_list_tasks".to_string(),
                        "pm_get_task".to_string(),
                        "pm_update_task".to_string(),
                        "pm_delete_task".to_string(),
                        "pm_move_task_to_sprint".to_string(),
                        "pm_add_task_comment".to_string(),
                        "pm_create_document".to_string(),
                        "pm_list_documents".to_string(),
                        "pm_get_document".to_string(),
                        "pm_update_document".to_string(),
                        "pm_delete_document".to_string(),
                        "pm_render_document".to_string(),
                        "pm_create_sprint".to_string(),
                        "pm_list_sprints".to_string(),
                        "pm_get_sprint".to_string(),
                        "pm_start_sprint".to_string(),
                        "pm_complete_sprint".to_string(),
                        "pm_search_tasks".to_string(),
                        "pm_search_documents".to_string(),
                        "pm_search_all".to_string(),
                        "pm_get_project_statistics".to_string(),
                    ]);
                }
            }
        }

        Ok(tools)
    }

    /// Cleanup all sessions
    pub async fn cleanup_all(&self) -> Result<()> {
        let session_ids: Vec<String> = self.sessions.read().await.keys().cloned().collect();
        
        for session_id in session_ids {
            let _ = self.stop_session(&session_id).await;
        }

        Ok(())
    }

    /// Check if Claude CLI is available
    async fn check_claude_available(&self) -> Result<()> {
        let output = Command::new("which")
            .arg("claude")
            .output()
            .await
            .map_err(|_| Error::ClaudeNotFound)?;

        if !output.status.success() {
            return Err(Error::ClaudeNotFound);
        }

        Ok(())
    }
}