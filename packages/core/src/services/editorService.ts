import { 
  EditorFile, 
  EditorTab, 
  EditorState, 
  EditorConfiguration,
  EditorLanguageSupport,
  SUPPORTED_LANGUAGES,
  DEFAULT_EDITOR_CONFIG
} from '@code-pilot/types';
import { FileService } from './fileService';

export class EditorService {
  private state: EditorState = {
    activeTabId: null,
    tabs: [],
    openFiles: new Map()
  };

  private configuration: EditorConfiguration = DEFAULT_EDITOR_CONFIG;
  private fileService: FileService;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  // File operations
  async openFile(path: string): Promise<EditorFile> {
    // Check if file is already open
    const existingFile = this.state.openFiles.get(path);
    if (existingFile) {
      this.activateTab(existingFile.id);
      return existingFile;
    }

    try {
      // Read file content
      const content = await this.fileService.readFile(path);
      const name = path.split('/').pop() || 'untitled';
      const language = this.detectLanguage(path);

      const file: EditorFile = {
        id: this.generateId(),
        path,
        name,
        content,
        language,
        isDirty: false,
        isReadOnly: false
      };

      // Create tab
      const tab: EditorTab = {
        id: file.id,
        fileId: file.id,
        title: name,
        path,
        isDirty: false,
        isPinned: false
      };

      // Update state
      this.state.openFiles.set(path, file);
      this.state.tabs.push(tab);
      this.state.activeTabId = tab.id;

      this.emit('fileOpened', file);
      this.emit('stateChanged', this.state);

      return file;
    } catch (error) {
      console.error('Failed to open file:', error);
      throw new Error(`Failed to open file: ${path}`);
    }
  }

  async saveFile(fileId: string): Promise<void> {
    const file = this.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (!file.isDirty) {
      return;
    }

    try {
      await this.fileService.writeFile(file.path, file.content);
      
      // Update file state
      file.isDirty = false;
      
      // Update tab state
      const tab = this.state.tabs.find(t => t.fileId === fileId);
      if (tab) {
        tab.isDirty = false;
      }

      this.emit('fileSaved', file);
      this.emit('stateChanged', this.state);
    } catch (error) {
      console.error('Failed to save file:', error);
      throw new Error(`Failed to save file: ${file.path}`);
    }
  }

  async saveAllFiles(): Promise<void> {
    const dirtyFiles = Array.from(this.state.openFiles.values()).filter(f => f.isDirty);
    await Promise.all(dirtyFiles.map(file => this.saveFile(file.id)));
  }

  closeFile(fileId: string): void {
    const file = this.getFileById(fileId);
    if (!file) {
      return;
    }

    // Remove file from state
    this.state.openFiles.delete(file.path);
    
    // Remove tab
    const tabIndex = this.state.tabs.findIndex(t => t.fileId === fileId);
    if (tabIndex !== -1) {
      this.state.tabs.splice(tabIndex, 1);
    }

    // Update active tab if needed
    if (this.state.activeTabId === fileId) {
      if (this.state.tabs.length > 0) {
        const newActiveIndex = Math.min(tabIndex, this.state.tabs.length - 1);
        this.state.activeTabId = this.state.tabs[newActiveIndex].id;
      } else {
        this.state.activeTabId = null;
      }
    }

    this.emit('fileClosed', file);
    this.emit('stateChanged', this.state);
  }

  closeAllFiles(): void {
    this.state.openFiles.clear();
    this.state.tabs = [];
    this.state.activeTabId = null;
    
    this.emit('allFilesClosed');
    this.emit('stateChanged', this.state);
  }

  // Tab operations
  activateTab(tabId: string): void {
    const tab = this.state.tabs.find(t => t.id === tabId);
    if (tab) {
      this.state.activeTabId = tabId;
      this.emit('tabActivated', tab);
      this.emit('stateChanged', this.state);
    }
  }

  pinTab(tabId: string): void {
    const tab = this.state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isPinned = true;
      this.emit('tabPinned', tab);
      this.emit('stateChanged', this.state);
    }
  }

  unpinTab(tabId: string): void {
    const tab = this.state.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isPinned = false;
      this.emit('tabUnpinned', tab);
      this.emit('stateChanged', this.state);
    }
  }

  reorderTabs(fromIndex: number, toIndex: number): void {
    const [movedTab] = this.state.tabs.splice(fromIndex, 1);
    this.state.tabs.splice(toIndex, 0, movedTab);
    
    this.emit('tabsReordered', { fromIndex, toIndex });
    this.emit('stateChanged', this.state);
  }

  // Content operations
  updateFileContent(fileId: string, content: string): void {
    const file = this.getFileById(fileId);
    if (!file) {
      return;
    }

    const wasClean = !file.isDirty;
    file.content = content;
    file.isDirty = true;

    // Update tab
    const tab = this.state.tabs.find(t => t.fileId === fileId);
    if (tab) {
      tab.isDirty = true;
    }

    if (wasClean) {
      this.emit('fileDirty', file);
    }
    this.emit('fileContentChanged', { file, content });
    this.emit('stateChanged', this.state);
  }

  // Configuration
  getConfiguration(): EditorConfiguration {
    return { ...this.configuration };
  }

  updateConfiguration(config: Partial<EditorConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
    this.emit('configurationChanged', this.configuration);
  }

  // Language detection
  detectLanguage(filePath: string): string | undefined {
    const extension = '.' + filePath.split('.').pop()?.toLowerCase();
    const language = SUPPORTED_LANGUAGES.find(lang => 
      lang.extensions.includes(extension)
    );
    return language?.id;
  }

  getLanguageById(languageId: string): EditorLanguageSupport | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.id === languageId);
  }

  getSupportedLanguages(): EditorLanguageSupport[] {
    return [...SUPPORTED_LANGUAGES];
  }

  // State management
  getState(): EditorState {
    return {
      ...this.state,
      openFiles: new Map(this.state.openFiles)
    };
  }

  getActiveFile(): EditorFile | undefined {
    if (!this.state.activeTabId) {
      return undefined;
    }
    const activeTab = this.state.tabs.find(t => t.id === this.state.activeTabId);
    return activeTab ? this.state.openFiles.get(activeTab.path) : undefined;
  }

  getOpenFiles(): EditorFile[] {
    return Array.from(this.state.openFiles.values());
  }

  getTabs(): EditorTab[] {
    return [...this.state.tabs];
  }

  hasUnsavedChanges(): boolean {
    return Array.from(this.state.openFiles.values()).some(f => f.isDirty);
  }

  // Helper methods
  private getFileById(fileId: string): EditorFile | undefined {
    return Array.from(this.state.openFiles.values()).find(f => f.id === fileId);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup
  dispose(): void {
    this.closeAllFiles();
    this.listeners.clear();
  }
}