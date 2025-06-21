import React, { useRef, useState, useCallback } from 'react';
import { TabGroup as TabGroupType, EditorTab, TabDropZone } from '@code-pilot/types';
import { cn } from '../../utils/cn';
import { EditorTabs } from '../Editor/EditorTabs';

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
  onSplit,
  className,
  children
}) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const [dropZones, setDropZones] = useState<TabDropZone[]>([]);
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
      
      // Determine index based on drop position
      let index = group.tabs.length;
      
      if (activeDropZone === 'center') {
        // Drop in the middle of tabs area
        const tabsElement = groupRef.current?.querySelector('.tabs-container');
        if (tabsElement) {
          const rect = tabsElement.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width;
          index = Math.floor(relX * group.tabs.length);
        }
      }
      
      // Handle split if dropping on edges
      if (activeDropZone && ['left', 'right', 'top', 'bottom'].includes(activeDropZone)) {
        const direction = ['left', 'right'].includes(activeDropZone) ? 'vertical' : 'horizontal';
        onSplit?.(direction);
      } else {
        onTabDrop(tabId, group.id, index);
      }
    }
    
    setActiveDropZone(null);
  }, [group, activeDropZone, onTabDrop, onSplit]);
  
  const handleTabReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const tabId = group.tabs[fromIndex];
    onTabDrop(tabId, group.id, toIndex);
  }, [group, onTabDrop]);
  
  return (
    <div
      ref={groupRef}
      className={cn(
        'flex flex-col h-full relative',
        isActive && 'ring-2 ring-blue-500',
        className
      )}
      onClick={onGroupClick}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop zone indicators */}
      {activeDropZone && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {activeDropZone === 'left' && (
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 opacity-50" />
          )}
          {activeDropZone === 'right' && (
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-blue-500 opacity-50" />
          )}
          {activeDropZone === 'top' && (
            <div className="absolute left-0 right-0 top-0 h-2 bg-blue-500 opacity-50" />
          )}
          {activeDropZone === 'bottom' && (
            <div className="absolute left-0 right-0 bottom-0 h-2 bg-blue-500 opacity-50" />
          )}
          {activeDropZone === 'center' && (
            <div className="absolute inset-4 border-2 border-dashed border-blue-500 opacity-50 rounded" />
          )}
        </div>
      )}
      
      {/* Tabs */}
      <div className="tabs-container">
        <EditorTabs
          tabs={tabs}
          activeTabId={group.activeTabId}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onTabPin={onTabPin}
          onTabUnpin={onTabUnpin}
          onTabReorder={handleTabReorder}
          className="border-b-2 border-gray-800"
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