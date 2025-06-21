import React, { useState } from 'react';
import { AISettings as AISettingsType, AIProviderConfig } from '@code-pilot/types';

interface AISettingsProps {
  settings: AISettingsType;
  onChange: (settings: AISettingsType) => void;
}

const providerDefaults: Record<string, Partial<AIProviderConfig>> = {
  openai: {
    endpoint: 'https://api.openai.com/v1',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1',
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
  },
  google: {
    endpoint: 'https://generativelanguage.googleapis.com/v1',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2048,
  },
  azure: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
  },
  local: {
    endpoint: 'http://localhost:11434',
    model: 'llama2',
    temperature: 0.7,
    maxTokens: 2048,
  },
};

export const AISettings: React.FC<AISettingsProps> = ({ settings, onChange }) => {
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderType, setNewProviderType] = useState<AIProviderConfig['provider']>('openai');

  const handleChange = (key: keyof AISettingsType, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleProviderChange = (providerName: string, config: AIProviderConfig) => {
    onChange({
      ...settings,
      providers: {
        ...settings.providers,
        [providerName]: config,
      },
    });
  };

  const handleAddProvider = () => {
    if (newProviderName && !settings.providers[newProviderName]) {
      const defaultConfig = providerDefaults[newProviderType];
      handleProviderChange(newProviderName, {
        provider: newProviderType,
        ...defaultConfig,
      } as AIProviderConfig);
      setNewProviderName('');
      setShowAddProvider(false);
    }
  };

  const handleRemoveProvider = (providerName: string) => {
    const { [providerName]: removed, ...remainingProviders } = settings.providers;
    onChange({
      ...settings,
      providers: remainingProviders,
      defaultProvider: settings.defaultProvider === providerName ? '' : settings.defaultProvider,
    });
  };

  const handleAutoCompleteChange = (key: keyof AISettingsType['autoComplete'], value: any) => {
    onChange({
      ...settings,
      autoComplete: {
        ...settings.autoComplete,
        [key]: value,
      },
    });
  };

  const handleCodeGenerationChange = (key: keyof AISettingsType['codeGeneration'], value: any) => {
    onChange({
      ...settings,
      codeGeneration: {
        ...settings.codeGeneration,
        [key]: value,
      },
    });
  };

  const handleChatAssistantChange = (key: keyof AISettingsType['chatAssistant'], value: any) => {
    onChange({
      ...settings,
      chatAssistant: {
        ...settings.chatAssistant,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Provider Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure AI providers and features for code assistance.
        </p>
      </div>

      {/* Enable AI */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Enable AI Features
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enable AI-powered code completion and assistance
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => handleChange('enabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      {settings.enabled && (
        <>
          {/* Default Provider */}
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Default Provider
            </label>
            <select
              value={settings.defaultProvider}
              onChange={(e) => handleChange('defaultProvider', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a provider</option>
              {Object.keys(settings.providers).map((providerName) => (
                <option key={providerName} value={providerName}>
                  {providerName}
                </option>
              ))}
            </select>
          </div>

          {/* Providers */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Providers</h4>
              <button
                onClick={() => setShowAddProvider(!showAddProvider)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Add Provider
              </button>
            </div>

            {showAddProvider && (
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Provider name"
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                />
                <select
                  value={newProviderType}
                  onChange={(e) => setNewProviderType(e.target.value as AIProviderConfig['provider'])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="local">Local (Ollama)</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddProvider}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddProvider(false)}
                    className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {Object.entries(settings.providers).map(([providerName, config]) => (
              <div key={providerName} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-gray-900 dark:text-white">{providerName}</h5>
                  <button
                    onClick={() => handleRemoveProvider(providerName)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">API Key</label>
                    <input
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => handleProviderChange(providerName, { ...config, apiKey: e.target.value })}
                      placeholder="Enter API key"
                      className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {config.provider !== 'azure' && (
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Endpoint</label>
                      <input
                        type="text"
                        value={config.endpoint || ''}
                        onChange={(e) => handleProviderChange(providerName, { ...config, endpoint: e.target.value })}
                        className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Model</label>
                    <input
                      type="text"
                      value={config.model || ''}
                      onChange={(e) => handleProviderChange(providerName, { ...config, model: e.target.value })}
                      className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Temperature</label>
                    <input
                      type="number"
                      value={config.temperature || 0.7}
                      onChange={(e) => handleProviderChange(providerName, { ...config, temperature: parseFloat(e.target.value) })}
                      min="0"
                      max="2"
                      step="0.1"
                      className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Auto Complete Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Auto Complete</h4>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoComplete.enabled}
                onChange={(e) => handleAutoCompleteChange('enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                Enable Auto Complete
              </label>
            </div>

            {settings.autoComplete.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Trigger Delay (ms)
                  </label>
                  <input
                    type="number"
                    value={settings.autoComplete.triggerDelay}
                    onChange={(e) => handleAutoCompleteChange('triggerDelay', parseInt(e.target.value, 10))}
                    min="0"
                    max="2000"
                    step="100"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Max Suggestions
                  </label>
                  <input
                    type="number"
                    value={settings.autoComplete.maxSuggestions}
                    onChange={(e) => handleAutoCompleteChange('maxSuggestions', parseInt(e.target.value, 10))}
                    min="1"
                    max="10"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Code Generation Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Code Generation</h4>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.codeGeneration.enabled}
                onChange={(e) => handleCodeGenerationChange('enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                Enable Code Generation
              </label>
            </div>

            {settings.codeGeneration.enabled && (
              <div className="space-y-3 ml-6">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Context Lines
                  </label>
                  <input
                    type="number"
                    value={settings.codeGeneration.contextLines}
                    onChange={(e) => handleCodeGenerationChange('contextLines', parseInt(e.target.value, 10))}
                    min="10"
                    max="200"
                    className="mt-1 block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.codeGeneration.includeImports}
                    onChange={(e) => handleCodeGenerationChange('includeImports', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    Include Imports
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Chat Assistant Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Chat Assistant</h4>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.chatAssistant.enabled}
                onChange={(e) => handleChatAssistantChange('enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                Enable Chat Assistant
              </label>
            </div>

            {settings.chatAssistant.enabled && (
              <div className="space-y-3 ml-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.chatAssistant.persistHistory}
                    onChange={(e) => handleChatAssistantChange('persistHistory', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                    Persist Chat History
                  </label>
                </div>

                {settings.chatAssistant.persistHistory && (
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Max History Size
                    </label>
                    <input
                      type="number"
                      value={settings.chatAssistant.maxHistorySize}
                      onChange={(e) => handleChatAssistantChange('maxHistorySize', parseInt(e.target.value, 10))}
                      min="10"
                      max="1000"
                      className="mt-1 block w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};