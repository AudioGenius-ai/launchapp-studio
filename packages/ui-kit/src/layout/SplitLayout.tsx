import React, { useState, useCallback } from 'react';
import { cn } from '../utils/cn';

interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
  direction?: 'horizontal' | 'vertical';
  initialSplit?: number; // 0-100 percentage
  minSize?: number; // minimum size in pixels
  resizable?: boolean;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
  direction = 'horizontal',
  initialSplit = 50,
  minSize = 100,
  resizable = true,
}) => {
  const [split, setSplit] = useState(initialSplit);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const container = (e.target as Element).closest('.split-container') as HTMLElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      
      let newSplit: number;
      if (direction === 'horizontal') {
        newSplit = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      } else {
        newSplit = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      }

      // Apply constraints
      const minPercent = (minSize / (direction === 'horizontal' ? rect.width : rect.height)) * 100;
      const maxPercent = 100 - minPercent;
      
      newSplit = Math.max(minPercent, Math.min(maxPercent, newSplit));
      setSplit(newSplit);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, minSize, resizable]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      className={cn(
        'split-container flex h-full w-full',
        isHorizontal ? 'flex-row' : 'flex-col',
        className
      )}
    >
      <div
        className={cn('overflow-hidden', leftClassName)}
        style={{
          [isHorizontal ? 'width' : 'height']: `${split}%`,
        }}
      >
        {left}
      </div>
      
      {resizable && (
        <div
          className={cn(
            'split-divider flex-shrink-0 bg-border hover:bg-accent cursor-pointer transition-colors',
            isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
            isResizing && 'bg-accent'
          )}
          onMouseDown={handleMouseDown}
        />
      )}
      
      <div
        className={cn('flex-1 overflow-hidden', rightClassName)}
        style={{
          [isHorizontal ? 'width' : 'height']: `${100 - split}%`,
        }}
      >
        {right}
      </div>
    </div>
  );
};