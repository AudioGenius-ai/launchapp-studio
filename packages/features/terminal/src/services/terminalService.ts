import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { 
  Terminal, 
  TerminalData, 
  CreateTerminalOptions 
} from '../types';

export interface TerminalServiceEvents {
  'terminal:created': { terminal: Terminal };
  'terminal:data': TerminalData;
  'terminal:closed': { id: string };
  'terminal:error': { id: string; error: string };
}

class TerminalService {
  private terminals: Map<string, Terminal> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  async createTerminal(options?: CreateTerminalOptions): Promise<Terminal> {
    try {
      const terminalId = await invoke<string>('plugin:terminal|create_terminal', {
        shell: options?.shell,
        cwd: options?.cwd,
        env: options?.env,
      });

      const terminal: Terminal = {
        id: terminalId,
        name: `Terminal ${this.terminals.size + 1}`,
        title: `Terminal ${this.terminals.size + 1}`,
        shell: options?.shell || '/bin/bash',
        cwd: options?.cwd || process.cwd(),
        isActive: true,
        createdAt: new Date(),
      };

      this.terminals.set(terminalId, terminal);
      this.emit('terminal:created', { terminal });

      // Set up data listener for this terminal
      await this.setupTerminalListeners(terminalId);

      return terminal;
    } catch (error) {
      console.error('Failed to create terminal:', error);
      throw error;
    }
  }

  async writeToTerminal(id: string, data: string): Promise<void> {
    try {
      await invoke('plugin:terminal|write_to_terminal', {
        terminalId: id,
        data,
      });
    } catch (error) {
      console.error('Failed to write to terminal:', error);
      throw error;
    }
  }

  async resizeTerminal(id: string, cols: number, rows: number): Promise<void> {
    try {
      await invoke('plugin:terminal|resize_terminal', {
        terminalId: id,
        cols,
        rows,
      });
    } catch (error) {
      console.error('Failed to resize terminal:', error);
      throw error;
    }
  }

  async closeTerminal(id: string): Promise<void> {
    try {
      await invoke('plugin:terminal|close_terminal', {
        terminalId: id,
      });
      
      this.terminals.delete(id);
      this.emit('terminal:closed', { id });
    } catch (error) {
      console.error('Failed to close terminal:', error);
      throw error;
    }
  }

  async closeAllTerminals(): Promise<void> {
    const terminalIds = Array.from(this.terminals.keys());
    await Promise.all(terminalIds.map(id => this.closeTerminal(id)));
  }

  getTerminal(id: string): Terminal | undefined {
    return this.terminals.get(id);
  }

  getAllTerminals(): Terminal[] {
    return Array.from(this.terminals.values());
  }

  async listTerminals(): Promise<Terminal[]> {
    return this.getAllTerminals();
  }

  async killTerminal(id: string): Promise<void> {
    return this.closeTerminal(id);
  }

  async sendInput(id: string, data: string): Promise<void> {
    return this.writeToTerminal(id, data);
  }

  async clearTerminal(id: string): Promise<void> {
    // Send clear sequence
    await this.writeToTerminal(id, '\x1b[2J\x1b[H');
  }

  async pasteToTerminal(id: string, text: string): Promise<void> {
    return this.writeToTerminal(id, text);
  }

  private async setupTerminalListeners(terminalId: string): Promise<void> {
    // Listen for terminal data
    await listen<TerminalData>(`terminal:data:${terminalId}`, (event) => {
      this.emit('terminal:data', event.payload);
    });

    // Listen for terminal close
    await listen<{ id: string }>(`terminal:close:${terminalId}`, () => {
      this.closeTerminal(terminalId);
    });

    // Listen for terminal errors
    await listen<{ error: string }>(`terminal:error:${terminalId}`, (event) => {
      this.emit('terminal:error', { id: terminalId, error: event.payload.error });
    });
  }

  // Event emitter methods
  on<K extends keyof TerminalServiceEvents>(
    event: K,
    handler: (payload: TerminalServiceEvents[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  onTerminalData(handler: (data: TerminalData) => void): () => void {
    this.on('terminal:data', handler);
    return () => this.off('terminal:data', handler);
  }

  off<K extends keyof TerminalServiceEvents>(
    event: K,
    handler: (payload: TerminalServiceEvents[K]) => void
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof TerminalServiceEvents>(
    event: K,
    payload: TerminalServiceEvents[K]
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }
}

// Export singleton instance
export const terminalService = new TerminalService();