import React, { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { SessionTabs } from './SessionTabs';
import {
  AISession,
  SendMessageRequest,
  StreamChunk,
  AIEvent,
  CreateSessionOptions
} from '../types';
import { useClaudeService } from '../services/useClaudeService';
import { useClaudeContext } from '../services/useClaudeContext';

export interface ClaudePanelProps {
  className?: string;
  compactMode?: boolean;
}

export const ClaudePanel: React.FC<ClaudePanelProps> = ({
  className,
  compactMode = false
}) => {
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  const { service, isConnected, error, reconnect } = useClaudeService();
  const { currentContext, refreshContext } = useClaudeContext();

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
      service.subscribe(AIEvent.SESSION_CREATED, (session: AISession) => {
        setSessions(prev => [...prev, session]);
        setActiveSessionId(session.id);
      }),
      service.subscribe(AIEvent.SESSION_ENDED, ({ sessionId }: { sessionId: string }) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(sessions[0]?.id || null);
        }
      }),
      service.subscribe(AIEvent.SESSION_UPDATED, (session: AISession) => {
        setSessions(prev => prev.map(s => s.id === session.id ? session : s));
      }),
      service.subscribe(AIEvent.MESSAGE_STREAMING, (chunk: StreamChunk) => {
        if (chunk.sessionId === activeSessionId) {
          setStreamingContent(chunk.content);
        }
      }),
      service.subscribe(AIEvent.MESSAGE_COMPLETE, () => {
        setIsStreaming(false);
        setStreamingContent('');
      })
    ];

    return () => {
      handlers.forEach(handler => handler());
    };
  }, [service, activeSessionId]);

  const loadSessions = async () => {
    if (!service) return;
    
    try {
      const response = await service.listSessions({});
      setSessions(response.sessions);
      if (response.sessions.length > 0 && !activeSessionId) {
        setActiveSessionId(response.sessions[0].id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createSession = async (name?: string) => {
    if (!service) return;

    try {
      const options: CreateSessionOptions = {
        providerId: 'claude-default',
        name: name || `Session ${new Date().toLocaleString()}`,
        context: currentContext,
        settings: {
          modelVersion: 'claude-3-opus-20240229',
          temperature: 0.7,
          maxTokens: 4096
        }
      };

      const session = await service.createSession(options);
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!service) return;

    try {
      await service.deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const sendMessage = async (request: SendMessageRequest) => {
    if (!service || !activeSessionId) return;

    try {
      setIsStreaming(true);
      
      // Use streaming for better UX
      await service.sendStreamingMessage(
        request,
        (_chunk: StreamChunk) => {
          // Streaming is handled by event listeners
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
      throw error;
    }
  };

  const clearSession = async () => {
    if (!service || !activeSessionId) return;

    try {
      await service.clearMessages(activeSessionId);
      // Refresh the current session
      const updatedSession = await service.getSession(activeSessionId);
      if (updatedSession) {
        setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const updateSessionContext = async () => {
    if (!service || !activeSessionId) return;

    try {
      await refreshContext();
      await service.updateContext(activeSessionId, currentContext);
    } catch (error) {
      console.error('Failed to update context:', error);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Session Tabs */}
      <SessionTabs
        sessions={sessions}
        activeSessionId={activeSessionId || ''}
        onSelectSession={setActiveSessionId}
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
          isStreaming={isStreaming}
          streamingContent={streamingContent}
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