import { Theme } from '@code-pilot/types';

/**
 * Utilities for working with CSS custom properties (variables)
 */

/**
 * Generate CSS variables object from theme
 */
export const generateCSSVariables = (theme: Theme): Record<string, string> => {
  const variables: Record<string, string> = {};

  // Color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value;
  });

  // Font variables
  variables['--font-family'] = theme.fonts.fontFamily;
  variables['--font-family-mono'] = theme.fonts.fontFamilyMono;

  Object.entries(theme.fonts.fontSize).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });

  Object.entries(theme.fonts.fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value.toString();
  });

  Object.entries(theme.fonts.lineHeight).forEach(([key, value]) => {
    variables[`--line-height-${key}`] = value;
  });

  // Spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });

  // Border radius variables
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
  });

  // Transition variables
  Object.entries(theme.transitions.duration).forEach(([key, value]) => {
    variables[`--transition-duration-${key}`] = value;
  });

  Object.entries(theme.transitions.easing).forEach(([key, value]) => {
    variables[`--transition-easing-${key}`] = value;
  });

  // Z-index variables
  Object.entries(theme.zIndex).forEach(([key, value]) => {
    variables[`--z-index-${key}`] = value.toString();
  });

  // Commonly used composite variables
  variables['--transition-fast'] = `${theme.transitions.duration.fast} ${theme.transitions.easing.easeOut}`;
  variables['--transition-normal'] = `${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`;
  variables['--transition-slow'] = `${theme.transitions.duration.slow} ${theme.transitions.easing.easeInOut}`;

  return variables;
};

/**
 * Apply CSS variables to document root
 */
export const applyCSSVariables = (theme: Theme): void => {
  if (typeof document === 'undefined') return;

  const variables = generateCSSVariables(theme);
  const root = document.documentElement;

  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

/**
 * Remove all theme CSS variables from document root
 */
export const removeCSSVariables = (): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const style = root.style;

  // Get all properties and filter theme variables
  const properties = Array.from(style).filter(prop => 
    prop.startsWith('--color-') ||
    prop.startsWith('--font-') ||
    prop.startsWith('--spacing-') ||
    prop.startsWith('--radius-') ||
    prop.startsWith('--transition-') ||
    prop.startsWith('--z-index-') ||
    prop.startsWith('--line-height-')
  );

  properties.forEach(property => {
    root.style.removeProperty(property);
  });
};

/**
 * Generate CSS string with variables
 */
export const generateCSSString = (theme: Theme): string => {
  const variables = generateCSSVariables(theme);
  
  const cssVars = Object.entries(variables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');

  return `:root {\n${cssVars}\n}`;
};

/**
 * Generate CSS media query for theme mode
 */
export const generateThemeMediaQuery = (lightTheme: Theme, darkTheme: Theme): string => {
  const lightVars = generateCSSVariables(lightTheme);
  const darkVars = generateCSSVariables(darkTheme);

  const lightCSS = Object.entries(lightVars)
    .map(([property, value]) => `    ${property}: ${value};`)
    .join('\n');

  const darkCSS = Object.entries(darkVars)
    .map(([property, value]) => `    ${property}: ${value};`)
    .join('\n');

  return `
:root {
${lightCSS}
}

@media (prefers-color-scheme: dark) {
  :root {
${darkCSS}
  }
}

[data-theme="light"] {
${lightCSS}
}

[data-theme="dark"] {
${darkCSS}
}
`.trim();
};

/**
 * Get CSS variable value from computed styles
 */
export const getCSSVariable = (variableName: string): string => {
  if (typeof document === 'undefined') return '';
  
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

/**
 * Set CSS variable on document root
 */
export const setCSSVariable = (variableName: string, value: string): void => {
  if (typeof document === 'undefined') return;
  
  document.documentElement.style.setProperty(variableName, value);
};

/**
 * Create CSS variable reference string
 */
export const cssVar = (variableName: string, fallback?: string): string => {
  const varName = variableName.startsWith('--') ? variableName : `--${variableName}`;
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
};

/**
 * Create typed CSS variable getters
 */
export const createCSSVariableGetters = () => ({
  // Colors
  color: (key: string) => cssVar(`color-${key}`),
  
  // Typography
  fontSize: (key: string) => cssVar(`font-size-${key}`),
  fontWeight: (key: string) => cssVar(`font-weight-${key}`),
  lineHeight: (key: string) => cssVar(`line-height-${key}`),
  
  // Spacing
  spacing: (key: string) => cssVar(`spacing-${key}`),
  
  // Border radius
  radius: (key: string) => cssVar(`radius-${key}`),
  
  // Transitions
  transition: (key: string) => cssVar(`transition-${key}`),
  transitionDuration: (key: string) => cssVar(`transition-duration-${key}`),
  transitionEasing: (key: string) => cssVar(`transition-easing-${key}`),
  
  // Z-index
  zIndex: (key: string) => cssVar(`z-index-${key}`),
});

/**
 * Export theme as CSS file content
 */
export const exportThemeAsCSS = (theme: Theme): string => {
  const timestamp = new Date().toISOString();
  const header = `/*
 * Theme: ${theme.name}
 * Mode: ${theme.mode}
 * Generated: ${timestamp}
 */\n\n`;

  return header + generateCSSString(theme);
};

/**
 * Generate CSS custom properties with fallbacks
 */
export const generateCSSWithFallbacks = (theme: Theme, fallbackTheme?: Theme): string => {
  const variables = generateCSSVariables(theme);
  const fallbacks = fallbackTheme ? generateCSSVariables(fallbackTheme) : {};

  const cssVars = Object.entries(variables)
    .map(([property, value]) => {
      const fallback = fallbacks[property];
      return fallback 
        ? `  ${property}: ${value}; /* fallback: ${fallback} */`
        : `  ${property}: ${value};`;
    })
    .join('\n');

  return `:root {\n${cssVars}\n}`;
};