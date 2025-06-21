import { useState, useRef, useEffect } from 'react';
import { FileTree, TabManagerContainer, RecentlyClosedTabs } from '@code-pilot/ui';
import { FileService } from '@code-pilot/core';
import type { FileSystemNode, EditorFile, TabSessionData } from '@code-pilot/types';
import { invoke } from '@tauri-apps/api/core';
import { Menu, X, RotateCcw, Save, SaveAll } from 'lucide-react';

export function EnhancedEditorPage() {
  const [fileService] = useState(() => FileService.getInstance());
  const editorRef = useRef<any>(null);
  const [currentProjectPath, setCurrentProjectPath] = useState<string>('');
  const [showRecentlyClosedPanel, setShowRecentlyClosedPanel] = useState(false);
  const [recentlyClosedTabs, setRecentlyClosedTabs] = useState<any[]>([]);

  useEffect(() => {
    // Get the current project path from localStorage or use default
    const storedProjectPath = localStorage.getItem('currentProjectPath');
    if (storedProjectPath) {
      setCurrentProjectPath(storedProjectPath);
    } else {
      // Use the user's home directory as default
      invoke<string>('get_home_dir').then(homeDir => {
        setCurrentProjectPath(homeDir);
      }).catch(() => {
        // Fallback to current directory
        setCurrentProjectPath(process.cwd());
      });
    }

    // Restore session if available
    const savedSession = localStorage.getItem('editorSession');
    if (savedSession && editorRef.current) {
      try {
        const sessionData: TabSessionData = JSON.parse(savedSession);
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
  }, []);

  const handleFileSelect = (file: FileSystemNode) => {
    console.log('Selected file:', file);
  };

  const handleFileOpen = async (file: FileSystemNode) => {
    if (file.type === 'file' && editorRef.current) {
      try {
        await editorRef.current.openFile(file.path);
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }
  };

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
    <div className="flex h-screen bg-gray-900 text-gray-100" onKeyDown={handleKeyDown}>
      {/* File Explorer Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Explorer</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FileTree
            rootPath={currentProjectPath}
            onFileSelect={handleFileSelect}
            onFileOpen={handleFileOpen}
          />
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRecentlyClosedPanel(!showRecentlyClosedPanel)}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Recently Closed Tabs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-gray-600" />
            <button
              onClick={handleSave}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveAll}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Save All (Ctrl+Shift+S)"
            >
              <SaveAll className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-400">
            Code Pilot Studio v2
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
              onClick={() => setShowRecentlyClosedPanel(false)}
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