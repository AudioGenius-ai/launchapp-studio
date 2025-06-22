# @code-pilot/feature-editor

The editor feature module for Code Pilot Studio, providing a complete code editing experience with Monaco Editor integration.

## Features

- **Monaco Editor Integration**: Full-featured code editor based on VS Code's Monaco
- **Tab Management**: Advanced tab system with split views and drag-and-drop
- **Multi-file Support**: Open and edit multiple files simultaneously
- **Syntax Highlighting**: Support for 20+ programming languages
- **Recently Closed Tabs**: Quick access to recently closed files
- **Session Persistence**: Automatically saves and restores your editing session
- **Editor Settings**: Customizable editor preferences

## Components

- `EnhancedEditorPage`: Main editor page component with full IDE features
- `MonacoEditor`: Monaco editor wrapper component
- `EditorTabs`: Tab management UI
- `EditorContainer`: Container component that orchestrates the editor
- `EditorStatusBar`: Status bar showing file info and cursor position
- `EditorSettings`: Settings panel for editor preferences

## Usage

```tsx
import { EnhancedEditorPage } from '@code-pilot/feature-editor';

function App() {
  return <EnhancedEditorPage />;
}
```

## State Management

The package includes a Zustand store for managing editor state:

```tsx
import { useEditorStore } from '@code-pilot/feature-editor';

const { projectPath, showRecentlyClosedPanel } = useEditorStore();
```

## Dependencies

- `@monaco-editor/react`: Monaco editor React wrapper
- `monaco-editor`: Core Monaco editor
- `zustand`: State management
- `@tauri-apps/api`: Tauri API integration
- `lucide-react`: Icon library

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm typecheck
```