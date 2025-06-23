import React from 'react';
import { ThemeSwitcher, ThemeSelector } from '@code-pilot/themes';

export const SettingsPage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
              Appearance
            </h1>
            <p className="text-base" style={{ color: 'var(--color-foregroundSecondary)' }}>
              Customize the look and feel of Code Pilot Studio with themes
            </p>
          </div>
          
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
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
                Themes
              </h2>
              <ThemeSelector showCustomThemes={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};