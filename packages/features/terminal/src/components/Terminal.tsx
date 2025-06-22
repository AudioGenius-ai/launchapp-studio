import React, { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import type { TerminalTheme } from '@code-pilot/types';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  terminalId: string;
  onData: (terminalId: string, data: string) => void;
  onResize: (terminalId: string, cols: number, rows: number) => void;
  theme?: TerminalTheme;
  fontSize?: number;
  fontFamily?: string;
  cursorStyle?: 'block' | 'underline' | 'bar';
  cursorBlink?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  terminalId,
  onData,
  onResize,
  theme,
  fontSize = 14,
  fontFamily = 'Consolas, "Courier New", monospace',
  cursorStyle = 'block',
  cursorBlink = true,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const handleResize = useCallback(() => {
    if (fitAddonRef.current && xtermRef.current) {
      fitAddonRef.current.fit();
      const { cols, rows } = xtermRef.current;
      onResize(terminalId, cols, rows);
    }
  }, [terminalId, onResize]);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      theme: typeof theme === 'object' ? theme : getDefaultTheme(),
      fontSize,
      fontFamily,
      cursorStyle,
      cursorBlink,
      allowProposedApi: true,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon((_e, uri) => {
      window.open(uri, '_blank');
    });
    const searchAddon = new SearchAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(searchAddon);

    // Store references
    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Open terminal in container
    terminal.open(terminalRef.current);

    // Initial fit
    fitAddon.fit();

    // Set up event handlers
    terminal.onData((data) => {
      onData(terminalId, data);
    });

    terminal.onResize(({ cols, rows }) => {
      onResize(terminalId, cols, rows);
    });

    // Handle window resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [terminalId, theme, fontSize, fontFamily, cursorStyle, cursorBlink, onData, onResize, handleResize]);

  // Update theme when it changes
  useEffect(() => {
    if (xtermRef.current && theme) {
      xtermRef.current.options.theme = theme;
    }
  }, [theme]);

  // Public methods
  const write = useCallback((data: string) => {
    xtermRef.current?.write(data);
  }, []);

  const clear = useCallback(() => {
    xtermRef.current?.clear();
  }, []);

  const focus = useCallback(() => {
    xtermRef.current?.focus();
  }, []);

  // Expose methods via ref
  useEffect(() => {
    const terminal = xtermRef.current;
    if (terminal) {
      (terminal as any).terminalMethods = {
        write,
        clear,
        focus,
      };
    }
  }, [write, clear, focus]);

  return (
    <div 
      ref={terminalRef} 
      className="terminal-container"
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: theme?.background || '#1e1e1e' 
      }}
    />
  );
};

function getDefaultTheme(): TerminalTheme {
  return {
    name: 'VS Code',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    cursor: '#d4d4d4',
    cursorAccent: '#1e1e1e',
    selection: '#264f78',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#e5e5e5',
  };
}