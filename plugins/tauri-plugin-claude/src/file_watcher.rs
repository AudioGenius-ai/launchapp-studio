use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, mpsc};
use tauri::{AppHandle, Runtime, Emitter};
use notify::{Event, EventKind, RecursiveMode, Watcher};

use crate::{Result, models::*};

pub struct FileWatcher<R: Runtime> {
    app_handle: AppHandle<R>,
    watchers: Arc<RwLock<HashMap<String, notify::RecommendedWatcher>>>,
}

impl<R: Runtime> FileWatcher<R> {
    pub fn new(app_handle: AppHandle<R>) -> Self {
        Self {
            app_handle,
            watchers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Start watching a session's log file
    pub async fn watch_session(&self, session: &ClaudeSession) -> Result<()> {
        let session_id = session.id.clone();
        let log_path = session.log_file_path.clone();
        let app_handle = self.app_handle.clone();

        // Create async channel for file events
        let (tx, mut rx) = mpsc::unbounded_channel();
        let sync_tx = Arc::new(std::sync::Mutex::new(tx));

        // Create file watcher
        let watcher_tx = sync_tx.clone();
        let mut watcher = notify::recommended_watcher(move |result: std::result::Result<Event, notify::Error>| {
            if let Ok(tx) = watcher_tx.lock() {
                let _ = tx.send(result);
            }
        })?;

        // Watch the log file
        watcher.watch(&log_path, RecursiveMode::NonRecursive)?;

        // Store watcher
        self.watchers.write().await.insert(session_id.clone(), watcher);

        // Spawn task to handle file events
        let session_id_clone = session_id.clone();
        tokio::spawn(async move {
            let mut last_size = 0usize;

            loop {
                match rx.recv().await {
                    Some(Ok(Event { kind: EventKind::Modify(_), .. })) => {
                        // Read file content
                        if let Ok(content) = tokio::fs::read_to_string(&log_path).await {
                            let messages: Vec<ClaudeMessage> = content
                                .lines()
                                .filter_map(|line| serde_json::from_str::<ClaudeMessage>(line).ok())
                                .collect();

                            // Check if there are new messages
                            if messages.len() > last_size {
                                last_size = messages.len();

                                // Emit messages update event
                                let _ = app_handle.emit(
                                    "plugin:claude:session-event",
                                    SessionEvent {
                                        session_id: session_id_clone.clone(),
                                        event_type: SessionEventType::MessagesUpdated,
                                        data: serde_json::json!({
                                            "messages": messages,
                                            "newMessageCount": messages.len() - last_size + 1
                                        }),
                                    },
                                );

                                // Check if last message is a completion
                                if let Some(last_msg) = messages.last() {
                                    if is_completion_message(last_msg) {
                                        // Emit status change to idle
                                        let _ = app_handle.emit(
                                            "plugin:claude:session-event",
                                            SessionEvent {
                                                session_id: session_id_clone.clone(),
                                                event_type: SessionEventType::StatusChanged,
                                                data: serde_json::json!({
                                                    "status": "idle"
                                                }),
                                            },
                                        );
                                    }
                                }
                            }
                        }
                    }
                    Some(Err(e)) => {
                        eprintln!("File watcher error: {}", e);
                    }
                    None => {
                        // Channel closed, stop watching
                        break;
                    }
                    _ => {
                        // Ignore other event types
                    }
                }
            }
        });

        Ok(())
    }

    /// Stop watching a session's log file
    pub async fn stop_watching(&self, session_id: &str) -> Result<()> {
        self.watchers.write().await.remove(session_id);
        Ok(())
    }
}

/// Check if a message indicates completion
fn is_completion_message(message: &ClaudeMessage) -> bool {
    match message {
        ClaudeMessage::Assistant { message, .. } => {
            message.stop_reason.is_some()
        }
        _ => false
    }
}