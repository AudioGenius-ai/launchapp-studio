use crate::{
    error::Result,
    models::*,
    Storage,
};
use tauri::{command, AppHandle, Runtime, State};

#[command]
pub async fn set_item<R: Runtime>(
    _app: AppHandle<R>,
    options: SetItemOptions,
    storage: State<'_, Storage>,
) -> Result<()> {
    let service = storage.service();
    let service = service.lock().await;
    service.set_item(options).await
}

#[command]
pub async fn get_item<R: Runtime>(
    _app: AppHandle<R>,
    options: GetItemOptions,
    storage: State<'_, Storage>,
) -> Result<StorageItem> {
    let service = storage.service();
    let service = service.lock().await;
    service.get_item(options).await
}

#[command]
pub async fn remove_item<R: Runtime>(
    _app: AppHandle<R>,
    options: RemoveItemOptions,
    storage: State<'_, Storage>,
) -> Result<()> {
    let service = storage.service();
    let service = service.lock().await;
    service.remove_item(options).await
}

#[command]
pub async fn clear<R: Runtime>(
    _app: AppHandle<R>,
    options: ClearOptions,
    storage: State<'_, Storage>,
) -> Result<()> {
    let service = storage.service();
    let service = service.lock().await;
    service.clear(options).await
}

#[command]
pub async fn list_keys<R: Runtime>(
    _app: AppHandle<R>,
    options: ListKeysOptions,
    storage: State<'_, Storage>,
) -> Result<Vec<KeyInfo>> {
    let service = storage.service();
    let service = service.lock().await;
    service.list_keys(options).await
}

#[command]
pub async fn set_encrypted_item<R: Runtime>(
    _app: AppHandle<R>,
    options: SetEncryptedItemOptions,
    storage: State<'_, Storage>,
) -> Result<()> {
    let service = storage.service();
    let service = service.lock().await;
    service.set_encrypted_item(options).await
}

#[command]
pub async fn get_encrypted_item<R: Runtime>(
    _app: AppHandle<R>,
    options: GetEncryptedItemOptions,
    storage: State<'_, Storage>,
) -> Result<serde_json::Value> {
    let service = storage.service();
    let service = service.lock().await;
    service.get_encrypted_item(options).await
}

#[command]
pub async fn set_storage_path<R: Runtime>(
    _app: AppHandle<R>,
    path: String,
    storage: State<'_, Storage>,
) -> Result<()> {
    let service = storage.service();
    let service = service.lock().await;
    service.set_storage_path(path.into()).await
}

#[command]
pub async fn get_storage_path<R: Runtime>(
    _app: AppHandle<R>,
    storage: State<'_, Storage>,
) -> Result<String> {
    let service = storage.service();
    let service = service.lock().await;
    let path = service.get_storage_path().await?;
    Ok(path.to_string_lossy().to_string())
}

#[command]
pub async fn exists<R: Runtime>(
    _app: AppHandle<R>,
    options: GetItemOptions,
    storage: State<'_, Storage>,
) -> Result<bool> {
    let service = storage.service();
    let service = service.lock().await;
    service.exists(options).await
}

#[command]
pub async fn get_storage_info<R: Runtime>(
    _app: AppHandle<R>,
    namespace: Option<String>,
    storage: State<'_, Storage>,
) -> Result<StorageInfo> {
    let service = storage.service();
    let service = service.lock().await;
    service.get_storage_info(namespace).await
}