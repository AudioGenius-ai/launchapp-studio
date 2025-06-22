# Claude Integration UI Plan

## Overview

The Claude integration should be a **docked panel** within the IDE, not a separate page. Based on the old implementation, it works best as a **right sidebar panel** that can be toggled and resized.

## Core Principles - Modular Architecture

1. **Separation of Concerns**: Business logic in `@code-pilot/core`, UI in `@code-pilot/ui`, types in `@code-pilot/types`
2. **Reusability**: Claude components should be usable in different contexts (panel, modal, fullscreen)
3. **Provider Agnostic**: Design for multiple AI providers, not just Claude
4. **Testability**: Each module should be independently testable

## Current vs Target Architecture

### Current State (❌ Not Ideal)
- Claude is a separate route/page (`/claude`)
- Full-screen implementation
- No integration with editor context
- No persistent panel state

### Target State (✅ Ideal)
- Claude as a collapsible right panel
- Always accessible while coding
- Context-aware (knows current file, selection)
- Multiple concurrent sessions
- Persistent across navigation

## Modular Implementation Plan

### Phase 1: Type Definitions & Core Services

1. **Add AI Types** (`packages/types/src/ai.ts`)
   ```typescript
   export interface AIProvider {
     id: string;
     name: string;
     type: 'claude' | 'openai' | 'custom';
   }
   
   export interface AISession {
     id: string;
     providerId: string;
     status: 'idle' | 'streaming' | 'error';
     messages: AIMessage[];
   }
   ```

2. **Create AI Service Abstraction** (`packages/core/src/services/aiService.ts`)
   ```typescript
   export abstract class AIService {
     abstract createSession(options: CreateSessionOptions): Promise<AISession>;
     abstract sendMessage(sessionId: string, message: string): Promise<void>;
   }
   ```

3. **Implement Claude Service** (`packages/core/src/services/claudeService.ts`)
   - Wraps Tauri plugin commands
   - Handles session management
   - Manages event subscriptions

### Phase 2: Reusable UI Components in `@code-pilot/ui`

1. **Generic AI Components**
   ```
   packages/ui/src/components/AI/
   ├── ChatInterface.tsx      # Generic chat UI
   ├── MessageList.tsx        # Reusable message display
   ├── MessageItem.tsx        # Single message component
   ├── ToolCallCard.tsx       # Tool call visualization
   └── SessionTabs.tsx        # Multi-session tabs
   ```

2. **Panel Components**
   ```
   packages/ui/src/components/Panels/
   ├── ResizablePanel.tsx     # Generic resizable panel
   ├── PanelHeader.tsx        # Reusable panel header
   └── PanelContainer.tsx     # Panel wrapper
   ```

### Phase 3: Layout Integration

1. **Create Flexible Layout System** (`apps/desktop/src/layouts/`)
   ```typescript
   // IDELayout.tsx - Main layout with panel support
   export const IDELayout = ({ children }) => {
     const { panels } = useLayoutStore();
     
     return (
       <PanelGroup direction="horizontal">
         {/* Dynamic panels based on settings */}
       </PanelGroup>
     );
   };
   ```

2. **Feature-Specific Integration** (`apps/desktop/src/features/ai/`)
   ```
   features/ai/
   ├── ClaudePanel.tsx      # Thin wrapper using UI components
   ├── useClaudeEvents.ts   # Tauri event subscriptions
   └── aiStore.ts           # Feature-specific state
   ```

3. **Panel Registry System**
   - Register panels dynamically
   - Support multiple AI providers
   - Enable/disable panels via settings

### Phase 4: Core Features Implementation

Using the modular components from previous phases:

1. **Session Management**
   - Use generic `AIService` for all operations
   - Leverage `SessionTabs` component from UI package
   - Store state in feature-specific Zustand store

2. **Message Interface**
   - Use `ChatInterface` from UI package
   - Add Claude-specific message parsing
   - Implement tool call handlers

