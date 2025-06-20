// Shared type definitions

// Project types
export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  gitEnabled: boolean;
  defaultBranch: string;
  aiProvider?: string;
  extensions: string[];
}

// Session types
export interface Session {
  id: string;
  projectId: string;
  name: string;
  status: SessionStatus;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SessionStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Archived = 'archived'
}

// AI types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// IPC types for Tauri
export interface TauriCommand<T = any, R = any> {
  name: string;
  payload: T;
  response: R;
}

// Export project types
export * from './project';

// Export filesystem types
export * from './filesystem';

// Export editor types
export * from './editor';