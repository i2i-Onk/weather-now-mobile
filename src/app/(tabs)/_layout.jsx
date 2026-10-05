import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

import useTheme from '../../hooks/useTheme';

/**
 * Tab layout
 * ----------
 * Bottom tab navigation, the standard top-level navigation pattern on
 * both iOS and Android, placed within thumb reach. Replaces the web
 * version's single-page layout with header buttons.
 */

const TAB_ICONS = {
  index: ['partly-sunny', 'partly-sunny-outline'],
  saved: ['star', 'star-outline'],
  settings: ['settings', 'settings-outline'],
};

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.glassBorder,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Weather' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
