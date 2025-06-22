import { useCallback, useEffect, useState } from 'react';
import { getCurrentWindow, WebviewWindow } from '@tauri-apps/api/window';
import { windowService } from '../services/windowService';
import { useWindowStore } from '../stores/windowStore';
import type { WindowState, WindowConfig } from '../types';

export function useWindow(windowId?: string) {
  const [window, setWindow] = useState<WebviewWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const store = useWindowStore();
  const windowState = windowId 
    ? store.windows.get(windowId)?.state 
    : store.currentWindowState;
  
  useEffect(() => {
    const loadWindow = async () => {
      try {
        setIsLoading(true);
        const win = windowId 
          ? await windowService.getWindow(windowId)
          : await getCurrentWindow();
        setWindow(win);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load window'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWindow();
  }, [windowId]);
  
  // Window operations
  const minimize = useCallback(async () => {
    try {
      await windowService.minimize(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to minimize window'));
    }
  }, [windowId]);
  
  const maximize = useCallback(async () => {
    try {
      await windowService.maximize(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to maximize window'));
    }
  }, [windowId]);
  
  const unmaximize = useCallback(async () => {
    try {
      await windowService.unmaximize(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unmaximize window'));
    }
  }, [windowId]);
  
  const toggleMaximize = useCallback(async () => {
    try {
      await windowService.toggleMaximize(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle maximize'));
    }
  }, [windowId]);
  
  const close = useCallback(async () => {
    try {
      await windowService.closeWindow(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to close window'));
    }
  }, [windowId]);
  
  const setFullscreen = useCallback(async (fullscreen: boolean) => {
    try {
      await windowService.setFullscreen(fullscreen, windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set fullscreen'));
    }
  }, [windowId]);
  
  const toggleFullscreen = useCallback(async () => {
    if (windowState) {
      await setFullscreen(!windowState.isFullscreen);
    }
  }, [windowState, setFullscreen]);
  
  const show = useCallback(async () => {
    try {
      await windowService.show(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to show window'));
    }
  }, [windowId]);
  
  const hide = useCallback(async () => {
    try {
      await windowService.hide(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to hide window'));
    }
  }, [windowId]);
  
  const center = useCallback(async () => {
    try {
      await windowService.center(windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to center window'));
    }
  }, [windowId]);
  
  const setTitle = useCallback(async (title: string) => {
    try {
      await windowService.setTitle(title, windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set window title'));
    }
  }, [windowId]);
  
  const setAlwaysOnTop = useCallback(async (alwaysOnTop: boolean) => {
    try {
      await windowService.setAlwaysOnTop(alwaysOnTop, windowId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set always on top'));
    }
  }, [windowId]);
  
  const toggleAlwaysOnTop = useCallback(async () => {
    if (windowState) {
      await setAlwaysOnTop(!windowState.isPinned);
    }
  }, [windowState, setAlwaysOnTop]);
  
  return {
    window,
    windowState,
    isLoading,
    error,
    
    // Operations
    minimize,
    maximize,
    unmaximize,
    toggleMaximize,
    close,
    setFullscreen,
    toggleFullscreen,
    show,
    hide,
    center,
    setTitle,
    setAlwaysOnTop,
    toggleAlwaysOnTop,
  };
}