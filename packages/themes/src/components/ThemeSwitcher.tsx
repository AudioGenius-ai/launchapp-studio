import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { ThemeMode } from '@code-pilot/types';

interface ThemeSwitcherProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  showLabel = true,
  className = ''
}) => {
  const { mode, setMode } = useTheme();

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const getModeIcon = (currentMode: ThemeMode) => {
    switch (currentMode) {
      case 'light':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium" style={{ color: 'var(--color-foregroundSecondary)' }}>
          Theme:
        </span>
      )}
      <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--color-backgroundTertiary)' }}>
        {(['light', 'dark', 'system'] as ThemeMode[]).map((themeMode) => (
          <button
            key={themeMode}
            onClick={() => handleModeChange(themeMode)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200 capitalize
              ${mode === themeMode 
                ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm' 
                : 'text-[var(--color-foregroundTertiary)] hover:text-[var(--color-foregroundSecondary)]'
              }
            `}
            aria-label={`Switch to ${themeMode} theme`}
          >
            {getModeIcon(themeMode)}
            {showLabel && themeMode}
          </button>
        ))}
      </div>
    </div>
  );
};

// Compact theme switcher for toolbars
export const CompactThemeSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mode, setMode, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentIcon = isDark ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
      />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
      />
    </svg>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-[var(--color-backgroundSecondary)] transition-colors"
        aria-label="Theme switcher"
      >
        {currentIcon}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20"
            style={{ 
              backgroundColor: 'var(--color-backgroundElevated)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="py-1">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((themeMode) => (
                <button
                  key={themeMode}
                  onClick={() => {
                    setMode(themeMode);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-2 text-sm capitalize
                    hover:bg-[var(--color-backgroundSecondary)] transition-colors
                    ${mode === themeMode ? 'font-medium text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'}
                  `}
                >
                  {themeMode} Theme
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Advanced theme selector with preview
interface ThemeSelectorProps {
  showCustomThemes?: boolean;
  onThemeSelect?: (themeName: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  showCustomThemes = true,
  onThemeSelect
}) => {
  const { 
    theme, 
    setTheme, 
    availableThemes, 
    customThemes
  } = useTheme();

  const handleThemeSelect = (themeName: string) => {
    setTheme(themeName);
    onThemeSelect?.(themeName);
  };

  const renderThemePreview = (themeName: string, isCustom: boolean = false) => {
    const isActive = theme.name === themeName;
    
    return (
      <button
        key={themeName}
        onClick={() => handleThemeSelect(themeName)}
        className={`
          relative p-4 rounded-lg border-2 transition-all
          ${isActive 
            ? 'border-[var(--color-primary)] shadow-md' 
            : 'border-[var(--color-border)] hover:border-[var(--color-borderHover)]'
          }
        `}
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm" style={{ color: 'var(--color-foreground)' }}>
            {themeName}
          </h4>
          {isCustom && (
            <span className="text-xs px-2 py-1 rounded" 
              style={{ 
                backgroundColor: 'var(--color-accent)', 
                color: 'var(--color-accentForeground)' 
              }}
            >
              Custom
            </span>
          )}
        </div>
        
        {/* Theme preview */}
        <div className="grid grid-cols-4 gap-1 h-8">
          <div className="rounded" style={{ backgroundColor: 'var(--color-primary)' }} />
          <div className="rounded" style={{ backgroundColor: 'var(--color-secondary)' }} />
          <div className="rounded" style={{ backgroundColor: 'var(--color-accent)' }} />
          <div className="rounded" style={{ backgroundColor: 'var(--color-background)' }} />
        </div>
        
        {isActive && (
          <div className="absolute top-2 right-2">
            <svg className="w-5 h-5" fill="var(--color-primary)" viewBox="0 0 20 20">
              <path fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Built-in themes */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
          Built-in Themes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableThemes
            .filter(name => !customThemes.find(t => t.name === name))
            .map(themeName => renderThemePreview(themeName))}
        </div>
      </div>

      {/* Custom themes */}
      {showCustomThemes && customThemes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
            Custom Themes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {customThemes.map(customTheme => renderThemePreview(customTheme.name, true))}
          </div>
        </div>
      )}
    </div>
  );
};