// Export all Git types from local git.ts
export * from './git';

// Feature-specific types
export interface GitPanelConfig {
  defaultTab?: 'changes' | 'commit' | 'branches' | 'history';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface GitOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface GitFileSelection {
  files: string[];
  allSelected: boolean;
}