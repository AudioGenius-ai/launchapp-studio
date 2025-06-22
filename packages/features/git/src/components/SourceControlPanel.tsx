import React, { useState, useCallback } from 'react';
import { GitStatus } from '@code-pilot/types';
import { FileChangesList } from './FileChangesList';
import { Button, cn } from '@code-pilot/ui';
import { 
  GitBranch, 
  GitCommit, 
  RefreshCw, 
  Plus,
  Download,
  Upload
} from 'lucide-react';

export interface SourceControlPanelProps {
  status: GitStatus | null;
  loading?: boolean;
  onRefresh: () => void;
  onStageFile: (filePath: string) => void;
  onUnstageFile: (filePath: string) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  onOpenCommit: () => void;
  onOpenFile: (filePath: string) => void;
  onOpenDiff: (filePath: string, staged: boolean) => void;
  onPull?: () => void;
  onPush?: () => void;
  onSync?: () => void;
}

export const SourceControlPanel: React.FC<SourceControlPanelProps> = ({
  status,
  loading = false,
  onRefresh,
  onStageFile,
  onUnstageFile,
  onStageAll,
  onUnstageAll,
  onOpenCommit,
  onOpenFile,
  onOpenDiff,
  onPull,
  onPush,
  onSync,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const handleFileSelect = useCallback((filePath: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(filePath);
      } else {
        next.delete(filePath);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((files: string[], selected: boolean) => {
    if (selected) {
      setSelectedFiles(new Set(files));
    } else {
      setSelectedFiles(new Set());
    }
  }, []);

  const hasStagedChanges = status && status.staged.length > 0;
  const hasUnstagedChanges = status && (status.unstaged.length > 0 || status.untracked.length > 0);
  const hasChanges = hasStagedChanges || hasUnstagedChanges;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="font-medium text-sm">
            {status?.branch || 'No repository'}
          </span>
          {status && (status.ahead > 0 || status.behind > 0) && (
            <span className="text-xs text-muted-foreground">
              {status.ahead > 0 && `↑${status.ahead}`}
              {status.ahead > 0 && status.behind > 0 && ' '}
              {status.behind > 0 && `↓${status.behind}`}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {onSync && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSync}
              disabled={loading}
              title="Sync Changes"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onPull && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onPull}
              disabled={loading}
              title="Pull"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onPush && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onPush}
              disabled={loading || !status?.ahead}
              title="Push"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenCommit}
            disabled={!hasStagedChanges}
            title="Commit"
          >
            <GitCommit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!status ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No repository detected</p>
              <p className="text-xs mt-1">Open a folder containing a Git repository</p>
            </div>
          </div>
        ) : !hasChanges ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No changes</p>
              <p className="text-xs mt-1">Your working tree is clean</p>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {/* Staged Changes */}
            {hasStagedChanges && (
              <FileChangesList
                title="Staged Changes"
                files={status.staged}
                allFilesSelected={status.staged.every(f => selectedFiles.has(f.path))}
                onSelectAll={(selected) => handleSelectAll(status.staged.map(f => f.path), selected)}
                onFileSelect={handleFileSelect}
                onFileAction={(file) => onUnstageFile(file.path)}
                onOpenFile={onOpenFile}
                onOpenDiff={(file) => onOpenDiff(file.path, true)}
                actionIcon="minus"
                actionTooltip="Unstage"
                selectedFiles={selectedFiles}
              />
            )}

            {/* Unstaged Changes */}
            {status.unstaged.length > 0 && (
              <FileChangesList
                title="Changes"
                files={status.unstaged}
                allFilesSelected={status.unstaged.every(f => selectedFiles.has(f.path))}
                onSelectAll={(selected) => handleSelectAll(status.unstaged.map(f => f.path), selected)}
                onFileSelect={handleFileSelect}
                onFileAction={(file) => onStageFile(file.path)}
                onOpenFile={onOpenFile}
                onOpenDiff={(file) => onOpenDiff(file.path, false)}
                actionIcon="plus"
                actionTooltip="Stage"
                selectedFiles={selectedFiles}
              />
            )}

            {/* Untracked Files */}
            {status.untracked.length > 0 && (
              <FileChangesList
                title="Untracked Files"
                files={status.untracked.map(path => ({ 
                  path, 
                  status: 'added' as const,
                  oldPath: undefined 
                }))}
                allFilesSelected={status.untracked.every(f => selectedFiles.has(f))}
                onSelectAll={(selected) => handleSelectAll(status.untracked, selected)}
                onFileSelect={handleFileSelect}
                onFileAction={(file) => onStageFile(file.path)}
                onOpenFile={onOpenFile}
                onOpenDiff={(file) => onOpenDiff(file.path, false)}
                actionIcon="plus"
                actionTooltip="Stage"
                selectedFiles={selectedFiles}
              />
            )}

            {/* Conflicted Files */}
            {status.conflicted.length > 0 && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-medium text-destructive mb-2">
                  Merge Conflicts ({status.conflicted.length})
                </h3>
                {status.conflicted.map(path => (
                  <div
                    key={path}
                    className="flex items-center gap-2 py-1 text-sm text-destructive"
                  >
                    <span className="truncate">{path}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {hasChanges && (
        <div className="border-t p-2 flex gap-2">
          {hasUnstagedChanges && (
            <Button
              size="sm"
              variant="outline"
              onClick={onStageAll}
              className="flex-1"
            >
              <Plus className="h-3 w-3 mr-1" />
              Stage All
            </Button>
          )}
          {hasStagedChanges && (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnstageAll}
              className="flex-1"
            >
              Unstage All
            </Button>
          )}
        </div>
      )}
    </div>
  );
};