import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { FileSystemNode } from '@code-pilot/types';
import { fileService } from '@code-pilot/core';
import { cn } from '../../utils/cn';
import { FileIcon } from './FileIcon';

interface FileTreeItemProps {
  node: FileSystemNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: (node: FileSystemNode) => void;
  onDoubleClick: (node: FileSystemNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileSystemNode) => void;
  onLoadChildren?: (path: string) => void;
}

export function FileTreeItem({
  node,
  level,
  isExpanded,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
  onLoadChildren,
}: FileTreeItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(node);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(node);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContextMenu(e, node);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'directory') {
      onClick(node);
      if (!isExpanded && !node.children && onLoadChildren) {
        onLoadChildren(node.path);
      }
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 hover:bg-accent rounded cursor-pointer select-none',
          isSelected && 'bg-accent',
          node.isVirtual && 'italic opacity-80'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {node.type === 'directory' && (
          <button
            className="p-0.5 hover:bg-accent-foreground/10 rounded"
            onClick={handleChevronClick}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        
        <FileIcon
          node={node}
          isExpanded={isExpanded}
          className="h-4 w-4 flex-shrink-0"
        />
        
        <span className="text-sm truncate flex-1">
          {node.name}
          {node.isVirtual && ' *'}
        </span>
      </div>

      {isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={fileService.isExpanded(child.path)}
              isSelected={fileService.getSelectedPath() === child.path}
              onClick={onClick}
              onDoubleClick={onDoubleClick}
              onContextMenu={onContextMenu}
              onLoadChildren={onLoadChildren}
            />
          ))}
        </div>
      )}
    </>
  );
}