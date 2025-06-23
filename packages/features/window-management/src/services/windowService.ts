import { getCurrentWindow, getAllWindows } from '@tauri-apps/api/window';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { saveWindowState, restoreStateCurrent, StateFlags } from '@tauri-apps/plugin-window-state';
import type { WindowConfig, WindowState, WindowPosition, WindowSize } from '../types';

export class WindowService {
  private static instance: WindowService;
  
  private constructor() {}
  
  static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService();
    }
    return WindowService.instance;
  }
  
  // Window creation and management
  async createWindow(label: string, config: WindowConfig): Promise<WebviewWindow> {
    const webview = new WebviewWindow(label, {
      url: config.url || '/',
      title: config.title,
      width: config.width,
      height: config.height,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      resizable: config.resizable,
      fullscreen: config.fullscreen,
      alwaysOnTop: config.alwaysOnTop,
      decorations: config.decorations,
      transparent: config.transparent,
      skipTaskbar: config.skipTaskbar,
      center: config.center,
      x: config.x,
      y: config.y,
    });
    return webview;
  }
  
  async closeWindow(windowId?: string): Promise<void> {
    if (windowId) {
      const window = await this.getWindow(windowId);
      return window?.close();
    }
    return getCurrentWindow().close();
  }
  
  async getWindow(windowId: string): Promise<WebviewWindow | null> {
    const windows = await getAllWindows();
    return (windows.find(w => w.label === windowId) || null) as WebviewWindow | null;
  }
  
  async getAllWindows(): Promise<WebviewWindow[]> {
    return getAllWindows() as any as WebviewWindow[];
  }
  
  async getCurrentWindow(): Promise<WebviewWindow> {
    return getCurrentWindow() as any;
  }
  
  // Window state operations
  async minimize(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.minimize();
  }
  
  async maximize(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.maximize();
  }
  
  async unmaximize(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.unmaximize();
  }
  
  async toggleMaximize(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.toggleMaximize();
  }
  
  async setFullscreen(fullscreen: boolean, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setFullscreen(fullscreen);
  }
  
  async show(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.show();
  }
  
  async hide(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.hide();
  }
  
  async setFocus(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setFocus();
  }
  
  async center(windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.center();
  }
  
  // Window properties
  async setTitle(title: string, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setTitle(title);
  }
  
  async setAlwaysOnTop(alwaysOnTop: boolean, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setAlwaysOnTop(alwaysOnTop);
  }
  
  async setDecorations(decorations: boolean, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setDecorations(decorations);
  }
  
  async setSkipTaskbar(skip: boolean, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setSkipTaskbar(skip);
  }
  
  // Window position and size
  async setPosition(position: WindowPosition, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setPosition(new LogicalPosition(position.x, position.y));
  }
  
  async setSize(size: WindowSize, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setSize(new LogicalSize(size.width, size.height));
  }
  
  async setMinSize(size: WindowSize | null, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setMinSize(size ? new LogicalSize(size.width, size.height) : null);
  }
  
  async setMaxSize(size: WindowSize | null, windowId?: string): Promise<void> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    return window?.setMaxSize(size ? new LogicalSize(size.width, size.height) : null);
  }
  
  // Window state queries
  async getWindowState(windowId?: string): Promise<WindowState> {
    const window = windowId ? await this.getWindow(windowId) : getCurrentWindow();
    if (!window) {
      throw new Error('Window not found');
    }
    
    const [isMaximized, isMinimized, isFullscreen, isFocused, isVisible] = await Promise.all([
      window.isMaximized(),
      window.isMinimized(),
      window.isFullscreen(),
      window.isFocused(),
      window.isVisible(),
    ]);
    
    const position = await (window as any).position();
    const size = await (window as any).size();
    
    return {
      isMaximized,
      isMinimized,
      isFullscreen,
      isFocused,
      isVisible,
      isPinned: await window.isAlwaysOnTop(),
      position: { x: position.x, y: position.y },
      size: { width: size.width, height: size.height },
    };
  }
  
  // State persistence
  async saveWindowState(flags?: number): Promise<void> {
    return saveWindowState(flags ?? StateFlags.ALL);
  }
  
  async restoreWindowState(flags?: number): Promise<void> {
    return restoreStateCurrent(flags ?? StateFlags.ALL);
  }
}

// Import LogicalPosition and LogicalSize from Tauri
import { LogicalPosition, LogicalSize } from '@tauri-apps/api/window';

// Export singleton instance
export const windowService = WindowService.getInstance();