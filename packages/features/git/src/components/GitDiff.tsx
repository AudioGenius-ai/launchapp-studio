import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));
const Button = ({ children, onClick, className, size, variant, ...props }: any) => (
  <button 
    onClick={onClick} 
    className={cn(
      'inline-flex items-center justify-center rounded',
      size === 'sm' && 'h-8 px-3',
      size === 'icon' && 'h-8 w-8',
      variant === 'ghost' && 'hover:bg-gray-100 dark:hover:bg-gray-800',
      className
    )} 
    {...props}
  >
    {children}
  </button>
);

const ScrollArea = ({ children, className }: any) => (
  <div className={cn('overflow-auto', className)}>
    {children}
  </div>
);
import { FileCode, X, Copy, Download } from 'lucide-react';
import { gitService } from '../services/gitService';

export interface GitDiffProps {
  filePath: string;
  repoPath: string;
  staged?: boolean;
  className?: string;
  onClose?: () => void;
}

export const GitDiff: React.FC<GitDiffProps> = ({ 
  filePath,
  repoPath,
  staged = false,
  className,
  onClose
}) => {
  const [diff, setDiff] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiff();
  }, [filePath, repoPath, staged]);

  const loadDiff = async () => {
    setLoading(true);
    setError(null);
    try {
      const diff = await gitService.getDiffFile(repoPath, filePath, staged);
      // Convert GitDiff to string representation
      let diffContent = '';
      if (diff && diff.files) {
        diff.files.forEach((file: any) => {
          if (file.hunks) {
            file.hunks.forEach((hunk: any) => {
              diffContent += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\n`;
              hunk.lines.forEach((line: any) => {
                const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
                diffContent += prefix + line.content + '\n';
              });
            });
          }
        });
      }
      setDiff(diffContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diff');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(diff);
  };

  const downloadDiff = () => {
    const blob = new Blob([diff], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filePath.replace(/\//g, '_')}.diff`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderDiffLine = (line: string, index: number) => {
    let className = 'font-mono text-xs whitespace-pre px-2 py-0.5';
    
    if (line.startsWith('+') && !line.startsWith('+++')) {
      className += ' bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      className += ' bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    } else if (line.startsWith('@@')) {
      className += ' bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-semibold';
    } else if (line.startsWith('diff --git') || line.startsWith('index ')) {
      className += ' text-muted-foreground';
    }

    return (
      <div key={index} className={className}>
        {line || ' '}
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">{filePath}</h3>
              <p className="text-xs text-muted-foreground">
                {staged ? 'Staged changes' : 'Unstaged changes'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              disabled={!diff || loading}
              title="Copy diff"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={downloadDiff}
              disabled={!diff || loading}
              title="Download diff"
            >
              <Download className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Loading diff...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          ) : !diff ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">No changes to display</p>
            </div>
          ) : (
            <div className="p-2">
              {diff.split('\n').map(renderDiffLine)}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};