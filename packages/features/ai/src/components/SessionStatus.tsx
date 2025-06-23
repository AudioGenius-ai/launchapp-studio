import React from 'react';
import { AISessionStatus } from '../types';
import { cn } from '@code-pilot/ui-kit';

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
      case AISessionStatus.ACTIVE:
        return 'bg-success';
      case AISessionStatus.IDLE:
        return 'bg-muted-foreground';
      case AISessionStatus.PAUSED:
        return 'bg-primary';
      case AISessionStatus.ERROR:
        return 'bg-destructive';
      case AISessionStatus.ENDED:
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case AISessionStatus.ACTIVE:
        return 'Active';
      case AISessionStatus.IDLE:
        return 'Idle';
      case AISessionStatus.PAUSED:
        return 'Paused';
      case AISessionStatus.ERROR:
        return 'Error';
      case AISessionStatus.ENDED:
        return 'Ended';
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
          status === AISessionStatus.ACTIVE && 'animate-pulse'
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