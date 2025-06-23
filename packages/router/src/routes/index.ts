import React from 'react';

export interface AppRouteObject {
  path: string;
  title?: string;
  requiresAuth?: boolean;
  layout?: 'default' | 'minimal' | 'fullscreen';
  sidebar?: boolean;
  lazy?: () => Promise<{ default: React.ComponentType<any> }>;
  children?: AppRouteObject[];
}

// Main application routes
export const routes: AppRouteObject[] = [
  {
    path: '/',
    title: 'Dashboard',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'),
  },
  {
    path: '/projects',
    title: 'Projects',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/projects/:id',
    title: 'Project',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/editor',
    title: 'Editor',
    requiresAuth: false,
    layout: 'fullscreen',
    sidebar: false,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/editor/:projectId',
    title: 'Editor',
    requiresAuth: false,
    layout: 'fullscreen',
    sidebar: false,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/terminal',
    title: 'Terminal',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/git',
    title: 'Source Control',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/ai',
    title: 'AI Assistant',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/templates',
    title: 'Templates',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/settings',
    title: 'Settings',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/help',
    title: 'Help',
    requiresAuth: false,
    layout: 'default',
    sidebar: true,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '/about',
    title: 'About',
    requiresAuth: false,
    layout: 'minimal',
    sidebar: false,
    lazy: () => import('../components/DashboardPage'), // Placeholder
  },
  {
    path: '*',
    title: 'Not Found',
    requiresAuth: false,
    layout: 'minimal',
    sidebar: false,
    lazy: () => import('../components/NotFoundPage'),
  },
];

// Route groups for navigation
export const navigationRoutes = routes.filter(route => route.sidebar);

// Public routes that don't require authentication
export const publicRoutes = routes.filter(route => !route.requiresAuth);

// Protected routes that require authentication
export const protectedRoutes = routes.filter(route => route.requiresAuth);

// Route utilities
export const findRouteByPath = (path: string): AppRouteObject | undefined => {
  return routes.find(route => route.path === path);
};

export const getRouteTitle = (path: string): string => {
  const route = findRouteByPath(path);
  return route?.title || 'Code Pilot Studio';
};

export const isProtectedRoute = (path: string): boolean => {
  const route = findRouteByPath(path);
  return route?.requiresAuth || false;
};