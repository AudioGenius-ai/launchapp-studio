import { useEffect, useCallback, useRef } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

// Event payload types based on the Claude plugin models
export interface SessionEvent {
  sessionId: string;
  eventType: 'statusChanged' | 'messagesUpdated' | 'sessionCreated' | 'sessionStopped' | 'error';
  data: any;
}

export interface ClaudeMessage {
  type: 'system' | 'assistant' | 'user';
  message?: {
    role: string;
    content: ContentBlock[];
    stopReason?: string;
    stopSequence?: string;
  };
  parentToolUseId?: string;
  sessionId?: string;
  // System message fields
  subtype?: string;
  cwd?: string;
  tools?: string[];
  mcpServers?: string[];
  model?: string;
  permissionMode?: string;
  apiKeySource?: string;
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  // Tool use fields
  id?: string;
  name?: string;
  input?: any;
  // Tool result fields
  toolUseId?: string;
  content?: ContentBlock[];
  isError?: boolean;
}

export interface UseClaudeEventsOptions {
  sessionId?: string;
  onSessionEvent?: (event: SessionEvent) => void;
  onStatusChange?: (sessionId: string, status: string) => void;
  onMessagesUpdate?: (sessionId: string, messages: ClaudeMessage[], newMessageCount: number) => void;
  onSessionCreated?: (sessionId: string) => void;
  onSessionStopped?: (sessionId: string) => void;
  onError?: (sessionId: string, error: any) => void;
  autoReconnect?: boolean;
}

export const useClaudeEvents = (options: UseClaudeEventsOptions = {}) => {
  const {
    sessionId,
    onSessionEvent,
    onStatusChange,
    onMessagesUpdate,
    onSessionCreated,
    onSessionStopped,
    onError,
    autoReconnect = true,
  } = options;

  const unlistenersRef = useRef<UnlistenFn[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isConnectedRef = useRef(false);

  const cleanup = useCallback(() => {
    // Clean up all event listeners
    unlistenersRef.current.forEach((unlisten) => {
      try {
        unlisten();
      } catch (err) {
        console.warn('Error unlistening:', err);
      }
    });
    unlistenersRef.current = [];

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    isConnectedRef.current = false;
  }, []);

  const setupListeners = useCallback(async () => {
    try {
      cleanup();

      // Listen for general session events
      const unlistenSessionEvent = await listen<SessionEvent>(
        'plugin:claude:session-event',
        (event) => {
          const payload = event.payload;

          // Filter by sessionId if provided
          if (sessionId && payload.sessionId !== sessionId) {
            return;
          }

          // Call the general handler
          onSessionEvent?.(payload);

          // Call specific handlers based on event type
          switch (payload.eventType) {
            case 'statusChanged':
              onStatusChange?.(payload.sessionId, payload.data.status);
              break;

            case 'messagesUpdated':
              onMessagesUpdate?.(
                payload.sessionId,
                payload.data.messages,
                payload.data.newMessageCount
              );
              break;

            case 'sessionCreated':
              onSessionCreated?.(payload.sessionId);
              break;

            case 'sessionStopped':
              onSessionStopped?.(payload.sessionId);
              break;

            case 'error':
              onError?.(payload.sessionId, payload.data);
              break;
          }
        }
      );

      unlistenersRef.current.push(unlistenSessionEvent);

      // Additional specific event listeners could be added here
      // For example, if the plugin emits more granular events:

      // Listen for message chunks (if implemented in the plugin)
      const unlistenMessage = await listen<{
        sessionId: string;
        chunk: string;
        isComplete: boolean;
      }>('plugin:claude:message', (event) => {
        if (sessionId && event.payload.sessionId !== sessionId) {
          return;
        }
        // Handle streaming message chunks
        console.log('Message chunk:', event.payload);
      });
      unlistenersRef.current.push(unlistenMessage);

      // Listen for tool calls (if implemented in the plugin)
      const unlistenToolCall = await listen<{
        sessionId: string;
        toolName: string;
        toolId: string;
        input: any;
        status: 'started' | 'completed' | 'failed';
        result?: any;
        error?: string;
      }>('plugin:claude:tool-call', (event) => {
        if (sessionId && event.payload.sessionId !== sessionId) {
          return;
        }
        // Handle tool call updates
        console.log('Tool call:', event.payload);
      });
      unlistenersRef.current.push(unlistenToolCall);

      isConnectedRef.current = true;
    } catch (err) {
      console.error('Failed to setup Claude event listeners:', err);
      onError?.(sessionId || '', err);

      // Attempt to reconnect if enabled
      if (autoReconnect && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = undefined;
          setupListeners();
        }, 5000); // Retry after 5 seconds
      }
    }
  }, [
    sessionId,
    onSessionEvent,
    onStatusChange,
    onMessagesUpdate,
    onSessionCreated,
    onSessionStopped,
    onError,
    autoReconnect,
    cleanup,
  ]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    cleanup();
    setupListeners();
  }, [cleanup, setupListeners]);

  // Check if events are connected
  const isConnected = useCallback(() => {
    return isConnectedRef.current;
  }, []);

  useEffect(() => {
    setupListeners();

    return () => {
      cleanup();
    };
  }, [setupListeners, cleanup]);

  return {
    reconnect,
    isConnected,
    cleanup,
  };
};

// Hook for listening to all Claude sessions
export const useAllClaudeSessions = (options: Omit<UseClaudeEventsOptions, 'sessionId'> = {}) => {
  return useClaudeEvents(options);
};

// Hook for listening to a specific Claude session
export const useClaudeSession = (
  sessionId: string,
  options: Omit<UseClaudeEventsOptions, 'sessionId'> = {}
) => {
  return useClaudeEvents({ ...options, sessionId });
};