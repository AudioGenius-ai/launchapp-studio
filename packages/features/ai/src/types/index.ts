// Re-export all AI-related types from @code-pilot/types
export * from '@code-pilot/types';

// Local UI-specific types that are not in the shared types package

// UI preferences specific to the AI panel
export interface UIPreferences {
  panelWidth: number;
  fontSize: number;
  showTimestamps: boolean;
  showTokenCount: boolean;
  enableMarkdown: boolean;
  enableSyntaxHighlighting: boolean;
  autoScroll: boolean;
  compactMode: boolean;
}

// Streaming state for active messages
export interface StreamingState {
  sessionId: string;
  messageId: string;
  content: string;
  isComplete: boolean;
  startTime: number;
}

// Component-specific props types
export interface ChatInterfaceProps {
  sessionId: string;
  className?: string;
  onClose?: () => void;
}

export interface MessageListProps {
  messages: any[]; // Will use AIMessage from @code-pilot/types
  className?: string;
  showTimestamps?: boolean;
  enableMarkdown?: boolean;
}

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface SessionTabsProps {
  sessions: any[]; // Will use AISession from @code-pilot/types
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: () => void;
  onSessionClose: (sessionId: string) => void;
  className?: string;
}

export interface ToolCallCardProps {
  tool: any; // Will use proper type from @code-pilot/types
  className?: string;
}