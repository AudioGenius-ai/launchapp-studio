# VSCode Extension Host Plugin - Implementation Plan

## Overview

The `tauri-plugin-vscode-host` enables Code Pilot Studio to run VSCode extensions by providing a compatible extension host environment. This plugin manages isolated Node.js processes that can load and execute VSCode extensions, handle Language Server Protocol (LSP) communications, and provide a bridge between extensions and our IDE.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Code Pilot Studio (Tauri)                   │
├─────────────────────────────────────────────────────────────────┤
│                   tauri-plugin-vscode-host                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Extension Host Manager                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Host #1   │  │   Host #2   │  │   Host #3   │     │   │
│  │  │ (Project A) │  │ (Project B) │  │ (Project C) │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Language Server Manager                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │TypeScript LS│  │   Rust LS   │  │  Python LS  │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          Extension Marketplace & Registry                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Extension Host Manager (`src/extension_host/`)

**Purpose**: Manages lifecycle of extension host processes

**Key Files**:
- `manager.rs` - Central manager for all extension hosts
- `process.rs` - Process spawning and management
- `protocol.rs` - JSON-RPC protocol implementation
- `api_bridge.rs` - VSCode API compatibility layer

**Responsibilities**:
- Spawn Node.js processes for each workspace
- Handle IPC communication with extension hosts
- Manage extension loading and activation
- Monitor resource usage and enforce limits
- Handle process crashes and restarts

### 2. Language Server Manager (`src/language_server/`)

**Purpose**: Manages LSP servers for code intelligence features

**Key Files**:
- `client.rs` - LSP client implementation
- `server_manager.rs` - Manages multiple language servers
- `protocol.rs` - LSP protocol handling

**Responsibilities**:
- Start/stop language servers based on file types
- Route LSP messages between editor and servers
- Handle server initialization and capabilities negotiation
- Manage document synchronization
- Cache and optimize LSP responses

### 3. Extension Marketplace (`src/extension_marketplace/`)

**Purpose**: Handle extension discovery, installation, and updates

**Key Files**:
- `registry.rs` - Interface with extension registries
- `installer.rs` - Extension download and installation
- `updater.rs` - Extension update management

**Responsibilities**:
- Query Open VSX registry for extensions
- Download and validate extension packages
- Install extensions to appropriate directories
- Manage extension versions and updates
- Handle extension dependencies

### 4. VSCode API Implementation (`extension-host-runtime/`)

**Purpose**: Provide VSCode-compatible API for extensions

**Key Components**:
- `vscode` namespace implementation
- Extension activation/deactivation
- Event emitters and disposables
- Configuration management
- File system access
- Debug adapter protocol support

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)

#### 1.1 Basic Process Management
- [ ] Create extension host process spawner
- [ ] Implement IPC channel using stdin/stdout
- [ ] Add process lifecycle management (start, stop, restart)
- [ ] Implement health monitoring and auto-restart
- [ ] Add resource usage tracking

#### 1.2 Extension Host Runtime
- [ ] Create Node.js entry point for extension host
- [ ] Implement extension loader
- [ ] Add basic VSCode API shim
- [ ] Setup module resolution for extensions
- [ ] Implement activation event handling

#### 1.3 Basic Commands
- [ ] `create_extension_host` - Create new host instance
- [ ] `stop_extension_host` - Stop host instance
- [ ] `list_extension_hosts` - List all active hosts
- [ ] `get_extension_host_info` - Get host details

### Phase 2: VSCode API Implementation (Week 3-4)

#### 2.1 Core API Namespaces
- [ ] `vscode.window` - UI interactions
  - [ ] showInformationMessage
  - [ ] showErrorMessage
  - [ ] createOutputChannel
  - [ ] createTerminal
  - [ ] createWebviewPanel
- [ ] `vscode.workspace` - Workspace management
  - [ ] getConfiguration
  - [ ] onDidChangeConfiguration
  - [ ] findFiles
  - [ ] openTextDocument
  - [ ] onDidChangeTextDocument
- [ ] `vscode.commands` - Command management
  - [ ] registerCommand
  - [ ] executeCommand
  - [ ] getCommands
- [ ] `vscode.languages` - Language features
  - [ ] registerCompletionItemProvider
  - [ ] registerHoverProvider
  - [ ] registerDefinitionProvider
  - [ ] setDiagnostics

#### 2.2 Extension Communication
- [ ] Implement message router for API calls
- [ ] Add event subscription system
- [ ] Handle async API responses
- [ ] Implement disposable pattern
- [ ] Add error handling and logging

### Phase 3: Language Server Protocol (Week 5-6)

#### 3.1 LSP Client Implementation
- [ ] Implement LSP transport (stdio, TCP, IPC)
- [ ] Add message framing and encoding
- [ ] Handle request/response/notification routing
- [ ] Implement client capabilities
- [ ] Add request cancellation support

#### 3.2 LSP Integration
- [ ] Connect LSP to editor events
- [ ] Implement document synchronization
- [ ] Add diagnostics management
- [ ] Handle code actions and quick fixes
- [ ] Implement workspace symbol search

