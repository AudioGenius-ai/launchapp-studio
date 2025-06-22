import { useState, useEffect, useCallback } from 'react';
import {
  ClaudeService,
  AIManagerService,
  AIProviderRegistry
} from '@code-pilot/core';
import {
  AIProvider,
  AIProviderType,
  AIProviderStatus,
  AIEvent
} from '@code-pilot/types';

export interface UseClaudeServiceResult {
  service: ClaudeService | null;
  isConnected: boolean;
  isInitializing: boolean;
  error: string | null;
  reconnect: () => Promise<void>;
}

export const useClaudeService = (): UseClaudeServiceResult => {
  const [service, setService] = useState<ClaudeService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeService = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      // Get or create the AI manager
      const aiManager = AIManagerService.getInstance();

      // Register Claude provider if not already registered
      const registry = AIProviderRegistry.getInstance();
      let provider = registry.getProvider(AIProviderType.Claude);

      if (!provider) {
        provider = {
          id: 'claude-cli',
          type: AIProviderType.Claude,
          name: 'Claude CLI',
          description: 'Claude AI via CLI integration',
          status: AIProviderStatus.Disconnected,
          capabilities: {
            streaming: true,
            contextSize: 200000,
            functionCalling: true,
            multimodal: true,
            codeInterpreter: true
          },
          config: {
            claudeCliPath: 'claude',
            mcpConfigPath: undefined
          }
        };
        registry.registerProvider(provider);
      }

      // Create and initialize the Claude service
      const claudeService = new ClaudeService(provider);
      await claudeService.initialize(provider.config);

      // Check connection
      const connected = await claudeService.isConnected();
      
      if (connected) {
        setService(claudeService);
        setIsConnected(true);
        
        // Subscribe to connection events
        claudeService.on(AIEvent.ProviderDisconnected, () => {
          setIsConnected(false);
          setError('Claude CLI disconnected');
        });

        claudeService.on(AIEvent.ProviderError, (error: any) => {
          setError(error.message || 'Claude error occurred');
        });
      } else {
        throw new Error('Failed to connect to Claude CLI');
      }
    } catch (err: any) {
      console.error('Failed to initialize Claude service:', err);
      setError(err.message || 'Failed to initialize Claude');
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const reconnect = useCallback(async () => {
    if (service) {
      try {
        await service.shutdown();
      } catch (err) {
        console.warn('Error during shutdown:', err);
      }
    }
    
    await initializeService();
  }, [service, initializeService]);

  useEffect(() => {
    initializeService();

    return () => {
      if (service) {
        service.shutdown().catch(err => {
          console.warn('Error during cleanup:', err);
        });
      }
    };
  }, []);

  return {
    service,
    isConnected,
    isInitializing,
    error,
    reconnect
  };
};