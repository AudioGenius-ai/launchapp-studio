# Plugins Directory

This directory contains plugin packages for extending Code Pilot Studio v2 functionality.

## Overview

The plugin system allows third-party developers and users to extend the IDE with custom functionality. Plugins are isolated packages that interact with the core application through a well-defined API.

```mermaid
graph TD
    subgraph "Plugin Architecture"
        A[Plugin System] --> B[AI Providers]
        A --> C[Editor Plugins]
        A --> D[Terminal Plugins]
        A --> E[Version Control]
        A --> F[Language Support]
        
        B --> B1[Claude]
        B --> B2[OpenAI]
        B --> B3[Ollama]
        
        C --> C1[Monaco Editor]
        C --> C2[CodeMirror]
        
        D --> D1[xterm.js]
        D --> D2[tmux Integration]
        
        E --> E1[Git Operations]
        E --> E2[Branch Management]
        E --> E3[Diff Viewer]
        
        F --> F1[TypeScript LSP]
        F --> F2[Python Support]
        F --> F3[Rust Analyzer]
        
        subgraph "Plugin API"
            G[Plugin Interface]
            H[Extension Points]
            I[Security Sandbox]
            J[Event System]
        end
        
        A --> G
        G --> H
        G --> I
        G --> J
        
        H --> H1[Commands]
        H --> H2[Menus]
        H --> H3[Views]
        H --> H4[Providers]
        H --> H5[Themes]
        H --> H6[Keybindings]
    end
    
    style A fill:#5C6BC0,stroke:#3F51B5,color:#fff
    style B fill:#66BB6A,stroke:#4CAF50,color:#fff
    style C fill:#42A5F5,stroke:#2196F3,color:#fff
    style D fill:#FFA726,stroke:#FF9800,color:#fff
    style E fill:#EF5350,stroke:#F44336,color:#fff
    style F fill:#AB47BC,stroke:#9C27B0,color:#fff
    style G fill:#26A69A,stroke:#009688,color:#fff
    style I fill:#FF7043,stroke:#FF5722,color:#fff
```

## Plugin Architecture

```
plugins/
├── ai-providers/       # AI service integrations
│   ├── claude/        # Anthropic Claude
│   ├── openai/        # OpenAI GPT models
│   └── ollama/        # Local LLM support
├── editors/           # Editor enhancements
│   ├── monaco/        # Monaco editor integration
│   └── codemirror/    # CodeMirror alternative
├── terminals/         # Terminal integrations
│   ├── xterm/         # xterm.js terminal
│   └── tmux/          # tmux integration
├── version-control/   # VCS integrations
│   └── git/          # Git operations
└── languages/        # Language support
    ├── typescript/   # TypeScript LSP
    ├── python/       # Python support
    └── rust/         # Rust analyzer
```

## Plugin Types

### AI Providers
Integrate different AI services:
- Chat completions
- Code generation
- Embeddings
- Tool/function calling

### Editor Plugins
Enhance code editing:
- Syntax highlighting
- Code completion
- Formatting
- Refactoring tools

### Terminal Plugins
Terminal emulation and integration:
- Shell integration
- Session management
- Command history
- Multiplexing

### Version Control
Source control operations:
- Commit/push/pull
- Branch management
- Diff viewing
- Merge conflict resolution

### Language Support
Programming language features:
- Language servers
- Debuggers
- Linters
- Formatters

## Plugin API

### Plugin Manifest
Each plugin must have a `plugin.json`:
```json
{
  "id": "code-pilot.git",
  "name": "Git Integration",
  "version": "1.0.0",
  "description": "Git version control integration",
  "author": "Code Pilot Team",
  "main": "./dist/index.js",
  "activationEvents": ["onStartup"],
  "contributes": {
    "commands": [
      {
        "command": "git.commit",
        "title": "Git: Commit"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "git.commit",
          "when": "resourceScheme == file"
        }
      ]
    }
  },
  "dependencies": {
    "@code-pilot/plugin-api": "^1.0.0"
  }
}
```

### Plugin Interface
```typescript
import { Plugin, PluginContext } from '@code-pilot/plugin-api';

export class GitPlugin implements Plugin {
  async activate(context: PluginContext): Promise<void> {
    // Register commands
    context.subscriptions.push(
      context.commands.registerCommand('git.commit', () => {
        this.commit();
      })
    );
    
    // Register providers
    context.registerGitProvider(this.gitProvider);
  }
  
  async deactivate(): Promise<void> {
    // Cleanup
  }
}
```

### Extension Points

Plugins can extend:
1. **Commands** - Add new commands
2. **Menus** - Add menu items
3. **Views** - Add sidebar panels
4. **Providers** - Language features, AI models
5. **Themes** - Color themes, icon themes
6. **Keybindings** - Custom shortcuts

## Development Guide

### Creating a Plugin

1. **Setup**
   ```bash
   mkdir plugins/my-plugin
   cd plugins/my-plugin
   pnpm init
   ```

2. **Install API**
   ```bash
   pnpm add @code-pilot/plugin-api
   ```

3. **Create manifest**
   ```json
   {
     "id": "my-company.my-plugin",
     "name": "My Plugin",
     "version": "1.0.0"
   }
   ```

4. **Implement plugin**
   ```typescript
   export class MyPlugin implements Plugin {
     activate(context: PluginContext) {
       // Plugin logic
     }
   }
   ```

### Plugin Lifecycle

1. **Discovery** - IDE scans plugin directories
2. **Loading** - Plugin manifest is read
3. **Activation** - Plugin is activated based on events
4. **Runtime** - Plugin responds to IDE events
5. **Deactivation** - Cleanup on disable/uninstall

