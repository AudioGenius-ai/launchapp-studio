import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  language: string;
  notifications: boolean;
  soundEnabled: boolean;
  panelPositions: {
    explorer: 'left' | 'right' | 'hidden';
    terminal: 'bottom' | 'right' | 'hidden';
    problems: 'bottom' | 'right' | 'hidden';
    output: 'bottom' | 'right' | 'hidden';
  };
  windowLayout: {
    sidebarWidth: number;
    panelHeight: number;
    editorWidth: number;
  };
}

// Application error interface
export interface AppError {
  id: string;
  message: string;
  code?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  context?: Record<string, any>;
  dismissed: boolean;
}

// Application state interface
export interface AppState {
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
  isInitialized: boolean;
  
  // Error states
  errors: Map<string, AppError>;
  globalError?: AppError;
  
  // User preferences
  preferences: UserPreferences;
  
  // Application metadata
  version: string;
  buildInfo?: {
    timestamp: string;
    commit: string;
    branch: string;
  };
  
  // Session information
  sessionId: string;
  startTime: Date;
  
  // Feature flags
  features: Map<string, boolean>;
  
  // Notifications
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    actions?: Array<{
      label: string;
      action: () => void;
    }>;
  }>;
  
  // Application actions
  setLoading: (loading: boolean, message?: string) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Error management
  addError: (error: Omit<AppError, 'id' | 'timestamp' | 'dismissed'>) => string;
  removeError: (errorId: string) => void;
  dismissError: (errorId: string) => void;
  clearErrors: () => void;
  setGlobalError: (error?: AppError) => void;
  
  // Preferences management
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  
  // Feature flags
  setFeature: (name: string, enabled: boolean) => void;
  getFeature: (name: string) => boolean;
  
  // Notifications
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => string;
  markNotificationRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Session management
  resetSession: () => void;
  updateSessionInfo: (info: Partial<Pick<AppState, 'version' | 'buildInfo'>>) => void;
  
  // Utility actions
  reset: () => void;
}

// Default user preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  autoSave: true,
  autoSaveDelay: 1000,
  language: 'en',
  notifications: true,
  soundEnabled: false,
  panelPositions: {
    explorer: 'left',
    terminal: 'bottom',
    problems: 'bottom',
    output: 'bottom'
  },
  windowLayout: {
    sidebarWidth: 240,
    panelHeight: 300,
    editorWidth: 800
  }
};

// Helper function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create the app store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      loadingMessage: undefined,
      isInitialized: false,
      errors: new Map(),
      globalError: undefined,
      preferences: DEFAULT_PREFERENCES,
      version: '0.1.0',
      buildInfo: undefined,
      sessionId: generateId(),
      startTime: new Date(),
      features: new Map(),
      notifications: [],
      
      // Loading management
      setLoading: (loading, message) => {
        set({ isLoading: loading, loadingMessage: message });
      },
      
      setInitialized: (initialized) => {
        set({ isInitialized: initialized });
      },
      
      // Error management
      addError: (errorData) => {
        const error: AppError = {
          ...errorData,
          id: generateId(),
          timestamp: new Date(),
          dismissed: false
        };
        
        set((state) => {
          const newErrors = new Map(state.errors);
          newErrors.set(error.id, error);
          return { errors: newErrors };
        });
        
        return error.id;
      },
      
      removeError: (errorId) => {
        set((state) => {
          const newErrors = new Map(state.errors);
          newErrors.delete(errorId);
          return { errors: newErrors };
        });
      },
      
      dismissError: (errorId) => {
        set((state) => {
          const error = state.errors.get(errorId);
          if (!error) return state;
          
          const newErrors = new Map(state.errors);
          newErrors.set(errorId, { ...error, dismissed: true });
          return { errors: newErrors };
        });
      },
      
      clearErrors: () => {
        set({ errors: new Map() });
      },
      
      setGlobalError: (error) => {
        set({ globalError: error });
      },
      
      // Preferences management
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
            panelPositions: newPreferences.panelPositions ? {
              ...state.preferences.panelPositions,
              ...newPreferences.panelPositions
            } : state.preferences.panelPositions,
            windowLayout: newPreferences.windowLayout ? {
              ...state.preferences.windowLayout,
              ...newPreferences.windowLayout
            } : state.preferences.windowLayout
          }
        }));
      },
      
      resetPreferences: () => {
        set({ preferences: DEFAULT_PREFERENCES });
      },
      
      // Feature flags
      setFeature: (name, enabled) => {
        set((state) => {
          const newFeatures = new Map(state.features);
          newFeatures.set(name, enabled);
          return { features: newFeatures };
        });
      },
      
      getFeature: (name) => {
        return get().features.get(name) ?? false;
      },
      
      // Notifications
      addNotification: (notificationData) => {
        const notification = {
          ...notificationData,
          id: generateId(),
          timestamp: new Date(),
          read: false
        };
        
        set((state) => ({
          notifications: [...state.notifications, notification]
        }));
        
        return notification.id;
      },
      
      markNotificationRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        }));
      },
      
      removeNotification: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
      
      // Session management
      resetSession: () => {
        set({
          sessionId: generateId(),
          startTime: new Date(),
          errors: new Map(),
          globalError: undefined,
          isLoading: false,
          loadingMessage: undefined
        });
      },
      
      updateSessionInfo: (info) => {
        set((state) => ({
          ...state,
          ...info
        }));
      },
      
      // Utility actions
      reset: () => {
        set({
          isLoading: false,
          loadingMessage: undefined,
          isInitialized: false,
          errors: new Map(),
          globalError: undefined,
          preferences: DEFAULT_PREFERENCES,
          sessionId: generateId(),
          startTime: new Date(),
          features: new Map(),
          notifications: []
        });
      }
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist preferences and feature flags
        preferences: state.preferences,
        features: Array.from(state.features.entries()),
        version: state.version,
        buildInfo: state.buildInfo
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert features array back to Map after rehydration
          if (Array.isArray(state.features)) {
            const featuresMap = new Map();
            state.features.forEach(([name, enabled]: [string, boolean]) => {
              featuresMap.set(name, enabled);
            });
            state.features = featuresMap;
          }
          
          // Initialize non-persisted state
          state.errors = new Map();
          state.notifications = [];
          state.isLoading = false;
          state.isInitialized = false;
          state.sessionId = generateId();
          state.startTime = new Date();
        }
      }
    }
  )
);

// Selector hooks for common use cases
export const useAppLoading = () => {
  return useAppStore((state) => ({ 
    isLoading: state.isLoading, 
    loadingMessage: state.loadingMessage 
  }));
};

export const useAppErrors = () => {
  return useAppStore((state) => ({
    errors: Array.from(state.errors.values()),
    globalError: state.globalError
  }));
};

export const useAppPreferences = () => {
  return useAppStore((state) => state.preferences);
};

export const useAppNotifications = () => {
  return useAppStore((state) => state.notifications);
};

export const useAppFeature = (featureName: string) => {
  return useAppStore((state) => state.features.get(featureName) ?? false);
};

export const useAppSession = () => {
  return useAppStore((state) => ({
    sessionId: state.sessionId,
    startTime: state.startTime,
    isInitialized: state.isInitialized
  }));
};