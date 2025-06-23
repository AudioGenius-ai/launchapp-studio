import { StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

// Type definitions for Tauri API
type TauriFS = {
  readTextFile: (path: string) => Promise<string>;
  writeTextFile: (path: string, contents: string) => Promise<void>;
  createDir: (dir: string, options?: { recursive?: boolean }) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  removeFile: (path: string) => Promise<void>;
};

type TauriPath = {
  appDataDir: () => Promise<string>;
  join: (...paths: string[]) => Promise<string>;
};

// Helper function to safely import Tauri modules
async function importTauriModules(): Promise<{ fs: TauriFS; path: TauriPath } | null> {
  try {
    // Check if we're in a Tauri environment first
    if (typeof window === 'undefined' || !(window as any).__TAURI__) {
      return null;
    }
    
    // Use function constructor to avoid TypeScript static analysis
    const importFs = new Function('return import("@tauri-apps/api/fs")');
    const importPath = new Function('return import("@tauri-apps/api/path")');
    
    const [fs, path] = await Promise.all([
      importFs().catch(() => null),
      importPath().catch(() => null)
    ]);
    
    if (!fs || !path) {
      return null;
    }
    
    return { fs: fs as TauriFS, path: path as TauriPath };
  } catch {
    return null;
  }
}

// Custom storage adapter for Tauri if available
export const createTauriStorage = (name: string) => {
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        const tauri = await importTauriModules();
        
        if (!tauri) {
          return localStorage.getItem(key);
        }
        
        const { fs, path } = tauri;
        const appDataDirPath = await path.appDataDir();
        const filePath = await path.join(appDataDirPath, 'stores', `${name}.json`);
        
        if (await fs.exists(filePath)) {
          const content = await fs.readTextFile(filePath);
          const data = JSON.parse(content);
          return data[key] || null;
        }
        
        return null;
      } catch (error) {
        console.warn(`Failed to read from Tauri storage: ${error}`);
        return localStorage.getItem(key);
      }
    },
    
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        const tauri = await importTauriModules();
        
        if (!tauri) {
          localStorage.setItem(key, value);
          return;
        }
        
        const { fs, path } = tauri;
        const appDataDirPath = await path.appDataDir();
        const storesDir = await path.join(appDataDirPath, 'stores');
        const filePath = await path.join(storesDir, `${name}.json`);
        
        // Ensure directory exists
        if (!(await fs.exists(storesDir))) {
          await fs.createDir(storesDir, { recursive: true });
        }
        
        // Read existing data or create new object
        let data: Record<string, string> = {};
        if (await fs.exists(filePath)) {
          try {
            const content = await fs.readTextFile(filePath);
            data = JSON.parse(content);
          } catch {
            // File exists but is corrupted, start fresh
          }
        }
        
        // Update data and write back
        data[key] = value;
        await fs.writeTextFile(filePath, JSON.stringify(data, null, 2));
      } catch (error) {
        console.warn(`Failed to write to Tauri storage: ${error}`);
        localStorage.setItem(key, value);
      }
    },
    
    removeItem: async (key: string): Promise<void> => {
      try {
        const tauri = await importTauriModules();
        
        if (!tauri) {
          localStorage.removeItem(key);
          return;
        }
        
        const { fs, path } = tauri;
        const appDataDirPath = await path.appDataDir();
        const filePath = await path.join(appDataDirPath, 'stores', `${name}.json`);
        
        if (await fs.exists(filePath)) {
          const content = await fs.readTextFile(filePath);
          const data = JSON.parse(content);
          delete data[key];
          await fs.writeTextFile(filePath, JSON.stringify(data, null, 2));
        }
      } catch (error) {
        console.warn(`Failed to remove from Tauri storage: ${error}`);
        localStorage.removeItem(key);
      }
    }
  };
};

// Create persisted store with custom options
export const createPersistedStore = <T>(
  storeName: string,
  config: StateCreator<T>,
  options?: Partial<PersistOptions<T>>
) => {
  const defaultOptions: PersistOptions<T> = {
    name: storeName,
    storage: createJSONStorage(() => createTauriStorage(storeName)),
    version: 1,
    migrate: (persistedState: any, version: number) => {
      // Handle migration between versions
      if (version === 0) {
        // Migration from version 0 to 1
        return persistedState;
      }
      return persistedState;
    },
    onRehydrateStorage: () => (state) => {
      console.log(`Store "${storeName}" rehydrated:`, state);
    }
  };
  
  return persist(config, { ...defaultOptions, ...options });
};

// Utility to clear all persisted data for a store
export const clearPersistedData = async (storeName: string) => {
  try {
    // Clear from localStorage
    localStorage.removeItem(storeName);
    
    // Clear from Tauri storage if available
    const tauri = await importTauriModules();
    
    if (tauri) {
      const { fs, path } = tauri;
      const appDataDirPath = await path.appDataDir();
      const filePath = await path.join(appDataDirPath, 'stores', `${storeName}.json`);
      
      if (await fs.exists(filePath)) {
        await fs.removeFile(filePath);
      }
    }
  } catch (error) {
    console.warn(`Failed to clear persisted data for "${storeName}":`, error);
  }
};

// Export commonly used persist configurations
export const persistConfigs = {
  // For stores that should persist everything
  full: (storeName: string) => ({
    name: storeName,
    storage: createJSONStorage(() => createTauriStorage(storeName))
  }),
  
  // For stores that should only persist user preferences
  preferences: <T>(storeName: string, preferencesKey: keyof T) => ({
    name: storeName,
    storage: createJSONStorage(() => createTauriStorage(storeName)),
    partialize: (state: T) => ({ [preferencesKey]: state[preferencesKey] })
  }),
  
  // For stores that need custom serialization (e.g., Maps, Sets)
  custom: <T>(
    storeName: string,
    serialize: (state: T) => any,
    deserialize: (state: any) => Partial<T>
  ) => ({
    name: storeName,
    storage: createJSONStorage(() => createTauriStorage(storeName)),
    partialize: serialize,
    onRehydrateStorage: () => (state: any) => {
      if (state) {
        const deserialized = deserialize(state);
        Object.assign(state, deserialized);
      }
    }
  })
};