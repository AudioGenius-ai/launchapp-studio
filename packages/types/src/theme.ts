// Theme Types and Interfaces for Code Pilot Studio v2

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundElevated: string;
  
  // Foreground colors
  foreground: string;
  foregroundSecondary: string;
  foregroundTertiary: string;
  foregroundMuted: string;
  
  // Primary colors
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryActive: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  secondaryActive: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  accentHover: string;
  accentActive: string;
  
  // Semantic colors
  error: string;
  errorForeground: string;
  errorBackground: string;
  
  warning: string;
  warningForeground: string;
  warningBackground: string;
  
  success: string;
  successForeground: string;
  successBackground: string;
  
  info: string;
  infoForeground: string;
  infoBackground: string;
  
  // Border colors
  border: string;
  borderHover: string;
  borderFocus: string;
  
  // Editor specific colors
  editorBackground: string;
  editorForeground: string;
  editorLineNumber: string;
  editorActiveLineBackground: string;
  editorSelectionBackground: string;
  editorCursorColor: string;
  
  // Sidebar colors
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarItemHoverBackground: string;
  sidebarItemActiveBackground: string;
  
  // Tab colors
  tabBackground: string;
  tabForeground: string;
  tabActiveBackground: string;
  tabActiveForeground: string;
  tabHoverBackground: string;
  tabBorder: string;
  
  // Input colors
  inputBackground: string;
  inputForeground: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputPlaceholder: string;
  
  // Button colors
  buttonBackground: string;
  buttonForeground: string;
  buttonHoverBackground: string;
  buttonActiveBackground: string;
  buttonBorder: string;
  
  // Tooltip colors
  tooltipBackground: string;
  tooltipForeground: string;
  tooltipBorder: string;
  
  // Scrollbar colors
  scrollbarThumb: string;
  scrollbarThumbHover: string;
  scrollbarTrack: string;
  
  // Shadow colors
  shadowLight: string;
  shadowMedium: string;
  shadowDark: string;
}

export interface ThemeFonts {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
}

export interface ThemeSpacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  64: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeTransitions {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ThemeZIndex {
  dropdown: number;
  modal: number;
  popover: number;
  tooltip: number;
  notification: number;
}

export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  transitions: ThemeTransitions;
  zIndex: ThemeZIndex;
}

export interface CustomTheme extends Theme {
  id: string;
  author?: string;
  version?: string;
  description?: string;
  isBuiltIn: boolean;
}

export interface ThemePreferences {
  mode: ThemeMode;
  currentTheme: string;
  customThemes: CustomTheme[];
  autoDetectSystem: boolean;
}

export interface ThemeProviderProps {
  children: any; // ReactNode type, but avoiding React dependency in types package
  defaultTheme?: string;
  defaultMode?: ThemeMode;
  enableTransitions?: boolean;
  transitionDuration?: number;
}

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
  customThemes: CustomTheme[];
  addCustomTheme: (theme: CustomTheme) => Promise<void>;
  removeCustomTheme: (themeId: string) => Promise<void>;
  updateCustomTheme: (themeId: string, updates: Partial<CustomTheme>) => Promise<void>;
  resetToDefaults: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

// Type guards
export function isCustomTheme(theme: Theme | CustomTheme): theme is CustomTheme {
  return 'id' in theme && 'isBuiltIn' in theme;
}

// CSS Variable mapping type
export type CSSVariableMap = {
  [K in keyof ThemeColors as `--color-${K}`]: string;
} & {
  [K in keyof ThemeFonts['fontSize'] as `--font-size-${K}`]: string;
} & {
  [K in keyof ThemeSpacing as `--spacing-${K}`]: string;
} & {
  [K in keyof ThemeBorderRadius as `--radius-${K}`]: string;
} & {
  '--font-family': string;
  '--font-family-mono': string;
  '--transition-fast': string;
  '--transition-normal': string;
  '--transition-slow': string;
};