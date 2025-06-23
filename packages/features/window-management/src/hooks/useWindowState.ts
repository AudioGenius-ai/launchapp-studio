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
      const window = getCurrentWindow();
      const unlistenFocus = window.onFocusChanged(({ payload: focused }: { payload: boolean }) => {
        store.setWindowState({ isFocused: focused });
      });
      
      const unlistenResize = window.onResized(({ payload }: { payload: { width: number; height: number } }) => {
        store.setWindowState({ size: payload });
      });
      
      const unlistenMove = window.onMoved(({ payload }: { payload: { x: number; y: number } }) => {
        store.setWindowState({ position: payload });
      });
      
      // Cleanup
      return () => {
        unlistenFocus.then((fn: () => void) => fn());
        unlistenResize.then((fn: () => void) => fn());
        unlistenMove.then((fn: () => void) => fn());
      };
    }
  }, [windowId, store]);
  
  return windowId ? windowInfo?.state : currentWindowState;
}