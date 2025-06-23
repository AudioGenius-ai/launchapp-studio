import { useState, useRef, useEffect } from 'react';
import { RecentlyClosedTabs } from './RecentlyClosedTabs';
import { TabManagerContainer } from './TabManagerContainer';
import { FileService } from '@code-pilot/core';
import type { EditorFile, TabSessionData } from "../types";
import { invoke } from '@tauri-apps/api/core';
import { X, RotateCcw, Save, SaveAll } from 'lucide-react';
import { useEditorStore } from '../stores';

// Declare window globals set by Tauri
declare global {
  interface Window {
    __PROJECT_ID__?: string;
    __PROJECT_PATH__?: string;
    __IS_SAVED_PROJECT__?: boolean;
    __IS_TEMP__?: boolean;
  }
}

export function EnhancedEditorPage() {
  const [fileService] = useState(() => FileService.getInstance());
  const editorRef = useRef<any>(null);
  
  const {
    showRecentlyClosedPanel,
    recentlyClosedTabs,
    setProjectPath,
    toggleRecentlyClosedPanel,
    setRecentlyClosedTabs
  } = useEditorStore();

  useEffect(() => {
    // Function to initialize project path
    const initializeProjectPath = () => {
      // Get the current project path from window globals (set by Tauri)
      const windowProjectPath = window.__PROJECT_PATH__;
      
      if (windowProjectPath) {
        console.log('Using project path from window:', windowProjectPath);
        setProjectPath(windowProjectPath);
        // Also store in localStorage for persistence
        localStorage.setItem('currentProjectPath', windowProjectPath);
        return true;
      }
      return false;
    };

    // Try to get project path immediately
    if (!initializeProjectPath()) {
      // If not available, wait a bit and try again (window.eval might not have executed yet)
      const timeout = setTimeout(() => {
        if (!initializeProjectPath()) {
          // Still no project path, fallback to localStorage
          const storedProjectPath = localStorage.getItem('currentProjectPath');
          if (storedProjectPath) {
            console.log('Using project path from localStorage:', storedProjectPath);
            setProjectPath(storedProjectPath);
          } else {
            // Use the user's home directory as default
            console.log('No project path found, using home directory');
            invoke<string>('get_home_dir').then((homeDir: string) => {
              setProjectPath(homeDir);
              localStorage.setItem('currentProjectPath', homeDir);
            }).catch((error: any) => {
              console.error('Failed to get home directory:', error);
              // Fallback to root directory
              setProjectPath('/');
            });
          }
        }
      }, 100); // Wait 100ms for window globals to be set

      // Cleanup timeout
      return () => clearTimeout(timeout);
    }
    
    // Listen for file open requests from the file explorer
    const handleFileOpenRequest = async (event: CustomEvent) => {
      const { path } = event.detail;
      if (path && editorRef.current) {
        try {
          await editorRef.current.openFile(path);
        } catch (error) {
          console.error('Failed to open file:', error);
        }
      }
    };
    
    window.addEventListener('file-open-requested', handleFileOpenRequest as any);
    
    return () => {
      window.removeEventListener('file-open-requested', handleFileOpenRequest as any);
    };

    // Restore session if available
    const savedSession = localStorage.getItem('editorSession');
    if (savedSession && editorRef.current) {
      try {
        const sessionData: TabSessionData = JSON.parse(savedSession!);
        editorRef.current.restoreSession(sessionData);
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }

    // Auto-save session periodically
    const saveSessionInterval = setInterval(() => {
      if (editorRef.current) {
        const sessionData = editorRef.current.saveSession();
        localStorage.setItem('editorSession', JSON.stringify(sessionData));
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveSessionInterval);
  }, [setProjectPath]);

  const handleFileChange = (file: EditorFile) => {
    console.log('File changed:', file.path, 'isDirty:', file.isDirty);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Global keyboard shortcuts are now handled by TabService
    // This is just for additional app-level shortcuts
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      // Open command palette (not implemented)
      console.log('Open command palette');
    }
  };

  const handleReopenTab = async (index: number) => {
    if (editorRef.current) {
      await editorRef.current.reopenRecentTab(index);
      // Update recently closed tabs list
      updateRecentlyClosedTabs();
    }
  };

  const updateRecentlyClosedTabs = () => {
    if (editorRef.current) {
      const tabs = editorRef.current.getRecentlyClosedTabs?.() || [];
      setRecentlyClosedTabs(tabs);
    }
  };

  const handleSave = async () => {
    if (editorRef.current) {
      await editorRef.current.saveFile();
    }
  };

  const handleSaveAll = async () => {
    if (editorRef.current) {
      await editorRef.current.saveAllFiles();
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-900 text-gray-100 enhanced-editor-page" data-component="enhanced-editor-page" onKeyDown={handleKeyDown}>
      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor-specific Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-1 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleRecentlyClosedPanel}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Recently Closed Tabs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-gray-600" />
            <button
              onClick={handleSave}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveAll}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              title="Save All (Ctrl+Shift+S)"
            >
              <SaveAll className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Manager */}
        <TabManagerContainer
          ref={editorRef}
          fileService={fileService}
          onFileChange={handleFileChange}
          className="flex-1"
        />
      </div>

      {/* Recently Closed Panel */}
      {showRecentlyClosedPanel && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">Recently Closed</h3>
            <button
              onClick={toggleRecentlyClosedPanel}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RecentlyClosedTabs
              tabs={recentlyClosedTabs}
              onReopen={handleReopenTab}
            />
          </div>
        </div>
      )}
    </div>
  );
}