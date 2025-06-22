import React from 'react';
import { X, Pin, PinOff } from 'lucide-react';
import { EditorTab } from '@code-pilot/types';
import { cn } from '@code-pilot/ui';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabPin?: (tabId: string) => void;
  onTabUnpin?: (tabId: string) => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabPin,
  onTabUnpin,
  onTabReorder,
  className
}) => {
  const [draggedTab, setDraggedTab] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number, tab: EditorTab) => {
    setDraggedTab(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set drag data for cross-group dragging
    e.dataTransfer.setData('application/tab-drag', JSON.stringify({
      tabId: tab.id,
      sourceIndex: index
    }));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedTab !== null && draggedTab !== dropIndex) {
      onTabReorder?.(draggedTab, dropIndex);
    }
    setDraggedTab(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverIndex(null);
  };

  const handleTabClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      // Middle click to close
      e.preventDefault();
      onTabClose(tabId);
    } else if (e.button === 0) {
      // Left click to activate
      onTabClick(tabId);
    }
  };

  const handleCloseClick = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const handlePinClick = (e: React.MouseEvent, tab: EditorTab) => {
    e.stopPropagation();
    if (tab.isPinned) {
      onTabUnpin?.(tab.id);
    } else {
      onTabPin?.(tab.id);
    }
  };

  return (
    <div className={cn(
      'flex items-center bg-gray-900 border-b border-gray-800 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700',
      className
    )}>
      <div className="flex">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={cn(
              'group relative flex items-center px-3 py-2 text-sm cursor-pointer select-none transition-colors',
              'border-r border-gray-800 hover:bg-gray-800',
              activeTabId === tab.id && 'bg-gray-800 text-white',
              activeTabId !== tab.id && 'text-gray-400',
              dragOverIndex === index && 'border-l-2 border-blue-500'
            )}
            draggable={!tab.isPinned}
            onDragStart={(e) => handleDragStart(e, index, tab)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onMouseDown={(e) => handleTabClick(e, tab.id)}
            onAuxClick={(e) => handleTabClick(e, tab.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              // Parent component can handle context menu
            }}
          >
            {tab.isPinned && (
              <Pin className="w-3 h-3 mr-1 text-gray-500" />
            )}
            
            <span className={cn(
              'mr-2',
              tab.isDirty && 'italic'
            )}>
              {tab.title}
              {tab.isDirty && <span className="ml-1">•</span>}
            </span>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onTabPin && onTabUnpin && (
                <button
                  className="p-0.5 hover:bg-gray-700 rounded"
                  onClick={(e) => handlePinClick(e, tab)}
                  title={tab.isPinned ? 'Unpin' : 'Pin'}
                >
                  {tab.isPinned ? (
                    <PinOff className="w-3 h-3" />
                  ) : (
                    <Pin className="w-3 h-3" />
                  )}
                </button>
              )}
              
              <button
                className="p-0.5 hover:bg-gray-700 rounded"
                onClick={(e) => handleCloseClick(e, tab.id)}
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorTabs;