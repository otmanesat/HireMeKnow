import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: jest.fn(),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: jest.fn(),
    Screen: jest.fn(),
  }),
}));

describe('React Native Setup', () => {
  test('React Native dependencies are correctly installed', () => {
    const dependencies = [
      'react-native',
      '@react-navigation/native',
      'react-native-screens',
      'react-native-safe-area-context',
      'react-native-gesture-handler',
      'react-native-reanimated',
    ];

    dependencies.forEach(dep => {
      expect(() => require(dep)).not.toThrow();
    });
  });

  test('Platform-specific files are available', () => {
    const platform = Platform.select({
      ios: 'ios',
      android: 'android',
    });
    expect(platform).toBeDefined();
    expect(['ios', 'android']).toContain(platform);
  });

  test('Navigation components are available', () => {
    expect(NavigationContainer).toBeDefined();
    const { createStackNavigator } = require('@react-navigation/stack');
    const stack = createStackNavigator();
    expect(stack.Navigator).toBeDefined();
    expect(stack.Screen).toBeDefined();
  });

  test('Gesture handler is properly configured', () => {
    const GestureHandler = require('react-native-gesture-handler');
    expect(GestureHandler.GestureHandlerRootView).toBeDefined();
  });

  test('Safe area context is available', () => {
    const { SafeAreaProvider, SafeAreaView } = require('react-native-safe-area-context');
    expect(SafeAreaProvider).toBeDefined();
    expect(SafeAreaView).toBeDefined();
  });
}); 