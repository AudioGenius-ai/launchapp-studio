import React, { useState, useEffect } from 'react';
import { Settings, SettingsUpdateEvent } from '@code-pilot/types';
import { getSettingsService } from '@code-pilot/core';
import { Tabs } from '../Tabs';
import { GeneralSettings } from './GeneralSettings';
import { EditorSettings } from './EditorSettings';
import { ThemeSettings } from './ThemeSettings';
import { KeyboardSettings } from './KeyboardSettings';
import { AISettings } from './AISettings';
import { cn } from '../../utils/cn';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const settingsService = getSettingsService();

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await settingsService.loadSettings();
      setSettings(loadedSettings);
    };

    loadSettings();

    // Subscribe to settings changes
    const unsubscribe = settingsService.subscribeToChanges((event: SettingsUpdateEvent) => {
      setSettings(settingsService.getSettings());
    });

    return unsubscribe;
  }, []);

  const handleSettingChange = async (category: keyof Settings, value: any) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [category]: value,
    };

    setSettings(newSettings);
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      await settingsService.saveSettings(settings);
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all settings to defaults?'
    );

    if (confirmReset) {
      await settingsService.resetSettings();
      const defaultSettings = await settingsService.loadSettings();
      setSettings(defaultSettings);
      setUnsavedChanges(false);
    }
  };

  const handleExport = async () => {
    try {
      const settingsJson = await settingsService.exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'code-pilot-settings.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await settingsService.importSettings(text);
        const importedSettings = await settingsService.loadSettings();
        setSettings(importedSettings);
        setUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please ensure the file is valid.');
      }
    };

    input.click();
  };

  if (!isOpen || !settings) return null;

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'editor', label: 'Editor' },
    { key: 'theme', label: 'Theme' },
    { key: 'keyboard', label: 'Keyboard' },
    { key: 'ai', label: 'AI Providers' },
  ];

  return (
    <div className={cn('fixed inset-0 z-50 bg-black/50', className)}>
      <div className="fixed inset-x-4 inset-y-16 bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <GeneralSettings
                settings={settings.general}
                onChange={(value) => handleSettingChange('general', value)}
              />
            )}
            {activeTab === 'editor' && (
              <EditorSettings
                settings={settings.editor}
                onChange={(value) => handleSettingChange('editor', value)}
              />
            )}
            {activeTab === 'theme' && (
              <ThemeSettings
                settings={settings.theme}
                onChange={(value) => handleSettingChange('theme', value)}
              />
            )}
            {activeTab === 'keyboard' && (
              <KeyboardSettings
                settings={settings.keyboard}
                onChange={(value) => handleSettingChange('keyboard', value)}
              />
            )}
            {activeTab === 'ai' && (
              <AISettings
                settings={settings.ai}
                onChange={(value) => handleSettingChange('ai', value)}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              Export
            </button>
            <button
              onClick={handleImport}
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              Import
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              Reset All
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {unsavedChanges && (
              <span className="text-sm text-amber-600 dark:text-amber-400">Unsaved changes</span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!unsavedChanges}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md',
                unsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              )}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};