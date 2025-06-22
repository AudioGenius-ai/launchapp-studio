# tauri-plugin-mcp-webserver

MCP (Model Context Protocol) server management plugin for Tauri applications. This plugin manages external MCP server processes as sidecars.

## Features

- **Process Management**: Start, stop, and monitor MCP server processes
- **Multiple Instances**: Run multiple MCP servers concurrently
- **Tool Discovery**: Query available tools from each server instance
- **Tool Execution**: Call tools on specific server instances
- **Health Monitoring**: Automatic health checks for running servers
- **Port Management**: Automatic port allocation for each instance
- **TypeScript Bindings**: Type-safe frontend integration

## Installation

Add the plugin to your Tauri app:

```bash
cd src-tauri
cargo add tauri-plugin-mcp-webserver
```

## Usage

### Rust Backend

Register the plugin in your Tauri app:

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_mcp_webserver::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Frontend TypeScript

```typescript
import { McpWebserver } from 'tauri-plugin-mcp-webserver';

// Start a new MCP server instance
const instance = await McpWebserver.startServer({
  name: 'my-mcp-server',
  command: '/path/to/mcp-server',
  args: ['--port', '${MCP_SERVER_PORT}'], // Port will be injected
  env: {
    'API_KEY': 'your-api-key'
  },
  cwd: '/path/to/working/directory'
});

console.log(`Server running on port ${instance.port}`);

// List all running instances
const instances = await McpWebserver.listInstances();

// Get available tools from a server
const tools = await McpWebserver.getTools(instance.id);

// Call a tool
const response = await McpWebserver.callTool({
  instanceId: instance.id,
  toolName: 'read_file',
  arguments: { path: '/path/to/file.txt' }
});

// Stop a server
await McpWebserver.stopServer(instance.id);
```

## Server Configuration

When starting a server, you provide:

- `name`: Human-readable name for the server
- `command`: Path to the MCP server executable
- `args`: Command line arguments (use `${MCP_SERVER_PORT}` for port injection)
- `env`: Optional environment variables
- `cwd`: Optional working directory

The plugin will:
1. Find an available port
2. Set `MCP_SERVER_PORT` environment variable
3. Spawn the process
4. Monitor stdout/stderr
5. Perform health checks

## MCP Server Requirements

Your MCP server should:

1. Listen on the port specified in `MCP_SERVER_PORT` environment variable
2. Implement the MCP protocol endpoints:
   - `POST /mcp` - Main JSON-RPC endpoint
   - `GET /health` - Health check endpoint (optional)
3. Support standard MCP methods:
   - `initialize`
   - `tools/list`
   - `tools/call`

## Example MCP Server

See the original sidecar implementation for a reference MCP server in Rust that works with this plugin.

## Permissions

Add to your capabilities configuration:

```json
{
  "permissions": [
    "mcp-webserver:default"
  ]
}
```

## API

### TypeScript API

- `startServer(config)` - Start a new MCP server instance
- `stopServer(instanceId)` - Stop a running server
- `listInstances()` - List all running instances
- `getInstance(instanceId)` - Get specific instance info
- `callTool(request)` - Execute a tool on a server
- `getTools(instanceId)` - Get available tools from a server

## License

MIT