import { StateStorage } from 'zustand/middleware';
import { appStorage } from '@code-pilot/services';

export const createTauriStorage = (key: string): StateStorage => {
  return {
    getItem: async (name: string) => {
      try {
        const value = await appStorage.get(name);
        return value ? JSON.stringify(value) : null;
      } catch (error) {
        console.error(`Error reading from storage: ${name}`, error);
        return null;
      }
    },
    setItem: async (name: string, value: string) => {
      try {
        const parsed = JSON.parse(value);
        await appStorage.set(name, parsed);
      } catch (error) {
        console.error(`Error writing to storage: ${name}`, error);
      }
    },
    removeItem: async (name: string) => {
      try {
        await appStorage.remove(name);
      } catch (error) {
        console.error(`Error removing from storage: ${name}`, error);
      }
    }
  };
};