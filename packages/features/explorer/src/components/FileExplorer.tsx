import React, { useEffect, useState } from 'react';
import { FileTree } from './FileTree';
import { fileService } from '@code-pilot/core';
import { FileSystemNode } from '@code-pilot/types';
import { invoke } from '@tauri-apps/api/core';

// Declare window globals set by Tauri
declare global {
  interface Window {
    __PROJECT_ID__?: string;
    __PROJECT_PATH__?: string;
    __IS_SAVED_PROJECT__?: boolean;
    __IS_TEMP__?: boolean;
  }
}

export const FileExplorer: React.FC = () => {
  const [currentProjectPath, setCurrentProjectPath] = useState<string>('');

  useEffect(() => {
    loadProjectPath();
  }, []);

  const loadProjectPath = async () => {
    try {
      // First, check if fileService already has a project path
      let projectPath: string | undefined = fileService.getCurrentProjectPath() || undefined;
      
      if (!projectPath) {
        // Check window globals (set by Tauri)
        projectPath = (window as any).__PROJECT_PATH__;
        
        if (!projectPath) {
          // Fallback to localStorage
          projectPath = localStorage.getItem('currentProjectPath') || undefined;
          
          if (!projectPath) {
            // Use home directory as default
            try {
              projectPath = await invoke<string>('get_home_dir');
            } catch (error) {
              console.error('Failed to get home directory:', error);
              projectPath = '/';
            }
          }
        }
        
        // Set the root path in fileService
        if (projectPath) {
          fileService.setRootPath(projectPath);
        }
      }
      
      if (projectPath) {
        setCurrentProjectPath(projectPath);
      }
    } catch (error) {
      console.error('Failed to load project path:', error);
    }
  };

  const handleFileSelect = (node: FileSystemNode) => {
    console.log('File selected:', node.path);
  };
  
  const handleFileOpen = async (node: FileSystemNode) => {
    if (node.type === 'file') {
      try {
        // Emit a custom event that the parent component can listen to
        const event = new CustomEvent('file-open-requested', { 
          detail: { path: node.path },
          bubbles: true 
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }
  };

  if (!currentProjectPath) {
    return (
      <div className="p-4 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
        No project open
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <FileTree
        rootPath={currentProjectPath}
        onFileSelect={handleFileSelect}
        onFileOpen={handleFileOpen}
      />
    </div>
  );
};