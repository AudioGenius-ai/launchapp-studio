import React, { useState, useCallback } from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { CustomTheme, ThemeColors } from '@launchapp/types';
import { Button } from './Button';
import { Dialog } from './Dialog';

interface ThemeEditorProps {
  theme?: CustomTheme;
  onSave?: (theme: CustomTheme) => void;
  onCancel?: () => void;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm font-medium" style={{ color: 'var(--color-foregroundSecondary)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-2"
          style={{ borderColor: 'var(--color-border)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-xs rounded border"
          style={{
            backgroundColor: 'var(--color-inputBackground)',
            color: 'var(--color-inputForeground)',
            borderColor: 'var(--color-inputBorder)',
          }}
        />
      </div>
    </div>
  );
};

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ 
  theme: initialTheme, 
  onSave, 
  onCancel 
}) => {
  const { addCustomTheme, updateCustomTheme } = useTheme();
  const [themeName, setThemeName] = useState(initialTheme?.name || '');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(initialTheme?.mode || 'light');
  const [description, setDescription] = useState(initialTheme?.description || '');
  const [author, setAuthor] = useState(initialTheme?.author || '');
  
  // Initialize colors with defaults or from existing theme
  const [colors, setColors] = useState<Partial<ThemeColors>>(
    initialTheme?.colors || {
      background: '#ffffff',
      foreground: '#111827',
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      secondary: '#e5e7eb',
      secondaryForeground: '#111827',
      accent: '#f59e0b',
      accentForeground: '#ffffff',
      error: '#ef4444',
      errorForeground: '#ffffff',
      success: '#10b981',
      successForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
      info: '#3b82f6',
      infoForeground: '#ffffff',
      border: '#e5e7eb',
    }
  );

  const handleColorChange = useCallback((colorKey: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
  }, []);

  const handleSave = async () => {
    if (!themeName.trim()) {
      alert('Please enter a theme name');
      return;
    }

    const customTheme: CustomTheme = {
      id: initialTheme?.id || `custom-${Date.now()}`,
      name: themeName,
      mode: themeMode,
      description,
      author,
      version: '1.0.0',
      isBuiltIn: false,
      colors: colors as ThemeColors,
      fonts: initialTheme?.fonts || {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontFamilyMono: '"SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.625',
          loose: '2',
        },
      },
      spacing: initialTheme?.spacing || {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
        40: '10rem',
        48: '12rem',
        64: '16rem',
      },
      borderRadius: initialTheme?.borderRadius || {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      transitions: initialTheme?.transitions || {
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
      zIndex: initialTheme?.zIndex || {
        dropdown: 1000,
        modal: 1050,
        popover: 1100,
        tooltip: 1150,
        notification: 1200,
      },
    };

    if (initialTheme) {
      await updateCustomTheme(customTheme.id, customTheme);
    } else {
      await addCustomTheme(customTheme);
    }

    onSave?.(customTheme);
  };

  return (
    <div className="space-y-6">
      {/* Theme metadata */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            Theme Name
          </label>
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              backgroundColor: 'var(--color-inputBackground)',
              color: 'var(--color-inputForeground)',
              borderColor: 'var(--color-inputBorder)',
            }}
            placeholder="My Custom Theme"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              backgroundColor: 'var(--color-inputBackground)',
              color: 'var(--color-inputForeground)',
              borderColor: 'var(--color-inputBorder)',
            }}
            rows={3}
            placeholder="A beautiful theme for..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            Author
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              backgroundColor: 'var(--color-inputBackground)',
              color: 'var(--color-inputForeground)',
              borderColor: 'var(--color-inputBorder)',
            }}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            Theme Mode
          </label>
          <select
            value={themeMode}
            onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark')}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              backgroundColor: 'var(--color-inputBackground)',
              color: 'var(--color-inputForeground)',
              borderColor: 'var(--color-inputBorder)',
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      {/* Color customization */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
          Colors
        </h3>
        <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
          <ColorPicker 
            label="Background" 
            value={colors.background || '#ffffff'} 
            onChange={(v) => handleColorChange('background', v)} 
          />
          <ColorPicker 
            label="Foreground" 
            value={colors.foreground || '#111827'} 
            onChange={(v) => handleColorChange('foreground', v)} 
          />
          <ColorPicker 
            label="Primary" 
            value={colors.primary || '#3b82f6'} 
            onChange={(v) => handleColorChange('primary', v)} 
          />
          <ColorPicker 
            label="Primary Foreground" 
            value={colors.primaryForeground || '#ffffff'} 
            onChange={(v) => handleColorChange('primaryForeground', v)} 
          />
          <ColorPicker 
            label="Secondary" 
            value={colors.secondary || '#e5e7eb'} 
            onChange={(v) => handleColorChange('secondary', v)} 
          />
          <ColorPicker 
            label="Secondary Foreground" 
            value={colors.secondaryForeground || '#111827'} 
            onChange={(v) => handleColorChange('secondaryForeground', v)} 
          />
          <ColorPicker 
            label="Accent" 
            value={colors.accent || '#f59e0b'} 
            onChange={(v) => handleColorChange('accent', v)} 
          />
          <ColorPicker 
            label="Accent Foreground" 
            value={colors.accentForeground || '#ffffff'} 
            onChange={(v) => handleColorChange('accentForeground', v)} 
          />
          <ColorPicker 
            label="Error" 
            value={colors.error || '#ef4444'} 
            onChange={(v) => handleColorChange('error', v)} 
          />
          <ColorPicker 
            label="Success" 
            value={colors.success || '#10b981'} 
            onChange={(v) => handleColorChange('success', v)} 
          />
          <ColorPicker 
            label="Warning" 
            value={colors.warning || '#f59e0b'} 
            onChange={(v) => handleColorChange('warning', v)} 
          />
          <ColorPicker 
            label="Info" 
            value={colors.info || '#3b82f6'} 
            onChange={(v) => handleColorChange('info', v)} 
          />
          <ColorPicker 
            label="Border" 
            value={colors.border || '#e5e7eb'} 
            onChange={(v) => handleColorChange('border', v)} 
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {initialTheme ? 'Update Theme' : 'Create Theme'}
        </Button>
      </div>
    </div>
  );
};

// Theme Editor Dialog
interface ThemeEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: CustomTheme;
}

export const ThemeEditorDialog: React.FC<ThemeEditorDialogProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={theme ? 'Edit Theme' : 'Create Custom Theme'}
      className="max-w-2xl"
    >
      <ThemeEditor 
        theme={theme}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Dialog>
  );
};