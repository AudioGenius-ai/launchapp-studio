import React from 'react';
import type { AISession } from '../types';
import { cn } from '@code-pilot/utils';
import { SessionStatus } from './SessionStatus';

export interface SessionTabsProps {
  sessions: AISession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession?: () => void;
  onCloseSession?: (sessionId: string) => void;
  maxTabs?: number;
  compactMode?: boolean;
  className?: string;
}

export const SessionTabs: React.FC<SessionTabsProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onCloseSession,
  maxTabs = 10,
  compactMode = false,
  className,
}) => {
  const visibleSessions = sessions.slice(0, maxTabs);
  const hiddenCount = sessions.length - maxTabs;

  return (
    <div className={cn(
      'flex items-center border-b border-border bg-background',
      compactMode && 'text-sm',
      className
    )}>
      <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
        {visibleSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={cn(
              'group relative flex items-center gap-2 px-4 py-2 border-r border-border',
              'hover:bg-muted/50 transition-colors',
              'whitespace-nowrap min-w-0',
              activeSessionId === session.id && 'bg-muted',
              compactMode && 'px-3 py-1.5'
            )}
          >
            <SessionStatus status={session.status} size="sm" />
            <span className="truncate max-w-[150px]">{session.name}</span>
            
            {onCloseSession && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseSession(session.id);
                }}
                className={cn(
                  'ml-2 p-0.5 rounded',
                  'opacity-0 group-hover:opacity-100',
                  'hover:bg-muted-foreground/20 transition-all',
                  compactMode && 'ml-1'
                )}
                title="Close session"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </button>
        ))}

        {hiddenCount > 0 && (
          <div className={cn(
            'flex items-center px-3 text-muted-foreground',
            compactMode && 'px-2'
          )}>
            <span className="text-sm">+{hiddenCount} more</span>
          </div>
        )}
      </div>

      {onCreateSession && (
        <button
          onClick={onCreateSession}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border-l border-border',
            'hover:bg-muted/50 transition-colors',
            compactMode && 'px-3 py-1.5'
          )}
          title="New session"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {!compactMode && <span>New</span>}
        </button>
      )}
    </div>
  );
};