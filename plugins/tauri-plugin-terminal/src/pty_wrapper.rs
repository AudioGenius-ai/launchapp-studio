use crate::error::Result;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::sync::mpsc;
use std::thread;
use tokio::sync::{mpsc as tokio_mpsc, oneshot, Mutex};
use std::sync::Arc;

pub enum PtyRequest {
    Write(Vec<u8>, oneshot::Sender<Result<()>>),
    Resize(PtySize, oneshot::Sender<Result<()>>),
    Kill(oneshot::Sender<Result<()>>),
    CheckAlive(oneshot::Sender<bool>),
    Shutdown,
}

pub struct PtyHandle {
    request_tx: mpsc::Sender<PtyRequest>,
    output_rx: Arc<Mutex<tokio_mpsc::Receiver<Vec<u8>>>>,
    _thread: thread::JoinHandle<()>,
}

impl PtyHandle {
    pub fn spawn(
        shell: String,
        cwd: Option<String>,
        env: Option<std::collections::HashMap<String, String>>,
        size: PtySize,
    ) -> Result<Self> {
        let (request_tx, request_rx) = mpsc::channel();
        let (output_tx, output_rx) = tokio_mpsc::channel(100);
        
        let thread = thread::spawn(move || {
            let pty_system = native_pty_system();
            
            // Create PTY pair
            let pty_pair = match pty_system.openpty(size) {
                Ok(pair) => pair,
                Err(e) => {
                    eprintln!("Failed to open PTY: {}", e);
                    return;
                }
            };
            
            // Build command
            let mut cmd = CommandBuilder::new(&shell);
            
            if let Some(cwd) = cwd {
                cmd.cwd(cwd);
            }
            
            if let Some(env_vars) = env {
                for (key, value) in env_vars {
                    cmd.env(key, value);
                }
            }
            
            // Spawn child process
            let mut child = match pty_pair.slave.spawn_command(cmd) {
                Ok(child) => child,
                Err(e) => {
                    eprintln!("Failed to spawn command: {}", e);
                    return;
                }
            };
            
            // Get reader and writer
            let mut reader = match pty_pair.master.try_clone_reader() {
                Ok(r) => r,
                Err(e) => {
                    eprintln!("Failed to clone reader: {}", e);
                    return;
                }
            };
            
            let mut writer = match pty_pair.master.take_writer() {
                Ok(w) => w,
                Err(e) => {
                    eprintln!("Failed to take writer: {}", e);
                    return;
                }
            };
            
            // Spawn output reader thread
            let output_tx_clone = output_tx.clone();
            thread::spawn(move || {
                use std::io::Read;
                let mut buffer = vec![0u8; 4096];
                
                loop {
                    match reader.read(&mut buffer) {
                        Ok(0) => break, // EOF
                        Ok(n) => {
                            let data = buffer[..n].to_vec();
                            // Block until we can send
                            if output_tx_clone.blocking_send(data).is_err() {
                                break;
                            }
                        }
                        Err(e) => {
                            eprintln!("Error reading from PTY: {}", e);
                            break;
                        }
                    }
                }
            });
            
            // Handle requests
            while let Ok(request) = request_rx.recv() {
                match request {
                    PtyRequest::Write(data, tx) => {
                        use std::io::Write;
                        let result = writer.write_all(&data)
                            .and_then(|_| writer.flush())
                            .map_err(|e| crate::error::Error::IoError(e));
                        let _ = tx.send(result);
                    }
                    PtyRequest::Resize(size, tx) => {
                        let result = pty_pair.master.resize(size)
                            .map_err(|e| crate::error::Error::PtyError(e.to_string()));
                        let _ = tx.send(result);
                    }
                    PtyRequest::Kill(tx) => {
                        let result = child.kill()
                            .map_err(|e| crate::error::Error::PtyError(e.to_string()));
                        let _ = tx.send(result);
                    }
                    PtyRequest::CheckAlive(tx) => {
                        let is_alive = match child.try_wait() {
                            Ok(None) => true,
                            _ => false,
                        };
                        let _ = tx.send(is_alive);
                    }
                    PtyRequest::Shutdown => break,
                }
            }
        });
        
        Ok(PtyHandle {
            request_tx,
            output_rx: Arc::new(Mutex::new(output_rx)),
            _thread: thread,
        })
    }
    
    pub async fn write(&self, data: Vec<u8>) -> Result<()> {
        let (tx, rx) = oneshot::channel();
        self.request_tx.send(PtyRequest::Write(data, tx))
            .map_err(|_| crate::error::Error::TerminalError("PTY thread disconnected".into()))?;
        rx.await
            .map_err(|_| crate::error::Error::TerminalError("PTY thread response failed".into()))?
    }
    
    pub async fn resize(&self, size: PtySize) -> Result<()> {
        let (tx, rx) = oneshot::channel();
        self.request_tx.send(PtyRequest::Resize(size, tx))
            .map_err(|_| crate::error::Error::TerminalError("PTY thread disconnected".into()))?;
        rx.await
            .map_err(|_| crate::error::Error::TerminalError("PTY thread response failed".into()))?
    }
    
    pub async fn kill(&self) -> Result<()> {
        let (tx, rx) = oneshot::channel();
        self.request_tx.send(PtyRequest::Kill(tx))
            .map_err(|_| crate::error::Error::TerminalError("PTY thread disconnected".into()))?;
        rx.await
            .map_err(|_| crate::error::Error::TerminalError("PTY thread response failed".into()))?
    }
    
    pub async fn is_alive(&self) -> bool {
        let (tx, rx) = oneshot::channel();
        if self.request_tx.send(PtyRequest::CheckAlive(tx)).is_err() {
            return false;
        }
        rx.await.unwrap_or(false)
    }
    
    pub async fn try_recv_output(&self) -> Option<Vec<u8>> {
        let mut rx = self.output_rx.lock().await;
        rx.try_recv().ok()
    }
}

impl Drop for PtyHandle {
    fn drop(&mut self) {
        let _ = self.request_tx.send(PtyRequest::Shutdown);
    }
}