// Advanced tab management types

import type { EditorTab, EditorFile } from './editor';

export interface TabGroup {
  id: string;
  tabs: string[]; // Array of tab IDs
  activeTabId: string | null;
  width?: number; // For split panes
  height?: number; // For split panes
}

export interface SplitPane {
  id: string;
  direction: 'horizontal' | 'vertical';
  children: (SplitPane | TabGroup)[];
  sizes: number[]; // Percentage sizes for each child
}

export interface TabDropZone {
  groupId: string;
  position: 'left' | 'right' | 'top' | 'bottom' | 'center';
  bounds: DOMRect;
}

export interface TabDragData {
  tabId: string;
  sourceGroupId: string;
  sourceIndex: number;
}

export interface RecentlyClosedTab {
  tab: EditorTab;
  file: EditorFile;
  closedAt: number;
  groupId: string;
}

export interface TabManagerState {
  rootPane: SplitPane | TabGroup;
  groups: Map<string, TabGroup>;
  recentlyClosed: RecentlyClosedTab[];
  activeGroupId: string | null;
}

export interface TabManagerConfiguration {
  enableSplitView: boolean;
  maxRecentlyClosedTabs: number;
  showTabIcons: boolean;
  tabHeight: number;
  tabMinWidth: number;
  tabMaxWidth: number;
  enablePreview: boolean; // Single-click preview mode
  autoSaveOnTabSwitch: boolean;
}

export interface TabContextMenuAction {
  id: string;
  label: string;
  icon?: string;
  keybinding?: string;
  separator?: boolean;
  enabled?: boolean;
  visible?: boolean;
  action: (tabId: string, groupId: string) => void | Promise<void>;
}

export interface TabKeyboardShortcut {
  id: string;
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'cmd')[];
  action: () => void | Promise<void>;
  description: string;
}

// Tab persistence
export interface TabSessionData {
  version: number;
  timestamp: number;
  rootPane: SplitPane | TabGroup;
  groups: Array<{
    id: string;
    tabs: Array<{
      id: string;
      fileId: string;
      title: string;
      path: string;
      isDirty: boolean;
      isPinned: boolean;
    }>;
    activeTabId: string | null;
  }>;
  activeGroupId: string | null;
}

// Events
export interface TabManagerEvents {
  'tabOpened': { tab: EditorTab; groupId: string };
  'tabClosed': { tab: EditorTab; groupId: string };
  'tabMoved': { tab: EditorTab; fromGroupId: string; toGroupId: string; toIndex: number };
  'tabActivated': { tab: EditorTab; groupId: string };
  'groupCreated': { group: TabGroup };
  'groupRemoved': { groupId: string };
  'groupActivated': { groupId: string };
  'splitCreated': { parentId: string; direction: 'horizontal' | 'vertical' };
  'splitRemoved': { paneId: string };
  'layoutChanged': { rootPane: SplitPane | TabGroup };
  'sessionRestored': { data: TabSessionData };
}

// Default configuration
export const DEFAULT_TAB_MANAGER_CONFIG: TabManagerConfiguration = {
  enableSplitView: true,
  maxRecentlyClosedTabs: 10,
  showTabIcons: true,
  tabHeight: 35,
  tabMinWidth: 120,
  tabMaxWidth: 200,
  enablePreview: true,
  autoSaveOnTabSwitch: false
};

// Re-export EditorTab and EditorFile from editor types for convenience
export { EditorTab, EditorFile };