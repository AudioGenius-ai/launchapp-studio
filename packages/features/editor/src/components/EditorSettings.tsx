import React from 'react';
import { EditorConfiguration } from "../types";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

interface EditorSettingsProps {
  config: EditorConfiguration;
  onConfigChange: (config: Partial<EditorConfiguration>) => void;
  onClose: () => void;
  className?: string;
}

export const EditorSettings: React.FC<EditorSettingsProps> = ({
  config,
  onConfigChange,
  onClose,
  className
}) => {
  const handleThemeChange = (theme: EditorConfiguration['theme']) => {
    onConfigChange({ theme });
  };

  const handleFontSizeChange = (fontSize: number) => {
    onConfigChange({ fontSize });
  };

  const handleTabSizeChange = (tabSize: number) => {
    onConfigChange({ tabSize });
  };

  const handleWordWrapChange = (wordWrap: EditorConfiguration['wordWrap']) => {
    onConfigChange({ wordWrap });
  };

  const handleLineNumbersChange = (lineNumbers: EditorConfiguration['lineNumbers']) => {
    onConfigChange({ lineNumbers });
  };

  const handleMinimapChange = (enabled: boolean) => {
    onConfigChange({ 
      minimap: { ...config.minimap, enabled } 
    });
  };

  const handleFormatOnSaveChange = (formatOnSave: boolean) => {
    onConfigChange({ formatOnSave });
  };

  return (
    <div className={cn(
      'bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-96',
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Editor Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={config.theme}
            onChange={(e) => handleThemeChange(e.target.value as EditorConfiguration['theme'])}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast Dark</option>
            <option value="hc-light">High Contrast Light</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Font Size
          </label>
          <input
            type="number"
            min="8"
            max="32"
            value={config.fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Tab Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tab Size
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={config.tabSize}
            onChange={(e) => handleTabSizeChange(parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Word Wrap */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Word Wrap
          </label>
          <select
            value={config.wordWrap}
            onChange={(e) => handleWordWrapChange(e.target.value as EditorConfiguration['wordWrap'])}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="wordWrapColumn">Word Wrap Column</option>
            <option value="bounded">Bounded</option>
          </select>
        </div>

        {/* Line Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Line Numbers
          </label>
          <select
            value={config.lineNumbers}
            onChange={(e) => handleLineNumbersChange(e.target.value as EditorConfiguration['lineNumbers'])}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="relative">Relative</option>
            <option value="interval">Interval</option>
          </select>
        </div>

        {/* Minimap */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            <input
              type="checkbox"
              checked={config.minimap.enabled}
              onChange={(e) => handleMinimapChange(e.target.checked)}
              className="mr-2 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
            />
            Show Minimap
          </label>
        </div>

        {/* Format on Save */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300">
            <input
              type="checkbox"
              checked={config.formatOnSave}
              onChange={(e) => handleFormatOnSaveChange(e.target.checked)}
              className="mr-2 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
            />
            Format on Save
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default EditorSettings;