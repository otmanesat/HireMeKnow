import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import reducers (will be created next)
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import applicationsReducer from './slices/applicationsSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';

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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 