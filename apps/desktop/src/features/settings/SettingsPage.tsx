import React, { useState } from 'react';
import { SettingsPanel } from '@code-pilot/ui';

export const SettingsPage: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Code Pilot Studio Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Configure your development environment
        </p>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Settings
        </button>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};