export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  enabled?: boolean;
  level?: LogLevel;
  prefix?: string;
}

export class Logger {
  private name: string;
  private enabled: boolean;
  private level: LogLevel;
  private prefix: string;

  private static logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(name: string, options: LoggerOptions = {}) {
    this.name = name;
    this.enabled = options.enabled ?? (process.env.NODE_ENV === 'development');
    this.level = options.level ?? 'debug';
    this.prefix = options.prefix ?? '';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return Logger.logLevels[level] >= Logger.logLevels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `${this.prefix} ` : '';
    const logMessage = `[${timestamp}] ${prefix}[${this.name}] ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, ...args);
        break;
      case 'info':
        console.info(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'error':
        console.error(logMessage, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.formatMessage('error', message, ...args);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}