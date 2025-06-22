import React, { useState } from 'react';
import type { ToolCall, ToolCallStatus } from '@code-pilot/types';
import { cn } from '@code-pilot/utils';

export interface ToolCallCardProps {
  toolCall: ToolCall;
  compactMode?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({
  toolCall,
  compactMode = false,
  defaultExpanded = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusIcon = () => {
    switch (toolCall.status) {
      case ToolCallStatus.Pending:
        return (
          <svg className="w-4 h-4 text-muted-foreground animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case ToolCallStatus.Running:
        return (
          <svg className="w-4 h-4 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case ToolCallStatus.Completed:
        return (
          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case ToolCallStatus.Failed:
        return (
          <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case ToolCallStatus.Cancelled:
        return (
          <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
    }
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className={cn(
      'border border-border rounded-md overflow-hidden',
      compactMode && 'text-sm',
      className
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between',
          'px-3 py-2 hover:bg-muted/50 transition-colors',
          compactMode && 'px-2 py-1.5'
        )}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{toolCall.tool}</span>
          {toolCall.completedAt && (
            <span className="text-xs text-muted-foreground">
              {((toolCall.completedAt.getTime() - toolCall.createdAt.getTime()) / 1000).toFixed(2)}s
            </span>
          )}
        </div>
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className={cn(
          'border-t border-border',
          compactMode ? 'p-2' : 'p-3'
        )}>
          {/* Input */}
          <div className="mb-3">
            <h4 className={cn(
              'font-medium mb-1',
              compactMode ? 'text-xs' : 'text-sm'
            )}>
              Input
            </h4>
            <pre className={cn(
              'bg-muted rounded p-2 overflow-x-auto',
              compactMode ? 'text-xs' : 'text-sm'
            )}>
              <code>{formatJson(toolCall.input)}</code>
            </pre>
          </div>

          {/* Output */}
          {toolCall.output !== undefined && (
            <div className="mb-3">
              <h4 className={cn(
                'font-medium mb-1',
                compactMode ? 'text-xs' : 'text-sm'
              )}>
                Output
              </h4>
              <pre className={cn(
                'bg-muted rounded p-2 overflow-x-auto',
                compactMode ? 'text-xs' : 'text-sm'
              )}>
                <code>{formatJson(toolCall.output)}</code>
              </pre>
            </div>
          )}

          {/* Error */}
          {toolCall.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
              <p className={cn(
                'font-medium text-destructive mb-1',
                compactMode ? 'text-xs' : 'text-sm'
              )}>
                Error: {toolCall.error.code}
              </p>
              <p className={cn(
                'text-destructive/80',
                compactMode ? 'text-xs' : 'text-sm'
              )}>
                {toolCall.error.message}
              </p>
              {toolCall.error.details && (
                <pre className={cn(
                  'mt-2 text-xs overflow-x-auto',
                  compactMode && 'text-[11px]'
                )}>
                  <code>{formatJson(toolCall.error.details)}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};