import React from 'react';
import { useLayoutStore } from './useLayoutStore';
import { FileExplorer, SearchPanel, OutputPanel, ProblemsPanel } from '@code-pilot/feature-explorer';
import { TerminalPage } from '@code-pilot/feature-terminal';
import { ClaudePanel } from '@code-pilot/feature-ai';
import { GitPanel } from '@code-pilot/feature-git';

interface PanelManagerProps {
  panelType: 'left' | 'right' | 'bottom';
  className?: string;
}

export const PanelManager: React.FC<PanelManagerProps> = ({ panelType, className }) => {
  const { leftPanel, rightPanel, bottomPanel } = useLayoutStore();

  const renderLeftPanelContent = () => {
    switch (leftPanel.activeTab) {
      case 'explorer':
        return <FileExplorer />;
      case 'search':
        return <SearchPanel />;
      case 'git':
        return <GitPanel />;
      case 'extensions':
        return <div className="p-4">Extensions Panel (Coming Soon)</div>;
      default:
        return null;
    }
  };

  const renderRightPanelContent = () => {
    switch (rightPanel.activeTab) {
      case 'ai':
        return <ClaudePanel compactMode />;
      case 'terminal':
        return <TerminalPage />;
      case 'output':
        return <OutputPanel />;
      default:
        return null;
    }
  };

  const renderBottomPanelContent = () => {
    switch (bottomPanel.activeTab) {
      case 'terminal':
        return <TerminalPage />;
      case 'output':
        return <OutputPanel />;
      case 'problems':
        return <ProblemsPanel />;
      case 'debug':
        return <div className="p-4">Debug Panel (Coming Soon)</div>;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (panelType) {
      case 'left':
        return renderLeftPanelContent();
      case 'right':
        return renderRightPanelContent();
      case 'bottom':
        return renderBottomPanelContent();
      default:
        return null;
    }
  };

  return (
    <div className={`h-full overflow-hidden ${className || ''}`}>
      {renderContent()}
    </div>
  );
};