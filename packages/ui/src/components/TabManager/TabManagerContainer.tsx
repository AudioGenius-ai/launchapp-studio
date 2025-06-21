import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TabService, EditorService, FileService } from '@code-pilot/core';
import {
  TabManagerState,
  TabGroup as TabGroupType,
  SplitPane as SplitPaneType,
  EditorTab,
  EditorFile,
  TabContextMenuAction
} from '@code-pilot/types';
import { TabGroup } from './TabGroup';
import { SplitPane } from './SplitPane';
import { RecentlyClosedTabs } from './RecentlyClosedTabs';
import { MonacoEditor } from '../Editor/MonacoEditor';
import { EditorStatusBar } from '../Editor/EditorStatusBar';
import { cn } from '../../utils/cn';

interface TabManagerContainerProps {
  fileService: FileService;
  className?: string;
  onFileChange?: (file: EditorFile) => void;
}

export const TabManagerContainer = React.forwardRef<any, TabManagerContainerProps>(({
  fileService,
  className,
  onFileChange
}, ref) => {
  const [editorService] = useState(() => new EditorService(fileService));
  const [tabService] = useState(() => new TabService(editorService));
  const [state, setState] = useState<TabManagerState>(tabService.getState());
  const [editorFiles, setEditorFiles] = useState<Map<string, EditorFile>>(new Map());
  const [editorTabs, setEditorTabs] = useState<EditorTab[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
    groupId: string;
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Subscribe to tab service events
    const updateState = () => {
      setState(tabService.getState());
    };
    
    const updateEditorData = () => {
      setEditorFiles(new Map(editorService.getOpenFiles().map(f => [f.id, f])));
      setEditorTabs(editorService.getTabs());
    };
    
    // Tab service events
    tabService.on('tabOpened', updateState);
    tabService.on('tabClosed', updateState);
    tabService.on('tabMoved', updateState);
    tabService.on('tabActivated', updateState);
    tabService.on('groupCreated', updateState);
    tabService.on('groupRemoved', updateState);
    tabService.on('groupActivated', updateState);
    tabService.on('layoutChanged', updateState);
    
    // Editor service events
    editorService.on('stateChanged', updateEditorData);
    editorService.on('fileContentChanged', ({ file }) => {
      setEditorFiles(prev => new Map(prev).set(file.id, file));
      onFileChange?.(file);
    });
    
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      tabService.handleKeyboardShortcut(e);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      tabService.dispose();
      editorService.dispose();
    };
  }, [tabService, editorService, onFileChange]);
  
  const handleTabClick = useCallback((tabId: string, groupId: string) => {
    tabService.activateTab(tabId, groupId);
  }, [tabService]);
  
  const handleTabClose = useCallback((tabId: string, groupId: string) => {
    const tab = editorTabs.find(t => t.id === tabId);
    if (tab?.isDirty) {
      if (!confirm(`"${tab.title}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }
    tabService.closeTab(tabId, groupId);
  }, [tabService, editorTabs]);
  
  const handleTabDrop = useCallback((tabId: string, targetGroupId: string, targetIndex: number) => {
    // Find source group
    let sourceGroupId: string | null = null;
    state.groups.forEach((group, groupId) => {
      if (group.tabs.includes(tabId)) {
        sourceGroupId = groupId;
      }
    });
    
    if (sourceGroupId) {
      tabService.moveTab(tabId, sourceGroupId, targetGroupId, targetIndex);
    }
  }, [tabService, state.groups]);
  
  const handleGroupClick = useCallback((groupId: string) => {
    tabService.activateGroup(groupId);
  }, [tabService]);
  
  const handleSplit = useCallback((groupId: string, direction: 'horizontal' | 'vertical') => {
    tabService.createGroup(direction, groupId);
  }, [tabService]);
  
  const handleSizeChange = useCallback((paneId: string, sizes: number[]) => {
    // Update split pane sizes in state
    // This would be implemented in a production version
    console.log('Size change:', paneId, sizes);
  }, []);
  
  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string, groupId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId, groupId });
  }, []);
  
  const handleContextMenuAction = useCallback((action: TabContextMenuAction) => {
    if (contextMenu) {
      action.action(contextMenu.tabId, contextMenu.groupId);
      setContextMenu(null);
    }
  }, [contextMenu]);
  
  const handleSaveFile = useCallback(async () => {
    const activeGroup = state.groups.get(state.activeGroupId!);
    if (activeGroup?.activeTabId) {
      const tab = editorTabs.find(t => t.id === activeGroup.activeTabId);
      if (tab) {
        await editorService.saveFile(tab.fileId);
      }
    }
  }, [state, editorTabs, editorService]);
  
  const openFile = useCallback(async (path: string) => {
    await tabService.openTab(path);
  }, [tabService]);
  
  const reopenRecentTab = useCallback(async (index: number) => {
    await tabService.reopenRecentlyClosedTab(index);
  }, [tabService]);
  
  // Render pane recursively
  const renderPane = (pane: SplitPaneType | TabGroupType): React.ReactNode => {
    if ('tabs' in pane) {
      // It's a TabGroup
      const group = pane as TabGroupType;
      const groupTabs = editorTabs.filter(tab => group.tabs.includes(tab.id));
      const activeFile = group.activeTabId 
        ? editorFiles.get(editorTabs.find(t => t.id === group.activeTabId)?.fileId || '')
        : undefined;
      
      return (
        <TabGroup
          key={group.id}
          group={group}
          tabs={groupTabs}
          isActive={state.activeGroupId === group.id}
          onTabClick={(tabId) => handleTabClick(tabId, group.id)}
          onTabClose={(tabId) => handleTabClose(tabId, group.id)}
          onTabPin={(tabId) => editorService.pinTab(tabId)}
          onTabUnpin={(tabId) => editorService.unpinTab(tabId)}
          onTabDrop={handleTabDrop}
          onGroupClick={() => handleGroupClick(group.id)}
          onSplit={(direction) => handleSplit(group.id, direction)}
        >
          {activeFile ? (
            <MonacoEditor
              key={activeFile.id}
              value={activeFile.content}
              language={activeFile.language}
              path={activeFile.path}
              onChange={(value) => {
                if (value !== undefined) {
                  editorService.updateFileContent(activeFile.id, value);
                }
              }}
              onMount={(editor, monaco) => {
                // Save shortcut
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, handleSaveFile);
              }}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No file open</p>
                <p className="text-sm">Open a file to start editing</p>
              </div>
            </div>
          )}
        </TabGroup>
      );
    } else {
      // It's a SplitPane
      const splitPane = pane as SplitPaneType;
      return (
        <SplitPane
          key={splitPane.id}
          pane={splitPane}
          onSizeChange={(sizes) => handleSizeChange(splitPane.id, sizes)}
        >
          {splitPane.children.map(child => renderPane(child))}
        </SplitPane>
      );
    }
  };
  
  // Get active file for status bar
  const getActiveFile = (): EditorFile | undefined => {
    const activeGroup = state.groups.get(state.activeGroupId!);
    if (activeGroup?.activeTabId) {
      const tab = editorTabs.find(t => t.id === activeGroup.activeTabId);
      return tab ? editorFiles.get(tab.fileId) : undefined;
    }
    return undefined;
  };
  
  const activeFile = getActiveFile();
  
  // Expose API
  React.useImperativeHandle(ref, () => ({
    openFile,
    saveFile: handleSaveFile,
    saveAllFiles: () => editorService.saveAllFiles(),
    closeAllFiles: () => {
      state.groups.forEach((group, groupId) => {
        tabService.closeAllTabsInGroup(groupId);
      });
    },
    getActiveFile,
    getOpenFiles: () => Array.from(editorFiles.values()),
    hasUnsavedChanges: () => editorService.hasUnsavedChanges(),
    saveSession: () => tabService.saveSession(),
    restoreSession: (data: any) => tabService.restoreSession(data),
    reopenRecentTab
  }), [openFile, handleSaveFile, editorService, tabService, state, editorFiles, getActiveFile]);
  
  return (
    <div 
      ref={containerRef}
      className={cn('flex flex-col h-full bg-gray-900', className)}
      onClick={() => setContextMenu(null)}
    >
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {renderPane(state.rootPane)}
      </div>
      
      {/* Status bar */}
      {activeFile && (
        <EditorStatusBar
          file={activeFile}
          position={null}
          encoding="UTF-8"
          lineEnding="LF"
          language={activeFile.language}
          onLanguageChange={(language) => {
            console.log('Language change:', language);
          }}
        />
      )}
      
      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-700 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {tabService.getTabContextMenuActions().map(action => (
            action.separator ? (
              <div key={action.id} className="border-t border-gray-700 my-1" />
            ) : (
              <button
                key={action.id}
                className={cn(
                  'w-full text-left px-4 py-1 text-sm hover:bg-gray-700',
                  action.enabled === false && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => handleContextMenuAction(action)}
                disabled={action.enabled === false}
              >
                <span>{action.label}</span>
                {action.keybinding && (
                  <span className="ml-auto text-gray-500 text-xs">{action.keybinding}</span>
                )}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
});

TabManagerContainer.displayName = 'TabManagerContainer';

export default TabManagerContainer;