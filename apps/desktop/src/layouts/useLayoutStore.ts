import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PanelPosition = 'left' | 'right' | 'bottom';
export type LeftPanelTab = 'explorer' | 'search' | 'git' | 'extensions';
export type RightPanelTab = 'ai' | 'terminal' | 'output';
export type BottomPanelTab = 'terminal' | 'output' | 'problems' | 'debug';

interface PanelState {
  visible: boolean;
  size: number;
  collapsed: boolean;
}

interface LayoutState {
  // Left Panel (File Explorer, Search, Git, etc.)
  leftPanel: PanelState & {
    activeTab: LeftPanelTab;
  };
  
  // Right Panel (AI, Terminal, etc.)
  rightPanel: PanelState & {
    activeTab: RightPanelTab;
  };
  
  // Bottom Panel (Terminal, Output, Problems, etc.)
  bottomPanel: PanelState & {
    activeTab: BottomPanelTab;
  };
  
  // Editor Area
  editorAreaSize: number;
  
  // Actions
  setLeftPanelVisible: (visible: boolean) => void;
  setLeftPanelSize: (size: number) => void;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  setLeftPanelActiveTab: (tab: LeftPanelTab) => void;
  toggleLeftPanel: () => void;
  
  setRightPanelVisible: (visible: boolean) => void;
  setRightPanelSize: (size: number) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelActiveTab: (tab: RightPanelTab) => void;
  toggleRightPanel: () => void;
  
  setBottomPanelVisible: (visible: boolean) => void;
  setBottomPanelSize: (size: number) => void;
  setBottomPanelCollapsed: (collapsed: boolean) => void;
  setBottomPanelActiveTab: (tab: BottomPanelTab) => void;
  toggleBottomPanel: () => void;
  
  setEditorAreaSize: (size: number) => void;
  resetLayout: () => void;
}

const DEFAULT_LAYOUT: Partial<LayoutState> = {
  leftPanel: {
    visible: true,
    size: 20, // percentage
    collapsed: false,
    activeTab: 'explorer',
  },
  rightPanel: {
    visible: false,
    size: 25, // percentage
    collapsed: false,
    activeTab: 'ai',
  },
  bottomPanel: {
    visible: false,
    size: 30, // percentage
    collapsed: false,
    activeTab: 'terminal',
  },
  editorAreaSize: 0, // Will be calculated dynamically
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      ...DEFAULT_LAYOUT,
      
      // Left Panel Actions
      setLeftPanelVisible: (visible) => set((state) => ({ 
        leftPanel: { ...state.leftPanel, visible } 
      })),
      
      setLeftPanelSize: (size) => set((state) => ({ 
        leftPanel: { ...state.leftPanel, size } 
      })),
      
      setLeftPanelCollapsed: (collapsed) => set((state) => ({ 
        leftPanel: { ...state.leftPanel, collapsed } 
      })),
      
      setLeftPanelActiveTab: (tab) => set((state) => ({ 
        leftPanel: { ...state.leftPanel, activeTab: tab } 
      })),
      
      toggleLeftPanel: () => set((state) => ({ 
        leftPanel: { ...state.leftPanel, collapsed: !state.leftPanel.collapsed } 
      })),
      
      // Right Panel Actions
      setRightPanelVisible: (visible) => set((state) => ({ 
        rightPanel: { ...state.rightPanel, visible } 
      })),
      
      setRightPanelSize: (size) => set((state) => ({ 
        rightPanel: { ...state.rightPanel, size } 
      })),
      
      setRightPanelCollapsed: (collapsed) => set((state) => ({ 
        rightPanel: { ...state.rightPanel, collapsed } 
      })),
      
      setRightPanelActiveTab: (tab) => set((state) => ({ 
        rightPanel: { ...state.rightPanel, activeTab: tab } 
      })),
      
      toggleRightPanel: () => set((state) => ({ 
        rightPanel: { ...state.rightPanel, visible: !state.rightPanel.visible } 
      })),
      
      // Bottom Panel Actions
      setBottomPanelVisible: (visible) => set((state) => ({ 
        bottomPanel: { ...state.bottomPanel, visible } 
      })),
      
      setBottomPanelSize: (size) => set((state) => ({ 
        bottomPanel: { ...state.bottomPanel, size } 
      })),
      
      setBottomPanelCollapsed: (collapsed) => set((state) => ({ 
        bottomPanel: { ...state.bottomPanel, collapsed } 
      })),
      
      setBottomPanelActiveTab: (tab) => set((state) => ({ 
        bottomPanel: { ...state.bottomPanel, activeTab: tab } 
      })),
      
      toggleBottomPanel: () => set((state) => ({ 
        bottomPanel: { ...state.bottomPanel, visible: !state.bottomPanel.visible } 
      })),
      
      setEditorAreaSize: (size) => set({ editorAreaSize: size }),
      
      resetLayout: () => set(DEFAULT_LAYOUT),
    }),
    {
      name: 'ide-layout-storage',
      partialize: (state) => ({
        leftPanel: state.leftPanel,
        rightPanel: state.rightPanel,
        bottomPanel: state.bottomPanel,
        editorAreaSize: state.editorAreaSize,
      }),
    }
  )
);