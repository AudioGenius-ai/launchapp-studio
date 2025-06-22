import React, { useRef, useEffect } from 'react';
import { cn } from '@code-pilot/utils';

export interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  maxRows?: number;
  autoFocus?: boolean;
  compactMode?: boolean;
  showAttachButton?: boolean;
  onAttach?: () => void;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  placeholder = 'Type a message...',
  disabled = false,
  multiline = true,
  maxRows = 5,
  autoFocus = false,
  compactMode = false,
  showAttachButton = false,
  onAttach,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (multiline && textareaRef.current) {
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      const maxHeight = lineHeight * maxRows;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value, multiline, maxRows]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className={cn('flex items-end gap-2', className)}>
      {showAttachButton && onAttach && (
        <button
          onClick={onAttach}
          disabled={disabled}
          className={cn(
            'p-2 rounded-md transition-colors',
            'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed',
            compactMode && 'p-1.5'
          )}
          title="Attach file"
        >
          <svg 
            className={cn('text-muted-foreground', compactMode ? 'w-4 h-4' : 'w-5 h-5')} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
            />
          </svg>
        </button>
      )}

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full resize-none rounded-md border border-input bg-background',
            'px-3 py-2 pr-10',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            compactMode && 'text-sm px-2 py-1.5 pr-8',
            className
          )}
          style={{ minHeight: compactMode ? '32px' : '40px' }}
        />
        
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className={cn(
            'absolute bottom-2 right-2',
            'p-1 rounded transition-colors',
            'text-muted-foreground hover:text-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            compactMode && 'bottom-1.5 right-1.5'
          )}
          title="Send message"
        >
          <svg 
            className={cn(compactMode ? 'w-4 h-4' : 'w-5 h-5')} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};