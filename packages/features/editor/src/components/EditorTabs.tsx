import React from 'react';
import { EditorTab } from "../types";
import { X, Pin, PinOff } from 'lucide-react';
import { cn } from '@code-pilot/ui-kit';

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
  const handleDragStart = (e: React.DragEvent, tab: EditorTab, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/tab-drag', JSON.stringify({ tabId: tab.id, index }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/tab-drag');
    if (data && onTabReorder) {
      const { index: dragIndex } = JSON.parse(data);
      if (dragIndex !== dropIndex) {
        onTabReorder(dragIndex, dropIndex);
      }
    }
  };

  return (
    <div className={cn('flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
      <div className="flex overflow-x-auto">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              'group flex items-center px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700',
              activeTabId === tab.id && 'bg-white dark:bg-gray-900'
            )}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.isPinned && (
              <Pin className="w-3 h-3 mr-1 text-gray-500" />
            )}
            <span className={cn('text-sm', tab.isDirty && 'italic')}>
              {tab.title}
              {tab.isDirty && <span className="ml-1 text-gray-500">•</span>}
            </span>
            <div className="ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              {tab.isPinned && onTabUnpin ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabUnpin(tab.id);
                  }}
                  className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  <PinOff className="w-3 h-3" />
                </button>
              ) : onTabPin ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabPin(tab.id);
                  }}
                  className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  <Pin className="w-3 h-3" />
                </button>
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded ml-1"
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