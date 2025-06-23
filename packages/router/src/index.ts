// Main router component
export { default as AppRouter, useAppNavigation } from './AppRouter.jsx';

// Route configuration
export {
  routes,
  navigationRoutes,
  publicRoutes,
  protectedRoutes,
  findRouteByPath,
  getRouteTitle,
  isProtectedRoute,
  type AppRouteObject,
} from './routes';

// Guards
export {
  AuthGuard,
  createPermissionGuard,
  createRoleGuard,
  type RouteGuard,
  type PermissionGuard,
  type RoleGuard,
} from './guards';

// History utilities
export {
  createAppHistory,
  appHistory,
  navigateTo,
  navigateBack,
  navigateForward,
  getCurrentPath,
  getCurrentState,
  addHistoryListener,
  generateBreadcrumbs,
  getRouteParams,
  type HistoryListener,
  type NavigationOptions,
  type Breadcrumb,
} from './history';