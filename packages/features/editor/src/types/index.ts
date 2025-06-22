// Re-export editor types from @code-pilot/types
export type {
  EditorFile,
  EditorTab,
  EditorState,
  EditorConfiguration,
  EditorLanguageSupport,
  EditorTheme,
  EditorAction,
  EditorPosition,
  EditorSelection,
  EditorChange,
  EditorModel,
  EditorInstance,
  RecentlyClosedTab
} from '@code-pilot/types';

import type { RecentlyClosedTab } from '@code-pilot/types';

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