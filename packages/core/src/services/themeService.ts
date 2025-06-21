import {
  Theme,
  ThemeMode,
  ThemePreferences,
  CustomTheme,
  ThemeColors,
  ThemeFonts,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeTransitions,
  ThemeZIndex,
} from '@code-pilot/types';

// Default theme definitions
const defaultSpacing: ThemeSpacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  64: '16rem',
};

const defaultFonts: ThemeFonts = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMono: '"SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

const defaultBorderRadius: ThemeBorderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

const defaultTransitions: ThemeTransitions = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

const defaultZIndex: ThemeZIndex = {
  dropdown: 1000,
  modal: 1050,
  popover: 1100,
  tooltip: 1150,
  notification: 1200,
};

// Light theme colors
const lightColors: ThemeColors = {
  // Background colors
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundTertiary: '#f3f4f6',
  backgroundElevated: '#ffffff',
  
  // Foreground colors
  foreground: '#111827',
  foregroundSecondary: '#4b5563',
  foregroundTertiary: '#6b7280',
  foregroundMuted: '#9ca3af',
  
  // Primary colors
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  primaryHover: '#2563eb',
  primaryActive: '#1d4ed8',
  
  // Secondary colors
  secondary: '#e5e7eb',
  secondaryForeground: '#111827',
  secondaryHover: '#d1d5db',
  secondaryActive: '#9ca3af',
  
  // Accent colors
  accent: '#f59e0b',
  accentForeground: '#ffffff',
  accentHover: '#d97706',
  accentActive: '#b45309',
  
  // Semantic colors
  error: '#ef4444',
  errorForeground: '#ffffff',
  errorBackground: '#fee2e2',
  
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  warningBackground: '#fef3c7',
  
  success: '#10b981',
  successForeground: '#ffffff',
  successBackground: '#d1fae5',
  
  info: '#3b82f6',
  infoForeground: '#ffffff',
  infoBackground: '#dbeafe',
  
  // Border colors
  border: '#e5e7eb',
  borderHover: '#d1d5db',
  borderFocus: '#3b82f6',
  
  // Editor specific colors
  editorBackground: '#ffffff',
  editorForeground: '#111827',
  editorLineNumber: '#9ca3af',
  editorActiveLineBackground: '#f9fafb',
  editorSelectionBackground: '#dbeafe',
  editorCursorColor: '#111827',
  
  // Sidebar colors
  sidebarBackground: '#f9fafb',
  sidebarForeground: '#111827',
  sidebarBorder: '#e5e7eb',
  sidebarItemHoverBackground: '#e5e7eb',
  sidebarItemActiveBackground: '#dbeafe',
  
  // Tab colors
  tabBackground: '#f3f4f6',
  tabForeground: '#6b7280',
  tabActiveBackground: '#ffffff',
  tabActiveForeground: '#111827',
  tabHoverBackground: '#e5e7eb',
  tabBorder: '#e5e7eb',
  
  // Input colors
  inputBackground: '#ffffff',
  inputForeground: '#111827',
  inputBorder: '#d1d5db',
  inputBorderFocus: '#3b82f6',
  inputPlaceholder: '#9ca3af',
  
  // Button colors
  buttonBackground: '#3b82f6',
  buttonForeground: '#ffffff',
  buttonHoverBackground: '#2563eb',
  buttonActiveBackground: '#1d4ed8',
  buttonBorder: 'transparent',
  
  // Tooltip colors
  tooltipBackground: '#1f2937',
  tooltipForeground: '#ffffff',
  tooltipBorder: 'transparent',
  
  // Scrollbar colors
  scrollbarThumb: '#d1d5db',
  scrollbarThumbHover: '#9ca3af',
  scrollbarTrack: '#f3f4f6',
  
  // Shadow colors
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
};

