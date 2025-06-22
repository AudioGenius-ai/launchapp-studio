import { useEffect } from 'react';
import { useGitStore } from '../stores/gitStore';

export const useGitCommits = (repoPath?: string, limit = 50, autoRefresh = true) => {
  const {
    commits,
    setCurrentRepo,
    refreshCommits,
    commit,
    loading,
    error
  } = useGitStore();

  useEffect(() => {
    if (repoPath) {
      setCurrentRepo(repoPath);
      if (autoRefresh) {
        refreshCommits(limit);
      }
    }
  }, [repoPath, limit, autoRefresh]);

  return {
    commits,
    refreshCommits,
    commit,
    loading,
    error
  };
};