## Plugin Lifecycle Flow

This diagram shows the complete lifecycle of a plugin from discovery to deactivation.

```mermaid
stateDiagram-v2
    [*] --> Discovery: IDE Startup
    
    Discovery --> Validation: Found Plugin
    Discovery --> [*]: No Plugins
    
    Validation --> Loading: Valid Manifest
    Validation --> Failed: Invalid Manifest
    
    Loading --> Registered: Loaded Successfully
    Loading --> Failed: Load Error
    
    Registered --> Activating: Activation Event
    
    Activating --> Active: Activation Success
    Activating --> Failed: Activation Error
    
    Active --> Running: Processing Events
    Running --> Active: Event Handled
    
    Active --> Deactivating: Disable/Uninstall
    Running --> Deactivating: IDE Shutdown
    
    Deactivating --> Inactive: Cleanup Complete
    Deactivating --> Failed: Cleanup Error
    
    Inactive --> Activating: Re-enable
    Inactive --> [*]: Uninstalled
    
    Failed --> [*]: Plugin Removed
    
    note right of Discovery
        Scan plugin directories
        Check package.json
    end note
    
    note right of Validation
        Verify manifest schema
        Check dependencies
        Validate permissions
    end note
    
    note right of Active
        Handle commands
        Provide services
        Listen to events
    end note
```

## Plugin Communication Flow

This diagram illustrates how plugins communicate with the core IDE and each other.

```mermaid
sequenceDiagram
    participant Plugin as Plugin
    participant API as Plugin API
    participant Core as IDE Core
    participant Other as Other Plugins
    participant UI as User Interface
    
    Plugin->>API: Register Command
    API->>Core: Validate & Store
    Core-->>API: Command ID
    API-->>Plugin: Registration Success
    
    UI->>Core: Execute Command
    Core->>API: Route Command
    API->>Plugin: Execute Handler
    Plugin->>API: Perform Action
    
    alt Direct Action
        API->>Core: Update State
        Core->>UI: Update Interface
    else Inter-Plugin Communication
        API->>Core: Emit Event
        Core->>Other: Notify Subscribers
        Other->>Core: Handle Event
        Core->>UI: Update Interface
    end
    
    Plugin->>API: Request Service
    API->>Core: Check Permissions
    Core-->>API: Service Access
    API-->>Plugin: Service Instance
    
    Note over Plugin,UI: All communication goes through<br/>the Plugin API for security
```

## Plugin Security Flow

This diagram shows how the plugin security sandbox enforces permissions and restrictions.

```mermaid
graph TD
    subgraph "Plugin Sandbox"
        Plugin[Plugin Code]
        Sandbox[Security Sandbox]
        Permissions[Permission System]
    end
    
    subgraph "Permission Types"
        FileAccess[File System Access<br/>- Read workspace<br/>- Write workspace<br/>- Read config]
        NetworkAccess[Network Access<br/>- HTTP requests<br/>- WebSocket<br/>- API calls]
        SystemAccess[System Access<br/>- Execute commands<br/>- Environment vars<br/>- Process info]
        UIAccess[UI Access<br/>- Create views<br/>- Show notifications<br/>- Open dialogs]
    end
    
    subgraph "Security Checks"
        Manifest[Manifest Validation]
        Runtime[Runtime Checks]
        Resource[Resource Limits]
        Audit[Security Audit]
    end
    
    subgraph "Enforcement"
        Allow[Allow Operation]
        Deny[Deny & Log]
        Prompt[User Prompt]
    end
    
    Plugin --> Sandbox
    Sandbox --> Permissions
    
    Permissions --> FileAccess
    Permissions --> NetworkAccess
    Permissions --> SystemAccess
    Permissions --> UIAccess
    
    FileAccess --> Manifest
    NetworkAccess --> Manifest
    SystemAccess --> Manifest
    UIAccess --> Manifest
    
    Manifest --> Runtime
    Runtime --> Resource
    Resource --> Audit
    
    Audit -->|Permitted| Allow
    Audit -->|Forbidden| Deny
    Audit -->|User Decision| Prompt
    
    Prompt -->|Approved| Allow
    Prompt -->|Rejected| Deny
    
    style Sandbox fill:#ff9800,stroke:#f57c00
    style Permissions fill:#2196f3,stroke:#1976d2
    style Audit fill:#f44336,stroke:#d32f2f
```

### Security

Plugins run in a sandboxed environment:
- Limited file system access
- No network access without permission
- API calls are validated
- Resource usage monitored

## Publishing Plugins

Future plugin marketplace will support:
- Plugin discovery
- Ratings and reviews
- Automatic updates
- License verification

## Best Practices

1. **Performance**: Don't block the UI thread
2. **Error Handling**: Graceful degradation
3. **Documentation**: Clear README and examples
4. **Testing**: Unit and integration tests
5. **Versioning**: Follow semver
6. **Security**: Validate all inputs

## Examples

### Simple Command Plugin
```typescript
export class HelloPlugin implements Plugin {
  activate(context: PluginContext) {
    context.commands.registerCommand('hello.world', () => {
      context.window.showMessage('Hello, World!');
    });
  }
}
```

### AI Provider Plugin
```typescript
export class ClaudePlugin implements Plugin {
  activate(context: PluginContext) {
    context.ai.registerProvider({
      id: 'claude',
      name: 'Claude',
      chat: async (messages, options) => {
        // Implement Claude API calls
      }
    });
  }
}
```

## Roadmap

- [ ] Plugin API v1.0
- [ ] Sandboxing system
- [ ] Plugin marketplace
- [ ] Hot reload support
- [ ] Plugin dependencies
- [ ] WebAssembly plugins
- [ ] Remote plugins