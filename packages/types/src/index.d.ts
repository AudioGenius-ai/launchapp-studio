export interface Project {
    id: string;
    name: string;
    path: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    settings: ProjectSettings;
}
export interface ProjectSettings {
    gitEnabled: boolean;
    defaultBranch: string;
    aiProvider?: string;
    extensions: string[];
}
export interface Session {
    id: string;
    projectId: string;
    name: string;
    status: SessionStatus;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
export declare enum SessionStatus {
    Active = "active",
    Paused = "paused",
    Completed = "completed",
    Archived = "archived"
}
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface ChatOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}
export interface TauriCommand<T = any, R = any> {
    name: string;
    payload: T;
    response: R;
}
export * from './project';
export * from './filesystem';
//# sourceMappingURL=index.d.ts.map