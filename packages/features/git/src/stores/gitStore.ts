import { create } from 'zustand';
import { GitStatus, GitBranch, GitCommit, GitRemote } from '@code-pilot/types';
import { gitService } from '@code-pilot/core';

export interface GitState {
  // Repository state
  currentRepo: string | null;
  status: GitStatus | null;
  branches: GitBranch[];
  currentBranch: string | null;
  remotes: GitRemote[];
  commits: GitCommit[];
  
  // UI state
  loading: boolean;
  error: string | null;
  selectedFiles: Set<string>;
  showCommitDialog: boolean;
  showBranchDialog: boolean;
  
  // Actions
  setCurrentRepo: (repo: string | null) => void;
  refreshStatus: () => Promise<void>;
  refreshBranches: () => Promise<void>;
  refreshCommits: (limit?: number) => Promise<void>;
  
  // File operations
  stageFile: (filePath: string) => Promise<void>;
  unstageFile: (filePath: string) => Promise<void>;
  stageAll: () => Promise<void>;
  unstageAll: () => Promise<void>;
  
  // Commit operations
  commit: (message: string) => Promise<void>;
  setShowCommitDialog: (show: boolean) => void;
  
  // Branch operations
  switchBranch: (branchName: string) => Promise<void>;
  createBranch: (branchName: string) => Promise<void>;
  deleteBranch: (branchName: string) => Promise<void>;
  setShowBranchDialog: (show: boolean) => void;
  
  // Remote operations
  pull: () => Promise<void>;
  push: () => Promise<void>;
  fetch: () => Promise<void>;
  
  // Selection
  selectFile: (filePath: string, selected: boolean) => void;
  selectAllFiles: (filePaths: string[], selected: boolean) => void;
  clearSelection: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGitStore = create<GitState>((set, get) => ({
  // Initial state
  currentRepo: null,
  status: null,
  branches: [],
  currentBranch: null,
  remotes: [],
  commits: [],
  loading: false,
  error: null,
  selectedFiles: new Set(),
  showCommitDialog: false,
  showBranchDialog: false,
  
  // Actions
  setCurrentRepo: (repo) => set({ currentRepo: repo }),
  
  refreshStatus: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    set({ loading: true, error: null });
    try {
      const status = await gitService.getStatus(currentRepo);
      set({ status, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },
  
  refreshBranches: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      const branches = await gitService.getBranches(currentRepo);
      const currentBranch = branches.find(b => b.isCurrent)?.name || null;
      set({ branches, currentBranch });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  refreshCommits: async (limit = 50) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      const commits = await gitService.getLog(currentRepo, { maxCount: limit });
      set({ commits });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  // File operations
  stageFile: async (filePath) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      await gitService.stageFile(currentRepo, filePath);
      await get().refreshStatus();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  unstageFile: async (filePath) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      await gitService.unstageFile(currentRepo, filePath);
      await get().refreshStatus();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  stageAll: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      await gitService.stageAll(currentRepo);
      await get().refreshStatus();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  unstageAll: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      await gitService.unstageAll(currentRepo);
      await get().refreshStatus();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  // Commit operations
  commit: async (message) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    set({ loading: true, error: null });
    try {
      await gitService.commit(currentRepo, { message });
      await get().refreshStatus();
      await get().refreshCommits();
      set({ loading: false, showCommitDialog: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },
  
  setShowCommitDialog: (show) => set({ showCommitDialog: show }),
  
  // Branch operations
  switchBranch: async (branchName) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    set({ loading: true, error: null });
    try {
      await gitService.checkout(currentRepo, { branch: branchName });
      await get().refreshStatus();
      await get().refreshBranches();
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },
  
  createBranch: async (branchName) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      await gitService.createBranch(currentRepo, branchName);
      await get().refreshBranches();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  deleteBranch: async (branchName) => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    try {
      await gitService.deleteBranch(currentRepo, branchName);
      await get().refreshBranches();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  },
  
  setShowBranchDialog: (show) => set({ showBranchDialog: show }),
  
  // Remote operations
  pull: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    set({ loading: true, error: null });
    try {
      // TODO: Implement pull - not available in gitService yet
      console.warn('Pull operation not implemented');
      await get().refreshStatus();
      await get().refreshCommits();
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },
  
  push: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    set({ loading: true, error: null });
    try {
      // TODO: Implement push - not available in gitService yet
      console.warn('Push operation not implemented');
      await get().refreshStatus();
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },
  
  fetch: async () => {
    const { currentRepo } = get();
    if (!currentRepo) return;
    
    set({ loading: true, error: null });
    try {
      // TODO: Implement fetch - not available in gitService yet
      console.warn('Fetch operation not implemented');
      await get().refreshStatus();
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },
  
  // Selection
  selectFile: (filePath, selected) => {
    set((state) => {
      const newSelectedFiles = new Set(state.selectedFiles);
      if (selected) {
        newSelectedFiles.add(filePath);
      } else {
        newSelectedFiles.delete(filePath);
      }
      return { selectedFiles: newSelectedFiles };
    });
  },
  
  selectAllFiles: (filePaths, selected) => {
    set({
      selectedFiles: selected ? new Set(filePaths) : new Set()
    });
  },
  
  clearSelection: () => set({ selectedFiles: new Set() }),
  
  // Error handling
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));