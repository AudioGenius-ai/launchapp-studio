#!/bin/bash

# Script to migrate packages from tsup to vite

# Function to create vite.config.ts for a package
create_vite_config() {
    local package_dir=$1
    local package_name=$2
    
    cat > "$package_dir/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PACKAGE_NAME',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@tauri-apps/api', 'lucide-react', /^@code-pilot\//],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
EOF
    
    # Replace PACKAGE_NAME with actual package name
    sed -i '' "s/PACKAGE_NAME/$package_name/g" "$package_dir/vite.config.ts"
}

# Find all packages with tsup
packages_with_tsup=$(find packages -name "package.json" -type f -exec grep -l '"tsup"' {} \; | grep -v node_modules)

echo "Found packages using tsup:"
echo "$packages_with_tsup"
echo ""

for package_json in $packages_with_tsup; do
    package_dir=$(dirname "$package_json")
    package_name=$(grep '"name"' "$package_json" | sed -E 's/.*"name": "(.+)".*/\1/' | sed 's/@code-pilot\///' | sed 's/-/_/g')
    
    echo "Migrating $package_dir..."
    
    # Create vite.config.ts
    create_vite_config "$package_dir" "$package_name"
    
    # Update package.json scripts
    sed -i '' 's/"build": "tsup"/"build": "vite build"/g' "$package_json"
    sed -i '' 's/"dev": "tsup --watch"/"dev": "vite build --watch"/g' "$package_json"
    
    # Update devDependencies
    sed -i '' '/"tsup":/d' "$package_json"
    
    # Remove tsup config if exists
    rm -f "$package_dir/tsup.config.ts"
    rm -f "$package_dir/tsup.config.js"
    
    echo "✅ Migrated $package_dir"
done

echo ""
echo "Migration complete! Now run 'pnpm install' to update dependencies."