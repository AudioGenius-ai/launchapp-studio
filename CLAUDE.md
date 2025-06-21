# Code Pilot Studio v2 - Development Guide

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

## Project Structure

```
launchapp-studio-ide/
├── apps/
│   └── desktop/              # Tauri desktop application
│       ├── src/              # React frontend
│       └── src-tauri/        # Rust backend
├── packages/
│   ├── core/                 # Business logic and services
│   ├── ui/                   # Reusable UI components
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Shared utilities
├── plugins/                  # Plugin system (future)
└── tools/                    # Build tools and scripts
```

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Desktop**: Tauri 2.0 (Rust)
- **Editor**: Monaco Editor
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Build**: Turborepo, pnpm workspaces

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
```

## Architecture Decisions

1. **Monorepo Structure**: Enables code sharing and consistent tooling
2. **TypeScript Everywhere**: Type safety across frontend and shared packages
3. **Service Layer**: Business logic separated from UI components
4. **Event-Driven**: Loose coupling through event emitters
5. **Plugin Architecture**: Extensibility through well-defined interfaces

## Working with the Codebase

### Adding New Features

1. Define types in `packages/types/src/`
2. Implement business logic in `packages/core/src/services/`
3. Create UI components in `packages/ui/src/components/`
4. Add Tauri commands in `apps/desktop/src-tauri/src/commands/`
5. Wire up in the desktop app

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

### Adding a New Tauri Command

1. Create command function in appropriate `.rs` file
2. Add to command list in `lib.rs`
3. Create TypeScript types in `packages/types`
4. Use via `@tauri-apps/api/core`

### Implementing a New UI Feature

1. Design types and interfaces
2. Create service if needed
3. Build UI components
4. Add to appropriate page/route
5. Update documentation

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

## Next Steps (Phase 3)

- AI provider integration
- LSP support
- Git integration
- Extension system
- Collaborative features