import { invoke } from '@tauri-apps/api/core';

export interface StorageItem {
  key: string;
  value: any;
  createdAt: number;
  updatedAt: number;
  metadata?: any;
}

export interface EncryptedStorageItem {
  key: string;
  encryptedData: string;
  nonce: string;
  salt: string;
  createdAt: number;
  updatedAt: number;
  metadata?: any;
}

export interface StorageInfo {
  basePath: string;
  namespace?: string;
  totalItems: number;
  encryptedItems: number;
  totalSize: number;
}

export interface SetItemOptions {
  key: string;
  value: any;
  namespace?: string;
  metadata?: any;
}

export interface SetEncryptedItemOptions {
  key: string;
  value: any;
  password: string;
  namespace?: string;
  metadata?: any;
}

export interface GetItemOptions {
  key: string;
  namespace?: string;
}

export interface GetEncryptedItemOptions {
  key: string;
  password: string;
  namespace?: string;
}

export interface RemoveItemOptions {
  key: string;
  namespace?: string;
}

export interface ListKeysOptions {
  namespace?: string;
  includeEncrypted: boolean;
}

export interface ClearOptions {
  namespace?: string;
  includeEncrypted: boolean;
}

export interface KeyInfo {
  key: string;
  isEncrypted: boolean;
  size: number;
  createdAt: number;
  updatedAt: number;
  metadata?: any;
}

class StoragePlugin {
  async setItem(options: SetItemOptions): Promise<void> {
    return invoke('plugin:storage|set_item', { options });
  }

  async getItem(options: GetItemOptions): Promise<StorageItem> {
    return invoke('plugin:storage|get_item', { options });
  }

  async removeItem(options: RemoveItemOptions): Promise<void> {
    return invoke('plugin:storage|remove_item', { options });
  }

  async clear(options: ClearOptions = { includeEncrypted: false }): Promise<void> {
    return invoke('plugin:storage|clear', { options });
  }

  async listKeys(options: ListKeysOptions = { includeEncrypted: false }): Promise<KeyInfo[]> {
    return invoke('plugin:storage|list_keys', { options });
  }

  async setEncryptedItem(options: SetEncryptedItemOptions): Promise<void> {
    return invoke('plugin:storage|set_encrypted_item', { options });
  }

  async getEncryptedItem(options: GetEncryptedItemOptions): Promise<any> {
    return invoke('plugin:storage|get_encrypted_item', { options });
  }

  async setStoragePath(path: string): Promise<void> {
    return invoke('plugin:storage|set_storage_path', { path });
  }

  async getStoragePath(): Promise<string> {
    return invoke('plugin:storage|get_storage_path');
  }

  async exists(options: GetItemOptions): Promise<boolean> {
    return invoke('plugin:storage|exists', { options });
  }

  async getStorageInfo(namespace?: string): Promise<StorageInfo> {
    return invoke('plugin:storage|get_storage_info', { namespace });
  }
}

// Create singleton instance
const storage = new StoragePlugin();

// Export convenience functions
export async function setItem(key: string, value: any, namespace?: string, metadata?: any): Promise<void> {
  return storage.setItem({ key, value, namespace, metadata });
}

export async function getItem(key: string, namespace?: string): Promise<any> {
  const item = await storage.getItem({ key, namespace });
  return item.value;
}

export async function removeItem(key: string, namespace?: string): Promise<void> {
  return storage.removeItem({ key, namespace });
}

export async function clear(namespace?: string, includeEncrypted = false): Promise<void> {
  return storage.clear({ namespace, includeEncrypted });
}

export async function listKeys(namespace?: string, includeEncrypted = false): Promise<KeyInfo[]> {
  return storage.listKeys({ namespace, includeEncrypted });
}

export async function setEncryptedItem(key: string, value: any, password: string, namespace?: string, metadata?: any): Promise<void> {
  return storage.setEncryptedItem({ key, value, password, namespace, metadata });
}

export async function getEncryptedItem(key: string, password: string, namespace?: string): Promise<any> {
  return storage.getEncryptedItem({ key, password, namespace });
}

export async function setStoragePath(path: string): Promise<void> {
  return storage.setStoragePath(path);
}

export async function getStoragePath(): Promise<string> {
  return storage.getStoragePath();
}

export async function exists(key: string, namespace?: string): Promise<boolean> {
  return storage.exists({ key, namespace });
}

export async function getStorageInfo(namespace?: string): Promise<StorageInfo> {
  return storage.getStorageInfo(namespace);
}

// Export the class instance as default
export default storage;