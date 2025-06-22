/**
 * Application-wide constants
 */

// Application metadata
export const APP_NAME = 'Code Pilot Studio';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'AI-powered IDE for modern development';

// Window configuration
export const WINDOW_CONFIG = {
  MAIN: {
    title: APP_NAME,
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
  },
  PROJECT: {
    titlePrefix: 'Project -',
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
  },
};

// Panel configuration
export const PANEL_CONFIG = {
  DEFAULT_SIDEBAR_WIDTH: 260,
  MIN_SIDEBAR_WIDTH: 200,
  MAX_SIDEBAR_WIDTH: 600,
  DEFAULT_PANEL_HEIGHT: 200,
  MIN_PANEL_HEIGHT: 100,
  MAX_PANEL_HEIGHT: 600,
  ACTIVITY_BAR_WIDTH: 48,
};

// Editor configuration
export const EDITOR_CONFIG = {
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_FONT_FAMILY: 'Consolas, "Courier New", monospace',
  DEFAULT_TAB_SIZE: 2,
  DEFAULT_THEME: 'vs-dark',
  MAX_OPEN_TABS: 20,
};

// File system configuration
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  BINARY_FILE_EXTENSIONS: [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
    '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
    '.exe', '.dll', '.so', '.dylib',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv',
    '.ttf', '.otf', '.woff', '.woff2',
  ],
  IGNORED_PATTERNS: [
    'node_modules',
    '.git',
    '.vscode',
    '.idea',
    'dist',
    'build',
    'target',
    '*.log',
    '.DS_Store',
    'Thumbs.db',
  ],
};

// API configuration
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  RECENT_PROJECTS: 'recent_projects',
  WINDOW_STATE: 'window_state',
  EDITOR_STATE: 'editor_state',
  THEME_PREFERENCE: 'theme_preference',
  LAYOUT_STATE: 'layout_state',
};

// Keyboard shortcuts
export const DEFAULT_KEYBINDINGS = {
  'file.new': 'Ctrl+N',
  'file.open': 'Ctrl+O',
  'file.save': 'Ctrl+S',
  'file.saveAll': 'Ctrl+Shift+S',
  'file.close': 'Ctrl+W',
  'edit.undo': 'Ctrl+Z',
  'edit.redo': 'Ctrl+Shift+Z',
  'edit.cut': 'Ctrl+X',
  'edit.copy': 'Ctrl+C',
  'edit.paste': 'Ctrl+V',
  'edit.selectAll': 'Ctrl+A',
  'edit.find': 'Ctrl+F',
  'edit.replace': 'Ctrl+H',
  'view.toggleSidebar': 'Ctrl+B',
  'view.toggleTerminal': 'Ctrl+`',
  'view.command': 'Ctrl+Shift+P',
  'terminal.new': 'Ctrl+Shift+`',
  'terminal.clear': 'Ctrl+K',
};