import { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  AIProvider,
  AIProviderConfig,
  AICapabilities,
  AIFeature
} from '@code-pilot/types';
import { useAIStore } from '../stores/aiStore';

/**
 * Hook for managing AI providers
 */
export const useAIProviders = () => {
  const {
    providers,
    activeProviderId,
    addProvider,
    updateProvider,
    removeProvider,
    setActiveProvider,
    getActiveProvider
  } = useAIStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load from Tauri backend
      const providersData = await invoke<AIProvider[]>('plugin:ai|list_providers');
      
      // Add to store
      providersData.forEach(provider => {
        addProvider(provider);
      });
      
      // Set active provider if none selected
      if (!activeProviderId && providersData.length > 0) {
        setActiveProvider(providersData[0].id);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
      setError('Failed to load AI providers');
      
      // Add default Claude provider as fallback
      const claudeProvider: AIProvider = {
        id: 'claude-default',
        name: 'Claude (CLI)',
        type: 'claude',
        capabilities: {
          streaming: true,
          tools: true,
          multiModal: true,
          maxTokens: 200000,
          models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
          features: [
            AIFeature.CodeGeneration,
            AIFeature.CodeCompletion,
            AIFeature.CodeExplanation,
            AIFeature.Refactoring,
            AIFeature.Testing,
            AIFeature.Documentation,
            AIFeature.ChatAssistant,
            AIFeature.VisionAnalysis,
            AIFeature.FileAnalysis
          ]
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      addProvider(claudeProvider);
      setActiveProvider(claudeProvider.id);
    } finally {
      setIsLoading(false);
    }
  };

  const configureProvider = useCallback(async (
    providerId: string,
    config: AIProviderConfig
  ) => {
    try {
      // Update in backend
      await invoke('plugin:ai|configure_provider', {
        providerId,
        config
      });
      
      // Update in store
      updateProvider(providerId, { config });
      
      return true;
    } catch (err) {
      console.error('Failed to configure provider:', err);
      setError(`Failed to configure provider: ${err}`);
      return false;
    }
  }, [updateProvider]);

  const testProvider = useCallback(async (providerId: string) => {
    try {
      const result = await invoke<{ success: boolean; message?: string }>(
        'plugin:ai|test_provider',
        { providerId }
      );
      
      return result;
    } catch (err) {
      console.error('Failed to test provider:', err);
      return { success: false, message: String(err) };
    }
  }, []);

  const activateProvider = useCallback(async (providerId: string) => {
    try {
      // Deactivate current provider
      const currentProvider = getActiveProvider();
      if (currentProvider) {
        updateProvider(currentProvider.id, { isActive: false });
      }
      
      // Activate new provider
      updateProvider(providerId, { isActive: true });
      setActiveProvider(providerId);
      
      // Notify backend
      await invoke('plugin:ai|set_active_provider', { providerId });
      
      return true;
    } catch (err) {
      console.error('Failed to activate provider:', err);
      setError(`Failed to activate provider: ${err}`);
      return false;
    }
  }, [getActiveProvider, updateProvider, setActiveProvider]);

  const deleteProvider = useCallback(async (providerId: string) => {
    try {
      // Cannot delete active provider
      if (activeProviderId === providerId) {
        setError('Cannot delete active provider');
        return false;
      }
      
      // Delete from backend
      await invoke('plugin:ai|delete_provider', { providerId });
      
      // Remove from store
      removeProvider(providerId);
      
      return true;
    } catch (err) {
      console.error('Failed to delete provider:', err);
      setError(`Failed to delete provider: ${err}`);
      return false;
    }
  }, [activeProviderId, removeProvider]);

  const createCustomProvider = useCallback(async (
    name: string,
    config: AIProviderConfig,
    capabilities: Partial<AICapabilities>
  ) => {
    try {
      const provider: Partial<AIProvider> = {
        name,
        type: 'custom',
        config,
        capabilities: {
          streaming: false,
          tools: false,
          multiModal: false,
          maxTokens: 4096,
          models: [],
          features: [AIFeature.ChatAssistant],
          ...capabilities
        }
      };
      
      // Create in backend
      const createdProvider = await invoke<AIProvider>(
        'plugin:ai|create_provider',
        { provider }
      );
      
      // Add to store
      addProvider(createdProvider);
      
      return createdProvider;
    } catch (err) {
      console.error('Failed to create provider:', err);
      setError(`Failed to create provider: ${err}`);
      throw err;
    }
  }, [addProvider]);

  return {
    providers: Array.from(providers.values()),
    activeProvider: getActiveProvider(),
    activeProviderId,
    isLoading,
    error,
    configureProvider,
    testProvider,
    activateProvider,
    deleteProvider,
    createCustomProvider,
    reloadProviders: loadProviders
  };
};