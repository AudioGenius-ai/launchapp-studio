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
mod extension_host;
mod language_server;
mod extension_marketplace;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::VscodeHost;
#[cfg(mobile)]
use mobile::VscodeHost;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the vscode-host APIs.
pub trait VscodeHostExt<R: Runtime> {
  fn vscode_host(&self) -> &VscodeHost<R>;
}

impl<R: Runtime, T: Manager<R>> crate::VscodeHostExt<R> for T {
  fn vscode_host(&self) -> &VscodeHost<R> {
    self.state::<VscodeHost<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("vscode-host")
    .invoke_handler(tauri::generate_handler![
        commands::create_extension_host,
        commands::stop_extension_host,
        commands::list_extension_hosts,
        commands::get_extension_host_info,
        commands::execute_extension_command,
        commands::start_language_server,
        commands::stop_language_server,
        commands::list_language_servers,
        commands::search_extensions,
        commands::install_extension,
        commands::uninstall_extension,
        commands::list_installed_extensions,
    ])
    .setup(|app, api| {
      #[cfg(mobile)]
      let vscode_host = mobile::init(app, api)?;
      #[cfg(desktop)]
      let vscode_host = desktop::init(app, api)?;
      app.manage(vscode_host);
      
      // TODO: Add cleanup on app exit
      
      Ok(())
    })
    .build()
}
