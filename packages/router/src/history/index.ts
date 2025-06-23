// Navigation utilities for programmatic routing
// Note: With React Router v6, we primarily use useNavigate hook
// This provides fallback utilities for non-component contexts

export interface AppHistory {
  push: (path: string, state?: any) => void;
  replace: (path: string, state?: any) => void;
  back: () => void;
  forward: () => void;
  getCurrentPath: () => string;
}

// Create a simple history abstraction
export const createAppHistory = (): AppHistory => {
  return {
    push: (path: string, state?: any) => {
      window.history.pushState(state, '', path);
    },
    replace: (path: string, state?: any) => {
      window.history.replaceState(state, '', path);
    },
    back: () => {
      window.history.back();
    },
    forward: () => {
      window.history.forward();
    },
    getCurrentPath: () => {
      return window.location.pathname;
    },
  };
};

// Default history instance
export const appHistory = createAppHistory();

// Navigation utilities
export interface NavigationOptions {
  replace?: boolean;
  state?: any;
}

export const navigateTo = (path: string, options: NavigationOptions = {}) => {
  if (options.replace) {
    appHistory.replace(path, options.state);
  } else {
    appHistory.push(path, options.state);
  }
};

export const navigateBack = () => {
  appHistory.back();
};

export const navigateForward = () => {
  appHistory.forward();
};

export const getCurrentPath = (): string => {
  return window.location.pathname;
};

export const getCurrentState = (): any => {
  return window.history.state;
};

// History listener utilities
export type HistoryListener = (event: PopStateEvent) => void;

export const addHistoryListener = (listener: HistoryListener) => {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
};

// Breadcrumb utilities
export interface Breadcrumb {
  label: string;
  path: string;
  isActive?: boolean;
}

export const generateBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', path: '/' }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isActive = index === segments.length - 1;
    
    // Convert segment to human-readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label,
      path: currentPath,
      isActive,
    });
  });

  return breadcrumbs;
};

// Route params utilities
export const getRouteParams = (pathname: string, pattern: string): Record<string, string> => {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  const params: Record<string, string> = {};

  patternParts.forEach((part, index) => {
    if (part.startsWith(':') && pathParts[index]) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index];
    }
  });

  return params;
};