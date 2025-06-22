import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useGitStore } from '../stores/gitStore';

interface GitEventPayload {
  type: 'file_changed' | 'branch_changed' | 'remote_changed';
  repoPath: string;
  data?: any;
}

export const useGitEvents = () => {
  const { currentRepo, refreshStatus, refreshBranches } = useGitStore();

  useEffect(() => {
    if (!currentRepo) return;

    const unlistenPromise = listen<GitEventPayload>('git:event', (event) => {
      if (event.payload.repoPath !== currentRepo) return;

      switch (event.payload.type) {
        case 'file_changed':
          refreshStatus();
          break;
        case 'branch_changed':
          refreshBranches();
          refreshStatus();
          break;
        case 'remote_changed':
          refreshStatus();
          break;
      }
    });

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [currentRepo, refreshStatus, refreshBranches]);
};