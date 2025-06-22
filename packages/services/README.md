# @code-pilot/services

Shared service implementations for Code Pilot Studio.

## Services

### API Client

A robust HTTP client with retry logic, timeout support, and error handling.

```typescript
import { ApiClient } from '@code-pilot/services';

const client = new ApiClient({
  baseUrl: 'https://api.example.com',
  timeout: 30000,
  retries: 3,
  defaultHeaders: {
    'Authorization': 'Bearer token'
  }
});

// GET request
const data = await client.get('/users');

// POST request
const user = await client.post('/users', { name: 'John' });

// Upload file
const formData = new FormData();
formData.append('file', file);
const result = await client.upload('/upload', formData);
```

### Storage Service

Abstract storage service with multiple adapters and TTL support.

```typescript
import { StorageService, LocalStorageAdapter } from '@code-pilot/services';

const storage = new StorageService({
  prefix: 'myapp:',
  adapter: new LocalStorageAdapter(),
  ttl: 3600000 // 1 hour default TTL
});

// Set value with TTL
await storage.set('user', { id: 1, name: 'John' }, 3600000);

// Get value
const user = await storage.get('user');

// Create namespaced storage
const sessionStorage = storage.namespace('session');
await sessionStorage.set('token', 'abc123');
```

### Event Bus

Global event bus for application-wide communication.

```typescript
import { globalEventBus, createEventBus } from '@code-pilot/services';

// Subscribe to events
const unsubscribe = globalEventBus.on('user:login', (data) => {
  console.log('User logged in:', data);
});

// Emit events
await globalEventBus.emit('user:login', { userId: 123 });

// Create namespaced event bus
const editorEvents = globalEventBus.namespace('editor');
editorEvents.on('save', () => console.log('Editor saved'));

// Wildcard listeners
globalEventBus.onAny((data) => {
  console.log('Any event:', data);
});

// Cleanup
unsubscribe();
```

### Window Service

Abstract window management service for desktop applications.

```typescript
import { WindowService, MockWindowService } from '@code-pilot/services';

const windowService = new MockWindowService();

// Create new window
const windowId = await windowService.create('/editor', {
  title: 'Code Editor',
  width: 1200,
  height: 800,
  center: true
});

// Window operations
await windowService.maximize();
await windowService.setTitle('New Title');
await windowService.setSize(1400, 900);

// Window state
const isMaximized = await windowService.isMaximized();
const size = await windowService.getSize();
const position = await windowService.getPosition();

// Events
const cleanup = windowService.onResize((id, size) => {
  console.log(`Window ${id} resized to`, size);
});
```

## Development

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm typecheck
```