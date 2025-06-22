# Tauri Plugin Storage

A secure file-based storage plugin for Tauri applications with encryption support.

## Features

- **File-based storage**: Store data as JSON files on disk
- **Encryption support**: Securely store sensitive data with AES-256-GCM encryption
- **Key-value interface**: Simple API for storing and retrieving data
- **Namespaces**: Organize data into separate namespaces
- **Custom storage paths**: Configure where data is stored
- **Metadata support**: Attach metadata to stored items
- **Efficient caching**: In-memory cache for frequently accessed items

## Installation

1. Add the plugin to your Tauri app:

```rust
// src-tauri/src/lib.rs
use tauri_plugin_storage;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_storage::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

2. Add permissions to your app:

```json
// src-tauri/capabilities/default.json
{
  "permissions": [
    "storage:default"
  ]
}
```

## Usage

### Basic Storage

```typescript
import { setItem, getItem, removeItem, listKeys } from 'tauri-plugin-storage-api';

// Store a value
await setItem('user-preferences', {
  theme: 'dark',
  language: 'en'
});

// Retrieve a value
const preferences = await getItem('user-preferences');

// Remove a value
await removeItem('user-preferences');

// List all keys
const keys = await listKeys();
```

### Encrypted Storage

```typescript
import { setEncryptedItem, getEncryptedItem } from 'tauri-plugin-storage-api';

// Store encrypted data
await setEncryptedItem('api-key', 'secret-key-123', 'user-password');

// Retrieve encrypted data
const apiKey = await getEncryptedItem('api-key', 'user-password');
```

### Namespaces

```typescript
import { setItem, getItem } from 'tauri-plugin-storage-api';

// Store in a namespace
await setItem('settings', { notifications: true }, 'user-123');

// Retrieve from namespace
const settings = await getItem('settings', 'user-123');
```

### Custom Storage Path

```typescript
import { setStoragePath, getStoragePath } from 'tauri-plugin-storage-api';

// Set custom storage path
await setStoragePath('/custom/path/to/storage');

// Get current storage path
const path = await getStoragePath();
```

### Storage Info

```typescript
import { getStorageInfo, exists } from 'tauri-plugin-storage-api';

// Check if item exists
const itemExists = await exists('my-key');

// Get storage statistics
const info = await getStorageInfo();
console.log(`Total items: ${info.totalItems}`);
console.log(`Encrypted items: ${info.encryptedItems}`);
console.log(`Total size: ${info.totalSize} bytes`);
```

## Permissions

- `storage:default` - Basic read/write operations
- `storage:allow-all` - All operations including encryption
- `storage:allow-encrypted-operations` - Only encrypted operations
- `storage:allow-storage-management` - Path and info operations

## Security

- Encryption uses AES-256-GCM with Argon2 for key derivation
- Each encrypted item has a unique salt and nonce
- Passwords are never stored, only used for encryption/decryption
- File paths are sanitized to prevent directory traversal

## Storage Structure

```
~/.launchapp/
├── namespace1/
│   ├── key1.json
│   ├── key2.json
│   └── secret.enc
└── namespace2/
    ├── config.json
    └── token.enc
```

## API Reference

### Functions

- `setItem(key, value, namespace?, metadata?)` - Store a value
- `getItem(key, namespace?)` - Retrieve a value
- `removeItem(key, namespace?)` - Remove a value
- `clear(namespace?, includeEncrypted?)` - Clear storage
- `listKeys(namespace?, includeEncrypted?)` - List all keys
- `setEncryptedItem(key, value, password, namespace?, metadata?)` - Store encrypted
- `getEncryptedItem(key, password, namespace?)` - Retrieve encrypted
- `setStoragePath(path)` - Set storage location
- `getStoragePath()` - Get storage location
- `exists(key, namespace?)` - Check if item exists
- `getStorageInfo(namespace?)` - Get storage statistics

### Types

```typescript
interface StorageItem {
  key: string;
  value: any;
  createdAt: number;
  updatedAt: number;
  metadata?: any;
}

interface KeyInfo {
  key: string;
  isEncrypted: boolean;
  size: number;
  createdAt: number;
  updatedAt: number;
  metadata?: any;
}

interface StorageInfo {
  basePath: string;
  namespace?: string;
  totalItems: number;
  encryptedItems: number;
  totalSize: number;
}
```