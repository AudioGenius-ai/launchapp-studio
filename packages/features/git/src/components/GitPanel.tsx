import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@code-pilot/ui';
import { GitStatus } from './GitStatus';
import { GitCommit } from './GitCommit';
import { GitBranch } from './GitBranch';
import { GitHistory } from './GitHistory';
import { useGitStore } from '../stores/gitStore';
import { GitBranch as GitBranchIcon } from 'lucide-react';

export interface GitPanelProps {
  repoPath?: string;
  className?: string;
}

export const GitPanel: React.FC<GitPanelProps> = ({ repoPath, className }) => {
  const { setCurrentRepo, refreshStatus, refreshBranches } = useGitStore();

  useEffect(() => {
    if (repoPath) {
      setCurrentRepo(repoPath);
      refreshStatus();
      refreshBranches();
    }
  }, [repoPath]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <GitBranchIcon className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Source Control</h2>
      </div>
      
      <Tabs defaultValue="changes" className="h-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="changes">Changes</TabsTrigger>
          <TabsTrigger value="commit">Commit</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="changes" className="h-full">
          <GitStatus className="h-full" />
        </TabsContent>
        
        <TabsContent value="commit">
          <GitCommit className="p-4" />
        </TabsContent>
        
        <TabsContent value="branches">
          <GitBranch className="p-4" />
        </TabsContent>
        
        <TabsContent value="history">
          <GitHistory className="p-4" />
        </TabsContent>
      </Tabs>
    </div>
  );
};