// Settings and preferences type definitions

export interface GeneralSettings {
  autoSave: boolean;
  autoSaveDelay: number; // milliseconds
  confirmOnExit: boolean;
  telemetry: boolean;
  language: string;
  checkForUpdates: boolean;
  updateChannel: 'stable' | 'beta' | 'nightly';
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  wordWrapColumn: number;
  minimap: {
    enabled: boolean;
    showSlider: 'always' | 'mouseover';
    renderCharacters: boolean;
    maxColumn: number;
  };
  lineNumbers: 'off' | 'on' | 'relative' | 'interval';
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorSmoothCaretAnimation: boolean;
  cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline' | 'underline-thin';
  matchBrackets: 'never' | 'near' | 'always';
  autoClosingBrackets: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoClosingQuotes: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  formatOnSave: boolean;
  formatOnPaste: boolean;
  formatOnType: boolean;
  suggestOnTriggerCharacters: boolean;
  acceptSuggestionOnEnter: 'on' | 'smart' | 'off';
  snippetSuggestions: 'top' | 'bottom' | 'inline' | 'none';
}

export interface ThemeSettings {
  colorTheme: string;
  iconTheme: string;
  uiDensity: 'comfortable' | 'compact' | 'spacious';
  sidebarPosition: 'left' | 'right';
  activityBarPosition: 'side' | 'top' | 'bottom' | 'hidden';
  statusBarVisible: boolean;
  menuBarVisible: boolean;
  customCSS: string;
}

export interface KeyboardShortcut {
  command: string;
  key: string;
  when?: string;
  args?: any;
}

export interface KeyboardSettings {
  shortcuts: KeyboardShortcut[];
  keyBindingMode: 'default' | 'vim' | 'emacs';
}

export interface AIProviderSettings {
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AISettings {
  enabled: boolean;
  defaultProvider: string;
  providers: Record<string, AIProviderSettings>;
  autoComplete: {
    enabled: boolean;
    triggerDelay: number;
    maxSuggestions: number;
  };
  codeGeneration: {
    enabled: boolean;
    contextLines: number;
    includeImports: boolean;
  };
  chatAssistant: {
    enabled: boolean;
    persistHistory: boolean;
    maxHistorySize: number;
  };
}

export interface Settings {
  general: GeneralSettings;
  editor: EditorSettings;
  theme: ThemeSettings;
  keyboard: KeyboardSettings;
  ai: AISettings;
  version: string;
  lastUpdated: string;
}

export const DEFAULT_SETTINGS: Settings = {
  general: {
    autoSave: true,
    autoSaveDelay: 1000,
    confirmOnExit: true,
    telemetry: false,
    language: 'en',
    checkForUpdates: true,
    updateChannel: 'stable',
  },
  editor: {
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
    lineHeight: 1.5,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    wordWrapColumn: 80,
    minimap: {
      enabled: true,
      showSlider: 'mouseover',
      renderCharacters: true,
      maxColumn: 120,
    },
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    renderLineHighlight: 'all',
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: true,
    cursorStyle: 'line',
    matchBrackets: 'always',
    autoClosingBrackets: 'languageDefined',
    autoClosingQuotes: 'languageDefined',
    formatOnSave: false,
    formatOnPaste: false,
    formatOnType: false,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    snippetSuggestions: 'inline',
  },
  theme: {
    colorTheme: 'dark',
    iconTheme: 'material',
    uiDensity: 'comfortable',
    sidebarPosition: 'left',
    activityBarPosition: 'side',
    statusBarVisible: true,
    menuBarVisible: true,
    customCSS: '',
  },
  keyboard: {
    shortcuts: [],
    keyBindingMode: 'default',
  },
  ai: {
    enabled: true,
    defaultProvider: 'openai',
    providers: {},
    autoComplete: {
      enabled: true,
      triggerDelay: 500,
      maxSuggestions: 3,
    },
    codeGeneration: {
      enabled: true,
      contextLines: 50,
      includeImports: true,
    },
    chatAssistant: {
      enabled: true,
      persistHistory: true,
      maxHistorySize: 100,
    },
  },
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

export type SettingsKey = keyof Settings;
export type SettingsValue = Settings[SettingsKey];

export interface SettingsUpdateEvent {
  key: string;
  value: any;
  previousValue?: any;
}