import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Theme,
  ThemeMode,
  ThemeContextValue,
  ThemeProviderProps,
  CustomTheme,
} from '@launchapp/types';
import { ThemeService } from '@launchapp/core';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'Light',
  defaultMode = 'system',
  enableTransitions = true,
  transitionDuration = 250,
}) => {
  const themeService = ThemeService.getInstance();
  
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [themeName, setThemeName] = useState<string>(defaultTheme);
  const [theme, setTheme] = useState<Theme>(themeService.getCurrentTheme());
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(themeService.getCustomThemes());

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setTheme(themeService.getCurrentTheme());
    };

    // Check if addEventListener is supported
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [mode, themeService]);

  // Apply CSS variables when theme changes
  useEffect(() => {
    // Add transition class if enabled
    if (enableTransitions) {
      document.documentElement.style.transition = `
        background-color ${transitionDuration}ms ease-in-out,
        color ${transitionDuration}ms ease-in-out,
        border-color ${transitionDuration}ms ease-in-out
      `;
    }

    // Apply theme CSS variables
    themeService.applyCSSVariables(theme);

    // Clean up transition after theme change
    if (enableTransitions) {
      const timer = setTimeout(() => {
        document.documentElement.style.transition = '';
      }, transitionDuration);
      return () => clearTimeout(timer);
    }
  }, [theme, themeService, enableTransitions, transitionDuration]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    themeService.setMode(newMode);
    setTheme(themeService.getCurrentTheme());
  }, [themeService]);

  const setThemeByName = useCallback((name: string) => {
    setThemeName(name);
    themeService.setTheme(name);
    setTheme(themeService.getCurrentTheme());
  }, [themeService]);

  const addCustomTheme = useCallback(async (customTheme: CustomTheme) => {
    await themeService.addCustomTheme(customTheme);
    setCustomThemes(themeService.getCustomThemes());
  }, [themeService]);

  const removeCustomTheme = useCallback(async (themeId: string) => {
    await themeService.removeCustomTheme(themeId);
    setCustomThemes(themeService.getCustomThemes());
    // Update current theme if it was removed
    setTheme(themeService.getCurrentTheme());
  }, [themeService]);

  const updateCustomTheme = useCallback(async (themeId: string, updates: Partial<CustomTheme>) => {
    await themeService.updateCustomTheme(themeId, updates);
    setCustomThemes(themeService.getCustomThemes());
    // Update current theme if it was modified
    setTheme(themeService.getCurrentTheme());
  }, [themeService]);

  const resetToDefaults = useCallback(() => {
    themeService.resetToDefaults();
    setMode('system');
    setThemeName('Light');
    setTheme(themeService.getCurrentTheme());
    setCustomThemes([]);
  }, [themeService]);

  const contextValue = useMemo<ThemeContextValue>(() => ({
    theme,
    mode,
    setMode,
    setTheme: setThemeByName,
    availableThemes: themeService.getAvailableThemes(),
    customThemes,
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    resetToDefaults,
    isDark: theme.mode === 'dark',
    isLight: theme.mode === 'light',
    isSystem: mode === 'system',
  }), [
    theme,
    mode,
    setMode,
    setThemeByName,
    customThemes,
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    resetToDefaults,
    themeService,
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for accessing specific theme values
export const useThemeValue = <K extends keyof Theme>(key: K): Theme[K] => {
  const { theme } = useTheme();
  return theme[key];
};

// Hook for accessing theme colors
export const useThemeColors = () => {
  return useThemeValue('colors');
};

// Hook for accessing theme fonts
export const useThemeFonts = () => {
  return useThemeValue('fonts');
};

// Hook for accessing theme spacing
export const useThemeSpacing = () => {
  return useThemeValue('spacing');
};

// Hook for theme mode detection
export const useThemeMode = () => {
  const { mode, isDark, isLight, isSystem } = useTheme();
  return { mode, isDark, isLight, isSystem };
};

// Higher-order component for theming
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
): React.ComponentType<P> {
  return (props: P) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
}