import React, { useCallback } from 'react';
import { Terminal as TerminalComponent } from './Terminal';
import { TerminalTabs } from './TerminalTabs';
import type { Terminal as TerminalType, TerminalTheme } from '@code-pilot/types';

interface TerminalPanelProps {
  terminals: TerminalType[];
  activeTerminalId: string | null;
  theme?: TerminalTheme;
  onSelectTerminal: (terminalId: string) => void;
  onCloseTerminal: (terminalId: string) => void;
  onNewTerminal: () => void;
  onTerminalData: (terminalId: string, data: string) => void;
  onTerminalResize: (terminalId: string, cols: number, rows: number) => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  terminals,
  activeTerminalId,
  theme,
  onSelectTerminal,
  onCloseTerminal,
  onNewTerminal,
  onTerminalData,
  onTerminalResize,
}) => {

  const handleTerminalData = useCallback((terminalId: string, data: string) => {
    onTerminalData(terminalId, data);
  }, [onTerminalData]);

  const handleTerminalResize = useCallback((terminalId: string, cols: number, rows: number) => {
    onTerminalResize(terminalId, cols, rows);
  }, [onTerminalResize]);


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
            <TerminalComponent
              terminalId={terminal.id}
              onData={handleTerminalData}
              onResize={handleTerminalResize}
              theme={theme}
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