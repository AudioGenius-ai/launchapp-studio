import React from 'react';
import { GeneralSettings as GeneralSettingsType } from '@code-pilot/types';

interface GeneralSettingsProps {
  settings: GeneralSettingsType;
  onChange: (settings: GeneralSettingsType) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onChange }) => {
  const handleChange = (key: keyof GeneralSettingsType, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          General Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure general application behavior and preferences.
        </p>
      </div>

      {/* Auto Save */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Auto Save
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically save files after changes
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => handleChange('autoSave', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>

        {settings.autoSave && (
          <div className="ml-6">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Auto Save Delay (ms)
            </label>
            <input
              type="number"
              value={settings.autoSaveDelay}
              onChange={(e) => handleChange('autoSaveDelay', parseInt(e.target.value, 10))}
              min="100"
              max="10000"
              step="100"
              className="mt-1 block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Confirm on Exit */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Confirm on Exit
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Show confirmation dialog when closing the application
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.confirmOnExit}
          onChange={(e) => handleChange('confirmOnExit', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      {/* Language */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Language
        </label>
        <select
          value={settings.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {/* Updates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Check for Updates
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically check for application updates
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.checkForUpdates}
            onChange={(e) => handleChange('checkForUpdates', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>

        {settings.checkForUpdates && (
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Update Channel
            </label>
            <select
              value={settings.updateChannel}
              onChange={(e) => handleChange('updateChannel', e.target.value as 'stable' | 'beta' | 'nightly')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
              <option value="nightly">Nightly</option>
            </select>
          </div>
        )}
      </div>

      {/* Telemetry */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Telemetry
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send anonymous usage data to help improve the application
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.telemetry}
          onChange={(e) => handleChange('telemetry', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
    </div>
  );
};