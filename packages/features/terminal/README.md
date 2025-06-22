# @code-pilot/feature-terminal

Terminal feature package for Code Pilot Studio.

## Features

- Full terminal emulation with xterm.js
- Multiple concurrent terminal sessions
- Terminal tabs with drag and drop support
- Theme support with predefined themes
- Unicode support
- Web links detection
- Search functionality
- Fit addon for responsive sizing
- State management with Zustand

## Components

- `Terminal` - Base terminal component with xterm.js
- `EnhancedTerminal` - Enhanced terminal with additional features
- `TerminalPanel` - Panel with terminal tabs
- `EnhancedTerminalPanel` - Enhanced panel with advanced features
- `TerminalTabs` - Tab management for terminals
- `TerminalPage` - Full page terminal view

## Hooks

- `useTerminalData` - Hook for terminal data management and event handling

## Stores

- `useTerminalStore` - Zustand store for terminal state management

## Usage

```tsx
import { TerminalPage } from '@code-pilot/feature-terminal';

// In your app
<TerminalPage />
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch mode
pnpm dev
```