# Task: Frontend Navigation Implementation

## Overview
Implement a robust navigation system for the mobile application using React Navigation, including deep linking support and protected routes.

## Task Details

### Prerequisites
- React Native development environment
- React Navigation v6
- TypeScript knowledge
- Authentication system in place

### Development Steps

1. Navigation Structure Setup
```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Jobs: undefined;
  JobDetails: { jobId: string };
  Applications: undefined;
  Profile: undefined;
  Messages: undefined;
};
```

2. Navigation Configuration
```typescript
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer
      linking={linkingConfiguration}
      fallback={<LoadingScreen />}
    >
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

3. Deep Linking Setup
```typescript
// src/navigation/linking.ts
export const linkingConfiguration = {
  prefixes: ['hiremekow://', 'https://hiremekow.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Jobs: 'jobs',
          JobDetails: {
            path: 'job/:jobId',
            parse: {
              jobId: (jobId: string) => jobId,
            },
          },
          Applications: 'applications',
          Profile: 'profile',
          Messages: 'messages',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
    },
  },
};
```

4. Protected Route Implementation
```typescript
// src/navigation/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export const ProtectedRoute: React.FC<Props> = ({ 
  children,
  requiredRoles = [],
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
      navigation.navigate('Main');
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
};
```

### Navigation Screens

1. Tab Navigation
```typescript
// src/navigation/MainNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
      }}
    >
      <Tab.Screen
        name="Jobs"
        component={JobsNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="briefcase" color={color} />
          ),
        }}
      />
      {/* Add other tab screens */}
    </Tab.Navigator>
  );
};
```

## Validation Steps

### 1. Navigation Testing
```typescript
// src/__tests__/navigation/RootNavigator.test.tsx
describe('RootNavigator', () => {
  it('renders auth stack when user is not authenticated', () => {
    const { getByText } = render(<RootNavigator />);
    expect(getByText('Login')).toBeTruthy();
  });

  it('renders main stack when user is authenticated', () => {
    const { getByText } = render(<RootNavigator />, {
      wrapper: AuthProvider,
      initialState: { isAuthenticated: true },
    });
    expect(getByText('Jobs')).toBeTruthy();
  });
});
```

### 2. Deep Link Testing
```bash
# Test deep linking
npx uri-scheme open hiremekow://job/123 --android
xcrun simctl openurl booted hiremekow://job/123
```

### 3. Performance Testing
- Screen transition timing
- Memory usage monitoring
- Navigation state management

## Architecture Guidelines

### Navigation State Management
```typescript
// src/navigation/useNavigationState.ts
export const useNavigationState = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const navigateWithTracking = (name: string, params?: object) => {
    analytics.logScreenView(name);
    navigation.navigate(name, params);
  };

  return {
    navigateWithTracking,
    currentRoute: route.name,
  };
};
```

### Screen Transitions
```typescript
// src/navigation/transitions.ts
export const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: 'white' },
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    },
  }),
};
```

## Documentation Requirements

1. Navigation Flow Documentation
```markdown
# Navigation Flows

## Authentication Flow
1. Login Screen
2. Registration Screen
3. Password Reset Flow

## Main Application Flow
1. Jobs Browse
2. Job Details
3. Application Process
4. Profile Management
```

2. Component Documentation
```typescript
/**
 * @component ProtectedRoute
 * @description Route wrapper that handles authentication and role-based access
 * @param {ReactNode} children - Child components to render
 * @param {string[]} requiredRoles - Array of roles allowed to access the route
 */
```

## Error Handling

1. Navigation Error Handling
```typescript
// src/navigation/ErrorBoundary.tsx
export class NavigationErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    analytics.logError('Navigation Error', {
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Dependencies
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs
- react-native-screens
- react-native-safe-area-context

## Task Completion Checklist
- [ ] Navigation structure implemented
- [ ] Deep linking configured
- [ ] Protected routes set up
- [ ] Screen transitions implemented
- [ ] Tests written and passing
- [ ] Documentation completed
- [ ] Error handling implemented
- [ ] Performance optimizations applied
- [ ] Accessibility features added
- [ ] Team review conducted