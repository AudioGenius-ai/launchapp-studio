import { useWindowState } from '../hooks/useWindowState';
import { Monitor, Square, Maximize2, Minimize2, Pin } from 'lucide-react';
import { cn } from '@code-pilot/ui-kit';

interface WindowStatusBarProps {
  className?: string;
  showPosition?: boolean;
  showSize?: boolean;
  showState?: boolean;
}

export function WindowStatusBar({
  className,
  showPosition = true,
  showSize = true,
  showState = true,
}: WindowStatusBarProps) {
  const windowState = useWindowState();
  
  if (!windowState) return null;
  
  return (
    <div 
      className={cn(
        'flex items-center gap-4 border-t border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600',
        'dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400',
        className
      )}
    >
      {showState && (
        <div className="flex items-center gap-2">
          <Monitor className="h-3 w-3" />
          <span className="font-medium">Window</span>
          {windowState.isPinned && (
            <span className="flex items-center gap-1">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          {windowState.isMaximized && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3 w-3" />
              Maximized
            </span>
          )}
          {windowState.isMinimized && (
            <span className="flex items-center gap-1">
              <Minimize2 className="h-3 w-3" />
              Minimized
            </span>
          )}
          {windowState.isFullscreen && (
            <span className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              Fullscreen
            </span>
          )}
        </div>
      )}
      
      {showPosition && windowState.position && (
        <div className="flex items-center gap-1">
          <span>Position:</span>
          <span className="font-mono">
            {Math.round(windowState.position.x)}, {Math.round(windowState.position.y)}
          </span>
        </div>
      )}
      
      {showSize && windowState.size && (
        <div className="flex items-center gap-1">
          <span>Size:</span>
          <span className="font-mono">
            {Math.round(windowState.size.width)} × {Math.round(windowState.size.height)}
          </span>
        </div>
      )}
      
      <div className="ml-auto flex items-center gap-2">
        <span className={cn(
          'h-2 w-2 rounded-full',
          windowState.isFocused ? 'bg-green-500' : 'bg-gray-400'
        )} />
        <span>{windowState.isFocused ? 'Focused' : 'Unfocused'}</span>
      </div>
    </div>
  );
}