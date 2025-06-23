export enum WindowType {
  MAIN = 'main',
  EDITOR = 'editor',
  TERMINAL = 'terminal',
  PREVIEW = 'preview',
  SETTINGS = 'settings',
  ABOUT = 'about',
  CUSTOM = 'custom'
}

export interface WindowConfig {
  id: string;
  type: WindowType;
  title: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  focusable?: boolean;
  alwaysOnTop?: boolean;
  fullscreen?: boolean;
  skipTaskbar?: boolean;
  decorations?: boolean;
  transparent?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface WindowState {
  id: string;
  type: WindowType;
  isVisible: boolean;
  isFocused: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}