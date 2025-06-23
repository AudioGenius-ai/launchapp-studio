// Note: @tauri-apps/plugin-store import will be available at runtime
// Using any type for now as the plugin may not be available during build
interface Store {
  set(key: string, value: any): Promise<void>;
  get<T>(key: string): Promise<T | null | undefined>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  entries<T>(): Promise<[string, T][]>;
  keys(): Promise<string[]>;
  values<T>(): Promise<T[]>;
  length(): Promise<number>;
  save(): Promise<void>;
}

// Dynamic import for Store
const loadStore = async (filename: string): Promise<Store> => {
  try {
    const { Store } = await import('@tauri-apps/plugin-store');
    return await Store.load(filename);
  } catch (error) {
    console.warn('Tauri store plugin not available, using mock implementation');
    // Return a mock implementation for development
    return {
      set: async () => {},
      get: async () => null,
      has: async () => false,
      delete: async () => false,
      clear: async () => {},
      entries: async () => [],
      keys: async () => [],
      values: async () => [],
      length: async () => 0,
      save: async () => {}
    } as Store;
  }
};

/**
 * Application storage service that wraps Tauri's store API
 * Provides a unified interface for persistent data storage
 */
export class AppStorageService {
  private static instance: AppStorageService;
  private stores: Map<string, Store> = new Map();
  
  private constructor() {}
  
  public static getInstance(): AppStorageService {
    if (!AppStorageService.instance) {
      AppStorageService.instance = new AppStorageService();
    }
    return AppStorageService.instance;
  }
  
  /**
   * Get or create a store with the given name
   */
  private async getStore(storeName: string): Promise<Store> {
    if (!this.stores.has(storeName)) {
      const store = await loadStore(`${storeName}.json`);
      this.stores.set(storeName, store);
    }
    return this.stores.get(storeName)!;
  }
  
  /**
   * Set a value in the specified store
   */
  async set<T>(storeName: string, key: string, value: T): Promise<void> {
    const store = await this.getStore(storeName);
    await store.set(key, value);
    await store.save();
  }
  
  /**
   * Get a value from the specified store
   */
  async get<T>(storeName: string, key: string): Promise<T | null> {
    const store = await this.getStore(storeName);
    const result = await store.get<T>(key);
    return result === undefined ? null : result;
  }
  
  /**
   * Get a value with a default fallback
   */
  async getOrDefault<T>(storeName: string, key: string, defaultValue: T): Promise<T> {
    const value = await this.get<T>(storeName, key);
    return value !== null ? value : defaultValue;
  }
  
  /**
   * Check if a key exists in the specified store
   */
  async has(storeName: string, key: string): Promise<boolean> {
    const store = await this.getStore(storeName);
    return await store.has(key);
  }
  
  /**
   * Delete a key from the specified store
   */
  async delete(storeName: string, key: string): Promise<boolean> {
    const store = await this.getStore(storeName);
    const result = await store.delete(key);
    await store.save();
    return result;
  }
  
  /**
   * Clear all data from the specified store
   */
  async clear(storeName: string): Promise<void> {
    const store = await this.getStore(storeName);
    await store.clear();
    await store.save();
  }
  
  /**
   * Get all entries from the specified store
   */
  async entries<T>(storeName: string): Promise<[string, T][]> {
    const store = await this.getStore(storeName);
    return await store.entries<T>();
  }
  
  /**
   * Get all keys from the specified store
   */
  async keys(storeName: string): Promise<string[]> {
    const store = await this.getStore(storeName);
    return await store.keys();
  }
  
  /**
   * Get all values from the specified store
   */
  async values<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName);
    return await store.values<T>();
  }
  
  /**
   * Get the number of entries in the specified store
   */
  async length(storeName: string): Promise<number> {
    const store = await this.getStore(storeName);
    return await store.length();
  }
  
  /**
   * Save all changes to disk for the specified store
   */
  async save(storeName: string): Promise<void> {
    const store = await this.getStore(storeName);
    await store.save();
  }
  
  /**
   * Save all changes to disk for all stores
   */
  async saveAll(): Promise<void> {
    const savePromises = Array.from(this.stores.values()).map(store => store.save());
    await Promise.all(savePromises);
  }
  
  /**
   * Reset and reload a store from disk
   */
  async reload(storeName: string): Promise<void> {
    if (this.stores.has(storeName)) {
      this.stores.delete(storeName);
    }
    await this.getStore(storeName);
  }
  
  /**
   * Convenience methods for common stores
   */
  
  // Settings store
  async setSetting<T>(key: string, value: T): Promise<void> {
    return this.set('settings', key, value);
  }
  
  async getSetting<T>(key: string): Promise<T | null> {
    return this.get<T>('settings', key);
  }
  
  async getSettingOrDefault<T>(key: string, defaultValue: T): Promise<T> {
    return this.getOrDefault('settings', key, defaultValue);
  }
  
  // User preferences store
  async setPreference<T>(key: string, value: T): Promise<void> {
    return this.set('preferences', key, value);
  }
  
  async getPreference<T>(key: string): Promise<T | null> {
    return this.get<T>('preferences', key);
  }
  
  async getPreferenceOrDefault<T>(key: string, defaultValue: T): Promise<T> {
    return this.getOrDefault('preferences', key, defaultValue);
  }
  
  // Cache store
  async setCache<T>(key: string, value: T): Promise<void> {
    return this.set('cache', key, value);
  }
  
  async getCache<T>(key: string): Promise<T | null> {
    return this.get<T>('cache', key);
  }
  
  async clearCache(): Promise<void> {
    return this.clear('cache');
  }
}

// Export singleton instance
export const appStorage = AppStorageService.getInstance();