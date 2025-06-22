import { useEffect } from 'react';
import { useGitStore } from '../stores/gitStore';

export const useGitStatus = (repoPath?: string, autoRefresh = true) => {
  const {
    status,
    loading,
    error,
    setCurrentRepo,
    refreshStatus,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll
  } = useGitStore();

  useEffect(() => {
    if (repoPath) {
      setCurrentRepo(repoPath);
      if (autoRefresh) {
        refreshStatus();
      }
    }
  }, [repoPath, autoRefresh]);

  return {
    status,
    loading,
    error,
    refreshStatus,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll
  };
};