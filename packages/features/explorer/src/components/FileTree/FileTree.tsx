import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Folder, File } from 'lucide-react';
import type { FileSystemNode } from '@code-pilot/types';
import { fileService } from '@code-pilot/core';
import { cn } from '@code-pilot/ui-kit';
import { FileTreeItem } from './FileTreeItem';
import { FileContextMenu } from './FileContextMenu';
import { FileSearchBar } from './FileSearchBar';

interface FileTreeProps {
  rootPath: string;
  onFileSelect?: (file: FileSystemNode) => void;
  onFileOpen?: (file: FileSystemNode) => void;
  className?: string;
  showSearch?: boolean;
  showActions?: boolean;
}

export function FileTree({
  rootPath,
  onFileSelect,
  onFileOpen,
  className,
  showSearch = true,
  showActions = true,
}: FileTreeProps) {
  const [nodes, setNodes] = useState<FileSystemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileSystemNode;
  } | null>(null);

  // Initialize file service and load root directory
  useEffect(() => {
    fileService.setRootPath(rootPath);
    loadDirectory(rootPath);

    // Watch for file changes
    const unsubscribe = fileService.onFileChange((event) => {
      // Reload affected directory
      const affectedPath = event.path.substring(0, event.path.lastIndexOf('/'));
      loadDirectory(affectedPath);
    });

    // Start watching the root directory
    fileService.watchDirectory(rootPath);

    return () => {
      unsubscribe();
      fileService.unwatchDirectory(rootPath);
    };
  }, [rootPath]);

  const loadDirectory = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const directoryNodes = await fileService.readDirectory(path);
      
      if (path === rootPath) {
        // Build tree structure for root
        const tree = fileService.buildTree(directoryNodes);
        setNodes(tree);
      } else {
        // Update specific directory in the tree
        setNodes(prevNodes => updateNodesInTree(prevNodes, path, directoryNodes));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  }, [rootPath]);

  // Update nodes in tree recursively
  const updateNodesInTree = (
    nodes: FileSystemNode[],
    parentPath: string,
    newChildren: FileSystemNode[]
  ): FileSystemNode[] => {
    return nodes.map(node => {
      if (node.path === parentPath) {
        return {
          ...node,
          children: fileService.buildTree(newChildren),
        };
      } else if (node.children) {
        return {
          ...node,
          children: updateNodesInTree(node.children, parentPath, newChildren),
        };
      }
      return node;
    });
  };

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodes;

    const filterNodes = (nodes: FileSystemNode[]): FileSystemNode[] => {
      return nodes.reduce<FileSystemNode[]>((acc, node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = node.children ? filterNodes(node.children) : undefined;

        if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
          acc.push({
            ...node,
            children: filteredChildren,
            expanded: true, // Auto-expand when searching
          });
        }

        return acc;
      }, []);
    };

    return filterNodes(nodes);
  }, [nodes, searchQuery]);

  const handleNodeClick = useCallback((node: FileSystemNode) => {
    if (node.type === 'directory') {
      fileService.toggleExpanded(node.path);
      
      // Load children if expanding and not loaded
      if (!fileService.isExpanded(node.path) && !node.children) {
        loadDirectory(node.path);
      }
      
      // Force re-render
      setNodes([...nodes]);
    } else {
      fileService.setSelectedPath(node.path);
      onFileSelect?.(node);
    }
  }, [nodes, onFileSelect, loadDirectory]);

  const handleNodeDoubleClick = useCallback((node: FileSystemNode) => {
    if (node.type === 'file') {
      onFileOpen?.(node);
    }
  }, [onFileOpen]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileSystemNode) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
    });
  }, []);

  const handleCreateFile = useCallback(async (parentPath: string) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    try {
      const filePath = `${parentPath}/${fileName}`;
      await fileService.createFile(filePath, '');
      loadDirectory(parentPath);
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  }, [loadDirectory]);

  const handleCreateFolder = useCallback(async (parentPath: string) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const folderPath = `${parentPath}/${folderName}`;
      await fileService.createDirectory(folderPath);
      loadDirectory(parentPath);
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  }, [loadDirectory]);

  if (loading && nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {showSearch && (
        <FileSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search files..."
          className="p-2 border-b"
        />
      )}

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {filteredNodes.map(node => (
            <FileTreeItem
              key={node.id}
              node={node}
              level={0}
              isExpanded={fileService.isExpanded(node.path)}
              isSelected={fileService.getSelectedPath() === node.path}
              onClick={handleNodeClick}
              onDoubleClick={handleNodeDoubleClick}
              onContextMenu={handleContextMenu}
              onLoadChildren={loadDirectory}
            />
          ))}
        </div>
      </div>

      {showActions && (
        <div className="border-t p-2 flex gap-2">
          <button
            onClick={() => handleCreateFile(rootPath)}
            className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-accent rounded"
            title="New File"
          >
            <File className="h-4 w-4" />
            <span>New File</span>
          </button>
          <button
            onClick={() => handleCreateFolder(rootPath)}
            className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-accent rounded"
            title="New Folder"
          >
            <Folder className="h-4 w-4" />
            <span>New Folder</span>
          </button>
        </div>
      )}

      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
          onRefresh={() => {
            const parentPath = contextMenu.node.path.substring(0, contextMenu.node.path.lastIndexOf('/'));
            loadDirectory(parentPath || rootPath);
          }}
        />
      )}
    </div>
  );
}