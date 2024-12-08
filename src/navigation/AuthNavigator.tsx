import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '@/screens/Auth/LoginScreen';
import { RegisterScreen } from '@/screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '@/screens/Auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Navigator Component
 * 
 * Handles navigation between authentication screens
 * Includes Login, Register, and Forgot Password screens
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: 'white',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          animation: 'fade_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}; 