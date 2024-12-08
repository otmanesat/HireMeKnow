import { Theme } from '@react-navigation/native';
import { colors } from '@/theme/colors';

/**
 * Navigation Theme Configuration
 * 
 * Defines the visual appearance of navigation elements
 * Consistent with the app's design system
 */
export const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.error,
  },
};

/**
 * Screen transition configurations
 */
export const screenOptions = {
  // Default screen options
  defaultScreenOptions: {
    headerShown: false,
    contentStyle: {
      backgroundColor: colors.background,
    },
  },

  // Slide animation
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    }),
  },

  // Fade animation
  fade: {
    cardStyleInterpolator: ({ current }) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
  },

  // Modal animation
  modal: {
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    }),
  },
}; 