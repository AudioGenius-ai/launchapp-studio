import React from 'react';
import { cn } from '@code-pilot/utils';

export interface StreamingIndicatorProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  text = 'AI is thinking',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  return (
    <div className={cn(
      'flex items-center gap-2 text-muted-foreground',
      sizeClasses[size],
      className
    )}>
      <span>{text}</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              'rounded-full bg-current animate-pulse',
              dotSizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.4s',
            }}
          />
        ))}
      </div>
    </div>
  );
};