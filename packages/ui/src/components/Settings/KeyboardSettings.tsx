import React, { useState } from 'react';
import { KeyboardSettings as KeyboardSettingsType, KeyboardShortcut } from '@code-pilot/types';

interface KeyboardSettingsProps {
  settings: KeyboardSettingsType;
  onChange: (settings: KeyboardSettingsType) => void;
}

const defaultShortcuts: KeyboardShortcut[] = [
  { command: 'file.save', key: 'cmd+s', when: 'editorFocus' },
  { command: 'file.saveAll', key: 'cmd+shift+s' },
  { command: 'file.open', key: 'cmd+o' },
  { command: 'file.new', key: 'cmd+n' },
  { command: 'editor.undo', key: 'cmd+z', when: 'editorFocus' },
  { command: 'editor.redo', key: 'cmd+shift+z', when: 'editorFocus' },
  { command: 'editor.cut', key: 'cmd+x', when: 'editorTextFocus' },
  { command: 'editor.copy', key: 'cmd+c', when: 'editorTextFocus' },
  { command: 'editor.paste', key: 'cmd+v', when: 'editorTextFocus' },
  { command: 'editor.selectAll', key: 'cmd+a', when: 'editorFocus' },
  { command: 'editor.find', key: 'cmd+f', when: 'editorFocus' },
  { command: 'editor.replace', key: 'cmd+h', when: 'editorFocus' },
  { command: 'editor.toggleComment', key: 'cmd+/', when: 'editorTextFocus' },
  { command: 'workbench.action.quickOpen', key: 'cmd+p' },
  { command: 'workbench.action.showCommands', key: 'cmd+shift+p' },
  { command: 'workbench.action.closeActiveEditor', key: 'cmd+w' },
  { command: 'workbench.action.closeAllEditors', key: 'cmd+shift+w' },
  { command: 'workbench.action.toggleSidebar', key: 'cmd+b' },
  { command: 'workbench.action.terminal.new', key: 'ctrl+`' },
];

export const KeyboardSettings: React.FC<KeyboardSettingsProps> = ({ settings, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordingKey, setRecordingKey] = useState<string | null>(null);

  const shortcuts = settings.shortcuts.length > 0 ? settings.shortcuts : defaultShortcuts;

  const handleKeyBindingModeChange = (mode: 'default' | 'vim' | 'emacs') => {
    onChange({
      ...settings,
      keyBindingMode: mode,
    });
  };

  const handleShortcutChange = (command: string, newKey: string) => {
    const updatedShortcuts = shortcuts.map((shortcut) =>
      shortcut.command === command ? { ...shortcut, key: newKey } : shortcut
    );
    
    onChange({
      ...settings,
      shortcuts: updatedShortcuts,
    });
    
    setEditingShortcut(null);
  };

  const handleKeyRecord = (command: string) => {
    setRecordingKey(command);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      const keys: string[] = [];
      if (e.metaKey) keys.push('cmd');
      if (e.ctrlKey && !e.metaKey) keys.push('ctrl');
      if (e.altKey) keys.push('alt');
      if (e.shiftKey) keys.push('shift');
      
      if (e.key && !['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
        keys.push(e.key.toLowerCase());
      }
      
      if (keys.length > 0) {
        const keyCombo = keys.join('+');
        handleShortcutChange(command, keyCombo);
        setRecordingKey(null);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up after 5 seconds if no key is pressed
    setTimeout(() => {
      if (recordingKey === command) {
        setRecordingKey(null);
        document.removeEventListener('keydown', handleKeyDown);
      }
    }, 5000);
  };

  const resetShortcut = (command: string) => {
    const defaultShortcut = defaultShortcuts.find(s => s.command === command);
    if (defaultShortcut) {
      handleShortcutChange(command, defaultShortcut.key);
    }
  };

  const resetAllShortcuts = () => {
    if (window.confirm('Are you sure you want to reset all keyboard shortcuts to defaults?')) {
      onChange({
        ...settings,
        shortcuts: defaultShortcuts,
      });
    }
  };

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Keyboard Shortcuts
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Customize keyboard shortcuts and key binding modes.
        </p>
      </div>

      {/* Key Binding Mode */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          Key Binding Mode
        </label>
        <select
          value={settings.keyBindingMode}
          onChange={(e) => handleKeyBindingModeChange(e.target.value as 'default' | 'vim' | 'emacs')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
        >
          <option value="default">Default</option>
          <option value="vim">Vim</option>
          <option value="emacs">Emacs</option>
        </select>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Shortcuts List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Shortcuts</h4>
          <button
            onClick={resetAllShortcuts}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Reset All
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Command
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Keybinding
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  When
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredShortcuts.map((shortcut) => (
                <tr key={shortcut.command} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {shortcut.command}
                  </td>
                  <td className="px-4 py-2">
                    {editingShortcut === shortcut.command ? (
                      <input
                        type="text"
                        value={shortcut.key}
                        onChange={(e) => handleShortcutChange(shortcut.command, e.target.value)}
                        onBlur={() => setEditingShortcut(null)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-white"
                        autoFocus
                      />
                    ) : recordingKey === shortcut.command ? (
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        Press keys...
                      </span>
                    ) : (
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                        {shortcut.key}
                      </kbd>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.when || '-'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleKeyRecord(shortcut.command)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      Record
                    </button>
                    <button
                      onClick={() => resetShortcut(shortcut.command)}
                      className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};