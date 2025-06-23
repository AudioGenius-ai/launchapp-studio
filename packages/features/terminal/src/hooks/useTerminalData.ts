import { useEffect, useRef, useCallback } from 'react';
import { terminalService } from '../services/terminalService';
import { TerminalData } from '../types';

interface UseTerminalDataOptions {
  terminalId: string;
  onOutput?: (data: string) => void;
  onExit?: (code: number) => void;
  onTitleChange?: (title: string) => void;
  onCwdChange?: (cwd: string) => void;
}

export function useTerminalData({
  terminalId,
  onOutput,
  onExit,
  onTitleChange,
  onCwdChange,
}: UseTerminalDataOptions) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to terminal data
    unsubscribeRef.current = terminalService.onTerminalData((data: TerminalData) => {
      if (data.terminalId !== terminalId) return;
      
      switch (data.type) {
        case 'data':
        default:
          if (onOutput && typeof data.data === 'string') {
            onOutput(data.data);
          }
          break;
        case 'exit':
          if (onExit) {
            onExit(0);
          }
          break;
        case 'error':
          if (onOutput && typeof data.data === 'string') {
            onOutput(`\x1b[31mError: ${data.data}\x1b[0m\n`);
          }
          break;
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [terminalId, onOutput, onExit, onTitleChange, onCwdChange]);

  const sendInput = useCallback(async (data: string) => {
    await terminalService.writeToTerminal(terminalId, data);
  }, [terminalId]);

  const resize = useCallback(async (cols: number, rows: number) => {
    await terminalService.resizeTerminal(terminalId, cols, rows);
  }, [terminalId]);

  const clear = useCallback(async () => {
    await terminalService.writeToTerminal(terminalId, '\x1b[2J\x1b[H');
  }, [terminalId]);

  const paste = useCallback(async (data: string) => {
    await terminalService.writeToTerminal(terminalId, data);
  }, [terminalId]);

  return {
    sendInput,
    resize,
    clear,
    paste,
  };
}