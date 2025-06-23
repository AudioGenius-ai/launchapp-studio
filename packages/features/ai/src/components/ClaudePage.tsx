import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@code-pilot/ui-kit';

export const ClaudePage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    try {
      setLoading(true);
      const session = await invoke('plugin:claude|create_session', {
        workspacePath: '/tmp/claude-test'
      });
      console.log('Created session:', session);
      setSessionId((session as any).id);
      setMessages(prev => [...prev, `Session created: ${(session as any).id}`]);
    } catch (error) {
      console.error('Error creating session:', error);
      setMessages(prev => [...prev, `Error: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!sessionId || !input.trim()) return;
    
    try {
      setLoading(true);
      await invoke('plugin:claude|send_message', {
        sessionId,
        message: input
      });
      setMessages(prev => [...prev, `You: ${input}`]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, `Error: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-4">Claude Integration Test</h1>
      
      <div className="mb-4">
        <Button 
          onClick={createSession} 
          disabled={loading || !!sessionId}
        >
          {sessionId ? 'Session Active' : 'Create Session'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2 text-sm">{msg}</div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-3 py-2 border rounded"
          placeholder="Type a message..."
          disabled={!sessionId || loading}
        />
        <Button onClick={sendMessage} disabled={!sessionId || loading}>
          Send
        </Button>
      </div>
    </div>
  );
};