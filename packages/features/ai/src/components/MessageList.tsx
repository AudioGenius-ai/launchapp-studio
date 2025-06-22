import React from 'react';
import type { AIMessage } from '@code-pilot/types';
import { cn } from '@code-pilot/utils';
import { MessageItem } from './MessageItem';

export interface MessageListProps {
  messages: AIMessage[];
  isStreaming?: boolean;
  streamingContent?: string;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  compactMode?: boolean;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming = false,
  streamingContent,
  onEditMessage,
  onRetryMessage,
  onDeleteMessage,
  compactMode = false,
  className,
}) => {
  return (
    <div className={cn(
      'flex-1 overflow-y-auto',
      compactMode ? 'px-3 py-2' : 'px-4 py-3',
      className
    )}>
      <div className="space-y-4">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            isStreaming={isStreaming && index === messages.length - 1}
            streamingContent={streamingContent}
            onEdit={onEditMessage}
            onRetry={onRetryMessage}
            onDelete={onDeleteMessage}
            compactMode={compactMode}
          />
        ))}
      </div>
    </div>
  );
};