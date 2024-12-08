import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import reducers
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import applicationsReducer from './slices/applicationsSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';

// Import types
import type { AuthState } from './slices/authSlice';
import type { JobsState } from './slices/jobsSlice';
import type { ApplicationsState } from './slices/applicationsSlice';
import type { UserPreferencesState } from './slices/userPreferencesSlice';

export interface RootState {
  auth: AuthState;
  jobs: JobsState;
  applications: ApplicationsState;
  userPreferences: UserPreferencesState;
  _persist: { version: number; rehydrated: boolean };
}

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'userPreferences'], // Only persist auth and userPreferences
};

const rootReducer = combineReducers({
  auth: authReducer,
  jobs: jobsReducer,
  applications: applicationsReducer,
  userPreferences: userPreferencesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch; 