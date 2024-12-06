# Task: Testing Infrastructure Setup

## Overview
Set up a comprehensive testing infrastructure for the HireMeKnow mobile application, including unit tests, integration tests, and E2E testing capabilities.

## Task Details

### Prerequisites
- Node.js v16.x or higher
- React Native development environment
- TypeScript knowledge
- Basic understanding of testing principles

### Development Steps

1. Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.styles.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

2. Test Setup File
```typescript
// jest.setup.js
import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

global.fetch = jest.fn();
```

3. Custom Test Utilities
```typescript
// src/test-utils/test-utils.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '@/store/rootReducer';

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </Provider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
```

4. E2E Testing Setup
```typescript
// e2e/config.json
{
  "testEnvironment": "./environment",
  "testRunner": "jest-circus/runner",
  "testTimeout": 120000,
  "testRegex": "\\.e2e\\.ts$",
  "reporters": ["detox/runners/jest/streamlineReporter"],
  "verbose": true
}
```

## Test Examples

1. Component Testing
```typescript
// src/__tests__/components/JobCard.test.tsx
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { JobCard } from '@/components/JobCard';
import { renderWithProviders } from '@/test-utils';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco',
  };

  it('renders job details correctly', () => {
    const { getByText } = renderWithProviders(
      <JobCard job={mockJob} />
    );

    expect(getByText(mockJob.title)).toBeTruthy();
    expect(getByText(mockJob.company)).toBeTruthy();
    expect(getByText(mockJob.location)).toBeTruthy();
  });

  it('handles apply button press', () => {
    const onApply = jest.fn();
    const { getByText } = renderWithProviders(
      <JobCard job={mockJob} onApply={onApply} />
    );

    fireEvent.press(getByText('Apply'));
    expect(onApply).toHaveBeenCalledWith(mockJob.id);
  });
});
```

2. Redux Testing
```typescript
// src/__tests__/store/jobsSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import jobsReducer, { fetchJobs } from '@/store/slices/jobsSlice';

describe('Jobs Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { jobs: jobsReducer },
    });
  });

  it('should handle fetchJobs.fulfilled', async () => {
    const mockJobs = [{ id: '1', title: 'Developer' }];
    await store.dispatch(fetchJobs.fulfilled(mockJobs, ''));
    
    const state = store.getState().jobs;
    expect(state.items).toEqual(mockJobs);
    expect(state.isLoading).toBeFalsy();
  });
});
```

3. E2E Testing
```typescript
// e2e/jobs.e2e.ts
describe('Jobs Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show job details when job card is tapped', async () => {
    await element(by.id('job-card-1')).tap();
    await expect(element(by.id('job-details-screen'))).toBeVisible();
    await expect(element(by.text('Software Engineer'))).toBeVisible();
  });
});
```

## Validation Steps

### 1. Unit Test Validation
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test JobCard.test.tsx
```

### 2. E2E Test Validation
```bash
# Build app for E2E testing
npm run build:e2e

# Run E2E tests
npm run test:e2e
```

### 3. CI Integration
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Dependencies
        run: npm ci
      - name: Run Tests
        run: npm run test:ci
      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

## Architecture Guidelines

### Test Organization
```
src/
├── __tests__/
│   ├── components/
│   ├── screens/
│   ├── store/
│   └── utils/
├── e2e/
│   ├── flows/
│   └── specs/
└── test-utils/
```

### Best Practices
1. Test File Naming
```typescript
// Component file: Button.tsx
// Test file: Button.test.tsx
// E2E test file: Button.e2e.ts
```

2. Test Structure
```typescript
describe('Component/Feature', () => {
  // Setup
  beforeEach(() => {
    // Setup code
  });

  // Tests
  it('should do something', () => {
    // Test code
  });

  // Cleanup
  afterEach(() => {
    // Cleanup code
  });
});
```

## Documentation Requirements

1. Testing Guidelines
```markdown
# Testing Guidelines

## Test Types
1. Unit Tests
   - Components
   - Redux Logic
   - Utilities

2. Integration Tests
   - Screen Flows
   - API Integration

3. E2E Tests
   - User Flows
   - Critical Paths
```

2. Test Documentation
```typescript
/**
 * @test JobCard Component
 * @description Tests for the JobCard component functionality
 * @requirements
 * - Should display job details
 * - Should handle apply action
 * - Should show loading state
 */
```

## Dependencies
- jest
- @testing-library/react-native
- @testing-library/jest-native
- detox
- jest-circus
- @types/jest

## Task Completion Checklist
- [ ] Jest configuration completed
- [ ] Test utilities created
- [ ] Unit tests implemented
- [ ] Integration tests implemented
- [ ] E2E tests implemented
- [ ] CI pipeline configured
- [ ] Documentation completed
- [ ] Coverage thresholds met
- [ ] Best practices documented
- [ ] Team review conducted