3. **Real-time Updates**
   - Subscribe to Tauri events in feature layer
   - Update UI components via props/context
   - Keep UI components pure and reusable

## Technical Implementation Details

### 1. Panel Layout Structure

```tsx
// App.tsx
<PanelGroup direction="horizontal">
  <Panel defaultSize={20} minSize={15} maxSize={30}>
    <FileExplorer />
  </Panel>
  
  <PanelResizeHandle />
  
  <Panel defaultSize={60}>
    <Routes>
      {/* Main content routes */}
    </Routes>
  </Panel>
  
  <PanelResizeHandle />
  
  <Panel 
    defaultSize={20} 
    minSize={20} 
    maxSize={40}
    collapsible
  >
    <ClaudePanel />
  </Panel>
</PanelGroup>
```

### 2. State Management

```typescript
// claudeStore.ts
interface ClaudeStore {
  sessions: Map<string, ClaudeSession>;
  activeSessionId: string | null;
  isPanelOpen: boolean;
  panelWidth: number;
  
  // Actions
  createSession: (options: CreateSessionOptions) => Promise<void>;
  sendMessage: (sessionId: string, message: string) => Promise<void>;
  togglePanel: () => void;
  setActiveSession: (sessionId: string) => void;
}
```

### 3. Event Integration

```typescript
// useClaudeEvents.ts
useEffect(() => {
  const unsubscribe = listen('claude-message', (event) => {
    // Handle streaming messages
  });
  
  const unsubscribeStatus = listen('claude-status', (event) => {
    // Handle session status changes
  });
  
  return () => {
    unsubscribe();
    unsubscribeStatus();
  };
}, []);
```

### 4. Message Component Structure

```tsx
// MessageItem.tsx
<div className={cn(
  "p-3 rounded-lg",
  message.role === 'user' ? "bg-muted/30" : ""
)}>
  <div className="flex gap-2">
    <Icon />
    <div className="flex-1">
      {message.content}
      {message.toolCalls?.map(call => (
        <ToolCallCard key={call.id} call={call} />
      ))}
    </div>
  </div>
</div>
```

## UI/UX Guidelines

1. **Compact Design**
   - Small text sizes (text-sm)
   - Minimal padding
   - Efficient space usage

2. **Visual Feedback**
   - Streaming indicators
   - Loading states
   - Error displays
   - Status dots

3. **Keyboard Navigation**
   - Cmd/Ctrl+Shift+C to toggle panel
   - Tab between sessions
   - Enter to send message

4. **Responsive Behavior**
   - Collapsible panel
   - Minimum/maximum widths
   - Mobile-friendly if needed

## Integration Points

1. **Editor Integration**
   - "Ask Claude about this" context menu
   - Selection → Claude prompt
   - Error → Claude debugging

2. **File Explorer**
   - Right-click → "Explain this file"
   - Folder analysis

3. **Terminal Integration**
   - Command output → Claude
   - Error analysis

## Benefits of Modular Approach

1. **Provider Agnostic**: Easy to add OpenAI, Anthropic API, or other providers
2. **Flexible Layout**: Panels can be moved, hidden, or popped out
3. **Reusable Components**: Chat UI can be used in different contexts
4. **Clean Dependencies**: Each package has clear responsibilities
5. **Type Safety**: Full TypeScript coverage across packages
6. **Testable**: Each layer can be tested independently

## Migration Path

1. **Phase 1**: Create types and core services (no UI changes)
2. **Phase 2**: Build reusable UI components (test in isolation)
3. **Phase 3**: Implement layout system (keep current routes)
4. **Phase 4**: Wire everything together
5. **Phase 5**: Remove old `/claude` route
6. **Phase 6**: Add advanced features

## Success Criteria

- [ ] Claude panel toggles smoothly
- [ ] Multiple sessions work concurrently
- [ ] Messages stream in real-time
- [ ] Tool calls display properly
- [ ] Session persistence works
- [ ] Context integration functions
- [ ] Keyboard shortcuts work
- [ ] Panel state persists