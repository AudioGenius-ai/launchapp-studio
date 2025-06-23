// AI types - moved from @code-pilot/types
// This module contains all AI-related type definitions

export * from './ai';

// UI preferences specific to the AI panel
export interface UIPreferences {
  panelWidth: number;
  fontSize: number;
  showTimestamps: boolean;
  showTokenCount: boolean;
  enableMarkdown: boolean;
  enableSyntaxHighlighting: boolean;
  autoScroll: boolean;
  compactMode: boolean;
}


