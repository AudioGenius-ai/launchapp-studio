import { 
  TabGroup,
  SplitPane,
  TabManagerState,
  TabManagerConfiguration,
  TabManagerEvents,
  RecentlyClosedTab,
  TabSessionData,
  TabKeyboardShortcut,
  TabContextMenuAction,
  DEFAULT_TAB_MANAGER_CONFIG,
  EditorTab,
  EditorFile
} from '@code-pilot/types';
import { EditorService } from './editorService';

export class TabService {
  private state: TabManagerState;
  private configuration: TabManagerConfiguration = DEFAULT_TAB_MANAGER_CONFIG;
  private editorService: EditorService;
  private listeners: Map<keyof TabManagerEvents, Set<Function>> = new Map();
  private keyboardShortcuts: Map<string, TabKeyboardShortcut> = new Map();
  
  constructor(editorService: EditorService) {
    this.editorService = editorService;
    
    // Initialize with a single tab group
    const initialGroup: TabGroup = {
      id: this.generateId(),
      tabs: [],
      activeTabId: null
    };
    
    this.state = {
      rootPane: initialGroup,
      groups: new Map([[initialGroup.id, initialGroup]]),
      recentlyClosed: [],
      activeGroupId: initialGroup.id
    };
    
    this.setupDefaultKeyboardShortcuts();
    this.syncWithEditorService();
  }
  
