# Code Pilot Studio v2

A next-generation AI-powered IDE built with Tauri, React, and TypeScript. Currently in active development with Phase 2 core features completed.

## Current Project Status

### 🎆 Phase 1: Foundation (Completed)
- ✓ Monorepo setup with pnpm workspaces and Turborepo
- ✓ Tauri desktop application with hot reload
- ✓ Core package architecture (core, ui, types, utils)
- ✓ TypeScript project references configuration
- ✓ Build pipeline with Vite

### 🚀 Phase 2: Core Features (Completed)
- ✓ Project management system with CRUD operations
- ✓ File explorer with tree view and operations
- ✓ Monaco editor integration with tabs
- ✓ File system operations (create, read, update, delete, copy, move)
- ✓ File watching with real-time updates
- ✓ Dark theme with Radix UI components
- ✓ Type-safe IPC communication

### 🔮 Phase 3: AI Integration (Upcoming)
- ☐ AI provider abstraction layer
- ☐ Claude API integration
- ☐ Streaming chat interface
- ☐ Context management
- ☐ Tool calling implementation

### 🛠️ Phase 4: Advanced Features (Planned)
- ☐ Session persistence with SQLite
- ☐ Git integration
- ☐ Terminal integration
- ☐ Plugin system
- ☐ LSP support

## Architecture

This project uses a monorepo structure managed with pnpm workspaces and Turborepo.

```mermaid
graph TB
    subgraph "Code Pilot Studio v2 Architecture"
        A[Code Pilot Studio] --> B[Apps]
        A --> C[Packages]
        A --> D[Plugins]
        A --> E[Tools]
        
        B --> B1[Desktop App<br/>Tauri + React]
        B --> B2[Web App<br/>Future]
        B --> B3[Mobile App<br/>Future]
        
        C --> C1[@code-pilot/core<br/>Business Logic]
        C --> C2[@code-pilot/ui<br/>React Components]
        C --> C3[@code-pilot/types<br/>TypeScript Types]
        C --> C4[@code-pilot/utils<br/>Utilities]
        
        D --> D1[AI Providers]
        D --> D2[Editor Plugins]
        D --> D3[Terminal Plugins]
        D --> D4[Version Control]
        D --> D5[Language Support]
        
        E --> E1[Build Tools]
        E --> E2[Scripts]
        E --> E3[Config]
        
        subgraph "Technology Stack"
            F[Frontend<br/>React + TypeScript]
            G[Backend<br/>Rust + Tauri]
            H[Build<br/>Vite + Turborepo]
            I[Package Manager<br/>pnpm workspaces]
        end
        
        B1 --> F
        B1 --> G
        A --> H
        A --> I
        
        C1 -.-> C3
        C1 -.-> C4
        C2 -.-> C1
        C2 -.-> C3
        C2 -.-> C4
    end
    
    style A fill:#1A237E,stroke:#0D47A1,color:#fff
    style B fill:#00695C,stroke:#004D40,color:#fff
    style C fill:#F57C00,stroke:#E65100,color:#fff
    style D fill:#6A1B9A,stroke:#4A148C,color:#fff
    style E fill:#455A64,stroke:#263238,color:#fff
    style F fill:#0288D1,stroke:#01579B,color:#fff
    style G fill:#D32F2F,stroke:#B71C1C,color:#fff
    style H fill:#388E3C,stroke:#1B5E20,color:#fff
    style I fill:#7B1FA2,stroke:#4A148C,color:#fff
```

### Project Structure

```
├── apps/
│   └── desktop/          # Tauri desktop application
├── packages/
│   ├── core/            # Core business logic
│   ├── ui/              # Shared UI components
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities
├── plugins/             # Plugin packages
└── tools/               # Build tools and scripts
```

## Quick Start Guide

### Prerequisites

- Node.js 18+ (for modern JavaScript features)
- pnpm 8+ (package manager)
- Rust (latest stable)
- Tauri CLI (`cargo install tauri-cli`)

### Getting Started

1. **Clone and install**:
```bash
git clone <repository-url>
cd code-pilot-studio-v2
pnpm install
```

2. **Start development mode**:
```bash
# Terminal 1: Start package watchers
pnpm dev

# Terminal 2: Run the desktop app
cd apps/desktop
pnpm tauri:dev
```

3. **Build for production**:
```bash
# Build all packages
pnpm build

# Build desktop app
cd apps/desktop
pnpm tauri:build
```

## Development Workflow

### Package Development

The monorepo uses pnpm workspaces with the following packages:

- **@code-pilot/core** - Business logic and services
- **@code-pilot/ui** - React components library
- **@code-pilot/types** - Shared TypeScript types
- **@code-pilot/utils** - Common utilities

### Common Tasks

```bash
# Add dependency to a package
pnpm add <package> --filter @code-pilot/core

# Run specific package script
pnpm --filter @code-pilot/ui build

# Update all dependencies
pnpm update --recursive
```

### Development Tips

1. **Hot Reload**: Both frontend and Rust backend support hot reload
2. **Type Safety**: TypeScript runs across all packages with project references
3. **Code Sharing**: Import workspace packages with `@code-pilot/*`
4. **Debugging**: Use Chrome DevTools for frontend, `RUST_LOG=debug` for backend

## Available Scripts

### Root Scripts
- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages in dependency order
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages with ESLint
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean all build artifacts

### Desktop App Scripts
- `pnpm tauri:dev` - Run desktop app in development
- `pnpm tauri:build` - Build desktop app for production
- `pnpm tauri:test` - Run desktop app tests

## Project Features

### Implemented Features

- 📁 **Project Management** - Create and manage multiple projects
- 📂 **File Explorer** - Navigate and manipulate files with tree view
- ✏️ **Code Editor** - Monaco editor with syntax highlighting
- 🎨 **Dark Theme** - Modern dark UI with Radix components
- 🔄 **File Operations** - Full CRUD operations on files/folders
- 👀 **File Watching** - Real-time file system change detection
- ⌘ **Keyboard Shortcuts** - Common IDE shortcuts (partial)

### Upcoming Features

- 🤖 **AI Integration** - Claude and other LLM providers
- 💾 **Session Persistence** - Save and restore work sessions
- 🖥️ **Terminal** - Integrated terminal with tmux support
- 🌐 **Git Integration** - Version control operations
- 🧩 **Plugin System** - Extensible architecture
- 🔍 **Smart Search** - AI-powered code search

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./CLAUDE.md)
- [Rebuild Plan](./REBUILD_PLAN.md)

## License

MIT