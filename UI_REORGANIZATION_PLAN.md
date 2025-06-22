# Code Pilot Studio v2 - UI Reorganization Plan

## Overview

This plan addresses the current UI/UX issues and provides a roadmap to achieve a VSCode-like IDE experience with proper window management, consistent styling, and organized layout.

## Current Issues

### 1. Layout Architecture
- **Duplicate layout systems**: App.tsx sidebar vs IDELayout.tsx panels
- **Inconsistent navigation**: Two different navigation implementations
- **Unused sophisticated features**: IDELayout's resizable panels not utilized

### 2. Styling Problems
- **Mixed styling approaches**: Tailwind hardcoded colors vs CSS variables
- **Theme system not integrated**: Components ignore ThemeProvider
- **Inconsistent spacing**: Different padding/margin strategies across pages

### 3. Window Management
- **Single window limitation**: Everything runs in one window
- **No project isolation**: Projects should open in separate windows
- **Missing window types**: No session, terminal, or git diff windows

## Proposed Architecture

### 1. Window Hierarchy

```
Main Window (Home/Welcome)
├── Project List
├── Recent Files
├── Quick Actions
└── Settings Access

Project Window (Per Project)
├── IDELayout (Primary Container)
│   ├── Activity Bar (Left)
│   ├── Sidebar (File Explorer)
│   ├── Editor Area (Tabs + Monaco)
│   ├── Panel Area (Terminal, Output, Problems)
│   └── Status Bar
└── Window Controls

Session Window (AI Chat)
├── Chat Interface
├── Session History
└── Context Display

Additional Windows
├── Terminal Window
├── Git Diff Window
└── Settings Window
└── Search Window
└── Extensions Window
```

### 2. Implementation Steps

#### Phase 1: Layout Consolidation
1. **Remove duplicate layout system**
   - Remove sidebar from App.tsx
   - Make IDELayout the primary layout for project windows
   - Create MinimalLayout for non-project windows

2. **Fix routing structure**
   ```tsx
   // Main window routes
   <Route path="/" element={<HomePage />} />
   <Route path="/settings" element={<SettingsWindow />} />
   
   // Project window routes
   <Route path="/project/:id" element={<ProjectWindow />}>
     <Route index element={<EditorArea />} />
     <Route path="file/:filePath" element={<EditorArea />} />
   </Route>
   ```

#### Phase 2: Styling Standardization
1. **Create consistent theme system**
   ```css
   :root {
     /* Spacing */
     --spacing-xs: 0.25rem;
     --spacing-sm: 0.5rem;
     --spacing-md: 1rem;
     --spacing-lg: 1.5rem;
     --spacing-xl: 2rem;
     
     /* Layout */
     --sidebar-width: 240px;
     --activity-bar-width: 48px;
     --statusbar-height: 22px;
     --titlebar-height: 30px;
     
     /* Colors - Light Theme */
     --color-background: #ffffff;
     --color-foreground: #333333;
     --color-sidebar-bg: #f3f3f3;
     --color-editor-bg: #ffffff;
     --color-panel-bg: #f3f3f3;
     --color-border: #e5e5e5;
   }
   
   [data-theme="dark"] {
     /* Colors - Dark Theme */
     --color-background: #1e1e1e;
     --color-foreground: #cccccc;
     --color-sidebar-bg: #252526;
     --color-editor-bg: #1e1e1e;
     --color-panel-bg: #252526;
     --color-border: #303030;
   }
   ```

2. **Update all components to use CSS variables**
   - Replace hardcoded Tailwind colors
   - Use consistent spacing variables
   - Implement proper theme switching

#### Phase 3: Window Management Implementation
1. **Create WindowManager service**
   ```typescript
   interface WindowManager {
     openProjectWindow(projectId: string): Promise<Window>;
     openSessionWindow(sessionId?: string): Promise<Window>;
     openTerminalWindow(workingDir?: string): Promise<Window>;
     openGitDiffWindow(repoPath: string): Promise<Window>;
     openSettingsWindow(): Promise<Window>;
   }
   ```

2. **Implement window types**
   - Each window type has its own entry point
   - Shared components via packages/ui
   - Window-specific state management

#### Phase 4: VSCode-like Features
1. **Activity Bar**
   - Explorer
   - Search
   - Source Control
   - Run and Debug
   - Extensions
   - AI Assistant

2. **Command Palette**
   - Cmd/Ctrl+Shift+P activation
   - Fuzzy search
   - Recent commands
   - File navigation

3. **Multi-root Workspaces**
   - Support multiple folders in one project
   - Workspace settings
   - Folder-specific configurations

## Component Structure

### 1. Layout Components
```
packages/ui/src/layouts/
├── IDELayout/           # Full IDE layout for project windows
│   ├── ActivityBar.tsx
│   ├── Sidebar.tsx
│   ├── EditorArea.tsx
│   ├── PanelArea.tsx
│   └── StatusBar.tsx
├── MinimalLayout/       # Simple layout for utility windows
└── WindowFrame/         # Common window chrome/controls
```

### 2. Page Components
```
apps/desktop/src/pages/
├── Home/               # Main window home page
├── Project/            # Project window pages
│   ├── Editor.tsx
│   ├── Search.tsx
│   └── SourceControl.tsx
├── Session/            # AI session window
├── Settings/           # Settings window
└── Terminal/           # Standalone terminal
```

### 3. Styling Structure
```
packages/ui/src/styles/
├── themes/
│   ├── light.css
│   ├── dark.css
│   └── high-contrast.css
├── base.css           # Reset and base styles
├── spacing.css        # Consistent spacing utilities
└── components.css     # Shared component styles
```

## Migration Strategy

### Week 1: Foundation
- [ ] Create UI_REORGANIZATION_PLAN.md (this file)
- [ ] Set up new layout structure
- [ ] Implement WindowManager service
- [ ] Create base window types

### Week 2: Layout Migration
- [ ] Migrate to IDELayout for project windows
- [ ] Remove duplicate navigation
- [ ] Implement proper routing
- [ ] Fix styling inconsistencies

### Week 3: Window Implementation
- [ ] Implement project window separation
- [ ] Add session window support
- [ ] Create terminal window
- [ ] Add git diff window

### Week 4: Polish & Features
- [ ] Command palette
- [ ] Keyboard shortcuts
- [ ] Theme refinement
- [ ] Performance optimization

## Success Criteria

1. **Consistent Visual Design**
   - All components use theme variables
   - Consistent spacing throughout
   - Smooth theme switching

2. **Proper Window Management**
   - Projects open in separate windows
   - Windows remember size/position
   - Clean window lifecycle

3. **VSCode-like Experience**
   - Familiar layout and navigation
   - Command palette functionality
   - Keyboard-driven workflows

4. **Performance**
   - Fast window creation
   - Smooth resizing
   - Efficient memory usage

## Next Steps

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Set up proper testing for window management
4. Create migration scripts for existing projects