import React from 'react';
import { RecentlyClosedTab } from '@code-pilot/types';
import { Clock, FileText, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

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
    <div className={cn('py-2', className)}>
      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
        Recently Closed
      </div>
      <div className="space-y-1">
        {displayTabs.map((item, index) => (
          <button
            key={`${item.tab.id}-${item.closedAt}`}
            className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors group"
            onClick={() => onReopen(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm truncate">{item.tab.title}</span>
                {item.tab.isDirty && (
                  <span className="text-yellow-500 text-xs">●</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatTime(item.closedAt)}</span>
                <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="text-xs text-gray-500 truncate mt-1 pl-6">
              {item.tab.path}
            </div>
          </button>
        ))}
      </div>
      {tabs.length > maxItems && (
        <div className="px-4 py-2 text-xs text-gray-500 text-center">
          And {tabs.length - maxItems} more...
        </div>
      )}
    </div>
  );
};

export default RecentlyClosedTabs;