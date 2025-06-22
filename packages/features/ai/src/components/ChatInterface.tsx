import React, { useState, useRef, useEffect } from 'react';
import type { AISession, AIMessage, SendMessageRequest } from '@code-pilot/types';
import { cn } from '@code-pilot/utils';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SessionStatus } from './SessionStatus';
import { StreamingIndicator } from './StreamingIndicator';

export interface ChatInterfaceProps {
  session: AISession;
  onSendMessage: (request: SendMessageRequest) => Promise<void>;
  onClearSession?: () => void;
  onRefresh?: () => void;
  isStreaming?: boolean;
  streamingContent?: string;
  className?: string;
  inputPlaceholder?: string;
  showStatus?: boolean;
  compactMode?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  session,
  onSendMessage,
  onClearSession,
  onRefresh,
  isStreaming = false,
  streamingContent,
  className,
  inputPlaceholder = 'Type a message...',
  showStatus = true,
  compactMode = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, streamingContent]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || isStreaming) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      await onSendMessage({
        sessionId: session.id,
        content: message,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the input on error
      setInputValue(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-background',
      compactMode && 'text-sm',
      className
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between border-b border-border',
        compactMode ? 'px-3 py-2' : 'px-4 py-3'
      )}>
        <div className="flex items-center gap-2">
          <h3 className={cn(
            'font-medium text-foreground',
            compactMode ? 'text-sm' : 'text-base'
          )}>
            {session.name}
          </h3>
          {showStatus && <SessionStatus status={session.status} size={compactMode ? 'sm' : 'md'} />}
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Refresh session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {onClearSession && (
            <button
              onClick={onClearSession}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="Clear session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={session.messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          compactMode={compactMode}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className={cn(
          'border-t border-border',
          compactMode ? 'px-3 py-2' : 'px-4 py-3'
        )}>
          <StreamingIndicator />
        </div>
      )}

      {/* Input */}
      <div className={cn(
        'border-t border-border',
        compactMode ? 'p-3' : 'p-4'
      )}>
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          disabled={isSending || isStreaming}
          compactMode={compactMode}
        />
      </div>
    </div>
  );
};