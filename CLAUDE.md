# You are paid by the hour, you have NO TIME CONSTAINTS, never take shorcuts, if the task is to large split it into more tasks and tackle part by part

- ALWAYS USE PARALLELIZE AGENTS WHEN APPLICABLE

## Code Pilot Studio v2 - Development Guide

## Project Overview

Code Pilot Studio v2 is a next-generation AI-powered IDE built with modern web technologies. This document serves as a guide for AI assistants and developers working on the project.

## Current Status

### ✅ Phase 1: Foundation (Completed)

- Monorepo setup with pnpm workspaces
- Turborepo configuration for efficient builds
- TypeScript project references
- Basic Tauri desktop app structure
- Shared packages (core, ui, types, utils)

### ✅ Phase 2: Core Features (Completed)

- **Project Management System**: Full CRUD operations with UI
- **File Explorer**: Tree view with search, context menus, and file watching
- **Code Editor**: Monaco editor with syntax highlighting for 20+ languages
- **Tab Management**: Advanced tabs with split panes and drag-and-drop
- **Settings System**: Comprehensive preferences with persistence
- **Theme System**: Light/dark modes with custom theme support
- **Keyboard Shortcuts**: Configurable key bindings

### ✅ Phase 3: Advanced Features (Completed)

- **Terminal Integration**: Implemented as `tauri-plugin-terminal` with xterm.js
  - Multiple concurrent terminal sessions
  - PTY backend with shell detection
  - Terminal themes and settings
  - Resize handling and session management
- **Git Integration**: Implemented as `tauri-plugin-git` with libgit2
  - Full Git operations (status, commit, diff, etc.)
  - Branch management and remote operations
  - Note: Currently commented out due to compilation issues with libgit2
- **AI Integration**: Implemented as `tauri-plugin-claude`
  - Claude CLI wrapper with session management
  - Process lifecycle management
  - MCP tool support
  - File watching for real-time updates

## Project Structure

```
launchapp-studio-ide/
├── apps/
│   └── desktop/              # Tauri desktop application
│       ├── src/              # React frontend (minimal shell)
│       │   ├── app/          # App initialization
│       │   ├── pages/        # Page components (route endpoints)
│       │   ├── shells/       # App shells/layouts
│       │   └── config/       # App configuration
│       ├── src-tauri/        # Rust backend
│       │   └── binaries/     # Sidecar binaries
│       │       └── mcp-server/  # MCP server implementation
│       ├── plugins/          # Plugin JavaScript bindings
│       └── build-sidecars.js # Sidecar build script
├── packages/
│   ├── core/                 # Business logic and services
│   │   └── services/         # Terminal, Git, Tab services
│   ├── ui/                   # Basic UI components (legacy)
│   │   └── components/       # Terminal, Git, Settings UI
│   ├── ui-kit/              # Extended UI component library
│   │   ├── layout/          # Layout components
│   │   ├── navigation/      # Navigation components
│   │   ├── forms/           # Form components
│   │   └── data-display/    # Data display components
│   ├── types/                # TypeScript type definitions
│   │   ├── terminal.ts       # Terminal types & themes
│   │   ├── git.ts           # Git types & interfaces
│   │   └── ...              # Other type definitions
│   ├── utils/                # Shared utilities
│   ├── features/            # Feature packages (NEW)
│   │   ├── editor/          # Editor feature package
│   │   ├── terminal/        # Terminal feature package
│   │   ├── git/             # Git feature package
│   │   ├── ai/              # AI feature package
│   │   └── projects/        # Projects feature package
│   ├── state/               # Global state management (NEW)
│   ├── router/              # Routing configuration (NEW)
│   ├── hooks/               # Shared React hooks (NEW)
│   ├── services/            # Shared services layer (NEW)
│   └── themes/              # Theme system (NEW)
├── plugins/                  # Tauri plugins (Rust + TypeScript)
│   ├── tauri-plugin-claude/  # Claude CLI integration
│   ├── tauri-plugin-terminal/# Terminal integration
│   ├── tauri-plugin-git/     # Git operations
│   ├── tauri-plugin-mcp-webserver/ # MCP server management
│   └── tauri-plugin-window-manager/ # Window management (in dev)
└── tools/                    # Build tools and scripts
```

### Frontend Architecture (NEW)

The frontend follows a modular architecture with clear separation of concerns:

1. **Feature Packages** (`packages/features/*`): Self-contained feature modules including components, hooks, stores, and services
2. **Shared Packages**: Reusable utilities, hooks, and services used across features
3. **Minimal App Shell** (`apps/desktop/src`): Thin layer that composes features into the application
4. **UI Kit** (`packages/ui-kit`): Comprehensive component library for consistent UI

