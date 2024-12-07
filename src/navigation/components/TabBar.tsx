import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

/**
 * Custom Tab Bar Component
 * 
 * A customized bottom tab bar with:
 * - Custom styling and animations
 * - Haptic feedback
 * - Safe area support
 * - Badge support
 */
export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        paddingBottom: insets.bottom,
      },
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            haptics.selection();
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          haptics.impact();
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            {options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? colors.primary : colors.gray,
              size: 24,
            })}
            
            <Text
              style={[
                styles.label,
                {
                  color: isFocused ? colors.primary : colors.gray,
                },
              ]}
            >
              {label}
            </Text>

            {options.tabBarBadge && (
              <View style={[
                styles.badge,
                { backgroundColor: colors.error },
              ]}>
                <Text style={styles.badgeText}>
                  {options.tabBarBadge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: '20%',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 