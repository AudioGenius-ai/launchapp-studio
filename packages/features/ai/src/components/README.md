# AI Components

A collection of reusable AI-related UI components for building chat interfaces, message displays, and AI session management.

## Components

### ChatInterface
Main chat container that orchestrates the entire chat experience.

```tsx
import { ChatInterface } from '@code-pilot/ui';

<ChatInterface
  session={aiSession}
  onSendMessage={handleSendMessage}
  onClearSession={handleClear}
  isStreaming={isStreaming}
  streamingContent={streamingContent}
  compactMode={true}
/>
```

### MessageList
Scrollable list of messages with auto-scroll to bottom.

```tsx
import { MessageList } from '@code-pilot/ui';

<MessageList
  messages={messages}
  isStreaming={isStreaming}
  streamingContent={streamingContent}
  onEditMessage={handleEdit}
  onRetryMessage={handleRetry}
  compactMode={false}
/>
```

### MessageItem
Individual message component with role indicators and tool call visualization.

```tsx
import { MessageItem } from '@code-pilot/ui';

<MessageItem
  message={message}
  isLast={true}
  isStreaming={false}
  onEdit={handleEdit}
  onRetry={handleRetry}
  compactMode={false}
/>
```

### MessageInput
Input area with multiline support and send button.

```tsx
import { MessageInput } from '@code-pilot/ui';

<MessageInput
  value={inputValue}
  onChange={setInputValue}
  onSend={handleSend}
  placeholder="Ask anything..."
  disabled={isProcessing}
  compactMode={false}
/>
```

### ToolCallCard
Collapsible display for tool/function calls with status indicators.

```tsx
import { ToolCallCard } from '@code-pilot/ui';

<ToolCallCard
  toolCall={toolCall}
  compactMode={false}
  defaultExpanded={false}
/>
```

### SessionTabs
Tab management for multiple AI sessions.

```tsx
import { SessionTabs } from '@code-pilot/ui';

<SessionTabs
  sessions={sessions}
  activeSessionId={activeId}
  onSelectSession={handleSelect}
  onCreateSession={handleCreate}
  onCloseSession={handleClose}
  maxTabs={10}
/>
```

### SessionStatus
Status indicator for AI sessions.

```tsx
import { SessionStatus } from '@code-pilot/ui';

<SessionStatus
  status={AISessionStatus.Active}
  size="md"
  showLabel={true}
/>
```

### StreamingIndicator
Shows when AI is actively responding.

```tsx
import { StreamingIndicator } from '@code-pilot/ui';

<StreamingIndicator
  text="AI is thinking"
  size="md"
/>
```

## Features

- **Provider Agnostic**: Works with any AI service (Claude, OpenAI, etc.)
- **Full TypeScript Support**: Strongly typed with AI types from `@code-pilot/types`
- **Theme Support**: Respects light/dark themes via CSS variables
- **Responsive Design**: Works in different panel sizes with compact mode
- **Accessibility**: Keyboard navigation and screen reader support
- **Code Highlighting**: Syntax highlighting for code blocks in messages
- **Tool Call Visualization**: Expandable cards for function/tool calls
- **Message Actions**: Edit, retry, and delete capabilities
- **Auto-scroll**: Automatically scrolls to new messages
- **Streaming Support**: Real-time message streaming display

## Usage Example

```tsx
import React, { useState } from 'react';
import { ChatInterface } from '@code-pilot/ui';
import type { AISession, SendMessageRequest } from '@code-pilot/types';

export const AIChatPanel: React.FC = () => {
  const [session, setSession] = useState<AISession>(initialSession);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const handleSendMessage = async (request: SendMessageRequest) => {
    // Send message to AI service
    setIsStreaming(true);
    try {
      const response = await aiService.sendMessage(request);
      // Handle response
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  return (
    <div className="h-full">
      <ChatInterface
        session={session}
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        compactMode={true}
      />
    </div>
  );
};
```

## Styling

Components use Tailwind CSS classes and respect the application's theme through CSS variables. Key colors:

- Primary: User messages and active states
- Secondary: AI assistant messages
- Muted: System messages and backgrounds
- Success/Warning/Error: Status indicators
- Background/Foreground: Adaptive to light/dark theme

## Compact Mode

All components support a `compactMode` prop for use in sidebars or smaller panels:
- Reduced padding and margins
- Smaller font sizes
- Condensed layouts
- Hidden labels where appropriate