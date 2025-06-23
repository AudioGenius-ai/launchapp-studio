import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useClaudeSession, ClaudeMessage, ContentBlock } from './useClaudeEvents';
import { AIMessage, AIMessageRole, AIMessageStatus } from '../types';

interface ClaudeSession {
  id: string;
  workspacePath: string;
  logFilePath: string;
  pid?: number;
  createdAt: number;
  status: 'starting' | 'streaming' | 'idle' | 'completed' | 'failed';
  lastActivity: number;
}

export interface UseClaudeSessionManagerOptions {
  sessionId?: string;
  workspacePath?: string;
  autoCreate?: boolean;
}

export interface UseClaudeSessionManagerResult {
  // Session state
  session: ClaudeSession | null;
  messages: AIMessage[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  
  // Session actions
  createSession: (prompt?: string) => Promise<ClaudeSession>;
  sendMessage: (content: string) => Promise<void>;
  stopSession: () => Promise<void>;
  clearMessages: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  
  // Connection state
  isConnected: () => boolean;
  reconnect: () => void;
}

export const useClaudeSessionManager = (
  options: UseClaudeSessionManagerOptions = {}
): UseClaudeSessionManagerResult => {
  const { sessionId: initialSessionId, workspacePath, autoCreate = false } = options;
  
  const [session, setSession] = useState<ClaudeSession | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const streamingMessageRef = useRef<AIMessage | null>(null);
  const messageCountRef = useRef(0);

  // Use Claude events for this specific session
  const { reconnect, isConnected } = useClaudeSession(
    session?.id || '',
    {
      onStatusChange: (_, status) => {
        if (session) {
          setSession(prev => prev ? { ...prev, status: status as any } : null);
        }
        
        if (status === 'streaming') {
          setIsStreaming(true);
        } else if (status === 'idle' || status === 'completed') {
          setIsStreaming(false);
          setStreamingContent('');
          streamingMessageRef.current = null;
        }
      },
      onMessagesUpdate: (_, claudeMessages, newMessageCount) => {
        const aiMessages = convertClaudeMessagesToAIMessages(claudeMessages);
        setMessages(aiMessages);
        
        // Handle streaming updates
        if (claudeMessages.length > messageCountRef.current) {
          messageCountRef.current = claudeMessages.length;
          
          const lastMessage = claudeMessages[claudeMessages.length - 1];
          if (lastMessage.type === 'assistant' && lastMessage.message) {
            const content = extractTextContent(lastMessage.message.content);
            
            if (!lastMessage.message.stopReason) {
              // Still streaming
              setStreamingContent(content);
              
              // Create or update streaming message
              streamingMessageRef.current = {
                id: `streaming-${Date.now()}`,
                role: AIMessageRole.ASSISTANT,
                content,
                timestamp: new Date(),
                status: AIMessageStatus.STREAMING
              };
            } else {
              // Completed
              setStreamingContent('');
              streamingMessageRef.current = null;
            }
          }
        }
      },
      onSessionStopped: () => {
        setSession(null);
        setMessages([]);
        setError('Session was stopped');
      },
      onError: (_, err) => {
        setError(err.message || 'An error occurred');
      }
    }
  );

  // Load initial session if provided
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    } else if (autoCreate && workspacePath) {
      createSession();
    }
  }, [initialSessionId]);

  const loadSession = async (sessionId: string) => {
    try {
      const sessions = await invoke<ClaudeSession[]>('plugin:claude|list_sessions');
      const foundSession = sessions.find(s => s.id === sessionId);
      
      if (foundSession) {
        setSession(foundSession);
        await refreshMessages();
      } else {
        setError('Session not found');
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session');
    }
  };

  const createSession = async (prompt?: string): Promise<ClaudeSession> => {
    if (!workspacePath) {
      throw new Error('Workspace path is required to create a session');
    }

    try {
      setError(null);
      
      const defaultPrompt = `You are Claude, an AI assistant helping with the project at ${workspacePath}. Be helpful, accurate, and concise.`;
      
      const newSession = await invoke<ClaudeSession>('plugin:claude|create_session', {
        workspacePath,
        prompt: prompt || defaultPrompt
      });
      
      setSession(newSession);
      setMessages([]);
      messageCountRef.current = 0;
      
      return newSession;
    } catch (err) {
      console.error('Failed to create session:', err);
      const errorMsg = 'Failed to create Claude session';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!session) {
      throw new Error('No active session');
    }

    try {
      setError(null);
      setIsStreaming(true);
      
      // Add user message immediately
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: AIMessageRole.USER,
        content,
        timestamp: new Date(),
        status: AIMessageStatus.COMPLETE
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      await invoke('plugin:claude|send_input', {
        sessionId: session.id,
        input: content
      });
      
      // Response will come through event listeners
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      setIsStreaming(false);
      throw err;
    }
  };

  const stopSession = async (): Promise<void> => {
    if (!session) return;

    try {
      await invoke('plugin:claude|stop_session', {
        sessionId: session.id
      });
      
      setSession(null);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Failed to stop session:', err);
      setError('Failed to stop session');
    }
  };

  const clearMessages = async (): Promise<void> => {
    // Claude doesn't support clearing messages, so we need to recreate the session
    if (!session || !workspacePath) return;

    try {
      await stopSession();
      await createSession();
    } catch (err) {
      console.error('Failed to clear messages:', err);
      setError('Failed to clear messages');
    }
  };

  const refreshMessages = async (): Promise<void> => {
    if (!session) return;

    try {
      const claudeMessages = await invoke<ClaudeMessage[]>('plugin:claude|get_messages', {
        sessionId: session.id
      });
      
      const aiMessages = convertClaudeMessagesToAIMessages(claudeMessages);
      setMessages(aiMessages);
      messageCountRef.current = claudeMessages.length;
    } catch (err) {
      console.error('Failed to refresh messages:', err);
      setError('Failed to refresh messages');
    }
  };

  // Include streaming message in the messages array
  const allMessages = [...messages];
  if (streamingMessageRef.current) {
    const lastMessage = allMessages[allMessages.length - 1];
    if (lastMessage?.status !== AIMessageStatus.STREAMING) {
      allMessages.push(streamingMessageRef.current);
    } else {
      allMessages[allMessages.length - 1] = streamingMessageRef.current;
    }
  }

  return {
    session,
    messages: allMessages,
    isStreaming,
    streamingContent,
    error,
    createSession,
    sendMessage,
    stopSession,
    clearMessages,
    refreshMessages,
    isConnected,
    reconnect
  };
};

// Helper functions
function convertClaudeMessagesToAIMessages(claudeMessages: ClaudeMessage[]): AIMessage[] {
  return claudeMessages
    .filter(msg => msg.type === 'user' || msg.type === 'assistant')
    .map((msg, index) => {
      const role = msg.type === 'user' ? AIMessageRole.USER : AIMessageRole.ASSISTANT;
      const content = msg.message ? extractTextContent(msg.message.content) : '';
      
      // Extract tool calls if any
      const toolCalls = msg.message?.content
        .filter(block => block.type === 'tool_use')
        .map(block => ({
          id: block.id || '',
          name: block.name || '',
          arguments: block.input,
          input: block.input // For backward compatibility
        }));

      return {
        id: `msg-${index}`,
        role,
        content,
        timestamp: new Date(),
        status: msg.message?.stopReason ? AIMessageStatus.COMPLETE : AIMessageStatus.PENDING,
        toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined
      };
    });
}

function extractTextContent(blocks: ContentBlock[]): string {
  return blocks
    .filter(block => block.type === 'text')
    .map(block => block.text || '')
    .join('\n');
}