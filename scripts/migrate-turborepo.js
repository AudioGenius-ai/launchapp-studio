#!/usr/bin/env node

/**
 * Migration script to update package.json files for proper Turborepo setup
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Package categories and their configurations
const packageConfigs = {
  // JIT packages (TypeScript source files)
  jit: {
    packages: ['types', 'utils', 'hooks'],
    template: {
      exports: {
        '.': {
          types: './src/index.ts',
          default: './src/index.ts'
        }
      },
      scripts: {
        typecheck: 'tsc --noEmit',
        lint: 'eslint src'
      }
    }
  },
  
  // UI libraries (compiled with tsc)
  ui: {
    packages: ['ui', 'ui-kit'],
    template: {
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
          require: './dist/index.cjs'
        }
      },
      scripts: {
        dev: 'tsc --watch',
        build: 'tsc',
        'build:packages': 'tsc',
        typecheck: 'tsc --noEmit',
        lint: 'eslint src'
      }
    }
  },
  
  // Core packages (compiled with tsc)
  core: {
    packages: ['core', 'services', 'state', 'router', 'themes'],
    template: {
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
          require: './dist/index.cjs'
        }
      },
      scripts: {
        dev: 'tsc --watch',
        build: 'tsc',
        'build:packages': 'tsc',
        typecheck: 'tsc --noEmit',
        lint: 'eslint src'
      }
    }
  },
  
  // Feature packages (compiled with Vite)
  features: {
    packages: [
      'feature-projects',
      'feature-editor',
      'feature-terminal',
      'feature-git',
      'feature-ai',
      'feature-explorer',
      'feature-templates',
      'feature-window-management'
    ],
    template: {
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.mjs',
          require: './dist/index.js'
        }
      },
      scripts: {
        dev: 'vite build --watch',
        build: 'vite build && tsc --emitDeclarationOnly',
        'build:packages': 'vite build && tsc --emitDeclarationOnly',
        typecheck: 'tsc --noEmit',
        lint: 'eslint src'
      }
    }
  },
  
  // Plugin packages (TypeScript bindings)
  plugins: {
    packages: ['plugin-claude', 'plugin-git', 'plugin-terminal'],
    template: {
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.mjs',
          require: './dist/index.js'
        }
      },
      scripts: {
        dev: 'vite build --watch',
        build: 'vite build && tsc --emitDeclarationOnly',
        typecheck: 'tsc --noEmit',
        lint: 'eslint src'
      }
    }
  }
};

// Update a package.json file
function updatePackageJson(packagePath, updates) {
  const fullPath = join(rootDir, packagePath);
  
  if (!existsSync(fullPath)) {
    console.warn(`⚠️  Package not found: ${packagePath}`);
    return;
  }
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const pkg = JSON.parse(content);
    
    // Apply updates
    Object.assign(pkg, updates);
    
    // Ensure type: "module" for all packages
    pkg.type = 'module';
    
    // Write back
    writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ Updated: ${packagePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${packagePath}:`, error.message);
  }
}

// Process all packages
console.log('🚀 Starting Turborepo migration...\n');

for (const [category, config] of Object.entries(packageConfigs)) {
  console.log(`\n📦 Processing ${category} packages:`);
  
  for (const pkgName of config.packages) {
    const packagePath = category === 'features' || category === 'plugins' 
      ? `packages/features/${pkgName.replace('feature-', '').replace('plugin-', '')}/package.json`
      : `packages/${pkgName}/package.json`;
    
    updatePackageJson(packagePath, config.template);
  }
}

// Update root turbo.json
console.log('\n📝 Updating turbo.json...');
const newTurboConfig = readFileSync(join(rootDir, 'turbo.json.new'), 'utf-8');
writeFileSync(join(rootDir, 'turbo.json'), newTurboConfig);
console.log('✅ Updated turbo.json');

// Create Vite configs for feature packages
console.log('\n⚡ Creating Vite configs for feature packages...');

const viteConfigTemplate = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import pkg from './package.json';

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
        'react',
        'react-dom',
        'react/jsx-runtime',
        ...Object.keys(pkg.dependencies || {}).filter(dep => 
          dep.startsWith('@code-pilot/') || 
          dep.startsWith('@tauri-apps/')
        ),
        ...Object.keys(pkg.peerDependencies || {})
      ],
      output: {
        preserveModules: false,
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime'
        }
      }
    },
    sourcemap: true,
    minify: false
  }
});
`;

for (const pkgName of packageConfigs.features.packages) {
  const configPath = join(rootDir, 'packages/features', pkgName.replace('feature-', ''), 'vite.config.ts');
  
  if (!existsSync(configPath)) {
    writeFileSync(configPath, viteConfigTemplate);
    console.log(`✅ Created Vite config for ${pkgName}`);
  }
}

console.log('\n✨ Migration complete!');
console.log('\nNext steps:');
console.log('1. Run: pnpm install');
console.log('2. Run: pnpm clean:cache');
console.log('3. Run: pnpm build:packages');
console.log('4. Run: pnpm dev:desktop');