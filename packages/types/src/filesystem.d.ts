export interface FileSystemNode {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
    modified?: Date;
    created?: Date;
    extension?: string;
    children?: FileSystemNode[];
    expanded?: boolean;
    isVirtual?: boolean;
    content?: string;
}
export interface FileOperation {
    type: 'create' | 'delete' | 'rename' | 'move' | 'copy';
    sourcePath: string;
    targetPath?: string;
    content?: string;
    isDirectory?: boolean;
}
export interface FileWatchEvent {
    type: 'created' | 'modified' | 'deleted' | 'renamed';
    path: string;
    oldPath?: string;
    timestamp: Date;
}
export interface FileSearchOptions {
    query: string;
    path?: string;
    includeHidden?: boolean;
    caseSensitive?: boolean;
    useRegex?: boolean;
    maxDepth?: number;
    fileExtensions?: string[];
}
export interface FileTreeState {
    rootPath: string;
    nodes: Map<string, FileSystemNode>;
    expandedPaths: Set<string>;
    selectedPath?: string;
    virtualFiles: Map<string, FileSystemNode>;
}
export type FileIconType = 'typescript' | 'javascript' | 'react' | 'vue' | 'svelte' | 'html' | 'css' | 'scss' | 'json' | 'markdown' | 'rust' | 'python' | 'java' | 'cpp' | 'go' | 'ruby' | 'php' | 'yaml' | 'toml' | 'xml' | 'image' | 'video' | 'audio' | 'pdf' | 'archive' | 'text' | 'binary' | 'folder' | 'folder-open' | 'unknown';
export interface FileTypeMapping {
    extension: string;
    icon: FileIconType;
    language?: string;
    isBinary?: boolean;
}
export declare const FILE_TYPE_MAPPINGS: Record<string, FileTypeMapping>;
export declare function getFileIcon(fileName: string): FileIconType;
export declare function isTextFile(fileName: string): boolean;
//# sourceMappingURL=filesystem.d.ts.map