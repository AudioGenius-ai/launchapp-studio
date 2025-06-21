import React from 'react';
import { ThemeSettingsSection } from '@launchapp/ui';

export const SettingsPage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <ThemeSettingsSection />
      </div>
    </div>
  );
};