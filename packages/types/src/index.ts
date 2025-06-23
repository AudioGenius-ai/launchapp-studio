// Core shared type definitions
// This package should only contain types that are truly shared across multiple packages

// ============================================
// Core Domain Types
// ============================================

// Generic Session type - not AI-specific
export interface Session {
  id: string;
  projectId: string;
  name: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum SessionStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Archived = 'archived'
}

// Generic Message type - used in multiple contexts
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================================
// Utility Types
// ============================================

// IPC types for Tauri
export interface TauriCommand<T = any, R = any> {
  name: string;
  payload: T;
  response: R;
}

// Common error type
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Common result type
export type Result<T, E = AppError> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// ============================================
// Shared Types from Other Files
// ============================================

// Only export truly shared types from other files
// From project.ts - these are core domain types
export type {
  Project,
  ProjectSettings,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQuery,
  ProjectListResponse,
  ProjectValidation,
  ProjectEventPayload
} from './project';

export { ProjectEvent } from './project'

// From filesystem.ts - used by multiple features
export type {
  FileSystemNode,
  FileOperation,
  FileWatchEvent,
  FileSearchOptions,
  FileTreeState,
  FileIconType,
  FileTypeMapping
} from './filesystem';

export {
  FILE_TYPE_MAPPINGS,
  getFileIcon,
  isTextFile
} from './filesystem';

// From settings.ts - core app settings
export type {
  GeneralSettings,
  Settings,
  SettingsKey,
  SettingsValue,
  SettingsUpdateEvent
} from './settings';

export { DEFAULT_SETTINGS } from './settings';

// From theme.ts - shared across UI
export type {
  ThemeMode,
  ThemeColors,
  Theme,
  ThemeFonts,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeTransitions,
  ThemeZIndex,
  CustomTheme,
  ThemePreferences,
  ThemeProviderProps,
  ThemeContextValue,
  CSSVariableMap
} from './theme';

export { isCustomTheme } from './theme';

// ============================================
// MIGRATION COMPLETE
// ============================================

// All feature-specific types have been migrated to their respective packages:
// - AI types → @code-pilot/feature-ai
// - Git types → @code-pilot/feature-git
// - Terminal types → @code-pilot/feature-terminal
// - Editor types → @code-pilot/feature-editor
// - Template types → @code-pilot/feature-templates
// - Window types → @code-pilot/feature-window-management
// - Tab types → @code-pilot/feature-editor