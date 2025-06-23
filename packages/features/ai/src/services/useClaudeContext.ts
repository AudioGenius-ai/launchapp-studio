import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  AIContext,
  AIContextFile,
  AICodeSnippet,
  ProjectContext,
  FileContext
} from '../types';

export interface UseClaudeContextResult {
  currentContext: AIContext;
  updateContext: (context: Partial<AIContext>) => void;
  addFile: (file: AIContextFile) => void;
  removeFile: (filePath: string) => void;
  addCodeSnippet: (snippet: AICodeSnippet) => void;
  removeCodeSnippet: (id: string) => void;
  clearContext: () => void;
  refreshContext: () => Promise<void>;
}

export const useClaudeContext = (): UseClaudeContextResult => {
  const [currentContext, setCurrentContext] = useState<AIContext>({
    files: [],
    codeSnippets: [],
    project: undefined,
    systemPrompt: undefined,
    metadata: {}
  });

  // Load initial context from current project and open files
  const loadInitialContext = useCallback(async () => {
    try {
      // Get current project path from localStorage
      const projectPath = localStorage.getItem('currentProjectPath');
      if (projectPath) {
        // Get project info
        const projectInfo = await invoke<any>('get_project_info', { path: projectPath });
        
        const projectContext: ProjectContext = {
          id: projectPath,
          name: projectInfo?.name || projectPath.split('/').pop() || 'Unknown',
          path: projectPath,
          description: projectInfo?.description,
          technologies: projectInfo?.technologies || [],
          metadata: projectInfo?.metadata || {}
        };

        setCurrentContext(prev => ({
          ...prev,
          project: projectContext
        }));
      }

      // Get current open file from editor session
      const editorSession = localStorage.getItem('editorSession');
      if (editorSession) {
        try {
          const session = JSON.parse(editorSession);
          const activeTab = session.tabs?.find((tab: any) => tab.isActive);
          
          if (activeTab?.file) {
            const fileContext: FileContext = {
              path: activeTab.file.path,
              content: activeTab.file.content,
              language: activeTab.file.language || 'plaintext',
              metadata: {}
            };

            setCurrentContext(prev => ({
              ...prev,
              files: [{
                path: activeTab.file.path,
                content: activeTab.file.content,
                language: activeTab.file.language || 'plaintext'
              }]
            }));
          }
        } catch (err) {
          console.warn('Failed to parse editor session:', err);
        }
      }
    } catch (error) {
      console.error('Failed to load initial context:', error);
    }
  }, []);

  useEffect(() => {
    loadInitialContext();

    // Listen for project changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentProjectPath' && e.newValue) {
        loadInitialContext();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadInitialContext]);

  const updateContext = useCallback((context: Partial<AIContext>) => {
    setCurrentContext(prev => ({
      ...prev,
      ...context
    }));
  }, []);

  const addFile = useCallback((file: AIContextFile) => {
    setCurrentContext(prev => ({
      ...prev,
      files: [...(prev.files || []).filter(f => f.path !== file.path), file]
    }));
  }, []);

  const removeFile = useCallback((filePath: string) => {
    setCurrentContext(prev => ({
      ...prev,
      files: (prev.files || []).filter(f => f.path !== filePath)
    }));
  }, []);

  const addCodeSnippet = useCallback((snippet: AICodeSnippet) => {
    setCurrentContext(prev => ({
      ...prev,
      codeSnippets: [...(prev.codeSnippets || []), snippet]
    }));
  }, []);

  const removeCodeSnippet = useCallback((id: string) => {
    setCurrentContext(prev => ({
      ...prev,
      codeSnippets: (prev.codeSnippets || []).filter(s => s.id !== id)
    }));
  }, []);

  const clearContext = useCallback(() => {
    setCurrentContext({
      project: currentContext.project,
      files: [],
      codeSnippets: [],
      systemPrompt: undefined,
      metadata: {}
    });
  }, [currentContext.project]);

  const refreshContext = useCallback(async () => {
    await loadInitialContext();
  }, [loadInitialContext]);

  return {
    currentContext,
    updateContext,
    addFile,
    removeFile,
    addCodeSnippet,
    removeCodeSnippet,
    clearContext,
    refreshContext
  };
};