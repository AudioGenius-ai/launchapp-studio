#!/bin/bash

# Script to check that no compiled files exist in src directories

echo "Checking for compiled files in src directories..."

# Find compiled files in src directories
compiled_files=$(find packages -path "*/node_modules" -prune -o -path "*/dist" -prune -o -path "*/build" -prune -o -type d -name "src" -exec sh -c 'find "$1" \( -name "*.js" -o -name "*.d.ts" -o -name "*.js.map" -o -name "*.d.ts.map" \) -type f -print' _ {} \; 2>/dev/null)

if [ -n "$compiled_files" ]; then
    echo "❌ Error: Found compiled files in src directories:"
    echo "$compiled_files"
    echo ""
    echo "Please remove these files before committing."
    echo "Run: find packages -path '*/src' -name '*.js' -o -name '*.d.ts' -o -name '*.js.map' -o -name '*.d.ts.map' | xargs rm -f"
    exit 1
else
    echo "✅ No compiled files found in src directories"
    exit 0
fi