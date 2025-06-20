import React, { useRef } from 'react';
import Editor, { OnMount, BeforeMount, OnChange } from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { 
  EditorConfiguration, 
  EditorLanguageSupport,
  SUPPORTED_LANGUAGES 
} from '@code-pilot/types';

interface MonacoEditorProps {
  value: string;
  language?: string;
  path?: string;
  theme?: string;
  options?: Partial<EditorConfiguration>;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: any, monaco: any) => void;
  beforeMount?: (monaco: any) => void;
  className?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language = 'plaintext',
  path,
  theme = 'vs-dark',
  options = {},
  onChange,
  onMount,
  beforeMount,
  className = ''
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorWillMount: BeforeMount = (monaco: any) => {
    // Configure Monaco before the editor is created
    monacoRef.current = monaco;

    // Configure languages
    configureLanges(monaco);

    // Configure themes if needed
    configureThemes(monaco);

    // Call user's beforeMount if provided
    beforeMount?.(monaco);
  };

  const handleEditorDidMount: OnMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure editor actions
    configureEditorActions(editor, monaco);

    // Call user's onMount if provided
    onMount?.(editor, monaco);
  };

  const handleChange: OnChange = (value: string | undefined) => {
    onChange?.(value);
  };

  const configureLanges = (monaco: any) => {
    // Register custom language configurations if needed
    SUPPORTED_LANGUAGES.forEach((lang: EditorLanguageSupport) => {
      // Language-specific configurations can be added here
      if (lang.id === 'typescript' || lang.id === 'javascript') {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.Latest,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types']
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false
        });
      }
    });
  };

  const configureThemes = (monaco: any) => {
    // Define custom VS Code Dark theme
    monaco.editor.defineTheme('vs-code-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'parameter', foreground: '9CDCFE' },
        { token: 'property', foreground: '9CDCFE' },
        { token: 'punctuation', foreground: 'D4D4D4' },
        { token: 'operator', foreground: 'D4D4D4' }
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2A2A',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editorCursor.foreground': '#AEAFAD',
        'editor.wordHighlightBackground': '#575757',
        'editor.wordHighlightStrongBackground': '#004972',
        'editorBracketMatch.background': '#0064001a',
        'editorBracketMatch.border': '#888888'
      }
    });

    // Define custom VS Code Light theme
    monaco.editor.defineTheme('vs-code-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'type', foreground: '267F99' },
        { token: 'class', foreground: '267F99' },
        { token: 'function', foreground: '795E26' },
        { token: 'variable', foreground: '001080' },
        { token: 'constant', foreground: '0070C1' },
        { token: 'parameter', foreground: '001080' },
        { token: 'property', foreground: '001080' }
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F8F8F8',
        'editor.selectionBackground': '#ADD6FF',
        'editorLineNumber.foreground': '#237893',
        'editorCursor.foreground': '#000000'
      }
    });
  };

  const configureEditorActions = (editor: any, monaco: any) => {
    // Add custom keybindings
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: () => {
        // This will be handled by the parent component
        console.log('Save file action triggered');
      }
    });

    // Format document
    editor.addAction({
      id: 'format-document',
      label: 'Format Document',
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'modification',
      contextMenuOrder: 1.5,
      run: () => {
        editor.getAction('editor.action.formatDocument')?.run();
      }
    });
  };

  const editorOptions: any = {
    fontSize: options.fontSize || 14,
    fontFamily: options.fontFamily || "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
    tabSize: options.tabSize || 2,
    insertSpaces: options.insertSpaces !== false,
    wordWrap: options.wordWrap || 'on',
    lineNumbers: options.lineNumbers || 'on',
    minimap: {
      enabled: options.minimap?.enabled !== false,
      side: options.minimap?.side || 'right',
      renderCharacters: options.minimap?.renderCharacters !== false,
      maxColumn: options.minimap?.maxColumn || 120
    },
    scrollbar: {
      vertical: options.scrollbar?.vertical || 'auto',
      horizontal: options.scrollbar?.horizontal || 'auto',
      verticalScrollbarSize: options.scrollbar?.verticalScrollbarSize || 14,
      horizontalScrollbarSize: options.scrollbar?.horizontalScrollbarSize || 14
    },
    find: {
      seedSearchStringFromSelection: options.find?.seedSearchStringFromSelection !== false,
      autoFindInSelection: options.find?.autoFindInSelection || 'multiline'
    },
    quickSuggestions: options.quickSuggestions !== false ? (
      typeof options.quickSuggestions === 'object' ? options.quickSuggestions : {
        other: true,
        comments: false,
        strings: false
      }
    ) : false,
    formatOnPaste: options.formatOnPaste || false,
    formatOnType: false,
    automaticLayout: options.automaticLayout !== false,
    cursorStyle: 'line',
    cursorBlinking: 'smooth',
    smoothScrolling: true,
    mouseWheelZoom: true,
    dragAndDrop: true,
    links: true,
    colorDecorators: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    matchBrackets: 'always',
    renderWhitespace: 'selection',
    renderControlCharacters: false,
    renderLineHighlight: 'all',
    useTabStops: true,
    fontLigatures: true,
    contextmenu: true,
    quickSuggestionsDelay: 10,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    snippetSuggestions: 'inline',
    showDeprecated: true,
    suggestSelection: 'first',
    wordBasedSuggestions: 'matchingDocuments',
    suggestFontSize: 0,
    suggestLineHeight: 0,
    stickyScroll: {
      enabled: true
    }
  };

  return (
    <div className={`monaco-editor-container ${className}`}>
      <Editor
        height="100%"
        width="100%"
        theme={theme}
        value={value}
        language={language}
        path={path}
        options={editorOptions}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={handleChange}
        keepCurrentModel={true}
      />
    </div>
  );
};

export default MonacoEditor;