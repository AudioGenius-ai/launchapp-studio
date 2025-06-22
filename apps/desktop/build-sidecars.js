#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building MCP server sidecar...');

// Get the target triple
const rustInfo = execSync('rustc -vV', { encoding: 'utf8' });
const targetMatch = /host: (\S+)/g.exec(rustInfo);
if (!targetMatch) {
  console.error('Failed to determine platform target triple');
  process.exit(1);
}
const targetTriple = targetMatch[1];
console.log(`Building for target: ${targetTriple}`);

// Build the MCP server
const mcpServerPath = path.join(__dirname, 'src-tauri', 'binaries', 'mcp-server');
console.log(`Building in ${mcpServerPath}...`);

try {
  execSync('cargo build --release', {
    cwd: mcpServerPath,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Failed to build MCP server:', error.message);
  process.exit(1);
}

// Determine binary extension
const extension = process.platform === 'win32' ? '.exe' : '';

// Copy and rename with target triple
const sourcePath = path.join(mcpServerPath, 'target', 'release', `launchapp-mcp-sidecar${extension}`);
const targetPath = path.join(__dirname, 'src-tauri', 'binaries', `launchapp-mcp-sidecar-${targetTriple}${extension}`);

try {
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`MCP server built successfully: ${targetPath}`);
} catch (error) {
  console.error('Failed to copy binary:', error.message);
  process.exit(1);
}

// Make executable on Unix-like systems
if (process.platform !== 'win32') {
  try {
    fs.chmodSync(targetPath, 0o755);
  } catch (error) {
    console.error('Failed to make binary executable:', error.message);
  }
}