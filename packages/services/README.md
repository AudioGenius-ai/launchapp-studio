# @code-pilot/services

Core services package for Code Pilot Studio providing unified APIs for storage, events, window management, and API communication.

## Installation

```bash
pnpm add @code-pilot/services
```

## Services

### AppStorage Service

Wraps Tauri's store API for persistent data storage.

```typescript
import { appStorage } from '@code-pilot/services';

// Set a value
await appStorage.set('settings', 'theme', 'dark');

// Get a value
const theme = await appStorage.get<string>('settings', 'theme');

// Get with default
const theme = await appStorage.getOrDefault('settings', 'theme', 'light');

// Convenience methods for common stores
await appStorage.setSetting('fontSize', 14);
await appStorage.setPreference('autoSave', true);
await appStorage.setCache('lastProject', projectData);
```

### EventBus Service

Application-wide event communication system.

```typescript
import { eventBus } from '@code-pilot/services';

// Subscribe to events
const subscription = eventBus.on('project:opened', (project) => {
  console.log('Project opened:', project);
});

// Subscribe to one-time events
eventBus.once('app:ready', () => {
  console.log('App is ready\!');
});

// Emit events
await eventBus.emit('project:created', newProject);

// Synchronous emit (doesn't wait for async listeners)
eventBus.emitSync('ui:update', data);

// Wait for an event
const result = await eventBus.waitFor('operation:complete', 5000);

// Unsubscribe
subscription.unsubscribe();
```

### Window Service

Multi-window management for Tauri applications.

```typescript
import { windowService } from '@code-pilot/services';

// Create a new window
const window = await windowService.createWindow({
  label: 'settings',
  title: 'Settings',
  width: 800,
  height: 600,
  resizable: true
});

// Window operations
await windowService.focusWindow('settings');
await windowService.minimizeWindow('settings');
await windowService.maximizeWindow('settings');
await windowService.setWindowTitle('settings', 'New Title');

// Get window state
const state = await windowService.getWindowState('settings');

// Close window
await windowService.closeWindow('settings');
```

### API Client

HTTP client for backend communication through Tauri.

```typescript
import { apiClient } from '@code-pilot/services';

// Configure base URL and headers
apiClient.setBaseUrl('https://api.example.com');
apiClient.setAuthToken('your-token');

// Make requests
const response = await apiClient.get<Project[]>('/projects');
const newProject = await apiClient.post('/projects', projectData);
const updated = await apiClient.put('/projects/${id}', updates);
await apiClient.delete('/projects/${id}');
```

## Features

- **Type Safety**: Full TypeScript support with proper type definitions
- **Singleton Patterns**: Consistent service instances across the application
- **Event-Driven**: Loose coupling through the event bus system
- **Error Handling**: Comprehensive error handling and logging
- **Development Support**: Mock implementations for non-Tauri environments
- **Async/Await**: Modern promise-based APIs throughout
EOF < /dev/null