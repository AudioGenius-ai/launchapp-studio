import React, { useEffect, useRef } from 'react';
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Edit2,
  FolderPlus,
  FilePlus,
  RefreshCw,
  Info,
} from 'lucide-react';
import type { FileSystemNode } from '@code-pilot/types';
import { fileService } from '@code-pilot/core';
import { cn } from '@code-pilot/ui-kit';

interface FileContextMenuProps {
  x: number;
  y: number;
  node: FileSystemNode;
  onClose: () => void;
  onRefresh: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export function FileContextMenu({
  x,
  y,
  node,
  onClose,
  onRefresh,
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleNewFile = async () => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    try {
      const parentPath = node.type === 'directory' ? node.path : node.path.substring(0, node.path.lastIndexOf('/'));
      const filePath = `${parentPath}/${fileName}`;
      await fileService.createFile(filePath, '');
      onRefresh();
    } catch (err) {
      console.error('Failed to create file:', err);
    }
    onClose();
  };

  const handleNewFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      const parentPath = node.type === 'directory' ? node.path : node.path.substring(0, node.path.lastIndexOf('/'));
      const folderPath = `${parentPath}/${folderName}`;
      await fileService.createDirectory(folderPath);
      onRefresh();
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
    onClose();
  };

  const handleRename = async () => {
    const newName = prompt('Enter new name:', node.name);
    if (!newName || newName === node.name) return;

    try {
      const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
      const newPath = `${parentPath}/${newName}`;
      await fileService.renameFile(node.path, newPath);
      onRefresh();
    } catch (err) {
      console.error('Failed to rename:', err);
    }
    onClose();
  };

  const handleDelete = async () => {
    const confirmDelete = confirm(`Are you sure you want to delete "${node.name}"?`);
    if (!confirmDelete) return;

    try {
      await fileService.deleteFile(node.path);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    onClose();
  };

  const handleCopy = async () => {
    // Store path in clipboard (would need clipboard API in real implementation)
    localStorage.setItem('file-clipboard', JSON.stringify({ type: 'copy', path: node.path }));
    onClose();
  };

  const handleCut = async () => {
    // Store path in clipboard
    localStorage.setItem('file-clipboard', JSON.stringify({ type: 'cut', path: node.path }));
    onClose();
  };

  const handlePaste = async () => {
    const clipboardData = localStorage.getItem('file-clipboard');
    if (!clipboardData) return;

    try {
      const { type, path: sourcePath } = JSON.parse(clipboardData);
      const targetPath = node.type === 'directory' ? node.path : node.path.substring(0, node.path.lastIndexOf('/'));
      const fileName = sourcePath.split('/').pop();
      const destinationPath = `${targetPath}/${fileName}`;

      if (type === 'copy') {
        await fileService.copyFile(sourcePath, destinationPath);
      } else if (type === 'cut') {
        await fileService.moveFile(sourcePath, destinationPath);
        localStorage.removeItem('file-clipboard');
      }
      
      onRefresh();
    } catch (err) {
      console.error('Failed to paste:', err);
    }
    onClose();
  };

  const menuItems: MenuItem[] = [
    { label: 'New File', icon: FilePlus, action: handleNewFile },
    { label: 'New Folder', icon: FolderPlus, action: handleNewFolder },
    { label: 'separator', icon: Info, action: () => {}, divider: true },
    { label: 'Cut', icon: Scissors, action: handleCut },
    { label: 'Copy', icon: Copy, action: handleCopy },
    { label: 'Paste', icon: Clipboard, action: handlePaste },
    { label: 'separator', icon: Info, action: () => {}, divider: true },
    { label: 'Rename', icon: Edit2, action: handleRename },
    { label: 'Delete', icon: Trash2, action: handleDelete },
    { label: 'separator', icon: Info, action: () => {}, divider: true },
    { label: 'Refresh', icon: RefreshCw, action: () => { onRefresh(); onClose(); } },
  ];

  // Filter out items based on node type
  const filteredItems = menuItems.filter(item => {
    if (node.type === 'file' && (item.label === 'New File' || item.label === 'New Folder')) {
      return false;
    }
    return true;
  });

  // Adjust menu position to ensure it's visible
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover border rounded-md shadow-lg py-1 z-50 min-w-[180px]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {filteredItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="border-t my-1" />;
        }

        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={item.action}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}