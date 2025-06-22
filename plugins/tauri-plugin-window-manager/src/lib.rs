use tauri::{
    plugin::{Builder, TauriPlugin},
    Listener, Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod window_service;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::WindowManager;
#[cfg(mobile)]
use mobile::WindowManager;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the window-manager APIs.
pub trait WindowManagerExt<R: Runtime> {
    fn window_manager(&self) -> &WindowManager<R>;
}

impl<R: Runtime, T: Manager<R>> crate::WindowManagerExt<R> for T {
    fn window_manager(&self) -> &WindowManager<R> {
        self.state::<WindowManager<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("window-manager")
        .invoke_handler(tauri::generate_handler![
            commands::create_window,
            commands::close_window,
            commands::get_window,
            commands::list_windows,
            commands::focus_window,
            commands::minimize_window,
            commands::maximize_window,
            commands::unmaximize_window,
            commands::set_window_position,
            commands::set_window_size,
            commands::set_window_title,
            commands::send_message,
            commands::broadcast_message,
            commands::get_window_state,
            commands::update_window_info,
        ])
        .setup(|app, api| {
            #[cfg(mobile)]
            let window_manager = mobile::init(app, api)?;
            #[cfg(desktop)]
            let window_manager = desktop::init(app, api)?;
            app.manage(window_manager);
            
            // Set up window event listeners
            let app_handle = app.clone();
            app.listen("window-created", move |event| {
                let label = event.payload();
                let _ = app_handle.window_manager().update_window_info(label);
            });
            
            Ok(())
        })
        .build()
}
