import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Protected Route Component
 * 
 * Handles authentication and authorization for protected routes
 * Redirects to auth screens if user is not authenticated
 * Checks user roles against required roles for authorization
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRoles = [],
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigation.navigate('Auth', { screen: 'Login' });
        return;
      }

      if (requiredRoles.length > 0 && user?.role && !requiredRoles.includes(user.role)) {
        navigation.navigate('Main', { screen: 'Jobs' });
      }
    };

    checkAuth();
  }, [isAuthenticated, user, requiredRoles, navigation]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0 && user?.role && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 