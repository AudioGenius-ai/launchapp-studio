// Export all editor types
export * from './editor';

// Export all tab types
export * from './tabs';

// Import types for use in feature-specific interfaces
import type { RecentlyClosedTab } from './tabs';

// Feature-specific types
export interface EditorFeatureState {
  projectPath: string;
  showRecentlyClosedPanel: boolean;
  recentlyClosedTabs: RecentlyClosedTab[];
}

export interface EditorFeatureActions {
  openFile: (path: string) => Promise<void>;
  saveFile: () => Promise<void>;
  saveAllFiles: () => Promise<void>;
  reopenRecentTab: (index: number) => Promise<void>;
  restoreSession: (session: any) => void;
  saveSession: () => any;
}