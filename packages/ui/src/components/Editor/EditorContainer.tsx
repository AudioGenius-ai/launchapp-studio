import React, { useState, useEffect, useCallback } from 'react';
import { EditorService, FileService } from '@code-pilot/core';
import { 
  EditorFile, 
  EditorTab, 
  EditorConfiguration,
  DEFAULT_EDITOR_CONFIG 
} from '@code-pilot/types';
import { MonacoEditor } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { EditorStatusBar } from './EditorStatusBar';
import { cn } from '../../utils/cn';

interface EditorContainerProps {
  fileService: FileService;
  className?: string;
  onFileChange?: (file: EditorFile) => void;
  onConfigChange?: (config: EditorConfiguration) => void;
}

export const EditorContainer = React.forwardRef<any, EditorContainerProps>(({
  fileService,
  className,
  onFileChange,
  onConfigChange
}, ref) => {
  const [editorService] = useState(() => new EditorService(fileService));
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeFile, setActiveFile] = useState<EditorFile | undefined>();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [config, setConfig] = useState<EditorConfiguration>(DEFAULT_EDITOR_CONFIG);

  useEffect(() => {
    // Subscribe to editor service events
    const handleStateChanged = () => {
      const state = editorService.getState();
      setTabs(state.tabs);
      setActiveTabId(state.activeTabId);
      setActiveFile(editorService.getActiveFile());
    };

    const handleFileContentChanged = ({ file }: { file: EditorFile }) => {
      if (file.id === activeFile?.id) {
        setActiveFile({ ...file });
      }
      onFileChange?.(file);
    };

    const handleConfigurationChanged = (newConfig: EditorConfiguration) => {
      setConfig(newConfig);
      onConfigChange?.(newConfig);
    };

    editorService.on('stateChanged', handleStateChanged);
    editorService.on('fileContentChanged', handleFileContentChanged);
    editorService.on('configurationChanged', handleConfigurationChanged);

    return () => {
      editorService.off('stateChanged', handleStateChanged);
      editorService.off('fileContentChanged', handleFileContentChanged);
      editorService.off('configurationChanged', handleConfigurationChanged);
      editorService.dispose();
    };
  }, [editorService, activeFile, onFileChange, onConfigChange]);

  const handleTabClick = useCallback((tabId: string) => {
    editorService.activateTab(tabId);
  }, [editorService]);

  const handleTabClose = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isDirty) {
      // TODO: Show confirmation dialog
      if (!confirm(`"${tab.title}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }
    editorService.closeFile(tabId);
  }, [editorService, tabs]);

  const handleTabPin = useCallback((tabId: string) => {
    editorService.pinTab(tabId);
  }, [editorService]);

  const handleTabUnpin = useCallback((tabId: string) => {
    editorService.unpinTab(tabId);
  }, [editorService]);

  const handleTabReorder = useCallback((fromIndex: number, toIndex: number) => {
    editorService.reorderTabs(fromIndex, toIndex);
  }, [editorService]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      editorService.updateFileContent(activeFile.id, value);
    }
  }, [editorService, activeFile]);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    // Handle save command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (activeFile) {
        handleSaveFile();
      }
    });

    // Handle close command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW, () => {
      if (activeTabId) {
        handleTabClose(activeTabId);
      }
    });
  }, [activeFile, activeTabId]);

  const handleSaveFile = useCallback(async () => {
    if (activeFile) {
      try {
        await editorService.saveFile(activeFile.id);
      } catch (error) {
        console.error('Failed to save file:', error);
        // TODO: Show error notification
      }
    }
  }, [editorService, activeFile]);

  const handleSaveAllFiles = useCallback(async () => {
    try {
      await editorService.saveAllFiles();
    } catch (error) {
      console.error('Failed to save all files:', error);
      // TODO: Show error notification
    }
  }, [editorService]);

  // Public methods for external file operations
  const openFile = useCallback(async (path: string) => {
    try {
      await editorService.openFile(path);
    } catch (error) {
      console.error('Failed to open file:', error);
      // TODO: Show error notification
    }
  }, [editorService]);

  const closeAllFiles = useCallback(() => {
    if (editorService.hasUnsavedChanges()) {
      if (!confirm('Some files have unsaved changes. Close all anyway?')) {
        return;
      }
    }
    editorService.closeAllFiles();
  }, [editorService]);

  // Expose editor API
  React.useImperativeHandle(ref, () => ({
    openFile,
    saveFile: handleSaveFile,
    saveAllFiles: handleSaveAllFiles,
    closeFile: (fileId: string) => editorService.closeFile(fileId),
    closeAllFiles,
    getActiveFile: () => activeFile,
    getOpenFiles: () => editorService.getOpenFiles(),
    hasUnsavedChanges: () => editorService.hasUnsavedChanges(),
    updateConfiguration: (config: Partial<EditorConfiguration>) => {
      editorService.updateConfiguration(config);
    }
  }), [openFile, handleSaveFile, handleSaveAllFiles, closeAllFiles, activeFile, editorService]);

  return (
    <div className={cn('flex flex-col h-full bg-gray-900', className)}>
      {tabs.length > 0 && (
        <EditorTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onTabPin={handleTabPin}
          onTabUnpin={handleTabUnpin}
          onTabReorder={handleTabReorder}
        />
      )}
      
      <div className="flex-1 overflow-hidden">
        {activeFile ? (
          <MonacoEditor
            key={activeFile.id}
            value={activeFile.content}
            language={activeFile.language}
            path={activeFile.path}
            theme={config.theme}
            options={config}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No file open</p>
              <p className="text-sm">Open a file from the file explorer to start editing</p>
            </div>
          </div>
        )}
      </div>
      
      {activeFile && (
        <EditorStatusBar
          file={activeFile}
          position={null}
          encoding="UTF-8"
          lineEnding="LF"
          language={activeFile.language}
          onLanguageChange={(language) => {
            // TODO: Implement language change
            console.log('Language change:', language);
          }}
        />
      )}
    </div>
  );
});

EditorContainer.displayName = 'EditorContainer';

export default EditorContainer;