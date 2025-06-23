import { invoke } from '@tauri-apps/api/core';

export interface McpServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  cwd?: string;
}

export interface McpServerInstance {
  id: string;
  name: string;
  pid: number;
  port: number;
  status: ServerStatus;
  startedAt: string;
  config: McpServerConfig;
}

export type ServerStatus = 'starting' | 'running' | 'stopped' | { error: string };

export interface McpToolInfo {
  name: string;
  description: string;
  inputSchema: any;
}

export interface CallToolRequest {
  instanceId: string;
  toolName: string;
  arguments: any;
}

export interface CallToolResponse {
  content: ContentItem[];
}

export type ContentItem = 
  | { type: 'text'; text: string }
  | { type: 'image'; mimeType: string; data: string }
  | { type: 'error'; error: string };

export class McpWebserver {
  /**
   * Start a new MCP server instance
   * @param config Server configuration
   * @returns Server instance information
   */
  static async startServer(config: McpServerConfig): Promise<McpServerInstance> {
    return await invoke('plugin:mcp-webserver|start_server', { config });
  }

  /**
   * Stop a running MCP server instance
   * @param instanceId Server instance ID
   */
  static async stopServer(instanceId: string): Promise<void> {
    return await invoke('plugin:mcp-webserver|stop_server', { instanceId });
  }

  /**
   * List all running MCP server instances
   * @returns Array of server instances
   */
  static async listInstances(): Promise<McpServerInstance[]> {
    return await invoke('plugin:mcp-webserver|list_instances');
  }

  /**
   * Get information about a specific server instance
   * @param instanceId Server instance ID
   * @returns Server instance info if found
   */
  static async getInstance(instanceId: string): Promise<McpServerInstance | null> {
    return await invoke('plugin:mcp-webserver|get_instance', { instanceId });
  }

  /**
   * Call a tool on a specific MCP server instance
   * @param request Tool call request
   * @returns Tool call response
   */
  static async callTool(request: CallToolRequest): Promise<CallToolResponse> {
    return await invoke('plugin:mcp-webserver|call_tool', { request });
  }

  /**
   * Get list of available tools from a server instance
   * @param instanceId Server instance ID
   * @returns Array of tool definitions
   */
  static async getTools(instanceId: string): Promise<McpToolInfo[]> {
    return await invoke('plugin:mcp-webserver|get_tools', { instanceId });
  }
}

// Re-export for convenience
export default McpWebserver;