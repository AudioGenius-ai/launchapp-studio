// Re-export Git types from @code-pilot/types
export type {
  GitStatus,
  GitFileChange,
  GitBranch,
  GitCommit,
  GitRemote,
  GitDiff,
  GitConfig
} from '@code-pilot/types';

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