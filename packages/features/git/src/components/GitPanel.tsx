import React, { useEffect } from 'react';
// Mock Tabs components
const Tabs = ({ defaultValue, className, children }: any) => {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <div className={className} data-value={value}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { value, setValue })
      )}
    </div>
  );
};

const TabsList = ({ className, children }: any) => (
  <div className={className}>
    {children}
  </div>
);

const TabsTrigger = ({ value, children, setValue }: any) => (
  <button
    onClick={() => setValue?.(value)}
    className="px-4 py-2 text-sm font-medium"
  >
    {children}
  </button>
);

const TabsContent = ({ value: contentValue, className, children }: any) => {
  const parent = React.useContext(React.createContext<any>({}));
  const isActive = parent?.value === contentValue;
  return isActive ? <div className={className}>{children}</div> : null;
};
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