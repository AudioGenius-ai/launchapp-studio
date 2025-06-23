import React from 'react';
import { RecentlyClosedTab } from '../types';
import { Clock, FileText, RotateCcw } from 'lucide-react';
import { cn } from '@code-pilot/ui-kit';

interface RecentlyClosedTabsProps {
  tabs: RecentlyClosedTab[];
  onReopen: (index: number) => void;
  maxItems?: number;
  className?: string;
}

export const RecentlyClosedTabs: React.FC<RecentlyClosedTabsProps> = ({
  tabs,
  onReopen,
  maxItems = 10,
  className
}) => {
  const displayTabs = tabs.slice(0, maxItems);
  
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return `${Math.floor(diff / 86400000)}d ago`;
    }
  };
  
  if (displayTabs.length === 0) {
    return (
      <div className={cn('p-4 text-center text-gray-500', className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recently closed tabs</p>
      </div>
    );
  }
  
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Recently Closed
        </h3>
      </div>
      <div className="overflow-y-auto max-h-64">
        {displayTabs.map((tab, index) => (
          <div
            key={`${tab.tab.id}-${tab.closedAt}`}
            className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between group"
            onClick={() => onReopen(index)}
          >
            <div className="flex items-center min-w-0">
              <FileText className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-gray-500" />
              <span className="text-sm truncate" title={tab.tab.path}>
                {tab.tab.title}
              </span>
            </div>
            <div className="flex items-center ml-2 text-xs text-gray-500">
              <span className="mr-1">{formatTime(tab.closedAt)}</span>
              <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyClosedTabs;