import React from 'react';
import { Outlet } from 'react-router-dom';
import { IDELayout } from '../layouts/IDELayout';

interface IDEShellProps {
  children?: React.ReactNode;
}

/**
 * IDE shell for project/editor views
 * Wraps content with the full IDE layout including panels, activity bar, etc.
 */
export function IDEShell({ children }: IDEShellProps) {
  return (
    <IDELayout>
      {children || <Outlet />}
    </IDELayout>
  );
}