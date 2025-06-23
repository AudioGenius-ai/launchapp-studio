import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Session types
export interface ClaudeSession {
  id: string;
  workspacePath: string;
  logFilePath: string;
  pid?: number;
  createdAt: number;
  status: SessionStatus;
  lastActivity: number;
}

export type SessionStatus = 'starting' | 'streaming' | 'idle' | 'completed' | { failed: string };

export interface CreateSessionOptions {
  workspacePath: string;
  prompt?: string;
}

export interface SendInputOptions {
  sessionId: string;
  input: string;
}

// Message types
export interface ClaudeMessage {
  type: 'system' | 'assistant' | 'user';
  [key: string]: any;
}

export interface SessionEvent {
  sessionId: string;
  eventType: 'statusChanged' | 'messagesUpdated' | 'sessionCreated' | 'sessionStopped' | 'error';
  data: any;
}

// API functions
export async function createSession(options: CreateSessionOptions): Promise<ClaudeSession> {
  return await invoke('plugin:claude|create_session', { options });
}

export async function sendInput(options: SendInputOptions): Promise<void> {
  return await invoke('plugin:claude|send_input', { options });
}

export async function listSessions(): Promise<ClaudeSession[]> {
  return await invoke('plugin:claude|list_sessions');
}

export async function stopSession(sessionId: string): Promise<void> {
  return await invoke('plugin:claude|stop_session', { sessionId });
}

export async function recoverSessions(): Promise<ClaudeSession[]> {
  return await invoke('plugin:claude|recover_sessions');
}

export async function getMessages(sessionId: string): Promise<ClaudeMessage[]> {
  return await invoke('plugin:claude|get_messages', { sessionId });
}

export async function getMcpTools(workspacePath: string): Promise<string[]> {
  return await invoke('plugin:claude|get_mcp_tools', { workspacePath });
}

// Event listeners
export function onSessionEvent(handler: (event: SessionEvent) => void): () => void {
  const unlisten = listen<SessionEvent>('plugin:claude:session-event', (event) => {
    handler(event.payload);
  });
  
  return () => {
    unlisten.then(fn => fn());
  };
}