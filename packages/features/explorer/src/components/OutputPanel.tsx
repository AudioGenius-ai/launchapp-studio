import React from 'react';

export const OutputPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 font-mono text-sm overflow-auto" 
        style={{ 
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)'
        }}
      >
        <div style={{ color: 'var(--color-foregroundSecondary)' }}>
          [Output panel ready - logs will appear here]
        </div>
      </div>
    </div>
  );
};