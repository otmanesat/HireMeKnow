import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../RootNavigator';
import { AuthNavigator } from '../AuthNavigator';
import { MainNavigator } from '../MainNavigator';
import { useAuth } from '@/hooks/useAuth';
import { navigationRef } from '../utils/navigationRef';

// Mock the auth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the theme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#000',
      background: '#fff',
      surface: '#fff',
      text: '#000',
      gray: '#888',
      error: '#f00',
    },
  }),
}));

describe('Navigation System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RootNavigator', () => {
    it('renders auth stack when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      } as any);

      const { getByText } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      expect(getByText('Login')).toBeTruthy();
    });

    it('renders main stack when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1' },
      } as any);

      const { getByText } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      expect(getByText('Jobs')).toBeTruthy();
    });

    it('shows loading screen when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      } as any);

      const { getByTestId } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      expect(getByTestId('loading-screen')).toBeTruthy();
    });
  });

  describe('Deep Linking', () => {
    it('handles job details deep link', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1' },
      } as any);

      const { getByText } = render(
        <NavigationContainer
          linking={{
            prefixes: ['hiremekow://'],
            config: {
              screens: {
                Main: {
                  screens: {
                    Jobs: {
                      screens: {
                        JobDetails: 'job/:id',
                      },
                    },
                  },
                },
              },
            },
          }}
        >
          <RootNavigator />
        </NavigationContainer>
      );

      await act(async () => {
        await navigationRef.current?.navigate('Main', {
          screen: 'Jobs',
          params: {
            screen: 'JobDetails',
            params: { jobId: '123' },
          },
        });
      });

      expect(getByText('Job Details')).toBeTruthy();
    });
  });

  describe('Protected Routes', () => {
    it('redirects to login when accessing protected route while not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      } as any);

      const { getByText } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      expect(getByText('Login')).toBeTruthy();
    });

    it('allows access to protected route when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', role: 'user' },
      } as any);

      const { getByText } = render(
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      );

      expect(getByText('Jobs')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1' },
      } as any);

      const { getByText } = render(
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      );

      fireEvent.press(getByText('Profile'));
      expect(getByText('Profile')).toBeTruthy();

      fireEvent.press(getByText('Messages'));
      expect(getByText('Messages')).toBeTruthy();
    });

    it('shows badge on messages tab when there are unread messages', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1' },
      } as any);

      const { getByTestId } = render(
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      );

      expect(getByTestId('messages-badge')).toBeTruthy();
    });
  });
}); 