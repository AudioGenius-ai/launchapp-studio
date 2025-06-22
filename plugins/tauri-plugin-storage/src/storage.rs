use crate::{
    crypto::CryptoService,
    error::{Error, Result},
    models::*,
};
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tokio::sync::RwLock;

pub struct StorageService {
    config: RwLock<StorageConfig>,
    cache: RwLock<HashMap<String, StorageItem>>,
}

impl StorageService {
    pub fn new() -> Self {
        Self {
            config: RwLock::new(StorageConfig::default()),
            cache: RwLock::new(HashMap::new()),
        }
    }

    pub async fn set_storage_path(&self, path: PathBuf) -> Result<()> {
        let mut config = self.config.write().await;
        config.base_path = path;
        self.ensure_storage_dir(&config).await?;
        Ok(())
    }

    pub async fn get_storage_path(&self) -> Result<PathBuf> {
        let config = self.config.read().await;
        Ok(config.base_path.clone())
    }

    async fn ensure_storage_dir(&self, config: &StorageConfig) -> Result<()> {
        let path = self.get_namespace_path(&config.base_path, &config.namespace);
        fs::create_dir_all(&path)?;
        Ok(())
    }

    fn get_namespace_path(&self, base: &Path, namespace: &Option<String>) -> PathBuf {
        match namespace {
            Some(ns) => base.join(ns),
            None => base.to_path_buf(),
        }
    }

    fn get_item_path(&self, base: &Path, namespace: &Option<String>, key: &str) -> PathBuf {
        self.get_namespace_path(base, namespace)
            .join(format!("{}.json", self.sanitize_key(key)))
    }

    fn get_encrypted_item_path(&self, base: &Path, namespace: &Option<String>, key: &str) -> PathBuf {
        self.get_namespace_path(base, namespace)
            .join(format!("{}.enc", self.sanitize_key(key)))
    }

    fn sanitize_key(&self, key: &str) -> String {
        key.chars()
            .map(|c| match c {
                '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
                _ => c,
            })
            .collect()
    }

