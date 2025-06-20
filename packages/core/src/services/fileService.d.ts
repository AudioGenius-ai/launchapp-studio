import type { FileSystemNode, FileWatchEvent, FileSearchOptions, FileTreeState } from '@code-pilot/types';
export declare class FileService {
    private static instance;
    private fileTreeState;
    private watcherCallbacks;
    private constructor();
    static getInstance(): FileService;
    readDirectory(path: string): Promise<FileSystemNode[]>;
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    createFile(path: string, content?: string): Promise<void>;
    createDirectory(path: string): Promise<void>;
    deleteFile(path: string): Promise<void>;
    renameFile(oldPath: string, newPath: string): Promise<void>;
    copyFile(sourcePath: string, targetPath: string): Promise<void>;
    moveFile(sourcePath: string, targetPath: string): Promise<void>;
    searchFiles(options: FileSearchOptions): Promise<FileSystemNode[]>;
    getTreeState(): FileTreeState;
    setRootPath(path: string): void;
    toggleExpanded(path: string): void;
    isExpanded(path: string): boolean;
    setSelectedPath(path: string | undefined): void;
    getSelectedPath(): string | undefined;
    createVirtualFile(path: string, content?: string): void;
    updateVirtualFile(path: string, content: string): void;
    getVirtualFiles(): Map<string, FileSystemNode>;
    isVirtualFile(path: string): boolean;
    private setupFileWatcher;
    private handleFileWatchEvent;
    watchDirectory(path: string): Promise<void>;
    unwatchDirectory(path: string): Promise<void>;
    onFileChange(callback: (event: FileWatchEvent) => void): () => void;
    getFileStats(path: string): Promise<FileSystemNode>;
    pathExists(path: string): Promise<boolean>;
    buildTree(nodes: FileSystemNode[]): FileSystemNode[];
}
export declare const fileService: FileService;
//# sourceMappingURL=fileService.d.ts.map