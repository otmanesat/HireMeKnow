# Navigation System Documentation

## Overview

The HireMeKnow app uses React Navigation v6 for handling navigation, with support for deep linking, protected routes, and a custom tab bar implementation.

## Navigation Structure

```plaintext
Root Navigator
├── Auth Stack
│   ├── Login
│   ├── Register
│   └── ForgotPassword
└── Main Stack (Tab Navigator)
    ├── Jobs Stack
    │   ├── JobsList
    │   └── JobDetails
    ├── Applications Stack
    │   ├── ApplicationsList
    │   └── ApplicationDetails
    ├── Messages Stack
    │   ├── MessagesList
    │   └── Chat
    └── Profile Stack
        ├── ProfileOverview
        └── ProfileEdit
```

## Key Features

### 1. Deep Linking
- URL Scheme: `hiremekow://`
- Universal Links: `https://hiremekow.com`
- Example Deep Links:
  ```plaintext
  hiremekow://jobs
  hiremekow://job/123
  hiremekow://profile
  ```

### 2. Protected Routes
- Authentication check
- Role-based access control
- Automatic redirection to login
- Example Usage:
  ```typescript
  <ProtectedRoute requiredRoles={['employer']}>
    <JobPostingScreen />
  </ProtectedRoute>
  ```

### 3. Navigation State Management
- Centralized navigation state
- Analytics tracking
- Screen transition handling
- Example Usage:
  ```typescript
  const { navigateWithTracking } = useNavigationState();
  navigateWithTracking('JobDetails', { jobId: '123' });
  ```

## Components

### 1. TabBar
Custom bottom tab bar with:
- Haptic feedback
- Badge support
- Custom animations
- Accessibility support

### 2. Navigation Hooks
- `useNavigationState`: Navigation state management
- `useProtectedRoute`: Route protection logic
- `useDeepLinks`: Deep linking handlers

## Screen Transitions

### 1. Default Transitions
- Horizontal slide for stack navigation
- Fade for tab navigation
- Modal presentation for forms

### 2. Custom Transitions
```typescript
const screenOptions = {
  animation: 'slide_from_right',
  presentation: 'modal',
};
```

## Deep Linking Configuration

### 1. URL Structure
```plaintext
/jobs                   -> Jobs List
/job/:id               -> Job Details
/applications          -> Applications List
/application/:id       -> Application Details
/messages              -> Messages List
/message/:id           -> Chat
/profile               -> Profile
```

### 2. Configuration Example
```typescript
const linking = {
  prefixes: ['hiremekow://', 'https://hiremekow.com'],
  config: {
    screens: {
      Jobs: 'jobs',
      JobDetails: 'job/:id',
      // ...
    },
  },
};
```

## Testing

### 1. Unit Tests
- Navigation state management
- Protected route logic
- Deep linking handlers

### 2. Integration Tests
- Navigation flow testing
- Deep link handling
- Authentication flow

### 3. E2E Tests
- Complete user journeys
- Deep linking scenarios
- Error handling

## Best Practices

### 1. Navigation
- Use type-safe navigation
- Implement proper error boundaries
- Handle deep linking edge cases
- Maintain consistent transitions

### 2. State Management
- Centralize navigation state
- Implement proper loading states
- Handle navigation errors
- Track navigation analytics

### 3. Performance
- Lazy load screens
- Optimize transitions
- Minimize re-renders
- Handle memory management

## Common Issues and Solutions

### 1. Deep Linking
- Issue: Deep links not working on iOS
- Solution: Verify URL scheme configuration in Info.plist

### 2. Navigation State
- Issue: Lost navigation state after reload
- Solution: Implement state persistence

### 3. Type Safety
- Issue: Navigation prop type errors
- Solution: Use proper type definitions

## Future Improvements

1. Performance Optimization
   - Screen preloading
   - Transition optimization
   - Memory management

2. Feature Additions
   - Gesture navigation
   - Shared element transitions
   - Advanced deep linking

3. Testing Improvements
   - Automated E2E tests
   - Performance testing
   - Accessibility testing 