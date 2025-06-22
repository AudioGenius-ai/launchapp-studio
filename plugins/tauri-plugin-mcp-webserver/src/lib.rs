use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;
mod process_manager;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::McpWebserver;
#[cfg(mobile)]
use mobile::McpWebserver;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the mcp-webserver APIs.
pub trait McpWebserverExt<R: Runtime> {
  fn mcp_webserver(&self) -> &McpWebserver<R>;
}

impl<R: Runtime, T: Manager<R>> crate::McpWebserverExt<R> for T {
  fn mcp_webserver(&self) -> &McpWebserver<R> {
    self.state::<McpWebserver<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("mcp-webserver")
    .invoke_handler(tauri::generate_handler![
      commands::start_server,
      commands::stop_server,
      commands::list_instances,
      commands::get_instance,
      commands::call_tool,
      commands::get_tools,
    ])
    .setup(|app, api| {
      #[cfg(mobile)]
      let mcp_webserver = mobile::init(app, api)?;
      #[cfg(desktop)]
      let mcp_webserver = desktop::init(app, api)?;
      app.manage(mcp_webserver);
      
      // Initialize tracing
      tracing_subscriber::fmt::init();
      
      Ok(())
    })
    .build()
}
