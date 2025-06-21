import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SplitPane as SplitPaneType } from '@code-pilot/types';
import { cn } from '../../utils/cn';

interface SplitPaneProps {
  pane: SplitPaneType;
  onSizeChange: (sizes: number[]) => void;
  className?: string;
  children: React.ReactNode[];
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  pane,
  onSizeChange,
  className,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState(pane.sizes);
  const [isDragging, setIsDragging] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const startPos = useRef<number>(0);
  const startSizes = useRef<number[]>([]);
  
  const handleMouseDown = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragIndex.current = index;
    startPos.current = pane.direction === 'horizontal' ? e.clientY : e.clientX;
    startSizes.current = [...sizes];
    
    document.body.style.cursor = pane.direction === 'horizontal' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [pane.direction, sizes]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || dragIndex.current === null || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const currentPos = pane.direction === 'horizontal' ? e.clientY : e.clientX;
    const totalSize = pane.direction === 'horizontal' ? rect.height : rect.width;
    const delta = ((currentPos - startPos.current) / totalSize) * 100;
    
    const newSizes = [...startSizes.current];
    const index = dragIndex.current;
    
    // Adjust sizes maintaining minimum size of 10%
    const minSize = 10;
    const adjustment = Math.max(
      -newSizes[index] + minSize,
      Math.min(delta, newSizes[index + 1] - minSize)
    );
    
    newSizes[index] += adjustment;
    newSizes[index + 1] -= adjustment;
    
    setSizes(newSizes);
    onSizeChange(newSizes);
  }, [isDragging, pane.direction, onSizeChange]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragIndex.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const isHorizontal = pane.direction === 'horizontal';
  
  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full w-full',
        isHorizontal ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {children.map((child, index) => (
        <React.Fragment key={index}>
          <div
            className={cn(
              'overflow-hidden',
              isHorizontal ? 'w-full' : 'h-full'
            )}
            style={{
              [isHorizontal ? 'height' : 'width']: `${sizes[index]}%`
            }}
          >
            {child}
          </div>
          
          {index < children.length - 1 && (
            <div
              className={cn(
                'bg-gray-800 hover:bg-gray-700 transition-colors',
                isHorizontal 
                  ? 'h-1 w-full cursor-row-resize' 
                  : 'w-1 h-full cursor-col-resize',
                isDragging && dragIndex.current === index && 'bg-blue-500'
              )}
              onMouseDown={(e) => handleMouseDown(index, e)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SplitPane;