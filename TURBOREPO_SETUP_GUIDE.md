# Turborepo Setup Guide for Code Pilot Studio

## Current Issues Identified

1. **Mixed Build Systems**: Some packages use Vite, others use tsc, without clear strategy
2. **Missing Exports**: Many packages lack proper `exports` field in package.json
3. **Outdated Turbo Config**: Using old `pipeline` syntax instead of `tasks`
4. **Build Order Issues**: Dependencies between packages not properly configured
5. **TypeScript Configuration**: Inconsistent TS config across packages

## Recommended Architecture

### Package Categories

1. **Utility Packages** (Just-in-Time Compilation)
   - `@code-pilot/types`
   - `@code-pilot/utils`
   - `@code-pilot/hooks`
   - These export TypeScript directly, compiled by consuming packages

2. **UI Component Libraries** (Compiled with tsc)
   - `@code-pilot/ui`
   - `@code-pilot/ui-kit`
   - These need to be pre-compiled for consistent behavior

3. **Feature Packages** (Compiled with Vite)
   - `@code-pilot/feature-*`
   - These are complex modules with components, hooks, and services
   - Use Vite for better tree-shaking and modern output

4. **Plugin Packages** (TypeScript bindings only)
   - `@code-pilot/plugin-*`
   - These provide TypeScript bindings for Rust plugins

5. **Applications** (Vite bundling)
   - `@code-pilot/desktop`
   - The main Tauri application

## Implementation Steps

### 1. Update turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["NODE_ENV"]
    },
    "build:packages": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    },
    "dev": {
      "dependsOn": ["^build:packages"],
      "persistent": true,
      "cache": false
    },
    "dev:packages": {
      "persistent": true,
      "cache": false
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "clean": {
      "cache": false
    },
    "tauri:dev": {
      "dependsOn": ["^build:packages"],
      "cache": false,
      "persistent": true,
      "env": ["TAURI_*"]
    },
    "tauri:build": {
      "dependsOn": ["build"],
      "outputs": ["src-tauri/target/**"],
      "cache": true,
      "env": ["TAURI_*"]
    }
  }
}
```

### 2. Package.json Templates

#### For Utility Packages (JIT)
```json
{
  "name": "@code-pilot/types",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  }
}
```

#### For UI Libraries (Compiled with tsc)
```json
{
  "name": "@code-pilot/ui-kit",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc && cp src/styles.css dist/",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  }
}
```

#### For Feature Packages (Compiled with Vite)
```json
{
  "name": "@code-pilot/feature-projects",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && tsc --emitDeclarationOnly",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  }
}
```

### 3. Vite Configuration for Feature Packages

```typescript
// vite.config.ts for feature packages
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { peerDependencies, dependencies } from './package.json';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.mjs' : 'index.js'
    },
    rollupOptions: {
      external: [
        ...Object.keys(peerDependencies || {}),
        ...Object.keys(dependencies || {}).filter(dep => 
          dep.startsWith('@code-pilot/') || 
          dep.startsWith('react') || 
          dep.startsWith('@tauri-apps/')
        )
      ],
      output: {
        preserveModules: false,
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: false // Don't minify library code
  }
});
```

### 4. TypeScript Configuration

#### Base tsconfig.json (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

#### For Compiled Packages
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowImportingTsExtensions": false
  },
  "include": ["src"],
  "exclude": ["**/*.test.ts", "**/*.test.tsx"]
}
```

### 5. Build Order and Dependencies

1. **Level 0** (No dependencies)
   - `@code-pilot/types`
   - `@code-pilot/utils`

2. **Level 1** (Depend on Level 0)
   - `@code-pilot/core`
   - `@code-pilot/hooks`
   - `@code-pilot/ui`

3. **Level 2** (Depend on Level 0-1)
   - `@code-pilot/ui-kit`
   - `@code-pilot/services`
   - `@code-pilot/state`

4. **Level 3** (Feature packages)
   - `@code-pilot/feature-*`
   - `@code-pilot/plugin-*`

5. **Level 4** (Applications)
   - `@code-pilot/desktop`

### 6. Root Package Scripts

```json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:desktop": "turbo dev --filter=@code-pilot/desktop...",
    "build": "turbo build",
    "build:packages": "turbo build:packages",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules",
    "clean:cache": "rm -rf node_modules/.cache .turbo",
    "deps:check": "pnpm -r exec depcheck",
    "deps:update": "pnpm -r update -i",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

### 7. Common Issues and Solutions

#### Issue: "Importing binding name 'X' is not found"
**Solution**: Ensure the package has proper exports field and is built before importing.

#### Issue: Dynamic import warnings
**Solution**: These are normal for bundled third-party code. Suppress in Vite config if needed.

#### Issue: TypeScript path aliases not working
**Solution**: Don't use path aliases in library packages. Use them only in applications.

#### Issue: Changes not reflecting in dev mode
**Solution**: Ensure watch mode is working and Turborepo is configured to rebuild dependencies.

### 8. Migration Checklist

- [ ] Update turbo.json to new format
- [ ] Categorize all packages (JIT, Compiled, Feature, Plugin, App)
- [ ] Update package.json for each package with proper exports
- [ ] Add Vite configs to feature packages
- [ ] Update TypeScript configs
- [ ] Test build order with `turbo build --dry-run`
- [ ] Clear all caches and test full build
- [ ] Update CI/CD scripts if needed

### 9. Testing the Setup

```bash
# Clean everything
pnpm clean:cache
pnpm clean

# Install dependencies
pnpm install

# Test build order
turbo build --dry-run

# Build all packages
pnpm build:packages

# Start development
pnpm dev:desktop
```

## Benefits of This Setup

1. **Clear Package Strategy**: Each package type has a defined compilation approach
2. **Optimized Builds**: Turborepo caches compiled packages
3. **Fast Development**: JIT packages don't need builds
4. **Better DX**: Proper exports enable IDE navigation
5. **Type Safety**: Consistent TypeScript configuration
6. **Scalability**: Easy to add new packages following patterns

## Next Steps

1. Implement the new turbo.json
2. Update package.json files for proper exports
3. Add Vite configs to feature packages
4. Test the build pipeline
5. Document any project-specific adjustments