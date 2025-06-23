import { create } from 'zustand';
import { terminalService } from '../services/terminalService';
import { Terminal, TerminalTheme } from '../types';

interface TerminalState {
  terminals: Terminal[];
  activeTerminalId: string | null;
  theme: TerminalTheme | string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTerminals: () => Promise<void>;
  createTerminal: (shell?: string, cwd?: string) => Promise<Terminal | null>;
  closeTerminal: (id: string) => Promise<void>;
  setActiveTerminal: (id: string | null) => void;
  updateTerminal: (id: string, updates: Partial<Terminal>) => void;
  setTheme: (theme: TerminalTheme | string) => void;
  clearTerminal: (id: string) => Promise<void>;
  renameTerminal: (id: string, name: string) => Promise<void>;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  terminals: [],
  activeTerminalId: null,
  theme: 'one-dark',
  isLoading: false,
  error: null,

  loadTerminals: async () => {
    set({ isLoading: true, error: null });
    try {
      const terminals = await terminalService.listTerminals();
      set({ terminals, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTerminal: async (shell?: string, cwd?: string) => {
    set({ isLoading: true, error: null });
    try {
      const terminal = await terminalService.createTerminal({ shell, cwd });
      await get().loadTerminals();
      set({ activeTerminalId: terminal.id, isLoading: false });
      return terminal;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },

  closeTerminal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await terminalService.killTerminal(id);
      await get().loadTerminals();
      
      // If the closed terminal was active, select another one
      if (get().activeTerminalId === id) {
        const terminals = get().terminals;
        const newActiveId = terminals.length > 0 ? terminals[0].id : null;
        set({ activeTerminalId: newActiveId });
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setActiveTerminal: (id: string | null) => {
    set({ activeTerminalId: id });
  },

  updateTerminal: (id: string, updates: Partial<Terminal>) => {
    set((state) => ({
      terminals: state.terminals.map((terminal) =>
        terminal.id === id ? { ...terminal, ...updates } : terminal
      ),
    }));
  },

  setTheme: (theme: TerminalTheme | string) => {
    set({ theme });
  },

  clearTerminal: async (id: string) => {
    try {
      await terminalService.clearTerminal(id);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  renameTerminal: async (id: string, name: string) => {
    try {
      // Update locally first for immediate feedback
      get().updateTerminal(id, { title: name });
      // Persist if service supports it
      // await terminalService.renameTerminal(id, name);
    } catch (error) {
      set({ error: (error as Error).message });
      // Reload to restore correct state
      await get().loadTerminals();
    }
  },
}));