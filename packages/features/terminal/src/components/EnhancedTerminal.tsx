import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { Unicode11Addon } from '@xterm/addon-unicode11';
import { TerminalTheme } from '@code-pilot/types';
import { useTerminalData } from '../hooks/useTerminalData';
import '@xterm/xterm/css/xterm.css';

export interface EnhancedTerminalProps {
  terminalId: string;
  theme?: TerminalTheme;
  fontSize?: number;
  fontFamily?: string;
  onTitleChange?: (terminalId: string, title: string) => void;
  onBell?: () => void;
}

export interface EnhancedTerminalRef {
  write: (data: string) => void;
  clear: () => void;
  focus: () => void;
  fit: () => void;
  getTerminal: () => XTerm | null;
}

export const EnhancedTerminal = forwardRef<EnhancedTerminalRef, EnhancedTerminalProps>(({
  terminalId,
  theme,
  fontSize = 14,
  fontFamily = 'Consolas, "Courier New", monospace',
  onTitleChange,
  onBell,
}, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  const { sendInput, resize, clear, paste } = useTerminalData({
    terminalId,
    onOutput: useCallback((data: string) => {
      if (xtermRef.current) {
        xtermRef.current.write(data);
      }
    }, []),
    onTitleChange: useCallback((title: string) => {
      if (onTitleChange) {
        onTitleChange(terminalId, title);
      }
    }, [terminalId, onTitleChange]),
  });

  // Terminal methods
  const write = useCallback((data: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(data);
    }
  }, []);

  const clearTerminal = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
    clear();
  }, [clear]);

  const focus = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.focus();
    }
  }, []);

  const fit = useCallback(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, []);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      theme: theme ? {
        background: theme.background,
        foreground: theme.foreground,
        cursor: theme.cursor,
        cursorAccent: theme.cursorAccent,
        selectionBackground: theme.selection,
        black: theme.black,
        red: theme.red,
        green: theme.green,
        yellow: theme.yellow,
        blue: theme.blue,
        magenta: theme.magenta,
        cyan: theme.cyan,
        white: theme.white,
        brightBlack: theme.brightBlack,
        brightRed: theme.brightRed,
        brightGreen: theme.brightGreen,
        brightYellow: theme.brightYellow,
        brightBlue: theme.brightBlue,
        brightMagenta: theme.brightMagenta,
        brightCyan: theme.brightCyan,
        brightWhite: theme.brightWhite,
      } : undefined,
      fontSize,
      fontFamily,
      cursorBlink: true,
      allowTransparency: true,
      scrollback: 1000,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon((_e, uri) => {
      window.open(uri, '_blank');
    });
    const searchAddon = new SearchAddon();
    const unicodeAddon = new Unicode11Addon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(searchAddon);
    terminal.loadAddon(unicodeAddon);

    // Activate unicode addon
    terminal.unicode.activeVersion = '11';

    // Store references
    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Open terminal in DOM
    terminal.open(terminalRef.current);

    // Initial fit
    fitAddon.fit();

    // Set up event handlers
    terminal.onData((data) => {
      sendInput(data);
    });

    terminal.onResize(({ cols, rows }) => {
      resize(cols, rows);
    });

    if (onBell) {
      terminal.onBell(onBell);
    }

    // Handle paste
    terminal.attachCustomKeyEventHandler((event) => {
      if (event.ctrlKey && event.key === 'v' && event.type === 'keydown') {
        navigator.clipboard.readText().then(text => {
          paste(text);
        });
        return false;
      }
      return true;
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Send initial resize
    const { cols, rows } = terminal;
    resize(cols, rows);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [terminalId, theme, fontSize, fontFamily, sendInput, resize, paste, onBell]);

  // Update theme
  useEffect(() => {
    if (xtermRef.current && theme) {
      xtermRef.current.options.theme = {
        background: theme.background,
        foreground: theme.foreground,
        cursor: theme.cursor,
        cursorAccent: theme.cursorAccent,
        selectionBackground: theme.selection,
        black: theme.black,
        red: theme.red,
        green: theme.green,
        yellow: theme.yellow,
        blue: theme.blue,
        magenta: theme.magenta,
        cyan: theme.cyan,
        white: theme.white,
        brightBlack: theme.brightBlack,
        brightRed: theme.brightRed,
        brightGreen: theme.brightGreen,
        brightYellow: theme.brightYellow,
        brightBlue: theme.brightBlue,
        brightMagenta: theme.brightMagenta,
        brightCyan: theme.brightCyan,
        brightWhite: theme.brightWhite,
      };
    }
  }, [theme]);

  // Update font settings
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.fontSize = fontSize;
      xtermRef.current.options.fontFamily = fontFamily;
      fit();
    }
  }, [fontSize, fontFamily, fit]);

  // Expose methods via imperative handle
  useImperativeHandle(ref, () => ({
    write,
    clear: clearTerminal,
    focus,
    fit,
    getTerminal: () => xtermRef.current,
  }), [write, clearTerminal, focus, fit]);

  return (
    <div 
      ref={terminalRef}
      className="terminal-container w-full h-full bg-black"
      style={{ padding: '4px' }}
    />
  );
});