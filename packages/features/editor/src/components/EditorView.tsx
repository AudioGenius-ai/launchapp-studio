import React, { useRef, useEffect, useState } from 'react';
import { Editor, loader } from '@monaco-editor/react';
import { fileService } from '@code-pilot/core';

interface EditorViewProps {
  filePath: string;
  language: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

// Configure Monaco Editor loader
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });

export const EditorView: React.FC<EditorViewProps> = ({
  filePath,
  language,
  onContentChange,
  className
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        const fileContent = await fileService.readFile(filePath);
        setContent(fileContent);
      } catch (error) {
        console.error('Failed to load file:', error);
        setContent(`// Error loading file: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [filePath]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Focus editor
    editor.focus();
    
    // Setup auto-save on change
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onContentChange?.(value);
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      onContentChange?.(value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className || ''}`}>
      <Editor
        height="100%"
        language={language}
        value={content}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          rulers: [80, 120],
          wordWrap: 'off',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          tabSize: 2,
          detectIndentation: true,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'mouseover',
          matchBrackets: 'always',
          renderWhitespace: 'selection',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          }
        }}
      />
    </div>
  );
};