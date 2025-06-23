// Design tokens for spacing and layout
// Consistent spacing scale for all themes

export const spacingTokens = {
  // Base spacing units (rem-based for accessibility)
  space: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },
  
  // Component-specific spacing
  component: {
    // Button spacing
    button: {
      paddingX: {
        sm: '0.75rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
      },
      paddingY: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem',
      },
      gap: '0.5rem',
    },
    
    // Input spacing
    input: {
      paddingX: '0.75rem',
      paddingY: '0.5rem',
      gap: '0.5rem',
    },
    
    // Card spacing
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      gap: '1rem',
    },
    
    // Form spacing
    form: {
      fieldGap: '1rem',
      labelGap: '0.5rem',
      sectionGap: '2rem',
    },
    
    // Layout spacing
    layout: {
      sidebarWidth: '16rem',
      sidebarCollapsedWidth: '3rem',
      headerHeight: '3.5rem',
      footerHeight: '2.5rem',
      tabHeight: '2.5rem',
      statusBarHeight: '1.5rem',
    },
    
    // Editor spacing
    editor: {
      lineHeight: '1.5rem',
      gutterWidth: '3rem',
      scrollbarWidth: '0.75rem',
      miniMapWidth: '6rem',
    },
    
    // Terminal spacing
    terminal: {
      padding: '1rem',
      lineHeight: '1.2rem',
      fontSize: '0.875rem',
    },
    
    // Panel spacing
    panel: {
      padding: '1rem',
      headerHeight: '2.5rem',
      footerHeight: '2rem',
      gap: '0.5rem',
    },
    
    // Modal spacing
    modal: {
      padding: '1.5rem',
      gap: '1rem',
      backdropBlur: '8px',
    },
    
    // Toast/notification spacing
    toast: {
      padding: '1rem',
      gap: '0.75rem',
      iconSize: '1.25rem',
    },
  },
  
  // Responsive breakpoints (for reference)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Grid system
  grid: {
    columns: 12,
    gap: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
} as const;

// Spacing utilities
export const spacingUtils = {
  // Convert spacing token to CSS value
  getSpacing: (key: keyof typeof spacingTokens.space) => spacingTokens.space[key],
  
  // Generate responsive spacing
  responsive: {
    sm: (value: string) => `@media (min-width: ${spacingTokens.breakpoints.sm}) { ${value} }`,
    md: (value: string) => `@media (min-width: ${spacingTokens.breakpoints.md}) { ${value} }`,
    lg: (value: string) => `@media (min-width: ${spacingTokens.breakpoints.lg}) { ${value} }`,
    xl: (value: string) => `@media (min-width: ${spacingTokens.breakpoints.xl}) { ${value} }`,
    '2xl': (value: string) => `@media (min-width: ${spacingTokens.breakpoints['2xl']}) { ${value} }`,
  },
  
  // Common spacing patterns
  stack: (gap: keyof typeof spacingTokens.space) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacingTokens.space[gap],
  }),
  
  inline: (gap: keyof typeof spacingTokens.space) => ({
    display: 'flex',
    flexDirection: 'row' as const,
    gap: spacingTokens.space[gap],
  }),
  
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  between: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};