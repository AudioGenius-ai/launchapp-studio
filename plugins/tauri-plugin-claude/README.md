# tauri-plugin-claude

A Tauri plugin that integrates Anthropic's Claude CLI to provide AI-powered coding assistance within Code Pilot Studio v2.

## Overview

This plugin wraps the Claude CLI tool, enabling seamless AI interactions directly from the IDE. It manages Claude sessions, handles process lifecycle, streams responses in real-time, and provides session persistence across app restarts.

## Features

- **Session Management**: Create and manage multiple concurrent Claude sessions
- **Real-time Streaming**: Stream Claude's responses as they're generated
- **Session Recovery**: Automatically recover sessions after app restart
- **Message History**: Retrieve conversation history for any session
- **MCP Tool Discovery**: Discover and list available MCP tools
- **Process Monitoring**: Health checks and orphaned process detection
- **Error Recovery**: Graceful handling of process crashes

## Installation

This plugin is included as part of Code Pilot Studio v2. No separate installation is required.

## Usage

### TypeScript API

```typescript
import { invoke } from '@tauri-apps/api/core';

// Create a new Claude session
const session = await invoke('plugin:claude|create_session', {
    workspacePath: '/path/to/workspace',
    instructions: 'You are a helpful coding assistant'
});

// Send input to Claude
await invoke('plugin:claude|send_input', {
    sessionId: session.id,
    input: 'Help me refactor this function'
});

// List all sessions
const sessions = await invoke('plugin:claude|list_sessions');

// Get message history
const messages = await invoke('plugin:claude|get_messages', {
    sessionId: session.id
});

// Stop a session
await invoke('plugin:claude|stop_session', {
    sessionId: session.id
});

// Recover sessions on app start
await invoke('plugin:claude|recover_sessions');

// Get available MCP tools
const tools = await invoke('plugin:claude|get_mcp_tools', {
    sessionId: session.id
});
```

### Data Types

```typescript
interface ClaudeSession {
    id: string;
    workspace_path: string;
    instructions?: string;
    created_at: number;
    log_file_path: string;
    status: 'active' | 'stopped' | 'error';
}

interface ClaudeMessage {
    timestamp: number;
    content: string;
    is_assistant: boolean;
}

interface McpTool {
    name: string;
    description: string;
    input_schema: any;
}
```

## Commands

### `create_session`
Creates a new Claude session with the specified workspace and optional instructions.

**Parameters:**
- `workspacePath` (string): Path to the workspace directory
- `instructions` (string, optional): Custom instructions for Claude

**Returns:** `ClaudeSession`

### `send_input`
Sends input to an active Claude session.

**Parameters:**
- `sessionId` (string): The session ID
- `input` (string): The input text to send

**Returns:** `void`

### `list_sessions`
Lists all active Claude sessions.

**Returns:** `ClaudeSession[]`

### `stop_session`
Stops a Claude session and cleans up resources.

**Parameters:**
- `sessionId` (string): The session ID to stop

**Returns:** `void`

### `recover_sessions`
Recovers Claude sessions from the previous app run.

**Returns:** `ClaudeSession[]`

### `get_messages`
Retrieves the message history for a session.

**Parameters:**
- `sessionId` (string): The session ID

**Returns:** `ClaudeMessage[]`

### `get_mcp_tools`
Gets the list of available MCP tools for a session.

**Parameters:**
- `sessionId` (string): The session ID

**Returns:** `McpTool[]`

## Events

The plugin emits events for real-time updates:

```typescript
import { listen } from '@tauri-apps/api/event';

// Listen for Claude output
const unlisten = await listen('claude-output', (event) => {
    const { sessionId, content, isAssistant } = event.payload;
    console.log(`Claude ${sessionId}: ${content}`);
});

// Listen for session status changes
const unlistenStatus = await listen('claude-status', (event) => {
    const { sessionId, status } = event.payload;
    console.log(`Session ${sessionId} status: ${status}`);
});
```

## Architecture

### Core Components

1. **ClaudeService** (`claude_service.rs`)
   - Manages Claude CLI processes
   - Handles input/output streaming
   - Implements dual output capture (tee + file watching)

2. **SessionManager** (`session_manager.rs`)
   - Tracks active sessions
   - Persists session state to disk
   - Handles session recovery

3. **ProcessManager** (`process_manager.rs`)
   - Spawns and monitors Claude processes
   - Implements health checks
   - Detects orphaned processes

4. **Models** (`models.rs`)
   - Defines data structures
   - Handles serialization/deserialization

### Process Management

The plugin uses a sophisticated process management approach:

1. **Dual Output Capture**: Uses `tee` to simultaneously display output and save to log file
2. **File Watching**: Monitors log files for real-time updates
3. **Health Monitoring**: Regular health checks ensure processes are responsive
4. **Graceful Shutdown**: Proper cleanup of resources on session stop

### State Persistence

Sessions are persisted to:
- **Windows**: `%APPDATA%/com.codepilot.studio/claude_sessions.json`
- **macOS**: `~/Library/Application Support/com.codepilot.studio/claude_sessions.json`
- **Linux**: `~/.config/com.codepilot.studio/claude_sessions.json`

## Configuration

The plugin respects the Claude CLI's configuration:
- MCP settings in `claude_desktop_config.json`
- API keys from environment variables
- Custom model selection

## Error Handling

The plugin provides detailed error messages for common issues:
- Claude CLI not found
- Invalid workspace paths
- Process spawn failures
- Session not found
- Recovery failures

## Development

### Building

The plugin is built as part of the main app:

```bash
cd apps/desktop
pnpm tauri:build
```

### Testing

Run the plugin tests:

```bash
cd plugins/tauri-plugin-claude
cargo test
```

### Debugging

Enable debug logging:

```rust
env_logger::init_from_env(
    env_logger::Env::new().default_filter_or("tauri_plugin_claude=debug")
);
```

## Security

- All file paths are validated and sanitized
- Process spawning is restricted to Claude CLI only
- No arbitrary command execution
- Session data is stored in user-specific directories

## Performance Considerations

- Log files are read incrementally to avoid memory issues
- File watching uses efficient OS-level APIs
- Process health checks are throttled
- Large message histories are paginated

## Troubleshooting

### Claude CLI not found
Ensure Claude CLI is installed and accessible in PATH:
```bash
claude --version
```

### Sessions not recovering
Check the session persistence file exists and has proper permissions.

### No output from Claude
1. Check the log file is being created
2. Verify Claude CLI works standalone
3. Check for process crashes in system logs

## Future Enhancements

- [ ] Streaming token usage statistics
- [ ] Model selection per session
- [ ] Session templates
- [ ] Export/import conversations
- [ ] Multi-turn conversation branching

## License

This plugin is part of Code Pilot Studio v2 and follows the main project's license.