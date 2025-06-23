# @code-pilot/router

React Router configuration and utilities for Code Pilot Studio.

## Features

- **Route Configuration**: Centralized route definitions with metadata
- **Authentication Guards**: Route protection with authentication checks
- **Layout Management**: Different layout options (default, minimal, fullscreen)
- **History Utilities**: Programmatic navigation and history management
- **Breadcrumb Generation**: Automatic breadcrumb creation from routes
- **TypeScript Support**: Full type safety for routes and navigation

## Installation

```bash
pnpm install @code-pilot/router
```

## Usage

### Basic Setup

```tsx
import { AppRouter } from '@code-pilot/router';

function App() {
  return <AppRouter />;
}
```

### Route Configuration

Routes are defined in `src/routes/index.ts` with metadata:

```typescript
export const routes: AppRouteObject[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'),
  },
  // ... more routes
];
```

### Navigation Hook

```tsx
import { useAppNavigation } from '@code-pilot/router';

function MyComponent() {
  const { currentPath, currentRoute, navigateTo } = useAppNavigation();
  
  const handleNavigate = () => {
    navigateTo('/projects');
  };
  
  return (
    <div>
      <p>Current path: {currentPath}</p>
      <button onClick={handleNavigate}>Go to Projects</button>
    </div>
  );
}
```

### Route Guards

```tsx
import { AuthGuard } from '@code-pilot/router';

function ProtectedComponent({ children }) {
  return (
    <AuthGuard requiresAuth={true} redirectTo="/login">
      {children}
    </AuthGuard>
  );
}
```

### History Utilities

```typescript
import { 
  navigateTo, 
  navigateBack, 
  getCurrentPath,
  generateBreadcrumbs 
} from '@code-pilot/router';

// Programmatic navigation
navigateTo('/projects/123');
navigateBack();

// Get current path
const path = getCurrentPath();

// Generate breadcrumbs
const breadcrumbs = generateBreadcrumbs('/projects/123/files');
```

## Route Structure

Each route supports the following properties:

- `path`: Route path pattern
- `title`: Page title for document.title
- `requiresAuth`: Whether authentication is required
- `layout`: Layout type ('default' | 'minimal' | 'fullscreen')
- `sidebar`: Whether to show sidebar
- `lazy`: Lazy-loaded component

## Layouts

- **Default**: Standard layout with optional sidebar
- **Minimal**: Simple container layout
- **Fullscreen**: Full viewport layout for editor

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type checking
pnpm typecheck
```