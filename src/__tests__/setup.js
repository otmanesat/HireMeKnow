require('@testing-library/jest-native/extend-expect');

// Set up environment variables
process.env.NODE_ENV = 'test';
process.env.API_URL = 'http://localhost:3000';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: jest.fn(),
      Value: jest.fn(),
      event: jest.fn(),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      cond: jest.fn(),
      interpolate: jest.fn(),
      View: jest.fn(),
      Extrapolate: { CLAMP: jest.fn() },
    },
  };
});

// Mock native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: 'PanGestureHandler',
  State: {},
  Directions: {},
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
}));

// Mock theme provider
jest.mock('@rneui/themed', () => ({
  ThemeProvider: ({ children }) => children,
}));

describe('Test Environment Setup', () => {
  it('should have required environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.API_URL).toBe('http://localhost:3000');
  });
}); 