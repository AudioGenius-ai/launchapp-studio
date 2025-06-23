import { Theme, ThemeColors } from '@code-pilot/types';
import { semanticColors } from '../tokens/colors';
import { spacingTokens } from '../tokens/spacing';
import { typographyTokens } from '../tokens/typography';

// Light theme color mapping
const lightColors: ThemeColors = {
  // Background colors
  background: semanticColors.light.background.primary,
  backgroundSecondary: semanticColors.light.background.secondary,
  backgroundTertiary: semanticColors.light.background.tertiary,
  backgroundElevated: semanticColors.light.background.elevated,
  
  // Foreground colors
  foreground: semanticColors.light.foreground.primary,
  foregroundSecondary: semanticColors.light.foreground.secondary,
  foregroundTertiary: semanticColors.light.foreground.tertiary,
  foregroundMuted: semanticColors.light.foreground.muted,
  
  // Primary colors
  primary: semanticColors.light.brand.primary,
  primaryForeground: semanticColors.light.brand.primaryForeground,
  primaryHover: semanticColors.light.brand.primaryHover,
  primaryActive: semanticColors.light.brand.primaryActive,
  
  // Secondary colors
  secondary: semanticColors.light.surface.button,
  secondaryForeground: semanticColors.light.foreground.primary,
  secondaryHover: semanticColors.light.interactive.hover,
  secondaryActive: semanticColors.light.interactive.active,
  
  // Accent colors
  accent: semanticColors.light.brand.primary,
  accentForeground: semanticColors.light.brand.primaryForeground,
  accentHover: semanticColors.light.brand.primaryHover,
  accentActive: semanticColors.light.brand.primaryActive,
  
  // Semantic colors
  error: semanticColors.light.semantic.error,
  errorForeground: semanticColors.light.semantic.errorForeground,
  errorBackground: semanticColors.light.semantic.errorBackground,
  
  warning: semanticColors.light.semantic.warning,
  warningForeground: semanticColors.light.semantic.warningForeground,
  warningBackground: semanticColors.light.semantic.warningBackground,
  
  success: semanticColors.light.semantic.success,
  successForeground: semanticColors.light.semantic.successForeground,
  successBackground: semanticColors.light.semantic.successBackground,
  
  info: semanticColors.light.semantic.info,
  infoForeground: semanticColors.light.semantic.infoForeground,
  infoBackground: semanticColors.light.semantic.infoBackground,
  
  // Border colors
  border: semanticColors.light.border.default,
  borderHover: semanticColors.light.border.hover,
  borderFocus: semanticColors.light.border.focus,
  
  // Editor specific colors
  editorBackground: semanticColors.light.editor.background,
  editorForeground: semanticColors.light.editor.foreground,
  editorLineNumber: semanticColors.light.editor.lineNumber,
  editorActiveLineBackground: semanticColors.light.editor.activeLine,
  editorSelectionBackground: semanticColors.light.editor.selection,
  editorCursorColor: semanticColors.light.editor.cursor,
  
  // Sidebar colors
  sidebarBackground: semanticColors.light.sidebar.background,
  sidebarForeground: semanticColors.light.sidebar.foreground,
  sidebarBorder: semanticColors.light.sidebar.border,
  sidebarItemHoverBackground: semanticColors.light.sidebar.itemHover,
  sidebarItemActiveBackground: semanticColors.light.sidebar.itemActive,
  
  // Tab colors
  tabBackground: semanticColors.light.tab.background,
  tabForeground: semanticColors.light.tab.foreground,
  tabActiveBackground: semanticColors.light.tab.activeBackground,
  tabActiveForeground: semanticColors.light.tab.activeForeground,
  tabHoverBackground: semanticColors.light.tab.hoverBackground,
  tabBorder: semanticColors.light.tab.border,
  
  // Input colors
  inputBackground: semanticColors.light.surface.input,
  inputForeground: semanticColors.light.foreground.primary,
  inputBorder: semanticColors.light.surface.inputBorder,
  inputBorderFocus: semanticColors.light.border.focus,
  inputPlaceholder: semanticColors.light.foreground.muted,
  
  // Button colors
  buttonBackground: semanticColors.light.surface.button,
  buttonForeground: semanticColors.light.foreground.primary,
  buttonHoverBackground: semanticColors.light.interactive.hover,
  buttonActiveBackground: semanticColors.light.interactive.active,
  buttonBorder: semanticColors.light.surface.buttonBorder,
  
  // Tooltip colors
  tooltipBackground: semanticColors.light.background.elevated,
  tooltipForeground: semanticColors.light.foreground.primary,
  tooltipBorder: semanticColors.light.border.default,
  
  // Scrollbar colors
  scrollbarThumb: semanticColors.light.border.default,
  scrollbarThumbHover: semanticColors.light.border.hover,
  scrollbarTrack: semanticColors.light.background.secondary,
  
  // Shadow colors
  shadowLight: semanticColors.light.shadow.light,
  shadowMedium: semanticColors.light.shadow.medium,
  shadowDark: semanticColors.light.shadow.dark,
};

export const lightTheme: Theme = {
  name: 'Light',
  mode: 'light',
  colors: lightColors,
  fonts: {
    fontFamily: typographyTokens.fontFamily.sans,
    fontFamilyMono: typographyTokens.fontFamily.mono,
    fontSize: {
      xs: typographyTokens.fontSize.xs,
      sm: typographyTokens.fontSize.sm,
      base: typographyTokens.fontSize.base,
      lg: typographyTokens.fontSize.lg,
      xl: typographyTokens.fontSize.xl,
      '2xl': typographyTokens.fontSize['2xl'],
      '3xl': typographyTokens.fontSize['3xl'],
      '4xl': typographyTokens.fontSize['4xl'],
    },
    fontWeight: {
      light: typographyTokens.fontWeight.light,
      normal: typographyTokens.fontWeight.normal,
      medium: typographyTokens.fontWeight.medium,
      semibold: typographyTokens.fontWeight.semibold,
      bold: typographyTokens.fontWeight.bold,
    },
    lineHeight: {
      tight: typographyTokens.lineHeight.tight,
      normal: typographyTokens.lineHeight.normal,
      relaxed: typographyTokens.lineHeight.relaxed,
      loose: typographyTokens.lineHeight.loose,
    },
  },
  spacing: {
    0: spacingTokens.space[0],
    1: spacingTokens.space[1],
    2: spacingTokens.space[2],
    3: spacingTokens.space[3],
    4: spacingTokens.space[4],
    5: spacingTokens.space[5],
    6: spacingTokens.space[6],
    8: spacingTokens.space[8],
    10: spacingTokens.space[10],
    12: spacingTokens.space[12],
    16: spacingTokens.space[16],
    20: spacingTokens.space[20],
    24: spacingTokens.space[24],
    32: spacingTokens.space[32],
    40: spacingTokens.space[40],
    48: spacingTokens.space[48],
    64: spacingTokens.space[64],
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  transitions: {
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
  },
  zIndex: {
    dropdown: 1000,
    modal: 1050,
    popover: 1100,
    tooltip: 1150,
    notification: 1200,
  },
};