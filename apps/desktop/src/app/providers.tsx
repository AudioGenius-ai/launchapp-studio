import React from 'react';
import { ThemeProvider } from '@code-pilot/themes';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root provider component that wraps the entire application
 * with necessary context providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultMode="system" enableTransitions={true}>
      {children}
    </ThemeProvider>
  );
}