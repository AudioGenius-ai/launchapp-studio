import React from 'react';
import { GitFileChange } from '../types';
import { FileChangeItem } from './FileChangeItem';
const Checkbox = ({ checked, onCheckedChange, onClick, ...props }: any) => (
  <input 
    type="checkbox" 
    checked={checked} 
    onChange={(e) => onCheckedChange?.(e.target.checked)} 
    onClick={onClick}
    {...props} 
  />
);
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface FileChangesListProps {
  title: string;
  files: GitFileChange[];
  allFilesSelected: boolean;
  onSelectAll: (selected: boolean) => void;
  onFileSelect: (filePath: string, selected: boolean) => void;
  onFileAction: (file: GitFileChange) => void;
  onOpenFile: (filePath: string) => void;
  onOpenDiff: (file: GitFileChange) => void;
  actionIcon: 'plus' | 'minus';
  actionTooltip: string;
  selectedFiles: Set<string>;
  defaultExpanded?: boolean;
}

export const FileChangesList: React.FC<FileChangesListProps> = ({
  title,
  files,
  allFilesSelected,
  onSelectAll,
  onFileSelect,
  onFileAction,
  onOpenFile,
  onOpenDiff,
  actionIcon,
  actionTooltip,
  selectedFiles,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="border-b">
      <div 
        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="p-0">
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        <Checkbox
          checked={allFilesSelected}
          onCheckedChange={(checked: boolean) => onSelectAll(checked)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
        <span className="text-xs font-medium flex-1">
          {title} ({files.length})
        </span>
      </div>
      
      {expanded && (
        <div className="pb-2">
          {files.map((file) => (
            <FileChangeItem
              key={file.path}
              file={file}
              selected={selectedFiles.has(file.path)}
              onSelect={(selected) => onFileSelect(file.path, selected)}
              onAction={() => onFileAction(file)}
              onOpenFile={() => onOpenFile(file.path)}
              onOpenDiff={() => onOpenDiff(file)}
              actionIcon={actionIcon}
              actionTooltip={actionTooltip}
            />
          ))}
        </div>
      )}
    </div>
  );
};