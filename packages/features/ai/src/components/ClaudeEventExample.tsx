import React, { useState } from 'react';
import { useClaudeSessionManager } from '../services/useClaudeSessionManager';

/**
 * Example component demonstrating real-time Claude event integration
 * This shows how to use the Tauri event listeners for a simple chat interface
 */
export const ClaudeEventExample: React.FC<{ workspacePath: string }> = ({ workspacePath }) => {
  const [input, setInput] = useState('');
  
  const {
    session,
    messages,
    isStreaming,
    streamingContent,
    error,
    createSession,
    sendMessage,
    stopSession,
    isConnected,
    reconnect
  } = useClaudeSessionManager({
    workspacePath,
    autoCreate: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const message = input.trim();
    setInput('');
    
    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">Claude events disconnected</p>
        <button
          onClick={reconnect}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Claude Session {session ? `(${session.status})` : '(No session)'}
          </h2>
          <div className="flex gap-2">
            {!session ? (
              <button
                onClick={() => createSession()}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Start Session
              </button>
            ) : (
              <button
                onClick={stopSession}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Stop Session
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {message.role === 'user' ? 'You' : 'Claude'}
              {message.status === 'streaming' && ' (typing...)'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {/* Show tool calls if any */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {message.toolCalls.map((tool, idx) => (
                  <div key={idx} className="mt-1">
                    🔧 {tool.name}({JSON.stringify(tool.input)})
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Streaming indicator */}
        {isStreaming && !messages.some(m => m.status === 'streaming') && (
          <div className="p-3 bg-gray-100 rounded-lg mr-auto max-w-[80%]">
            <div className="text-xs text-gray-500 mb-1">Claude</div>
            <div className="flex items-center gap-2">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={session ? "Type your message..." : "Create a session first"}
            disabled={!session || isStreaming}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!session || isStreaming || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};