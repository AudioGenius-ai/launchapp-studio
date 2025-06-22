import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useGitStore } from '../stores/gitStore';

export const useGitFileWatcher = (enabled = true) => {
  const { currentRepo, refreshStatus } = useGitStore();
  const watcherIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !currentRepo) return;

    const startWatcher = async () => {
      try {
        // Start watching the .git directory for changes
        const watcherId = await invoke<string>('plugin:git|watch_repository', {
          repoPath: currentRepo
        });
        watcherIdRef.current = watcherId;

        // Listen for file change events
        const handleFileChange = () => {
          // Debounce the refresh to avoid too many updates
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            refreshStatus();
          }, 500);
        };

        // Set up event listener for file changes
        const unlisten = await listen('git:file_changed', handleFileChange);

        return () => {
          unlisten();
          if (watcherIdRef.current) {
            invoke('plugin:git|stop_watching', { watcherId: watcherIdRef.current });
          }
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
        };
      } catch (error) {
        console.error('Failed to start git file watcher:', error);
      }
    };

    const cleanup = startWatcher();

    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [enabled, currentRepo, refreshStatus]);
};