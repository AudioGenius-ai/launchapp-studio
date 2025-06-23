import React, { useEffect, useState, useCallback, useRef } from 'react';
import { EnhancedTerminalPanel } from './EnhancedTerminalPanel';
import { terminalService } from '../services/terminalService';
import { Terminal, TerminalData, TERMINAL_THEMES } from '../types';

const DEFAULT_TERMINAL_COLS = 80;
const DEFAULT_TERMINAL_ROWS = 24;

export const TerminalPage: React.FC = () => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const [terminalTheme] = useState(TERMINAL_THEMES['one-dark']);
  const unsubscribeFns = useRef<Map<string, () => void>>(new Map());

  // Load existing terminals on mount
  useEffect(() => {
    const loadTerminals = async () => {
      try {
        const existingTerminals = await terminalService.listTerminals();
        setTerminals(existingTerminals);
        if (existingTerminals.length > 0 && !activeTerminalId) {
          setActiveTerminalId(existingTerminals[0].id);
        }
      } catch (error) {
        console.error('Failed to load terminals:', error);
      }
    };
    
    loadTerminals();
    
    // Cleanup on unmount
    return () => {
      unsubscribeFns.current.forEach(unsubscribe => unsubscribe());
      unsubscribeFns.current.clear();
    };
  }, []);

  const handleNewTerminal = useCallback(async () => {
    try {
      const terminal = await terminalService.createTerminal({
        cols: DEFAULT_TERMINAL_COLS,
        rows: DEFAULT_TERMINAL_ROWS,
      });
      
      setTerminals(prev => [...prev, terminal]);
      setActiveTerminalId(terminal.id);
      
      // Set up data handler for this terminal
      const unsubscribe = terminalService.onTerminalData((data: TerminalData) => {
        // The Terminal component will handle the output directly
        if (data.terminalId === terminal.id && data.type === 'exit') {
          // Remove terminal from list when it exits
          setTerminals(prev => prev.filter(t => t.id !== terminal.id));
          if (activeTerminalId === terminal.id) {
            setActiveTerminalId(null);
          }
        }
      });
      
      // Store unsubscribe function properly
      unsubscribeFns.current.set(terminal.id, unsubscribe);
    } catch (error) {
      console.error('Failed to create terminal:', error);
    }
  }, [activeTerminalId]);

  const handleSelectTerminal = useCallback((terminalId: string) => {
    setActiveTerminalId(terminalId);
  }, []);

  const handleCloseTerminal = useCallback(async (terminalId: string) => {
    try {
      await terminalService.killTerminal(terminalId);
      
      // Clean up event handler
      const unsubscribe = unsubscribeFns.current.get(terminalId);
      if (unsubscribe) {
        unsubscribe();
        unsubscribeFns.current.delete(terminalId);
      }
      
      setTerminals(prev => prev.filter(t => t.id !== terminalId));
      
      if (activeTerminalId === terminalId) {
        const remainingTerminals = terminals.filter(t => t.id !== terminalId);
        setActiveTerminalId(remainingTerminals.length > 0 ? remainingTerminals[0].id : null);
      }
    } catch (error) {
      console.error('Failed to close terminal:', error);
    }
  }, [activeTerminalId, terminals]);


  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <EnhancedTerminalPanel
          terminals={terminals}
          activeTerminalId={activeTerminalId}
          theme={terminalTheme}
          onSelectTerminal={handleSelectTerminal}
          onCloseTerminal={handleCloseTerminal}
          onNewTerminal={handleNewTerminal}
        />
      </div>
    </div>
  );
};