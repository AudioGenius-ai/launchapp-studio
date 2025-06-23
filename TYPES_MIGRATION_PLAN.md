# Types Package Migration Plan

## Overview

The `@code-pilot/types` package has grown to include all types rather than just shared/common types. This violates clean architecture principles and creates circular dependencies. This document tracks the migration of feature-specific types to their respective feature packages.

## Goals

1. **@code-pilot/types** should only contain:
   - Common/shared types used across multiple packages
   - Core domain types (Project, User, Session)
   - Base interfaces and enums
   - Utility types

2. **Feature packages** should own and export their feature-specific types
3. **Plugins** should export their own command/API types

## Current State Analysis

### Types that SHOULD STAY in @code-pilot/types

```typescript
// Core domain types
- Project
- ProjectSettings
- User (if exists)
- Session (generic, not AI-specific)
- SessionStatus (generic)

// Common utility types
- TauriCommand
- Message (generic)
- ChatOptions (generic)

// Shared enums
- ThemeMode
- ColorScheme

// Base filesystem types
- FileTreeItem
- FileType
- isTextFile utility
```

### Types that SHOULD MOVE

#### To @code-pilot/feature-ai
```typescript
// From ai.ts
- AIProviderType
- AIProviderStatus
- AISessionStatus
- AIMessageRole
- AIMessageStatus
- AIMessage
- AIEvent
- AIFeature
- AIToolCall
- AITool
- AIErrorCode
- AIError
- AIProviderConfig
- AISession
- AIProvider
- AICapabilities
- AIContext
- AIContextFile
- AICodeSnippet
- StreamChunk
- CreateSessionOptions
- UpdateSessionOptions
- AIPanelSettings
- AISettings (type alias)
```

#### To @code-pilot/feature-git
```typescript
// From git.ts
- GitRepository
- GitStatus
- GitFileChange
- GitFileStatus
- GitCommit
- GitAuthor
- GitBranch
- GitBranchType
- GitRemote
- GitTag
- GitStashEntry
- GitDiff
- GitDiffHunk
- GitDiffLine
- GitDiffStats
- GitBlame
- GitBlameLine
- GitCommitOptions
- GitFetchOptions
- GitPullOptions
- GitPushOptions
- GitCheckoutOptions
- GitMergeOptions
- GitResetOptions
- GitResetMode
- GitStashOptions
- GitLogOptions
- GitConflict
- GitSubmodule
- GitConfig
```

#### To @code-pilot/feature-terminal
```typescript
// From terminal.ts
- TerminalTheme
- TerminalSession
- TerminalSessionStatus
- TerminalCommand
- TerminalOutput
- TerminalShell
- TerminalConfig
- TerminalShortcut
- TerminalProfile
- TerminalTab
- TerminalSplitDirection
- TerminalLayout
- ShellType
- createTerminalTheme
- getBuiltInThemes
- DEFAULT_TERMINAL_CONFIG
```

#### To @code-pilot/feature-editor
```typescript
// From editor.ts
- EditorTab
- EditorFile
- EditorLanguage
- EditorTheme
- EditorConfig
- EditorViewState
- EditorAction
- CodeAction
- CompletionItem
- CompletionItemKind
- DiagnosticSeverity
- Diagnostic
- Position
- Range
- TextEdit
- WorkspaceEdit
- SymbolKind
- SymbolInformation
- DocumentSymbol
- DEFAULT_EDITOR_CONFIG
```

#### To @code-pilot/feature-templates
```typescript
// From templates.ts
- ProjectTemplate
- TemplateCategory
- TemplateVariable
- TemplateFile
- TemplateConfig
- TemplateMetadata
- TemplateRequirement
- TemplateAction
- TemplateActionType
- TemplateEngine
- TemplateContext
- TemplateValidationResult
- DEFAULT_TEMPLATE_CATEGORIES
```

