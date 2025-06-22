/**
 * Feature flags for controlling feature availability
 */

import { isDevelopment } from './environment';

// Feature flag type
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  experimental?: boolean;
  requiresRestart?: boolean;
}

// Feature flags registry
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // AI Features
  AI_CHAT: {
    id: 'ai_chat',
    name: 'AI Chat Assistant',
    description: 'Enable Claude AI chat integration',
    enabled: true,
  },
  AI_CODE_COMPLETION: {
    id: 'ai_code_completion',
    name: 'AI Code Completion',
    description: 'Enable AI-powered code completions',
    enabled: true,
    experimental: true,
  },
  AI_CODE_EXPLANATION: {
    id: 'ai_code_explanation',
    name: 'AI Code Explanation',
    description: 'Enable AI-powered code explanations',
    enabled: true,
  },
  
  // Terminal Features
  TERMINAL_TABS: {
    id: 'terminal_tabs',
    name: 'Terminal Tabs',
    description: 'Enable multiple terminal tabs',
    enabled: true,
  },
  TERMINAL_SPLIT: {
    id: 'terminal_split',
    name: 'Terminal Split View',
    description: 'Enable split terminal panes',
    enabled: true,
    experimental: true,
  },
  
  // Git Features
  GIT_INTEGRATION: {
    id: 'git_integration',
    name: 'Git Integration',
    description: 'Enable Git version control features',
    enabled: false, // Disabled due to compilation issues
    requiresRestart: true,
  },
  GIT_GRAPH: {
    id: 'git_graph',
    name: 'Git Graph Visualization',
    description: 'Enable Git commit graph visualization',
    enabled: false,
    experimental: true,
  },
  
  // Editor Features
  EDITOR_MINIMAP: {
    id: 'editor_minimap',
    name: 'Editor Minimap',
    description: 'Show code minimap in editor',
    enabled: true,
  },
  EDITOR_BREADCRUMBS: {
    id: 'editor_breadcrumbs',
    name: 'Editor Breadcrumbs',
    description: 'Show breadcrumb navigation in editor',
    enabled: true,
  },
  EDITOR_FOLDING: {
    id: 'editor_folding',
    name: 'Code Folding',
    description: 'Enable code folding in editor',
    enabled: true,
  },
  
  // UI Features
  CUSTOM_THEMES: {
    id: 'custom_themes',
    name: 'Custom Themes',
    description: 'Enable custom theme creation and editing',
    enabled: true,
  },
  COMMAND_PALETTE: {
    id: 'command_palette',
    name: 'Command Palette',
    description: 'Enable command palette (Ctrl+Shift+P)',
    enabled: true,
  },
  ACTIVITY_BAR: {
    id: 'activity_bar',
    name: 'Activity Bar',
    description: 'Show activity bar on the left',
    enabled: true,
  },
  
  // Collaboration Features
  LIVE_SHARE: {
    id: 'live_share',
    name: 'Live Share',
    description: 'Enable real-time collaboration',
    enabled: false,
    experimental: true,
    requiresRestart: true,
  },
  
  // Development Features
  DEV_TOOLS: {
    id: 'dev_tools',
    name: 'Developer Tools',
    description: 'Enable developer tools and debugging',
    enabled: isDevelopment,
  },
  PERFORMANCE_MONITOR: {
    id: 'performance_monitor',
    name: 'Performance Monitor',
    description: 'Show performance metrics',
    enabled: isDevelopment,
    experimental: true,
  },
  
  // Plugin System
  PLUGIN_SYSTEM: {
    id: 'plugin_system',
    name: 'Plugin System',
    description: 'Enable third-party plugin support',
    enabled: false,
    experimental: true,
    requiresRestart: true,
  },
  
  // Cloud Features
  CLOUD_SYNC: {
    id: 'cloud_sync',
    name: 'Cloud Sync',
    description: 'Sync settings and projects to cloud',
    enabled: false,
    experimental: true,
  },
};

/**
 * Check if a feature flag is enabled
 */
export function isFeatureFlagEnabled(flagId: string): boolean {
  const flag = FEATURE_FLAGS[flagId];
  return flag?.enabled === true;
}

/**
 * Get all enabled feature flags
 */
export function getEnabledFeatureFlags(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(flag => flag.enabled);
}

/**
 * Get all experimental feature flags
 */
export function getExperimentalFeatureFlags(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(flag => flag.experimental);
}

/**
 * Toggle a feature flag (for development/testing)
 */
export function toggleFeatureFlag(flagId: string): boolean {
  const flag = FEATURE_FLAGS[flagId];
  if (flag) {
    flag.enabled = !flag.enabled;
    // In production, this would persist to storage
    if (flag.requiresRestart) {
      console.warn(`Feature flag '${flagId}' requires a restart to take effect`);
    }
    return flag.enabled;
  }
  return false;
}

/**
 * Override feature flags from storage or API
 */
export async function loadFeatureFlags(): Promise<void> {
  try {
    // In production, load from storage or API
    const storedFlags = localStorage.getItem('feature_flags');
    if (storedFlags) {
      const flags = JSON.parse(storedFlags);
      Object.keys(flags).forEach(key => {
        if (FEATURE_FLAGS[key]) {
          FEATURE_FLAGS[key].enabled = flags[key];
        }
      });
    }
  } catch (error) {
    console.error('Failed to load feature flags:', error);
  }
}

/**
 * Save feature flags to storage
 */
export async function saveFeatureFlags(): Promise<void> {
  try {
    const flags: Record<string, boolean> = {};
    Object.entries(FEATURE_FLAGS).forEach(([key, flag]) => {
      flags[key] = flag.enabled;
    });
    localStorage.setItem('feature_flags', JSON.stringify(flags));
  } catch (error) {
    console.error('Failed to save feature flags:', error);
  }
}