  // Event handling
  on<K extends keyof TabManagerEvents>(event: K, callback: (data: TabManagerEvents[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }
  
  off<K extends keyof TabManagerEvents>(event: K, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }
  
  private emit<K extends keyof TabManagerEvents>(event: K, data: TabManagerEvents[K]): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
  
  // Tab operations
  async openTab(path: string, groupId?: string): Promise<void> {
    const targetGroupId = groupId || this.state.activeGroupId;
    if (!targetGroupId) return;
    
    const group = this.state.groups.get(targetGroupId);
    if (!group) return;
    
    // Open file through editor service
    await this.editorService.openFile(path);
    const editorTabs = this.editorService.getTabs();
    const tab = editorTabs.find(t => t.path === path);
    
    if (tab) {
      // Add tab to group if not already there
      if (!group.tabs.includes(tab.id)) {
        group.tabs.push(tab.id);
      }
      group.activeTabId = tab.id;
      this.state.activeGroupId = targetGroupId;
      
      this.emit('tabOpened', { tab, groupId: targetGroupId });
      this.emit('tabActivated', { tab, groupId: targetGroupId });
    }
  }
  
  closeTab(tabId: string, groupId: string): void {
    const group = this.state.groups.get(groupId);
    if (!group) return;
    
    const tabIndex = group.tabs.indexOf(tabId);
    if (tabIndex === -1) return;
    
    // Get tab info before closing
    const editorTabs = this.editorService.getTabs();
    const tab = editorTabs.find(t => t.id === tabId);
    if (!tab) return;
    
    // Store in recently closed
    const file = this.editorService.getOpenFiles().find(f => f.id === tab.fileId);
    if (file) {
      this.addToRecentlyClosed(tab, file, groupId);
    }
    
    // Remove from group
    group.tabs.splice(tabIndex, 1);
    
    // Update active tab if needed
    if (group.activeTabId === tabId) {
      if (group.tabs.length > 0) {
        const newActiveIndex = Math.min(tabIndex, group.tabs.length - 1);
        group.activeTabId = group.tabs[newActiveIndex];
      } else {
        group.activeTabId = null;
      }
    }
    
    // Close in editor service
    this.editorService.closeFile(tabId);
    
    this.emit('tabClosed', { tab, groupId });
    
    // Remove empty groups (except the last one)
    if (group.tabs.length === 0 && this.state.groups.size > 1) {
      this.removeGroup(groupId);
    }
  }
  
  moveTab(tabId: string, fromGroupId: string, toGroupId: string, toIndex: number): void {
    const fromGroup = this.state.groups.get(fromGroupId);
    const toGroup = this.state.groups.get(toGroupId);
    
    if (!fromGroup || !toGroup) return;
    
    const fromIndex = fromGroup.tabs.indexOf(tabId);
    if (fromIndex === -1) return;
    
    // Get tab info
    const editorTabs = this.editorService.getTabs();
    const tab = editorTabs.find(t => t.id === tabId);
    if (!tab) return;
    
    // Remove from source group
    fromGroup.tabs.splice(fromIndex, 1);
    
    // Add to target group
    toGroup.tabs.splice(toIndex, 0, tabId);
    toGroup.activeTabId = tabId;
    this.state.activeGroupId = toGroupId;
    
    // Update active tab in source group if needed
    if (fromGroup.activeTabId === tabId) {
      fromGroup.activeTabId = fromGroup.tabs.length > 0 ? fromGroup.tabs[0] : null;
    }
    
    this.emit('tabMoved', { tab, fromGroupId, toGroupId, toIndex });
    
    // Remove empty source group if different from target
    if (fromGroupId !== toGroupId && fromGroup.tabs.length === 0 && this.state.groups.size > 1) {
      this.removeGroup(fromGroupId);
    }
  }
  
  activateTab(tabId: string, groupId: string): void {
    const group = this.state.groups.get(groupId);
    if (!group || !group.tabs.includes(tabId)) return;
    
    group.activeTabId = tabId;
    this.state.activeGroupId = groupId;
    
    // Sync with editor service
    this.editorService.activateTab(tabId);
    
    const editorTabs = this.editorService.getTabs();
    const tab = editorTabs.find(t => t.id === tabId);
    if (tab) {
      this.emit('tabActivated', { tab, groupId });
    }
  }
  
  // Group operations
  createGroup(direction: 'horizontal' | 'vertical', referenceGroupId?: string): string {
    const newGroup: TabGroup = {
      id: this.generateId(),
      tabs: [],
      activeTabId: null
    };
    
    this.state.groups.set(newGroup.id, newGroup);
    
    // If we have a reference group, create a split
    if (referenceGroupId && this.state.groups.has(referenceGroupId)) {
      this.createSplit(referenceGroupId, direction, newGroup.id);
    }
    
    this.emit('groupCreated', { group: newGroup });
    return newGroup.id;
  }
  
  removeGroup(groupId: string): void {
    const group = this.state.groups.get(groupId);
    if (!group || this.state.groups.size <= 1) return;
    
    // Close all tabs in the group
    for (const tabId of [...group.tabs]) {
      this.closeTab(tabId, groupId);
    }
    
    // Remove from state
    this.state.groups.delete(groupId);
    
    // Update layout
    this.removePaneFromLayout(groupId);
    
    // Update active group if needed
    if (this.state.activeGroupId === groupId) {
      this.state.activeGroupId = this.state.groups.keys().next().value || null;
    }
    
    this.emit('groupRemoved', { groupId });
  }
  
  activateGroup(groupId: string): void {
    if (!this.state.groups.has(groupId)) return;
    
    this.state.activeGroupId = groupId;
    this.emit('groupActivated', { groupId });
    
    // Activate the active tab in this group
    const group = this.state.groups.get(groupId);
    if (group?.activeTabId) {
      this.activateTab(group.activeTabId, groupId);
    }
  }
  
  // Split pane operations
  private createSplit(referenceId: string, direction: 'horizontal' | 'vertical', newGroupId: string): void {
    const newSplit: SplitPane = {
      id: this.generateId(),
      direction,
      children: [],
      sizes: [50, 50]
    };
    
    // Find and replace the reference in the layout
    this.state.rootPane = this.replacePaneInLayout(this.state.rootPane, referenceId, newSplit);
    
    // Add the original and new group to the split
    const referenceGroup = this.state.groups.get(referenceId);
    const newGroup = this.state.groups.get(newGroupId);
    
    if (referenceGroup && newGroup) {
      newSplit.children = [referenceGroup, newGroup];
    }
    
    this.emit('splitCreated', { parentId: referenceId, direction });
    this.emit('layoutChanged', { rootPane: this.state.rootPane });
  }
  
  private replacePaneInLayout(pane: SplitPane | TabGroup, targetId: string, replacement: SplitPane): SplitPane | TabGroup {
    if ('tabs' in pane) {
      // It's a TabGroup
      return pane.id === targetId ? replacement : pane;
    } else {
      // It's a SplitPane
      return {
        ...pane,
        children: pane.children.map(child => 
          (('tabs' in child && child.id === targetId) || ('id' in child && child.id === targetId))
            ? replacement
            : this.replacePaneInLayout(child, targetId, replacement)
        )
      };
    }
  }
  
  private removePaneFromLayout(paneId: string): void {
    // This is a simplified version - in production, you'd want to handle
    // collapsing split panes when they only have one child
    const removeFromPane = (pane: SplitPane | TabGroup): SplitPane | TabGroup | null => {
      if ('tabs' in pane) {
        return pane.id === paneId ? null : pane;
      } else {
        const newChildren = pane.children
          .map(child => removeFromPane(child))
          .filter(child => child !== null) as (SplitPane | TabGroup)[];
        
        if (newChildren.length === 0) {
          return null;
        } else if (newChildren.length === 1) {
          return newChildren[0];
        } else {
          return { ...pane, children: newChildren };
        }
      }
    };
    
    const newRoot = removeFromPane(this.state.rootPane);
    if (newRoot) {
      this.state.rootPane = newRoot;
      this.emit('layoutChanged', { rootPane: this.state.rootPane });
    }
  }
  
  // Recently closed tabs
  private addToRecentlyClosed(tab: EditorTab, file: EditorFile, groupId: string): void {
    const recentlyClosedTab: RecentlyClosedTab = {
      tab: { ...tab },
      file: { ...file },
      closedAt: Date.now(),
      groupId
    };
    
    this.state.recentlyClosed.unshift(recentlyClosedTab);
    
    // Maintain max size
    if (this.state.recentlyClosed.length > this.configuration.maxRecentlyClosedTabs) {
      this.state.recentlyClosed.pop();
    }
  }
  
  async reopenRecentlyClosedTab(index: number = 0): Promise<void> {
    if (index >= this.state.recentlyClosed.length) return;
    
    const recentTab = this.state.recentlyClosed[index];
    this.state.recentlyClosed.splice(index, 1);
    
    // Try to reopen in the same group, or active group if not available
    const targetGroupId = this.state.groups.has(recentTab.groupId) 
      ? recentTab.groupId 
      : this.state.activeGroupId;
    
    if (targetGroupId) {
      await this.openTab(recentTab.tab.path, targetGroupId);
    }
  }
  
  getRecentlyClosedTabs(): RecentlyClosedTab[] {
    return [...this.state.recentlyClosed];
  }
  
  // Keyboard shortcuts
  private setupDefaultKeyboardShortcuts(): void {
    const shortcuts: TabKeyboardShortcut[] = [
      {
        id: 'nextTab',
        key: 'Tab',
        modifiers: ['ctrl'],
        action: () => this.navigateToNextTab(),
        description: 'Go to next tab'
      },
      {
        id: 'prevTab',
        key: 'Tab',
        modifiers: ['ctrl', 'shift'],
        action: () => this.navigateToPreviousTab(),
        description: 'Go to previous tab'
      },
      {
        id: 'closeTab',
        key: 'w',
        modifiers: ['ctrl'],
        action: () => this.closeActiveTab(),
        description: 'Close current tab'
      },
      {
        id: 'reopenTab',
        key: 't',
        modifiers: ['ctrl', 'shift'],
        action: () => this.reopenRecentlyClosedTab(),
        description: 'Reopen recently closed tab'
      },
      {
        id: 'splitHorizontal',
        key: '\\',
        modifiers: ['ctrl'],
        action: () => this.splitActiveGroup('horizontal'),
        description: 'Split editor horizontally'
      },
      {
        id: 'splitVertical',
        key: '\\',
        modifiers: ['ctrl', 'shift'],
        action: () => this.splitActiveGroup('vertical'),
        description: 'Split editor vertically'
      },
      {
        id: 'focusNextGroup',
        key: 'k',
        modifiers: ['ctrl'],
        action: () => this.focusNextGroup(),
        description: 'Focus next editor group'
      },
      {
        id: 'focusPrevGroup',
        key: 'k',
        modifiers: ['ctrl', 'shift'],
        action: () => this.focusPreviousGroup(),
        description: 'Focus previous editor group'
      }
    ];
    
    for (const shortcut of shortcuts) {
      this.registerKeyboardShortcut(shortcut);
    }
  }
  
  registerKeyboardShortcut(shortcut: TabKeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.keyboardShortcuts.set(key, shortcut);
  }
  
  unregisterKeyboardShortcut(shortcutId: string): void {
    for (const [key, shortcut] of this.keyboardShortcuts.entries()) {
      if (shortcut.id === shortcutId) {
        this.keyboardShortcuts.delete(key);
        break;
      }
    }
  }
  
  private getShortcutKey(shortcut: TabKeyboardShortcut): string {
    return [...shortcut.modifiers].sort().join('+') + '+' + shortcut.key.toLowerCase();
  }
  
  handleKeyboardShortcut(event: KeyboardEvent): boolean {
    const modifiers: string[] = [];
    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    
    const key = modifiers.sort().join('+') + '+' + event.key.toLowerCase();
    const shortcut = this.keyboardShortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
      return true;
    }
    
    return false;
  }
  
  // Navigation helpers
  private navigateToNextTab(): void {
    const group = this.state.groups.get(this.state.activeGroupId!);
    if (!group || group.tabs.length <= 1) return;
    
    const currentIndex = group.tabs.indexOf(group.activeTabId!);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % group.tabs.length;
    this.activateTab(group.tabs[nextIndex], group.id);
  }
  
  private navigateToPreviousTab(): void {
    const group = this.state.groups.get(this.state.activeGroupId!);
    if (!group || group.tabs.length <= 1) return;
    
    const currentIndex = group.tabs.indexOf(group.activeTabId!);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + group.tabs.length) % group.tabs.length;
    this.activateTab(group.tabs[prevIndex], group.id);
  }
  
