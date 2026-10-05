import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';

import { SavedPlacesProvider } from '../context/SavedPlacesContext';
import { SettingsProvider } from '../context/SettingsContext';
import { WeatherProvider } from '../context/WeatherContext';
import useNotificationSync from '../hooks/useNotificationSync';
import { configureNotifications } from '../services/notifications';

/**
 * Root layout
 * -----------
 * Expo Router renders this around every screen. It sets up the app-wide
 * providers (order matters: WeatherProvider reads the unit from
 * SettingsProvider) and mounts the notification scheduler.
 */

/** Renders nothing; exists so the hook can run inside the providers. */
function NotificationScheduler() {
  useNotificationSync();
  return null;
}

export default function RootLayout() {
  useEffect(() => {
    configureNotifications().catch(() => {
      // Not supported on this platform (e.g. web); notifications are optional.
    });
  }, []);

  return (
    <SettingsProvider>
      <SavedPlacesProvider>
        <WeatherProvider>
          <NotificationScheduler />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </WeatherProvider>
      </SavedPlacesProvider>
    </SettingsProvider>
  );
}
