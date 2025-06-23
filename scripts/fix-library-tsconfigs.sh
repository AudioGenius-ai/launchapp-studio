#!/bin/bash

# Update tsconfig.json for all packages that use vite for building

for vite_config in packages/*/vite.config.ts packages/features/*/vite.config.ts; do
    if [ -f "$vite_config" ]; then
        package_dir=$(dirname "$vite_config")
        tsconfig="$package_dir/tsconfig.json"
        
        if [ -f "$tsconfig" ]; then
            echo "Updating $tsconfig..."
            
            # Create new tsconfig
            cat > "$tsconfig" << 'EOF'
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declarationDir": "./dist",
    "composite": false,
    "incremental": false,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
EOF
            
            # Fix path for packages directly under packages/
            if [[ "$package_dir" == packages/* ]] && [[ "$package_dir" != packages/features/* ]]; then
                sed -i '' 's/"extends": "\.\.\/\.\.\/\.\.\/tsconfig.base.json"/"extends": "..\/..\/tsconfig.base.json"/g' "$tsconfig"
            fi
            
            echo "✅ Updated $tsconfig"
        fi
    fi
done

echo "Done!"