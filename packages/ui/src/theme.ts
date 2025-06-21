// Theme utilities for accessing CSS variables
export const theme = {
  colors: {
    background: 'var(--color-background)',
    backgroundSecondary: 'var(--color-backgroundSecondary)',
    backgroundTertiary: 'var(--color-backgroundTertiary)',
    backgroundElevated: 'var(--color-backgroundElevated)',
    
    foreground: 'var(--color-foreground)',
    foregroundSecondary: 'var(--color-foregroundSecondary)',
    foregroundTertiary: 'var(--color-foregroundTertiary)',
    foregroundMuted: 'var(--color-foregroundMuted)',
    
    primary: {
      DEFAULT: 'var(--color-primary)',
      foreground: 'var(--color-primaryForeground)',
      hover: 'var(--color-primaryHover)',
      active: 'var(--color-primaryActive)',
    },
    
    secondary: {
      DEFAULT: 'var(--color-secondary)',
      foreground: 'var(--color-secondaryForeground)',
      hover: 'var(--color-secondaryHover)',
      active: 'var(--color-secondaryActive)',
    },
    
    accent: {
      DEFAULT: 'var(--color-accent)',
      foreground: 'var(--color-accentForeground)',
      hover: 'var(--color-accentHover)',
      active: 'var(--color-accentActive)',
    },
    
    error: {
      DEFAULT: 'var(--color-error)',
      foreground: 'var(--color-errorForeground)',
      background: 'var(--color-errorBackground)',
    },
    
    warning: {
      DEFAULT: 'var(--color-warning)',
      foreground: 'var(--color-warningForeground)',
      background: 'var(--color-warningBackground)',
    },
    
    success: {
      DEFAULT: 'var(--color-success)',
      foreground: 'var(--color-successForeground)',
      background: 'var(--color-successBackground)',
    },
    
    info: {
      DEFAULT: 'var(--color-info)',
      foreground: 'var(--color-infoForeground)',
      background: 'var(--color-infoBackground)',
    },
    
    border: {
      DEFAULT: 'var(--color-border)',
      hover: 'var(--color-borderHover)',
      focus: 'var(--color-borderFocus)',
    },
    
    input: {
      background: 'var(--color-inputBackground)',
      foreground: 'var(--color-inputForeground)',
      border: 'var(--color-inputBorder)',
      borderFocus: 'var(--color-inputBorderFocus)',
      placeholder: 'var(--color-inputPlaceholder)',
    },
    
    button: {
      background: 'var(--color-buttonBackground)',
      foreground: 'var(--color-buttonForeground)',
      hoverBackground: 'var(--color-buttonHoverBackground)',
      activeBackground: 'var(--color-buttonActiveBackground)',
      border: 'var(--color-buttonBorder)',
    },
  },
  
  spacing: {
    0: 'var(--spacing-0)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    8: 'var(--spacing-8)',
    10: 'var(--spacing-10)',
    12: 'var(--spacing-12)',
    16: 'var(--spacing-16)',
    20: 'var(--spacing-20)',
    24: 'var(--spacing-24)',
    32: 'var(--spacing-32)',
    40: 'var(--spacing-40)',
    48: 'var(--spacing-48)',
    64: 'var(--spacing-64)',
  },
  
  radius: {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    base: 'var(--radius-base)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  },
  
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
  },
  
  transition: {
    fast: 'var(--transition-fast)',
    normal: 'var(--transition-normal)',
    slow: 'var(--transition-slow)',
  },
} as const;

export type Theme = typeof theme;