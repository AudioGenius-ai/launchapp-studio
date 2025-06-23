/**
 * Event listener function type
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>;

/**
 * Event subscription interface
 */
export interface EventSubscription {
  unsubscribe(): void;
}

/**
 * Event Bus service for application-wide event communication
 * Provides a centralized way to emit and listen to events
 */
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private onceListeners: Map<string, Set<EventListener>> = new Map();
  
  private constructor() {}
  
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, listener: EventListener<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener);
    
    return {
      unsubscribe: () => this.off(event, listener)
    };
  }
  
  /**
   * Subscribe to an event that will only fire once
   */
  once<T = any>(event: string, listener: EventListener<T>): EventSubscription {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    
    this.onceListeners.get(event)!.add(listener);
    
    return {
      unsubscribe: () => this.offOnce(event, listener)
    };
  }
  
  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, listener: EventListener<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  /**
   * Unsubscribe from a once event
   */
  private offOnce<T = any>(event: string, listener: EventListener<T>): void {
    const listeners = this.onceListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.onceListeners.delete(event);
      }
    }
  }
  
  /**
   * Emit an event to all subscribers
   */
  async emit<T = any>(event: string, data?: T): Promise<void> {
    const promises: Promise<void>[] = [];
    
    // Handle regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          const result = listener(data);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      }
    }
    
    // Handle once listeners
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      const listenersArray = Array.from(onceListeners);
      this.onceListeners.delete(event); // Remove all once listeners
      
      for (const listener of listenersArray) {
        try {
          const result = listener(data);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error(`Error in once event listener for "${event}":`, error);
        }
      }
    }
    
    // Wait for all async listeners to complete
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }
  
  /**
   * Emit an event synchronously (doesn't wait for async listeners)
   */
  emitSync<T = any>(event: string, data?: T): void {
    // Handle regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in sync event listener for "${event}":`, error);
        }
      }
    }
    
    // Handle once listeners
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      const listenersArray = Array.from(onceListeners);
      this.onceListeners.delete(event); // Remove all once listeners
      
      for (const listener of listenersArray) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in sync once event listener for "${event}":`, error);
        }
      }
    }
  }
  
  /**
   * Remove all listeners for a specific event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }
  
  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: string): number {
    const regularCount = this.listeners.get(event)?.size || 0;
    const onceCount = this.onceListeners.get(event)?.size || 0;
    return regularCount + onceCount;
  }
  
  /**
   * Get all event names that have listeners
   */
  eventNames(): string[] {
    const events = new Set<string>();
    for (const event of this.listeners.keys()) {
      events.add(event);
    }
    for (const event of this.onceListeners.keys()) {
      events.add(event);
    }
    return Array.from(events);
  }
  
  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
  
  /**
   * Create a promise that resolves when an event is emitted
   */
  waitFor<T = any>(event: string, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;
      
      const subscription = this.once<T>(event, (data) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      });
      
      if (timeout && timeout > 0) {
        timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error(`Event "${event}" timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();