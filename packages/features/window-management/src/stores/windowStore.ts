import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WindowState, WindowInfo, MultiWindowState, WindowEvent } from '../types';
import { WindowType } from '../types';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface WindowStore extends MultiWindowState {
  // State
  currentWindowState: WindowState & { isPinned?: boolean };
  
  // Actions
  setWindowState: (state: Partial<WindowState & { isPinned?: boolean }>) => void;
  setWindowInfo: (windowId: string, info: Partial<WindowInfo>) => void;
  addWindow: (info: WindowInfo) => void;
  removeWindow: (windowId: string) => void;
  setActiveWindow: (windowId: string | null) => void;
  setFocusedWindow: (windowId: string | null) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;
  
  // Event handlers
  handleWindowEvent: (event: WindowEvent) => void;
}

export const useWindowStore = create<WindowStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    windows: new Map(),
    activeWindowId: null,
    focusedWindowId: null,
    currentWindowState: {
      id: 'main',
      type: WindowType.MAIN,
      isMaximized: false,
      isMinimized: false,
      isFullscreen: false,
      isFocused: true,
      isVisible: true,
      isPinned: false,
      bounds: {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
      },
    },
    
    // Actions
    setWindowState: (state) => set((prev) => ({
      currentWindowState: { ...prev.currentWindowState, ...state }
    })),
    
    setWindowInfo: (windowId, info) => set((state) => {
      const windows = new Map(state.windows);
      const existing = windows.get(windowId);
      if (existing) {
        windows.set(windowId, { ...existing, ...info });
      }
      return { windows };
    }),
    
    addWindow: (info) => set((state) => {
      const windows = new Map(state.windows);
      windows.set(info.id, info);
      return { windows };
    }),
    
    removeWindow: (windowId) => set((state) => {
      const windows = new Map(state.windows);
      windows.delete(windowId);
      return { 
        windows,
        activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
        focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId,
      };
    }),
    
    setActiveWindow: (windowId) => set({ activeWindowId: windowId }),
    
    setFocusedWindow: (windowId) => set({ focusedWindowId: windowId }),
    
    updateWindowPosition: (windowId, x, y) => set((state) => {
      const windows = new Map(state.windows);
      const window = windows.get(windowId);
      if (window) {
        windows.set(windowId, {
          ...window,
          state: { ...window.state, position: { x, y } }
        });
      }
      return { windows };
    }),
    
    updateWindowSize: (windowId, width, height) => set((state) => {
      const windows = new Map(state.windows);
      const window = windows.get(windowId);
      if (window) {
        windows.set(windowId, {
          ...window,
          state: { ...window.state, size: { width, height } }
        });
      }
      return { windows };
    }),
    
    // Event handler
    handleWindowEvent: (event) => {
      const { type, payload } = event;
      
      switch (type) {
        case 'window:created':
          // Handle in addWindow action
          break;
          
        case 'window:closed':
          get().removeWindow(payload.windowId);
          break;
          
        case 'window:focused':
          get().setFocusedWindow(payload.windowId);
          get().setWindowState({ isFocused: true });
          break;
          
        case 'window:blurred':
          if (get().focusedWindowId === payload.windowId) {
            get().setFocusedWindow(null);
          }
          get().setWindowState({ isFocused: false });
          break;
          
        case 'window:moved':
          get().updateWindowPosition(payload.windowId, payload.position.x, payload.position.y);
          break;
          
        case 'window:resized':
          get().updateWindowSize(payload.windowId, payload.size.width, payload.size.height);
          break;
          
        case 'window:maximized':
          const maxWindow = get().windows.get(payload.windowId);
          if (maxWindow) {
            get().setWindowInfo(payload.windowId, {
              state: { ...maxWindow.state, isMaximized: true } as WindowState
            });
          }
          get().setWindowState({ isMaximized: true });
          break;
          
        case 'window:unmaximized':
          const unmaxWindow = get().windows.get(payload.windowId);
          if (unmaxWindow) {
            get().setWindowInfo(payload.windowId, {
              state: { ...unmaxWindow.state, isMaximized: false } as WindowState
            });
          }
          get().setWindowState({ isMaximized: false });
          break;
          
        case 'window:minimized':
          const minWindow = get().windows.get(payload.windowId);
          if (minWindow) {
            get().setWindowInfo(payload.windowId, {
              state: { ...minWindow.state, isMinimized: true } as WindowState
            });
          }
          get().setWindowState({ isMinimized: true });
          break;
          
        case 'window:restored':
          const resWindow = get().windows.get(payload.windowId);
          if (resWindow) {
            get().setWindowInfo(payload.windowId, {
              state: { ...resWindow.state, isMinimized: false } as WindowState
            });
          }
          get().setWindowState({ isMinimized: false });
          break;
          
        case 'window:fullscreen':
          const fullWindow = get().windows.get(payload.windowId);
          if (fullWindow) {
            get().setWindowInfo(payload.windowId, {
              state: { ...fullWindow.state, isFullscreen: payload.isFullscreen } as WindowState
            });
          }
          get().setWindowState({ isFullscreen: payload.isFullscreen });
          break;
      }
    },
  }))
);

// Subscribe to window events
if (typeof window !== 'undefined') {
  const appWindow = getCurrentWindow();
  const windowId = appWindow.label;
  
  // Listen to window events
  appWindow.onFocusChanged(({ payload: focused }) => {
    useWindowStore.getState().handleWindowEvent({
      type: focused ? 'window:focused' : 'window:blurred',
      payload: { windowId }
    });
  });
  
  appWindow.onResized(({ payload }) => {
    useWindowStore.getState().handleWindowEvent({
      type: 'window:resized',
      payload: { windowId, size: payload }
    });
  });
  
  appWindow.onMoved(({ payload }) => {
    useWindowStore.getState().handleWindowEvent({
      type: 'window:moved',
      payload: { windowId, position: payload }
    });
  });
}