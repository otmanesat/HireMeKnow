import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from '../slices/authSlice';
import jobsReducer from '../slices/jobsSlice';
import applicationsReducer from '../slices/applicationsSlice';
import userPreferencesReducer from '../slices/userPreferencesSlice';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(JSON.stringify({
    auth: { user: null, token: null },
    userPreferences: { theme: 'light', notifications: true }
  }))),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('Store Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create store with initial state', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        jobs: jobsReducer,
        applications: applicationsReducer,
        userPreferences: userPreferencesReducer,
      },
    });

    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('jobs');
    expect(state).toHaveProperty('applications');
    expect(state).toHaveProperty('userPreferences');
  });

  it('should persist whitelisted reducers', async () => {
    const persistConfig = {
      key: 'root',
      storage: AsyncStorage,
      whitelist: ['auth', 'userPreferences'],
    };

    const rootReducer = combineReducers({
      auth: authReducer,
      jobs: jobsReducer,
      applications: applicationsReducer,
      userPreferences: userPreferencesReducer,
    });

    const persistedReducer = persistReducer(persistConfig, rootReducer);
    const store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });

    const persistor = persistStore(store);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const persistedState = JSON.parse(await AsyncStorage.getItem('persist:root') || '{}');
    expect(persistedState).toHaveProperty('auth');
    expect(persistedState).toHaveProperty('userPreferences');
    expect(persistedState).not.toHaveProperty('jobs');
    expect(persistedState).not.toHaveProperty('applications');

    persistor.purge();
  });

  it('should handle middleware configuration', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        jobs: jobsReducer,
        applications: applicationsReducer,
        userPreferences: userPreferencesReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST'],
          },
        }),
    });

    expect(store.dispatch).toBeDefined();
  });
}); 