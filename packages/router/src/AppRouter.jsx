import React, { Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AuthGuard } from './guards';
import { routes } from './routes';

// Loading component for lazy-loaded routes
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Loading...</span>
  </div>
);

// Error boundary for route errors
const RouteErrorBoundary = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-4">
        We encountered an error while loading this page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Reload Page
      </button>
    </div>
  );
};

// Layout wrapper component
const LayoutWrapper = ({ layout, sidebar, title, children }) => {
  React.useEffect(() => {
    document.title = `${title} - Code Pilot Studio`;
  }, [title]);

  if (layout === 'fullscreen') {
    return <div className="w-full h-screen overflow-hidden">{children}</div>;
  }

  if (layout === 'minimal') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebar && (
        <aside className="w-64 bg-white border-r border-gray-200">
          {/* Sidebar content will be provided by parent app */}
          <div id="app-sidebar" />
        </aside>
      )}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

// Route component wrapper
const RouteComponent = ({ route }) => {
  const [Component, setComponent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (route.lazy) {
      route.lazy()
        .then((module) => {
          setComponent(() => module.default);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [route]);

  if (loading) {
    return <RouteLoader />;
  }

  if (error) {
    return <RouteErrorBoundary />;
  }

  if (!Component) {
    return <div>No component found</div>;
  }

  return (
    <AuthGuard requiresAuth={route.requiresAuth}>
      <LayoutWrapper
        layout={route.layout || 'default'}
        sidebar={route.sidebar || false}
        title={route.title || 'Code Pilot Studio'}
      >
        <Component />
      </LayoutWrapper>
    </AuthGuard>
  );
};

// Main router component
export const AppRouter = () => {
  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<RouteComponent route={route} />}
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

// Navigation hook for programmatic navigation
export const useAppNavigation = () => {
  const location = useLocation();

  const getCurrentRoute = React.useCallback(() => {
    return routes.find(route => route.path === location.pathname);
  }, [location.pathname]);

  return {
    currentPath: location.pathname,
    currentRoute: getCurrentRoute(),
  };
};

export default AppRouter;