// Dark theme colors
const darkColors: ThemeColors = {
  // Background colors
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundTertiary: '#334155',
  backgroundElevated: '#1e293b',
  
  // Foreground colors
  foreground: '#f8fafc',
  foregroundSecondary: '#cbd5e1',
  foregroundTertiary: '#94a3b8',
  foregroundMuted: '#64748b',
  
  // Primary colors
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  primaryHover: '#60a5fa',
  primaryActive: '#2563eb',
  
  // Secondary colors
  secondary: '#334155',
  secondaryForeground: '#f8fafc',
  secondaryHover: '#475569',
  secondaryActive: '#64748b',
  
  // Accent colors
  accent: '#f59e0b',
  accentForeground: '#ffffff',
  accentHover: '#fbbf24',
  accentActive: '#d97706',
  
  // Semantic colors
  error: '#ef4444',
  errorForeground: '#ffffff',
  errorBackground: '#7f1d1d',
  
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  warningBackground: '#78350f',
  
  success: '#10b981',
  successForeground: '#ffffff',
  successBackground: '#064e3b',
  
  info: '#3b82f6',
  infoForeground: '#ffffff',
  infoBackground: '#1e3a8a',
  
  // Border colors
  border: '#334155',
  borderHover: '#475569',
  borderFocus: '#3b82f6',
  
  // Editor specific colors
  editorBackground: '#0f172a',
  editorForeground: '#f8fafc',
  editorLineNumber: '#64748b',
  editorActiveLineBackground: '#1e293b',
  editorSelectionBackground: '#1e3a8a',
  editorCursorColor: '#f8fafc',
  
  // Sidebar colors
  sidebarBackground: '#0f172a',
  sidebarForeground: '#f8fafc',
  sidebarBorder: '#334155',
  sidebarItemHoverBackground: '#1e293b',
  sidebarItemActiveBackground: '#1e3a8a',
  
  // Tab colors
  tabBackground: '#1e293b',
  tabForeground: '#94a3b8',
  tabActiveBackground: '#0f172a',
  tabActiveForeground: '#f8fafc',
  tabHoverBackground: '#334155',
  tabBorder: '#334155',
  
  // Input colors
  inputBackground: '#1e293b',
  inputForeground: '#f8fafc',
  inputBorder: '#475569',
  inputBorderFocus: '#3b82f6',
  inputPlaceholder: '#64748b',
  
  // Button colors
  buttonBackground: '#3b82f6',
  buttonForeground: '#ffffff',
  buttonHoverBackground: '#60a5fa',
  buttonActiveBackground: '#2563eb',
  buttonBorder: 'transparent',
  
  // Tooltip colors
  tooltipBackground: '#f8fafc',
  tooltipForeground: '#0f172a',
  tooltipBorder: 'transparent',
  
  // Scrollbar colors
  scrollbarThumb: '#475569',
  scrollbarThumbHover: '#64748b',
  scrollbarTrack: '#1e293b',
  
  // Shadow colors
  shadowLight: 'rgba(0, 0, 0, 0.25)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
};

// Built-in themes
const lightTheme: Theme = {
  name: 'Light',
  mode: 'light',
  colors: lightColors,
  fonts: defaultFonts,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
  transitions: defaultTransitions,
  zIndex: defaultZIndex,
};

const darkTheme: Theme = {
  name: 'Dark',
  mode: 'dark',
  colors: darkColors,
  fonts: defaultFonts,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
  transitions: defaultTransitions,
  zIndex: defaultZIndex,
};

const STORAGE_KEY = 'codepilot-theme-preferences';

export class ThemeService {
  private static instance: ThemeService;
  private themes: Map<string, Theme> = new Map();
  private customThemes: Map<string, CustomTheme> = new Map();
  private preferences: ThemePreferences = {
    mode: 'system',
    currentTheme: 'Light',
    customThemes: [],
    autoDetectSystem: true,
  };

  private constructor() {
    // Initialize built-in themes
    this.themes.set('Light', lightTheme);
    this.themes.set('Dark', darkTheme);
    
    // Load preferences from storage
    this.loadPreferences();
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...this.preferences, ...parsed };
        
