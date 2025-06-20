import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
export class FileService {
    static instance;
    fileTreeState;
    watcherCallbacks = new Map();
    constructor() {
        this.fileTreeState = {
            rootPath: '',
            nodes: new Map(),
            expandedPaths: new Set(),
            virtualFiles: new Map(),
        };
        // Setup file watcher listener
        this.setupFileWatcher();
    }
    static getInstance() {
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }
    // File System Operations
    async readDirectory(path) {
        try {
            const nodes = await invoke('read_directory', { path });
            // Update the file tree state
            nodes.forEach(node => {
                this.fileTreeState.nodes.set(node.path, node);
            });
            return nodes;
        }
        catch (error) {
            console.error('Failed to read directory:', error);
            throw error;
        }
    }
    async readFile(path) {
        try {
            // Check if it's a virtual file first
            const virtualFile = this.fileTreeState.virtualFiles.get(path);
            if (virtualFile?.content !== undefined) {
                return virtualFile.content;
            }
            return await invoke('read_file', { path });
        }
        catch (error) {
            console.error('Failed to read file:', error);
            throw error;
        }
    }
    async writeFile(path, content) {
        try {
            await invoke('write_file', { path, content });
            // Remove from virtual files if it was there
            this.fileTreeState.virtualFiles.delete(path);
        }
        catch (error) {
            console.error('Failed to write file:', error);
            throw error;
        }
    }
    async createFile(path, content = '') {
        try {
            await invoke('create_file', { path, content });
        }
        catch (error) {
            console.error('Failed to create file:', error);
            throw error;
        }
    }
    async createDirectory(path) {
        try {
            await invoke('create_directory', { path });
        }
        catch (error) {
            console.error('Failed to create directory:', error);
            throw error;
        }
    }
    async deleteFile(path) {
        try {
            await invoke('delete_file', { path });
            // Remove from state
            this.fileTreeState.nodes.delete(path);
            this.fileTreeState.virtualFiles.delete(path);
            this.fileTreeState.expandedPaths.delete(path);
        }
        catch (error) {
            console.error('Failed to delete file:', error);
            throw error;
        }
    }
    async renameFile(oldPath, newPath) {
        try {
            await invoke('rename_file', { oldPath, newPath });
            // Update state
            const node = this.fileTreeState.nodes.get(oldPath);
            if (node) {
                this.fileTreeState.nodes.delete(oldPath);
                node.path = newPath;
                node.name = newPath.split('/').pop() || '';
                this.fileTreeState.nodes.set(newPath, node);
            }
            // Update expanded paths
            if (this.fileTreeState.expandedPaths.has(oldPath)) {
                this.fileTreeState.expandedPaths.delete(oldPath);
                this.fileTreeState.expandedPaths.add(newPath);
            }
            // Update virtual files
            const virtualFile = this.fileTreeState.virtualFiles.get(oldPath);
            if (virtualFile) {
                this.fileTreeState.virtualFiles.delete(oldPath);
                virtualFile.path = newPath;
                virtualFile.name = newPath.split('/').pop() || '';
                this.fileTreeState.virtualFiles.set(newPath, virtualFile);
            }
        }
        catch (error) {
            console.error('Failed to rename file:', error);
            throw error;
        }
    }
    async copyFile(sourcePath, targetPath) {
        try {
            await invoke('copy_file', { sourcePath, targetPath });
        }
        catch (error) {
            console.error('Failed to copy file:', error);
            throw error;
        }
    }
    async moveFile(sourcePath, targetPath) {
        try {
            await invoke('move_file', { sourcePath, targetPath });
            // Update state similar to rename
            const node = this.fileTreeState.nodes.get(sourcePath);
            if (node) {
                this.fileTreeState.nodes.delete(sourcePath);
                node.path = targetPath;
                node.name = targetPath.split('/').pop() || '';
                this.fileTreeState.nodes.set(targetPath, node);
            }
        }
        catch (error) {
            console.error('Failed to move file:', error);
            throw error;
        }
    }
    // Search Operations
    async searchFiles(options) {
        try {
            return await invoke('search_files', options);
        }
        catch (error) {
            console.error('Failed to search files:', error);
            throw error;
        }
    }
    // File Tree State Management
    getTreeState() {
        return this.fileTreeState;
    }
    setRootPath(path) {
        this.fileTreeState.rootPath = path;
    }
    toggleExpanded(path) {
        if (this.fileTreeState.expandedPaths.has(path)) {
            this.fileTreeState.expandedPaths.delete(path);
        }
        else {
            this.fileTreeState.expandedPaths.add(path);
        }
    }
    isExpanded(path) {
        return this.fileTreeState.expandedPaths.has(path);
    }
    setSelectedPath(path) {
        this.fileTreeState.selectedPath = path;
    }
    getSelectedPath() {
        return this.fileTreeState.selectedPath;
    }
    // Virtual File Management
    createVirtualFile(path, content = '') {
        const name = path.split('/').pop() || '';
        const virtualNode = {
            id: `virtual-${Date.now()}-${Math.random()}`,
            name,
            path,
            type: 'file',
            isVirtual: true,
            content,
            modified: new Date(),
            created: new Date(),
        };
        this.fileTreeState.virtualFiles.set(path, virtualNode);
    }
    updateVirtualFile(path, content) {
        const virtualFile = this.fileTreeState.virtualFiles.get(path);
        if (virtualFile) {
            virtualFile.content = content;
            virtualFile.modified = new Date();
        }
    }
    getVirtualFiles() {
        return this.fileTreeState.virtualFiles;
    }
    isVirtualFile(path) {
        return this.fileTreeState.virtualFiles.has(path);
    }
    // File Watching
    async setupFileWatcher() {
        await listen('file-watch-event', (event) => {
            const watchEvent = event.payload;
            // Notify all registered callbacks
            this.watcherCallbacks.forEach(callback => {
                callback(watchEvent);
            });
            // Update internal state based on event
            this.handleFileWatchEvent(watchEvent);
        });
    }
    handleFileWatchEvent(event) {
        switch (event.type) {
            case 'created':
                // Refresh parent directory
                const parentPath = event.path.substring(0, event.path.lastIndexOf('/'));
                this.readDirectory(parentPath);
                break;
            case 'deleted':
                this.fileTreeState.nodes.delete(event.path);
                this.fileTreeState.expandedPaths.delete(event.path);
                break;
            case 'renamed':
                if (event.oldPath) {
                    const node = this.fileTreeState.nodes.get(event.oldPath);
                    if (node) {
                        this.fileTreeState.nodes.delete(event.oldPath);
                        node.path = event.path;
                        node.name = event.path.split('/').pop() || '';
                        this.fileTreeState.nodes.set(event.path, node);
                    }
                }
                break;
            case 'modified':
                const node = this.fileTreeState.nodes.get(event.path);
                if (node) {
                    node.modified = event.timestamp;
                }
                break;
        }
    }
    async watchDirectory(path) {
        try {
            await invoke('watch_directory', { path });
        }
        catch (error) {
            console.error('Failed to watch directory:', error);
            throw error;
        }
    }
    async unwatchDirectory(path) {
        try {
            await invoke('unwatch_directory', { path });
        }
        catch (error) {
            console.error('Failed to unwatch directory:', error);
            throw error;
        }
    }
    onFileChange(callback) {
        const id = `${Date.now()}-${Math.random()}`;
        this.watcherCallbacks.set(id, callback);
        // Return unsubscribe function
        return () => {
            this.watcherCallbacks.delete(id);
        };
    }
    // Utility Methods
    async getFileStats(path) {
        try {
            return await invoke('get_file_stats', { path });
        }
        catch (error) {
            console.error('Failed to get file stats:', error);
            throw error;
        }
    }
    async pathExists(path) {
        try {
            return await invoke('path_exists', { path });
        }
        catch (error) {
            console.error('Failed to check path existence:', error);
            return false;
        }
    }
    // Build full tree structure from flat nodes
    buildTree(nodes) {
        const nodeMap = new Map();
        const rootNodes = [];
        // First pass: create all nodes
        nodes.forEach(node => {
            nodeMap.set(node.path, { ...node, children: [] });
        });
        // Second pass: build tree structure
        nodes.forEach(node => {
            const currentNode = nodeMap.get(node.path);
            const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
            if (parentPath && nodeMap.has(parentPath)) {
                const parentNode = nodeMap.get(parentPath);
                if (!parentNode.children) {
                    parentNode.children = [];
                }
                parentNode.children.push(currentNode);
            }
            else {
                rootNodes.push(currentNode);
            }
        });
        // Sort children
        const sortNodes = (nodes) => {
            nodes.sort((a, b) => {
                // Directories first
                if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                }
                // Then alphabetically
                return a.name.localeCompare(b.name);
            });
            // Recursively sort children
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    sortNodes(node.children);
                }
            });
        };
        sortNodes(rootNodes);
        return rootNodes;
    }
}
// Export singleton instance
export const fileService = FileService.getInstance();
