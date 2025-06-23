// Re-export types from window.ts (migrated from @code-pilot/types)
export { WindowType } from './window';
export type { WindowConfig as WindowConfigBase, WindowState as WindowStateBase } from './window';

// Extended window state with additional properties
export interface WindowState {
  isMaximized: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  isFocused: boolean;
  isVisible: boolean;
  isPinned: boolean;
  position?: WindowPosition;
  size?: WindowSize;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

// Extended window config with additional properties
export interface WindowConfig {
  url?: string;
  title?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  fullscreen?: boolean;
  alwaysOnTop?: boolean;
  decorations?: boolean;
  transparent?: boolean;
  skipTaskbar?: boolean;
  center?: boolean;
  x?: number;
  y?: number;
}

export interface MultiWindowState {
  windows: Map<string, WindowInfo>;
  activeWindowId: string | null;
  focusedWindowId: string | null;
}

export interface WindowInfo {
  id: string;
  label: string;
  title: string;
  state: WindowState;
  config: WindowConfig;
  createdAt: Date;
  lastActiveAt: Date;
}

export type WindowEvent = 
  | { type: 'window:created'; payload: { windowId: string; config: WindowConfig } }
  | { type: 'window:closed'; payload: { windowId: string } }
  | { type: 'window:focused'; payload: { windowId: string } }
  | { type: 'window:blurred'; payload: { windowId: string } }
  | { type: 'window:moved'; payload: { windowId: string; position: WindowPosition } }
  | { type: 'window:resized'; payload: { windowId: string; size: WindowSize } }
  | { type: 'window:maximized'; payload: { windowId: string } }
  | { type: 'window:unmaximized'; payload: { windowId: string } }
  | { type: 'window:minimized'; payload: { windowId: string } }
  | { type: 'window:restored'; payload: { windowId: string } }
  | { type: 'window:fullscreen'; payload: { windowId: string; isFullscreen: boolean } };

export interface WindowManagerOptions {
  saveState?: boolean;
  stateKey?: string;
  defaultConfig?: WindowConfig;
}