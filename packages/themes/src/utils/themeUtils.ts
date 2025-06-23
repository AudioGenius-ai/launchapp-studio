import { Theme, ThemeMode, CustomTheme } from '@code-pilot/types';
import { lightTheme } from '../themes/light';
import { darkTheme } from '../themes/dark';

/**
 * Utility functions for working with themes
 */

// Built-in themes registry
export const builtInThemes: Record<string, Theme> = {
  Light: lightTheme,
  Dark: darkTheme,
};

/**
 * Get a theme by name from built-in themes
 */
export const getBuiltInTheme = (name: string): Theme | undefined => {
  return builtInThemes[name];
};

/**
 * Get all available built-in theme names
 */
export const getBuiltInThemeNames = (): string[] => {
  return Object.keys(builtInThemes);
};

/**
 * Detect system theme preference
 */
export const getSystemThemeMode = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light'; // Default for SSR
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Resolve theme mode to actual theme mode (handle 'system' mode)
 */
export const resolveThemeMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemThemeMode();
  }
  return mode;
};

/**
 * Get the appropriate theme based on mode and theme name
 */
export const resolveTheme = (themeName: string, mode: ThemeMode, customThemes: CustomTheme[] = []): Theme => {
  const resolvedMode = resolveThemeMode(mode);
  
  // First check custom themes
  const customTheme = customThemes.find(t => t.name === themeName);
  if (customTheme) {
    return customTheme;
  }
  
  // Then check built-in themes
  const builtInTheme = getBuiltInTheme(themeName);
  if (builtInTheme) {
    // If the theme doesn't match the resolved mode, get the appropriate variant
    if (builtInTheme.mode !== resolvedMode) {
      // Try to find a theme that matches the mode
      const modeTheme = Object.values(builtInThemes).find(t => t.mode === resolvedMode);
      return modeTheme || builtInTheme;
    }
    return builtInTheme;
  }
  
  // Fallback to default theme based on mode
  return resolvedMode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Create a theme variant with a different mode
 */
export const createThemeVariant = (baseTheme: Theme, mode: 'light' | 'dark'): Theme => {
  if (baseTheme.mode === mode) {
    return baseTheme;
  }
  
  // For now, return the appropriate built-in theme
  // In the future, this could intelligently convert colors
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Merge theme with custom overrides
 */
export const mergeTheme = (baseTheme: Theme, overrides: Partial<Theme>): Theme => {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...(overrides.colors || {}),
    },
    fonts: {
      ...baseTheme.fonts,
      ...(overrides.fonts || {}),
    },
    spacing: {
      ...baseTheme.spacing,
      ...(overrides.spacing || {}),
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...(overrides.borderRadius || {}),
    },
    transitions: {
      ...baseTheme.transitions,
      ...(overrides.transitions || {}),
    },
    zIndex: {
      ...baseTheme.zIndex,
      ...(overrides.zIndex || {}),
    },
  };
};

/**
 * Extract theme preferences for storage
 */
export const extractThemePreferences = (theme: Theme, mode: ThemeMode) => {
  return {
    mode,
    currentTheme: theme.name,
    autoDetectSystem: mode === 'system',
  };
};

/**
 * Generate theme CSS class name
 */
export const getThemeClassName = (theme: Theme): string => {
  return `theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}`;
};

/**
 * Generate mode CSS class name
 */
export const getModeClassName = (mode: 'light' | 'dark'): string => {
  return `mode-${mode}`;
};

/**
 * Check if theme is a custom theme
 */
export const isCustomTheme = (theme: Theme): theme is CustomTheme => {
  return 'id' in theme && 'isBuiltIn' in theme && !(theme as CustomTheme).isBuiltIn;
};

/**
 * Clone a theme for customization
 */
export const cloneTheme = (theme: Theme, newName: string): CustomTheme => {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: newName,
    mode: theme.mode,
    description: `Custom theme based on ${theme.name}`,
    author: 'User',
    version: '1.0.0',
    isBuiltIn: false,
    colors: { ...theme.colors },
    fonts: { ...theme.fonts },
    spacing: { ...theme.spacing },
    borderRadius: { ...theme.borderRadius },
    transitions: { ...theme.transitions },
    zIndex: { ...theme.zIndex },
  };
};

/**
 * Export theme as JSON
 */
export const exportTheme = (theme: Theme): string => {
  return JSON.stringify(theme, null, 2);
};

/**
 * Import theme from JSON
 */
export const importTheme = (json: string): CustomTheme => {
  try {
    const parsed = JSON.parse(json);
    
    // Validate basic structure
    if (!parsed.name || !parsed.colors || !parsed.mode) {
      throw new Error('Invalid theme format');
    }
    
    // Ensure it's marked as custom
    const customTheme: CustomTheme = {
      ...parsed,
      id: parsed.id || `imported-${Date.now()}`,
      isBuiltIn: false,
      version: parsed.version || '1.0.0',
    };
    
    return customTheme;
  } catch (error) {
    throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate theme preview colors for UI
 */
export const getThemePreview = (theme: Theme) => {
  return {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    background: theme.colors.background,
    foreground: theme.colors.foreground,
  };
};