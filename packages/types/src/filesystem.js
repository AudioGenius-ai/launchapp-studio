export const FILE_TYPE_MAPPINGS = {
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
export function getFileIcon(fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const mapping = FILE_TYPE_MAPPINGS[ext];
    return mapping?.icon || 'unknown';
}
export function isTextFile(fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const mapping = FILE_TYPE_MAPPINGS[ext];
    return !mapping?.isBinary;
}
