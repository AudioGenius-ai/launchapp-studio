import { invoke } from '@tauri-apps/api/core';

export interface ExtensionHostConfig {
  workspacePath: string;
  extensionsDir: string;
  nodeExecutablePath?: string;
  enableDebugging?: boolean;
  port?: number;
  memoryLimit?: number;
  timeout?: number;
  environment?: Record<string, string>;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  publisher: string;
  displayName: string;
  description?: string;
  categories: string[];
  activationEvents: string[];
  contributes?: any;
  engines: Record<string, string>;
  main?: string;
  dependencies?: Record<string, string>;
  enabled: boolean;
}

export interface ExtensionHostInfo {
  id: string;
  workspaceId: string;
  workspacePath: string;
  status: ExtensionHostStatus;
  loadedExtensions: Extension[];
  apiVersion: string;
  nodeVersion: string;
  startedAt?: string;
  memoryUsage?: number;
  cpuUsage?: number;
}

export enum ExtensionHostStatus {
  Initializing = 'initializing',
  Running = 'running',
  Stopped = 'stopped',
  Failed = 'failed',
  Restarting = 'restarting'
}

export interface ExtensionCommand {
  command: string;
  args: any[];
}

export interface LanguageServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  filePatterns: string[];
  rootPatterns: string[];
  initializationOptions?: any;
  settings?: any;
  environment?: Record<string, string>;
}

export interface LanguageServerInfo {
  id: string;
  name: string;
  status: LanguageServerStatus;
  capabilities?: any;
  workspaceFolders: string[];
  startedAt?: string;
}

export enum LanguageServerStatus {
  Starting = 'starting',
  Running = 'running',
  Stopped = 'stopped',
  Failed = 'failed',
  Restarting = 'restarting'
}

export interface ExtensionSearchQuery {
  query: string;
  category?: string;
  sortBy?: ExtensionSortBy;
  offset?: number;
  limit?: number;
}

export enum ExtensionSortBy {
  Relevance = 'relevance',
  Downloads = 'downloads',
  Rating = 'rating',
  Name = 'name',
  PublishedDate = 'publishedDate'
}

export interface ExtensionSearchResult {
  extensions: ExtensionInfo[];
  total: number;
  offset: number;
}

export interface ExtensionInfo {
  id: string;
  name: string;
  displayName: string;
  publisher: string;
  version: string;
  description?: string;
  icon?: string;
  categories: string[];
  tags: string[];
  downloads?: number;
  rating?: number;
  installCount?: number;
}

export interface ExtensionSource {
  type: 'openvsx' | 'github' | 'local' | 'url';
  extensionId?: string;
  version?: string;
  owner?: string;
  repo?: string;
  release?: string;
  path?: string;
  url?: string;
}

export interface ExtensionInstallResult {
  extensionId: string;
  version: string;
  installedPath: string;
  dependenciesInstalled: string[];
}

/**
 * Create a new extension host for a workspace
 */
export async function createExtensionHost(
  workspacePath: string,
  extensions: string[],
  config?: Partial<ExtensionHostConfig>
): Promise<string> {
  return invoke('plugin:vscode-host|create_extension_host', {
    workspacePath,
    extensions,
    config
  });
}

/**
 * Stop an extension host
 */
export async function stopExtensionHost(hostId: string): Promise<void> {
  return invoke('plugin:vscode-host|stop_extension_host', { hostId });
}

/**
 * List all active extension hosts
 */
export async function listExtensionHosts(): Promise<ExtensionHostInfo[]> {
  return invoke('plugin:vscode-host|list_extension_hosts');
}

/**
 * Get information about a specific extension host
 */
export async function getExtensionHostInfo(hostId: string): Promise<ExtensionHostInfo> {
  return invoke('plugin:vscode-host|get_extension_host_info', { hostId });
}

/**
 * Execute a command in an extension host
 */
export async function executeExtensionCommand(
  hostId: string,
  command: ExtensionCommand
): Promise<any> {
  return invoke('plugin:vscode-host|execute_extension_command', {
    hostId,
    command
  });
}

/**
 * Start a language server
 */
export async function startLanguageServer(
  config: LanguageServerConfig,
  workspaceFolders: string[]
): Promise<string> {
  return invoke('plugin:vscode-host|start_language_server', {
    config,
    workspaceFolders
  });
}

/**
 * Stop a language server
 */
export async function stopLanguageServer(serverId: string): Promise<void> {
  return invoke('plugin:vscode-host|stop_language_server', { serverId });
}

/**
 * List active language servers
 */
export async function listLanguageServers(): Promise<LanguageServerInfo[]> {
  return invoke('plugin:vscode-host|list_language_servers');
}

/**
 * Search for extensions
 */
export async function searchExtensions(
  query: ExtensionSearchQuery
): Promise<ExtensionSearchResult> {
  return invoke('plugin:vscode-host|search_extensions', { query });
}

/**
 * Install an extension
 */
export async function installExtension(
  source: ExtensionSource
): Promise<ExtensionInstallResult> {
  return invoke('plugin:vscode-host|install_extension', { source });
}

/**
 * Uninstall an extension
 */
export async function uninstallExtension(
  hostId: string,
  extensionId: string
): Promise<void> {
  return invoke('plugin:vscode-host|uninstall_extension', {
    hostId,
    extensionId
  });
}

/**
 * List installed extensions for a host
 */
export async function listInstalledExtensions(
  hostId: string
): Promise<Extension[]> {
  return invoke('plugin:vscode-host|list_installed_extensions', { hostId });
}