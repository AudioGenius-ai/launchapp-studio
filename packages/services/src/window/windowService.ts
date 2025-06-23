import { getCurrentWindow, Window, LogicalSize, LogicalPosition, UserAttentionType } from '@tauri-apps/api/window';
import { eventBus } from '../events/index.js';

/**
 * Window state interface
 */
export interface WindowState {
  label: string;
  title: string;
  visible: boolean;
  focused: boolean;
  minimized: boolean;
  maximized: boolean;
  fullscreen: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

/**
 * Window configuration interface
 */
export interface WindowConfig {
  label: string;
  title?: string;
  url?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  fullscreen?: boolean;
  focus?: boolean;
  transparent?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  decorations?: boolean;
}

/**
 * Window management service for handling multiple windows
 */
export class WindowService {
  private static instance: WindowService;
  private windows: Map<string, Window> = new Map();
  private currentWindow: Window;
  
  private constructor() {
    this.currentWindow = getCurrentWindow();
    this.setupEventListeners();
  }
  
  public static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService();
    }
    return WindowService.instance;
  }
  
  /**
   * Setup window event listeners
   */
  private setupEventListeners(): void {
    // Listen for window events and emit them through the event bus
    this.currentWindow.onFocusChanged(({ payload: focused }) => {
      eventBus.emitSync('window:focus-changed', { 
        label: this.currentWindow.label, 
        focused 
      });
    });
    
    this.currentWindow.onResized(({ payload: size }) => {
      eventBus.emitSync('window:resized', { 
        label: this.currentWindow.label, 
        size 
      });
    });
    
    this.currentWindow.onMoved(({ payload: position }) => {
      eventBus.emitSync('window:moved', { 
        label: this.currentWindow.label, 
        position 
      });
    });
    
    this.currentWindow.onCloseRequested((event) => {
      eventBus.emitSync('window:close-requested', { 
        label: this.currentWindow.label,
        event 
      });
    });
  }
  
  /**
   * Create a new window
   */
  async createWindow(config: WindowConfig): Promise<Window> {
    try {
      const window = new Window(config.label, {
        title: config.title,
        width: config.width,
        height: config.height,
        x: config.x,
        y: config.y,
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        maxWidth: config.maxWidth,
        maxHeight: config.maxHeight,
        resizable: config.resizable,
        fullscreen: config.fullscreen,
        focus: config.focus,
        transparent: config.transparent,
        alwaysOnTop: config.alwaysOnTop,
        skipTaskbar: config.skipTaskbar,
        decorations: config.decorations
      });
      
      this.windows.set(config.label, window);
      
      eventBus.emitSync('window:created', { 
        label: config.label,
        config 
      });
      
      return window;
    } catch (error) {
      console.error('Failed to create window:', error);
      throw error;
    }
  }
  
  /**
   * Get a window by label
   */
  getWindow(label: string): Window | undefined {
    return this.windows.get(label);
  }
  
  /**
   * Get the current window
   */
  getCurrentWindow(): Window {
    return this.currentWindow;
  }
  
  /**
   * Get all managed windows
   */
  getAllWindows(): Map<string, Window> {
    return new Map(this.windows);
  }
  
  /**
   * Close a window
   */
  async closeWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.close();
      this.windows.delete(label);
      
      eventBus.emitSync('window:closed', { label });
    }
  }
  
  /**
   * Focus a window
   */
  async focusWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.setFocus();
    }
  }
  
  /**
   * Minimize a window
   */
  async minimizeWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.minimize();
    }
  }
  
  /**
   * Maximize a window
   */
  async maximizeWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.maximize();
    }
  }
  
  /**
   * Unmaximize a window
   */
  async unmaximizeWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.unmaximize();
    }
  }
  
  /**
   * Toggle maximize state of a window
   */
  async toggleMaximize(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.toggleMaximize();
    }
  }
  
  /**
   * Show a window
   */
  async showWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.show();
    }
  }
  
  /**
   * Hide a window
   */
  async hideWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.hide();
    }
  }
  
  /**
   * Set window title
   */
  async setWindowTitle(label: string, title: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.setTitle(title);
    }
  }
  
  /**
   * Set window size
   */
  async setWindowSize(label: string, width: number, height: number): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.setSize(new LogicalSize(width, height));
    }
  }
  
  /**
   * Set window position
   */
  async setWindowPosition(label: string, x: number, y: number): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.setPosition(new LogicalPosition(x, y));
    }
  }
  
  /**
   * Get window state
   */
  async getWindowState(label: string): Promise<WindowState | null> {
    const window = this.windows.get(label);
    if (!window) return null;
    
    try {
      const [
        title,
        visible,
        focused,
        minimized,
        maximized,
        fullscreen,
        position,
        size
      ] = await Promise.all([
        window.title(),
        window.isVisible(),
        window.isFocused(),
        window.isMinimized(),
        window.isMaximized(),
        window.isFullscreen(),
        window.outerPosition(),
        window.outerSize()
      ]);
      
      return {
        label,
        title,
        visible,
        focused,
        minimized,
        maximized,
        fullscreen,
        position,
        size
      };
    } catch (error) {
      console.error('Failed to get window state:', error);
      return null;
    }
  }
  
  /**
   * Center a window on screen
   */
  async centerWindow(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.center();
    }
  }
  
  /**
   * Set window always on top
   */
  async setAlwaysOnTop(label: string, alwaysOnTop: boolean): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.setAlwaysOnTop(alwaysOnTop);
    }
  }
  
  /**
   * Set window resizable
   */
  async setResizable(label: string, resizable: boolean): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.setResizable(resizable);
    }
  }
  
  /**
   * Request user attention
   */
  async requestUserAttention(label: string): Promise<void> {
    const window = this.windows.get(label);
    if (window) {
      await window.requestUserAttention(UserAttentionType.Critical);
    }
  }
  
  /**
   * Check if window exists
   */
  hasWindow(label: string): boolean {
    return this.windows.has(label);
  }
  
  /**
   * Get window labels
   */
  getWindowLabels(): string[] {
    return Array.from(this.windows.keys());
  }
  
  /**
   * Close all managed windows
   */
  async closeAllWindows(): Promise<void> {
    const closePromises = Array.from(this.windows.entries()).map(
      async ([label, window]) => {
        try {
          await window.close();
          this.windows.delete(label);
          eventBus.emitSync('window:closed', { label });
        } catch (error) {
          console.error(`Failed to close window ${label}:`, error);
        }
      }
    );
    
    await Promise.all(closePromises);
  }
}

// Export singleton instance
export const windowService = WindowService.getInstance();