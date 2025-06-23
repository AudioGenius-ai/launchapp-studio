// Design tokens for colors with semantic naming
// These tokens provide a foundation for all themes

export const semanticColors = {
  // Base colors for light themes
  light: {
    // Background layers
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Foreground colors
    foreground: {
      primary: '#0f172a',
      secondary: '#334155',
      tertiary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
    
    // Brand colors
    brand: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryActive: '#1d4ed8',
      primaryForeground: '#ffffff',
    },
    
    // Semantic status colors
    semantic: {
      error: '#ef4444',
      errorForeground: '#ffffff',
      errorBackground: '#fef2f2',
      
      warning: '#f59e0b',
      warningForeground: '#92400e',
      warningBackground: '#fffbeb',
      
      success: '#10b981',
      successForeground: '#ffffff',
      successBackground: '#ecfdf5',
      
      info: '#3b82f6',
      infoForeground: '#ffffff',
      infoBackground: '#eff6ff',
    },
    
    // Interactive states
    interactive: {
      hover: '#f1f5f9',
      active: '#e2e8f0',
      focus: '#3b82f6',
      disabled: '#e2e8f0',
      disabledForeground: '#94a3b8',
    },
    
    // Border colors
    border: {
      default: '#e2e8f0',
      hover: '#cbd5e1',
      focus: '#3b82f6',
      error: '#ef4444',
      success: '#10b981',
    },
    
    // Surface colors for specific components
    surface: {
      card: '#ffffff',
      cardBorder: '#e2e8f0',
      input: '#ffffff',
      inputBorder: '#d1d5db',
      button: '#f8fafc',
      buttonBorder: '#e2e8f0',
    },
    
    // Editor specific colors
    editor: {
      background: '#ffffff',
      foreground: '#0f172a',
      lineNumber: '#94a3b8',
      activeLine: '#f8fafc',
      selection: '#dbeafe',
      cursor: '#3b82f6',
      gutter: '#f8fafc',
      gutterBorder: '#e2e8f0',
    },
    
    // Sidebar colors
    sidebar: {
      background: '#f8fafc',
      foreground: '#334155',
      border: '#e2e8f0',
      itemHover: '#f1f5f9',
      itemActive: '#e2e8f0',
      itemFocus: '#dbeafe',
    },
    
    // Tab colors
    tab: {
      background: '#f1f5f9',
      foreground: '#64748b',
      activeBackground: '#ffffff',
      activeForeground: '#0f172a',
      hoverBackground: '#e2e8f0',
      border: '#e2e8f0',
      activeBorder: '#3b82f6',
    },
    
    // Shadow colors
    shadow: {
      light: 'rgba(0, 0, 0, 0.05)',
      medium: 'rgba(0, 0, 0, 0.1)',
      dark: 'rgba(0, 0, 0, 0.25)',
    },
  },
  
  // Base colors for dark themes
  dark: {
    // Background layers
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      elevated: '#1e293b',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    
    // Foreground colors
    foreground: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      tertiary: '#cbd5e1',
      muted: '#94a3b8',
      inverse: '#0f172a',
    },
    
    // Brand colors
    brand: {
      primary: '#60a5fa',
      primaryHover: '#3b82f6',
      primaryActive: '#2563eb',
      primaryForeground: '#0f172a',
    },
    
    // Semantic status colors
    semantic: {
      error: '#f87171',
      errorForeground: '#0f172a',
      errorBackground: '#451a1a',
      
      warning: '#fbbf24',
      warningForeground: '#451a03',
      warningBackground: '#451a03',
      
      success: '#34d399',
      successForeground: '#0f172a',
      successBackground: '#064e3b',
      
      info: '#60a5fa',
      infoForeground: '#0f172a',
      infoBackground: '#1e3a8a',
    },
    
    // Interactive states
    interactive: {
      hover: '#334155',
      active: '#475569',
      focus: '#60a5fa',
      disabled: '#334155',
      disabledForeground: '#64748b',
    },
    
    // Border colors
    border: {
      default: '#334155',
      hover: '#475569',
      focus: '#60a5fa',
      error: '#f87171',
      success: '#34d399',
    },
    
    // Surface colors for specific components
    surface: {
      card: '#1e293b',
      cardBorder: '#334155',
      input: '#1e293b',
      inputBorder: '#475569',
      button: '#334155',
      buttonBorder: '#475569',
    },
    
    // Editor specific colors
    editor: {
      background: '#0f172a',
      foreground: '#f8fafc',
      lineNumber: '#64748b',
      activeLine: '#1e293b',
      selection: '#1e3a8a',
      cursor: '#60a5fa',
      gutter: '#1e293b',
      gutterBorder: '#334155',
    },
    
    // Sidebar colors
    sidebar: {
      background: '#1e293b',
      foreground: '#e2e8f0',
      border: '#334155',
      itemHover: '#334155',
      itemActive: '#475569',
      itemFocus: '#1e3a8a',
    },
    
    // Tab colors
    tab: {
      background: '#334155',
      foreground: '#cbd5e1',
      activeBackground: '#1e293b',
      activeForeground: '#f8fafc',
      hoverBackground: '#475569',
      border: '#334155',
      activeBorder: '#60a5fa',
    },
    
    // Shadow colors
    shadow: {
      light: 'rgba(0, 0, 0, 0.2)',
      medium: 'rgba(0, 0, 0, 0.4)',
      dark: 'rgba(0, 0, 0, 0.8)',
    },
  },
} as const;

// Color utilities for generating variations
export const colorUtils = {
  // Generate opacity variants
  withOpacity: (color: string, opacity: number) => {
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
  
  // Generate hover variant (slightly darker for light, lighter for dark)
  hover: (color: string, _mode: 'light' | 'dark' = 'light') => {
    // This would be expanded with actual color manipulation logic
    // For now, returning the original color
    return color;
  },
  
  // Generate active variant (darker than hover)
  active: (color: string, _mode: 'light' | 'dark' = 'light') => {
    // This would be expanded with actual color manipulation logic
    // For now, returning the original color
    return color;
  },
};

// Accessibility color contrast utilities
export const contrastUtils = {
  // Check if color combination meets WCAG AA standards
  meetsContrastRequirement: (_foreground: string, _background: string, _level: 'AA' | 'AAA' = 'AA') => {
    // Implementation would calculate actual contrast ratio
    // For now, returning true
    return true;
  },
  
  // Get appropriate foreground color for given background
  getContrastingForeground: (_background: string, mode: 'light' | 'dark' = 'light') => {
    // Implementation would calculate and return appropriate contrast color
    return mode === 'light' ? semanticColors.light.foreground.primary : semanticColors.dark.foreground.primary;
  },
};