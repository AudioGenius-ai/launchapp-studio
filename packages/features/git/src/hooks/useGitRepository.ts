import { useEffect } from 'react';
import { useGitStore } from '../stores/gitStore';

export const useGitRepository = (repoPath?: string) => {
  const store = useGitStore();

  useEffect(() => {
    if (repoPath && repoPath !== store.currentRepo) {
      store.setCurrentRepo(repoPath);
      // Refresh all data when repository changes
      Promise.all([
        store.refreshStatus(),
        store.refreshBranches(),
        store.refreshCommits()
      ]);
    }
  }, [repoPath]);

  return {
    ...store,
    isReady: !!store.currentRepo
  };
};