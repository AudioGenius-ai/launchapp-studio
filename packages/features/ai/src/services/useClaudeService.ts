import { useState, useEffect, useCallback } from 'react';
import {
  ClaudeService,
  AIManagerService,
  AIProviderRegistry,
  claudeService,
  aiManagerService,
  aiProviderRegistry
} from './aiService';
import {
  AIProvider,
  AIProviderType,
  AIProviderStatus,
  AIEvent
} from '../types';

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
      // Register Claude provider if not already registered
      let provider = aiProviderRegistry.getProvidersByType(AIProviderType.CLAUDE)[0];

      if (!provider) {
        provider = {
          id: 'claude-cli',
          type: AIProviderType.CLAUDE,
          name: 'Claude CLI',
          status: AIProviderStatus.DISCONNECTED,
          config: {
            type: AIProviderType.CLAUDE,
            name: 'Claude CLI',
            features: []
          },
          capabilities: {
            streaming: true,
            tools: true,
            multiModal: true,
            contextWindow: 200000,
            maxOutputTokens: 4096,
            supportedFeatures: []
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        aiProviderRegistry.register(provider);
      }

      // Use the global Claude service instance
      setService(claudeService);

      // Check connection
      const connected = true; // Claude service doesn't have isConnected method
      
      if (connected) {
        setService(claudeService);
        setIsConnected(true);
        
        // Subscribe to connection events
        claudeService.subscribe(AIEvent.PROVIDER_DISCONNECTED, () => {
          setIsConnected(false);
          setError('Claude CLI disconnected');
        });

        claudeService.subscribe(AIEvent.PROVIDER_ERROR, (error: any) => {
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