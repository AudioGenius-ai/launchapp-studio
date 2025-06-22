# tauri-plugin-terminal

A cross-platform terminal emulator plugin for Code Pilot Studio v2, providing full PTY (pseudo-terminal) support for integrated terminal functionality.

## Overview

This plugin enables full terminal emulation within the IDE, supporting multiple concurrent terminal sessions, shell detection, and real-time input/output streaming. Built with portable-pty for consistent cross-platform behavior.

## Features

- **Multiple Terminals**: Create and manage multiple terminal sessions
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Shell Detection**: Automatically detects available shells
- **Real-time I/O**: Stream terminal output as it happens
- **Terminal Control**: Resize, clear, and control terminals
- **Process Management**: Proper cleanup and resource management
- **ANSI Support**: Full color and escape sequence support

## Installation

This plugin is included as part of Code Pilot Studio v2. No separate installation is required.

## Usage

### TypeScript API

```typescript
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Create a new terminal
const terminalId = await invoke('plugin:terminal|create_terminal', {
    shell: '/bin/bash',
    cwd: '/home/user/project',
    env: {
        CUSTOM_VAR: 'value'
    },
    cols: 80,
    rows: 24
});

// Write to terminal
await invoke('plugin:terminal|write_to_terminal', {
    id: terminalId,
    data: 'ls -la\r' // Note: use \r for Enter key
});

// Resize terminal
await invoke('plugin:terminal|resize_terminal', {
    id: terminalId,
    cols: 120,
    rows: 40
});

// Listen for terminal output
const unlisten = await listen(`terminal-output-${terminalId}`, (event) => {
    const { data } = event.payload;
    console.log('Terminal output:', data);
});

// Kill terminal
await invoke('plugin:terminal|kill_terminal', {
    id: terminalId
});
```

### Frontend Integration Example

```typescript
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// Create xterm.js instance
const term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));

// Create backend terminal
const terminalId = await invoke('plugin:terminal|create_terminal', {
    cols: term.cols,
    rows: term.rows
});

// Connect xterm.js to backend
term.onData((data) => {
    invoke('plugin:terminal|write_to_terminal', {
        id: terminalId,
        data
    });
});

// Listen for output
listen(`terminal-output-${terminalId}`, (event) => {
    term.write(event.payload.data);
});

// Handle resize
term.onResize(({ cols, rows }) => {
    invoke('plugin:terminal|resize_terminal', {
        id: terminalId,
        cols,
        rows
    });
});
```

## Commands Reference

### `create_terminal`
Creates a new terminal session.

**Parameters:**
- `shell` (string, optional): Shell executable path
- `cwd` (string, optional): Working directory
- `env` (object, optional): Environment variables
- `cols` (number, optional): Initial columns (default: 80)
- `rows` (number, optional): Initial rows (default: 24)

**Returns:** `string` (terminal ID)

### `write_to_terminal`
Writes data to a terminal.

**Parameters:**
- `id` (string): Terminal ID
- `data` (string): Data to write (can include ANSI sequences)

**Returns:** `void`

### `resize_terminal`
Resizes a terminal.

**Parameters:**
- `id` (string): Terminal ID
- `cols` (number): New column count
- `rows` (number): New row count

**Returns:** `void`

### `kill_terminal`
Terminates a terminal session.

**Parameters:**
- `id` (string): Terminal ID

**Returns:** `void`

### `handle_terminal_command`
Executes a command in a terminal.

**Parameters:**
- `id` (string): Terminal ID
- `command` (string): Command to execute

**Returns:** `void`

### `get_available_shells`
Gets list of available shells on the system.

**Returns:** `Shell[]`

```typescript
interface Shell {
    path: string;
    name: string;
    args: string[];
}
```

### `get_default_shell`
Gets the system's default shell.

**Returns:** `Shell`

### `list_terminals`
Lists all active terminal sessions.

**Returns:** `TerminalInfo[]`

```typescript
interface TerminalInfo {
    id: string;
    shell: string;
    cwd: string;
    cols: number;
    rows: number;
    created_at: number;
}
```

### `get_terminal`
Gets information about a specific terminal.

**Parameters:**
- `id` (string): Terminal ID

**Returns:** `TerminalInfo`

## Events

### Terminal Output
```typescript
// Event name: terminal-output-{id}
interface TerminalOutputEvent {
    data: string;  // Raw terminal output including ANSI codes
}
```

### Terminal Exit
```typescript
// Event name: terminal-exit-{id}
interface TerminalExitEvent {
    code: number;  // Exit code
}
```

## Shell Detection

The plugin automatically detects available shells:

### Windows
- PowerShell Core (`pwsh.exe`)
- Windows PowerShell (`powershell.exe`)
- Command Prompt (`cmd.exe`)
- Git Bash (if installed)
- WSL shells (if available)

