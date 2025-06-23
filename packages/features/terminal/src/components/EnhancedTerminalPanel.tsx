import React, { useRef } from 'react';
import { TerminalTabs } from './TerminalTabs';
import { EnhancedTerminal, EnhancedTerminalRef } from './EnhancedTerminal';
import type { Terminal as TerminalType, TerminalTheme } from '../types';

interface EnhancedTerminalPanelProps {
  terminals: TerminalType[];
  activeTerminalId: string | null;
  theme?: TerminalTheme;
  onSelectTerminal: (terminalId: string) => void;
  onCloseTerminal: (terminalId: string) => void;
  onNewTerminal: () => void;
  onTitleChange?: (terminalId: string, title: string) => void;
}

export const EnhancedTerminalPanel: React.FC<EnhancedTerminalPanelProps> = ({
  terminals,
  activeTerminalId,
  theme,
  onSelectTerminal,
  onCloseTerminal,
  onNewTerminal,
  onTitleChange,
}) => {
  const terminalRefs = useRef<Map<string, EnhancedTerminalRef>>(new Map());

  return (
    <div className="flex flex-col h-full bg-background">
      <TerminalTabs
        terminals={terminals}
        activeTerminalId={activeTerminalId}
        onSelectTerminal={onSelectTerminal}
        onCloseTerminal={onCloseTerminal}
        onNewTerminal={onNewTerminal}
      />
      <div className="flex-1 relative">
        {terminals.map((terminal) => (
          <div
            key={terminal.id}
            className={`absolute inset-0 ${terminal.id === activeTerminalId ? 'block' : 'hidden'}`}
          >
            <EnhancedTerminal
              ref={(ref) => {
                if (ref) {
                  terminalRefs.current.set(terminal.id, ref);
                } else {
                  terminalRefs.current.delete(terminal.id);
                }
              }}
              terminalId={terminal.id}
              theme={theme}
              onTitleChange={onTitleChange}
            />
          </div>
        ))}
        {terminals.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No terminals open</p>
              <button
                className="mt-2 text-sm text-primary hover:underline"
                onClick={onNewTerminal}
              >
                Open a new terminal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};