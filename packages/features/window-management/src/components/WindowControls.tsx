import React from 'react';
import { Minus, Square, X, Pin, PinOff, Maximize2, Minimize2 } from 'lucide-react';
import { useWindow } from '../hooks/useWindow';
import { cn } from '@code-pilot/ui';

interface WindowControlsProps {
  className?: string;
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  showPin?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onPin?: () => void;
}

export function WindowControls({
  className,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  showPin = false,
  onMinimize,
  onMaximize,
  onClose,
  onPin,
}: WindowControlsProps) {
  const { 
    windowState, 
    minimize, 
    toggleMaximize, 
    close,
    toggleAlwaysOnTop,
  } = useWindow();
  
  const handleMinimize = async () => {
    await minimize();
    onMinimize?.();
  };
  
  const handleMaximize = async () => {
    await toggleMaximize();
    onMaximize?.();
  };
  
  const handleClose = async () => {
    await close();
    onClose?.();
  };
  
  const handlePin = async () => {
    await toggleAlwaysOnTop();
    onPin?.();
  };
  
  return (
    <div 
      className={cn(
        'flex items-center gap-1',
        className
      )}
      data-tauri-drag-region
    >
      {showPin && (
        <button
          onClick={handlePin}
          className="group relative flex h-7 w-7 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title={windowState?.isPinned ? 'Unpin Window' : 'Pin Window'}
        >
          {windowState?.isPinned ? (
            <PinOff className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Pin className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      )}
      
      {showMinimize && (
        <button
          onClick={handleMinimize}
          className="group relative flex h-7 w-7 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Minimize"
        >
          <Minus className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
        </button>
      )}
      
      {showMaximize && (
        <button
          onClick={handleMaximize}
          className="group relative flex h-7 w-7 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title={windowState?.isMaximized ? 'Restore' : 'Maximize'}
        >
          {windowState?.isMaximized ? (
            <Minimize2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      )}
      
      {showClose && (
        <button
          onClick={handleClose}
          className="group relative flex h-7 w-7 items-center justify-center rounded hover:bg-red-500"
          title="Close"
        >
          <X className="h-3.5 w-3.5 text-gray-600 group-hover:text-white dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}