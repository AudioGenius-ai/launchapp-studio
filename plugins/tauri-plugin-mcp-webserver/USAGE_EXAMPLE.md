# MCP Webserver Plugin Usage Example

This plugin manages MCP (Model Context Protocol) server processes. Here's a complete example showing how to use it with both bundled sidecars and external MCP servers.

## Setup

### 1. Build the MCP Server Sidecar

First, build the MCP server that will be bundled with your app:

```bash
cd apps/desktop/src-tauri
./build-sidecars.sh
```

This creates `binaries/launchapp-mcp-sidecar-{target-triple}`.

### 2. Configure Tauri

In `apps/desktop/src-tauri/tauri.conf.json`, the sidecar is already configured:

```json
{
  "bundle": {
    "externalBin": [
      "binaries/launchapp-mcp-sidecar"
    ]
  }
}
```

### 3. Add Plugin to Main App

In `apps/desktop/src-tauri/src/lib.rs`:

```rust
use tauri_plugin_shell::init as shell_init;
use tauri_plugin_mcp_webserver::init as mcp_init;

pub fn run() {
    tauri::Builder::default()
        .plugin(shell_init()) // Required for process management
        .plugin(mcp_init())   // MCP server management
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 4. Add Shell Permission

In `apps/desktop/src-tauri/capabilities/default.json`:

```json
{
  "permissions": [
    "mcp-webserver:default",
    "shell:allow-execute",
    {
      "identifier": "shell:allow-execute",
      "allow": [
        {
          "name": "launchapp-mcp-sidecar",
          "sidecar": true
        }
      ]
    }
  ]
}
```

## Frontend Usage

### Start the Bundled MCP Server

```typescript
import { McpWebserver } from '@codepilot/tauri-plugin-mcp-webserver';

// Start the bundled MCP server
const instance = await McpWebserver.startServer({
  name: 'Code Pilot MCP Server',
  command: 'launchapp-mcp-sidecar', // This uses the bundled sidecar
  args: [],
  env: {
    'RUST_LOG': 'info'
  }
});

console.log(`MCP server started on port ${instance.port}`);
```

### Start an External MCP Server

```typescript
// Start an external MCP server (e.g., Python-based)
const pythonServer = await McpWebserver.startServer({
  name: 'Python MCP Server',
  command: '/usr/bin/python3',
  args: ['/path/to/mcp_server.py', '--port', '${MCP_SERVER_PORT}'],
  env: {
    'PYTHONUNBUFFERED': '1'
  },
  cwd: '/path/to/project'
});
```

### Use the MCP Server

```typescript
// Get available tools
const tools = await McpWebserver.getTools(instance.id);
console.log('Available tools:', tools);

// Call a tool
const result = await McpWebserver.callTool({
  instanceId: instance.id,
  toolName: 'read_file',
  arguments: {
    path: '/path/to/file.txt'
  }
});

// Handle the response
result.content.forEach(item => {
  if (item.type === 'text') {
    console.log('File content:', item.text);
  } else if (item.type === 'error') {
    console.error('Error:', item.error);
  }
});

// List all running instances
const instances = await McpWebserver.listInstances();

// Stop the server when done
await McpWebserver.stopServer(instance.id);
```

## React Component Example

```tsx
import { useState, useEffect } from 'react';
import { McpWebserver, McpServerInstance, McpToolInfo } from '@codepilot/tauri-plugin-mcp-webserver';

export function McpServerManager() {
  const [instances, setInstances] = useState<McpServerInstance[]>([]);
  const [tools, setTools] = useState<McpToolInfo[]>([]);
  
  useEffect(() => {
    loadInstances();
  }, []);
  
  const loadInstances = async () => {
    const list = await McpWebserver.listInstances();
    setInstances(list);
  };
  
  const startServer = async () => {
    try {
      const instance = await McpWebserver.startServer({
        name: 'Code Pilot MCP',
        command: 'launchapp-mcp-sidecar',
        args: []
      });
      
      await loadInstances();
      
      // Load tools for the new instance
      const toolList = await McpWebserver.getTools(instance.id);
      setTools(toolList);
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  };
  
  const stopServer = async (instanceId: string) => {
    await McpWebserver.stopServer(instanceId);
    await loadInstances();
  };
  
  return (
    <div>
      <button onClick={startServer}>Start MCP Server</button>
      
      <h3>Running Instances</h3>
      {instances.map(instance => (
        <div key={instance.id}>
          <p>{instance.name} - Port: {instance.port} - Status: {
            typeof instance.status === 'string' ? instance.status : 'error'
          }</p>
          <button onClick={() => stopServer(instance.id)}>Stop</button>
        </div>
      ))}
      
      <h3>Available Tools</h3>
      {tools.map(tool => (
        <div key={tool.name}>
          <h4>{tool.name}</h4>
          <p>{tool.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## MCP Server Implementation

The bundled MCP server (`apps/desktop/src-tauri/binaries/mcp-server/`) implements:

- JSON-RPC 2.0 protocol
- Tool discovery and execution
- Health check endpoint
- SSE for real-time updates
- CORS support

The server automatically binds to the port specified in the `MCP_SERVER_PORT` environment variable.