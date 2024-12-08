import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginScreen } from '../../screens/Auth/LoginScreen';
import authReducer from '../../store/slices/authSlice';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock useAuth hook
const mockLogin = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
  }),
}));

// Mock theme provider
jest.mock('@rneui/themed', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock safe area provider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LoginScreen', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles login submission', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message when login fails', async () => {
    const mockError = 'Invalid credentials';
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.mock('../../hooks/useAuth', () => ({
      useAuth: () => ({
        login: mockLogin,
        isLoading: false,
        error: mockError,
      }),
    }));

    const { getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText(mockError)).toBeTruthy();
    });
  });

  it('shows loading state during login', async () => {
    jest.mock('../../hooks/useAuth', () => ({
      useAuth: () => ({
        login: mockLogin,
        isLoading: true,
        error: null,
      }),
    }));

    const { getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('Loading...')).toBeTruthy();
    });
  });
}); 