    fn get_timestamp(&self) -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0)
    }

    pub async fn set_item(&self, options: SetItemOptions) -> Result<()> {
        let config = self.config.read().await;
        self.ensure_storage_dir(&config).await?;

        let item = StorageItem {
            key: options.key.clone(),
            value: options.value,
            created_at: self.get_timestamp(),
            updated_at: self.get_timestamp(),
            metadata: options.metadata,
        };

        let path = self.get_item_path(&config.base_path, &options.namespace, &options.key);
        let data = serde_json::to_string_pretty(&item)?;
        fs::write(&path, data)?;

        // Update cache
        let mut cache = self.cache.write().await;
        let cache_key = self.make_cache_key(&options.namespace, &options.key);
        cache.insert(cache_key, item);

        Ok(())
    }

    pub async fn get_item(&self, options: GetItemOptions) -> Result<StorageItem> {
        // Check cache first
        let cache = self.cache.read().await;
        let cache_key = self.make_cache_key(&options.namespace, &options.key);
        if let Some(item) = cache.get(&cache_key) {
            return Ok(item.clone());
        }
        drop(cache);

        let config = self.config.read().await;
        let path = self.get_item_path(&config.base_path, &options.namespace, &options.key);

        if !path.exists() {
            return Err(Error::ItemNotFound(options.key));
        }

        let data = fs::read_to_string(&path)?;
        let item: StorageItem = serde_json::from_str(&data)?;

        // Update cache
        let mut cache = self.cache.write().await;
        cache.insert(cache_key, item.clone());

        Ok(item)
    }

    pub async fn set_encrypted_item(&self, options: SetEncryptedItemOptions) -> Result<()> {
        let config = self.config.read().await;
        self.ensure_storage_dir(&config).await?;

        // Generate crypto components
        let salt = CryptoService::generate_salt();
        let nonce = CryptoService::generate_nonce();
        let key = CryptoService::derive_key(&options.password, &salt)?;

        // Serialize and encrypt the value
        let value_bytes = serde_json::to_vec(&options.value)?;
        let encrypted_data = CryptoService::encrypt(&value_bytes, &key, &nonce)?;

        let item = EncryptedStorageItem {
            key: options.key.clone(),
            encrypted_data: CryptoService::encode_base64(&encrypted_data),
            nonce: CryptoService::encode_base64(&nonce),
            salt: CryptoService::encode_base64(&salt),
            created_at: self.get_timestamp(),
            updated_at: self.get_timestamp(),
            metadata: options.metadata,
        };

        let path = self.get_encrypted_item_path(&config.base_path, &options.namespace, &options.key);
        let data = serde_json::to_string_pretty(&item)?;
        fs::write(&path, data)?;

        Ok(())
    }

    pub async fn get_encrypted_item(&self, options: GetEncryptedItemOptions) -> Result<serde_json::Value> {
        let config = self.config.read().await;
        let path = self.get_encrypted_item_path(&config.base_path, &options.namespace, &options.key);

        if !path.exists() {
            return Err(Error::ItemNotFound(options.key));
        }

        let data = fs::read_to_string(&path)?;
        let item: EncryptedStorageItem = serde_json::from_str(&data)?;

        // Decode components
        let encrypted_data = CryptoService::decode_base64(&item.encrypted_data)?;
        let nonce = CryptoService::decode_base64(&item.nonce)?;
        let salt = CryptoService::decode_base64(&item.salt)?;

        // Derive key and decrypt
        let key = CryptoService::derive_key(&options.password, &salt)?;
        let decrypted_data = CryptoService::decrypt(&encrypted_data, &key, &nonce)?;

        // Parse decrypted JSON
        let value: serde_json::Value = serde_json::from_slice(&decrypted_data)?;

        Ok(value)
    }

    pub async fn remove_item(&self, options: RemoveItemOptions) -> Result<()> {
        let config = self.config.read().await;
        
        // Try to remove both regular and encrypted versions
        let regular_path = self.get_item_path(&config.base_path, &options.namespace, &options.key);
        let encrypted_path = self.get_encrypted_item_path(&config.base_path, &options.namespace, &options.key);

        let mut removed = false;
        if regular_path.exists() {
            fs::remove_file(regular_path)?;
            removed = true;
        }
        if encrypted_path.exists() {
            fs::remove_file(encrypted_path)?;
            removed = true;
        }

        if !removed {
            return Err(Error::ItemNotFound(options.key.clone()));
        }

        // Remove from cache
        let mut cache = self.cache.write().await;
        let cache_key = self.make_cache_key(&options.namespace, &options.key);
        cache.remove(&cache_key);

        Ok(())
    }

    pub async fn list_keys(&self, options: ListKeysOptions) -> Result<Vec<KeyInfo>> {
        let config = self.config.read().await;
        let dir = self.get_namespace_path(&config.base_path, &options.namespace);

        if !dir.exists() {
            return Ok(Vec::new());
        }

        let mut keys = Vec::new();
        let entries = fs::read_dir(&dir)?;

        for entry in entries {
            let entry = entry?;
            let path = entry.path();
            
            if let Some(file_name) = path.file_name() {
                let file_str = file_name.to_string_lossy();
                
                // Handle regular items
                if file_str.ends_with(".json") {
                    let key = file_str.trim_end_matches(".json").to_string();
                    let metadata = fs::metadata(&path)?;
                    
                    let data = fs::read_to_string(&path)?;
                    let item: StorageItem = serde_json::from_str(&data)?;
                    
                    keys.push(KeyInfo {
                        key,
                        is_encrypted: false,
                        size: metadata.len(),
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        metadata: item.metadata,
                    });
                }
                
                // Handle encrypted items
                else if file_str.ends_with(".enc") && options.include_encrypted {
                    let key = file_str.trim_end_matches(".enc").to_string();
                    let metadata = fs::metadata(&path)?;
                    
                    let data = fs::read_to_string(&path)?;
                    let item: EncryptedStorageItem = serde_json::from_str(&data)?;
                    
                    keys.push(KeyInfo {
                        key,
                        is_encrypted: true,
                        size: metadata.len(),
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        metadata: item.metadata,
                    });
                }
            }
        }

        Ok(keys)
    }

    pub async fn clear(&self, options: ClearOptions) -> Result<()> {
        let config = self.config.read().await;
        let dir = self.get_namespace_path(&config.base_path, &options.namespace);

        if !dir.exists() {
            return Ok(());
        }

        let entries = fs::read_dir(&dir)?;
        for entry in entries {
            let entry = entry?;
            let path = entry.path();
            
            if let Some(file_name) = path.file_name() {
                let file_str = file_name.to_string_lossy();
                
                // Remove regular items
                if file_str.ends_with(".json") {
                    fs::remove_file(&path)?;
                }
                
                // Remove encrypted items if requested
                else if file_str.ends_with(".enc") && options.include_encrypted {
                    fs::remove_file(&path)?;
                }
            }
        }

        // Clear cache
        self.cache.write().await.clear();

        Ok(())
    }

    pub async fn exists(&self, options: GetItemOptions) -> Result<bool> {
        let config = self.config.read().await;
        let regular_path = self.get_item_path(&config.base_path, &options.namespace, &options.key);
        let encrypted_path = self.get_encrypted_item_path(&config.base_path, &options.namespace, &options.key);
        
        Ok(regular_path.exists() || encrypted_path.exists())
    }

    pub async fn get_storage_info(&self, namespace: Option<String>) -> Result<StorageInfo> {
        let config = self.config.read().await;
        let dir = self.get_namespace_path(&config.base_path, &namespace);

        let mut total_items = 0;
        let mut encrypted_items = 0;
        let mut total_size = 0;

        if dir.exists() {
            let entries = fs::read_dir(&dir)?;
            for entry in entries {
                let entry = entry?;
                let path = entry.path();
                let metadata = fs::metadata(&path)?;
                
                if let Some(file_name) = path.file_name() {
                    let file_str = file_name.to_string_lossy();
                    
                    if file_str.ends_with(".json") {
                        total_items += 1;
                        total_size += metadata.len();
                    } else if file_str.ends_with(".enc") {
                        total_items += 1;
                        encrypted_items += 1;
                        total_size += metadata.len();
                    }
                }
            }
        }

        Ok(StorageInfo {
            base_path: config.base_path.to_string_lossy().to_string(),
            namespace,
            total_items,
            encrypted_items,
            total_size,
        })
    }

    fn make_cache_key(&self, namespace: &Option<String>, key: &str) -> String {
        match namespace {
            Some(ns) => format!("{}:{}", ns, key),
            None => key.to_string(),
        }
    }
}