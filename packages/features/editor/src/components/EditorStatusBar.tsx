import React from 'react';
import { 
  EditorFile, 
  EditorPosition,
  SUPPORTED_LANGUAGES 
} from '@code-pilot/types';
import { cn } from '@code-pilot/ui';

interface EditorStatusBarProps {
  file: EditorFile;
  position: EditorPosition | null;
  encoding: string;
  lineEnding: 'LF' | 'CRLF';
  language?: string;
  onLanguageChange?: (language: string) => void;
  className?: string;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  file,
  position,
  encoding,
  lineEnding,
  language,
  onLanguageChange,
  className
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);

  const getLanguageName = (languageId?: string) => {
    if (!languageId) return 'Plain Text';
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === languageId);
    return lang?.aliases[0] || languageId;
  };

  const handleLanguageClick = () => {
    if (onLanguageChange) {
      setShowLanguageMenu(!showLanguageMenu);
    }
  };

  const handleLanguageSelect = (languageId: string) => {
    onLanguageChange?.(languageId);
    setShowLanguageMenu(false);
  };

  return (
    <div className={cn(
      'flex items-center justify-between h-6 px-3 bg-gray-800 border-t border-gray-700 text-xs text-gray-400',
      className
    )}>
      <div className="flex items-center space-x-4">
        <span className="truncate max-w-xs" title={file.path}>
          {file.path}
        </span>
        {file.isDirty && <span className="text-yellow-500">Modified</span>}
      </div>

      <div className="flex items-center space-x-4">
        {position && (
          <span>
            Ln {position.lineNumber}, Col {position.column}
          </span>
        )}
        
        <span>{encoding}</span>
        
        <span>{lineEnding}</span>
        
        <div className="relative">
          <button
            className="hover:text-white transition-colors"
            onClick={handleLanguageClick}
          >
            {getLanguageName(language)}
          </button>
          
          {showLanguageMenu && (
            <div className="absolute bottom-full right-0 mb-1 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  className={cn(
                    'block w-full text-left px-3 py-1.5 hover:bg-gray-800 whitespace-nowrap',
                    language === lang.id && 'bg-gray-800 text-white'
                  )}
                  onClick={() => handleLanguageSelect(lang.id)}
                >
                  {lang.aliases[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorStatusBar;