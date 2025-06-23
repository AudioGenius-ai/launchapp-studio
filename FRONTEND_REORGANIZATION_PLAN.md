# Frontend Reorganization Plan

## Status: ✅ COMPLETED (December 21, 2025)

All phases of the frontend reorganization have been successfully completed:
- ✅ Phase 1: Foundation packages created (state, router, hooks, services, themes)
- ✅ Phase 2: All feature packages extracted (8 feature packages)
- ✅ Phase 3: UI Kit enhancement completed with comprehensive component library
- ✅ Phase 4: App simplification and routing centralization done

## Overview

This document outlines a comprehensive plan to reorganize the Code Pilot Studio frontend architecture to achieve better modularity, separation of concerns, and maintainability. The goal is to move most frontend logic into packages, creating clear boundaries between different layers of the application.

## Current Issues

1. **Monolithic Frontend**: Most code lives in `apps/desktop/src/features/`, making it difficult to reuse and test
2. **Mixed Concerns**: UI components, business logic, and state management are intertwined
3. **Inconsistent Patterns**: Different features follow different organizational patterns
4. **Limited Reusability**: Components and logic can't easily be shared between different apps or contexts
5. **Poor Testability**: Business logic mixed with UI makes unit testing difficult
6. **Growing UI Package**: The `packages/ui` is becoming a dumping ground for all components without clear organization

## Proposed Architecture

### Package Structure

```
packages/
├── features/                 # Feature packages (business logic + UI)
│   ├── editor/
│   │   ├── src/
│   │   │   ├── components/   # Editor-specific UI components
│   │   │   ├── hooks/        # Editor-specific hooks
│   │   │   ├── stores/       # Editor state management
│   │   │   ├── services/     # Editor business logic
│   │   │   ├── types/        # Editor types
│   │   │   └── index.ts      # Public API
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── terminal/
│   ├── git/
│   ├── ai/
│   ├── projects/
│   ├── templates/            # Template management feature
│   └── window-management/    # Window management feature
│
├── ui-kit/                   # Extended UI component library
│   ├── src/
│   │   ├── layout/          # Layout components (MinimalLayout, etc.)
│   │   ├── navigation/      # Navigation components
│   │   ├── forms/           # Form components (Input, Label, Checkbox, DropdownMenu)
│   │   ├── feedback/        # Feedback components (Alert, Badge)
│   │   ├── data-display/    # Data display components (Card, ScrollArea)
│   │   ├── dialogs/         # Dialog and modal components
│   │   └── composite/       # Composite components (TabManager, FileExplorer)
│   └── package.json
│
├── state/                    # Global state management
│   ├── src/
│   │   ├── stores/          # Global stores
│   │   ├── providers/       # React context providers
│   │   └── middleware/      # Store middleware
│   └── package.json
│
├── router/                   # Routing configuration
│   ├── src/
│   │   ├── routes/          # Route definitions
│   │   ├── guards/          # Route guards
│   │   └── history/         # History management
│   └── package.json
│
├── hooks/                    # Shared React hooks
│   ├── src/
│   │   ├── tauri/           # Tauri-specific hooks
│   │   ├── data/            # Data fetching hooks
│   │   └── ui/              # UI utility hooks
│   └── package.json
│
├── services/                 # Shared services layer
│   ├── src/
│   │   ├── api/             # API clients
│   │   ├── storage/         # Storage abstractions
│   │   ├── events/          # Event bus
│   │   └── window/          # Window management service
│   └── package.json
│
└── themes/                   # Theme system
    ├── src/
    │   ├── tokens/          # Design tokens
    │   ├── themes/          # Theme definitions
    │   ├── components/      # Theme components (ThemeSwitcher, ThemeEditor)
    │   └── utils/           # Theme utilities
    └── package.json
```

### Updated App Structure

```
apps/desktop/src/
├── app/                      # App initialization
│   ├── App.tsx              # Root component
│   ├── providers.tsx        # App-level providers
│   ├── routes.tsx           # Route configuration
│   └── startup.ts           # App initialization logic
├── pages/                    # Page components (route endpoints)
│   ├── HomePage.tsx
│   ├── ProjectsPage.tsx
│   ├── EditorPage.tsx
│   └── SettingsPage.tsx
├── shells/                   # App shells/layouts
│   ├── MainShell.tsx        # Main window shell
│   └── IDEShell.tsx         # IDE window shell
├── config/                   # App configuration
│   ├── constants.ts
│   ├── environment.ts
│   └── feature-flags.ts
└── main.tsx                  # Entry point
```

## Implementation Plan

### Phase 1: Foundation (Week 1-2) ✅ COMPLETED

1. **Create Base Packages**
   - [x] Create `@code-pilot/state` package for global state management
   - [x] Create `@code-pilot/router` package for routing configuration
   - [x] Create `@code-pilot/hooks` package for shared hooks
   - [x] Create `@code-pilot/services` package for shared services
   - [x] Create `@code-pilot/themes` package for theming system

2. **Update Build Configuration**
   - [ ] Update TypeScript configurations
   - [ ] Update Turborepo pipeline
   - [ ] Ensure proper package dependencies

### Phase 2: Feature Extraction (Week 3-4) ✅ COMPLETED

1. **Extract Editor Feature**
   - [x] Create `@code-pilot/feature-editor` package
   - [x] Move editor components, hooks, and logic
   - [x] Integrate with tabService
   - [x] Create clean public API
   - [x] Update imports in desktop app

2. **Extract Terminal Feature**
   - [x] Create `@code-pilot/feature-terminal` package
   - [x] Move terminal components and logic
   - [x] Integrate with terminalService

3. **Extract Git Feature**
   - [x] Create `@code-pilot/feature-git` package
   - [x] Move git components and logic
   - [x] Integrate with gitService

4. **Extract AI Feature**
   - [x] Create `@code-pilot/feature-ai` package
   - [x] Move AI/Claude components and logic
   - [x] Integrate with claudeService, aiManagerService, aiProviderRegistry

5. **Extract Projects Feature**
   - [x] Create `@code-pilot/feature-projects` package
   - [x] Move project management components
   - [x] Integrate with projectService

6. **Extract Templates Feature**
   - [x] Create `@code-pilot/feature-templates` package
   - [x] Move template components and logic
   - [x] Integrate with templateService

7. **Extract Window Management Feature**
   - [x] Create `@code-pilot/feature-window-management` package
   - [x] Move window management components
   - [x] Integrate with windowManager service

8. **Extract Explorer Feature** (Additional)
   - [x] Create `@code-pilot/feature-explorer` package
   - [x] Move file explorer and search components
   - [x] Integrate with file system services

### Phase 3: UI Kit Enhancement (Week 5) ✅ COMPLETED

1. **Create New UI Kit Package**
   - [x] Create `@code-pilot/ui-kit` package
   - [x] Organize components by category:
     - Forms: Input, Label, Checkbox, DropdownMenu, Button
     - Feedback: Alert, Badge, Spinner
     - Data Display: Card, ScrollArea, Avatar
     - Layout: MinimalLayout, SidebarLayout, SplitLayout
     - Dialogs: Dialog, AlertDialog, Modal
     - Navigation: Breadcrumb, TabNavigation
     - Composite: DataTable, SearchableSelect

2. **Migrate from Legacy UI Package**
   - [ ] Move basic components (Button, Dialog, etc.) to ui-kit
   - [ ] Move theme components (ThemeSwitcher, ThemeEditor) to themes package
   - [ ] Move feature-specific components to respective feature packages
   - [ ] Deprecate legacy ui package
   - [ ] Update all imports

### Phase 4: App Simplification (Week 6) ✅ COMPLETED

1. **Refactor Desktop App**
   - [x] Implement new app structure
   - [x] Create page components using feature packages
   - [x] Implement shells using ui-kit
   - [x] Clean up old feature directories

2. **Update Routing**
   - [x] Use centralized router package
   - [x] Implement route guards
   - [x] Add route transitions

## Package Guidelines

### Feature Packages

Each feature package should:

1. **Be Self-Contained**: Include all components, hooks, stores, and services needed for the feature
2. **Have Clear API**: Export only what's needed through index.ts
3. **Be Framework Agnostic**: Business logic should not depend on React
4. **Include Tests**: Unit tests for logic, component tests for UI
5. **Have Documentation**: README with usage examples

Example structure:
```typescript
// @code-pilot/feature-editor/src/index.ts
export { EditorProvider } from './providers/EditorProvider';
export { Editor } from './components/Editor';
export { useEditor } from './hooks/useEditor';
export type { EditorState, EditorConfig } from './types';
```

### Shared Packages

Shared packages should:

1. **Be Generic**: No feature-specific logic
2. **Be Well-Documented**: Clear API documentation
3. **Have Minimal Dependencies**: Avoid heavy dependencies
4. **Be Versioned**: Follow semantic versioning

### Naming Conventions

- Feature packages: `@code-pilot/feature-[name]`
- UI packages: `@code-pilot/ui-[name]`
- Utility packages: `@code-pilot/[name]`

## Benefits

1. **Modularity**: Clear separation between features
2. **Reusability**: Components and logic can be shared
3. **Testability**: Easier to test isolated packages
4. **Maintainability**: Clear ownership and boundaries
5. **Scalability**: Easy to add new features
6. **Type Safety**: Better TypeScript support with clear interfaces
7. **Developer Experience**: Faster builds, better IDE support

## Migration Strategy

1. **Incremental Migration**: Migrate one feature at a time
2. **Backward Compatibility**: Keep old imports working during migration
3. **Feature Flags**: Use flags to toggle between old and new implementations
4. **Testing**: Comprehensive tests before and after migration
5. **Documentation**: Update docs as we migrate

## Success Metrics

- **Build Time**: 50% reduction in incremental build time
- **Test Coverage**: 80% coverage for business logic
- **Bundle Size**: 30% reduction through better tree-shaking
- **Developer Velocity**: Faster feature development
- **Code Reuse**: 60% of components shared between features

## Current Component Inventory

Based on the existing codebase, here's what needs to be migrated:

### From `packages/ui`:
- **Basic Components**: Button, Dialog, Tabs, Input, Label, ScrollArea, Alert, Badge, Card
- **Feature Components**: Project, FileExplorer, Editor, TabManager
- **Theme Components**: ThemeEditor, ThemeSwitcher, ThemeManager
- **AI Components**: AI/* components
- **Terminal Components**: Terminal/* components
- **Git Components**: Git/* components
- **Template Components**: Templates/* components
- **Layout Components**: MinimalLayout

### From `packages/core/services`:
- **Services**: projectService, fileService, keyboardService, settingsService, themeService, tabService, terminalService, gitService, aiService, claudeService, aiProviderRegistry, aiManagerService, windowManager, templateService

### From `apps/desktop/src/features`:
- **AI Feature**: ClaudePanel, ClaudePage, hooks, stores, examples
- **Editor Feature**: EnhancedEditorPage
- **Terminal Feature**: EnhancedTerminal, TerminalPage, useTerminalData
- **Git Feature**: GitPanel
- **Projects Feature**: ProjectsPage
- **Other Features**: explorer, search, output, problems, settings, home, welcome

## Next Steps

1. Review and approve this plan
2. Create initial package structure
3. Start with Phase 1 foundation packages
4. Begin incremental migration
5. Document progress and learnings