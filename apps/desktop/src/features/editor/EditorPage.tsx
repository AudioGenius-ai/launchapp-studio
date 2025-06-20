import { useState } from 'react';
import { FileTree } from '@code-pilot/ui';
import type { FileSystemNode } from '@code-pilot/types';

export function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const handleFileSelect = (file: FileSystemNode) => {
    setSelectedFile(file);
    console.log('Selected file:', file);
  };

  const handleFileOpen = async (file: FileSystemNode) => {
    console.log('Opening file:', file);
    // Here you would load the file content
    setSelectedFile(file);
    setFileContent('// File content would be loaded here');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* File Explorer Sidebar */}
      <div className="w-64 border-r bg-muted/50">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Explorer</h2>
        </div>
        <FileTree
          rootPath={process.cwd()}
          onFileSelect={handleFileSelect}
          onFileOpen={handleFileOpen}
          className="h-full"
        />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="border-b p-2">
              <span className="text-sm">{selectedFile.path}</span>
            </div>
            <div className="flex-1 p-4">
              <pre className="font-mono text-sm">{fileContent}</pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a file to open</p>
          </div>
        )}
      </div>
    </div>
  );
}