### macOS/Linux
- Default shell from `$SHELL`
- `/bin/bash`
- `/bin/zsh`
- `/bin/fish`
- `/usr/bin/fish`
- Custom shells in PATH

## Terminal Control Sequences

The plugin supports standard terminal control sequences:

```typescript
// Clear screen
await invoke('plugin:terminal|write_to_terminal', {
    id: terminalId,
    data: '\x1b[2J\x1b[H'  // Clear and move cursor to home
});

// Colors
await invoke('plugin:terminal|write_to_terminal', {
    id: terminalId,
    data: '\x1b[31mRed text\x1b[0m\r\n'  // Red text
});

// Cursor movement
await invoke('plugin:terminal|write_to_terminal', {
    id: terminalId,
    data: '\x1b[A'  // Move cursor up
});
```

## Best Practices

### 1. Resource Management
Always kill terminals when done:
```typescript
// In React
useEffect(() => {
    let terminalId;
    
    invoke('plugin:terminal|create_terminal').then(id => {
        terminalId = id;
    });
    
    return () => {
        if (terminalId) {
            invoke('plugin:terminal|kill_terminal', { id: terminalId });
        }
    };
}, []);
```

### 2. Input Handling
Handle special keys properly:
```typescript
const keyMap = {
    Enter: '\r',
    Tab: '\t',
    Backspace: '\x7f',
    Up: '\x1b[A',
    Down: '\x1b[B',
    Right: '\x1b[C',
    Left: '\x1b[D',
    Escape: '\x1b',
};
```

### 3. Output Buffering
Buffer output for performance:
```typescript
let buffer = '';
let flushTimeout;

listen(`terminal-output-${id}`, (event) => {
    buffer += event.payload.data;
    
    clearTimeout(flushTimeout);
    flushTimeout = setTimeout(() => {
        term.write(buffer);
        buffer = '';
    }, 16); // ~60fps
});
```

## Architecture

### Core Components

1. **TerminalManager** (`terminal_manager.rs`)
   - Manages terminal lifecycle
   - Tracks active terminals
   - Handles process spawning

2. **Terminal** (`terminal.rs`)
   - Wraps portable-pty
   - Manages I/O threads
   - Handles resize events

3. **Models** (`models.rs`)
   - Terminal configuration
   - Shell information
   - Event payloads

### Threading Model

Each terminal runs in separate threads:
- **Main thread**: Command handling
- **Reader thread**: PTY output reading
- **Process thread**: Shell process

## Error Handling

Common errors and solutions:

```typescript
try {
    const id = await invoke('plugin:terminal|create_terminal');
} catch (error) {
    if (error.includes('Shell not found')) {
        // Use default shell
        const shell = await invoke('plugin:terminal|get_default_shell');
        const id = await invoke('plugin:terminal|create_terminal', { 
            shell: shell.path 
        });
    }
}
```

## Performance Optimization

1. **Output Throttling**: Large outputs are chunked
2. **Resize Debouncing**: Resize events are debounced
3. **Resource Limits**: Maximum terminal count enforced
4. **Memory Management**: Circular buffers for output

## Platform-Specific Notes

### Windows
- Uses ConPTY for better compatibility
- Supports both legacy and modern terminals
- Unicode support depends on code page

### macOS
- Full Unicode support
- Respects system terminal preferences
- Supports macOS-specific escape sequences

### Linux
- Uses system PTY implementation
- Honors TERM environment variable
- Supports all standard terminal types

## Security Considerations

- Shell paths are validated before execution
- Environment variables are filtered
- No arbitrary command execution without user action
- PTY access is isolated per terminal

## Troubleshooting

### No output from terminal
1. Check shell path is correct
2. Verify event listeners are set up
3. Check for error events

### Garbled output
1. Ensure terminal dimensions match frontend
2. Check character encoding (UTF-8)
3. Verify TERM environment variable

### Terminal not responding
1. Check if process is still alive
2. Try sending interrupt signal (Ctrl+C)
3. Use kill_terminal as last resort

## Development

### Building
```bash
cd apps/desktop
pnpm tauri:build
```

### Testing
```bash
cd plugins/tauri-plugin-terminal
cargo test
```

### Debugging
Enable debug output:
```rust
env_logger::init_from_env(
    env_logger::Env::new().default_filter_or("tauri_plugin_terminal=debug")
);
```

## Future Enhancements

- [ ] Terminal multiplexing (tmux-like)
- [ ] Session recording and playback
- [ ] Terminal sharing/collaboration
- [ ] Custom TERM types
- [ ] Performance profiling
- [ ] GPU-accelerated rendering hints

## License

This plugin is part of Code Pilot Studio v2 and follows the main project's license.