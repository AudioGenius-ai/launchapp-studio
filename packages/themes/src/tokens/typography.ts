// Design tokens for typography
// Comprehensive type scale and font definitions

export const typographyTokens = {
  // Font families
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(', '),
    
    mono: [
      '"SF Mono"',
      'Monaco',
      '"Fira Code"',
      '"JetBrains Mono"',
      'Consolas',
      '"Liberation Mono"',
      'Menlo',
      'monospace',
    ].join(', '),
    
    serif: [
      'Georgia',
      '"Times New Roman"',
      'Times',
      'serif',
    ].join(', '),
  },
  
  // Font sizes with rem units for accessibility
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  // Font weights
  fontWeight: {
    thin: 100,
    extraLight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extraBold: 800,
    black: 900,
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Text decoration
  textDecoration: {
    none: 'none',
    underline: 'underline',
    overline: 'overline',
    lineThrough: 'line-through',
  },
  
  // Text transform
  textTransform: {
    none: 'none',
    capitalize: 'capitalize',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
  },
} as const;

// Component-specific typography styles
export const componentTypography = {
  // Headings
  heading: {
    h1: {
      fontSize: typographyTokens.fontSize['4xl'],
      fontWeight: typographyTokens.fontWeight.bold,
      lineHeight: typographyTokens.lineHeight.tight,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    h2: {
      fontSize: typographyTokens.fontSize['3xl'],
      fontWeight: typographyTokens.fontWeight.bold,
      lineHeight: typographyTokens.lineHeight.tight,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    h3: {
      fontSize: typographyTokens.fontSize['2xl'],
      fontWeight: typographyTokens.fontWeight.semibold,
      lineHeight: typographyTokens.lineHeight.snug,
    },
    h4: {
      fontSize: typographyTokens.fontSize.xl,
      fontWeight: typographyTokens.fontWeight.semibold,
      lineHeight: typographyTokens.lineHeight.snug,
    },
    h5: {
      fontSize: typographyTokens.fontSize.lg,
      fontWeight: typographyTokens.fontWeight.medium,
      lineHeight: typographyTokens.lineHeight.normal,
    },
    h6: {
      fontSize: typographyTokens.fontSize.base,
      fontWeight: typographyTokens.fontWeight.medium,
      lineHeight: typographyTokens.lineHeight.normal,
    },
  },
  
  // Body text
  body: {
    large: {
      fontSize: typographyTokens.fontSize.lg,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.relaxed,
    },
    default: {
      fontSize: typographyTokens.fontSize.base,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
    },
    small: {
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
    },
    extraSmall: {
      fontSize: typographyTokens.fontSize.xs,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
    },
  },
  
  // Code and monospace
  code: {
    inline: {
      fontFamily: typographyTokens.fontFamily.mono,
      fontSize: '0.875em', // Relative to parent
      fontWeight: typographyTokens.fontWeight.medium,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    block: {
      fontFamily: typographyTokens.fontFamily.mono,
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.relaxed,
      letterSpacing: typographyTokens.letterSpacing.tight,
    },
    editor: {
      fontFamily: typographyTokens.fontFamily.mono,
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: '1.6',
      letterSpacing: typographyTokens.letterSpacing.normal,
    },
  },
  
  // UI components
  button: {
    small: {
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.medium,
      lineHeight: typographyTokens.lineHeight.none,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
    medium: {
      fontSize: typographyTokens.fontSize.base,
      fontWeight: typographyTokens.fontWeight.medium,
      lineHeight: typographyTokens.lineHeight.none,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
    large: {
      fontSize: typographyTokens.fontSize.lg,
      fontWeight: typographyTokens.fontWeight.medium,
      lineHeight: typographyTokens.lineHeight.none,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
  },
  
  // Form elements
  label: {
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.medium,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  
  input: {
    fontSize: typographyTokens.fontSize.base,
    fontWeight: typographyTokens.fontWeight.normal,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  
  placeholder: {
    fontSize: typographyTokens.fontSize.base,
    fontWeight: typographyTokens.fontWeight.normal,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  
  // Navigation
  navigation: {
    primary: {
      fontSize: typographyTokens.fontSize.base,
      fontWeight: typographyTokens.fontWeight.medium,
      lineHeight: typographyTokens.lineHeight.normal,
    },
    secondary: {
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
    },
  },
  
  // Table
  table: {
    header: {
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.semibold,
      lineHeight: typographyTokens.lineHeight.normal,
      textTransform: typographyTokens.textTransform.uppercase,
      letterSpacing: typographyTokens.letterSpacing.wide,
    },
    cell: {
      fontSize: typographyTokens.fontSize.sm,
      fontWeight: typographyTokens.fontWeight.normal,
      lineHeight: typographyTokens.lineHeight.normal,
    },
  },
  
  // Tooltips and overlays
  tooltip: {
    fontSize: typographyTokens.fontSize.xs,
    fontWeight: typographyTokens.fontWeight.medium,
    lineHeight: typographyTokens.lineHeight.tight,
  },
  
  // Status and badges
  badge: {
    fontSize: typographyTokens.fontSize.xs,
    fontWeight: typographyTokens.fontWeight.semibold,
    lineHeight: typographyTokens.lineHeight.none,
    letterSpacing: typographyTokens.letterSpacing.wide,
    textTransform: typographyTokens.textTransform.uppercase,
  },
} as const;

// Typography utilities
export const typographyUtils = {
  // Generate font stack
  fontStack: (family: keyof typeof typographyTokens.fontFamily) => ({
    fontFamily: typographyTokens.fontFamily[family],
  }),
  
  // Generate responsive typography
  responsive: (
    baseSize: keyof typeof typographyTokens.fontSize,
    scaling: Record<string, keyof typeof typographyTokens.fontSize>
  ) => {
    const base = { fontSize: typographyTokens.fontSize[baseSize] };
    const breakpoints = Object.entries(scaling).map(([breakpoint, size]) => 
      `@media (min-width: ${breakpoint}) { font-size: ${typographyTokens.fontSize[size]}; }`
    );
    return { ...base, breakpoints };
  },
  
  // Truncate text utilities
  truncate: {
    single: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    multiline: (lines: number) => ({
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    }),
  },
  
  // Text alignment utilities
  align: {
    left: { textAlign: 'left' as const },
    center: { textAlign: 'center' as const },
    right: { textAlign: 'right' as const },
    justify: { textAlign: 'justify' as const },
  },
  
  // Common text styles
  emphasis: {
    strong: { fontWeight: typographyTokens.fontWeight.bold },
    emphasis: { fontStyle: 'italic' },
    subtle: { opacity: 0.7 },
    muted: { opacity: 0.5 },
  },
};