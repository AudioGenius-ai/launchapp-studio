import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AISession,
  AIProvider,
  AIMessage,
  AISessionStatus,
  AIError,
  StreamChunk,
  AIContext,
  CreateSessionOptions,
  UpdateSessionOptions,
  AIPanelSettings
} from '../types';
import { createTauriStorage } from './storageAdapter';

// UI preferences specific to the panel
interface UIPreferences {
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
interface StreamingState {
  sessionId: string;
  messageId: string;
  content: string;
  isComplete: boolean;
  startTime: number;
}

// Store state interface
interface AIStoreState {
  // Sessions
  sessions: Map<string, AISession>;
  activeSessionId: string | null;
  
  // Providers
  providers: Map<string, AIProvider>;
  activeProviderId: string | null;
  
  // Messages (indexed by session ID)
  messagesBySession: Map<string, AIMessage[]>;
  
  // Streaming
  streamingState: StreamingState | null;
  
  // Errors
  errors: Map<string, AIError>;
  
  // UI State
  uiPreferences: UIPreferences;
  panelSettings: AIPanelSettings;
  
  // Context
  globalContext: AIContext | null;
  
  // Actions - Session Management
  createSession: (options: CreateSessionOptions) => AISession;
  deleteSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: UpdateSessionOptions) => void;
  setActiveSession: (sessionId: string | null) => void;
  getSession: (sessionId: string) => AISession | undefined;
  getActiveSession: () => AISession | undefined;
  
  // Actions - Message Management
  addMessage: (sessionId: string, message: AIMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<AIMessage>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  clearMessages: (sessionId: string) => void;
  getMessages: (sessionId: string) => AIMessage[];
  
  // Actions - Streaming
  startStreaming: (sessionId: string, messageId: string) => void;
  updateStreamingContent: (chunk: StreamChunk) => void;
  completeStreaming: () => void;
  cancelStreaming: () => void;
  
  // Actions - Provider Management
  addProvider: (provider: AIProvider) => void;
  updateProvider: (providerId: string, updates: Partial<AIProvider>) => void;
  removeProvider: (providerId: string) => void;
  setActiveProvider: (providerId: string | null) => void;
  getProvider: (providerId: string) => AIProvider | undefined;
  getActiveProvider: () => AIProvider | undefined;
  
  // Actions - Error Management
  setError: (key: string, error: AIError) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  hasError: (key: string) => boolean;
  
  // Actions - UI Preferences
  updateUIPreferences: (preferences: Partial<UIPreferences>) => void;
  updatePanelSettings: (settings: Partial<AIPanelSettings>) => void;
  resetUIPreferences: () => void;
  
  // Actions - Context
  setGlobalContext: (context: AIContext | null) => void;
  updateSessionContext: (sessionId: string, context: AIContext) => void;
  
  // Actions - Utility
  reset: () => void;
  importSessions: (sessions: AISession[]) => void;
  exportSessions: () => AISession[];
  getSessionStats: (sessionId: string) => {
    messageCount: number;
    totalTokens: number;
    lastActive: Date | null;
  };
}

// Default UI preferences
const DEFAULT_UI_PREFERENCES: UIPreferences = {
  panelWidth: 400,
  fontSize: 14,
  showTimestamps: true,
  showTokenCount: true,
  enableMarkdown: true,
  enableSyntaxHighlighting: true,
  autoScroll: true,
  compactMode: false
};

// Default panel settings
const DEFAULT_PANEL_SETTINGS: AIPanelSettings = {
  position: 'right',
  dimensions: {
    width: 400,
    minWidth: 300,
    maxWidth: 800,
    height: 600,
    minHeight: 400
  },
  showOnStartup: false
};

// Helper function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAIStore = create<AIStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: new Map(),
      activeSessionId: null,
      providers: new Map(),
      activeProviderId: null,
      messagesBySession: new Map(),
      streamingState: null,
      errors: new Map(),
      uiPreferences: DEFAULT_UI_PREFERENCES,
      panelSettings: DEFAULT_PANEL_SETTINGS,
      globalContext: null,
      
      // Session Management
      createSession: (options) => {
        const session: AISession = {
          id: generateId(),
          providerId: options.providerId,
          projectId: options.projectId,
          name: options.name || `Session ${new Date().toLocaleString()}`,
          status: AISessionStatus.ACTIVE,
          messages: [],
          context: options.context,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date(),
          metadata: options.settings
        };
        
        set((state) => {
          const newSessions = new Map(state.sessions);
          newSessions.set(session.id, session);
          
          const newMessages = new Map(state.messagesBySession);
          newMessages.set(session.id, []);
          
          return {
            sessions: newSessions,
            messagesBySession: newMessages,
            activeSessionId: session.id
          };
        });
        
        return session;
      },
      
      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = new Map(state.sessions);
          newSessions.delete(sessionId);
          
          const newMessages = new Map(state.messagesBySession);
          newMessages.delete(sessionId);
          
          const newActiveId = state.activeSessionId === sessionId
            ? Array.from(newSessions.keys())[0] || null
            : state.activeSessionId;
          
