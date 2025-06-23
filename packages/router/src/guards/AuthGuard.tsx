import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  redirectTo?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Mock auth hook - replace with actual authentication logic
const useAuth = (): AuthState => {
  // For now, return a default state since authentication is not implemented
  // In a real app, this would check tokens, make API calls, etc.
  return {
    isAuthenticated: true, // Set to true for development
    isLoading: false,
    user: {
      id: '1',
      name: 'Developer',
      email: 'dev@example.com',
    },
  };
};

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Loading...</span>
  </div>
);

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiresAuth = false,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If route requires authentication and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login page, preserving the attempted location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route doesn't require authentication or user is authenticated
  return <>{children}</>;
};

export default AuthGuard;