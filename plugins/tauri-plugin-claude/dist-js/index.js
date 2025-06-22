import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
// API functions
export async function createSession(options) {
    return await invoke('plugin:claude|create_session', { options });
}
export async function sendInput(options) {
    return await invoke('plugin:claude|send_input', { options });
}
export async function listSessions() {
    return await invoke('plugin:claude|list_sessions');
}
export async function stopSession(sessionId) {
    return await invoke('plugin:claude|stop_session', { sessionId });
}
export async function recoverSessions() {
    return await invoke('plugin:claude|recover_sessions');
}
export async function getMessages(sessionId) {
    return await invoke('plugin:claude|get_messages', { sessionId });
}
export async function getMcpTools(workspacePath) {
    return await invoke('plugin:claude|get_mcp_tools', { workspacePath });
}
// Event listeners
export function onSessionEvent(handler) {
    const unlisten = listen('plugin:claude:session-event', (event) => {
        handler(event.payload);
    });
    return () => {
        unlisten.then(fn => fn());
    };
}
