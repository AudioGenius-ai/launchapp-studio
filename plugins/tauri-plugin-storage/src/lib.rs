use tauri::{
    plugin::{Builder as PluginBuilder, TauriPlugin},
    Runtime, Manager,
};

mod commands;
mod error;
pub mod models;
mod storage;
mod crypto;

pub use error::{Error, Result};
pub use models::*;
pub use storage::StorageService;

use std::sync::Arc;
use tokio::sync::Mutex;

pub struct Storage {
    service: Arc<Mutex<StorageService>>,
}

impl Storage {
    pub fn new() -> Self {
        Self {
            service: Arc::new(Mutex::new(StorageService::new())),
        }
    }

    pub fn service(&self) -> Arc<Mutex<StorageService>> {
        self.service.clone()
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    PluginBuilder::new("storage")
        .invoke_handler(tauri::generate_handler![
            commands::set_item,
            commands::get_item,
            commands::remove_item,
            commands::clear,
            commands::list_keys,
            commands::set_encrypted_item,
            commands::get_encrypted_item,
            commands::set_storage_path,
            commands::get_storage_path,
            commands::exists,
            commands::get_storage_info,
        ])
        .setup(|app, _api| {
            let storage = Storage::new();
            app.manage(storage);
            Ok(())
        })
        .build()
}