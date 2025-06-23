import React, { useEffect, useState } from 'react';
import { useGitStore } from '../stores/gitStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));
const Button = ({ children, onClick, className, size, variant, disabled, ...props }: any) => (
  <button 
    onClick={onClick} 
    className={cn(
      'inline-flex items-center justify-center rounded',
      size === 'sm' && 'h-8 px-3 text-xs',
      variant === 'ghost' && 'hover:bg-gray-100 dark:hover:bg-gray-800',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )} 
    disabled={disabled}
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
import { 
  GitCommit as GitCommitIcon, 
  Calendar, 
  User, 
  Hash,
  RefreshCw 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface GitHistoryProps {
  className?: string;
  limit?: number;
}

export const GitHistory: React.FC<GitHistoryProps> = ({ 
  className,
  limit = 50 
}) => {
  const { commits, refreshCommits, loading } = useGitStore();
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  useEffect(() => {
    refreshCommits(limit);
  }, [limit]);

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return date;
    }
  };

  const formatHash = (hash: string) => {
    return hash.substring(0, 7);
  };

  return (
    <div className={className}>
      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <GitCommitIcon className="h-5 w-5" />
            <h3 className="font-semibold">Commit History</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refreshCommits(limit)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {commits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No commits found</p>
                <p className="text-xs mt-1">This repository has no commit history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {commits.map((commit) => (
                  <div
                    key={commit.hash}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCommit === commit.hash 
                        ? 'bg-accent border-accent-foreground' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedCommit(
                      selectedCommit === commit.hash ? null : commit.hash
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {commit.message}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{commit.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(commit.author.timestamp ? commit.author.timestamp.toString() : commit.author.date.toString())}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        <code>{formatHash(commit.hash)}</code>
                      </div>
                    </div>

                    {selectedCommit === commit.hash && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Full hash:</span>
                            <code className="ml-2">{commit.hash}</code>
                          </div>
                          {commit.parents && commit.parents.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">Parents:</span>
                              <code className="ml-2">
                                {commit.parents.map(h => formatHash(h)).join(', ')}
                              </code>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-2">{commit.author.email}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {commits.length >= limit && (
          <div className="p-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refreshCommits(limit + 50)}
              disabled={loading}
              className="w-full"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};