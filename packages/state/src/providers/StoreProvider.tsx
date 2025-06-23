import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppStore } from '../stores/appStore';

// Store context interface
interface StoreContextValue {
  // You can add additional store-related context methods here
  // For example, store initialization, cleanup, etc.
  initializeStore: () => void;
  resetStore: () => void;
  isStoreReady: boolean;
}

// Create the store context
const StoreContext = createContext<StoreContextValue | null>(null);

// Store provider props
interface StoreProviderProps {
  children: ReactNode;
  onStoreInitialized?: () => void;
  onStoreError?: (error: Error) => void;
}

// Store provider component
export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  onStoreInitialized,
  onStoreError
}) => {
  const [isStoreReady, setIsStoreReady] = React.useState(false);
  
  // Get store actions
  const {
    setInitialized,
    addError,
    updateSessionInfo,
    setFeature
  } = useAppStore();

  // Initialize store
  const initializeStore = React.useCallback(async () => {
    try {
      // Set up default feature flags
      setFeature('terminal', true);
      setFeature('git', true);
      setFeature('ai', true);
      setFeature('themes', true);
      setFeature('projects', true);
      
      // Update build info if available
      if (typeof window !== 'undefined') {
        // You can set build info from environment variables or other sources
        updateSessionInfo({
          version: '0.1.0',
          buildInfo: {
            timestamp: new Date().toISOString(),
            commit: process.env.REACT_APP_GIT_COMMIT || 'unknown',
            branch: process.env.REACT_APP_GIT_BRANCH || 'unknown'
          }
        });
      }
      
      // Mark store as initialized
      setInitialized(true);
      setIsStoreReady(true);
      
      // Notify parent component
      onStoreInitialized?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown store initialization error';
      
      addError({
        message: `Store initialization failed: ${errorMessage}`,
        severity: 'critical',
        context: { error }
      });
      
      onStoreError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [setInitialized, addError, updateSessionInfo, setFeature, onStoreInitialized, onStoreError]);

  // Reset store
  const resetStore = React.useCallback(() => {
    const { reset } = useAppStore.getState();
    reset();
    setIsStoreReady(false);
  }, []);

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Store context value
  const contextValue: StoreContextValue = {
    initializeStore,
    resetStore,
    isStoreReady
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook to use store context
export const useStoreContext = (): StoreContextValue => {
  const context = useContext(StoreContext);
  
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  
  return context;
};

// Higher-order component for store initialization
export const withStoreProvider = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & Partial<StoreProviderProps>>((props, ref) => {
    const { onStoreInitialized, onStoreError, ...componentProps } = props;
    
    return (
      <StoreProvider
        onStoreInitialized={onStoreInitialized}
        onStoreError={onStoreError}
      >
        <Component {...(componentProps as P)} ref={ref} />
      </StoreProvider>
    );
  });
};

// Hook to ensure store is ready before rendering
export const useStoreReady = (options?: {
  fallback?: ReactNode;
  onNotReady?: () => void;
}) => {
  const { isStoreReady } = useStoreContext();
  const { isInitialized } = useAppStore();
  
  const ready = isStoreReady && isInitialized;
  
  React.useEffect(() => {
    if (!ready) {
      options?.onNotReady?.();
    }
  }, [ready, options]);
  
  return {
    isReady: ready,
    fallback: options?.fallback || null
  };
};