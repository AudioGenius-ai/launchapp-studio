use crate::{error::Result, models::*, pty_wrapper::PtyHandle};
use portable_pty::PtySize;
use std::sync::Arc;
use tokio::sync::mpsc;
use tokio::task;

pub struct TerminalSession {
    pub terminal: Terminal,
    pty_handle: Arc<PtyHandle>,
    output_sender: mpsc::Sender<TerminalData>,
}

impl TerminalSession {
    pub fn new(
        terminal: Terminal,
        shell: String,
        cwd: Option<String>,
        env: Option<std::collections::HashMap<String, String>>,
        size: PtySize,
        output_sender: mpsc::Sender<TerminalData>,
    ) -> Result<Self> {
        // Create the PTY handle
        let pty_handle = PtyHandle::spawn(shell, cwd, env, size)?;
        let pty_handle = Arc::new(pty_handle);
        
        let session = Self {
            terminal,
            pty_handle,
            output_sender,
        };
        
        // Start reading output
        session.start_output_reader();
        
        Ok(session)
    }
    
    fn start_output_reader(&self) {
        let pty_handle = Arc::clone(&self.pty_handle);
        let terminal_id = self.terminal.id.clone();
        let output_sender = self.output_sender.clone();
        
        task::spawn(async move {
            loop {
                // Poll for output from the PTY
                if let Some(data) = pty_handle.try_recv_output().await {
                    let data_str = String::from_utf8_lossy(&data).to_string();
                    let _ = output_sender.send(TerminalData {
                        data_type: TerminalDataType::Output,
                        terminal_id: terminal_id.clone(),
                        data: serde_json::json!(data_str),
                    }).await;
                } else {
                    // Check if process is still alive
                    if !pty_handle.is_alive().await {
                        let _ = output_sender.send(TerminalData {
                            data_type: TerminalDataType::Exit,
                            terminal_id: terminal_id.clone(),
                            data: serde_json::json!(0),
                        }).await;
                        break;
                    }
                    
                    // No data available, sleep briefly
                    tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
                }
            }
        });
    }
    
    pub async fn write(&self, data: &str) -> Result<()> {
        self.pty_handle.write(data.as_bytes().to_vec()).await
    }
    
    pub async fn resize(&self, cols: u16, rows: u16) -> Result<()> {
        let size = PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        };
        
        self.pty_handle.resize(size).await
    }
    
    pub async fn kill(&mut self) -> Result<()> {
        self.pty_handle.kill().await
    }
    
    pub async fn is_alive(&self) -> bool {
        self.pty_handle.is_alive().await
    }
    
    pub fn get_terminal(&self) -> &Terminal {
        &self.terminal
    }
    
    pub fn update_title(&mut self, title: String) {
        self.terminal.title = title;
        self.terminal.updated_at = chrono::Utc::now();
    }
    
    pub fn update_cwd(&mut self, cwd: String) {
        self.terminal.cwd = cwd;
        self.terminal.updated_at = chrono::Utc::now();
    }
}