import React from 'react';
import { X, Maximize2, Minimize2, Square, Pin } from 'lucide-react';
import { cn } from '@code-pilot/ui';
import type { WindowInfo } from '../types';

interface WindowListItemProps {
  window: WindowInfo;
  isActive?: boolean;
  isFocused?: boolean;
  viewMode?: 'grid' | 'list';
  onFocus?: () => void;
  onClose?: () => void;
}

export function WindowListItem({
  window,
  isActive,
  isFocused,
  viewMode = 'list',
  onFocus,
  onClose,
}: WindowListItemProps) {
  const isGrid = viewMode === 'grid';
  
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border transition-all',
        'hover:shadow-lg',
        isActive && 'ring-2 ring-blue-500',
        isFocused ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-800',
        isGrid ? 'aspect-video p-4' : 'flex items-center justify-between p-3',
      )}
      onClick={onFocus}
    >
      {isGrid ? (
        <div className="flex h-full flex-col">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h4 className="font-medium">{window.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {window.label}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </button>
          </div>
          
          <div className="mt-auto flex flex-wrap gap-1">
            {window.state.isPinned && (
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            )}
            {window.state.isMaximized && (
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                <Maximize2 className="h-3 w-3" />
                Maximized
              </span>
            )}
            {window.state.isMinimized && (
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                <Minimize2 className="h-3 w-3" />
                Minimized
              </span>
            )}
            {window.state.isFullscreen && (
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                <Square className="h-3 w-3" />
                Fullscreen
              </span>
            )}
          </div>
          
          {window.state.size && (
            <p className="mt-2 text-xs text-gray-500">
              {Math.round(window.state.size.width)} × {Math.round(window.state.size.height)}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div>
              <h4 className="font-medium">{window.title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{window.label}</span>
                {window.state.size && (
                  <>
                    <span>•</span>
                    <span>
                      {Math.round(window.state.size.width)} × {Math.round(window.state.size.height)}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {window.state.isPinned && <Pin className="h-3.5 w-3.5 text-gray-400" />}
              {window.state.isMaximized && <Maximize2 className="h-3.5 w-3.5 text-gray-400" />}
              {window.state.isMinimized && <Minimize2 className="h-3.5 w-3.5 text-gray-400" />}
              {window.state.isFullscreen && <Square className="h-3.5 w-3.5 text-gray-400" />}
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </>
      )}
    </div>
  );
}