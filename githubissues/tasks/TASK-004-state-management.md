# Task: State Management Implementation

## Overview
Set up and configure global state management using Redux Toolkit with persistence, including state slices for authentication, jobs, applications, and user preferences.

## Task Details

### Prerequisites
- React Native development environment
- Redux Toolkit
- TypeScript knowledge
- AsyncStorage setup

### Development Steps

1. Store Configuration
```typescript
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'userPreferences'],
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(persistConfig, authReducer),
    jobs: jobsReducer,
    applications: applicationsReducer,
    userPreferences: persistReducer(persistConfig, userPreferencesReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
```

2. Authentication Slice
```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});
```

3. Jobs Slice
```typescript
// src/store/slices/jobsSlice.ts
const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    items: [],
    filters: {
      location: null,
      jobType: null,
      salary: null,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      });
  },
});
```

4. Selectors
```typescript
// src/store/selectors/jobSelectors.ts
import { createSelector } from '@reduxjs/toolkit';

export const selectFilteredJobs = createSelector(
  [
    (state) => state.jobs.items,
    (state) => state.jobs.filters,
  ],
  (jobs, filters) => {
    return jobs.filter(job => {
      if (filters.location && job.location !== filters.location) return false;
      if (filters.jobType && job.type !== filters.jobType) return false;
      if (filters.salary && job.salary < filters.salary) return false;
      return true;
    });
  }
);
```

## Validation Steps

### 1. Store Testing
```typescript
// src/__tests__/store/authSlice.test.ts
describe('authSlice', () => {
  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  });

  it('should handle login success', async () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    await store.dispatch(loginUser({ email: 'test@example.com', password: 'password' }));
    
    const state = store.getState().auth;
    expect(state.user).toBeTruthy();
    expect(state.token).toBeTruthy();
    expect(state.isLoading).toBeFalsy();
  });
});
```

### 2. Persistence Testing
```typescript
// src/__tests__/store/persistence.test.ts
describe('Store Persistence', () => {
  it('should persist auth state', async () => {
    const store = configureStore({
      reducer: persistReducer(persistConfig, rootReducer),
    });
    
    store.dispatch(loginUser({ /* credentials */ }));
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const persistedString = await AsyncStorage.getItem('persist:root');
    const persistedState = JSON.parse(persistedString);
    expect(persistedState.auth).toBeTruthy();
  });
});
```

### 3. Performance Testing
```typescript
// src/__tests__/store/performance.test.ts
describe('Store Performance', () => {
  it('should efficiently update filtered jobs', () => {
    const start = performance.now();
    const result = selectFilteredJobs(mockState);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
    expect(result).toHaveLength(mockState.jobs.items.length);
  });
});
```

## Architecture Guidelines

### State Structure
```typescript
// src/store/types.ts
export interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
  };
  jobs: {
    items: Job[];
    filters: JobFilters;
    isLoading: boolean;
    error: string | null;
  };
  applications: {
    items: Application[];
    isLoading: boolean;
    error: string | null;
  };
  userPreferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}
```

### Performance Optimization
```typescript
// src/store/middleware/performance.ts
export const performanceMiddleware: Middleware = (store) => (next) => (action) => {
  const start = performance.now();
  const result = next(action);
  const end = performance.now();
  
  if (end - start > 16) {
    console.warn(`Slow action: ${action.type} took ${end - start}ms`);
  }
  
  return result;
};
```

## Documentation Requirements

1. State Management Documentation
```markdown
# State Management Guide

## Store Structure
- Auth State
- Jobs State
- Applications State
- User Preferences

## Data Flow
1. Action Dispatch
2. Middleware Processing
3. Reducer Updates
4. State Changes
5. Component Updates
```

2. API Integration
```typescript
/**
 * @function createApiThunk
 * @description Creates a standardized async thunk for API calls
 * @param {string} type - The action type
 * @param {Function} apiCall - The API call function
 */
export const createApiThunk = (type: string, apiCall: Function) =>
  createAsyncThunk(type, async (params, { rejectWithValue }) => {
    try {
      const response = await apiCall(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  });
```

## Error Handling

1. Error Middleware
```typescript
// src/store/middleware/error.ts
export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Error in reducer or middleware:', error);
    analytics.logError('Redux Error', { error, action });
    return next(action);
  }
};
```

## Dependencies
- @reduxjs/toolkit
- redux-persist
- @react-native-async-storage/async-storage
- redux-logger
- redux-thunk

## Task Completion Checklist
- [ ] Store configuration completed
- [ ] State slices implemented
- [ ] Persistence configured
- [ ] Selectors created
- [ ] Tests written and passing
- [ ] Documentation completed
- [ ] Error handling implemented
- [ ] Performance optimizations applied
- [ ] Type definitions added
- [ ] Team review conducted