import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { useLayoutStore } from './useLayoutStore';
import { PanelManager } from './PanelManager';
import { CompactThemeSwitcher } from '@code-pilot/ui';
import { ChevronLeft, ChevronRight, Terminal, FileText, Search, GitBranch, Layout, Bot, PanelLeft, PanelBottom, PanelRight } from 'lucide-react';
import './IDELayout.css';

interface IDELayoutProps {
  children?: React.ReactNode;
}

export const IDELayout: React.FC<IDELayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    leftPanel,
    rightPanel,
    bottomPanel,
    setLeftPanelSize,
    setRightPanelSize,
    setBottomPanelSize,
    setLeftPanelActiveTab,
    setRightPanelActiveTab,
    setBottomPanelActiveTab,
    toggleLeftPanel,
    toggleRightPanel,
    toggleBottomPanel,
    setRightPanelVisible,
    setBottomPanelVisible,
  } = useLayoutStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B - Toggle left panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleLeftPanel();
      }
      // Cmd/Ctrl + J - Toggle bottom panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        toggleBottomPanel();
      }
      // Cmd/Ctrl + Shift + E - Show explorer
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setLeftPanelActiveTab('explorer');
      }
      // Cmd/Ctrl + Shift + F - Show search
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setLeftPanelActiveTab('search');
      }
      // Cmd/Ctrl + Shift + G - Show git
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setLeftPanelActiveTab('git');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderPanelTabs = (
    tabs: Array<{ id: string; label: string; icon: React.ReactNode }>,
    activeTab: string,
    onTabClick: (tab: string) => void
  ) => {
    return (
      <div className="ide-layout__panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`ide-layout__panel-tab ${activeTab === tab.id ? 'ide-layout__panel-tab--active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const leftPanelTabs = [
    { id: 'explorer', label: 'Explorer', icon: <FileText size={16} /> },
    { id: 'search', label: 'Search', icon: <Search size={16} /> },
    { id: 'git', label: 'Git', icon: <GitBranch size={16} /> },
  ];

  const rightPanelTabs = [
    { id: 'ai', label: 'AI Assistant', icon: <Bot size={16} /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={16} /> },
  ];

  const bottomPanelTabs = [
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={16} /> },
    { id: 'output', label: 'Output', icon: <FileText size={16} /> },
    { id: 'problems', label: 'Problems', icon: <Layout size={16} /> },
  ];

  return (
    <div 
      ref={containerRef}
      className="ide-layout"
    >
      {/* Header/Navigation Bar */}
      <nav className="ide-layout__nav">
        <div className="ide-layout__nav-content">
            <div className="ide-layout__nav-links">
              {/* Project name or title */}
              <span className="ide-layout__project-name">
                {window.__PROJECT_PATH__?.split('/').pop() || 'Code Pilot Studio'}
              </span>
            </div>
            <div className="ide-layout__nav-actions">
              {/* Panel Toggle Buttons */}
              <button
                onClick={toggleLeftPanel}
                className={`ide-layout__nav-action ${leftPanel.visible ? 'ide-layout__nav-action--active' : ''}`}
                title="Toggle Sidebar (Cmd/Ctrl + B)"
              >
                <PanelLeft size={16} />
              </button>
              <button
                onClick={toggleBottomPanel}
                className={`ide-layout__nav-action ${bottomPanel.visible ? 'ide-layout__nav-action--active' : ''}`}
                title="Toggle Panel (Cmd/Ctrl + J)"
              >
                <PanelBottom size={16} />
              </button>
              <button
                onClick={toggleRightPanel}
                className={`ide-layout__nav-action ${rightPanel.visible ? 'ide-layout__nav-action--active' : ''}`}
                title="Toggle Right Panel"
              >
                <PanelRight size={16} />
              </button>
              
              <div className="ide-layout__nav-separator" />
              
              {/* Quick Access Buttons */}
              <button
                onClick={() => {
                  if (!leftPanel.visible) toggleLeftPanel();
                  setLeftPanelActiveTab('explorer');
                }}
                className="ide-layout__nav-action"
                title="Show Explorer (Cmd/Ctrl + Shift + E)"
              >
                <FileText size={16} />
              </button>
              <button
                onClick={() => {
                  if (!leftPanel.visible) toggleLeftPanel();
                  setLeftPanelActiveTab('search');
                }}
                className="ide-layout__nav-action"
                title="Show Search (Cmd/Ctrl + Shift + F)"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => {
                  if (!leftPanel.visible) toggleLeftPanel();
                  setLeftPanelActiveTab('git');
                }}
                className="ide-layout__nav-action"
                title="Show Git (Cmd/Ctrl + Shift + G)"
              >
                <GitBranch size={16} />
              </button>
              <button
                onClick={() => {
                  if (!bottomPanel.visible) toggleBottomPanel();
                  setBottomPanelActiveTab('terminal');
                }}
                className="ide-layout__nav-action"
                title="Show Terminal (Cmd/Ctrl + `)"
              >
                <Terminal size={16} />
              </button>
              <button
                onClick={() => {
                  if (!rightPanel.visible) toggleRightPanel();
                  setRightPanelActiveTab('ai');
                }}
                className="ide-layout__nav-action"
                title="Show AI Assistant"
              >
                <Bot size={16} />
              </button>
              
              <div className="ide-layout__nav-separator" />
              
              <CompactThemeSwitcher />
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="ide-layout__content">
        <PanelGroup direction="horizontal" className="h-full w-full">
          {/* Left Panel */}
          {leftPanel.visible && !leftPanel.collapsed && (
            <>
              <Panel
                defaultSize={leftPanel.size}
                minSize={15}
                maxSize={40}
                onResize={(size) => setLeftPanelSize(size)}
                className="ide-layout__panel ide-layout__panel--left"
              >
                {/* Panel Header */}
                <div className="ide-layout__panel-header">
                  {renderPanelTabs(leftPanelTabs, leftPanel.activeTab, setLeftPanelActiveTab)}
                  <button
                    onClick={toggleLeftPanel}
                    className="ide-layout__panel-close"
                    title="Hide Panel (Cmd/Ctrl + B)"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
                {/* Panel Content */}
                <div className="ide-layout__panel-content">
                  <PanelManager panelType="left" />
                </div>
              </Panel>
              <PanelResizeHandle className="ide-layout__resize-handle ide-layout__resize-handle--horizontal" />
            </>
          )}

          {/* Center Panel with Editor and Bottom Panel */}
          <Panel className="flex flex-col">
            <PanelGroup direction="vertical" className="flex-1">
              {/* Editor Area */}
              <Panel className="flex-1">
                <div className="ide-layout__editor">
                  {children || <Outlet />}
                </div>
              </Panel>

              {/* Bottom Panel */}
              {bottomPanel.visible && !bottomPanel.collapsed && (
                <>
                  <PanelResizeHandle className="ide-layout__resize-handle ide-layout__resize-handle--vertical" />
                  <Panel
                    defaultSize={bottomPanel.size}
                    minSize={10}
                    maxSize={50}
                    onResize={(size) => setBottomPanelSize(size)}
                    className="ide-layout__panel ide-layout__panel--bottom"
                  >
                    {/* Panel Header */}
                    <div 
                      className="flex items-center justify-between px-2 py-2 border-b"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {renderPanelTabs(bottomPanelTabs, bottomPanel.activeTab, setBottomPanelActiveTab)}
                      <button
                        onClick={toggleBottomPanel}
                        className="ide-layout__panel-close"
                        title="Hide Panel (Cmd/Ctrl + J)"
                      >
                        <ChevronLeft size={16} className="rotate-90" />
                      </button>
                    </div>
                    {/* Panel Content */}
                    <div className="flex-1 overflow-hidden">
                      <PanelManager panelType="bottom" />
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {/* Right Panel */}
          {rightPanel.visible && !rightPanel.collapsed && (
            <>
              <PanelResizeHandle className="ide-layout__resize-handle ide-layout__resize-handle--horizontal" />
              <Panel
                defaultSize={rightPanel.size}
                minSize={20}
                maxSize={50}
                onResize={(size) => setRightPanelSize(size)}
                className="ide-layout__panel ide-layout__panel--right"
              >
                {/* Panel Header */}
                <div className="ide-layout__panel-header">
                  {renderPanelTabs(rightPanelTabs, rightPanel.activeTab, setRightPanelActiveTab)}
                  <button
                    onClick={toggleRightPanel}
                    className="ide-layout__panel-close"
                    title="Hide Panel"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                {/* Panel Content */}
                <div className="ide-layout__panel-content">
                  <PanelManager panelType="right" />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <div className="ide-layout__statusbar">
        <div className="ide-layout__statusbar-left">
          <span>Code Pilot Studio v2</span>
          <span>Ready</span>
        </div>
        <div className="ide-layout__statusbar-right">
          <span>UTF-8</span>
          <span>TypeScript</span>
        </div>
      </div>
    </div>
  );
};