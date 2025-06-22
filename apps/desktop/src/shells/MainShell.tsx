import React from 'react';

interface MainShellProps {
  children: React.ReactNode;
}

/**
 * Main application shell for non-IDE views (home, projects, settings)
 * Provides a clean, minimal layout without IDE-specific panels
 */
export function MainShell({ children }: MainShellProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="flex h-full flex-col">
        {/* Optional header/navigation bar can be added here */}
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Optional footer/status bar can be added here */}
      </div>
    </div>
  );
}