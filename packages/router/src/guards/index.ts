export { default as AuthGuard } from './AuthGuard';

// Additional guard types that can be extended
export interface RouteGuard {
  canActivate: (path: string) => boolean | Promise<boolean>;
  redirectTo?: string;
}

export interface PermissionGuard extends RouteGuard {
  requiredPermissions: string[];
}

export interface RoleGuard extends RouteGuard {
  requiredRoles: string[];
}

// Guard utilities
export const createPermissionGuard = (permissions: string[]): PermissionGuard => ({
  requiredPermissions: permissions,
  canActivate: async (_path: string) => {
    // Mock implementation - replace with actual permission checking
    return true;
  },
});

export const createRoleGuard = (roles: string[]): RoleGuard => ({
  requiredRoles: roles,
  canActivate: async (_path: string) => {
    // Mock implementation - replace with actual role checking
    return true;
  },
});