import React, { useEffect } from 'react';
import { BranchSelector } from './BranchSelector';
import { useGitStore } from '../stores/gitStore';
import { Button } from '@code-pilot/ui-kit';
import { GitBranch as GitBranchIcon, Plus } from 'lucide-react';

export interface GitBranchProps {
  className?: string;
}

export const GitBranch: React.FC<GitBranchProps> = ({ className }) => {
  const {
    branches,
    currentBranch,
    refreshBranches,
    switchBranch,
    createBranch,
    deleteBranch,
    setShowBranchDialog,
    loading
  } = useGitStore();

  useEffect(() => {
    refreshBranches();
  }, []);

  const handleCreateBranch = async (name: string) => {
    await createBranch(name);
    await switchBranch(name);
  };

  return (
    <div className={className}>
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranchIcon className="h-5 w-5" />
            <h3 className="font-semibold">Branches</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowBranchDialog(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <BranchSelector
          branches={branches}
          currentBranch={currentBranch}
          onSwitch={switchBranch}
          onCreate={handleCreateBranch}
          onDelete={deleteBranch}
          loading={loading}
        />

        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Current branch:</span>
            <span className="ml-2 font-medium">{currentBranch || 'None'}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {branches.length} branch{branches.length !== 1 ? 'es' : ''} total
          </div>
        </div>
      </div>
    </div>
  );
};