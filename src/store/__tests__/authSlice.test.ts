import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, logout, clearError } from '../slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from '../store';

// Mock fetch
global.fetch = jest.fn();

interface TestStore {
  auth: ReturnType<typeof authReducer>;
}

describe('Auth Slice', () => {
  let store: ReturnType<typeof configureStore<TestStore>>;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
    AsyncStorage.clear();
    (fetch as jest.Mock).mockClear();
  });

  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      const state = store.getState();
      expect(state.auth).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('Login Flow', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
      token: 'test-token',
    };

    it('should handle successful login', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await store.dispatch(loginUser(mockCredentials));
      const state = store.getState();

      expect(state.auth.user).toEqual(mockResponse.user);
      expect(state.auth.token).toBe(mockResponse.token);
      expect(state.auth.isLoading).toBe(false);
      expect(state.auth.error).toBeNull();

      // Check if token was stored in AsyncStorage
      const storedToken = await AsyncStorage.getItem('token');
      expect(storedToken).toBe(mockResponse.token);
    });

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await store.dispatch(loginUser(mockCredentials));
      const state = store.getState();

      expect(state.auth.user).toBeNull();
      expect(state.auth.token).toBeNull();
      expect(state.auth.isLoading).toBe(false);
      expect(state.auth.error).toBe('Login failed');

      // Check that token was not stored in AsyncStorage
      const storedToken = await AsyncStorage.getItem('token');
      expect(storedToken).toBeNull();
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(loginUser(mockCredentials));
      const state = store.getState();

      expect(state.auth.user).toBeNull();
      expect(state.auth.token).toBeNull();
      expect(state.auth.isLoading).toBe(false);
      expect(state.auth.error).toBe('Network error');
    });
  });

  describe('Logout', () => {
    it('should clear auth state and remove token from storage', async () => {
      // Set initial authenticated state
      await AsyncStorage.setItem('token', 'test-token');
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: {
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
          token: 'test-token',
        },
      });

      store.dispatch(logout());
      const state = store.getState();

      expect(state.auth.user).toBeNull();
      expect(state.auth.token).toBeNull();
      expect(state.auth.error).toBeNull();

      // Check that token was removed from AsyncStorage
      const storedToken = await AsyncStorage.getItem('token');
      expect(storedToken).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear error state', () => {
      // Set initial error state
      store.dispatch({
        type: 'auth/loginUser/rejected',
        payload: 'Test error',
      });

      store.dispatch(clearError());
      const state = store.getState();

      expect(state.auth.error).toBeNull();
    });
  });
}); 