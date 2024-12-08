import { useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types';
import { analytics } from '@/services/analytics';

/**
 * Custom hook for navigation state management and tracking
 * 
 * Provides utilities for:
 * - Screen navigation with analytics tracking
 * - Navigation state management
 * - Screen transition handling
 */
export const useNavigationState = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();

  /**
   * Navigate to a screen with analytics tracking
   */
  const navigateWithTracking = useCallback((
    name: string,
    params?: object,
    options?: { skipTracking?: boolean }
  ) => {
    if (!options?.skipTracking) {
      analytics.logScreenView({
        screen_name: name,
        screen_class: name,
        ...params,
      });
    }

    navigation.navigate(name as any, params);
  }, [navigation]);

  /**
   * Navigate back with optional fallback
   */
  const goBack = useCallback((fallbackRoute?: string) => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (fallbackRoute) {
      navigateWithTracking(fallbackRoute);
    }
  }, [navigation, navigateWithTracking]);

  /**
   * Reset navigation state
   */
  const resetNavigation = useCallback((state: any) => {
    navigation.reset(state);
  }, [navigation]);

  return {
    navigation,
    route,
    currentRoute: route.name,
    params: route.params,
    navigateWithTracking,
    goBack,
    resetNavigation,
    // Helper methods
    canGoBack: navigation.canGoBack(),
    isFocused: navigation.isFocused(),
  };
}; 