  private closeActiveTab(): void {
    const group = this.state.groups.get(this.state.activeGroupId!);
    if (!group || !group.activeTabId) return;
    
    this.closeTab(group.activeTabId, group.id);
  }
  
  private splitActiveGroup(direction: 'horizontal' | 'vertical'): void {
    if (!this.state.activeGroupId) return;
    this.createGroup(direction, this.state.activeGroupId);
  }
  
  private focusNextGroup(): void {
    const groupIds = Array.from(this.state.groups.keys());
    const currentIndex = groupIds.indexOf(this.state.activeGroupId!);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % groupIds.length;
    this.activateGroup(groupIds[nextIndex]);
  }
  
  private focusPreviousGroup(): void {
    const groupIds = Array.from(this.state.groups.keys());
    const currentIndex = groupIds.indexOf(this.state.activeGroupId!);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + groupIds.length) % groupIds.length;
    this.activateGroup(groupIds[prevIndex]);
  }
  
  // Context menu actions
  getTabContextMenuActions(): TabContextMenuAction[] {
    return [
      {
        id: 'close',
        label: 'Close',
        keybinding: 'Ctrl+W',
        action: (tabId, groupId) => this.closeTab(tabId, groupId)
      },
      {
        id: 'closeOthers',
        label: 'Close Others',
        action: (tabId, groupId) => this.closeOtherTabs(tabId, groupId)
      },
      {
        id: 'closeToRight',
        label: 'Close to the Right',
        action: (tabId, groupId) => this.closeTabsToRight(tabId, groupId)
      },
      {
        id: 'closeAll',
        label: 'Close All',
        action: (_tabId, groupId) => this.closeAllTabsInGroup(groupId)
      },
      {
        id: 'separator1',
        label: '',
        separator: true,
        action: () => {}
      },
      {
        id: 'splitRight',
        label: 'Split Right',
        action: (tabId, groupId) => this.splitAndMoveTab(tabId, groupId, 'vertical')
      },
      {
        id: 'splitDown',
        label: 'Split Down',
        action: (tabId, groupId) => this.splitAndMoveTab(tabId, groupId, 'horizontal')
      }
    ];
  }
  
  private closeOtherTabs(keepTabId: string, groupId: string): void {
    const group = this.state.groups.get(groupId);
    if (!group) return;
    
    const tabsToClose = group.tabs.filter(id => id !== keepTabId);
    for (const tabId of tabsToClose) {
      this.closeTab(tabId, groupId);
    }
  }
  
  private closeTabsToRight(tabId: string, groupId: string): void {
    const group = this.state.groups.get(groupId);
    if (!group) return;
    
    const tabIndex = group.tabs.indexOf(tabId);
    if (tabIndex === -1) return;
    
    const tabsToClose = group.tabs.slice(tabIndex + 1);
    for (const closeTabId of tabsToClose) {
      this.closeTab(closeTabId, groupId);
    }
  }
  
  closeAllTabsInGroup(groupId: string): void {
    const group = this.state.groups.get(groupId);
    if (!group) return;
    
    const tabsToClose = [...group.tabs];
    for (const tabId of tabsToClose) {
      this.closeTab(tabId, groupId);
    }
  }
  
  private splitAndMoveTab(tabId: string, groupId: string, direction: 'horizontal' | 'vertical'): void {
    const newGroupId = this.createGroup(direction, groupId);
    const group = this.state.groups.get(groupId);
    if (!group) return;
    
    const tabIndex = group.tabs.indexOf(tabId);
    if (tabIndex !== -1) {
      this.moveTab(tabId, groupId, newGroupId, 0);
    }
  }
  
  // Persistence
  saveSession(): TabSessionData {
    const groups = Array.from(this.state.groups.entries()).map(([id, group]) => ({
      id,
      tabs: this.editorService.getTabs()
        .filter(tab => group.tabs.includes(tab.id))
        .map(tab => ({
          id: tab.id,
          fileId: tab.fileId,
          title: tab.title,
          path: tab.path,
          isDirty: tab.isDirty,
          isPinned: tab.isPinned || false
        })),
      activeTabId: group.activeTabId
    }));
    
    return {
      version: 1,
      timestamp: Date.now(),
      rootPane: this.state.rootPane,
      groups,
      activeGroupId: this.state.activeGroupId
    };
  }
  
  async restoreSession(data: TabSessionData): Promise<void> {
    // Clear current state
    this.state.groups.clear();
    this.state.recentlyClosed = [];
    
    // Restore layout
    this.state.rootPane = data.rootPane;
    
    // Restore groups and tabs
    for (const groupData of data.groups) {
      const group: TabGroup = {
        id: groupData.id,
        tabs: [],
        activeTabId: null
      };
      
      // Restore tabs
      for (const tabData of groupData.tabs) {
        try {
          await this.editorService.openFile(tabData.path);
          const editorTabs = this.editorService.getTabs();
          const tab = editorTabs.find(t => t.path === tabData.path);
          
          if (tab) {
            group.tabs.push(tab.id);
            
            if (tabData.isPinned) {
              this.editorService.pinTab(tab.id);
            }
          }
        } catch (error) {
          console.error(`Failed to restore tab ${tabData.path}:`, error);
        }
      }
      
      group.activeTabId = groupData.activeTabId;
      this.state.groups.set(group.id, group);
    }
    
    this.state.activeGroupId = data.activeGroupId;
    this.emit('sessionRestored', { data });
  }
  
  // State access
  getState(): TabManagerState {
    return {
      rootPane: this.state.rootPane,
      groups: new Map(this.state.groups),
      recentlyClosed: [...this.state.recentlyClosed],
      activeGroupId: this.state.activeGroupId
    };
  }
  
  getConfiguration(): TabManagerConfiguration {
    return { ...this.configuration };
  }
  
  updateConfiguration(config: Partial<TabManagerConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
  }
  
  // Sync with editor service
  private syncWithEditorService(): void {
    // Listen to editor service events
    this.editorService.on('tabActivated', (tab: EditorTab) => {
      // Find which group contains this tab
      for (const [groupId, group] of this.state.groups) {
        if (group.tabs.includes(tab.id)) {
          group.activeTabId = tab.id;
          this.state.activeGroupId = groupId;
          break;
        }
      }
    });
    
    this.editorService.on('tabsReordered', ({ fromIndex: _fromIndex, toIndex: _toIndex }: { fromIndex: number, toIndex: number }) => {
      // Update tab order in the active group
      const group = this.state.groups.get(this.state.activeGroupId!);
      if (group) {
        const tabs = this.editorService.getTabs();
        group.tabs = tabs.map(t => t.id);
      }
    });
  }
  
  // Helper methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Cleanup
  dispose(): void {
    this.listeners.clear();
    this.keyboardShortcuts.clear();
  }
}