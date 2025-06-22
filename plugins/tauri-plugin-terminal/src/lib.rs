use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, Emitter,
};
use tokio::sync::mpsc;
use std::sync::Arc;

pub mod error;
pub mod models;
pub mod pty_wrapper;
pub mod session;
pub mod manager;
pub mod utils;
pub mod commands;

pub use error::{Error, Result};
pub use models::*;
use manager::TerminalManager;

pub struct Terminal<R: Runtime> {
    _app: tauri::AppHandle<R>,
    manager: Arc<TerminalManager>,
}

impl<R: Runtime> Terminal<R> {
    pub async fn create_terminal(&self, options: CreateTerminalOptions) -> Result<models::Terminal> {
        self.manager.create_terminal(options).await
    }

    pub async fn write_to_terminal(&self, terminal_id: &str, data: &str) -> Result<()> {
        self.manager.write_to_terminal(terminal_id, data).await
    }

    pub async fn resize_terminal(&self, terminal_id: &str, cols: u16, rows: u16) -> Result<()> {
        self.manager.resize_terminal(terminal_id, cols, rows).await
    }

    pub async fn kill_terminal(&self, terminal_id: &str) -> Result<()> {
        self.manager.kill_terminal(terminal_id).await
    }

    pub async fn handle_command(&self, command: TerminalCommand) -> Result<()> {
        self.manager.handle_command(command).await
    }

    pub async fn get_terminal(&self, terminal_id: &str) -> Result<models::Terminal> {
        self.manager.get_terminal(terminal_id).await
    }

    pub async fn list_terminals(&self) -> Result<Vec<models::Terminal>> {
        self.manager.list_terminals().await
    }
}

/// Extension trait to access the terminal API
pub trait TerminalExt<R: Runtime> {
    fn terminal(&self) -> &Terminal<R>;
}

impl<R: Runtime, T: Manager<R>> TerminalExt<R> for T {
    fn terminal(&self) -> &Terminal<R> {
        self.state::<Terminal<R>>().inner()
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("terminal")
        .invoke_handler(tauri::generate_handler![
            commands::create_terminal,
            commands::write_to_terminal,
            commands::resize_terminal,
            commands::kill_terminal,
            commands::handle_terminal_command,
            commands::get_terminal,
            commands::list_terminals,
            commands::get_available_shells,
            commands::get_default_shell,
        ])
        .setup(move |app, _api| {
            let (tx, mut rx) = mpsc::channel::<TerminalData>(100);
            let manager = Arc::new(TerminalManager::new(tx));
            
            // Start a task to forward terminal output to the frontend
            let app_handle = app.clone();
            tauri::async_runtime::spawn(async move {
                while let Some(data) = rx.recv().await {
                    let _ = app_handle.emit("plugin:terminal:data", &data);
                }
            });
            
            // Start periodic cleanup of dead terminals
            let manager_clone = Arc::clone(&manager);
            tauri::async_runtime::spawn(async move {
                let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(5));
                loop {
                    interval.tick().await;
                    manager_clone.cleanup_dead_terminals().await;
                }
            });
            
            app.manage(Terminal {
                _app: app.clone(),
                manager,
            });
            
            Ok(())
        })
        .build()
}