// Core services that are truly cross-cutting concerns
export * from './projectService';
export * from './fileService';
export * from './settingsService';

// These services have been moved to their respective feature packages:
// - editorService -> @code-pilot/feature-editor
// - themeService -> @code-pilot/themes
// - tabService -> @code-pilot/feature-editor (tabs are editor-specific)
// - terminalService -> @code-pilot/feature-terminal
// - gitService -> @code-pilot/feature-git
// - aiService, claudeService, etc -> @code-pilot/feature-ai
// - windowManager -> @code-pilot/feature-window-management
// - templateService -> @code-pilot/feature-templates