# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code Pilot Studio v2 is an AI-powered IDE built with Tauri (Rust backend + React frontend) using a monorepo architecture. The project is in early development, transitioning from prototype to production-ready architecture following clean architecture principles.

## Essential Commands

### Development
```bash
# Install dependencies (run from root)
pnpm install

# Start all packages in development mode
pnpm dev

# Run the Tauri desktop app
cd apps/desktop && pnpm tauri:dev
```

### Building
```bash
# Build all packages
pnpm build

# Build desktop app for production
cd apps/desktop && pnpm tauri:build
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Format code with Prettier
pnpm format

# Run tests (when implemented)
pnpm test

# Clean build artifacts
pnpm clean
```

## Architecture

### Monorepo Structure
- `/apps/desktop/` - Main Tauri desktop application
  - `/src/` - React frontend (TypeScript)
  - `/src-tauri/` - Rust backend
- `/packages/` - Shared packages following clean architecture
  - `/core/` - Business logic (entities, use-cases, interfaces)
  - `/ui/` - Shared UI components
  - `/types/` - TypeScript type definitions
  - `/utils/` - Common utilities
- `/plugins/` - Plugin packages (planned, not yet implemented)

### Key Architectural Patterns
- **Clean Architecture**: Separation between UI, business logic, and infrastructure
- **Domain-Driven Design**: Code organized around business domains (projects, sessions, AI)
- **Dependency Injection**: Interfaces defined in core package
- **Event-Driven**: Planned for loose coupling and real-time updates
- **Plugin-Based**: Extensibility through plugin system (planned)

### Technology Stack
- **Frontend**: React 18.3, TypeScript, Vite 6, Zustand (state management planned)
- **Backend**: Rust with Tauri 2.0, Tokio (async), SQLite (planned)
- **Build System**: pnpm workspaces + Turborepo
- **Node Version**: 18+

## Development Guidelines

### When implementing features:
1. Follow existing code conventions and patterns
2. Use TypeScript project references (already configured)
3. Implement features in appropriate packages:
   - Business logic → `/packages/core/`
   - UI components → `/packages/ui/`
   - Type definitions → `/packages/types/`
4. Use path aliases for imports (`@code-pilot/core`, etc.)

### Current Implementation Status
- Basic monorepo structure ✓
- Tauri app initialized ✓
- Core packages scaffolded ✓
- Type definitions for key entities (Project, Session, Message) ✓
- Actual IDE features not yet implemented
- No tests written yet

### Planned Features (from REBUILD_PLAN.md)
- Project management with Git worktree isolation
- AI integration with multiple providers
- Session management with persistence
- Advanced editor with LSP support
- Terminal integration with tmux
- Extension system
- Version control integration

## Important Notes

- The project follows a 12-week development roadmap outlined in REBUILD_PLAN.md
- Focus on clean architecture and maintainability over rapid prototyping
- All new features should follow the established architectural patterns
- The codebase is transitioning from prototype to production-ready