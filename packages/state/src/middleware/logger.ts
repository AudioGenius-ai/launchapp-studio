import { StateCreator, StoreMutatorIdentifier } from 'zustand';

// Logger middleware options
interface LoggerOptions {
  enabled?: boolean;
  collapsed?: boolean;
  colors?: {
    prevState?: string;
    action?: string;
    nextState?: string;
    error?: string;
  };
  filter?: (action: string) => boolean;
  transform?: (state: any) => any;
}

// Default logger options
const DEFAULT_OPTIONS: Required<LoggerOptions> = {
  enabled: process.env.NODE_ENV === 'development',
  collapsed: false,
  colors: {
    prevState: '#9E9E9E',
    action: '#03A9F4',
    nextState: '#4CAF50',
    error: '#F20404'
  },
  filter: () => true,
  transform: (state) => state
};

// Logger type definition
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  options?: LoggerOptions
) => StateCreator<T, Mps, Mcs>

// Logger implementation
type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  options?: LoggerOptions
) => StateCreator<T, [], []>

const loggerImpl: LoggerImpl = (config, options = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return (set, get, store) => {
    const loggedSet: typeof set = (...args) => {
      if (!opts.enabled) {
        set(...(args as Parameters<typeof set>));
        return;
      }
      
      const prevState = get();
      set(...(args as Parameters<typeof set>));
      const nextState = get();
      
      // Create action name from call stack if possible
      const actionName = 'State Update';
      
      if (opts.filter(actionName)) {
        const groupName = `🏪 ${actionName} @ ${new Date().toLocaleTimeString()}`;
        
        if (opts.collapsed) {
          console.groupCollapsed(groupName);
        } else {
          console.group(groupName);
        }
        
        console.log(
          '%c prev state',
          `color: ${opts.colors.prevState}; font-weight: bold`,
          opts.transform(prevState)
        );
        
        console.log(
          '%c action',
          `color: ${opts.colors.action}; font-weight: bold`,
          actionName
        );
        
        console.log(
          '%c next state',
          `color: ${opts.colors.nextState}; font-weight: bold`,
          opts.transform(nextState)
        );
        
        console.groupEnd();
      }
    };
    
    // Also log store.setState calls
    const originalSetState = store.setState;
    store.setState = (...args) => {
      if (opts.enabled) {
        const prevState = store.getState();
        originalSetState(...(args as Parameters<typeof originalSetState>));
        const nextState = store.getState();
        
        const actionName = 'Direct setState';
        
        if (opts.filter(actionName)) {
          const groupName = `🏪 ${actionName} @ ${new Date().toLocaleTimeString()}`;
          
          if (opts.collapsed) {
            console.groupCollapsed(groupName);
          } else {
            console.group(groupName);
          }
          
          console.log(
            '%c prev state',
            `color: ${opts.colors.prevState}; font-weight: bold`,
            opts.transform(prevState)
          );
          
          console.log(
            '%c action',
            `color: ${opts.colors.action}; font-weight: bold`,
            actionName
          );
          
          console.log(
            '%c next state',
            `color: ${opts.colors.nextState}; font-weight: bold`,
            opts.transform(nextState)
          );
          
          console.groupEnd();
        }
      } else {
        originalSetState(...(args as Parameters<typeof originalSetState>));
      }
    };
    
    return config(loggedSet, get, store);
  };
};

// Export the logger with proper typing
export const logger = loggerImpl as unknown as Logger;

// Action logger for specific store actions
export const actionLogger = (storeName: string) => {
  return <T>(config: StateCreator<T>): StateCreator<T> => {
    return logger(config, {
      enabled: process.env.NODE_ENV === 'development',
      collapsed: true,
      filter: (action) => !action.includes('@@'),
      transform: (state) => {
        // Only log relevant parts of state for the specific store
        if (storeName === 'app') {
          return {
            isLoading: (state as any).isLoading,
            errors: (state as any).errors?.size || 0,
            preferences: (state as any).preferences,
            notifications: (state as any).notifications?.length || 0
          };
        }
        return state;
      }
    });
  };
};