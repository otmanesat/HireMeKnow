import 'react-native-gesture-handler/jestSetup';

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

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

describe('Test Environment Setup', () => {
  it('should have required environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.API_URL).toBe('http://localhost:3000');
  });
}); 