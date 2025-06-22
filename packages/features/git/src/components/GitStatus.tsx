import React from 'react';
import { SourceControlPanel } from './SourceControlPanel';
import { useGitStore } from '../stores/gitStore';

export interface GitStatusProps {
  className?: string;
}

export const GitStatus: React.FC<GitStatusProps> = ({ className }) => {
  const {
    status,
    loading,
    refreshStatus,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll,
    setShowCommitDialog,
    pull,
    push,
    fetch
  } = useGitStore();

  const handleOpenFile = (filePath: string) => {
    // TODO: Implement file opening logic
    console.log('Open file:', filePath);
  };

  const handleOpenDiff = (filePath: string, staged: boolean) => {
    // TODO: Implement diff viewer logic
    console.log('Open diff:', filePath, staged ? 'staged' : 'unstaged');
  };

  const handleSync = async () => {
    await fetch();
    if (status?.behind) {
      await pull();
    }
    if (status?.ahead) {
      await push();
    }
  };

  return (
    <div className={className}>
      <SourceControlPanel
        status={status}
        loading={loading}
        onRefresh={refreshStatus}
        onStageFile={stageFile}
        onUnstageFile={unstageFile}
        onStageAll={stageAll}
        onUnstageAll={unstageAll}
        onOpenCommit={() => setShowCommitDialog(true)}
        onOpenFile={handleOpenFile}
        onOpenDiff={handleOpenDiff}
        onPull={pull}
        onPush={push}
        onSync={handleSync}
      />
    </div>
  );
};