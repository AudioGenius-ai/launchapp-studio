/**
 * Color manipulation and utility functions
 */

export interface ColorHSL {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

export interface ColorRGB {
  r: number; // Red (0-255)
  g: number; // Green (0-255)
  b: number; // Blue (0-255)
}

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): ColorRGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert RGB to HSL
 */
export const rgbToHsl = (r: number, g: number, b: number): ColorHSL => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

/**
 * Convert HSL to RGB
 */
export const hslToRgb = (h: number, s: number, l: number): ColorRGB => {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * Convert hex to HSL
 */
export const hexToHsl = (hex: string): ColorHSL | null => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
};

/**
 * Convert HSL to hex
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

/**
 * Lighten a color by percentage
 */
export const lighten = (color: string, percentage: number): string => {
  const hsl = hexToHsl(color);
  if (!hsl) return color;
  
  const newLightness = Math.min(100, hsl.l + percentage);
  return hslToHex(hsl.h, hsl.s, newLightness);
};

/**
 * Darken a color by percentage
 */
export const darken = (color: string, percentage: number): string => {
  const hsl = hexToHsl(color);
  if (!hsl) return color;
  
  const newLightness = Math.max(0, hsl.l - percentage);
  return hslToHex(hsl.h, hsl.s, newLightness);
};

/**
 * Adjust color saturation
 */
export const saturate = (color: string, percentage: number): string => {
  const hsl = hexToHsl(color);
  if (!hsl) return color;
  
  const newSaturation = Math.min(100, Math.max(0, hsl.s + percentage));
  return hslToHex(hsl.h, newSaturation, hsl.l);
};

/**
 * Desaturate a color
 */
export const desaturate = (color: string, percentage: number): string => {
  return saturate(color, -percentage);
};

/**
 * Add opacity to a color
 */
export const withOpacity = (color: string, opacity: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Calculate relative luminance of a color
 * Used for contrast ratio calculations
 */
export const getRelativeLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const srgb = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if color combination meets WCAG AA accessibility standards
 */
export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5; // AA standard for normal text
};

/**
 * Check if color combination meets WCAG AAA accessibility standards
 */
export const meetsWCAGAAA = (foreground: string, background: string): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 7; // AAA standard for normal text
};

/**
 * Get appropriate text color (black or white) for a background
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  const whiteContrast = getContrastRatio('#ffffff', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
};

/**
 * Generate color palette from a base color
 */
export const generateColorPalette = (baseColor: string) => {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return {};
  
  return {
    50: hslToHex(hsl.h, hsl.s, 95),
    100: hslToHex(hsl.h, hsl.s, 90),
    200: hslToHex(hsl.h, hsl.s, 80),
    300: hslToHex(hsl.h, hsl.s, 70),
    400: hslToHex(hsl.h, hsl.s, 60),
    500: baseColor, // Original color
    600: hslToHex(hsl.h, hsl.s, 40),
    700: hslToHex(hsl.h, hsl.s, 30),
    800: hslToHex(hsl.h, hsl.s, 20),
    900: hslToHex(hsl.h, hsl.s, 10),
  };
};

/**
 * Mix two colors together
 */
export const mixColors = (color1: string, color2: string, weight: number = 0.5): string => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const w1 = weight;
  const w2 = 1 - weight;
  
  const mixed = {
    r: Math.round(rgb1.r * w1 + rgb2.r * w2),
    g: Math.round(rgb1.g * w1 + rgb2.g * w2),
    b: Math.round(rgb1.b * w1 + rgb2.b * w2),
  };
  
  return rgbToHex(mixed.r, mixed.g, mixed.b);
};

/**
 * Get complementary color
 */
export const getComplementaryColor = (color: string): string => {
  const hsl = hexToHsl(color);
  if (!hsl) return color;
  
  const complementaryHue = (hsl.h + 180) % 360;
  return hslToHex(complementaryHue, hsl.s, hsl.l);
};

/**
 * Get triadic colors
 */
export const getTriadicColors = (color: string): string[] => {
  const hsl = hexToHsl(color);
  if (!hsl) return [color];
  
  return [
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
};

/**
 * Get analogous colors
 */
export const getAnalogousColors = (color: string): string[] => {
  const hsl = hexToHsl(color);
  if (!hsl) return [color];
  
  return [
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
  ];
};

/**
 * Validate if string is a valid color
 */
export const isValidColor = (color: string): boolean => {
  // Check hex format
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // Check rgb/rgba format
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  // Check hsl/hsla format
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  return false;
};