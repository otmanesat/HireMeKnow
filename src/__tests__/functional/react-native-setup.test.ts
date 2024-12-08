import { Platform } from 'react-native';

// Mock native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: 'GestureHandlerRootView',
  PanGestureHandler: 'PanGestureHandler',
  State: {},
  Directions: {},
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('React Native Setup', () => {
  it('has correct platform setup', () => {
    expect(Platform.OS).toBeDefined();
    expect(['ios', 'android', 'web']).toContain(Platform.OS);
  });

  it('has gesture handler configured', () => {
    const GestureHandler = require('react-native-gesture-handler');
    expect(GestureHandler.GestureHandlerRootView).toBeDefined();
  });

  it('has reanimated configured', () => {
    const Reanimated = require('react-native-reanimated');
    expect(Reanimated).toBeDefined();
    expect(typeof Reanimated.default.createAnimatedComponent).toBe('function');
  });

  it('has async storage configured', () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    expect(AsyncStorage.setItem).toBeDefined();
    expect(AsyncStorage.getItem).toBeDefined();
    expect(AsyncStorage.removeItem).toBeDefined();
  });
}); 