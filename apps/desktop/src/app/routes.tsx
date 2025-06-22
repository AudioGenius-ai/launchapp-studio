import React from 'react';
import { HomePage, ProjectsPage, EditorPage, SettingsPage } from '../pages';

// Route configuration types
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  layout?: 'none' | 'ide' | 'main';
}

// Main window routes (with MainShell layout)
export const mainWindowRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <HomePage />,
    layout: 'main'
  },
  {
    path: '/projects',
    element: <ProjectsPage />,
    layout: 'main'
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    layout: 'main'
  }
];

// Project window routes (with IDEShell layout)
export const projectWindowRoutes: RouteConfig[] = [
  {
    path: '/project/:projectId',
    element: <EditorPage />,
    layout: 'ide'
  },
  {
    path: '/project/:projectId/editor',
    element: <EditorPage />,
    layout: 'ide'
  },
  {
    path: '/project/:projectId/settings',
    element: <SettingsPage />,
    layout: 'ide'
  }
];

// Development routes - temporary for development
export const devRoutes: RouteConfig[] = [
  {
    path: '/editor',
    element: <EditorPage />,
    layout: 'ide'
  }
];

// All routes combined
export const allRoutes = [...mainWindowRoutes, ...projectWindowRoutes, ...devRoutes];