        // Load custom themes
        if (this.preferences.customThemes) {
          this.preferences.customThemes.forEach(theme => {
            this.customThemes.set(theme.id, theme);
            this.themes.set(theme.name, theme);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load theme preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save theme preferences:', error);
    }
  }

  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  getCurrentTheme(): Theme {
    const systemPrefersDark = this.getSystemPrefersDark();
    const mode = this.preferences.mode;
    
    if (mode === 'system') {
      return systemPrefersDark ? darkTheme : lightTheme;
    } else if (mode === 'dark') {
      const theme = this.themes.get(this.preferences.currentTheme);
      return theme?.mode === 'dark' ? theme : darkTheme;
    } else {
      const theme = this.themes.get(this.preferences.currentTheme);
      return theme?.mode === 'light' ? theme : lightTheme;
    }
  }

  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  getCustomThemes(): CustomTheme[] {
    return Array.from(this.customThemes.values());
  }

  setMode(mode: ThemeMode): void {
    this.preferences.mode = mode;
    this.savePreferences();
  }

  setTheme(name: string): void {
    if (this.themes.has(name)) {
      this.preferences.currentTheme = name;
      this.savePreferences();
    }
  }

  async addCustomTheme(theme: CustomTheme): Promise<void> {
    this.customThemes.set(theme.id, theme);
    this.themes.set(theme.name, theme);
    this.preferences.customThemes = Array.from(this.customThemes.values());
    this.savePreferences();
  }

  async removeCustomTheme(themeId: string): Promise<void> {
    const theme = this.customThemes.get(themeId);
    if (theme && !theme.isBuiltIn) {
      this.customThemes.delete(themeId);
      this.themes.delete(theme.name);
      this.preferences.customThemes = Array.from(this.customThemes.values());
      
      // Reset to default if removing current theme
      if (this.preferences.currentTheme === theme.name) {
        this.preferences.currentTheme = 'Light';
      }
      
      this.savePreferences();
    }
  }

  async updateCustomTheme(themeId: string, updates: Partial<CustomTheme>): Promise<void> {
    const theme = this.customThemes.get(themeId);
    if (theme && !theme.isBuiltIn) {
      const oldName = theme.name;
      const updatedTheme = { ...theme, ...updates };
      
      this.customThemes.set(themeId, updatedTheme);
      
      // Update themes map if name changed
      if (oldName !== updatedTheme.name) {
        this.themes.delete(oldName);
        this.themes.set(updatedTheme.name, updatedTheme);
        
        // Update current theme if it was the renamed one
        if (this.preferences.currentTheme === oldName) {
          this.preferences.currentTheme = updatedTheme.name;
        }
      } else {
        this.themes.set(updatedTheme.name, updatedTheme);
      }
      
      this.preferences.customThemes = Array.from(this.customThemes.values());
      this.savePreferences();
    }
  }

  resetToDefaults(): void {
    this.preferences = {
      mode: 'system',
      currentTheme: 'Light',
      customThemes: [],
      autoDetectSystem: true,
    };
    
    // Clear custom themes
    this.customThemes.clear();
    this.themes.clear();
    this.themes.set('Light', lightTheme);
    this.themes.set('Dark', darkTheme);
    
    this.savePreferences();
  }

  private getSystemPrefersDark(): boolean {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  // Helper method to apply theme to CSS variables
  applyCSSVariables(theme: Theme): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, String(value));
    });
    
    // Apply font variables
    root.style.setProperty('--font-family', theme.fonts.fontFamily);
    root.style.setProperty('--font-family-mono', theme.fonts.fontFamilyMono);
    
    Object.entries(theme.fonts.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, String(value));
    });
    
    // Apply spacing variables
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, String(value));
    });
    
    // Apply border radius variables
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, String(value));
    });
    
    // Apply transition variables
    Object.entries(theme.transitions.duration).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, String(value));
    });
    
    // Set theme mode
    root.setAttribute('data-theme', theme.mode);
  }

  // Export theme as JSON
  exportTheme(name: string): string | null {
    const theme = this.themes.get(name);
    if (!theme) return null;
    
    return JSON.stringify(theme, null, 2);
  }

  // Import theme from JSON
  async importTheme(json: string): Promise<CustomTheme> {
    const parsed = JSON.parse(json);
    const customTheme: CustomTheme = {
      ...parsed,
      id: `custom-${Date.now()}`,
      isBuiltIn: false,
    };
    
    await this.addCustomTheme(customTheme);
    return customTheme;
  }
}