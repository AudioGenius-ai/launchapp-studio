import React from 'react';
import { cn } from '../utils/cn';

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  sidebarWidth?: number;
  collapsed?: boolean;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebar,
  className,
  sidebarClassName,
  contentClassName,
  sidebarWidth = 240,
  collapsed = false,
}) => {
  return (
    <div className={cn('flex h-full', className)}>
      <aside
        className={cn(
          'flex-shrink-0 transition-all duration-200',
          collapsed ? 'w-0 overflow-hidden' : '',
          sidebarClassName
        )}
        style={{ width: collapsed ? 0 : sidebarWidth }}
      >
        {sidebar}
      </aside>
      <main className={cn('flex-1 min-w-0', contentClassName)}>
        {children}
      </main>
    </div>
  );
};