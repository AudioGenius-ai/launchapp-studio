# Tauri Plugin Window Manager

Advanced window management plugin for Tauri applications, providing comprehensive control over window lifecycle, positioning, and inter-window communication.

## Features

- **Window Lifecycle Management**: Create, close, and manage multiple windows
- **Window Manipulation**: Position, resize, minimize, maximize windows
- **Inter-Window Messaging**: Send messages between windows
- **Window State Tracking**: Track window states and active window
- **Theme Support**: Light/dark theme management per window
- **Cross-Platform**: Graceful fallbacks for mobile platforms

## Architecture

The plugin uses a service-based architecture:
- `window_service.rs` - Core window management logic
- `models.rs` - Data structures for window configuration and state
- `commands.rs` - Tauri command handlers
- `desktop.rs` / `mobile.rs` - Platform-specific implementations

## Installation

Add the plugin to your `Cargo.toml`:

```toml
[dependencies]
tauri-plugin-window-manager = { path = "../plugins/tauri-plugin-window-manager" }
```

## Usage

### Rust

Register the plugin in your Tauri app:

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_manager::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### JavaScript/TypeScript

```typescript
import { invoke } from '@tauri-apps/api/core';

// Create a new window
const windowInfo = await invoke('plugin:window-manager|create_window', {
  config: {
    label: 'settings',
    title: 'Settings',
    width: 800,
    height: 600,
    center: true,
    theme: 'dark'
  }
});

// List all windows
const windows = await invoke('plugin:window-manager|list_windows');

// Send a message to another window
await invoke('plugin:window-manager|send_message', {
  message: {
    from: 'main',
    to: 'settings',
    messageType: 'update-theme',
    payload: { theme: 'dark' }
  }
});

// Close a window
await invoke('plugin:window-manager|close_window', {
  label: 'settings'
});
```

## API Reference

### Commands

#### Window Lifecycle
- `create_window(config: WindowConfig)` - Create a new window with the specified configuration
- `close_window(label: string)` - Close a window by its label
- `get_window(label: string)` - Get information about a specific window
- `list_windows()` - List all open windows

#### Window Manipulation
- `focus_window(label: string)` - Focus a window
- `minimize_window(label: string)` - Minimize a window
- `maximize_window(label: string)` - Maximize a window
- `unmaximize_window(label: string)` - Restore a maximized window
- `set_window_position(label: string, position: WindowPosition)` - Set window position
- `set_window_size(label: string, size: WindowSize)` - Set window size
- `set_window_title(label: string, title: string)` - Set window title

#### Window Communication
- `send_message(message: WindowMessage)` - Send a message to a specific window
- `broadcast_message(from: string, messageType: string, payload: any)` - Broadcast a message to all windows

#### Window State
- `get_window_state()` - Get the current state of all windows
- `update_window_info(label: string)` - Update window information

### Types

```typescript
interface WindowConfig {
  label: string;
  title?: string;
  url?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  center?: boolean;
  resizable?: boolean;
  maximized?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  decorations?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  visible?: boolean;
  focused?: boolean;
  transparent?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

interface WindowInfo {
  id: string;
  label: string;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  isVisible: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface WindowMessage {
  from: string;
  to: string;
  messageType: string;
  payload: any;
}

interface WindowPosition {
  x: number;
  y: number;
}

interface WindowSize {
  width: number;
  height: number;
}

interface WindowState {
  windows: Record<string, WindowInfo>;
  activeWindow?: string;
  windowOrder: string[];
}
```

## Events

The plugin emits the following events that you can listen to:

- `window-message` - Emitted when a window receives a message

```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('window-message', (event) => {
  console.log('Received message:', event.payload);
});
```

## Permissions

The plugin provides several permission sets:

- `window-manager:default` - All permissions
- `window-manager:window-lifecycle` - Window creation and lifecycle operations
- `window-manager:window-manipulation` - Window positioning and state changes
- `window-manager:window-messaging` - Inter-window communication

Configure permissions in your app's `capabilities/default.json`:

```json
{
  "permissions": [
    "window-manager:default"
  ]
}
```

## Platform Support

- **Desktop (Windows, macOS, Linux)**: Full support for all features
- **Mobile (iOS, Android)**: Limited support with graceful fallbacks
  - Single window only
  - No window positioning or resizing
  - Basic lifecycle operations

## Development

### Building

```bash
cd plugins/tauri-plugin-window-manager
cargo build
```

### Testing

```bash
cargo test
```

### Example

See the `examples/vanilla` directory for a complete example application.

## License

MIT OR Apache-2.0