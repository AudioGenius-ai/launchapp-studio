import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
export async function createTerminal(options = {}) {
    return await invoke('plugin:terminal|create_terminal', { options });
}
export async function writeToTerminal(terminalId, data) {
    return await invoke('plugin:terminal|write_to_terminal', { terminalId, data });
}
export async function resizeTerminal(terminalId, cols, rows) {
    return await invoke('plugin:terminal|resize_terminal', { terminalId, cols, rows });
}
export async function killTerminal(terminalId) {
    return await invoke('plugin:terminal|kill_terminal', { terminalId });
}
export async function handleTerminalCommand(command) {
    return await invoke('plugin:terminal|handle_terminal_command', { command });
}
export async function getTerminal(terminalId) {
    return await invoke('plugin:terminal|get_terminal', { terminalId });
}
export async function listTerminals() {
    return await invoke('plugin:terminal|list_terminals');
}
export async function getAvailableShells() {
    return await invoke('plugin:terminal|get_available_shells');
}
export async function getDefaultShell() {
    return await invoke('plugin:terminal|get_default_shell');
}
export function onTerminalData(handler) {
    const unlisten = listen('plugin:terminal:data', (event) => {
        handler(event.payload);
    });
    return () => {
        unlisten.then(fn => fn());
    };
}
