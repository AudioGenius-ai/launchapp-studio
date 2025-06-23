import React from 'react';
import { useMultiWindow } from '../hooks/useMultiWindow';
import { WindowListItem } from './WindowListItem';
import { Button } from '@code-pilot/ui-kit';
import { Plus, Grid, List } from 'lucide-react';
import type { WindowConfig } from '../types';

interface WindowManagerProps {
  onCreateWindow?: (config: WindowConfig) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function WindowManager({
  onCreateWindow,
  viewMode = 'list',
  className,
}: WindowManagerProps) {
  const { 
    windows, 
    activeWindow, 
    focusedWindow, 
    createWindow, 
    closeWindow, 
    focusWindow 
  } = useMultiWindow();
  
  const [mode, setMode] = React.useState(viewMode);
  
  const handleCreateWindow = async () => {
    const config: WindowConfig = {
      title: `Window ${windows.length + 1}`,
      width: 800,
      height: 600,
      center: true,
    };
    
    if (onCreateWindow) {
      onCreateWindow(config);
    } else {
      await createWindow(`window-${Date.now()}`, config);
    }
  };
  
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Windows</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMode('list')}
            className={mode === 'list' ? 'bg-gray-100 dark:bg-gray-800' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMode('grid')}
            className={mode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleCreateWindow}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Window
          </Button>
        </div>
      </div>
      
      {windows.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-gray-500">
          No windows open
        </div>
      ) : (
        <div 
          className={
            mode === 'grid' 
              ? 'grid grid-cols-2 gap-4 lg:grid-cols-3'
              : 'space-y-2'
          }
        >
          {windows.map((window) => (
            <WindowListItem
              key={window.id}
              window={window}
              isActive={activeWindow?.id === window.id}
              isFocused={focusedWindow?.id === window.id}
              viewMode={mode}
              onFocus={() => focusWindow(window.id)}
              onClose={() => closeWindow(window.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}