#!/usr/bin/env node

import { ExtensionHost } from './extension-host';
import { parseArgs } from './utils';

async function main() {
    const args = parseArgs(process.argv.slice(2));
    
    const host = new ExtensionHost({
        workspacePath: typeof args.workspace === 'string' ? args.workspace : process.cwd(),
        extensionsDir: typeof args['extensions-dir'] === 'string' ? args['extensions-dir'] : '',
        debug: args.inspect !== undefined,
    });
    
    // Handle process signals
    process.on('SIGTERM', () => {
        host.shutdown();
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        host.shutdown();
        process.exit(0);
    });
    
    // Start the extension host
    try {
        await host.start();
    } catch (error) {
        console.error('Failed to start extension host:', error);
        process.exit(1);
    }
}

main().catch(console.error);