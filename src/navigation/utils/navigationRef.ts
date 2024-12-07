import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types';

/**
 * Navigation Container Reference
 * 
 * Allows navigation actions from outside of React components
 * Useful for navigation from services, error handlers, etc.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigation Utilities
 * 
 * Helper functions for common navigation actions
 * Can be used outside of React components
 */
export const navigationUtils = {
  /**
   * Navigate to a screen
   */
  navigate: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },

  /**
   * Go back to previous screen
   */
  goBack: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  /**
   * Reset navigation state
   */
  reset: (state: any) => {
    if (navigationRef.isReady()) {
      navigationRef.reset(state);
    }
  },

  /**
   * Get current route
   */
  getCurrentRoute: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  },

  /**
   * Get current navigation state
   */
  getCurrentState: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getState();
    }
    return null;
  },
}; 