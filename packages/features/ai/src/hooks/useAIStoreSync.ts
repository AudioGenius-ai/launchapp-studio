import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import {
  AIEvent,
  AIEventPayload,
  AISession,
  AIMessage,
  StreamChunk,
  AIError
} from '@code-pilot/types';
import { useAIStore } from '../stores/aiStore';

/**
 * Hook to sync the AI store with Tauri events
 * This ensures the store stays in sync with backend state changes
 */
export const useAIStoreSync = () => {
  const {
    createSession,
    updateSession,
    deleteSession,
    addMessage,
    updateMessage,
    updateStreamingContent,
    completeStreaming,
    setError,
    clearError
  } = useAIStore();

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    // Helper to setup event listener
    const setupListener = async <T = any>(
      event: AIEvent,
      handler: (payload: AIEventPayload<T>) => void
    ) => {
      const unlisten = await listen<AIEventPayload<T>>(event, (e) => {
        handler(e.payload);
      });
      unlisteners.push(unlisten);
    };

    // Setup all event listeners
    const setupListeners = async () => {
      // Session events
      await setupListener<AISession>(AIEvent.SessionCreated, (payload) => {
        const { data: session } = payload;
        createSession({
          providerId: session.providerId,
          projectId: session.projectId,
          name: session.name,
          context: session.context,
          settings: session.metadata
        });
      });

      await setupListener<AISession>(AIEvent.SessionUpdated, (payload) => {
        const { data: session } = payload;
        updateSession(session.id, {
          name: session.name,
          status: session.status,
          context: session.context,
          metadata: session.metadata
        });
      });

      await setupListener<{ sessionId: string }>(AIEvent.SessionDeleted, (payload) => {
        deleteSession(payload.data.sessionId);
      });

      await setupListener<{ status: string }>(AIEvent.SessionStatusChanged, (payload) => {
        if (payload.sessionId) {
          updateSession(payload.sessionId, { status: payload.data.status as any });
        }
      });

      // Message events
      await setupListener<AIMessage>(AIEvent.MessageSent, (payload) => {
        if (payload.sessionId) {
          addMessage(payload.sessionId, payload.data);
        }
      });

      await setupListener<AIMessage>(AIEvent.MessageReceived, (payload) => {
        if (payload.sessionId) {
          addMessage(payload.sessionId, payload.data);
        }
      });

      await setupListener<StreamChunk>(AIEvent.MessageStreaming, (payload) => {
        updateStreamingContent(payload.data);
      });

      await setupListener<{ messageId: string }>(AIEvent.MessageCompleted, (payload) => {
        completeStreaming();
        if (payload.sessionId && payload.data.messageId) {
          clearError(`message-${payload.data.messageId}`);
        }
      });

      await setupListener<AIError>(AIEvent.MessageError, (payload) => {
        completeStreaming();
        if (payload.sessionId) {
          setError(`session-${payload.sessionId}`, payload.data);
        }
      });

      // Provider events
      await setupListener<{ providerId: string; connected: boolean }>(
        AIEvent.ProviderConnected,
        (payload) => {
          clearError(`provider-${payload.data.providerId}`);
        }
      );

      await setupListener<AIError>(AIEvent.ProviderError, (payload) => {
        if (payload.providerId) {
          setError(`provider-${payload.providerId}`, payload.data);
        }
      });

      // Token events
      await setupListener<{ tokens: number; sessionId: string }>(
        AIEvent.TokensUpdated,
        (payload) => {
          if (payload.sessionId) {
            updateSession(payload.sessionId, {
              metadata: { totalTokens: payload.data.tokens }
            });
          }
        }
      );

      // Context events
      await setupListener(AIEvent.ContextChanged, (payload) => {
        if (payload.sessionId) {
          updateSession(payload.sessionId, { context: payload.data });
        }
      });
    };

    setupListeners();

    // Cleanup
    return () => {
      unlisteners.forEach(unlisten => unlisten());
    };
  }, []);
};

/**
 * Hook to emit AI events from the frontend
 * Useful for notifying other parts of the app about AI state changes
 */
export const useAIEventEmitter = () => {
  const emit = async <T = any>(event: AIEvent, data: T, metadata?: {
    sessionId?: string;
    providerId?: string;
  }) => {
    const { emit: tauriEmit } = await import('@tauri-apps/api/event');
    
    const payload: AIEventPayload<T> = {
      event,
      data,
      timestamp: new Date(),
      ...metadata
    };
    
    await tauriEmit(event, payload);
  };

  return { emit };
};