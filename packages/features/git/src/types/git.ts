// Git Integration Types

export enum GitRepositoryState {
  NONE = 'NONE',
  MERGE = 'MERGE',
  REVERT = 'REVERT',
  REVERT_SEQUENCE = 'REVERT_SEQUENCE',
  CHERRY_PICK = 'CHERRY_PICK',
  CHERRY_PICK_SEQUENCE = 'CHERRY_PICK_SEQUENCE',
  BISECT = 'BISECT',
  REBASE = 'REBASE',
  REBASE_INTERACTIVE = 'REBASE_INTERACTIVE',
  REBASE_MERGE = 'REBASE_MERGE',
  APPLY_MAILBOX = 'APPLY_MAILBOX',
  APPLY_MAILBOX_OR_REBASE = 'APPLY_MAILBOX_OR_REBASE'
}

export interface GitRepository {
  path: string;
  workdir: string;
  gitdir: string;
  isBare: boolean;
  head: string;
  state: GitRepositoryState;
}

export interface GitFileChange {
  path: string;
  status: GitFileStatus;
  staged: boolean;
  unstaged: boolean;
  oldPath?: string;
}

export enum GitFileStatus {
  CURRENT = 'CURRENT',
  NEW = 'NEW', 
  MODIFIED = 'MODIFIED',
  DELETED = 'DELETED',
  RENAMED = 'RENAMED',
  COPIED = 'COPIED',
  UPDATED_BUT_UNMERGED = 'UPDATED_BUT_UNMERGED',
  IGNORED = 'IGNORED',
  UNTRACKED = 'UNTRACKED'
}

export interface GitStatus {
  files: GitStatusFile[];
  isClean: boolean;
  branch: string;
  ahead: number;
  behind: number;
  // Legacy properties for compatibility
  staged?: GitFileChange[];
  unstaged?: GitFileChange[];
  untracked?: string[];
  conflicted?: string[];
}

export interface GitStatusFile {
  path: string;
  status: GitFileStatus;
  staged: boolean;
  unstaged: boolean;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: GitAuthor;
  committer: GitAuthor;
  date: Date;
  parents: string[];
  refs: string[];
}

export interface GitAuthor {
  name: string;
  email: string;
  date: Date;
  timestamp?: number; // Unix timestamp
}

export interface GitBranch {
  name: string;
  isActive: boolean;
  isCurrent?: boolean; // Alias for isActive
  isRemote: boolean;
  upstream?: string;
  ahead?: number;
  behind?: number;
}

export interface GitRemote {
  name: string;
  url: string;
  fetch: string;
}

export interface GitTag {
  name: string;
  hash: string;
  date: Date;
  message?: string;
  tagger?: GitAuthor;
}

export interface GitDiff {
  files: GitDiffFile[];
  stats: GitDiffStats;
}

export interface GitDiffFile {
  path: string;
  oldPath?: string;
  status: GitFileStatus;
  hunks: GitDiffHunk[];
}

export interface GitDiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: GitDiffLine[];
}

export interface GitDiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface GitDiffStats {
  additions: number;
  deletions: number;
  files: number;
}

export interface GitStashEntry {
  index: number;
  message: string;
  hash: string;
  date: Date;
  branch: string;
}

export interface GitBlame {
  lines: GitBlameLine[];
}

export interface GitBlameLine {
  lineNumber: number;
  content: string;
  commit: GitCommit;
}

// Git Operation Options
export interface GitCommitOptions {
  message: string;
  amend?: boolean;
  author?: GitAuthor;
  allowEmpty?: boolean;
}

export interface GitFetchOptions {
  remote?: string;
  branch?: string;
  prune?: boolean;
}

export interface GitPullOptions {
  remote?: string;
  branch?: string;
  rebase?: boolean;
  fastForward?: boolean;
}

export interface GitPushOptions {
  remote?: string;
  branch?: string;
  force?: boolean;
  setUpstream?: boolean;
}

export interface GitCheckoutOptions {
  branch?: string;
  commit?: string;
  createBranch?: boolean;
  force?: boolean;
  paths?: string[];
}

export interface GitMergeOptions {
  branch: string;
  noCommit?: boolean;
  noFastForward?: boolean;
  strategy?: string;
}

export interface GitResetOptions {
  mode: 'soft' | 'mixed' | 'hard';
  commit?: string;
  paths?: string[];
}

export interface GitStashOptions {
  message?: string;
  includeUntracked?: boolean;
  keepIndex?: boolean;
}

export interface GitLogOptions {
  maxCount?: number;
  skip?: number;
  since?: Date;
  until?: Date;
  author?: string;
  path?: string;
  branch?: string;
}

// Git Events
export interface GitEvents {
  'statusChanged': { status: GitStatus };
  'branchChanged': { branch: string };
  'commitCreated': { commit: GitCommit };
  'fileStaged': { path: string };
  'fileUnstaged': { path: string };
  'stashCreated': { stash: GitStashEntry };
  'stashApplied': { stash: GitStashEntry };
  'repositoryChanged': { path: string };
}

// Repository Configuration
export interface GitConfig {
  key: string;
  value: string;
  scope: 'local' | 'global' | 'system';
}

export interface GitRepositoryInfo {
  path: string;
  workdir: string;
  gitdir: string;
  isBare: boolean;
  head: string;
  state: GitRepositoryState;
}

// Default configurations
export const DEFAULT_GIT_CONFIG = {
  maxCommitMessageLength: 50,
  maxCommitBodyLength: 72,
  defaultBranch: 'main',
  autoFetch: true,
  fetchInterval: 300000, // 5 minutes
  showUntrackedFiles: true,
  showIgnoredFiles: false
};