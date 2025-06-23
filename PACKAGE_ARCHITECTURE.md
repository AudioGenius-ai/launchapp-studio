# Package Architecture & Dependency Rules

## Dependency Hierarchy (Top to Bottom)

```
Level 0 - Foundation (No dependencies)
├── @code-pilot/types          - TypeScript type definitions
└── @code-pilot/utils          - Pure utility functions

Level 1 - Core Infrastructure
├── @code-pilot/core           - Business logic (depends on: types)
├── @code-pilot/ui-kit         - UI components (depends on: types, utils)
├── @code-pilot/router         - Routing logic (no deps)
├── @code-pilot/state          - State management (depends on: types, utils)
└── @code-pilot/services       - Service layer (depends on: types)

Level 2 - Shared Features
├── @code-pilot/hooks          - React hooks (depends on: core, types)
└── @code-pilot/themes         - Theme system (depends on: core, types)

Level 3 - Tauri Plugins (Backend)
├── @code-pilot/plugin-terminal     - Terminal PTY (no deps)
├── @code-pilot/plugin-git          - Git operations (depends on: types)
├── @code-pilot/plugin-claude       - Claude CLI (no deps)
├── @code-pilot/plugin-mcp-webserver - MCP server (no deps)
└── @code-pilot/plugin-window-manager - Window mgmt (no deps)

Level 4 - Feature Packages
├── @code-pilot/feature-editor      - Code editor (depends on: core, types, ui-kit, utils)
├── @code-pilot/feature-terminal    - Terminal UI (depends on: core, types, ui-kit, plugin-terminal)
├── @code-pilot/feature-git         - Git UI (depends on: core, types, ui-kit, utils, plugin-git)
├── @code-pilot/feature-ai          - AI features (depends on: core, services, types, ui-kit, utils)
├── @code-pilot/feature-explorer    - File explorer (depends on: core, types, ui-kit)
├── @code-pilot/feature-templates   - Templates (depends on: core, types, ui-kit, utils)
├── @code-pilot/feature-projects    - Projects (depends on: core, hooks, types, ui-kit, feature-templates)
└── @code-pilot/feature-window-management - Windows (depends on: core, types, ui-kit)

Level 5 - Application
└── @code-pilot/desktop        - Main app (depends on: all necessary features + infrastructure)
```

## Dependency Rules

### 1. **Strict Hierarchy**
- Packages can ONLY depend on packages at the same level or lower
- No circular dependencies allowed
- No skipping levels unless absolutely necessary

### 2. **Foundation Layer (Level 0)**
- `@code-pilot/types`: Pure TypeScript types, interfaces, enums
- `@code-pilot/utils`: Pure utility functions, no React, no side effects
- These packages must have ZERO workspace dependencies

### 3. **Core Infrastructure (Level 1)**
- Can only depend on Level 0 packages
- `@code-pilot/core`: Business logic, services that don't fit elsewhere
- `@code-pilot/ui-kit`: ALL UI components go here (not in features)
- `@code-pilot/state`: Global state management
- `@code-pilot/services`: Shared service interfaces

### 4. **Feature Packages (Level 4)**
- Self-contained feature modules
- Can depend on Levels 0-3
- Should NOT depend on other feature packages
- Should export a clear public API through index.ts

### 5. **Desktop App (Level 5)**
- Only imports what it actually uses
- Composes features into the application
- Should be a thin shell

## Migration Plan

### Phase 1: Clean up dependencies
1. Remove `@code-pilot/ui` dependencies from all feature packages
2. Move any needed components to `@code-pilot/ui-kit`
3. Delete the legacy `@code-pilot/ui` package
4. Remove duplicate `@code-pilot/features-project-management` package

### Phase 2: Fix package exports
1. Ensure all packages build to `dist/` directory
2. Update all `main` fields to point to `dist/index.js`
3. Update all `types` fields to point to `dist/index.d.ts`
4. Add proper `exports` field for ESM/CJS compatibility

### Phase 3: Standardize versions
1. Use `workspace:*` for all workspace dependencies
2. Use `^19.0.0` for React everywhere
3. Align all external dependency versions

### Phase 4: Refactor feature packages
1. Remove cross-feature dependencies
2. Move shared components to ui-kit
3. Move shared hooks to hooks package
4. Move shared services to services package

## Example Package Structure

```typescript
// packages/features/editor/package.json
{
  "name": "@code-pilot/feature-editor",
  "dependencies": {
    "@code-pilot/core": "workspace:*",
    "@code-pilot/types": "workspace:*", 
    "@code-pilot/ui-kit": "workspace:*",
    "@code-pilot/utils": "workspace:*",
    // External deps...
  }
}

// packages/features/editor/src/index.ts
export { EditorPage } from './pages/EditorPage';
export { useEditor } from './hooks/useEditor';
export type { EditorConfig } from './types';
```

## Current Issues to Fix

1. **@code-pilot/ui** - Legacy package being used by features
2. **@code-pilot/feature-editor** - Importing from @code-pilot/ui
3. **@code-pilot/features-project-management** - Duplicate package
4. **workspace:^** - Should be `workspace:*`
5. **React versions** - Inconsistent across packages
6. **Missing builds** - Some packages export source files