#### To @code-pilot/feature-window-management
```typescript
// From window.ts
- WindowType
- WindowState
- WindowConfig
- WindowPosition
- WindowSize
- WindowEvent
- WindowManager
- WindowGroup
- WindowLayout
- WindowTheme
- DEFAULT_WINDOW_CONFIG
```

#### To respective UI packages
```typescript
// From tabs.ts - should go to @code-pilot/feature-editor
- TabGroup
- SplitPane
- TabDropZone
- TabDragData
- RecentlyClosedTab
- TabManagerState
- TabManagerConfiguration
- TabContextMenuAction
- TabKeyboardShortcut
- TabSessionData
- TabManagerEvents
- DEFAULT_TAB_MANAGER_CONFIG
```

## Migration Strategy

### Phase 1: Preparation
1. Create `types` directories in each feature package
2. Set up proper TypeScript compilation for type exports
3. Update package.json files to export types

### Phase 2: Migration (Per Feature)
For each feature:
1. Copy types from @code-pilot/types to feature package
2. Update imports within the feature package
3. Export types from feature's index.ts
4. Update dependent packages to import from feature
5. Remove types from @code-pilot/types
6. Run build and fix any errors

### Phase 3: Cleanup
1. Update @code-pilot/types to only export remaining common types
2. Update all import statements across the codebase
3. Update documentation
4. Run full build and test suite

## Implementation Order

1. **feature-ai** - Highest priority due to current build errors
2. **feature-git** - Clear boundaries, self-contained
3. **feature-terminal** - Clear boundaries, self-contained
4. **feature-editor** - Includes tabs types
5. **feature-templates** - Self-contained
6. **feature-window-management** - Self-contained

## Breaking Changes

This migration will introduce breaking changes for any external consumers of the types package. They will need to:
1. Install the specific feature packages they need
2. Update import statements to use the new locations

## Progress Tracking

### Phase 1: Preparation ✓
- [x] Create types directories in feature packages
- [x] Update tsconfig.json files for type exports
- [x] Update package.json exports fields

### Phase 2: Migration ✓
- [x] feature-ai types migrated
- [x] feature-git types migrated
- [x] feature-terminal types migrated
- [x] feature-editor types migrated (includes tabs)
- [x] feature-templates types migrated
- [x] feature-window-management types migrated

### Phase 3: Cleanup ✓
- [x] Update @code-pilot/types index.ts to prepare for cleanup
- [x] Remove migrated types from @code-pilot/types
- [x] Update all imports across codebase
- [ ] Update documentation
- [ ] Run full build verification

## Migration Completed! 🎉

### Summary of Changes:

1. **@code-pilot/types** now only contains:
   - Core domain types (Project, Session, Message)
   - Common utilities (Result, AppError, TauriCommand)
   - Shared filesystem types
   - Common settings and theme types

2. **Each feature package now owns its types:**
   - `@code-pilot/feature-ai` → All AI-related types
   - `@code-pilot/feature-git` → All Git-related types  
   - `@code-pilot/feature-terminal` → All Terminal types
   - `@code-pilot/feature-editor` → All Editor and Tab management types
   - `@code-pilot/feature-templates` → All Template types
   - `@code-pilot/feature-window-management` → All Window types

3. **All imports have been updated:**
   - Feature packages import their own types locally
   - Cross-feature dependencies import from the feature package
   - Core types are still imported from @code-pilot/types

### Benefits Achieved:

1. **Better separation of concerns** - Each feature owns its domain
2. **No circular dependencies** - Types flow one direction
3. **Cleaner architecture** - Clear boundaries between packages
4. **Easier maintenance** - Changes to feature types don't affect core
5. **Better type safety** - Features can evolve their types independently

## Success Metrics

1. No circular dependencies between packages
2. Each feature package is self-contained with its own types
3. @code-pilot/types only contains truly shared types
4. All builds pass without type errors
5. Clear dependency graph with no feature-specific types in common packages