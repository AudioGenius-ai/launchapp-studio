/**
 * Environment configuration and detection
 */

// Environment types
export type Environment = 'development' | 'production' | 'test';

// Current environment
export const ENV: Environment = import.meta.env.MODE as Environment || 'development';

// Environment flags
export const isDevelopment = ENV === 'development';
export const isProduction = ENV === 'production';
export const isTest = ENV === 'test';

// Tauri specific
export const isTauri = window.__TAURI__ !== undefined;
export const isBrowser = !isTauri;

// Platform detection
export const platform = {
  isMac: navigator.platform.toUpperCase().indexOf('MAC') >= 0,
  isWindows: navigator.platform.toUpperCase().indexOf('WIN') >= 0,
  isLinux: navigator.platform.toUpperCase().indexOf('LINUX') >= 0,
};

// Feature availability based on environment
export const features = {
  // Development tools
  devTools: isDevelopment,
  debugging: isDevelopment,
  hotReload: isDevelopment,
  
  // Production features
  analytics: isProduction,
  errorReporting: isProduction,
  updateCheck: isProduction && isTauri,
  
  // Platform specific
  nativeMenus: isTauri,
  systemTray: isTauri,
  notifications: isTauri || 'Notification' in window,
};

// API endpoints based on environment
export const endpoints = {
  api: isDevelopment 
    ? 'http://localhost:3001/api'
    : 'https://api.codepilot.studio',
  
  updates: 'https://updates.codepilot.studio',
  telemetry: 'https://telemetry.codepilot.studio',
};

// Logging configuration
export const logging = {
  level: isDevelopment ? 'debug' : 'error',
  console: isDevelopment,
  file: isProduction && isTauri,
  remote: isProduction,
};

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string | undefined {
  if (isTauri) {
    // In Tauri, environment variables are accessed differently
    return import.meta.env[key] || fallback;
  }
  return process.env[key] || fallback;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof features): boolean {
  return features[feature] === true;
}

/**
 * Get the appropriate keyboard modifier key for the platform
 */
export function getModifierKey(): string {
  return platform.isMac ? 'Cmd' : 'Ctrl';
}