import React from 'react';
import {
  useAIStore,
  useActiveSession,
  useActiveProvider,
  useSessionMessages,
  useStreamingState,
  useAIErrors
} from '../stores/aiStore';
import { useAIStoreSync, useAIProviders } from '../hooks';
import { AIMessageRole, AIMessageStatus } from '../types';

/**
 * Example component demonstrating how to use the AI store
 */
export const AIStoreExample: React.FC = () => {
  // Sync store with Tauri events
  useAIStoreSync();
  
  // Store hooks
  const {
    sessions,
    activeSessionId,
    createSession,
    deleteSession,
    setActiveSession,
    addMessage,
    clearMessages,
    uiPreferences,
    updateUIPreferences,
    getSessionStats
  } = useAIStore();
  
  // Specialized hooks
  const activeSession = useActiveSession();
  const messages = useSessionMessages(activeSessionId || '');
  const streamingState = useStreamingState();
  const errors = useAIErrors();
  
  // Provider management
  const {
    providers,
    activeProvider,
    configureProvider,
    activateProvider
  } = useAIProviders();

  // Example: Create a new session
  const handleCreateSession = () => {
    const session = createSession({
      providerId: activeProvider?.id || 'claude-default',
      projectId: 'example-project',
      name: 'Example Session',
      context: {
        project: {
          id: 'example-project',
          name: 'Example Project',
          path: '/path/to/project'
        }
      }
    });
    
    console.log('Created session:', session);
  };

  // Example: Send a message
  const handleSendMessage = (content: string) => {
    if (!activeSessionId) return;
    
    const message = {
      id: `msg-${Date.now()}`,
      role: AIMessageRole.USER,
      content,
      timestamp: new Date(),
      status: AIMessageStatus.SENT
    };
    
    addMessage(activeSessionId, message);
  };

  // Example: Get session statistics
  const handleGetStats = () => {
    if (!activeSessionId) return;
    
    const stats = getSessionStats(activeSessionId);
    console.log('Session stats:', stats);
  };

  // Example: Update UI preferences
  const handleToggleCompactMode = () => {
    updateUIPreferences({
      compactMode: !uiPreferences.compactMode
    });
  };

  // Example: Export sessions
  const handleExportSessions = () => {
    const exportedSessions = useAIStore.getState().exportSessions();
    console.log('Exported sessions:', exportedSessions);
    
    // Could save to file or send to server
    const json = JSON.stringify(exportedSessions, null, 2);
    console.log('Sessions JSON:', json);
  };

  // Example: Import sessions
  const handleImportSessions = (sessionsJson: string) => {
    try {
      const sessions = JSON.parse(sessionsJson);
      useAIStore.getState().importSessions(sessions);
      console.log('Imported sessions successfully');
    } catch (error) {
      console.error('Failed to import sessions:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">AI Store Example</h2>
      
      {/* Provider Info */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Active Provider</h3>
        {activeProvider ? (
          <div>
            <p>Name: {activeProvider.name}</p>
            <p>Type: {activeProvider.type}</p>
            <p>Features: {activeProvider.capabilities?.supportedFeatures.join(', ')}</p>
          </div>
        ) : (
          <p>No active provider</p>
        )}
      </div>
      
      {/* Session Info */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Sessions</h3>
        <p>Total sessions: {sessions.size}</p>
        <p>Active session: {activeSession?.name || 'None'}</p>
        {activeSessionId && (
          <div className="mt-2">
            <p>Messages: {messages.length}</p>
            <p>Status: {activeSession?.status}</p>
          </div>
        )}
      </div>
      
      {/* Streaming State */}
      {streamingState && (
        <div className="border rounded p-4 bg-blue-50">
          <h3 className="font-semibold mb-2">Streaming</h3>
          <p>Session: {streamingState.sessionId}</p>
          <p>Content length: {streamingState.content.length}</p>
          <p>Complete: {streamingState.isComplete ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      {/* Errors */}
      {errors.size > 0 && (
        <div className="border rounded p-4 bg-red-50">
          <h3 className="font-semibold mb-2">Errors</h3>
          {Array.from(errors.entries()).map(([key, error]) => (
            <div key={key} className="mb-2">
              <p className="font-medium">{error.code}</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* UI Preferences */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">UI Preferences</h3>
        <div className="space-y-1 text-sm">
          <p>Compact Mode: {uiPreferences.compactMode ? 'On' : 'Off'}</p>
          <p>Font Size: {uiPreferences.fontSize}px</p>
          <p>Show Timestamps: {uiPreferences.showTimestamps ? 'Yes' : 'No'}</p>
          <p>Auto Scroll: {uiPreferences.autoScroll ? 'Yes' : 'No'}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="space-x-2">
        <button
          onClick={handleCreateSession}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Session
        </button>
        
        <button
          onClick={() => handleSendMessage('Hello, AI!')}
          disabled={!activeSessionId}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Send Message
        </button>
        
        <button
          onClick={handleToggleCompactMode}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Toggle Compact
        </button>
        
        <button
          onClick={handleGetStats}
          disabled={!activeSessionId}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Get Stats
        </button>
        
        <button
          onClick={handleExportSessions}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Export Sessions
        </button>
      </div>
    </div>
  );
};