#### 3.3 Language Server Commands
- [ ] `start_language_server` - Start LSP server
- [ ] `stop_language_server` - Stop LSP server
- [ ] `list_language_servers` - List active servers
- [ ] `send_lsp_request` - Send LSP request

### Phase 4: Extension Management (Week 7-8)

#### 4.1 Extension Discovery
- [ ] Implement Open VSX API client
- [ ] Add extension search functionality
- [ ] Parse extension manifests
- [ ] Handle extension metadata
- [ ] Add category and tag filtering

#### 4.2 Extension Installation
- [ ] Download extension packages (.vsix)
- [ ] Extract and validate packages
- [ ] Install to workspace-specific directories
- [ ] Handle extension dependencies
- [ ] Update extension registry

#### 4.3 Extension Commands
- [ ] `search_extensions` - Search for extensions
- [ ] `install_extension` - Install extension
- [ ] `uninstall_extension` - Remove extension
- [ ] `update_extension` - Update extension
- [ ] `list_installed_extensions` - List extensions

## Security Considerations

### Process Isolation
- Run each extension host with limited permissions
- Use separate user/group for extension processes
- Implement CPU and memory limits
- Restrict network access based on extension permissions
- Sandbox file system access to workspace directory

### Extension Validation
- Verify extension package signatures
- Scan for known malicious patterns
- Check extension permissions before installation
- Implement extension allowlist/blocklist
- Log all extension activities

### API Security
- Validate all IPC messages
- Implement rate limiting for API calls
- Sanitize file paths and user input
- Prevent access to sensitive system APIs
- Add permission-based API access control

## Performance Optimizations

### Resource Management
- Lazy load extensions based on activation events
- Share Node.js runtime between compatible extensions
- Implement extension host pooling
- Cache parsed extension manifests
- Optimize IPC message serialization

### LSP Optimizations
- Implement request debouncing
- Cache completion and hover results
- Use incremental document synchronization
- Batch diagnostics updates
- Add request prioritization

## Testing Strategy

### Unit Tests
- Test process management functions
- Validate IPC protocol implementation
- Test API method implementations
- Verify security sandboxing
- Test resource limit enforcement

### Integration Tests
- Test extension loading and activation
- Verify LSP communication
- Test extension installation flow
- Validate API compatibility
- Test error recovery scenarios

### Extension Compatibility Tests
- Test popular VSCode extensions
- Create compatibility test suite
- Document known issues
- Provide migration guides
- Maintain compatibility matrix

## Monitoring and Debugging

### Logging
- Extension host stdout/stderr capture
- API call logging with timestamps
- Performance metrics collection
- Error tracking with stack traces
- Debug mode with verbose output

### Debugging Support
- Extension host debugging via Chrome DevTools
- LSP message inspection
- API call tracing
- Memory usage profiling
- CPU usage monitoring

## Configuration

### Plugin Settings
```toml
[vscode-host]
# Maximum number of extension hosts
max_hosts = 10

# Default memory limit per host (MB)
default_memory_limit = 512

# Extension host timeout (ms)
host_timeout = 30000

# Enable extension host debugging
enable_debugging = false

# Extension installation directory
extensions_dir = "~/.code-pilot-studio/extensions"

# Node.js executable path (auto-detect if not specified)
node_path = ""

# Open VSX registry URL
registry_url = "https://open-vsx.org/api"
```

### Per-Workspace Configuration
```json
{
  "vscode-host": {
    "enabled": true,
    "extensions": [
      "rust-lang.rust-analyzer",
      "ms-python.python",
      "dbaeumer.vscode-eslint"
    ],
    "memory_limit": 1024,
    "environment": {
      "NODE_ENV": "development"
    }
  }
}
```

## Future Enhancements

### Remote Extension Hosts
- Support for running extension hosts on remote servers
- SSH tunnel support for remote development
- Cloud-based extension host pools
- Distributed extension execution

### Advanced Features
- Extension profiling and optimization suggestions
- AI-powered extension recommendations
- Custom extension development tools
- Extension marketplace for Code Pilot Studio
- Cross-IDE extension compatibility layer

## Success Metrics

- Number of compatible VSCode extensions
- Extension host startup time < 2 seconds
- Memory usage per extension < 100MB
- LSP response time < 100ms for completions
- Extension crash rate < 0.1%
- API coverage > 80% of commonly used VSCode APIs

## Dependencies

### External Dependencies
- Node.js runtime (v18+)
- Open VSX registry API
- VSCode extension packages
- Language servers (downloaded on-demand)

### Rust Crates
- `tokio` - Async runtime
- `serde` - Serialization
- `jsonrpc-core` - JSON-RPC protocol
- `lsp-types` - LSP type definitions
- `reqwest` - HTTP client for registry
- `dashmap` - Concurrent hash map
- `parking_lot` - Synchronization primitives

## Conclusion

This plugin will provide Code Pilot Studio with access to the vast VSCode extension ecosystem while maintaining security, performance, and stability. By implementing proper isolation and resource management, we can offer users the best of both worlds: a custom IDE experience with VSCode extension compatibility.