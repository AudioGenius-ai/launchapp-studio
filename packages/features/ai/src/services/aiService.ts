import { 
  AIProvider, 
  AIProviderType, 
  AIProviderStatus,
  AISession,
  AIMessage,
  AIMessageRole,
  AIMessageStatus,
  AISessionStatus,
  AIEvent,
  CreateSessionOptions,
  SendMessageRequest,
  StreamChunk,
  AIContext
} from '../types';
import { invoke } from '@tauri-apps/api/core';
import { EventEmitter } from '@code-pilot/utils';

export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getProvidersByType(type: AIProviderType): AIProvider[] {
    return this.getAllProviders().filter(p => p.type === type);
  }
}

export class AIManagerService {
  private registry: AIProviderRegistry;
  private activeProvider: AIProvider | null = null;

  constructor(registry: AIProviderRegistry) {
    this.registry = registry;
  }

  setActiveProvider(providerId: string): void {
    const provider = this.registry.getProvider(providerId);
    if (provider) {
      this.activeProvider = provider;
    }
  }

  getActiveProvider(): AIProvider | null {
    return this.activeProvider;
  }

  async initializeProvider(providerId: string): Promise<void> {
    const provider = this.registry.getProvider(providerId);
    if (provider) {
      // Initialize provider
      console.log('Initializing provider:', providerId);
    }
  }
}

export class ClaudeService extends EventEmitter {
  private sessions: Map<string, AISession> = new Map();
  private isConnected = false;
  
  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    try {
      // Check if Claude plugin is available
      await invoke('plugin:claude|ping');
      this.isConnected = true;
      this.emit(AIEvent.PROVIDER_CONNECTED);
    } catch (error) {
      this.isConnected = false;
      this.emit(AIEvent.PROVIDER_ERROR, error);
    }
  }

  async createSession(options: CreateSessionOptions): Promise<AISession> {
    const sessionId = Date.now().toString();
    const session: AISession = {
      id: sessionId,
      providerId: options.providerId,
      projectId: options.projectId,
      name: options.name || `Session ${new Date().toLocaleString()}`,
      status: AISessionStatus.ACTIVE,
      messages: [],
      context: options.context,
      metadata: options.settings,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    this.emit(AIEvent.SESSION_CREATED, session);
    
    try {
      await invoke('plugin:claude|create_session', {
        workspacePath: options.projectId || '/'
      });
    } catch (error) {
      console.error('Failed to create Claude session:', error);
    }
    
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.emit(AIEvent.SESSION_ENDED, { sessionId });
      
      try {
        await invoke('plugin:claude|close_session', { sessionId });
      } catch (error) {
        console.error('Failed to close Claude session:', error);
      }
    }
  }

  async getSession(sessionId: string): Promise<AISession | undefined> {
    return this.sessions.get(sessionId);
  }

  async listSessions(options: any): Promise<{ sessions: AISession[] }> {
    return {
      sessions: Array.from(this.sessions.values())
    };
  }

  async sendMessage(request: SendMessageRequest): Promise<AIMessage> {
    const message: AIMessage = {
      id: Date.now().toString(),
      role: AIMessageRole.USER,
      content: request.content,
      timestamp: new Date(),
      status: AIMessageStatus.SENT,
      metadata: request.metadata
    };
    
    const session = this.sessions.get(request.sessionId);
    if (session) {
      session.messages.push(message);
      this.emit(AIEvent.MESSAGE_SENT, { sessionId: request.sessionId, message });
    }
    
    return message;
  }

  async sendStreamingMessage(
    request: SendMessageRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const messageId = Date.now().toString();
    
    this.emit(AIEvent.MESSAGE_STREAMING, {
      sessionId: request.sessionId,
      messageId,
      content: request.content
    });
    
    // Simulate streaming response
    setTimeout(() => {
      const chunk: StreamChunk = {
        sessionId: request.sessionId,
        messageId,
        content: 'This is a simulated response from Claude.',
        isComplete: true
      };
      onChunk(chunk);
      this.emit(AIEvent.MESSAGE_COMPLETE, { sessionId: request.sessionId, messageId });
    }, 1000);
  }

  async clearMessages(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages = [];
      this.emit(AIEvent.SESSION_UPDATED, session);
    }
  }

  async updateContext(sessionId: string, context: AIContext): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.context = context;
      session.updatedAt = new Date();
      this.emit(AIEvent.SESSION_UPDATED, session);
    }
  }

  override on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }
  
  subscribe(event: AIEvent, listener: (...args: any[]) => void): () => void {
    this.on(event, listener);
    return () => this.off(event, listener);
  }

  async shutdown(): Promise<void> {
    for (const sessionId of this.sessions.keys()) {
      await this.deleteSession(sessionId);
    }
    this.removeAllListeners();
  }
}

// Export singleton instances
export const aiProviderRegistry = new AIProviderRegistry();
export const aiManagerService = new AIManagerService(aiProviderRegistry);
export const claudeService = new ClaudeService();