See `FRONTEND_REORGANIZATION_PLAN.md` for detailed migration strategy.

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Desktop**: Tauri 2.0 (Rust)
- **Editor**: Monaco Editor
- **Terminal**: xterm.js with addons (fit, web-links, search)
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Build**: Turborepo, pnpm workspaces
- **Rust Dependencies**:
  - `portable-pty`: Terminal PTY handling
  - `git2`: Git operations (libgit2 bindings)
  - `notify`: File system watching
  - `sqlx`: SQLite database (planned)
  - `tokio`: Async runtime

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
cd apps/desktop
pnpm tauri:dev

# Build for production
pnpm tauri:build

# Run all tests
pnpm test

# Lint all packages
pnpm lint

# Working with plugins
cd plugins/tauri-plugin-[name]
pnpm build              # Build TypeScript bindings
cargo build             # Build Rust plugin

# Generate plugin permissions
cd plugins/tauri-plugin-[name]
cargo build --features "tauri/custom-protocol"
```

## Architecture Decisions

1. **Monorepo Structure**: Enables code sharing and consistent tooling
2. **TypeScript Everywhere**: Type safety across frontend and shared packages
3. **Service Layer**: Business logic separated from UI components
4. **Event-Driven**: Loose coupling through event emitters
5. **Plugin Architecture**: Extensibility through well-defined interfaces
6. **Tauri Plugins**: All major Rust functionality implemented as plugins for modularity
7. **Process Management**: Robust subprocess handling for terminal and AI features
8. **Real-time Updates**: File watching and event streams for live data

## Working with the Codebase

### Adding New Features (Updated)

For new features, follow the modular architecture:

1. **Create Feature Package** in `packages/features/[feature-name]/`
   - Define feature-specific types in `src/types/`
   - Implement business logic in `src/services/`
   - Create UI components in `src/components/`
   - Add hooks in `src/hooks/`
   - Manage state in `src/stores/`

2. **Use Shared Packages**
   - Add shared types to `packages/types/src/`
   - Use shared hooks from `packages/hooks/`
   - Import UI components from `packages/ui-kit/`

3. **Backend Integration**
   - Add Tauri commands in `apps/desktop/src-tauri/src/commands/`
   - Or create a new Tauri plugin if feature is complex

4. **Wire Up in App**
   - Create page component in `apps/desktop/src/pages/`
   - Add route in `apps/desktop/src/app/routes.tsx`
   - Import feature from its package

### File Naming Conventions

- Components: PascalCase (e.g., `FileExplorer.tsx`)
- Services: camelCase with "Service" suffix (e.g., `projectService.ts`)
- Types: PascalCase for interfaces/types
- Rust files: snake_case (e.g., `project_commands.rs`)

### State Management

- Local component state: React hooks
- Shared state: Zustand stores
- Server state: Direct Tauri command calls
- Persistent state: Tauri app data directory

## Testing Strategy

- Unit tests: Vitest for JS/TS code
- Integration tests: Testing service layer
- E2E tests: Playwright (planned)
- Rust tests: cargo test

## Common Tasks

### Adding a New Shared Package

1. Create directory under `packages/`
2. Add `package.json` with workspace protocol
3. Add to `tsconfig.json` references
4. Update import paths in `tsconfig.base.json`

### Creating a New Tauri Plugin

1. Create plugin: `npx @tauri-apps/cli plugin new [name] --no-api`
2. Move to `plugins/` directory
3. Implement plugin logic in `src/`
4. Define permissions in `permissions/`
5. Add build script for permission generation
6. Register in main app's `lib.rs`

### Adding Commands to a Plugin

1. Define command function in `src/commands.rs`
2. Add to `COMMANDS` array in `build.rs`
3. Include in `invoke_handler` in plugin's `lib.rs`
4. Define permissions in `permissions/` directory
5. Use via `invoke('plugin:name|command')`

### Implementing a New UI Feature (Updated)

1. **Determine Feature Scope**
   - Simple component: Add to `packages/ui-kit/`
   - Complex feature: Create new package in `packages/features/`

2. **For Feature Packages**
   - Create package structure with components, hooks, services
   - Export public API through `index.ts`
   - Add to workspace in root `package.json`
   - Update TypeScript references

3. **Integration**
   - Import feature in relevant page
   - Add to router if new route needed
   - Update navigation if applicable

4. **Documentation**
   - Add README to feature package
   - Update CLAUDE.md if significant feature

## Performance Considerations

- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load features and routes
- Cache Tauri command results when appropriate
- Use Web Workers for heavy computations

## Security Best Practices

- Validate all inputs in Tauri commands
- Use Tauri's allowed list for commands
- Sanitize file paths
- Store sensitive data securely
- Follow principle of least privilege

## Phase 4: Next Steps

### Planned Features

- **SQLite Persistence**: Database layer for projects, sessions, and settings
- **MCP Protocol Support**: Generic Model Context Protocol plugin
- **Plugin Marketplace**: Discovery and installation of community plugins
- **Cloud Sync**: Settings and project synchronization
- **Collaborative Features**: Real-time collaboration support

## AI Integration (Implemented)

### Claude CLI Integration

Successfully implemented as `tauri-plugin-claude` with the following features:

1. **Core Functionality**:
   - Subprocess management for Claude CLI
   - Session persistence and recovery
   - Log file streaming with file watching
   - MCP config support for tool discovery

2. **Advanced Features**:
   - Dual output capture (tee + file watching)
   - Session recovery on app restart
   - Multiple concurrent Claude sessions
   - Process health monitoring
   - Orphaned process detection
   - Real-time message streaming

3. **UI Components**:
   - Claude panel with chat interface
   - Session management UI
   - Tool discovery and display
   - Message history with markdown rendering

## Tauri Plugin Architecture

### Overview

All major Rust functionality is implemented as Tauri plugins, providing modularity, reusability, and clean separation of concerns.

### Plugin Structure

Each plugin follows a consistent structure with both Rust backend and TypeScript frontend components:

```
plugins/
├── tauri-plugin-claude/          # Claude CLI integration (✅ Implemented)
│   ├── Cargo.toml               # Rust dependencies
│   ├── build.rs                 # Permission generation script
│   ├── src/                     # Rust source code
│   │   ├── lib.rs              # Plugin setup & lifecycle
│   │   ├── commands.rs         # Tauri commands
│   │   ├── service.rs          # Core Claude logic
│   │   ├── session_manager.rs  # Session persistence
│   │   ├── process_manager.rs  # Process lifecycle
│   │   ├── file_watcher.rs     # Log file monitoring
│   │   ├── models.rs           # Data structures
│   │   └── error.rs            # Error handling
│   ├── guest-js/               # TypeScript bindings
│   │   └── src/index.ts        # Frontend API
│   ├── permissions/            # Security permissions
│   │   ├── default.toml        # Default permissions
│   │   └── autogenerated/      # Generated from commands
│   └── dist-js/               # Built TypeScript output
│
├── tauri-plugin-terminal/       # Terminal integration (✅ Implemented)
│   ├── src/
│   │   ├── lib.rs              # Plugin initialization
│   │   ├── manager.rs          # Terminal session manager
│   │   ├── session.rs          # Individual terminal sessions
│   │   ├── pty_wrapper.rs      # PTY abstraction
│   │   ├── commands.rs         # Terminal commands
│   │   └── utils.rs            # Shell detection
│   └── permissions/
│
├── tauri-plugin-git/           # Git operations (✅ Implemented, compilation issues)
│   ├── src/
│   │   ├── lib.rs             # Plugin setup
│   │   ├── repository.rs      # Git repository wrapper
│   │   ├── commands.rs        # Git commands (40+ operations)
│   │   └── utils.rs           # Helper functions
│   └── permissions/
│
└── tauri-plugin-mcp/           # MCP protocol support (🔄 Planned)
```

### Plugin Development Workflow

1. **Create Plugin**: `npx @tauri-apps/cli plugin new [name] --no-api`
2. **Define Commands**: Implement in `src/commands.rs`
3. **Setup Permissions**: Define in `permissions/` directory
4. **Build Script**: Auto-generate permissions in `build.rs`
5. **Integration**: Register plugin in main app's `lib.rs`

### Plugin Benefits

1. **Modularity**: Each feature is self-contained
2. **Reusability**: Can publish to crates.io
3. **Type Safety**: Strong typing with auto-generated bindings
4. **Lifecycle Management**: Proper setup/teardown hooks
5. **Permission System**: Fine-grained security controls
6. **State Management**: Each plugin manages its own state

### Implemented Plugin Features

#### Terminal Plugin

- Create/destroy terminal sessions
- Shell detection (bash, zsh, fish, PowerShell)
- PTY communication with resize support
- Terminal data streaming
- Session persistence
- Multiple concurrent terminals

#### Git Plugin

- Full Git operations (status, diff, commit, branch, etc.)
- Repository management
- Remote operations (fetch, pull, push)
- Stash management
- Configuration handling
- Blame and log viewing

#### Claude Plugin

- Session creation and management
- Real-time message streaming
- MCP tool discovery
- Process lifecycle management
- Session recovery on restart
- Concurrent session support

#### MCP Webserver Plugin

- External MCP server process management
- Automatic port allocation and health checking
- Support for bundled sidecars and external servers
- Tool discovery and execution via JSON-RPC
- Multiple concurrent server instances
- Real-time process monitoring and logging

### Frontend Usage

```typescript
// Direct command invocation
import { invoke } from '@tauri-apps/api/core';

