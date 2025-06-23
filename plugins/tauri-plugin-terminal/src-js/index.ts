import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface Terminal {
  id: string;
  title: string;
  shell: string;
  cwd: string;
  pid?: number;
  isActive: boolean;
  rows: number;
  cols: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTerminalOptions {
  shell?: string;
  cwd?: string;
  title?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
}

export interface TerminalCommand {
  type: 'input' | 'resize' | 'clear' | 'kill' | 'paste';
  terminalId: string;
  data?: any;
}

export interface TerminalData {
  type: 'output' | 'exit' | 'title' | 'cwd';
  terminalId: string;
  data: any;
}

export interface ShellInfo {
  path: string;
  name: string;
}

export async function createTerminal(options: CreateTerminalOptions = {}): Promise<Terminal> {
  return await invoke('plugin:terminal|create_terminal', { options });
}

export async function writeToTerminal(terminalId: string, data: string): Promise<void> {
  return await invoke('plugin:terminal|write_to_terminal', { terminalId, data });
}

export async function resizeTerminal(terminalId: string, cols: number, rows: number): Promise<void> {
  return await invoke('plugin:terminal|resize_terminal', { terminalId, cols, rows });
}

export async function killTerminal(terminalId: string): Promise<void> {
  return await invoke('plugin:terminal|kill_terminal', { terminalId });
}

export async function handleTerminalCommand(command: TerminalCommand): Promise<void> {
  return await invoke('plugin:terminal|handle_terminal_command', { command });
}

export async function getTerminal(terminalId: string): Promise<Terminal> {
  return await invoke('plugin:terminal|get_terminal', { terminalId });
}

export async function listTerminals(): Promise<Terminal[]> {
  return await invoke('plugin:terminal|list_terminals');
}

export async function getAvailableShells(): Promise<ShellInfo[]> {
  return await invoke('plugin:terminal|get_available_shells');
}

export async function getDefaultShell(): Promise<string> {
  return await invoke('plugin:terminal|get_default_shell');
}

export function onTerminalData(handler: (data: TerminalData) => void): () => void {
  const unlisten = listen<TerminalData>('plugin:terminal:data', (event) => {
    handler(event.payload);
  });
  
  return () => {
    unlisten.then(fn => fn());
  };
}