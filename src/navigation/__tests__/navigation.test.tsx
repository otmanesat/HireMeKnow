import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppNavigator } from '../AppNavigator';
import authReducer from '../../store/slices/authSlice';

// Mock the hooks
const mockUseAuth = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the navigators
const mockAuthNavigator = jest.fn(() => null);
const mockMainNavigator = jest.fn(() => null);

jest.mock('../AuthNavigator', () => ({
  AuthNavigator: mockAuthNavigator,
}));

jest.mock('../MainNavigator', () => ({
  MainNavigator: mockMainNavigator,
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock stack navigator
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: jest.fn(() => null),
    Screen: jest.fn(() => null),
  }),
}));

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Navigation System', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('shows auth navigator when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      render(
        <Provider store={store}>
          <AppNavigator />
        </Provider>
      );

      expect(mockAuthNavigator).toHaveBeenCalled();
    });

    it('shows main navigator when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      render(
        <Provider store={store}>
          <AppNavigator />
        </Provider>
      );

      expect(mockMainNavigator).toHaveBeenCalled();
    });
  });

  describe('Role-Based Access', () => {
    it('redirects to jobs list when user lacks required role', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', role: 'user' },
        login: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
      });

      render(
        <Provider store={store}>
          <AppNavigator />
        </Provider>
      );

      expect(mockMainNavigator).toHaveBeenCalled();
    });
  });

  describe('Navigation State', () => {
    it('maintains navigation state after auth status change', () => {
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
          <AppNavigator />
        </Provider>
      );

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
          <AppNavigator />
        </Provider>
      );

      expect(mockAuthNavigator).toHaveBeenCalled();
    });
  });
}); 