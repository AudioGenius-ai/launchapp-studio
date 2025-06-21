# Tab Manager Component

The TabManager component provides advanced tab management functionality for the Code Pilot Studio editor, including split panes, tab groups, drag-and-drop, and keyboard shortcuts.

## Features

### Tab Management
- **Multiple Tab Groups**: Organize tabs into separate groups
- **Drag and Drop**: Move tabs between groups or reorder within a group
- **Pin Tabs**: Keep important tabs from being accidentally closed
- **Recently Closed**: Restore recently closed tabs with a single click

### Split Panes
- **Horizontal/Vertical Splits**: Split the editor into multiple panes
- **Resizable Panes**: Drag dividers to resize panes
- **Nested Splits**: Create complex layouts with nested splits
- **Smart Layout**: Automatically collapse empty panes

### Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|---------|-------------|
| `Ctrl+Tab` | Next Tab | Navigate to the next tab in the current group |
| `Ctrl+Shift+Tab` | Previous Tab | Navigate to the previous tab in the current group |
| `Ctrl+W` | Close Tab | Close the current tab |
| `Ctrl+Shift+T` | Reopen Tab | Reopen the most recently closed tab |
| `Ctrl+\` | Split Horizontal | Split the current group horizontally |
| `Ctrl+Shift+\` | Split Vertical | Split the current group vertically |
| `Ctrl+K` | Focus Next Group | Move focus to the next editor group |
| `Ctrl+Shift+K` | Focus Previous Group | Move focus to the previous editor group |

### Context Menu Actions
Right-click on any tab to access:
- Close
- Close Others
- Close to the Right
- Close All
- Split Right
- Split Down

## Usage

```tsx
import { TabManagerContainer } from '@code-pilot/ui';
import { FileService } from '@code-pilot/core';

function MyEditor() {
  const fileService = FileService.getInstance();
  const editorRef = useRef<any>(null);

  const handleFileOpen = async (path: string) => {
    await editorRef.current.openFile(path);
  };

  const handleSave = async () => {
    await editorRef.current.saveFile();
  };

  return (
    <TabManagerContainer
      ref={editorRef}
      fileService={fileService}
      onFileChange={(file) => console.log('File changed:', file)}
    />
  );
}
```

## API Reference

### TabManagerContainer

#### Props
- `fileService: FileService` - File service instance for file operations
- `className?: string` - Additional CSS classes
- `onFileChange?: (file: EditorFile) => void` - Callback when file content changes

#### Methods (via ref)
- `openFile(path: string): Promise<void>` - Open a file in a new tab
- `saveFile(): Promise<void>` - Save the current file
- `saveAllFiles(): Promise<void>` - Save all open files
- `closeAllFiles(): void` - Close all open files
- `getActiveFile(): EditorFile | undefined` - Get the currently active file
- `getOpenFiles(): EditorFile[]` - Get all open files
- `hasUnsavedChanges(): boolean` - Check if any files have unsaved changes
- `saveSession(): TabSessionData` - Save the current session state
- `restoreSession(data: TabSessionData): Promise<void>` - Restore a saved session
- `reopenRecentTab(index?: number): Promise<void>` - Reopen a recently closed tab

### TabGroup

Individual tab group component with drag-and-drop support.

#### Props
- `group: TabGroup` - Tab group data
- `tabs: EditorTab[]` - Array of tabs in this group
- `isActive: boolean` - Whether this group is currently active
- `onTabClick: (tabId: string) => void` - Tab click handler
- `onTabClose: (tabId: string) => void` - Tab close handler
- `onTabPin?: (tabId: string) => void` - Tab pin handler
- `onTabUnpin?: (tabId: string) => void` - Tab unpin handler
- `onTabDrop: (tabId: string, groupId: string, index: number) => void` - Tab drop handler
- `onGroupClick: () => void` - Group click handler
- `onSplit?: (direction: 'horizontal' | 'vertical') => void` - Split handler

### SplitPane

Resizable split pane container.

#### Props
- `pane: SplitPane` - Split pane configuration
- `onSizeChange: (sizes: number[]) => void` - Size change handler
- `children: React.ReactNode[]` - Child panes or groups

### RecentlyClosedTabs

Display and restore recently closed tabs.

#### Props
- `tabs: RecentlyClosedTab[]` - Array of recently closed tabs
- `onReopen: (index: number) => void` - Reopen handler
- `maxItems?: number` - Maximum items to display (default: 10)

## Architecture

The Tab Manager uses a hierarchical structure:

```
TabManagerContainer
├── TabService (manages state and operations)
├── EditorService (handles file operations)
└── Layout Tree
    ├── SplitPane (horizontal/vertical)
    │   ├── TabGroup
    │   │   ├── EditorTabs
    │   │   └── MonacoEditor
    │   └── SplitPane (nested)
    │       ├── TabGroup
    │       └── TabGroup
    └── TabGroup (single group layout)
```

## Persistence

The Tab Manager supports session persistence:

```tsx
// Save session
const sessionData = editorRef.current.saveSession();
localStorage.setItem('editorSession', JSON.stringify(sessionData));

// Restore session
const savedSession = localStorage.getItem('editorSession');
if (savedSession) {
  const sessionData = JSON.parse(savedSession);
  await editorRef.current.restoreSession(sessionData);
}
```

## Customization

### Configuration

```tsx
import { TabManagerConfiguration } from '@code-pilot/types';

const config: Partial<TabManagerConfiguration> = {
  enableSplitView: true,
  maxRecentlyClosedTabs: 10,
  showTabIcons: true,
  tabHeight: 35,
  tabMinWidth: 120,
  tabMaxWidth: 200,
  enablePreview: true,
  autoSaveOnTabSwitch: false
};

// Apply configuration via TabService
tabService.updateConfiguration(config);
```

### Custom Keyboard Shortcuts

```tsx
import { TabKeyboardShortcut } from '@code-pilot/types';

const customShortcut: TabKeyboardShortcut = {
  id: 'myCustomAction',
  key: 'p',
  modifiers: ['ctrl', 'shift'],
  action: () => console.log('Custom action!'),
  description: 'My custom action'
};

tabService.registerKeyboardShortcut(customShortcut);
```

## Best Practices

1. **Session Persistence**: Save sessions periodically to prevent data loss
2. **Memory Management**: Close unused tabs to free memory
3. **Keyboard Navigation**: Use keyboard shortcuts for efficient navigation
4. **Split Layouts**: Use splits judiciously - too many can impact performance
5. **Tab Limits**: Consider implementing a maximum tab limit for better performance