import React from 'react';
import type { AISessionStatus } from '@code-pilot/types';
import { cn } from '@code-pilot/utils';

export interface SessionStatusProps {
  status: AISessionStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case AISessionStatus.Active:
        return 'bg-success';
      case AISessionStatus.Idle:
        return 'bg-muted-foreground';
      case AISessionStatus.Processing:
        return 'bg-primary';
      case AISessionStatus.Error:
        return 'bg-destructive';
      case AISessionStatus.Terminated:
        return 'bg-muted';
      case AISessionStatus.Suspended:
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case AISessionStatus.Active:
        return 'Active';
      case AISessionStatus.Idle:
        return 'Idle';
      case AISessionStatus.Processing:
        return 'Processing';
      case AISessionStatus.Error:
        return 'Error';
      case AISessionStatus.Terminated:
        return 'Terminated';
      case AISessionStatus.Suspended:
        return 'Suspended';
      default:
        return 'Unknown';
    }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span 
        className={cn(
          'rounded-full inline-block',
          getStatusColor(),
          sizeClasses[size],
          status === AISessionStatus.Processing && 'animate-pulse'
        )}
        title={getStatusLabel()}
      />
      {showLabel && (
        <span className={cn(
          'text-muted-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {getStatusLabel()}
        </span>
      )}
    </div>
  );
};