import { useState, useRef, useEffect } from 'react';
import { FileTree, EditorContainer } from '@code-pilot/ui';
import { FileService } from '@code-pilot/core';
import type { FileSystemNode, EditorFile } from '@code-pilot/types';
import { invoke } from '@tauri-apps/api/core';

export function EditorPage() {
  const [fileService] = useState(() => FileService.getInstance());
  const editorRef = useRef<any>(null);
  const [currentProjectPath, setCurrentProjectPath] = useState<string>('');

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
    // Handle global keyboard shortcuts
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.saveFile();
      }
    } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's') {
      e.preventDefault();
      if (editorRef.current) {
        editorRef.current.saveAllFiles();
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100" onKeyDown={handleKeyDown}>
      {/* File Explorer Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Explorer</h2>
        </div>
        <FileTree
          rootPath={currentProjectPath}
          onFileSelect={handleFileSelect}
          onFileOpen={handleFileOpen}
          className="h-full overflow-y-auto"
        />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        <EditorContainer
          ref={editorRef}
          fileService={fileService}
          onFileChange={handleFileChange}
          className="h-full"
        />
      </div>
    </div>
  );
}