import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useWindowStore } from '../stores/windowStore';
import { windowService } from '../services/windowService';

export function useWindowState(windowId?: string) {
  const store = useWindowStore();
  const windowInfo = windowId ? store.windows.get(windowId) : undefined;
  const currentWindowState = store.currentWindowState;
  
  useEffect(() => {
    if (!windowId) {
      // Listen to current window state changes
      const updateState = async () => {
        try {
          const state = await windowService.getWindowState();
          store.setWindowState(state);
        } catch (error) {
          console.error('Failed to get window state:', error);
        }
      };
      
      // Initial state
      updateState();
      
      // Set up listeners for current window
      getCurrentWindow().then((window) => {
        const unlistenFocus = window.onFocusChanged(({ payload: focused }) => {
          store.setWindowState({ isFocused: focused });
        });
        
        const unlistenResize = window.onResized(({ payload }) => {
          store.setWindowState({ size: payload });
        });
        
        const unlistenMove = window.onMoved(({ payload }) => {
          store.setWindowState({ position: payload });
        });
        
        // Cleanup
        return () => {
          unlistenFocus.then(fn => fn());
          unlistenResize.then(fn => fn());
          unlistenMove.then(fn => fn());
        };
      });
    }
  }, [windowId, store]);
  
  return windowId ? windowInfo?.state : currentWindowState;
}