import React from 'react';
import { cn } from '../utils/cn';

interface MinimalLayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const MinimalLayout: React.FC<MinimalLayoutProps> = ({
  children,
  className,
  header,
  footer,
}) => {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {header && (
        <header className="flex-shrink-0">
          {header}
        </header>
      )}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {footer && (
        <footer className="flex-shrink-0">
          {footer}
        </footer>
      )}
    </div>
  );
};