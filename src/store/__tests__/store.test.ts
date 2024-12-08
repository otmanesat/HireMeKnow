import { store, persistor } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Store Configuration', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  it('should initialize with the correct state structure', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('jobs');
    expect(state).toHaveProperty('applications');
    expect(state).toHaveProperty('userPreferences');
  });

  it('should have the correct initial values', () => {
    const state = store.getState();
    
    // Auth state
    expect(state.auth).toEqual({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });

    // Jobs state
    expect(state.jobs).toEqual({
      items: [],
      filters: {
        location: null,
        jobType: null,
        salary: null,
        searchQuery: '',
      },
      isLoading: false,
      error: null,
    });

    // Applications state
    expect(state.applications).toEqual({
      items: [],
      isLoading: false,
      error: null,
    });

    // User preferences state
    expect(state.userPreferences).toEqual({
      theme: 'light',
      notifications: true,
      language: 'en',
      jobAlerts: {
        enabled: true,
        frequency: 'daily',
        keywords: [],
        locations: [],
      },
      displaySettings: {
        compactView: false,
        showSalary: true,
        defaultJobSort: 'date',
      },
      isLoading: false,
      error: null,
    });
  });

  it('should persist whitelisted reducers', async () => {
    // Set some state
    store.dispatch({
      type: 'auth/setToken',
      payload: 'test-token',
    });

    store.dispatch({
      type: 'userPreferences/setTheme',
      payload: 'dark',
    });

    store.dispatch({
      type: 'jobs/setFilters',
      payload: { location: 'test-location' },
    });

    // Wait for persistence
    await new Promise(resolve => setTimeout(resolve, 0));

    // Check AsyncStorage
    const persistedString = await AsyncStorage.getItem('persist:root');
    const persistedState = JSON.parse(persistedString || '{}');

    // Only auth and userPreferences should be persisted
    expect(persistedState).toHaveProperty('auth');
    expect(persistedState).toHaveProperty('userPreferences');
    expect(persistedState).not.toHaveProperty('jobs');
    expect(persistedState).not.toHaveProperty('applications');
  });
}); 