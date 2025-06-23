import { StateStorage } from 'zustand/middleware';

// TODO: Import from @code-pilot/services once build issues are resolved
const appStorage = {
  get: async (storeName: string, key: string) => {
    const stored = localStorage.getItem(`${storeName}:${key}`);
    return stored ? JSON.parse(stored) : null;
  },
  set: async (storeName: string, key: string, value: any) => {
    localStorage.setItem(`${storeName}:${key}`, JSON.stringify(value));
  },
  delete: async (storeName: string, key: string) => {
    localStorage.removeItem(`${storeName}:${key}`);
  }
};

export const createTauriStorage = (storeName: string): StateStorage => {
  return {
    getItem: async (name: string) => {
      try {
        const value = await appStorage.get(storeName, name);
        return value ? JSON.stringify(value) : null;
      } catch (error) {
        console.error(`Error reading from storage: ${name}`, error);
        return null;
      }
    },
    setItem: async (name: string, value: string) => {
      try {
        const parsed = JSON.parse(value);
        await appStorage.set(storeName, name, parsed);
      } catch (error) {
        console.error(`Error writing to storage: ${name}`, error);
      }
    },
    removeItem: async (name: string) => {
      try {
        await appStorage.delete(storeName, name);
      } catch (error) {
        console.error(`Error removing from storage: ${name}`, error);
      }
    }
  };
};