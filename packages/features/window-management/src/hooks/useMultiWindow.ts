import { useCallback, useEffect } from 'react';
import { useWindowStore } from '../stores/windowStore';
import { windowService } from '../services/windowService';
import type { WindowConfig, WindowInfo } from '../types';

export function useMultiWindow() {
  const store = useWindowStore();
  const windows = Array.from(store.windows.values());
  const activeWindow = store.activeWindowId ? store.windows.get(store.activeWindowId) : null;
  const focusedWindow = store.focusedWindowId ? store.windows.get(store.focusedWindowId) : null;
  
  // Load all windows on mount
  useEffect(() => {
    const loadWindows = async () => {
      try {
        const allWindows = await windowService.getAllWindows();
        
        for (const window of allWindows) {
          const state = await windowService.getWindowState(window.label);
          
          const info: WindowInfo = {
            id: window.label,
            label: window.label,
            title: await window.title(),
            state,
            config: {}, // Config would need to be stored separately
            createdAt: new Date(),
            lastActiveAt: new Date(),
          };
          
          store.addWindow(info);
        }
      } catch (error) {
        console.error('Failed to load windows:', error);
      }
    };
    
    loadWindows();
  }, [store]);
  
  const createWindow = useCallback(async (label: string, config: WindowConfig) => {
    try {
      const window = await windowService.createWindow(label, config);
      
      const info: WindowInfo = {
        id: label,
        label,
        title: config.title || label,
        state: await windowService.getWindowState(label),
        config,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      };
      
      store.addWindow(info);
      store.setActiveWindow(label);
      
      return window;
    } catch (error) {
      console.error('Failed to create window:', error);
      throw error;
    }
  }, [store]);
  
  const closeWindow = useCallback(async (windowId: string) => {
    try {
      await windowService.closeWindow(windowId);
      store.removeWindow(windowId);
    } catch (error) {
      console.error('Failed to close window:', error);
      throw error;
    }
  }, [store]);
  
  const focusWindow = useCallback(async (windowId: string) => {
    try {
      await windowService.setFocus(windowId);
      store.setFocusedWindow(windowId);
      store.setActiveWindow(windowId);
    } catch (error) {
      console.error('Failed to focus window:', error);
      throw error;
    }
  }, [store]);
  
  const getWindow = useCallback((windowId: string) => {
    return store.windows.get(windowId);
  }, [store.windows]);
  
  const closeAllWindows = useCallback(async () => {
    const windowIds = Array.from(store.windows.keys());
    
    for (const id of windowIds) {
      try {
        await closeWindow(id);
      } catch (error) {
        console.error(`Failed to close window ${id}:`, error);
      }
    }
  }, [store.windows, closeWindow]);
  
  return {
    windows,
    activeWindow,
    focusedWindow,
    
    // Operations
    createWindow,
    closeWindow,
    focusWindow,
    getWindow,
    closeAllWindows,
  };
}