          return {
            sessions: newSessions,
            messagesBySession: newMessages,
            activeSessionId: newActiveId
          };
        });
      },
      
      updateSession: (sessionId, updates) => {
        set((state) => {
          const session = state.sessions.get(sessionId);
          if (!session) return state;
          
          const updatedSession: AISession = {
            ...session,
            ...updates,
            updatedAt: new Date(),
            lastActiveAt: new Date()
          };
          
          const newSessions = new Map(state.sessions);
          newSessions.set(sessionId, updatedSession);
          
          return { sessions: newSessions };
        });
      },
      
      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
      },
      
      getSession: (sessionId) => {
        return get().sessions.get(sessionId);
      },
      
      getActiveSession: () => {
        const state = get();
        return state.activeSessionId ? state.sessions.get(state.activeSessionId) : undefined;
      },
      
      // Message Management
      addMessage: (sessionId, message) => {
        set((state) => {
          const messages = state.messagesBySession.get(sessionId) || [];
          const newMessages = [...messages, message];
          
          const newMessagesBySession = new Map(state.messagesBySession);
          newMessagesBySession.set(sessionId, newMessages);
          
          // Update session's last active time
          const session = state.sessions.get(sessionId);
          if (session) {
            const newSessions = new Map(state.sessions);
            newSessions.set(sessionId, {
              ...session,
              lastActiveAt: new Date(),
              messages: newMessages
            });
            
            return {
              messagesBySession: newMessagesBySession,
              sessions: newSessions
            };
          }
          
          return { messagesBySession: newMessagesBySession };
        });
      },
      
      updateMessage: (sessionId, messageId, updates) => {
        set((state) => {
          const messages = state.messagesBySession.get(sessionId) || [];
          const newMessages = messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
          
          const newMessagesBySession = new Map(state.messagesBySession);
          newMessagesBySession.set(sessionId, newMessages);
          
          return { messagesBySession: newMessagesBySession };
        });
      },
      
      deleteMessage: (sessionId, messageId) => {
        set((state) => {
          const messages = state.messagesBySession.get(sessionId) || [];
          const newMessages = messages.filter(msg => msg.id !== messageId);
          
          const newMessagesBySession = new Map(state.messagesBySession);
          newMessagesBySession.set(sessionId, newMessages);
          
          return { messagesBySession: newMessagesBySession };
        });
      },
      
      clearMessages: (sessionId) => {
        set((state) => {
          const newMessagesBySession = new Map(state.messagesBySession);
          newMessagesBySession.set(sessionId, []);
          
          return { messagesBySession: newMessagesBySession };
        });
      },
      
      getMessages: (sessionId) => {
        return get().messagesBySession.get(sessionId) || [];
      },
      
      // Streaming Management
      startStreaming: (sessionId, messageId) => {
        set({
          streamingState: {
            sessionId,
            messageId,
            content: '',
            isComplete: false,
            startTime: Date.now()
          }
        });
      },
      
      updateStreamingContent: (chunk) => {
        set((state) => {
          if (!state.streamingState || 
              state.streamingState.sessionId !== chunk.sessionId ||
              state.streamingState.messageId !== chunk.messageId) {
            return state;
          }
          
          return {
            streamingState: {
              ...state.streamingState,
              content: state.streamingState.content + chunk.content,
              isComplete: chunk.isComplete
            }
          };
        });
      },
      
      completeStreaming: () => {
        set({ streamingState: null });
      },
      
      cancelStreaming: () => {
        set({ streamingState: null });
      },
      
      // Provider Management
      addProvider: (provider) => {
        set((state) => {
          const newProviders = new Map(state.providers);
          newProviders.set(provider.id, provider);
          
          return {
            providers: newProviders,
            activeProviderId: state.activeProviderId || provider.id
          };
        });
      },
      
      updateProvider: (providerId, updates) => {
        set((state) => {
          const provider = state.providers.get(providerId);
          if (!provider) return state;
          
          const updatedProvider: AIProvider = {
            ...provider,
            ...updates,
            updatedAt: new Date()
          };
          
          const newProviders = new Map(state.providers);
          newProviders.set(providerId, updatedProvider);
          
          return { providers: newProviders };
        });
      },
      
      removeProvider: (providerId) => {
        set((state) => {
          const newProviders = new Map(state.providers);
          newProviders.delete(providerId);
          
          const newActiveId = state.activeProviderId === providerId
            ? Array.from(newProviders.keys())[0] || null
            : state.activeProviderId;
          
          return {
            providers: newProviders,
            activeProviderId: newActiveId
          };
        });
      },
      
      setActiveProvider: (providerId) => {
        set({ activeProviderId: providerId });
      },
      
      getProvider: (providerId) => {
        return get().providers.get(providerId);
      },
      
      getActiveProvider: () => {
        const state = get();
        return state.activeProviderId ? state.providers.get(state.activeProviderId) : undefined;
      },
      
      // Error Management
      setError: (key, error) => {
        set((state) => {
          const newErrors = new Map(state.errors);
          newErrors.set(key, error);
          return { errors: newErrors };
        });
      },
      
      clearError: (key) => {
        set((state) => {
          const newErrors = new Map(state.errors);
          newErrors.delete(key);
          return { errors: newErrors };
        });
      },
      
      clearAllErrors: () => {
        set({ errors: new Map() });
      },
      
      hasError: (key) => {
        return get().errors.has(key);
      },
      
      // UI Preferences
      updateUIPreferences: (preferences) => {
        set((state) => ({
          uiPreferences: {
            ...state.uiPreferences,
            ...preferences
          }
        }));
      },
      
      updatePanelSettings: (settings) => {
        set((state) => ({
          panelSettings: {
            ...state.panelSettings,
            ...settings,
            dimensions: settings.dimensions ? {
              ...state.panelSettings.dimensions,
              ...settings.dimensions
            } : state.panelSettings.dimensions
          }
        }));
      },
      
      resetUIPreferences: () => {
        set({
          uiPreferences: DEFAULT_UI_PREFERENCES,
          panelSettings: DEFAULT_PANEL_SETTINGS
        });
      },
      
      // Context Management
      setGlobalContext: (context) => {
        set({ globalContext: context });
      },
      
      updateSessionContext: (sessionId, context) => {
        set((state) => {
          const session = state.sessions.get(sessionId);
          if (!session) return state;
          
          const updatedSession: AISession = {
            ...session,
            context,
            updatedAt: new Date()
          };
          
          const newSessions = new Map(state.sessions);
          newSessions.set(sessionId, updatedSession);
          
          return { sessions: newSessions };
        });
      },
      
      // Utility Actions
      reset: () => {
        set({
          sessions: new Map(),
          activeSessionId: null,
          providers: new Map(),
          activeProviderId: null,
          messagesBySession: new Map(),
          streamingState: null,
          errors: new Map(),
          uiPreferences: DEFAULT_UI_PREFERENCES,
          panelSettings: DEFAULT_PANEL_SETTINGS,
          globalContext: null
        });
      },
      
      importSessions: (sessions) => {
        set((state) => {
          const newSessions = new Map(state.sessions);
          const newMessages = new Map(state.messagesBySession);
          
          sessions.forEach(session => {
            newSessions.set(session.id, session);
            newMessages.set(session.id, session.messages || []);
          });
          
          return {
            sessions: newSessions,
            messagesBySession: newMessages
          };
        });
      },
      
      exportSessions: () => {
        return Array.from(get().sessions.values());
      },
      
      getSessionStats: (sessionId) => {
        const state = get();
        const session = state.sessions.get(sessionId);
        const messages = state.messagesBySession.get(sessionId) || [];
        
        const totalTokens = messages.reduce((sum, msg) => 
          sum + (msg.metadata?.tokens || 0), 0
        );
        
        return {
          messageCount: messages.length,
          totalTokens,
          lastActive: session?.lastActiveAt || null
        };
      }
    }),
    {
      name: 'ai-store',
      storage: createJSONStorage(() => createTauriStorage('ai-store')),
      partialize: (state) => ({
        // Only persist certain parts of the state
        uiPreferences: state.uiPreferences,
        panelSettings: state.panelSettings,
        activeProviderId: state.activeProviderId,
        // Convert Maps to arrays for serialization
        sessions: Array.from(state.sessions.values()),
        providers: Array.from(state.providers.values()),
        messagesBySession: Array.from(state.messagesBySession.entries()).map(
          ([sessionId, messages]) => ({ sessionId, messages })
        )
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Maps after rehydration
          if (Array.isArray(state.sessions)) {
            const sessionsMap = new Map();
            state.sessions.forEach((session: AISession) => {
              sessionsMap.set(session.id, session);
            });
            state.sessions = sessionsMap;
          }
          
          if (Array.isArray(state.providers)) {
            const providersMap = new Map();
            state.providers.forEach((provider: AIProvider) => {
              providersMap.set(provider.id, provider);
            });
            state.providers = providersMap;
          }
          
          if (Array.isArray(state.messagesBySession)) {
            const messagesMap = new Map();
            state.messagesBySession.forEach(({ sessionId, messages }: any) => {
              messagesMap.set(sessionId, messages);
            });
            state.messagesBySession = messagesMap;
          }
        }
      }
    }
  )
);

// Selector hooks for common use cases
export const useActiveSession = () => {
  return useAIStore((state) => {
    if (!state.activeSessionId) return null;
    return state.sessions.get(state.activeSessionId);
  });
};

export const useActiveProvider = () => {
  return useAIStore((state) => {
    if (!state.activeProviderId) return null;
    return state.providers.get(state.activeProviderId);
  });
};

export const useSessionMessages = (sessionId: string) => {
  return useAIStore((state) => state.messagesBySession.get(sessionId) || []);
};

export const useStreamingState = () => {
  return useAIStore((state) => state.streamingState);
};

export const useAIErrors = () => {
  return useAIStore((state) => state.errors);
};