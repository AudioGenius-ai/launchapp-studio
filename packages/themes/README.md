# @code-pilot/themes

Comprehensive theme system for Code Pilot Studio, providing design tokens, theme definitions, components, and utilities for consistent theming across the application.

## Features

- **Design Tokens**: Semantic color systems, typography scales, spacing systems
- **Theme Definitions**: Built-in light and dark themes with full type safety
- **Theme Components**: Ready-to-use React components for theme switching and editing
- **Utility Functions**: Color manipulation, CSS variable generation, theme validation
- **Accessibility**: WCAG-compliant color contrast validation and recommendations

## Installation

```bash
pnpm add @code-pilot/themes
```

## Usage

### Basic Setup

```tsx
import { ThemeProvider } from '@code-pilot/themes';

function App() {
  return (
    <ThemeProvider defaultMode="system" defaultTheme="Light">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme Components

```tsx
import { ThemeSwitcher, ThemeSelector } from '@code-pilot/themes';

function Settings() {
  return (
    <div>
      <ThemeSwitcher showLabel={true} />
      <ThemeSelector showCustomThemes={true} />
    </div>
  );
}
```

### Using Design Tokens

```tsx
import { semanticColors, spacingTokens, typographyTokens } from '@code-pilot/themes';

const MyComponent = () => (
  <div style={{
    backgroundColor: semanticColors.light.background.primary,
    padding: spacingTokens.space[4],
    fontSize: typographyTokens.fontSize.base,
  }}>
    Content
  </div>
);
```

### Theme Utilities

```tsx
import { 
  generateCSSVariables, 
  validateTheme, 
  lighten, 
  darken 
} from '@code-pilot/themes';

// Generate CSS variables from theme
const cssVars = generateCSSVariables(theme);

// Validate theme accessibility
const validation = validateTheme(customTheme);

// Color manipulation
const lighterColor = lighten('#3b82f6', 20);
const darkerColor = darken('#3b82f6', 20);
```

## Package Structure

```
src/
├── tokens/          # Design tokens
│   ├── colors.ts    # Semantic color system
│   ├── spacing.ts   # Spacing scale
│   └── typography.ts # Typography scale
├── themes/          # Theme definitions
│   ├── light.ts     # Light theme
│   └── dark.ts      # Dark theme
├── components/      # React components
│   ├── ThemeProvider.tsx
│   ├── ThemeSwitcher.tsx
│   └── ThemeEditor.tsx
└── utils/           # Utility functions
    ├── themeUtils.ts
    ├── colorUtils.ts
    ├── cssVariables.ts
    └── themeValidator.ts
```

## Contributing

This package is part of the Code Pilot Studio monorepo. See the main repository for contribution guidelines.