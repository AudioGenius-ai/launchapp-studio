// Editor types

export interface EditorFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language?: string;
  isDirty: boolean;
  isReadOnly?: boolean;
}

export interface EditorTab {
  id: string;
  fileId: string;
  title: string;
  path: string;
  isDirty: boolean;
  isPinned?: boolean;
}

export interface EditorState {
  activeTabId: string | null;
  tabs: EditorTab[];
  openFiles: Map<string, EditorFile>;
}

export interface EditorConfiguration {
  theme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  minimap: {
    enabled: boolean;
    side: 'left' | 'right';
    renderCharacters: boolean;
    maxColumn: number;
  };
  scrollbar: {
    vertical: 'auto' | 'visible' | 'hidden';
    horizontal: 'auto' | 'visible' | 'hidden';
    verticalScrollbarSize: number;
    horizontalScrollbarSize: number;
  };
  find: {
    seedSearchStringFromSelection: boolean;
    autoFindInSelection: 'never' | 'always' | 'multiline';
  };
  quickSuggestions: boolean | {
    other: boolean;
    comments: boolean;
    strings: boolean;
  };
  formatOnSave: boolean;
  formatOnPaste: boolean;
  automaticLayout: boolean;
}

export interface EditorLanguageSupport {
  id: string;
  extensions: string[];
  aliases: string[];
  mimetypes?: string[];
}

export interface EditorTheme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors?: Record<string, string>;
  tokenColors?: Array<{
    scope: string | string[];
    settings: {
      foreground?: string;
      background?: string;
      fontStyle?: string;
    };
  }>;
}

export interface EditorAction {
  id: string;
  label: string;
  keybinding?: string[];
  contextMenuGroupId?: string;
  contextMenuOrder?: number;
  run: () => void | Promise<void>;
}

export interface EditorPosition {
  lineNumber: number;
  column: number;
}

export interface EditorSelection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface EditorChange {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
  forceMoveMarkers?: boolean;
}

export interface EditorModel {
  uri: string;
  getValue(): string;
  setValue(value: string): void;
  getLineCount(): number;
  getLineContent(lineNumber: number): string;
  getOffsetAt(position: EditorPosition): number;
  getPositionAt(offset: number): EditorPosition;
}

export interface EditorInstance {
  getValue(): string;
  setValue(value: string): void;
  getModel(): EditorModel | null;
  getPosition(): EditorPosition | null;
  setPosition(position: EditorPosition): void;
  getSelection(): EditorSelection | null;
  setSelection(selection: EditorSelection): void;
  focus(): void;
  layout(dimension?: { width: number; height: number }): void;
  dispose(): void;
}

// Language definitions for syntax highlighting
export const SUPPORTED_LANGUAGES: EditorLanguageSupport[] = [
  { id: 'typescript', extensions: ['.ts', '.tsx'], aliases: ['TypeScript', 'ts'] },
  { id: 'javascript', extensions: ['.js', '.jsx', '.mjs', '.cjs'], aliases: ['JavaScript', 'js'] },
  { id: 'python', extensions: ['.py', '.pyw'], aliases: ['Python', 'py'] },
  { id: 'rust', extensions: ['.rs'], aliases: ['Rust', 'rs'] },
  { id: 'go', extensions: ['.go'], aliases: ['Go', 'golang'] },
  { id: 'java', extensions: ['.java'], aliases: ['Java'] },
  { id: 'cpp', extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h'], aliases: ['C++', 'cpp'] },
  { id: 'c', extensions: ['.c', '.h'], aliases: ['C'] },
  { id: 'csharp', extensions: ['.cs'], aliases: ['C#', 'csharp'] },
  { id: 'html', extensions: ['.html', '.htm'], aliases: ['HTML'], mimetypes: ['text/html'] },
  { id: 'css', extensions: ['.css'], aliases: ['CSS'], mimetypes: ['text/css'] },
  { id: 'scss', extensions: ['.scss'], aliases: ['SCSS', 'Sass'] },
  { id: 'json', extensions: ['.json'], aliases: ['JSON'], mimetypes: ['application/json'] },
  { id: 'xml', extensions: ['.xml', '.xsl', '.xsd'], aliases: ['XML'], mimetypes: ['text/xml'] },
  { id: 'yaml', extensions: ['.yml', '.yaml'], aliases: ['YAML'] },
  { id: 'markdown', extensions: ['.md', '.markdown'], aliases: ['Markdown', 'md'] },
  { id: 'sql', extensions: ['.sql'], aliases: ['SQL'] },
  { id: 'shell', extensions: ['.sh', '.bash', '.zsh'], aliases: ['Shell', 'bash'] },
  { id: 'dockerfile', extensions: ['Dockerfile'], aliases: ['Dockerfile'] },
  { id: 'plaintext', extensions: ['.txt'], aliases: ['Plain Text', 'text'] }
];

// Default editor configuration
export const DEFAULT_EDITOR_CONFIG: EditorConfiguration = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  lineNumbers: 'on',
  minimap: {
    enabled: true,
    side: 'right',
    renderCharacters: true,
    maxColumn: 120
  },
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    verticalScrollbarSize: 14,
    horizontalScrollbarSize: 14
  },
  find: {
    seedSearchStringFromSelection: true,
    autoFindInSelection: 'multiline'
  },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  formatOnSave: false,
  formatOnPaste: false,
  automaticLayout: true
};