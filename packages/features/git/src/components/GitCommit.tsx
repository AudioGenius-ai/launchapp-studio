import React from 'react';
import { CommitDialog } from './CommitDialog';
import { useGitStore } from '../stores/gitStore';
import { Button } from '@code-pilot/ui';
import { GitCommit as GitCommitIcon } from 'lucide-react';

export interface GitCommitProps {
  className?: string;
}

export const GitCommit: React.FC<GitCommitProps> = ({ className }) => {
  const {
    status,
    showCommitDialog,
    setShowCommitDialog,
    commit,
    loading
  } = useGitStore();

  const handleCommit = async (message: string) => {
    await commit(message);
  };

  const hasStagedChanges = status && status.staged.length > 0;

  return (
    <div className={className}>
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCommitIcon className="h-5 w-5" />
            <h3 className="font-semibold">Commit Changes</h3>
          </div>
          {hasStagedChanges && (
            <span className="text-sm text-muted-foreground">
              {status.staged.length} file{status.staged.length !== 1 ? 's' : ''} staged
            </span>
          )}
        </div>

        {!hasStagedChanges ? (
          <p className="text-sm text-muted-foreground">
            No changes staged for commit. Stage changes first to create a commit.
          </p>
        ) : (
          <Button
            onClick={() => setShowCommitDialog(true)}
            disabled={loading}
            className="w-full"
          >
            <GitCommitIcon className="h-4 w-4 mr-2" />
            Create Commit
          </Button>
        )}
      </div>

      {showCommitDialog && (
        <CommitDialog
          open={showCommitDialog}
          onClose={() => setShowCommitDialog(false)}
          onCommit={handleCommit}
          stagedFiles={status?.staged || []}
          loading={loading}
        />
      )}
    </div>
  );
};