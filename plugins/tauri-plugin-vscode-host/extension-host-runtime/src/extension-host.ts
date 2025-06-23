import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { ExtensionLoader } from './extension-loader';
import { ApiProvider } from './api-provider';
import { IpcHandler } from './ipc-handler';

export interface ExtensionHostConfig {
    workspacePath: string;
    extensionsDir: string;
    debug?: boolean;
}

export class ExtensionHost {
    private loader: ExtensionLoader;
    private apiProvider: ApiProvider;
    private ipcHandler: IpcHandler;
    private connection: any;
    
    constructor(private config: ExtensionHostConfig) {
        this.loader = new ExtensionLoader(config.extensionsDir);
        this.apiProvider = new ApiProvider();
        this.ipcHandler = new IpcHandler();
    }
    
    async start() {
        // Set up JSON-RPC connection
        const reader = new StreamMessageReader(process.stdin);
        const writer = new StreamMessageWriter(process.stdout);
        this.connection = createMessageConnection(reader, writer);
        
        // Initialize IPC handler
        this.ipcHandler.setup(this.connection);
        
        // Register API methods
        this.registerApiMethods();
        
        // Start listening
        this.connection.listen();
        
        // Send initialization message
        this.sendMessage({
            type: 'initialized',
            apiVersion: '1.0.0',
            nodeVersion: process.version,
        });
        
        // Load extensions
        await this.loadExtensions();
    }
    
    private registerApiMethods() {
        // Handle extension load requests
        this.connection.onRequest('extension.load', async (params: any) => {
            try {
                const extension = await this.loader.loadExtension(params.extensionId);
                return { success: true, extension };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        });
        
        // Handle command execution
        this.connection.onRequest('command.execute', async (params: any) => {
            try {
                const result = await this.apiProvider.executeCommand(params.command, params.args);
                return { success: true, result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        });
        
        // Handle API calls
        this.connection.onRequest('api.call', async (params: any) => {
            try {
                const result = await this.apiProvider.callApi(params.method, params.params);
                return { success: true, result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        });
    }
    
    private async loadExtensions() {
        try {
            const extensions = await this.loader.discoverExtensions();
            console.error(`Discovered ${extensions.length} extensions`);
            
            for (const extension of extensions) {
                try {
                    await this.loader.activateExtension(extension, this.apiProvider.getApi());
                    this.sendMessage({
                        type: 'extensionActivated',
                        extensionId: extension.id,
                        activationTime: Date.now(),
                    });
                } catch (error: any) {
                    this.sendMessage({
                        type: 'error',
                        message: `Failed to activate extension ${extension.id}`,
                        stack: error.stack,
                        source: extension.id,
                    });
                }
            }
        } catch (error: any) {
            this.sendMessage({
                type: 'error',
                message: 'Failed to load extensions',
                stack: error.stack,
            });
        }
    }
    
    private sendMessage(message: any) {
        // Send as JSON to stdout for the Rust side to parse
        console.log(JSON.stringify(message));
    }
    
    shutdown() {
        this.connection?.dispose();
        this.loader.deactivateAll();
    }
}