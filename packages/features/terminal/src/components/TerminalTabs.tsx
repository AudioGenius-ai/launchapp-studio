import React, { useState, useCallback } from 'react';
import { X, Plus, Terminal as TerminalIcon } from 'lucide-react';
import type { Terminal } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

interface TerminalTabsProps {
  terminals: Terminal[];
  activeTerminalId: string | null;
  onSelectTerminal: (terminalId: string) => void;
  onCloseTerminal: (terminalId: string) => void;
  onNewTerminal: () => void;
}

export const TerminalTabs: React.FC<TerminalTabsProps> = ({
  terminals,
  activeTerminalId,
  onSelectTerminal,
  onCloseTerminal,
  onNewTerminal,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleCloseTab = useCallback((e: React.MouseEvent, terminalId: string) => {
    e.stopPropagation();
    onCloseTerminal(terminalId);
  }, [onCloseTerminal]);

  return (
    <div className="flex items-center bg-background border-b">
      <div className="flex-1 flex overflow-x-auto">
        {terminals.map((terminal) => (
          <div
            key={terminal.id}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 border-r cursor-pointer transition-colors min-w-[120px] max-w-[200px]",
              activeTerminalId === terminal.id
                ? "bg-muted"
                : "hover:bg-muted/50"
            )}
            onClick={() => onSelectTerminal(terminal.id)}
            onMouseEnter={() => setHoveredTab(terminal.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <TerminalIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1 text-sm truncate">
              {terminal.title || `Terminal ${terminal.id.slice(0, 8)}`}
            </span>
            {(hoveredTab === terminal.id || activeTerminalId === terminal.id) && (
              <button
                className="p-0.5 rounded hover:bg-destructive/20 transition-colors"
                onClick={(e) => handleCloseTab(e, terminal.id)}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className="p-2 hover:bg-muted transition-colors"
        onClick={onNewTerminal}
        title="New Terminal"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};