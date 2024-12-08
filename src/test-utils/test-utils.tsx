import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import root reducer and store
import { store as realStore } from '../store/store';
import authReducer from '../store/slices/authSlice';
import jobsReducer from '../store/slices/jobsSlice';
import applicationsReducer from '../store/slices/applicationsSlice';
import userPreferencesReducer from '../store/slices/userPreferencesSlice';
import type { RootState } from '../store/store';

interface WrapperProps {
  children: React.ReactNode;
}

interface RenderOptions {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore>;
  route?: string;
  navigationState?: object;
}

const rootReducer = combineReducers({
  auth: authReducer,
  jobs: jobsReducer,
  applications: applicationsReducer,
  userPreferences: userPreferencesReducer,
});

export const createTestStore = (preloadedState: Partial<RootState> = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as any,
  });
};

export const AllTheProviders: React.FC<WrapperProps> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Provider store={realStore}>
          <NavigationContainer>
            {children}
          </NavigationContainer>
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: RenderOptions = {}
) => {
  const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <Provider store={store}>
            <NavigationContainer>
              {children}
            </NavigationContainer>
          </Provider>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Test data generators
export const createMockJob = (overrides = {}) => ({
  id: 'test-job-1',
  title: 'Software Engineer',
  company: 'Test Company',
  location: 'Remote',
  type: 'Full-time',
  salary: 100000,
  description: 'Test job description',
  requirements: ['React Native', 'TypeScript'],
  postedDate: new Date().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  ...overrides,
});

export const createMockApplication = (overrides = {}) => ({
  id: 'test-application-1',
  jobId: 'test-job-1',
  userId: 'test-user-1',
  status: 'pending',
  appliedDate: new Date().toISOString(),
  resume: 'resume-url',
  coverLetter: 'cover-letter-text',
  ...overrides,
});

// Helper functions
export const waitForLoadingToFinish = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

export * from '@testing-library/react-native'; 