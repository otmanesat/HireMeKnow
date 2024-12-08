import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { RootStackParamList } from './types';
import { linkingConfiguration } from './utils/linking';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { navigationTheme } from './utils/theme';
import { navigationRef } from './utils/navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 * 
 * Handles the main navigation structure of the application
 * Switches between Auth and Main navigators based on authentication status
 */
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linkingConfiguration}
      theme={navigationTheme}
      fallback={<LoadingScreen />}
      documentTitle={{
        formatter: (options, route) => 
          `HireMeKnow - ${options?.title ?? route?.name}`,
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              animationTypeForReplace: !isAuthenticated ? 'pop' : 'push',
            }}
          />
        ) : (
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 