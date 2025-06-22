// Example of using the Claude plugin from the frontend

import {
  createSession,
  sendInput,
  getMessages,
  stopSession,
  onSessionEvent,
  type ClaudeMessage,
} from '@code-pilot/plugin-claude';

// Example: Create a new Claude session
export async function startClaudeSession(workspacePath: string) {
  try {
    const session = await createSession({
      workspacePath,
      prompt: 'You are Claude, an AI assistant helping with code development.',
    });
    
    console.log('Claude session created:', session);
    return session;
  } catch (error) {
    console.error('Failed to create Claude session:', error);
    throw error;
  }
}

// Example: Send input to Claude
export async function sendToClaude(sessionId: string, input: string) {
  try {
    await sendInput({ sessionId, input });
    console.log('Input sent to Claude');
  } catch (error) {
    console.error('Failed to send input:', error);
    throw error;
  }
}

// Example: Get all messages from a session
export async function getSessionMessages(sessionId: string): Promise<ClaudeMessage[]> {
  try {
    const messages = await getMessages(sessionId);
    return messages;
  } catch (error) {
    console.error('Failed to get messages:', error);
    throw error;
  }
}

// Example: Listen to session events
export function setupClaudeEventListeners() {
  const unlisten = onSessionEvent((event) => {
    console.log('Claude session event:', event);
    
    switch (event.eventType) {
      case 'messagesUpdated':
        console.log('New messages:', event.data);
        break;
      case 'statusChanged':
        console.log('Status changed:', event.data.status);
        break;
      case 'sessionStopped':
        console.log('Session stopped');
        break;
      case 'error':
        console.error('Session error:', event.data);
        break;
    }
  });
  
  // Return the unlisten function to clean up later
  return unlisten;
}

// Example: Complete workflow
export async function claudeWorkflowExample() {
  // 1. Create a session
  const session = await startClaudeSession('/path/to/workspace');
  
  // 2. Set up event listeners
  const unlisten = setupClaudeEventListeners();
  
  // 3. Send some input
  await sendToClaude(session.id, 'Hello Claude! Can you help me understand this codebase?');
  
  // 4. Wait a bit for response (in real app, you'd handle this via events)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 5. Get all messages
  const messages = await getSessionMessages(session.id);
  console.log('All messages:', messages);
  
  // 6. Clean up
  await stopSession(session.id);
  unlisten();
}