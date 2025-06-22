import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatInterface } from './ChatInterface';
import { SessionTabs } from './SessionTabs';
import { invoke } from '@tauri-apps/api/core';
import { useClaudeEvents, ClaudeMessage, ContentBlock } from '../services/useClaudeEvents';
import {
  AISession,
  AIMessage,
  SendMessageRequest,
  AIMessageRole,
  AIMessageStatus
} from '@code-pilot/types';

interface ClaudeSession {
  id: string;
  workspacePath: string;
  logFilePath: string;
  pid?: number;
  createdAt: number;
  status: 'starting' | 'streaming' | 'idle' | 'completed' | 'failed';
  lastActivity: number;
}

export interface ClaudeTauriPanelProps {
  className?: string;
  compactMode?: boolean;
  workspacePath: string;
}

export const ClaudeTauriPanel: React.FC<ClaudeTauriPanelProps> = ({
  className,
  compactMode = false,
  workspacePath
}) => {
  const [sessions, setSessions] = useState<ClaudeSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Map<string, AIMessage[]>>(new Map());
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const streamingMessageRef = useRef<AIMessage | null>(null);

  // Use Claude events hook for all sessions
  const { reconnect, isConnected } = useClaudeEvents({
    onSessionEvent: (event) => {
      console.log('Session event:', event);
    },
    onStatusChange: (sessionId, status) => {
      console.log('Status changed:', sessionId, status);
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: status as any } : s
      ));
      
      if (status === 'streaming') {
        setIsStreaming(true);
      } else if (status === 'idle' || status === 'completed') {
        setIsStreaming(false);
        setStreamingContent('');
        streamingMessageRef.current = null;
      }
    },
    onMessagesUpdate: (sessionId, claudeMessages, newMessageCount) => {
      console.log('Messages updated:', sessionId, newMessageCount, 'new messages');
      
      // Convert Claude messages to AI messages
      const aiMessages = convertClaudeMessagesToAIMessages(claudeMessages);
      setMessages(prev => new Map(prev).set(sessionId, aiMessages));

      // Handle streaming content for the active session
      if (sessionId === activeSessionId && claudeMessages.length > 0) {
        const lastMessage = claudeMessages[claudeMessages.length - 1];
        if (lastMessage.type === 'assistant' && lastMessage.message) {
          const content = extractTextContent(lastMessage.message.content);
          
          if (!lastMessage.message.stopReason) {
            // Still streaming
            setStreamingContent(content);
            
            // Update or create streaming message
            if (!streamingMessageRef.current) {
              streamingMessageRef.current = {
                id: `msg-${Date.now()}`,
                role: AIMessageRole.Assistant,
                content,
                timestamp: new Date().toISOString(),
                status: AIMessageStatus.Streaming
              };
            } else {
              streamingMessageRef.current.content = content;
            }
          } else {
            // Completed
            setStreamingContent('');
            streamingMessageRef.current = null;
          }
        }
      }
    },
    onSessionCreated: (sessionId) => {
      console.log('Session created:', sessionId);
      loadSessions();
    },
    onSessionStopped: (sessionId) => {
      console.log('Session stopped:', sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    },
    onError: (sessionId, error) => {
      console.error('Claude error:', sessionId, error);
      setError(error.message || 'An error occurred');
    }
  });

  // Load sessions on mount and recover existing ones
  useEffect(() => {
    loadSessions();
    recoverSessions();
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const loadSessions = async () => {
    try {
      const sessions = await invoke<ClaudeSession[]>('plugin:claude|list_sessions');
      setSessions(sessions);
      
      if (sessions.length > 0 && !activeSessionId) {
        setActiveSessionId(sessions[0].id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('Failed to load sessions');
    }
  };

  const recoverSessions = async () => {
    try {
      const recovered = await invoke<ClaudeSession[]>('plugin:claude|recover_sessions');
      console.log('Recovered sessions:', recovered);
      
      if (recovered.length > 0) {
        await loadSessions();
      }
    } catch (error) {
      console.error('Failed to recover sessions:', error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const claudeMessages = await invoke<ClaudeMessage[]>('plugin:claude|get_messages', {
        sessionId
      });
      
      const aiMessages = convertClaudeMessagesToAIMessages(claudeMessages);
      setMessages(prev => new Map(prev).set(sessionId, aiMessages));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createSession = async (name?: string) => {
    try {
      const session = await invoke<ClaudeSession>('plugin:claude|create_session', {
        workspacePath,
        prompt: `You are Claude, an AI assistant helping with the Code Pilot Studio IDE project at ${workspacePath}. Be helpful, accurate, and concise.`
      });
      
      await loadSessions();
      setActiveSessionId(session.id);
      
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      setError('Failed to create Claude session');
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await invoke('plugin:claude|stop_session', { sessionId });
      await loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      setError('Failed to stop session');
    }
  };

  const sendMessage = async (request: SendMessageRequest) => {
    if (!activeSessionId) return;

    try {
      setIsStreaming(true);
      setError(null);
      
      await invoke('plugin:claude|send_input', {
        sessionId: activeSessionId,
        input: request.content
      });
      
      // The response will come through the event listeners
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message to Claude');
      setIsStreaming(false);
      throw error;
    }
  };

  const clearSession = async () => {
    if (!activeSessionId) return;
    
    // For Claude plugin, we need to stop and recreate the session
    try {
      await deleteSession(activeSessionId);
      await createSession();
    } catch (error) {
      console.error('Failed to clear session:', error);
      setError('Failed to clear session');
    }
  };

  // Convert ClaudeSession to AISession for UI compatibility
  const convertToAISession = (session: ClaudeSession): AISession => {
    const sessionMessages = messages.get(session.id) || [];
    
    return {
      id: session.id,
      name: `Claude Session ${new Date(session.createdAt * 1000).toLocaleString()}`,
      providerId: 'claude-cli',
      messages: sessionMessages,
      context: {
        workspace: session.workspacePath
      },
      settings: {},
      createdAt: new Date(session.createdAt * 1000).toISOString(),
      updatedAt: new Date(session.lastActivity * 1000).toISOString()
    };
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const aiSessions = sessions.map(convertToAISession);
  const activeAISession = activeSession ? convertToAISession(activeSession) : null;

  // Add streaming message to the active session's messages
  if (activeAISession && streamingMessageRef.current) {
    const currentMessages = [...activeAISession.messages];
    const lastMessage = currentMessages[currentMessages.length - 1];
    
    if (lastMessage?.status !== AIMessageStatus.Streaming) {
      currentMessages.push(streamingMessageRef.current);
    } else {
      currentMessages[currentMessages.length - 1] = streamingMessageRef.current;
    }
    
    activeAISession.messages = currentMessages;
  }

  if (!isConnected()) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">Claude Events Not Connected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || 'Unable to connect to Claude event stream'}
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
        sessions={aiSessions}
        activeSessionId={activeSessionId || ''}
        onSelectSession={setActiveSessionId}
        onCreateSession={() => createSession()}
        onCloseSession={deleteSession}
        compactMode={compactMode}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Chat Interface */}
      {activeAISession ? (
        <ChatInterface
          session={activeAISession}
          onSendMessage={sendMessage}
          onClearSession={clearSession}
          onRefresh={() => loadMessages(activeSessionId!)}
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

// Helper functions
function convertClaudeMessagesToAIMessages(claudeMessages: ClaudeMessage[]): AIMessage[] {
  return claudeMessages
    .filter(msg => msg.type === 'user' || msg.type === 'assistant')
    .map((msg, index) => {
      const role = msg.type === 'user' ? AIMessageRole.User : AIMessageRole.Assistant;
      const content = msg.message ? extractTextContent(msg.message.content) : '';
      
      return {
        id: `msg-${index}`,
        role,
        content,
        timestamp: new Date().toISOString(), // Claude doesn't provide timestamps
        status: msg.message?.stopReason ? AIMessageStatus.Completed : AIMessageStatus.Pending
      };
    });
}

function extractTextContent(blocks: ContentBlock[]): string {
  return blocks
    .filter(block => block.type === 'text')
    .map(block => block.text || '')
    .join('\n');
}