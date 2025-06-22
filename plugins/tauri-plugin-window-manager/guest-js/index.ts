import { invoke } from '@tauri-apps/api/core';

export interface WindowConfig {
  label: string;
  title?: string;
  url?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  center?: boolean;
  resizable?: boolean;
  maximized?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  decorations?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  visible?: boolean;
  focused?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface WindowInfo {
  id: string;
  label: string;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  isVisible: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowMessage {
  from: string;
  to: string;
  messageType: string;
  payload: any;
}

export interface WindowState {
  windows: Record<string, WindowInfo>;
  activeWindow?: string;
  windowOrder: string[];
}

export async function createWindow(config: WindowConfig): Promise<WindowInfo> {
  return await invoke('plugin:window-manager|create_window', { config });
}

export async function closeWindow(label: string): Promise<void> {
  return await invoke('plugin:window-manager|close_window', { label });
}

export async function getWindow(label: string): Promise<WindowInfo> {
  return await invoke('plugin:window-manager|get_window', { label });
}

export async function listWindows(): Promise<WindowInfo[]> {
  return await invoke('plugin:window-manager|list_windows');
}

export async function focusWindow(label: string): Promise<void> {
  return await invoke('plugin:window-manager|focus_window', { label });
}

export async function minimizeWindow(label: string): Promise<void> {
  return await invoke('plugin:window-manager|minimize_window', { label });
}

export async function maximizeWindow(label: string): Promise<void> {
  return await invoke('plugin:window-manager|maximize_window', { label });
}

export async function unmaximizeWindow(label: string): Promise<void> {
  return await invoke('plugin:window-manager|unmaximize_window', { label });
}

export async function setWindowPosition(label: string, position: WindowPosition): Promise<void> {
  return await invoke('plugin:window-manager|set_window_position', { label, position });
}

export async function setWindowSize(label: string, size: WindowSize): Promise<void> {
  return await invoke('plugin:window-manager|set_window_size', { label, size });
}

export async function setWindowTitle(label: string, title: string): Promise<void> {
  return await invoke('plugin:window-manager|set_window_title', { label, title });
}

export async function sendMessage(message: WindowMessage): Promise<void> {
  return await invoke('plugin:window-manager|send_message', { message });
}

export async function broadcastMessage(from: string, messageType: string, payload: any): Promise<void> {
  return await invoke('plugin:window-manager|broadcast_message', { from, messageType, payload });
}

export async function getWindowState(): Promise<WindowState> {
  return await invoke('plugin:window-manager|get_window_state');
}

export async function updateWindowInfo(label: string): Promise<void> {
  return await invoke('plugin:window-manager|update_window_info', { label });
}