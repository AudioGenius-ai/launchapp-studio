#!/bin/bash

# Update all vite configs to use aliases instead of dts plugin

for vite_config in packages/*/vite.config.ts packages/features/*/vite.config.ts; do
    if [ -f "$vite_config" ]; then
        echo "Updating $vite_config..."
        
        # Create new vite config
        cat > "$vite_config" << 'EOF'
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PACKAGE_NAME',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        '@tauri-apps/api', 
        'lucide-react',
        /^@code-pilot\//
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@code-pilot/core': resolve(__dirname, '../../core/src'),
      '@code-pilot/types': resolve(__dirname, '../../types/src'),
      '@code-pilot/ui': resolve(__dirname, '../../ui/src'),
      '@code-pilot/utils': resolve(__dirname, '../../utils/src'),
      '@code-pilot/services': resolve(__dirname, '../../services/src'),
    }
  }
});
EOF
        
        # Get package name
        package_dir=$(dirname "$vite_config")
        package_name=$(grep '"name"' "$package_dir/package.json" | sed -E 's/.*"name": "@code-pilot\/(.+)".*/\1/' | sed 's/-/_/g')
        
        # Replace PACKAGE_NAME
        sed -i '' "s/PACKAGE_NAME/$package_name/g" "$vite_config"
        
        # Update package.json build script
        sed -i '' 's/"build": "vite build"/"build": "vite build \&\& tsc --emitDeclarationOnly --declaration --declarationDir dist"/g' "$package_dir/package.json"
        
        # Update tsconfig.json to disable composite
        if [ -f "$package_dir/tsconfig.json" ]; then
            # Add composite: false to compilerOptions
            sed -i '' '/"compilerOptions": {/,/}/ s/}$/,\n    "composite": false,\n    "incremental": false\n  }/' "$package_dir/tsconfig.json"
            # Remove references section
            sed -i '' '/"references":/,/\]/d' "$package_dir/tsconfig.json"
        fi
        
        echo "✅ Updated $vite_config"
    fi
done

echo "Done!"