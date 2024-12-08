import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockUser } from '../../test-utils/test-utils';
import { LoginScreen } from '../../screens/Auth/LoginScreen';
import { loginUser } from '../../store/slices/authSlice';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByTestId, getByText } = renderWithProviders(<LoginScreen />);

    expect(getByTestId('login-screen')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Create an account')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByTestId, findByText } = renderWithProviders(<LoginScreen />);

    fireEvent.press(getByTestId('login-button'));

    expect(await findByText('Email is required')).toBeTruthy();
    expect(await findByText('Password is required')).toBeTruthy();
  });

  it('handles successful login', async () => {
    const mockUser = createMockUser();
    const { getByTestId } = renderWithProviders(<LoginScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('email-input'), mockUser.email);
    fireEvent.changeText(getByTestId('password-input'), 'password123');

    // Submit the form
    fireEvent.press(getByTestId('login-button'));

    // Wait for the login process
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  it('handles login error', async () => {
    const { getByTestId, findByText } = renderWithProviders(<LoginScreen />);

    // Mock a failed login
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Invalid credentials'))
    );

    // Fill in the form with invalid credentials
    fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');

    // Submit the form
    fireEvent.press(getByTestId('login-button'));

    // Check for error message
    expect(await findByText('Invalid credentials')).toBeTruthy();
  });

  it('navigates to registration screen', () => {
    const { getByTestId } = renderWithProviders(<LoginScreen />);

    fireEvent.press(getByTestId('register-link'));

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
}); 