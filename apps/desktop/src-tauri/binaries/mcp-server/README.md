# Code Pilot MCP Sidecar (Rust)

This is the Rust implementation of the MCP (Model Context Protocol) sidecar server for Code Pilot Studio.

## Overview

The sidecar server provides:
- MCP protocol support for AI assistants
- Dynamic port allocation
- Health check endpoint
- SSE (Server-Sent Events) for real-time updates
- Minimal binary size (~800KB)

## Building

### Development Build
```bash
cargo build
```

### Release Build (Optimized for size)
```bash
cargo build --release
```

### Build for Tauri
From the project root:
```bash
pnpm build:sidecar
```

This will:
1. Build the release binary
2. Copy it to `src-tauri/binaries/` with the correct platform-specific name

## Architecture

The server uses:
- **Axum**: High-performance web framework
- **Tokio**: Async runtime
- **Tower**: Middleware (CORS support)
- **Portpicker**: Dynamic port allocation

## Endpoints

- `GET /health` - Health check endpoint
- `POST /mcp` - MCP request handler
- `GET /mcp/sse/:session_id` - SSE stream for session
- `POST /tauri-bridge/:method` - Bridge for Tauri IPC

## Configuration

The server automatically:
- Finds an available port
- Writes the port to `.sidecar-port` file
- Removes the port file after reading (for security)

## Integration with Tauri

The sidecar is automatically started by the `SidecarService` when needed. It's bundled with the Tauri app as an external binary.