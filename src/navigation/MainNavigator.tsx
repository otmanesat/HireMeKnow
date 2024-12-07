import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/hooks/useTheme';
import { MainTabParamList } from './types';
import { JobsNavigator } from './stacks/JobsNavigator';
import { ApplicationsNavigator } from './stacks/ApplicationsNavigator';
import { ProfileNavigator } from './stacks/ProfileNavigator';
import { MessagesNavigator } from './stacks/MessagesNavigator';
import { TabBar } from './components/TabBar';
import { Icon } from '@/components/Icon';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Navigator Component
 * 
 * Implements the bottom tab navigation for the main app screens
 * Includes Jobs, Applications, Profile, and Messages tabs
 */
export const MainNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      }}
    >
      <Tab.Screen
        name="Jobs"
        component={JobsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="briefcase" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Applications"
        component={ApplicationsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-text" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-circle" color={color} size={size} />
          ),
          tabBarBadge: 3, // Example of notification badge
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 