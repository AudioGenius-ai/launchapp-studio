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
  content?: string; // For virtual/unsaved files
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
  oldPath?: string; // For rename events
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

export type FileIconType =
  | 'typescript'
  | 'javascript'
  | 'react'
  | 'vue'
  | 'svelte'
  | 'html'
  | 'css'
  | 'scss'
  | 'json'
  | 'markdown'
  | 'rust'
  | 'python'
  | 'java'
  | 'cpp'
  | 'go'
  | 'ruby'
  | 'php'
  | 'yaml'
  | 'toml'
  | 'xml'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'text'
  | 'binary'
  | 'folder'
  | 'folder-open'
  | 'unknown';

export interface FileTypeMapping {
  extension: string;
  icon: FileIconType;
  language?: string;
  isBinary?: boolean;
}

export const FILE_TYPE_MAPPINGS: Record<string, FileTypeMapping> = {
  '.ts': { extension: '.ts', icon: 'typescript', language: 'typescript' },
  '.tsx': { extension: '.tsx', icon: 'react', language: 'typescriptreact' },
  '.js': { extension: '.js', icon: 'javascript', language: 'javascript' },
  '.jsx': { extension: '.jsx', icon: 'react', language: 'javascriptreact' },
  '.vue': { extension: '.vue', icon: 'vue', language: 'vue' },
  '.svelte': { extension: '.svelte', icon: 'svelte', language: 'svelte' },
  '.html': { extension: '.html', icon: 'html', language: 'html' },
  '.css': { extension: '.css', icon: 'css', language: 'css' },
  '.scss': { extension: '.scss', icon: 'scss', language: 'scss' },
  '.sass': { extension: '.sass', icon: 'scss', language: 'sass' },
  '.less': { extension: '.less', icon: 'css', language: 'less' },
  '.json': { extension: '.json', icon: 'json', language: 'json' },
  '.md': { extension: '.md', icon: 'markdown', language: 'markdown' },
  '.rs': { extension: '.rs', icon: 'rust', language: 'rust' },
  '.py': { extension: '.py', icon: 'python', language: 'python' },
  '.java': { extension: '.java', icon: 'java', language: 'java' },
  '.cpp': { extension: '.cpp', icon: 'cpp', language: 'cpp' },
  '.c': { extension: '.c', icon: 'cpp', language: 'c' },
  '.h': { extension: '.h', icon: 'cpp', language: 'c' },
  '.hpp': { extension: '.hpp', icon: 'cpp', language: 'cpp' },
  '.go': { extension: '.go', icon: 'go', language: 'go' },
  '.rb': { extension: '.rb', icon: 'ruby', language: 'ruby' },
  '.php': { extension: '.php', icon: 'php', language: 'php' },
  '.yml': { extension: '.yml', icon: 'yaml', language: 'yaml' },
  '.yaml': { extension: '.yaml', icon: 'yaml', language: 'yaml' },
  '.toml': { extension: '.toml', icon: 'toml', language: 'toml' },
  '.xml': { extension: '.xml', icon: 'xml', language: 'xml' },
  '.png': { extension: '.png', icon: 'image', isBinary: true },
  '.jpg': { extension: '.jpg', icon: 'image', isBinary: true },
  '.jpeg': { extension: '.jpeg', icon: 'image', isBinary: true },
  '.gif': { extension: '.gif', icon: 'image', isBinary: true },
  '.svg': { extension: '.svg', icon: 'image', language: 'xml' },
  '.ico': { extension: '.ico', icon: 'image', isBinary: true },
  '.webp': { extension: '.webp', icon: 'image', isBinary: true },
  '.mp4': { extension: '.mp4', icon: 'video', isBinary: true },
  '.webm': { extension: '.webm', icon: 'video', isBinary: true },
  '.mp3': { extension: '.mp3', icon: 'audio', isBinary: true },
  '.wav': { extension: '.wav', icon: 'audio', isBinary: true },
  '.pdf': { extension: '.pdf', icon: 'pdf', isBinary: true },
  '.zip': { extension: '.zip', icon: 'archive', isBinary: true },
  '.tar': { extension: '.tar', icon: 'archive', isBinary: true },
  '.gz': { extension: '.gz', icon: 'archive', isBinary: true },
  '.txt': { extension: '.txt', icon: 'text', language: 'plaintext' },
};

export function getFileIcon(fileName: string): FileIconType {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const mapping = FILE_TYPE_MAPPINGS[ext];
  return mapping?.icon || 'unknown';
}

export function isTextFile(fileName: string): boolean {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const mapping = FILE_TYPE_MAPPINGS[ext];
  return !mapping?.isBinary;
}