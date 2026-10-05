import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Banner from '../../components/Banner';
import Forecast from '../../components/Forecast';
import IconButton from '../../components/IconButton';
import Screen from '../../components/Screen';
import SearchBar from '../../components/SearchBar';
import UnitToggle from '../../components/UnitToggle';
import WeatherCard from '../../components/WeatherCard';
import { useSavedPlaces } from '../../context/SavedPlacesContext';
import { useWeather } from '../../context/WeatherContext';
import useTheme from '../../hooks/useTheme';
import { MIN_TOUCH_TARGET, radius, spacing } from '../../theme/colors';
import { formatDeviceTime, formatTemp } from '../../utils/formatters';
import { errorFeedback, successFeedback, tapFeedback } from '../../utils/haptics';

/**
 * Weather screen (home tab)
 * -------------------------
 * The mobile equivalent of the web app's App.jsx layout. This screen
 * only wires things together: data and actions come from the contexts,
 * and rendering is done by the components.
 */
export default function WeatherScreen() {
  const theme = useTheme();
  const { isSaved, toggleSaved } = useSavedPlaces();
  const {
    location,
    current,
    forecastDays,
    timezone,
    unit,
    isLoading,
    isRefreshing,
    error,
    cachedAt,
    searchCity,
    selectPlace,
    loadCurrentLocation,
    refresh,
    changeUnit,
    clearError,
  } = useWeather();

  /** Haptic success / error tick after any lookup the user started. */
  const withFeedback = async (lookup) => {
    const succeeded = await lookup;
    if (succeeded) successFeedback();
    else errorFeedback();
  };

  const handleUseLocation = () => {
    tapFeedback();
    withFeedback(loadCurrentLocation());
  };

  const handleUnitToggle = () => {
    changeUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const handleToggleSave = () => {
    if (!location) return;
    toggleSaved(location);
    successFeedback();
  };

  /** Opens the native share sheet (Messages, WhatsApp, email, etc.). */
  const handleShare = async () => {
    if (!current || !location) return;
    const today = forecastDays[0];
    const highLow = today
      ? ` Today's high is ${formatTemp(today.high, unit)} with a low of ${formatTemp(today.low, unit)}.`
      : '';

    try {
      await Share.share({
        message: `It's ${formatTemp(current.main.temp, unit)} with ${current.weather[0].description} in ${location.label} right now.${highLow} (via Weather Now)`,
      });
    } catch {
      // The user closed the share sheet or sharing isn't available; nothing to do.
    }
  };

  const showOfflineNotice = Boolean(cachedAt) && !isLoading && !isRefreshing;
  const isInitialLoad = isLoading && !current;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.textPrimary}
            colors={[theme.accent]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: theme.textPrimary }]} accessibilityRole="header">
            Weather Now
          </Text>
          <View style={styles.headerControls}>
            <IconButton
              icon={location?.source === 'gps' ? 'navigate' : 'navigate-outline'}
              label="Show weather for my current location"
              onPress={handleUseLocation}
              disabled={isLoading}
            />
            <UnitToggle unit={unit} onToggle={handleUnitToggle} />
          </View>
        </View>

        <SearchBar
          onSearchCity={(name) => withFeedback(searchCity(name))}
          onSelectPlace={(place) => withFeedback(selectPlace(place))}
        />

        <Banner message={error} onDismiss={clearError} />
        <Banner
          tone="info"
          message={
            showOfflineNotice
              ? `You're viewing the forecast saved at ${formatDeviceTime(cachedAt)}. Pull down to refresh.`
              : null
          }
        />

        {isInitialLoad && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.textPrimary} />
            <Text style={[styles.muted, { color: theme.textSecondary }]}>
              Finding the weather near you…
            </Text>
          </View>
        )}

        {!current && !isLoading && (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.muted, { color: theme.textSecondary }]}>
              No weather to show yet. Search for a city above, or try again.
            </Text>
            <Pressable
              onPress={refresh}
              accessibilityRole="button"
              style={[styles.retry, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.retryText, { color: theme.accentText }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {current && location && (
          // Dim, don't unmount, while new data loads: avoids the flash the
          // web version also fixed.
          <View style={[styles.weather, isLoading && styles.updating]}>
            <WeatherCard
              data={current}
              unit={unit}
              label={location.label}
              isCurrentLocation={location.source === 'gps'}
              isSaved={isSaved(location)}
              onToggleSave={handleToggleSave}
              onShare={handleShare}
            />
            <Forecast days={forecastDays} timezone={timezone} />
            <Text style={[styles.footer, { color: theme.textSecondary }]}>
              Weather data from OpenWeatherMap. Pull down to refresh.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appTitle: { fontSize: 28, fontWeight: '800' },
  headerControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  centered: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  muted: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  retry: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  retryText: { fontSize: 16, fontWeight: '700' },
  weather: { gap: spacing.lg },
  updating: { opacity: 0.6 },
  footer: { fontSize: 12, textAlign: 'center' },
});
