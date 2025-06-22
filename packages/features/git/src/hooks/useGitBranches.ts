import { useEffect } from 'react';
import { useGitStore } from '../stores/gitStore';

export const useGitBranches = (repoPath?: string, autoRefresh = true) => {
  const {
    branches,
    currentBranch,
    setCurrentRepo,
    refreshBranches,
    switchBranch,
    createBranch,
    deleteBranch,
    loading,
    error
  } = useGitStore();

  useEffect(() => {
    if (repoPath) {
      setCurrentRepo(repoPath);
      if (autoRefresh) {
        refreshBranches();
      }
    }
  }, [repoPath, autoRefresh]);

  return {
    branches,
    currentBranch,
    refreshBranches,
    switchBranch,
    createBranch,
    deleteBranch,
    loading,
    error
  };
};