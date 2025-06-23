import { Theme, ThemeColors } from '@code-pilot/types';
import { semanticColors } from '../tokens/colors';
import { spacingTokens } from '../tokens/spacing';
import { typographyTokens } from '../tokens/typography';

// Dark theme color mapping
const darkColors: ThemeColors = {
  // Background colors
  background: semanticColors.dark.background.primary,
  backgroundSecondary: semanticColors.dark.background.secondary,
  backgroundTertiary: semanticColors.dark.background.tertiary,
  backgroundElevated: semanticColors.dark.background.elevated,
  
  // Foreground colors
  foreground: semanticColors.dark.foreground.primary,
  foregroundSecondary: semanticColors.dark.foreground.secondary,
  foregroundTertiary: semanticColors.dark.foreground.tertiary,
  foregroundMuted: semanticColors.dark.foreground.muted,
  
  // Primary colors
  primary: semanticColors.dark.brand.primary,
  primaryForeground: semanticColors.dark.brand.primaryForeground,
  primaryHover: semanticColors.dark.brand.primaryHover,
  primaryActive: semanticColors.dark.brand.primaryActive,
  
  // Secondary colors
  secondary: semanticColors.dark.surface.button,
  secondaryForeground: semanticColors.dark.foreground.primary,
  secondaryHover: semanticColors.dark.interactive.hover,
  secondaryActive: semanticColors.dark.interactive.active,
  
  // Accent colors
  accent: semanticColors.dark.brand.primary,
  accentForeground: semanticColors.dark.brand.primaryForeground,
  accentHover: semanticColors.dark.brand.primaryHover,
  accentActive: semanticColors.dark.brand.primaryActive,
  
  // Semantic colors
  error: semanticColors.dark.semantic.error,
  errorForeground: semanticColors.dark.semantic.errorForeground,
  errorBackground: semanticColors.dark.semantic.errorBackground,
  
  warning: semanticColors.dark.semantic.warning,
  warningForeground: semanticColors.dark.semantic.warningForeground,
  warningBackground: semanticColors.dark.semantic.warningBackground,
  
  success: semanticColors.dark.semantic.success,
  successForeground: semanticColors.dark.semantic.successForeground,
  successBackground: semanticColors.dark.semantic.successBackground,
  
  info: semanticColors.dark.semantic.info,
  infoForeground: semanticColors.dark.semantic.infoForeground,
  infoBackground: semanticColors.dark.semantic.infoBackground,
  
  // Border colors
  border: semanticColors.dark.border.default,
  borderHover: semanticColors.dark.border.hover,
  borderFocus: semanticColors.dark.border.focus,
  
  // Editor specific colors
  editorBackground: semanticColors.dark.editor.background,
  editorForeground: semanticColors.dark.editor.foreground,
  editorLineNumber: semanticColors.dark.editor.lineNumber,
  editorActiveLineBackground: semanticColors.dark.editor.activeLine,
  editorSelectionBackground: semanticColors.dark.editor.selection,
  editorCursorColor: semanticColors.dark.editor.cursor,
  
  // Sidebar colors
  sidebarBackground: semanticColors.dark.sidebar.background,
  sidebarForeground: semanticColors.dark.sidebar.foreground,
  sidebarBorder: semanticColors.dark.sidebar.border,
  sidebarItemHoverBackground: semanticColors.dark.sidebar.itemHover,
  sidebarItemActiveBackground: semanticColors.dark.sidebar.itemActive,
  
  // Tab colors
  tabBackground: semanticColors.dark.tab.background,
  tabForeground: semanticColors.dark.tab.foreground,
  tabActiveBackground: semanticColors.dark.tab.activeBackground,
  tabActiveForeground: semanticColors.dark.tab.activeForeground,
  tabHoverBackground: semanticColors.dark.tab.hoverBackground,
  tabBorder: semanticColors.dark.tab.border,
  
  // Input colors
  inputBackground: semanticColors.dark.surface.input,
  inputForeground: semanticColors.dark.foreground.primary,
  inputBorder: semanticColors.dark.surface.inputBorder,
  inputBorderFocus: semanticColors.dark.border.focus,
  inputPlaceholder: semanticColors.dark.foreground.muted,
  
  // Button colors
  buttonBackground: semanticColors.dark.surface.button,
  buttonForeground: semanticColors.dark.foreground.primary,
  buttonHoverBackground: semanticColors.dark.interactive.hover,
  buttonActiveBackground: semanticColors.dark.interactive.active,
  buttonBorder: semanticColors.dark.surface.buttonBorder,
  
  // Tooltip colors
  tooltipBackground: semanticColors.dark.background.elevated,
  tooltipForeground: semanticColors.dark.foreground.primary,
  tooltipBorder: semanticColors.dark.border.default,
  
  // Scrollbar colors
  scrollbarThumb: semanticColors.dark.border.default,
  scrollbarThumbHover: semanticColors.dark.border.hover,
  scrollbarTrack: semanticColors.dark.background.secondary,
  
  // Shadow colors
  shadowLight: semanticColors.dark.shadow.light,
  shadowMedium: semanticColors.dark.shadow.medium,
  shadowDark: semanticColors.dark.shadow.dark,
};

export const darkTheme: Theme = {
  name: 'Dark',
  mode: 'dark',
  colors: darkColors,
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