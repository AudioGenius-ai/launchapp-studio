import React from 'react';
import { ThemeSettings as ThemeSettingsType } from '@code-pilot/types';

interface ThemeSettingsProps {
  settings: ThemeSettingsType;
  onChange: (settings: ThemeSettingsType) => void;
}

const colorThemes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'high-contrast', label: 'High Contrast' },
  { value: 'solarized-light', label: 'Solarized Light' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'dracula', label: 'Dracula' },
];

const iconThemes = [
  { value: 'material', label: 'Material Icons' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'seti', label: 'Seti' },
  { value: 'none', label: 'None' },
];

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ settings, onChange }) => {
  const handleChange = (key: keyof ThemeSettingsType, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Customize the appearance of the application.
        </p>
      </div>

      {/* Color Theme */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Color Theme
        </label>
        <select
          value={settings.colorTheme}
          onChange={(e) => handleChange('colorTheme', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
        >
          {colorThemes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      {/* Icon Theme */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Icon Theme
        </label>
        <select
          value={settings.iconTheme}
          onChange={(e) => handleChange('iconTheme', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
        >
          {iconThemes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      {/* UI Density */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          UI Density
        </label>
        <select
          value={settings.uiDensity}
          onChange={(e) => handleChange('uiDensity', e.target.value as 'comfortable' | 'compact' | 'spacious')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>

      {/* Layout */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Layout</h4>

        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Sidebar Position
          </label>
          <select
            value={settings.sidebarPosition}
            onChange={(e) => handleChange('sidebarPosition', e.target.value as 'left' | 'right')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Activity Bar Position
          </label>
          <select
            value={settings.activityBarPosition}
            onChange={(e) => handleChange('activityBarPosition', e.target.value as 'side' | 'top' | 'bottom' | 'hidden')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="side">Side</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Visibility</h4>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.statusBarVisible}
              onChange={(e) => handleChange('statusBarVisible', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Show Status Bar
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.menuBarVisible}
              onChange={(e) => handleChange('menuBarVisible', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Show Menu Bar
            </label>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Custom CSS
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Add custom CSS to further customize the appearance
        </p>
        <textarea
          value={settings.customCSS}
          onChange={(e) => handleChange('customCSS', e.target.value)}
          rows={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono dark:bg-gray-800 dark:text-white"
          placeholder="/* Your custom CSS here */"
        />
      </div>
    </div>
  );
};