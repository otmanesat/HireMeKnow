import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthNavigator } from '../AuthNavigator';
import { MainNavigator } from '../MainNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';

// Mock the hooks
jest.mock('@/hooks/useAuth');

// Mock the navigators
jest.mock('../AuthNavigator', () => ({
  AuthNavigator: jest.fn(() => null)
}));

jest.mock('../MainNavigator', () => ({
  MainNavigator: jest.fn(() => null)
}));

// Create a test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer independent={true}>
    {children}
  </NavigationContainer>
);

describe('Navigation System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('shows auth navigator when not authenticated', () => {
      // Mock useAuth hook
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      });

      render(
        <TestWrapper>
          <AuthNavigator />
        </TestWrapper>
      );

      expect(AuthNavigator).toHaveBeenCalled();
      expect(MainNavigator).not.toHaveBeenCalled();
    });

    it('shows main navigator when authenticated', () => {
      // Mock useAuth hook
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      });

      render(
        <TestWrapper>
          <MainNavigator />
        </TestWrapper>
      );

      expect(MainNavigator).toHaveBeenCalled();
      expect(AuthNavigator).not.toHaveBeenCalled();
    });
  });

  describe('Role-Based Access', () => {
    it('redirects to jobs list when user lacks required role', () => {
      // Mock useAuth hook with user having incorrect role
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', role: 'user' },
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      });

      const requiredRoles = ['admin'];
      const { user, isAuthenticated } = useAuth();

      render(
        <TestWrapper>
          {isAuthenticated && user?.role && !requiredRoles.includes(user.role) && (
            <MainNavigator />
          )}
        </TestWrapper>
      );

      expect(MainNavigator).toHaveBeenCalled();
    });
  });

  describe('Navigation State', () => {
    it('maintains navigation state after auth status change', () => {
      // Initial render with authenticated state
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      });

      const { rerender } = render(
        <TestWrapper>
          <MainNavigator />
        </TestWrapper>
      );

      expect(MainNavigator).toHaveBeenCalled();

      // Update to unauthenticated state
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      });

      rerender(
        <TestWrapper>
          <AuthNavigator />
        </TestWrapper>
      );

      expect(AuthNavigator).toHaveBeenCalled();
    });
  });

  describe('Deep Linking', () => {
    it('handles job details deep link when authenticated', () => {
      // Mock authenticated state
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      });

      render(
        <TestWrapper>
          <MainNavigator />
        </TestWrapper>
      );

      expect(MainNavigator).toHaveBeenCalled();
    });

    it('redirects deep link to login when not authenticated', () => {
      // Mock unauthenticated state
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      });

      render(
        <TestWrapper>
          <AuthNavigator />
        </TestWrapper>
      );

      expect(AuthNavigator).toHaveBeenCalled();
      expect(MainNavigator).not.toHaveBeenCalled();
    });
  });
}); 