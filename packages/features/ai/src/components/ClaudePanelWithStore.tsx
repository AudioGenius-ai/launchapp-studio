import React, { useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { SessionTabs } from './SessionTabs';
import {
  SendMessageRequest,
  StreamChunk,
  AIEvent,
  CreateSessionOptions,
  AIMessage,
  AIMessageRole,
  AIMessageStatus,
  AIErrorCode
} from '../types';
import { useClaudeService } from '../services/useClaudeService';
import { useClaudeContext } from '../services/useClaudeContext';
import {
  useAIStore,
  useActiveSession,
  useSessionMessages,
  useStreamingState
} from '../stores/aiStore';

export interface ClaudePanelProps {
  className?: string;
  compactMode?: boolean;
}

export const ClaudePanel: React.FC<ClaudePanelProps> = ({
  className,
  compactMode: propCompactMode
}) => {
  const { service, isConnected, error, reconnect } = useClaudeService();
  const { currentContext, refreshContext } = useClaudeContext();
  
  // Store hooks
  const {
    sessions,
    activeSessionId,
    setActiveSession,
    createSession: createSessionInStore,
    deleteSession: deleteSessionFromStore,
    updateSession,
    addMessage,
    updateMessage,
    clearMessages,
    startStreaming,
    updateStreamingContent,
    completeStreaming,
    setError,
    clearError,
    uiPreferences,
    updateUIPreferences
  } = useAIStore();
  
  const activeSession = useActiveSession();
  // const messages = useSessionMessages(activeSessionId || '');
  const streamingState = useStreamingState();
  
  // Use UI preferences from store
  const compactMode = propCompactMode ?? uiPreferences.compactMode;

  // Load existing sessions on mount
  useEffect(() => {
    if (service && isConnected) {
      loadSessions();
    }
  }, [service, isConnected]);

  // Subscribe to AI events
  useEffect(() => {
    if (!service) return;

    const handlers = [
      service.subscribe(AIEvent.SESSION_CREATED, (session) => {
        // Session already created in store by createSession function
        // This event is for external session creation
        createSessionInStore({
          providerId: session.providerId,
          projectId: session.projectId,
          name: session.name,
          context: session.context,
          settings: session.metadata
        });
      }),
      
      service.subscribe(AIEvent.SESSION_ENDED, ({ sessionId }: { sessionId: string }) => {
        deleteSessionFromStore(sessionId);
      }),
      
      service.subscribe(AIEvent.SESSION_UPDATED, (session) => {
        updateSession(session.id, {
          name: session.name,
          status: session.status,
          context: session.context,
          metadata: session.metadata
        });
      }),
      
      service.subscribe(AIEvent.MESSAGE_STREAMING, (chunk: StreamChunk) => {
        updateStreamingContent(chunk);
      }),
      
      service.subscribe(AIEvent.MESSAGE_COMPLETE, ({ sessionId, message }) => {
        completeStreaming();
        if (message) {
          updateMessage(sessionId, message.id, {
            status: AIMessageStatus.RECEIVED,
            content: streamingState?.content || message.content
          });
        }
      }),
      
      service.subscribe(AIEvent.MESSAGE_ERROR, ({ messageId, error }) => {
        completeStreaming();
        setError(`message-${messageId}`, {
          code: AIErrorCode.UNKNOWN,
          message: error.message || 'Failed to send message',
          details: error,
        });
      })
    ];

    return () => {
      handlers.forEach(handler => handler());
    };
  }, [service, activeSessionId, streamingState]);

  const loadSessions = async () => {
    if (!service) return;
    
    try {
      const response = await service.listSessions({});
      // Import sessions to store
      useAIStore.getState().importSessions(response.sessions);
      
      if (response.sessions.length > 0 && !activeSessionId) {
        setActiveSession(response.sessions[0].id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('load-sessions', {
        code: AIErrorCode.UNKNOWN,
        message: 'Failed to load sessions',
        details: error,
      });
    }
  };

  const createSession = async (name?: string) => {
    if (!service) return;

    try {
      const options: CreateSessionOptions = {
        providerId: 'claude', // TODO: Use active provider from store
        projectId: currentContext?.project?.id || 'default',
        name: name || `Session ${new Date().toLocaleString()}`,
        context: currentContext,
        settings: {
          modelVersion: 'claude-3-opus-20240229',
          temperature: 0.7,
          maxTokens: 4096
        }
      };

      // Create session in store first
      const session = createSessionInStore(options);
      
      // Then sync with backend
      try {
        await service.createSession(options);
      } catch (error) {
        // If backend fails, remove from store
        deleteSessionFromStore(session.id);
        throw error;
      }
      
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      setError('create-session', {
        code: AIErrorCode.UNKNOWN,
        message: 'Failed to create session',
        details: error,
      });
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!service) return;

    try {
      await service.deleteSession(sessionId);
      deleteSessionFromStore(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      setError(`delete-session-${sessionId}`, {
        code: AIErrorCode.UNKNOWN,
        message: 'Failed to delete session',
        details: error,
      });
    }
  };

  const sendMessage = async (request: SendMessageRequest) => {
    if (!service || !activeSessionId) return;

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add user message to store
    const userMessage: AIMessage = {
      id: messageId,
      role: AIMessageRole.USER,
      content: request.content,
      timestamp: new Date(),
      status: AIMessageStatus.SENT,
      metadata: { attachments: request.attachments }
    };
    
    addMessage(activeSessionId, userMessage);
    
    try {
      // Start streaming
      startStreaming(activeSessionId, messageId);
      
      // Create assistant message placeholder
      const assistantMessageId = `${messageId}-response`;
      const assistantMessage: AIMessage = {
        id: assistantMessageId,
        role: AIMessageRole.ASSISTANT,
        content: '',
        timestamp: new Date(),
        status: AIMessageStatus.PENDING
      };
      
      addMessage(activeSessionId, assistantMessage);
      startStreaming(activeSessionId, assistantMessageId);
      
      // Send message with streaming
      await service.sendStreamingMessage(
        request,
        (_chunk: StreamChunk) => {
          // Chunk updates are handled by event listeners
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      completeStreaming();
      
      setError(`send-message-${messageId}`, {
        code: AIErrorCode.UNKNOWN,
        message: 'Failed to send message',
        details: error
      });
      
      throw error;
    }
  };

  const clearSession = async () => {
    if (!service || !activeSessionId) return;

    try {
      await service.clearMessages(activeSessionId);
      clearMessages(activeSessionId);
      clearError(`session-${activeSessionId}`);
    } catch (error) {
      console.error('Failed to clear session:', error);
      setError(`clear-session-${activeSessionId}`, {
        code: AIErrorCode.UNKNOWN,
        message: 'Failed to clear session',
        details: error
      });
    }
  };

  const updateSessionContext = async () => {
    if (!service || !activeSessionId) return;

    try {
      await refreshContext();
      await service.updateContext(activeSessionId, currentContext);
      updateSession(activeSessionId, { context: currentContext });
    } catch (error) {
      console.error('Failed to update context:', error);
      setError(`update-context-${activeSessionId}`, {
        code: AIErrorCode.UNKNOWN,
        message: 'Failed to update context',
        details: error
      });
    }
  };

  // const handleCompactModeToggle = () => {
  //   updateUIPreferences({ compactMode: !compactMode });
  // };

  if (!isConnected) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">Claude Not Connected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || 'Unable to connect to Claude CLI'}
          </p>
          <button
            onClick={reconnect}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  const sessionArray = Array.from(sessions.values());

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Session Tabs */}
      <SessionTabs
        sessions={sessionArray}
        activeSessionId={activeSessionId || ''}
        onSelectSession={setActiveSession}
        onCreateSession={() => createSession()}
        onCloseSession={deleteSession}
        compactMode={compactMode}
      />

      {/* Chat Interface */}
      {activeSession ? (
        <ChatInterface
          session={activeSession}
          onSendMessage={sendMessage}
          onClearSession={clearSession}
          onRefresh={updateSessionContext}
          isStreaming={!!streamingState && streamingState.sessionId === activeSessionId}
          streamingContent={streamingState?.sessionId === activeSessionId ? streamingState.content : ''}
          compactMode={compactMode}
          inputPlaceholder="Ask Claude anything..."
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Active Session</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new session to start chatting with Claude
            </p>
            <button
              onClick={() => createSession()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Create Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};