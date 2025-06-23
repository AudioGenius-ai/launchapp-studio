# @code-pilot/state

A comprehensive state management package for Code Pilot Studio, built with Zustand and designed for optimal developer experience.

## Features

- **Global Application State**: Centralized app state management with loading, error handling, and user preferences
- **Persistence Middleware**: Automatic state persistence with Tauri-native storage fallback
- **Logging Middleware**: Development-friendly state change logging
- **React Provider Integration**: Easy integration with React components
- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **Tauri Optimized**: Native Tauri storage support with localStorage fallback

## Installation

This package is part of the Code Pilot Studio monorepo and uses workspace dependencies:

```bash
pnpm add @code-pilot/state
```

## Basic Usage

### Setting Up the Store Provider

Wrap your app with the `StoreProvider` to initialize the global state:

```tsx
import React from 'react';
import { StoreProvider } from '@code-pilot/state';
import { App } from './App';

function Root() {
  return (
    <StoreProvider
      onStoreInitialized={() => console.log('Store ready!')}
      onStoreError={(error) => console.error('Store error:', error)}
    >
      <App />
    </StoreProvider>
  );
}
```

### Using App State

```tsx
import React from 'react';
import { 
  useAppStore, 
  useAppLoading, 
  useAppPreferences, 
  useAppErrors 
} from '@code-pilot/state';

function MyComponent() {
  // Use specific selectors for optimal performance
  const { isLoading, loadingMessage } = useAppLoading();
  const preferences = useAppPreferences();
  const { errors } = useAppErrors();
  
  // Or access the full store
  const {
    addError,
    updatePreferences,
    setLoading
  } = useAppStore();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme });
  };

  const handleError = () => {
    addError({
      message: 'Something went wrong!',
      severity: 'error'
    });
  };

  return (
    <div>
      {isLoading && <div>Loading: {loadingMessage}</div>}
      <button onClick={() => handleThemeChange('dark')}>
        Switch to Dark Theme
      </button>
      {errors.length > 0 && (
        <div>Errors: {errors.map(e => e.message).join(', ')}</div>
      )}
    </div>
  );
}
```

### Feature Flags

```tsx
import { useAppStore, useAppFeature } from '@code-pilot/state';

function FeatureComponent() {
  const isAiEnabled = useAppFeature('ai');
  const { setFeature } = useAppStore();

  return (
    <div>
      {isAiEnabled ? (
        <AIComponent />
      ) : (
        <button onClick={() => setFeature('ai', true)}>
          Enable AI Features
        </button>
      )}
    </div>
  );
}
```

### Notifications

```tsx
import { useAppStore, useAppNotifications } from '@code-pilot/state';

function NotificationCenter() {
  const notifications = useAppNotifications();
  const { addNotification, removeNotification } = useAppStore();

  const showSuccess = () => {
    addNotification({
      title: 'Success!',
      message: 'Operation completed successfully',
      type: 'success'
    });
  };

  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id} className={`alert-${notification.type}`}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <button onClick={() => removeNotification(notification.id)}>
            Dismiss
          </button>
        </div>
      ))}
      <button onClick={showSuccess}>Show Success</button>
    </div>
  );
}
```

## Advanced Usage

### Custom Store with Persistence

```tsx
import { create } from 'zustand';
import { createPersistedStore } from '@code-pilot/state';

interface MyStore {
  count: number;
  increment: () => void;
}

const useMyStore = create<MyStore>()(
  createPersistedStore(
    'my-store',
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }))
    })
  )
);
```

### Using Middleware

```tsx
import { create } from 'zustand';
import { logger, actionLogger } from '@code-pilot/state';

const useMyStore = create<MyStore>()(
  logger(
    actionLogger('my-store')(
      (set) => ({
        // store implementation
      })
    ),
    {
      enabled: process.env.NODE_ENV === 'development',
      collapsed: true
    }
  )
);
```

### Custom Persistence Configuration

```tsx
import { create } from 'zustand';
import { persist, persistConfigs } from '@code-pilot/state';

// Persist only specific fields
const useMyStore = create<MyStore>()(
  persist(
    (set) => ({ /* store */ }),
    persistConfigs.preferences('my-store', 'userSettings')
  )
);

// Custom serialization for Maps/Sets
const useMapStore = create<MapStore>()(
  persist(
    (set) => ({ /* store */ }),
    persistConfigs.custom(
      'map-store',
      (state) => ({ myMap: Array.from(state.myMap.entries()) }),
      (state) => ({ myMap: new Map(state.myMap) })
    )
  )
);
```

## API Reference

### Stores

#### `useAppStore`
Main application store with global state management.

**State:**
- `isLoading: boolean` - Global loading state
- `loadingMessage?: string` - Loading message
- `isInitialized: boolean` - App initialization status
- `errors: Map<string, AppError>` - Error collection
- `preferences: UserPreferences` - User preferences
- `notifications: Notification[]` - App notifications
- `features: Map<string, boolean>` - Feature flags

**Actions:**
- `setLoading(loading: boolean, message?: string)` - Set loading state
- `addError(error: Omit<AppError, 'id' | 'timestamp' | 'dismissed'>)` - Add error
- `updatePreferences(preferences: Partial<UserPreferences>)` - Update preferences
- `addNotification(notification)` - Add notification
- `setFeature(name: string, enabled: boolean)` - Set feature flag

#### Selector Hooks
- `useAppLoading()` - Loading state
- `useAppErrors()` - Error state
- `useAppPreferences()` - User preferences
- `useAppNotifications()` - Notifications
- `useAppFeature(name: string)` - Specific feature flag
- `useAppSession()` - Session information

### Providers

#### `StoreProvider`
Main provider component for store initialization.

**Props:**
- `children: ReactNode` - Child components
- `onStoreInitialized?: () => void` - Initialization callback
- `onStoreError?: (error: Error) => void` - Error callback

#### `useStoreContext`
Hook to access store context utilities.

#### `useStoreReady`
Hook to check if store is ready before rendering.

### Middleware

#### `logger`
Development logging middleware for state changes.

#### `actionLogger`
Specialized logger for specific store actions.

#### `createPersistedStore`
Helper to create stores with persistence.

#### `persistConfigs`
Pre-configured persistence options:
- `full` - Persist entire state
- `preferences` - Persist only preferences
- `custom` - Custom serialization

### Storage

#### `createTauriStorage`
Creates Tauri-optimized storage adapter with localStorage fallback.

#### `clearPersistedData`
Utility to clear persisted data for a store.

## Best Practices

1. **Use Selector Hooks**: Prefer specific selector hooks over the full store for better performance
2. **Minimize Subscriptions**: Only subscribe to the state slices you actually need
3. **Error Handling**: Always handle errors gracefully using the error management system
4. **Feature Flags**: Use feature flags for conditional functionality
5. **Persistence**: Be selective about what state to persist to avoid performance issues
6. **TypeScript**: Leverage the comprehensive type system for better developer experience

## Storage Locations

### Tauri Environment
- **Location**: `{app_data_dir}/stores/{store_name}.json`
- **Format**: JSON files per store
- **Fallback**: localStorage if Tauri APIs unavailable

### Web Environment
- **Location**: Browser localStorage
- **Format**: JSON strings
- **Namespace**: Store name as key

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Dependencies

- `zustand` - State management library
- `@tauri-apps/api` - Tauri API bindings (optional)
- `@code-pilot/types` - Shared type definitions
- `@code-pilot/utils` - Shared utilities

## License

Private - Part of Code Pilot Studio