// Claude plugin
const session = await invoke('plugin:claude|create_session', {
    workspacePath: '/path/to/workspace'
});

// Terminal plugin
const terminalId = await invoke('plugin:terminal|create_terminal', {
    shell: '/bin/bash'
});

// Git plugin
const status = await invoke('plugin:git|status', {
    repoPath: '/path/to/repo'
});

// MCP webserver plugin
const instance = await invoke('plugin:mcp-webserver|start_server', {
    config: {
        name: 'my-mcp-server',
        command: 'launchapp-mcp-sidecar',
        args: []
    }
});
```

## Development Best Practices

### Project Management

- Always use pnpm for package management
- Follow the monorepo structure with workspace protocols
- Use TypeScript for all new code
- Implement features as Tauri plugins when possible
- Create feature packages for complex UI features

### Code Quality

- Write comprehensive TypeScript types
- Use proper error handling with Result types in Rust
- Implement proper cleanup in lifecycle hooks
- Add permissions for all new Tauri commands
- Maintain clear API boundaries between packages
- Follow consistent export patterns

### Frontend Architecture

- Keep `apps/desktop/src` minimal - just shell and routing
- Place all feature logic in `packages/features/*`
- Use `packages/ui-kit` for reusable components
- Share hooks via `packages/hooks`
- Centralize state management in `packages/state`

### Performance

- Use virtual scrolling for large lists
- Implement debouncing for frequent updates
- Cache expensive operations
- Use Web Workers for heavy computations
- Lazy load feature packages

## Sidecar Binaries

The application includes bundled sidecar binaries for extended functionality:

### MCP Server Sidecar

Located at `apps/desktop/src-tauri/binaries/mcp-server/`, this provides:

- JSON-RPC 2.0 MCP protocol implementation
- Tool discovery and execution
- Health check endpoints
- CORS support for web clients

### Building Sidecars

Sidecars are automatically built before dev/build commands:

```bash
# Manual build
cd apps/desktop
pnpm build:sidecars

# Automatic build (happens before dev/build)
pnpm tauri:dev  # Runs build:sidecars first
pnpm tauri:build # Runs build:sidecars first
```

### Configuration

In `tauri.conf.json`:

```json
{
  "bundle": {
    "externalBin": [
      "binaries/launchapp-mcp-sidecar"
    ]
  }
}
```

The build script automatically:

1. Detects the target platform triple
2. Builds the sidecar in release mode
3. Renames with the platform suffix (e.g., `-aarch64-apple-darwin`)
4. Makes it executable on Unix systems

## Known Issues

1. **Git Plugin Compilation**: The git plugin is currently commented out in the main app due to libgit2 compilation issues on some platforms. This needs to be resolved before the Git UI can be fully functional.

2. **Terminal Performance**: Large output streams may cause performance issues. Virtual scrolling implementation is planned.

## Project Policies

### Development Guidelines

- Never create enhanced or modified versions of existing files
- Only create new files when they don't already exist
- Follow the established patterns and conventions
- Maintain backward compatibility when updating plugins

## Resources and Documentation

### Key Documentation Files

- `REBUILD_PLAN.md`: Detailed rebuild strategy and progress tracking
- `TERMINAL_GIT_INTEGRATION_PLAN.md`: Terminal and Git implementation details
- `FRONTEND_REORGANIZATION_PLAN.md`: Frontend modularization strategy
- `plugins/*/README.md`: Individual plugin documentation

### External Resources

- [Tauri v2 Documentation](https://v2.tauri.app/)
- [xterm.js Documentation](https://xtermjs.org/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)
- [git2-rs Documentation](https://docs.rs/git2/)

## Contributing

When contributing to this project:

1. Review this guide and related documentation
2. Follow the established patterns and conventions
3. Test your changes thoroughly
4. Update documentation as needed
5. Ensure all plugins build successfully
