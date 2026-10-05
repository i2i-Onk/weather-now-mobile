import Constants from 'expo-constants';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text } from 'react-native';

import GlassCard from '../../components/GlassCard';
import Screen from '../../components/Screen';
import SectionTitle from '../../components/SectionTitle';
import SegmentedControl from '../../components/SegmentedControl';
import SettingRow from '../../components/SettingRow';
import { useSettings } from '../../context/SettingsContext';
import { useWeather } from '../../context/WeatherContext';
import useTheme from '../../hooks/useTheme';
import {
  notificationsSupported,
  requestNotificationPermission,
  sendTestNotification,
} from '../../services/notifications';
import { MIN_TOUCH_TARGET, radius, spacing } from '../../theme/colors';
import { formatHourOption } from '../../utils/formatters';
import { successFeedback, tapFeedback } from '../../utils/haptics';

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const UNIT_OPTIONS = [
  { value: 'metric', label: 'Celsius' },
  { value: 'imperial', label: 'Fahrenheit' },
];

const HOUR_OPTIONS = [6, 7, 8, 9].map((hour) => ({ value: hour, label: formatHourOption(hour) }));

/**
 * Settings screen
 * ---------------
 * Preferences are saved on the device (SettingsContext). Notification
 * permission is requested only when the user switches a notification
 * on, never at launch, so the system prompt appears with clear context.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const { current, location, unit, changeUnit } = useWeather();

  /** If the user previously said no, the OS won't ask again; offer a shortcut to Settings. */
  const explainPermissionDenied = () => {
    // In Expo Go on Android the module can't load at all, so phone settings won't help.
    if (!notificationsSupported) {
      Alert.alert(
        'Not available in Expo Go',
        'Notifications need a development build of the app on Android. Everything else works normally here.'
      );
      return;
    }
    Alert.alert(
      'Notifications are turned off',
      'To get forecast notifications, allow notifications for Weather Now in your phone settings.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const handleNotificationToggle = async (key, enabled) => {
    tapFeedback();
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        explainPermissionDenied();
        return;
      }
    }
    updateSettings({ [key]: enabled });
  };

  const handleTestNotification = async () => {
    if (!current || !location) return;
    const granted = await requestNotificationPermission();
    if (!granted) {
      explainPermissionDenied();
      return;
    }
    await sendTestNotification({ current, unit, placeLabel: location.label });
    successFeedback();
  };

  const switchColors = {
    trackColor: { false: theme.glassBorder, true: theme.accent },
    thumbColor: '#FFFFFF',
    ios_backgroundColor: theme.glassBorder,
  };

  const placeName = location?.label ?? 'the place you last viewed';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]} accessibilityRole="header">
          Settings
        </Text>

        <SectionTitle>Display</SectionTitle>
        <GlassCard style={styles.card}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Appearance</Text>
          <SegmentedControl
            options={THEME_OPTIONS}
            value={settings.themePreference}
            onChange={(value) => updateSettings({ themePreference: value })}
            accessibilityLabel="Appearance"
          />
          <Text style={[styles.label, { color: theme.textPrimary }]}>Temperature</Text>
          <SegmentedControl
            options={UNIT_OPTIONS}
            value={settings.unit}
            onChange={changeUnit}
            accessibilityLabel="Temperature unit"
          />
        </GlassCard>

        <SectionTitle>Notifications</SectionTitle>
        <GlassCard style={styles.card}>
          <SettingRow
            title="Morning forecast"
            description={`A summary of the day's weather for ${placeName}.`}
          >
            <Switch
              value={settings.dailyForecast}
              onValueChange={(value) => handleNotificationToggle('dailyForecast', value)}
              accessibilityLabel="Morning forecast notification"
              {...switchColors}
            />
          </SettingRow>

          {settings.dailyForecast && (
            <SegmentedControl
              options={HOUR_OPTIONS}
              value={settings.dailyForecastHour}
              onChange={(value) => updateSettings({ dailyForecastHour: value })}
              accessibilityLabel="Morning forecast time"
            />
          )}

          <SettingRow
            title="Weather alerts"
            description="A heads-up one hour before rain, snow or storms arrive."
          >
            <Switch
              value={settings.weatherAlerts}
              onValueChange={(value) => handleNotificationToggle('weatherAlerts', value)}
              accessibilityLabel="Weather alert notifications"
              {...switchColors}
            />
          </SettingRow>

          <Pressable
            onPress={handleTestNotification}
            disabled={!current}
            accessibilityRole="button"
            accessibilityHint="Sends a sample notification in 3 seconds"
            style={({ pressed }) => [
              styles.button,
              { borderColor: theme.accent },
              (pressed || !current) && styles.dimmed,
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.textPrimary }]}>
              Send a test notification
            </Text>
          </Pressable>
        </GlassCard>

        <SectionTitle>About</SectionTitle>
        <GlassCard style={styles.card}>
          <Text style={[styles.about, { color: theme.textSecondary }]}>
            Weather Now {Constants.expoConfig?.version ?? ''}. Weather data from OpenWeatherMap.
            Your location is sent only to OpenWeatherMap to look up the forecast, and the last
            forecast is kept on this device so you can view it offline.
          </Text>
        </GlassCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: '800' },
  card: { gap: spacing.md },
  label: { fontSize: 16, fontWeight: '600' },
  button: {
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
  dimmed: { opacity: 0.5 },
  about: { fontSize: 14, lineHeight: 20 },
});
