import { Theme, CustomTheme, ThemeColors } from '@code-pilot/types';
import { isValidColor, meetsWCAGAA } from './colorUtils';

/**
 * Theme validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AccessibilityIssue {
  foreground: string;
  background: string;
  context: string;
  contrastRatio: number;
  recommendation: string;
}

/**
 * Validate theme structure and required properties
 */
export const validateThemeStructure = (theme: Partial<Theme>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required properties
  if (!theme.name) {
    errors.push('Theme must have a name');
  }

  if (!theme.mode || !['light', 'dark'].includes(theme.mode)) {
    errors.push('Theme must have a valid mode (light or dark)');
  }

  if (!theme.colors) {
    errors.push('Theme must have colors object');
  } else {
    // Validate color structure
    const colorValidation = validateColors(theme.colors);
    errors.push(...colorValidation.errors);
    warnings.push(...colorValidation.warnings);
  }

  if (!theme.fonts) {
    errors.push('Theme must have fonts object');
  } else {
    const fontValidation = validateFonts(theme.fonts);
    errors.push(...fontValidation.errors);
    warnings.push(...fontValidation.warnings);
  }

  if (!theme.spacing) {
    warnings.push('Theme should have spacing definitions');
  }

  if (!theme.borderRadius) {
    warnings.push('Theme should have border radius definitions');
  }

  if (!theme.transitions) {
    warnings.push('Theme should have transition definitions');
  }

  if (!theme.zIndex) {
    warnings.push('Theme should have z-index definitions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate color values and structure
 */
export const validateColors = (colors: Partial<ThemeColors>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredColors = [
    'background',
    'foreground',
    'primary',
    'primaryForeground',
    'secondary',
    'secondaryForeground',
    'border',
  ];

  // Check required colors
  requiredColors.forEach(colorKey => {
    if (!(colorKey in colors)) {
      errors.push(`Missing required color: ${colorKey}`);
    }
  });

  // Validate color format
  Object.entries(colors).forEach(([key, value]) => {
    if (value && !isValidColor(value)) {
      errors.push(`Invalid color format for ${key}: ${value}`);
    }
  });

  // Check for potential issues
  if (colors.background && colors.foreground) {
    if (colors.background === colors.foreground) {
      errors.push('Background and foreground colors cannot be the same');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate font configuration
 */
export const validateFonts = (fonts: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fonts.fontFamily) {
    errors.push('Font family is required');
  }

  if (!fonts.fontFamilyMono) {
    warnings.push('Monospace font family is recommended');
  }

  if (!fonts.fontSize) {
    errors.push('Font sizes are required');
  } else {
    const requiredSizes = ['base', 'sm', 'lg'];
    requiredSizes.forEach(size => {
      if (!(size in fonts.fontSize)) {
        warnings.push(`Missing font size: ${size}`);
      }
    });
  }

  if (!fonts.fontWeight) {
    warnings.push('Font weights are recommended');
  }

  if (!fonts.lineHeight) {
    warnings.push('Line heights are recommended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Check theme accessibility compliance
 */
export const validateAccessibility = (theme: Theme): ValidationResult & { issues: AccessibilityIssue[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const issues: AccessibilityIssue[] = [];

  const { colors } = theme;

  // Common color combinations to check
  const colorPairs = [
    { fg: colors.foreground, bg: colors.background, context: 'Main text on background' },
    { fg: colors.primaryForeground, bg: colors.primary, context: 'Primary button text' },
    { fg: colors.secondaryForeground, bg: colors.secondary, context: 'Secondary button text' },
    { fg: colors.foreground, bg: colors.backgroundSecondary, context: 'Text on secondary background' },
    { fg: colors.sidebarForeground, bg: colors.sidebarBackground, context: 'Sidebar text' },
    { fg: colors.tabForeground, bg: colors.tabBackground, context: 'Tab text' },
    { fg: colors.tabActiveForeground, bg: colors.tabActiveBackground, context: 'Active tab text' },
    { fg: colors.editorForeground, bg: colors.editorBackground, context: 'Editor text' },
    { fg: colors.inputForeground, bg: colors.inputBackground, context: 'Input text' },
    { fg: colors.buttonForeground, bg: colors.buttonBackground, context: 'Button text' },
  ];

  colorPairs.forEach(({ fg, bg, context }) => {
    if (fg && bg) {
      if (!meetsWCAGAA(fg, bg)) {
        const issue: AccessibilityIssue = {
          foreground: fg,
          background: bg,
          context,
          contrastRatio: 0, // Would calculate actual ratio
          recommendation: 'Increase contrast between foreground and background colors',
        };
        issues.push(issue);
        warnings.push(`Low contrast in ${context}: ${fg} on ${bg}`);
      }
    }
  });

  // Check for missing accessibility colors
  if (!colors.error) {
    warnings.push('Error color is missing - important for accessibility feedback');
  }

  if (!colors.success) {
    warnings.push('Success color is missing - important for accessibility feedback');
  }

  if (!colors.warning) {
    warnings.push('Warning color is missing - important for accessibility feedback');
  }

  if (!colors.info) {
    warnings.push('Info color is missing - important for accessibility feedback');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    issues,
  };
};

/**
 * Validate custom theme
 */
export const validateCustomTheme = (theme: CustomTheme): ValidationResult => {
  const structureValidation = validateThemeStructure(theme);
  const accessibilityValidation = validateAccessibility(theme as Theme);

  const errors = [...structureValidation.errors];
  const warnings = [...structureValidation.warnings, ...accessibilityValidation.warnings];

  // Custom theme specific validations
  if (!theme.id) {
    errors.push('Custom theme must have an ID');
  }

  if (theme.isBuiltIn === undefined) {
    errors.push('Custom theme must specify isBuiltIn property');
  }

  if (theme.isBuiltIn === true) {
    warnings.push('Custom theme should not be marked as built-in');
  }

  if (!theme.version) {
    warnings.push('Custom theme should have a version');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get theme completeness score (0-100)
 */
export const getThemeCompletenessScore = (theme: Partial<Theme>): number => {
  let score = 0;
  const maxScore = 100;

  // Required properties (60 points)
  if (theme.name) score += 10;
  if (theme.mode) score += 10;
  if (theme.colors) score += 25;
  if (theme.fonts) score += 15;

  // Optional but recommended properties (40 points)
  if (theme.spacing) score += 10;
  if (theme.borderRadius) score += 10;
  if (theme.transitions) score += 10;
  if (theme.zIndex) score += 10;

  return Math.min(score, maxScore);
};

/**
 * Generate theme improvement suggestions
 */
export const generateThemeRecommendations = (theme: Theme): string[] => {
  const recommendations: string[] = [];
  const validation = validateThemeStructure(theme);
  const accessibilityValidation = validateAccessibility(theme);

  // Add specific recommendations based on validation results
  if (validation.warnings.length > 0) {
    recommendations.push('Consider addressing the validation warnings to improve theme completeness');
  }

  if (accessibilityValidation.issues.length > 0) {
    recommendations.push('Improve color contrast for better accessibility compliance');
  }

  // Check if theme has semantic status colors
  const hasSemanticColors = theme.colors.error && theme.colors.success && theme.colors.warning && theme.colors.info;
  if (!hasSemanticColors) {
    recommendations.push('Add semantic status colors (error, success, warning, info) for better user feedback');
  }

  // Check for hover states
  const hasHoverStates = theme.colors.primaryHover || theme.colors.buttonHoverBackground;
  if (!hasHoverStates) {
    recommendations.push('Define hover state colors for better interactive feedback');
  }

  // Check for focus states
  const hasFocusStates = theme.colors.borderFocus || theme.colors.inputBorderFocus;
  if (!hasFocusStates) {
    recommendations.push('Define focus state colors for better keyboard navigation accessibility');
  }

  return recommendations;
};