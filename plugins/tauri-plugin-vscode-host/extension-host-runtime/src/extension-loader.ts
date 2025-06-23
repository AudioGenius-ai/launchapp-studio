import * as path from 'path';
import * as fs from 'fs/promises';

export interface Extension {
    id: string;
    name: string;
    version: string;
    main?: string;
    activationEvents?: string[];
    contributes?: any;
}

export class ExtensionLoader {
    private loadedExtensions = new Map<string, any>();
    
    constructor(private extensionsDir: string) {}
    
    async discoverExtensions(): Promise<Extension[]> {
        const extensions: Extension[] = [];
        
        try {
            const dirs = await fs.readdir(this.extensionsDir);
            
            for (const dir of dirs) {
                const extensionPath = path.join(this.extensionsDir, dir);
                const packageJsonPath = path.join(extensionPath, 'package.json');
                
                try {
                    const stat = await fs.stat(extensionPath);
                    if (!stat.isDirectory()) continue;
                    
                    const packageJson = JSON.parse(
                        await fs.readFile(packageJsonPath, 'utf-8')
                    );
                    
                    if (packageJson.engines?.vscode) {
                        extensions.push({
                            id: `${packageJson.publisher}.${packageJson.name}`,
                            name: packageJson.name,
                            version: packageJson.version,
                            main: packageJson.main,
                            activationEvents: packageJson.activationEvents,
                            contributes: packageJson.contributes,
                        });
                    }
                } catch (error) {
                    // Skip invalid extensions
                    console.error(`Failed to load extension from ${dir}:`, error);
                }
            }
        } catch (error) {
            console.error('Failed to discover extensions:', error);
        }
        
        return extensions;
    }
    
    async loadExtension(extensionId: string): Promise<Extension> {
        // Find extension directory
        const parts = extensionId.split('.');
        const dirName = `${parts[0]}.${parts[1]}-${parts[2] || '*'}`;
        
        const dirs = await fs.readdir(this.extensionsDir);
        const extensionDir = dirs.find(d => d.startsWith(dirName));
        
        if (!extensionDir) {
            throw new Error(`Extension ${extensionId} not found`);
        }
        
        const extensionPath = path.join(this.extensionsDir, extensionDir);
        const packageJsonPath = path.join(extensionPath, 'package.json');
        
        const packageJson = JSON.parse(
            await fs.readFile(packageJsonPath, 'utf-8')
        );
        
        return {
            id: extensionId,
            name: packageJson.name,
            version: packageJson.version,
            main: packageJson.main,
            activationEvents: packageJson.activationEvents,
            contributes: packageJson.contributes,
        };
    }
    
    async activateExtension(extension: Extension, api: any): Promise<void> {
        if (!extension.main) return;
        
        const extensionPath = path.join(this.extensionsDir, extension.id);
        const mainPath = path.join(extensionPath, extension.main);
        
        try {
            // Load the extension module
            const extensionModule = require(mainPath);
            
            // Call activate if it exists
            if (typeof extensionModule.activate === 'function') {
                const context = this.createExtensionContext(extension);
                await extensionModule.activate(context);
                this.loadedExtensions.set(extension.id, extensionModule);
            }
        } catch (error) {
            throw new Error(`Failed to activate extension ${extension.id}: ${error}`);
        }
    }
    
    private createExtensionContext(extension: Extension): any {
        return {
            subscriptions: [],
            extensionPath: path.join(this.extensionsDir, extension.id),
            globalState: new Map(),
            workspaceState: new Map(),
            extensionUri: {
                scheme: 'file',
                path: path.join(this.extensionsDir, extension.id),
            },
        };
    }
    
    deactivateAll() {
        for (const [id, module] of this.loadedExtensions) {
            try {
                if (typeof module.deactivate === 'function') {
                    module.deactivate();
                }
            } catch (error) {
                console.error(`Failed to deactivate extension ${id}:`, error);
            }
        }
        this.loadedExtensions.clear();
    }
}