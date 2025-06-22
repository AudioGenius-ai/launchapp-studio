import { create } from 'zustand';
import type { EditorFile, RecentlyClosedTab } from '@code-pilot/types';

interface EditorStore {
  // State
  projectPath: string;
  showRecentlyClosedPanel: boolean;
  recentlyClosedTabs: RecentlyClosedTab[];
  activeFile: EditorFile | null;
  
  // Actions
  setProjectPath: (path: string) => void;
  toggleRecentlyClosedPanel: () => void;
  setRecentlyClosedTabs: (tabs: RecentlyClosedTab[]) => void;
  addRecentlyClosedTab: (tab: RecentlyClosedTab) => void;
  removeRecentlyClosedTab: (tabId: string) => void;
  setActiveFile: (file: EditorFile | null) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  // Initial state
  projectPath: '',
  showRecentlyClosedPanel: false,
  recentlyClosedTabs: [],
  activeFile: null,
  
  // Actions
  setProjectPath: (path) => set({ projectPath: path }),
  
  toggleRecentlyClosedPanel: () => set((state) => ({ 
    showRecentlyClosedPanel: !state.showRecentlyClosedPanel 
  })),
  
  setRecentlyClosedTabs: (tabs) => set({ recentlyClosedTabs: tabs }),
  
  addRecentlyClosedTab: (tab) => set((state) => ({
    recentlyClosedTabs: [tab, ...state.recentlyClosedTabs].slice(0, 20) // Keep max 20 tabs
  })),
  
  removeRecentlyClosedTab: (tabId) => set((state) => ({
    recentlyClosedTabs: state.recentlyClosedTabs.filter(tab => tab.tab.id !== tabId)
  })),
  
  setActiveFile: (file) => set({ activeFile: file })
}));