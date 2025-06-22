import React from 'react';
import { GitFileChange } from '@code-pilot/types';
import { Checkbox, Button, cn } from '@code-pilot/ui';
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
  const statusColors = {
    added: 'text-green-600 dark:text-green-400',
    modified: 'text-yellow-600 dark:text-yellow-400',
    deleted: 'text-red-600 dark:text-red-400',
    renamed: 'text-blue-600 dark:text-blue-400',
    copied: 'text-purple-600 dark:text-purple-400',
    unmerged: 'text-orange-600 dark:text-orange-400',
  };

  const statusLabels = {
    added: 'A',
    modified: 'M',
    deleted: 'D',
    renamed: 'R',
    copied: 'C',
    unmerged: 'U',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 hover:bg-muted/50 group">
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelect(checked as boolean)}
      />
      
      <span className={cn("text-xs font-bold w-4", statusColors[file.status])}>
        {statusLabels[file.status]}
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
        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenDiff}
          title="View diff"
          className="h-6 w-6 p-0"
        >
          <FileDiff className="h-3 w-3" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onAction}
          title={actionTooltip}
          className="h-6 w-6 p-0"
        >
          {actionIcon === 'plus' ? (
            <Plus className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
};