import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

/**
 * Application startup and initialization logic
 */
export class AppStartup {
  /**
   * Initialize the application
   */
  static async initialize(): Promise<void> {
    try {
      // Setup window event listeners
      await this.setupWindowListeners();
      
      // Initialize services
      await this.initializeServices();
      
      // Load user preferences
      await this.loadUserPreferences();
      
      // Check for updates (if enabled)
      await this.checkForUpdates();
      
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Setup window event listeners
   */
  private static async setupWindowListeners(): Promise<void> {
    // Handle window close event
    await appWindow.listen('tauri://close-requested', async () => {
      // Perform cleanup before closing
      await this.cleanup();
    });

    // Handle window focus events
    await appWindow.listen('tauri://focus', () => {
      // Update application state when window gains focus
    });

    await appWindow.listen('tauri://blur', () => {
      // Update application state when window loses focus
    });
  }

  /**
   * Initialize core services
   */
  private static async initializeServices(): Promise<void> {
    try {
      // Initialize file watcher service
      await invoke('initialize_file_watcher');
      
      // Initialize project service
      await invoke('initialize_project_service');
      
      // Initialize theme service
      await invoke('initialize_theme_service');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  }

  /**
   * Load user preferences from storage
   */
  private static async loadUserPreferences(): Promise<void> {
    try {
      const preferences = await invoke('load_user_preferences');
      // Apply preferences to the application
      console.log('User preferences loaded:', preferences);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  /**
   * Check for application updates
   */
  private static async checkForUpdates(): Promise<void> {
    try {
      // Only check for updates if enabled in settings
      const updateCheckEnabled = await invoke('get_setting', { key: 'autoUpdate' });
      if (updateCheckEnabled) {
        await invoke('check_for_updates');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  /**
   * Cleanup before application shutdown
   */
  private static async cleanup(): Promise<void> {
    try {
      // Save application state
      await invoke('save_application_state');
      
      // Close all open connections
      await invoke('cleanup_connections');
      
      // Perform any other cleanup tasks
      console.log('Application cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup application:', error);
    }
  }

  /**
   * Handle application errors
   */
  static setupErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // Send error to backend for logging
      invoke('log_error', { 
        message: event.message, 
        stack: event.error?.stack 
      }).catch(console.error);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Send error to backend for logging
      invoke('log_error', { 
        message: 'Unhandled promise rejection', 
        stack: event.reason?.stack || String(event.reason) 
      }).catch(console.error);
    });
  }
}