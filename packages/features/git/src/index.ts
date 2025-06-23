// Components
export * from './components';

// Stores
export * from './stores';

// Hooks
export * from './hooks';

// Services
export * from './services';

// Types - export everything except the conflicting names
export type {
  // Core Git types
  GitRepository,
  GitRepositoryState,
  GitFileChange,
  GitFileStatus,
  GitStatusFile,
  GitAuthor,
  GitRemote,
  GitTag,
  GitDiffFile,
  GitDiffHunk,
  GitDiffLine,
  GitDiffStats,
  GitStashEntry,
  GitBlame,
  GitBlameLine,
  GitRepositoryInfo,
  GitConfig,
  GitEvents,
  
  // Git operation options
  GitCommitOptions,
  GitFetchOptions,
  GitPullOptions,
  GitPushOptions,
  GitCheckoutOptions,
  GitMergeOptions,
  GitResetOptions,
  GitStashOptions,
  GitLogOptions,
  
  // Feature-specific types
  GitPanelConfig,
  GitOperationResult,
  GitFileSelection
} from './types';

// Re-export types with conflicting names using aliases
export type {
  GitStatus as GitStatusType,
  GitBranch as GitBranchType,
  GitCommit as GitCommitType,
  GitDiff as GitDiffType
} from './types';

// Export the DEFAULT_GIT_CONFIG constant
export { DEFAULT_GIT_CONFIG } from './types';