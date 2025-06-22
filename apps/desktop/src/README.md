# Desktop App Source Structure

This directory contains the source code for the Code Pilot Studio desktop application.

## Directory Structure

```
src/
├── app/                    # Core application setup and configuration
│   ├── App.tsx            # Root application component
│   ├── providers.tsx      # Global context providers
│   ├── routes.tsx         # Route configuration
│   └── startup.ts         # Application initialization logic
│
├── pages/                 # Page components (route endpoints)
│   ├── HomePage.tsx       # Landing/home page
│   ├── ProjectsPage.tsx   # Projects management page
│   ├── EditorPage.tsx     # Code editor page
│   └── SettingsPage.tsx   # Settings/preferences page
│
├── shells/                # Layout shells/wrappers
│   ├── MainShell.tsx      # Shell for main window views
│   └── IDEShell.tsx       # Shell for IDE/editor views
│
├── config/                # Application configuration
│   ├── constants.ts       # Application constants
│   ├── environment.ts     # Environment detection and config
│   └── feature-flags.ts   # Feature flag management
│
├── features/              # Feature modules (existing)
│   ├── explorer/          # File explorer
│   ├── terminal/          # Terminal integration
│   ├── git/              # Git integration
│   └── ...               # Other features
│
├── layouts/              # Layout components
│   ├── IDELayout.tsx     # Main IDE layout
│   └── PanelManager.tsx  # Panel management
│
├── hooks/                # Custom React hooks
├── assets/               # Static assets
└── main.tsx             # Application entry point
```

## Architecture Notes

### Application Initialization
The app follows a structured initialization flow:
1. `main.tsx` renders the root App component
2. `app/App.tsx` sets up providers and routing
3. `app/startup.ts` handles async initialization tasks
4. Routes render pages wrapped in appropriate shells

### Shell Components
- **MainShell**: Minimal layout for home, projects, and settings pages
- **IDEShell**: Full IDE layout with panels for editor views

### Configuration
- **constants.ts**: Static configuration values
- **environment.ts**: Runtime environment detection
- **feature-flags.ts**: Dynamic feature toggling

### Routing Strategy
- Main window routes: `/`, `/projects`, `/settings`
- Project window routes: `/project/:id/*`
- Development routes: `/editor` (temporary)

## Migration Notes
This structure was introduced in Phase 4 to improve code organization and maintainability. The previous flat structure has been reorganized into logical groups while maintaining backward compatibility.