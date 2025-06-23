/**
 * Browser-compatible EventEmitter implementation
 * Provides a simple event system for browser environments
 */

type EventListener = (...args: any[]) => void;
type EventMap = Record<string, EventListener[]>;

export class EventEmitter {
  private events: EventMap = {};
  private maxListeners = 10;

  /**
   * Add a listener for an event
   */
  on(event: string, listener: EventListener): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    const listeners = this.events[event];
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.length} ${event} listeners added.`
      );
    }

    listeners.push(listener);
    return this;
  }

  /**
   * Add a one-time listener for an event
   */
  once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * Remove a listener from an event
   */
  off(event: string, listener: EventListener): this {
    if (!this.events[event]) {
      return this;
    }

    const index = this.events[event].indexOf(listener);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }

    if (this.events[event].length === 0) {
      delete this.events[event];
    }

    return this;
  }

  /**
   * Remove all listeners for an event (or all events if no event specified)
   */
  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  /**
   * Emit an event with arguments
   */
  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) {
      return false;
    }

    const listeners = this.events[event].slice();
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }

    return true;
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }

  /**
   * Get all listeners for an event
   */
  listeners(event: string): EventListener[] {
    return this.events[event]?.slice() || [];
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return Object.keys(this.events);
  }

  /**
   * Set the maximum number of listeners
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * Get the maximum number of listeners
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }
}

/**
 * Typed EventEmitter for better TypeScript support
 */
export class TypedEventEmitter<T extends Record<string, any[]>> {
  private emitter = new EventEmitter();

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
    this.emitter.once(event as string, listener);
    return this;
  }

  off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): boolean {
    return this.emitter.emit(event as string, ...args);
  }

  removeAllListeners<K extends keyof T>(event?: K): this {
    this.emitter.removeAllListeners(event as string);
    return this;
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.emitter.listenerCount(event as string);
  }

  listeners<K extends keyof T>(event: K): Array<(...args: T[K]) => void> {
    return this.emitter.listeners(event as string);
  }

  eventNames(): Array<keyof T> {
    return this.emitter.eventNames() as Array<keyof T>;
  }

  setMaxListeners(n: number): this {
    this.emitter.setMaxListeners(n);
    return this;
  }

  getMaxListeners(): number {
    return this.emitter.getMaxListeners();
  }
}