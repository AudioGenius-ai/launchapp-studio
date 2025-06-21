import { Settings, DEFAULT_SETTINGS, SettingsUpdateEvent } from '@code-pilot/types';
import { invoke } from '@tauri-apps/api/core';

export interface ISettingsService {
  loadSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  getSettings(): Settings;
  updateSettings(updates: Partial<Settings>): Promise<void>;
  getSetting<K extends keyof Settings>(key: K): Settings[K];
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;
  resetSettings(): Promise<void>;
  exportSettings(): Promise<string>;
  importSettings(data: string): Promise<void>;
  subscribeToChanges(callback: (event: SettingsUpdateEvent) => void): () => void;
}

export class SettingsService implements ISettingsService {
  private settings: Settings = DEFAULT_SETTINGS;
  private listeners: Set<(event: SettingsUpdateEvent) => void> = new Set();

  constructor() {
    this.loadSettings();
  }

  async loadSettings(): Promise<Settings> {
    try {
      const savedSettings = await invoke<string>('load_settings');
      if (savedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = DEFAULT_SETTINGS;
    }
    return this.settings;
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await invoke('save_settings', { settings: JSON.stringify(settings) });
      this.settings = settings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<Settings>): Promise<void> {
    const previousSettings = { ...this.settings };
    const newSettings = this.deepMerge(this.settings, updates);
    
    await this.saveSettings(newSettings);
    
    // Notify listeners of changes
    this.notifyChanges(previousSettings, newSettings);
  }

  getSetting<K extends keyof Settings>(key: K): Settings[K] {
    return this.settings[key];
  }

  async setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    const previousValue = this.settings[key];
    await this.updateSettings({ [key]: value } as Partial<Settings>);
    
    this.notifyListeners({
      key: key as string,
      value,
      previousValue,
    });
  }

  async resetSettings(): Promise<void> {
    await this.saveSettings(DEFAULT_SETTINGS);
    this.notifyListeners({
      key: 'all',
      value: DEFAULT_SETTINGS,
      previousValue: this.settings,
    });
  }

  async exportSettings(): Promise<string> {
    return JSON.stringify(this.settings, null, 2);
  }

  async importSettings(data: string): Promise<void> {
    try {
      const importedSettings = JSON.parse(data);
      const validatedSettings = this.validateSettings(importedSettings);
      await this.saveSettings(validatedSettings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  subscribeToChanges(callback: (event: SettingsUpdateEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: SettingsUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in settings listener:', error);
      }
    });
  }

  private notifyChanges(previousSettings: Settings, newSettings: Settings): void {
    const changes = this.detectChanges(previousSettings, newSettings);
    changes.forEach(change => this.notifyListeners(change));
  }

  private detectChanges(prev: any, curr: any, path: string = ''): SettingsUpdateEvent[] {
    const changes: SettingsUpdateEvent[] = [];

    for (const key in curr) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof curr[key] === 'object' && curr[key] !== null && !Array.isArray(curr[key])) {
        changes.push(...this.detectChanges(prev[key] || {}, curr[key], currentPath));
      } else if (JSON.stringify(prev[key]) !== JSON.stringify(curr[key])) {
        changes.push({
          key: currentPath,
          value: curr[key],
          previousValue: prev[key],
        });
      }
    }

    return changes;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof result[key] === 'object' &&
          result[key] !== null &&
          !Array.isArray(result[key])
        ) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  private validateSettings(settings: any): Settings {
    // Basic validation - ensure required structure exists
    if (!settings || typeof settings !== 'object') {
      throw new Error('Invalid settings object');
    }

    // Merge with defaults to ensure all required fields exist
    const validated = this.deepMerge(DEFAULT_SETTINGS, settings);

    // Update metadata
    validated.version = DEFAULT_SETTINGS.version;
    validated.lastUpdated = new Date().toISOString();

    return validated;
  }
}

// Singleton instance
let settingsServiceInstance: SettingsService | null = null;

export function getSettingsService(): SettingsService {
  if (!settingsServiceInstance) {
    settingsServiceInstance = new SettingsService();
  }
  return settingsServiceInstance;
}