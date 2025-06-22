use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
use tokio::sync::Mutex;
use std::sync::Arc;

pub mod error;
pub mod models;
pub mod service;
pub mod session_manager;
pub mod process_manager;
pub mod file_watcher;
pub mod commands;

pub use error::{Error, Result};
pub use models::*;

pub struct Claude<R: Runtime> {
    service: Arc<Mutex<service::ClaudeService<R>>>,
}

impl<R: Runtime> Claude<R> {
    pub async fn create_session(
        &self,
        workspace_path: String,
        prompt: Option<String>,
    ) -> Result<models::ClaudeSession> {
        self.service.lock().await.create_session(workspace_path, prompt).await
    }

    pub async fn send_input(
        &self,
        session_id: String,
        input: String,
    ) -> Result<()> {
        self.service.lock().await.send_input(&session_id, &input).await
    }

    pub async fn list_sessions(&self) -> Result<Vec<models::ClaudeSession>> {
        self.service.lock().await.list_sessions().await
    }

    pub async fn stop_session(&self, session_id: String) -> Result<()> {
        self.service.lock().await.stop_session(&session_id).await
    }

    pub async fn recover_sessions(&self) -> Result<Vec<models::ClaudeSession>> {
        self.service.lock().await.recover_sessions().await
    }

    pub async fn get_messages(
        &self,
        session_id: String,
    ) -> Result<Vec<models::ClaudeMessage>> {
        self.service.lock().await.get_messages(&session_id).await
    }

    pub async fn get_mcp_tools(&self, workspace_path: String) -> Result<Vec<String>> {
        self.service.lock().await.get_mcp_tools(&workspace_path).await
    }
}

/// Extension trait to access the Claude API
pub trait ClaudeExt<R: Runtime> {
    fn claude(&self) -> &Claude<R>;
}

impl<R: Runtime, T: Manager<R>> ClaudeExt<R> for T {
    fn claude(&self) -> &Claude<R> {
        self.state::<Claude<R>>().inner()
    }
}

/// Initialize the plugin
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("claude")
        .invoke_handler(tauri::generate_handler![
            commands::create_session,
            commands::send_input,
            commands::list_sessions,
            commands::stop_session,
            commands::recover_sessions,
            commands::get_messages,
            commands::get_mcp_tools,
        ])
        .setup(move |app, _api| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            
            let service = Arc::new(Mutex::new(
                service::ClaudeService::<R>::new(app_data_dir, app.app_handle().clone())
            ));
            
            app.manage(Claude {
                service: service.clone(),
            });

            // Start session recovery
            let service_clone = service.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = service_clone.lock().await.recover_sessions().await {
                    eprintln!("Failed to recover Claude sessions: {}", e);
                }
            });

            Ok(())
        })
        .on_event(|app, event| {
            if let tauri::RunEvent::Exit = event {
                // Cleanup all Claude processes on exit
                let claude = app.claude();
                let service = claude.service.clone();
                tauri::async_runtime::block_on(async {
                    if let Err(e) = service.lock().await.cleanup_all().await {
                        eprintln!("Failed to cleanup Claude processes: {}", e);
                    }
                });
            }
        })
        .build()
}