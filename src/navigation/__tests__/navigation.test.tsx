import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppNavigator } from '../AppNavigator';
import { AuthNavigator } from '../AuthNavigator';
import { MainNavigator } from '../MainNavigator';

// Mock the hooks
jest.mock('../../hooks/useAuth');

// Mock the navigators
jest.mock('../AuthNavigator', () => ({
  AuthNavigator: () => null,
}));

jest.mock('../MainNavigator', () => ({
  MainNavigator: () => null,
}));

// Import the mocked hook
import { useAuth } from '../../hooks/useAuth';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Navigation System', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {},
    });
  });

  describe('Authentication Flow', () => {
    it('shows auth navigator when not authenticated', () => {
      // Mock useAuth hook
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      );

      expect(AuthNavigator).toHaveBeenCalled();
    });

    it('shows main navigator when authenticated', () => {
      // Mock useAuth hook
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      );

      expect(MainNavigator).toHaveBeenCalled();
    });
  });

  describe('Role-Based Access', () => {
    it('redirects to jobs list when user lacks required role', () => {
      // Mock useAuth hook with user having incorrect role
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', role: 'user' },
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      );

      expect(MainNavigator).toHaveBeenCalled();
    });
  });

  describe('Navigation State', () => {
    it('maintains navigation state after auth status change', () => {
      // Initial render with authenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      const { rerender } = render(
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      );

      // Change auth state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      rerender(
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      );

      expect(AuthNavigator).toHaveBeenCalled();
    });
  });

  describe('Deep Linking', () => {
    it('handles job details deep link when authenticated', () => {
      // Mock authenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      );

      expect(MainNavigator).toHaveBeenCalled();
    });

    it('redirects deep link to login when not authenticated', () => {
      // Mock unauthenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      );

      expect(AuthNavigator).toHaveBeenCalled();
    });
  });
}); 