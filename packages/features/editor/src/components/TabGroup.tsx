import React, { useRef, useState, useCallback } from 'react';
import { TabGroup as TabGroupType, EditorTab } from '../types';
import { cn } from '@code-pilot/ui-kit';
import { EditorTabs } from './EditorTabs';

interface TabGroupProps {
  group: TabGroupType;
  tabs: EditorTab[];
  isActive: boolean;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabPin?: (tabId: string) => void;
  onTabUnpin?: (tabId: string) => void;
  onTabDrop: (tabId: string, groupId: string, index: number) => void;
  onGroupClick: () => void;
  onSplit?: (direction: 'horizontal' | 'vertical') => void;
  className?: string;
  children: React.ReactNode;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  group,
  tabs,
  isActive,
  onTabClick,
  onTabClose,
  onTabPin,
  onTabUnpin,
  onTabDrop,
  onGroupClick,
  className,
  children
}) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (groupRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const relX = x / rect.width;
      const relY = y / rect.height;
      
      // Determine drop zone based on position
      let position: 'left' | 'right' | 'top' | 'bottom' | 'center';
      
      if (relX < 0.2) {
        position = 'left';
      } else if (relX > 0.8) {
        position = 'right';
      } else if (relY < 0.2) {
        position = 'top';
      } else if (relY > 0.8) {
        position = 'bottom';
      } else {
        position = 'center';
      }
      
      setActiveDropZone(position);
    }
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropZone(null);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const data = e.dataTransfer.getData('application/tab-drag');
    if (data) {
      const { tabId } = JSON.parse(data);
      
      // Determine drop index based on drop zone
      let dropIndex = tabs.length;
      if (activeDropZone === 'center') {
        // Drop in the middle of tabs
        dropIndex = Math.floor(tabs.length / 2);
      } else if (activeDropZone === 'left' || activeDropZone === 'top') {
        dropIndex = 0;
      }
      
      onTabDrop(tabId, group.id, dropIndex);
    }
    
    setActiveDropZone(null);
  }, [tabs.length, activeDropZone, onTabDrop, group.id]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  return (
    <div
      ref={groupRef}
      className={cn(
        'flex flex-col h-full relative',
        isActive && 'ring-2 ring-blue-500 ring-offset-2',
        className
      )}
      onClick={onGroupClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop zone indicators */}
      {activeDropZone && (
        <div
          className={cn(
            'absolute z-50 bg-blue-500 opacity-30 pointer-events-none',
            activeDropZone === 'left' && 'top-0 left-0 w-1/4 h-full',
            activeDropZone === 'right' && 'top-0 right-0 w-1/4 h-full',
            activeDropZone === 'top' && 'top-0 left-0 w-full h-1/4',
            activeDropZone === 'bottom' && 'bottom-0 left-0 w-full h-1/4',
            activeDropZone === 'center' && 'top-1/4 left-1/4 w-1/2 h-1/2'
          )}
        />
      )}
      
      {/* Tab bar */}
      <div className="flex-shrink-0">
        <EditorTabs
          tabs={tabs}
          activeTabId={group.activeTabId}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onTabPin={onTabPin}
          onTabUnpin={onTabUnpin}
          onTabReorder={(fromIndex, toIndex) => {
            // Handle tab reordering within the group
            const tab = tabs[fromIndex];
            if (tab) {
              onTabDrop(tab.id, group.id, toIndex);
            }
          }}
        />
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default TabGroup;