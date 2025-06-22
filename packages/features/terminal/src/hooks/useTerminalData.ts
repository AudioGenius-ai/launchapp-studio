import { useEffect, useRef, useCallback } from 'react';
import { terminalService } from '@code-pilot/core';
import { TerminalData } from '@code-pilot/types';

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
    unsubscribeRef.current = terminalService.onTerminalData(terminalId, (data: TerminalData) => {
      switch (data.type) {
        case 'output':
          if (onOutput && typeof data.data === 'string') {
            onOutput(data.data);
          }
          break;
        case 'exit':
          if (onExit && typeof data.data === 'number') {
            onExit(data.data);
          }
          break;
        case 'title':
          if (onTitleChange && typeof data.data === 'string') {
            onTitleChange(data.data);
          }
          break;
        case 'cwd':
          if (onCwdChange && typeof data.data === 'string') {
            onCwdChange(data.data);
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
    await terminalService.sendInput(terminalId, data);
  }, [terminalId]);

  const resize = useCallback(async (cols: number, rows: number) => {
    await terminalService.resizeTerminal(terminalId, cols, rows);
  }, [terminalId]);

  const clear = useCallback(async () => {
    await terminalService.clearTerminal(terminalId);
  }, [terminalId]);

  const paste = useCallback(async (data: string) => {
    await terminalService.pasteToTerminal(terminalId, data);
  }, [terminalId]);

  return {
    sendInput,
    resize,
    clear,
    paste,
  };
}