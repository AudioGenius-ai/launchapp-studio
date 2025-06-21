import React, { useState } from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { CustomTheme } from '@code-pilot/types';
import { ThemeService } from '@code-pilot/core';
import { Button } from './Button';
import { ThemeSwitcher, ThemeSelector } from './ThemeSwitcher';
import { ThemeEditorDialog } from './ThemeEditor';

export const ThemeManager: React.FC = () => {
  const { 
    theme, 
    customThemes, 
    removeCustomTheme,
    resetToDefaults 
  } = useTheme();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | undefined>();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const themeService = ThemeService.getInstance();

  const handleCreateTheme = () => {
    setEditingTheme(undefined);
    setIsEditorOpen(true);
  };

  const handleEditTheme = (theme: CustomTheme) => {
    setEditingTheme(theme);
    setIsEditorOpen(true);
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      await removeCustomTheme(themeId);
    }
  };

  const handleExportTheme = (themeName: string) => {
    const themeJson = themeService.exportTheme(themeName);
    if (themeJson) {
      const blob = new Blob([themeJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${themeName.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await themeService.importTheme(text);
      setImportError(null);
      setShowImportDialog(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import theme');
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all theme settings to defaults? This will remove all custom themes.')) {
      resetToDefaults();
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Mode Switcher */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
          Theme Mode
        </h2>
        <ThemeSwitcher showLabel={true} />
      </div>

      {/* Theme Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
            Themes
          </h2>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = handleImportTheme as any;
                input.click();
              }}
            >
              Import Theme
            </Button>
            <Button
              size="sm"
              onClick={handleCreateTheme}
            >
              Create Theme
            </Button>
          </div>
        </div>
        
        <ThemeSelector showCustomThemes={true} />
      </div>

      {/* Custom Theme Management */}
      {customThemes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
            Manage Custom Themes
          </h2>
          <div className="space-y-2">
            {customThemes.map(customTheme => (
              <div
                key={customTheme.id}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-backgroundSecondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--color-foreground)' }}>
                    {customTheme.name}
                  </h4>
                  {customTheme.description && (
                    <p className="text-sm mt-1" style={{ color: 'var(--color-foregroundSecondary)' }}>
                      {customTheme.description}
                    </p>
                  )}
                  {customTheme.author && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-foregroundTertiary)' }}>
                      by {customTheme.author}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportTheme(customTheme.name)}
                  >
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTheme(customTheme)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTheme(customTheme.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset to Defaults */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <Button
          variant="destructive"
          onClick={handleResetToDefaults}
        >
          Reset All Theme Settings
        </Button>
      </div>

      {/* Theme Editor Dialog */}
      <ThemeEditorDialog
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTheme(undefined);
        }}
        theme={editingTheme}
      />

      {/* Import Error */}
      {importError && (
        <div
          className="p-4 rounded-md"
          style={{
            backgroundColor: 'var(--color-errorBackground)',
            color: 'var(--color-error)',
          }}
        >
          <p className="font-medium">Import Error</p>
          <p className="text-sm mt-1">{importError}</p>
        </div>
      )}
    </div>
  );
};

// Settings page section for themes
export const ThemeSettingsSection: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
          Appearance
        </h1>
        <p className="text-base" style={{ color: 'var(--color-foregroundSecondary)' }}>
          Customize the look and feel of Code Pilot Studio with themes
        </p>
      </div>
      
      <ThemeManager />
    </div>
  );
};