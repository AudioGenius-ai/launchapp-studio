import React from 'react';
import { EditorSettings as EditorSettingsType } from '@code-pilot/types';

interface EditorSettingsProps {
  settings: EditorSettingsType;
  onChange: (settings: EditorSettingsType) => void;
}

export const EditorSettings: React.FC<EditorSettingsProps> = ({ settings, onChange }) => {
  const handleChange = (key: keyof EditorSettingsType, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleMinimapChange = (key: keyof EditorSettingsType['minimap'], value: any) => {
    onChange({
      ...settings,
      minimap: {
        ...settings.minimap,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editor Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Customize the code editor appearance and behavior.
        </p>
      </div>

      {/* Font Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Font</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Font Family
            </label>
            <input
              type="text"
              value={settings.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Font Size
            </label>
            <input
              type="number"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))}
              min="8"
              max="32"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Line Height
          </label>
          <input
            type="number"
            value={settings.lineHeight}
            onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
            min="1"
            max="3"
            step="0.1"
            className="mt-1 block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Tab Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Tabs</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Tab Size
            </label>
            <input
              type="number"
              value={settings.tabSize}
              onChange={(e) => handleChange('tabSize', parseInt(e.target.value, 10))}
              min="2"
              max="8"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.insertSpaces}
              onChange={(e) => handleChange('insertSpaces', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Insert Spaces
            </label>
          </div>
        </div>
      </div>

      {/* Word Wrap */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Word Wrap</h4>
        
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Word Wrap Mode
          </label>
          <select
            value={settings.wordWrap}
            onChange={(e) => handleChange('wordWrap', e.target.value as any)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="wordWrapColumn">At Column</option>
            <option value="bounded">Bounded</option>
          </select>
        </div>

        {(settings.wordWrap === 'wordWrapColumn' || settings.wordWrap === 'bounded') && (
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Word Wrap Column
            </label>
            <input
              type="number"
              value={settings.wordWrapColumn}
              onChange={(e) => handleChange('wordWrapColumn', parseInt(e.target.value, 10))}
              min="40"
              max="300"
              className="mt-1 block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Display Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Display</h4>
        
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Line Numbers
          </label>
          <select
            value={settings.lineNumbers}
            onChange={(e) => handleChange('lineNumbers', e.target.value as any)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="relative">Relative</option>
            <option value="interval">Interval</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Render Whitespace
          </label>
          <select
            value={settings.renderWhitespace}
            onChange={(e) => handleChange('renderWhitespace', e.target.value as any)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="none">None</option>
            <option value="boundary">Boundary</option>
            <option value="selection">Selection</option>
            <option value="trailing">Trailing</option>
            <option value="all">All</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Render Line Highlight
          </label>
          <select
            value={settings.renderLineHighlight}
            onChange={(e) => handleChange('renderLineHighlight', e.target.value as any)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="none">None</option>
            <option value="gutter">Gutter</option>
            <option value="line">Line</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Minimap Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Minimap</h4>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.minimap.enabled}
            onChange={(e) => handleMinimapChange('enabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
            Show Minimap
          </label>
        </div>

        {settings.minimap.enabled && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Show Slider
              </label>
              <select
                value={settings.minimap.showSlider}
                onChange={(e) => handleMinimapChange('showSlider', e.target.value as any)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
              >
                <option value="always">Always</option>
                <option value="mouseover">Mouse Over</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.minimap.renderCharacters}
                onChange={(e) => handleMinimapChange('renderCharacters', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                Render Characters
              </label>
            </div>
          </>
        )}
      </div>

      {/* Formatting */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Formatting</h4>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.formatOnSave}
              onChange={(e) => handleChange('formatOnSave', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Format on Save
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.formatOnPaste}
              onChange={(e) => handleChange('formatOnPaste', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Format on Paste
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.formatOnType}
              onChange={(e) => handleChange('formatOnType', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Format on Type
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};