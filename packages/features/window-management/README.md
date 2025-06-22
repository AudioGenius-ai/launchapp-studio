# @code-pilot/feature-window-management

Window management feature package for Code Pilot Studio IDE. Provides comprehensive window controls, multi-window management, and window state persistence.

## Features

- **Window Controls**: Minimize, maximize, close, pin, and fullscreen controls
- **Multi-Window Management**: Create, manage, and switch between multiple windows
- **Window State Tracking**: Real-time window state monitoring and updates
- **Window Persistence**: Save and restore window positions and sizes
- **Customizable UI Components**: Title bars, status bars, and window lists
- **Responsive Layouts**: Grid and list view modes for window management

## Installation

```bash
pnpm add @code-pilot/feature-window-management
```

## Usage

### Basic Window Controls

```tsx
import { WindowControls, WindowTitleBar } from '@code-pilot/feature-window-management';

function App() {
  return (
    <div>
      <WindowTitleBar 
        title="My Application"
        showPin={true}
      />
      {/* Your app content */}
    </div>
  );
}
```

### Window Hooks

```tsx
import { useWindow, useWindowState } from '@code-pilot/feature-window-management';

function MyComponent() {
  const { minimize, maximize, close, toggleFullscreen } = useWindow();
  const windowState = useWindowState();
  
  return (
    <div>
      <p>Window is {windowState?.isMaximized ? 'maximized' : 'normal'}</p>
      <button onClick={toggleFullscreen}>Toggle Fullscreen</button>
    </div>
  );
}
```

### Multi-Window Management

```tsx
import { WindowManager, useMultiWindow } from '@code-pilot/feature-window-management';

function WindowsPanel() {
  const { createWindow, windows } = useMultiWindow();
  
  const handleCreateWindow = async () => {
    await createWindow('new-window', {
      title: 'New Window',
      width: 800,
      height: 600,
      center: true,
    });
  };
  
  return (
    <WindowManager 
      viewMode="grid"
      onCreateWindow={handleCreateWindow}
    />
  );
}
```

### Window Status Bar

```tsx
import { WindowStatusBar } from '@code-pilot/feature-window-management';

function StatusBar() {
  return (
    <WindowStatusBar 
      showPosition={true}
      showSize={true}
      showState={true}
    />
  );
}
```

## Components

### WindowControls
Individual window control buttons (minimize, maximize, close, pin).

### WindowTitleBar
Complete title bar with title, icon, and window controls.

### WindowManager
Multi-window management interface with grid/list views.

### WindowListItem
Individual window item display in the window manager.

### WindowStatusBar
Status bar showing window state, position, and size.

## Hooks

### useWindow
Primary hook for window operations and state.

### useWindowState
Hook for tracking window state changes.

### useMultiWindow
Hook for managing multiple windows.

### useWindowResize
Hook for handling window resize and position changes.

## Services

### windowService
Singleton service for all window operations, wrapping the core windowManager.

## Types

- `WindowState`: Current window state (maximized, minimized, etc.)
- `WindowConfig`: Window creation configuration
- `WindowInfo`: Complete window information
- `WindowEvent`: Window lifecycle events
- `MultiWindowState`: State for multiple windows

## License

MIT