import React, { useState, useMemo } from 'react';
import type { AIMessage } from '../types';
import { AIMessageRole } from '../types';
import { cn } from '@code-pilot/ui-kit';
import { ToolCallCard } from './ToolCallCard';

export interface MessageItemProps {
  message: AIMessage;
  isLast?: boolean;
  isStreaming?: boolean;
  streamingContent?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onRetry?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  compactMode?: boolean;
  className?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast = false,
  isStreaming = false,
  streamingContent,
  onEdit,
  onRetry,
  onDelete,
  compactMode = false,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const displayContent = isStreaming && isLast && streamingContent 
    ? streamingContent 
    : message.content;

  const roleIcon = useMemo(() => {
    switch (message.role) {
      case AIMessageRole.USER:
        return (
          <div className={cn(
            'rounded-full bg-primary/10 text-primary',
            compactMode ? 'w-6 h-6' : 'w-8 h-8',
            'flex items-center justify-center flex-shrink-0'
          )}>
            <svg className={cn(compactMode ? 'w-3 h-3' : 'w-4 h-4')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case AIMessageRole.ASSISTANT:
        return (
          <div className={cn(
            'rounded-full bg-secondary/10 text-secondary',
            compactMode ? 'w-6 h-6' : 'w-8 h-8',
            'flex items-center justify-center flex-shrink-0'
          )}>
            <svg className={cn(compactMode ? 'w-3 h-3' : 'w-4 h-4')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case AIMessageRole.SYSTEM:
        return (
          <div className={cn(
            'rounded-full bg-muted text-muted-foreground',
            compactMode ? 'w-6 h-6' : 'w-8 h-8',
            'flex items-center justify-center flex-shrink-0'
          )}>
            <svg className={cn(compactMode ? 'w-3 h-3' : 'w-4 h-4')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  }, [message.role, compactMode]);

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const renderContent = (content: string) => {
    // Simple code block detection and rendering
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'plaintext';
      const code = match[2];
      parts.push(
        <div key={match.index} className="my-2">
          <div className="bg-muted rounded-t-md px-3 py-1 text-xs text-muted-foreground flex items-center justify-between">
            <span>{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="hover:text-foreground transition-colors"
              title="Copy code"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <pre className="bg-muted rounded-b-md p-3 overflow-x-auto">
            <code className={cn('text-xs', compactMode && 'text-[11px]')}>
              {code}
            </code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className={cn(
      'flex gap-3 group',
      message.role === AIMessageRole.USER && 'flex-row-reverse',
      className
    )}>
      {roleIcon}
      
      <div className={cn(
        'flex-1 overflow-hidden',
        message.role === AIMessageRole.USER && 'flex flex-col items-end'
      )}>
        <div className={cn(
          'rounded-lg px-3 py-2 max-w-[85%]',
          message.role === AIMessageRole.USER
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
          compactMode && 'text-sm'
        )}>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={cn(
                  'w-full bg-background/50 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring',
                  compactMode ? 'text-sm min-h-[60px]' : 'min-h-[80px]'
                )}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {renderContent(displayContent)}
            </div>
          )}
        </div>

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className={cn(
            'mt-2 space-y-2',
            message.role === AIMessageRole.USER && 'items-end'
          )}>
            {message.toolCalls.map((toolCall) => (
              <ToolCallCard
                key={toolCall.id}
                toolCall={toolCall}
                compactMode={compactMode}
              />
            ))}
          </div>
        )}

        {/* Message Actions */}
        {!isEditing && (
          <div className={cn(
            'flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
            message.role === AIMessageRole.USER && 'justify-end'
          )}>
            {message.role === AIMessageRole.USER && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
                title="Edit message"
              >
                Edit
              </button>
            )}
            {isLast && onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
                title="Retry"
              >
                Retry
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
                title="Delete"
              >
                Delete
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};