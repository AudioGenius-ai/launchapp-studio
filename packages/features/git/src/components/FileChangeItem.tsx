import React from 'react';
import { GitFileChange } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));
const Checkbox = ({ checked, onCheckedChange, ...props }: any) => <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} {...props} />;
import { Plus, Minus, FileDiff } from 'lucide-react';

export interface FileChangeItemProps {
  file: GitFileChange;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: () => void;
  onOpenFile: () => void;
  onOpenDiff: () => void;
  actionIcon: 'plus' | 'minus';
  actionTooltip: string;
}

export const FileChangeItem: React.FC<FileChangeItemProps> = ({
  file,
  selected,
  onSelect,
  onAction,
  onOpenFile,
  onOpenDiff,
  actionIcon,
  actionTooltip,
}) => {
  const statusColors: Record<string, string> = {
    NEW: 'text-green-600 dark:text-green-400',
    MODIFIED: 'text-yellow-600 dark:text-yellow-400',
    DELETED: 'text-red-600 dark:text-red-400',
    RENAMED: 'text-blue-600 dark:text-blue-400',
    COPIED: 'text-purple-600 dark:text-purple-400',
    UPDATED_BUT_UNMERGED: 'text-orange-600 dark:text-orange-400',
    CURRENT: 'text-gray-600 dark:text-gray-400',
    IGNORED: 'text-gray-500 dark:text-gray-500',
    UNTRACKED: 'text-gray-500 dark:text-gray-500',
  };

  const statusLabels: Record<string, string> = {
    NEW: 'A',
    MODIFIED: 'M',
    DELETED: 'D',
    RENAMED: 'R',
    COPIED: 'C',
    UPDATED_BUT_UNMERGED: 'U',
    CURRENT: '-',
    IGNORED: 'I',
    UNTRACKED: '?',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 hover:bg-muted/50 group">
      <Checkbox
        checked={selected}
        onCheckedChange={(checked: boolean) => onSelect(checked)}
      />
      
      <span className={cn("text-xs font-bold w-4", statusColors[file.status] || 'text-gray-500')}>
        {statusLabels[file.status] || '?'}
      </span>
      
      <div className="flex-1 min-w-0">
        <div 
          className="text-sm truncate cursor-pointer hover:underline"
          onClick={onOpenFile}
          title={file.path}
        >
          {file.path}
        </div>
        {file.oldPath && (
          <div className="text-xs text-muted-foreground truncate">
            ← {file.oldPath}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onOpenDiff}
          title="View diff"
          className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <FileDiff className="h-3 w-3" />
        </button>
        
        <button
          onClick={onAction}
          title={actionTooltip}
          className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          {actionIcon === 'plus' ? (
            <Plus className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
};