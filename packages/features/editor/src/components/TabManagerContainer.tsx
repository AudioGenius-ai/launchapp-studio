import { forwardRef, useImperativeHandle, useState } from 'react';
import { TabGroup } from './TabGroup';
import { EditorTab, TabGroup as TabGroupType, EditorFile, TabSessionData } from '../types';
import { FileService } from '@code-pilot/core';
import { EditorView } from './EditorView';
import { cn } from '@code-pilot/ui-kit';

interface TabManagerContainerProps {
  fileService: FileService;
  onFileChange?: (file: EditorFile) => void;
  className?: string;
}

export interface TabManagerHandle {
  openFile: (filePath: string) => Promise<void>;
  saveFile: () => Promise<void>;
  saveAllFiles: () => Promise<void>;
  reopenRecentTab: (index: number) => Promise<void>;
  getRecentlyClosedTabs: () => EditorTab[];
  saveSession: () => TabSessionData;
  restoreSession: (session: TabSessionData) => void;
}

export const TabManagerContainer = forwardRef<TabManagerHandle, TabManagerContainerProps>(({
  fileService,
  onFileChange,
  className
}, ref) => {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [recentlyClosedTabs, setRecentlyClosedTabs] = useState<EditorTab[]>([]);
  const [tabGroup, setTabGroup] = useState<TabGroupType>({
    id: 'main-group',
    activeTabId: null,
    tabs: []
  });

  // Create a new tab
  const createTab = (file: EditorFile): EditorTab => {
    return {
      id: `tab-${Date.now()}-${Math.random()}`,
      fileId: file.id,
      title: file.name || 'Untitled',
      path: file.path,
      isDirty: false,
      isPinned: false
    };
  };

  // Open a file in a new tab
  const openFile = async (filePath: string) => {
    try {
      // Check if file is already open
      const existingTab = tabs.find(tab => tab.path === filePath);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      // Read file content
      const content = await fileService.readFile(filePath);
      const fileName = filePath.split('/').pop() || 'Untitled';
      
      const file: EditorFile = {
        id: `file-${Date.now()}`,
        name: fileName,
        path: filePath,
        content,
        language: getLanguageFromPath(filePath),
        isDirty: false
      };

      const newTab = createTab(file);
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      setTabGroup(prev => ({
        ...prev,
        activeTabId: newTab.id,
        tabs: [...prev.tabs, newTab.id]
      }));
      
      onFileChange?.(file);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  // Save current file
  const saveFile = async () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab || !activeTab.path) return;

    try {
      // In a real implementation, we'd get the current content from the editor
      // For now, we'll just mark the tab as not dirty
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId ? { ...tab, isDirty: false } : tab
      ));
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  // Save all files
  const saveAllFiles = async () => {
    for (const tab of tabs.filter(t => t.isDirty)) {
      // Save each dirty file
      try {
        setTabs(prev => prev.map(t => 
          t.id === tab.id ? { ...t, isDirty: false } : t
        ));
      } catch (error) {
        console.error(`Failed to save file ${tab.path}:`, error);
      }
    }
  };

  // Close a tab
  const closeTab = (tabId: string) => {
    const tabToClose = tabs.find(tab => tab.id === tabId);
    if (!tabToClose) return;

    // Add to recently closed
    setRecentlyClosedTabs(prev => [tabToClose, ...prev].slice(0, 10));

    // Remove the tab
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    setTabGroup(prev => ({
      ...prev,
      tabs: prev.tabs.filter((id: string) => id !== tabId),
      activeTabId: prev.activeTabId === tabId ? null : prev.activeTabId
    }));

    // Set new active tab if needed
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[remainingTabs.length - 1].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  // Reopen a recently closed tab
  const reopenRecentTab = async (index: number) => {
    if (index >= recentlyClosedTabs.length) return;
    
    const tabToReopen = recentlyClosedTabs[index];
    if (tabToReopen.path) {
      await openFile(tabToReopen.path);
      
      // Remove from recently closed
      setRecentlyClosedTabs(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Session management
  const saveSession = (): TabSessionData => {
    return {
      version: 1,
      timestamp: Date.now(),
      rootPane: tabGroup,
      groups: [{
        id: tabGroup.id,
        tabs: tabs.map(tab => ({
          id: tab.id,
          fileId: tab.fileId,
          title: tab.title,
          path: tab.path,
          isDirty: tab.isDirty,
          isPinned: tab.isPinned || false
        })),
        activeTabId
      }],
      activeGroupId: tabGroup.id
    };
  };

  const restoreSession = (session: TabSessionData) => {
    if (session.groups && session.groups.length > 0) {
      const firstGroup = session.groups[0];
      const restoredTabs: EditorTab[] = firstGroup.tabs;
      setTabs(restoredTabs);
      setActiveTabId(firstGroup.activeTabId);
      setTabGroup({
        id: firstGroup.id,
        activeTabId: firstGroup.activeTabId,
        tabs: restoredTabs.map(tab => tab.id)
      });
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    openFile,
    saveFile,
    saveAllFiles,
    reopenRecentTab,
    getRecentlyClosedTabs: () => recentlyClosedTabs,
    saveSession,
    restoreSession
  }));

  // Helper function to determine language from file extension
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rs: 'rust',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      r: 'r',
      m: 'matlab',
      sql: 'sql',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sh: 'shell',
      bash: 'shell',
      zsh: 'shell',
      fish: 'shell',
      ps1: 'powershell',
      dockerfile: 'dockerfile',
      makefile: 'makefile',
      toml: 'toml',
      ini: 'ini',
      conf: 'conf',
      lua: 'lua',
      vim: 'vim',
      vue: 'vue',
      svelte: 'svelte'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {tabs.length > 0 && (
        <TabGroup
          group={tabGroup}
          tabs={tabs}
          isActive={true}
          onTabClick={setActiveTabId}
          onTabClose={closeTab}
          onTabDrop={(tabId, groupId, index) => {
            // Handle tab reordering
            console.log('Tab drop:', tabId, groupId, index);
          }}
          onGroupClick={() => {}}
          className="flex-shrink-0"
        >
          {activeTab && activeTab.path && (
            <EditorView
              filePath={activeTab.path}
              language={getLanguageFromPath(activeTab.path)}
              onContentChange={() => {
                // Update tab dirty state
                setTabs(prev => prev.map(tab =>
                  tab.id === activeTabId ? { ...tab, isDirty: true } : tab
                ));
              }}
            />
          )}
        </TabGroup>
      )}
      
      {tabs.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">No files open</p>
            <p className="text-sm">Open a file from the explorer to get started</p>
          </div>
        </div>
      )}
    </div>
  );
});

TabManagerContainer.displayName = 'TabManagerContainer';