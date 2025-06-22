#!/bin/bash

# Build script for MCP server sidecar

set -e

echo "Building MCP server sidecar..."

# Get the target triple
TARGET_TRIPLE=$(rustc -vV | grep host | cut -f2 -d' ')
echo "Building for target: $TARGET_TRIPLE"

# Build the MCP server
cd binaries/mcp-server
cargo build --release

# Copy and rename with target triple
cp target/release/launchapp-mcp-sidecar ../launchapp-mcp-sidecar-$TARGET_TRIPLE

echo "MCP server built successfully: binaries/launchapp-mcp-sidecar-$TARGET_TRIPLE"