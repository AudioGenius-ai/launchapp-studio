// AI Provider Types
export enum AIProviderType {
  CLAUDE = 'claude',
  OPENAI = 'openai',
  GEMINI = 'gemini',
  CUSTOM = 'custom'
}

export enum AIProviderStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

// AI Session Types
export enum AISessionStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  ERROR = 'error'
}

// AI Message Types
export enum AIMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

export enum AIMessageStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  RECEIVED = 'received',
  STREAMING = 'streaming',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: Date;
  status: AIMessageStatus;
  metadata?: Record<string, any>;
  toolCalls?: ToolCall[];
  error?: AIError;
}

// AI Events
export enum AIEvent {
  // Connection events
  PROVIDER_CONNECTED = 'provider:connected',
  PROVIDER_DISCONNECTED = 'provider:disconnected',
  PROVIDER_ERROR = 'provider:error',
  
  // Session events
  SESSION_CREATED = 'session:created',
  SESSION_STARTED = 'session:started',
  SESSION_UPDATED = 'session:updated',
  SESSION_PAUSED = 'session:paused',
  SESSION_RESUMED = 'session:resumed',
  SESSION_ENDED = 'session:ended',
  SESSION_ERROR = 'session:error',
  
  // Message events
  MESSAGE_SENT = 'message:sent',
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_STREAMING = 'message:streaming',
  MESSAGE_COMPLETE = 'message:complete',
  MESSAGE_ERROR = 'message:error',
  
  // Tool events
  TOOL_CALLED = 'tool:called',
  TOOL_RESULT = 'tool:result',
  TOOL_ERROR = 'tool:error',
  
  // Model events
  MODEL_CHANGED = 'model:changed',
  MODEL_LOADED = 'model:loaded',
  MODEL_ERROR = 'model:error'
}

// AI Features
export enum AIFeature {
  CHAT = 'chat',
  CODE_COMPLETION = 'code_completion',
  CODE_EXPLANATION = 'code_explanation',
  CODE_REFACTORING = 'code_refactoring',
  DEBUGGING = 'debugging',
  DOCUMENTATION = 'documentation',
  TESTING = 'testing',
  TRANSLATION = 'translation',
  CUSTOM = 'custom'
}

// AI Tool Types
export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  input?: any; // For backward compatibility
  result?: any;
  error?: AIError;
}

export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// AI Error Types
export enum AIErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  CONTEXT_LENGTH_EXCEEDED = 'CONTEXT_LENGTH_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface AIError {
  code: AIErrorCode;
  message: string;
  details?: any;
}

// AI Configuration
export interface AIProviderConfig {
  type: AIProviderType;
  name: string;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  features: AIFeature[];
  customConfig?: Record<string, any>;
}

export interface AISession {
  id: string;
  providerId: string;
  projectId?: string;
  name: string;
  status: AISessionStatus;
  messages: AIMessage[];
  context?: AIContext;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

// Additional Types

export interface AIProvider {
  id: string;
  type: AIProviderType;
  name: string;
  status: AIProviderStatus;
  config: AIProviderConfig;
  capabilities?: AICapabilities;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  input?: any; // For backward compatibility
  result?: any;
  status?: ToolCallStatus;
  error?: AIError;
}

export enum ToolCallStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface AIEventPayload {
  sessionId?: string;
  providerId?: string;
  messageId?: string;
  toolCallId?: string;
  data?: any;
  error?: AIError;
}

export interface StreamChunk {
  sessionId: string;
  messageId: string;
  content: string;
  isComplete: boolean;
  metadata?: Record<string, any>;
}

export interface AIContext {
  files?: AIContextFile[];
  codeSnippets?: AICodeSnippet[];
  project?: ProjectContext;
  systemPrompt?: string;
  metadata?: Record<string, any>;
}

export interface AIContextFile {
  path: string;
  content?: string;
  language?: string;
  summary?: string;
}

export interface AICodeSnippet {
  id: string;
  language: string;
  code: string;
  description?: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
}

export interface ProjectContext {
  id: string;
  name: string;
  path: string;
  description?: string;
  technologies?: string[];
  metadata?: Record<string, any>;
}

export interface FileContext {
  path: string;
  content: string;
  language?: string;
  metadata?: Record<string, any>;
}

export interface CreateSessionOptions {
  providerId: string;
  projectId?: string;
  name?: string;
  context?: AIContext;
  settings?: Record<string, any>;
}

export interface UpdateSessionOptions {
  name?: string;
  status?: AISessionStatus;
  context?: AIContext;
  metadata?: Record<string, any>;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  attachments?: FileContext[];
  metadata?: Record<string, any>;
}

export interface AIPanelSettings {
  position: 'left' | 'right' | 'bottom';
  dimensions: {
    width: number;
    minWidth: number;
    maxWidth?: number;
    height: number;
    minHeight: number;
    maxHeight?: number;
  };
  showOnStartup: boolean;
}

export interface AICapabilities {
  streaming: boolean;
  tools: boolean;
  multiModal: boolean;
  contextWindow: number;
  maxOutputTokens: number;
  supportedFeatures: AIFeature[];
}

// Type alias for backward compatibility
export type AISettings = AIPanelSettings;