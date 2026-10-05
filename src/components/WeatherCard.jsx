import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { spacing } from '../theme/colors';
import { iconUrl } from '../utils/forecast';
import { capitalize, formatCityTime, formatTemp, formatWind } from '../utils/formatters';
import GlassCard from './GlassCard';
import IconButton from './IconButton';

/**
 * WeatherCard
 * -----------
 * Current conditions, ported from WeatherDisplay.jsx. Presentational:
 * receives data and callbacks via props, holds no state.
 *
 * Props:
 *   data          OpenWeatherMap /weather response
 *   unit          'metric' | 'imperial'
 *   label         place name to show (see WeatherContext for why)
 *   isCurrentLocation  shows a GPS marker next to the name
 *   isSaved       whether the star is filled
 *   onToggleSave  () => void
 *   onShare       () => void
 */
export default function WeatherCard({
  data,
  unit,
  label,
  isCurrentLocation,
  isSaved,
  onToggleSave,
  onShare,
}) {
  const theme = useTheme();
  const condition = data.weather[0];

  const details = [
    {
      key: 'feels',
      icon: 'thermometer-outline',
      label: 'Feels like',
      value: formatTemp(data.main.feels_like, unit),
    },
    { key: 'humidity', icon: 'water-outline', label: 'Humidity', value: `${data.main.humidity}%` },
    {
      key: 'wind',
      icon: 'speedometer-outline',
      label: 'Wind',
      value: formatWind(data.wind.speed, unit),
    },
    {
      key: 'sunrise',
      icon: 'sunny-outline',
      label: 'Sunrise',
      value: formatCityTime(data.sys.sunrise, data.timezone),
    },
    {
      key: 'sunset',
      icon: 'moon-outline',
      label: 'Sunset',
      value: formatCityTime(data.sys.sunset, data.timezone),
    },
    {
      key: 'pressure',
      icon: 'analytics-outline',
      label: 'Pressure',
      value: `${data.main.pressure} hPa`,
    },
  ];

  return (
    <GlassCard>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.placeRow}>
            {isCurrentLocation && (
              <Ionicons
                name="navigate"
                size={16}
                color={theme.accent}
                accessibilityLabel="Your current location"
              />
            )}
            <Text
              style={[styles.place, { color: theme.textPrimary }]}
              numberOfLines={2}
              accessibilityRole="header"
            >
              {label}
            </Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {capitalize(condition.description)}
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon={isSaved ? 'star' : 'star-outline'}
            label={isSaved ? 'Remove from saved places' : 'Save this place'}
            color={isSaved ? '#F5B700' : undefined}
            onPress={onToggleSave}
          />
          <IconButton icon="share-outline" label="Share this weather" onPress={onShare} />
        </View>
      </View>

      <View
        style={styles.main}
        accessible
        accessibilityLabel={`${formatTemp(data.main.temp, unit)}, ${condition.description}`}
      >
        <Image source={{ uri: iconUrl(condition.icon, '@4x') }} style={styles.icon} />
        <Text style={[styles.temp, { color: theme.textPrimary }]}>
          {formatTemp(data.main.temp, unit)}
        </Text>
      </View>

      <View style={styles.grid}>
        {details.map((detail) => (
          <View
            key={detail.key}
            style={[styles.tile, { backgroundColor: theme.glassBg }]}
            accessible
            accessibilityLabel={`${detail.label}: ${detail.value}`}
          >
            <View style={styles.tileLabelRow}>
              <Ionicons name={detail.icon} size={14} color={theme.textSecondary} />
              <Text style={[styles.tileLabel, { color: theme.textSecondary }]}>{detail.label}</Text>
            </View>
            <Text style={[styles.tileValue, { color: theme.textPrimary }]}>{detail.value}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerText: { flex: 1 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  place: { fontSize: 22, fontWeight: '700', flexShrink: 1 },
  description: { fontSize: 15, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  icon: { width: 120, height: 120 },
  temp: { fontSize: 64, fontWeight: '200', letterSpacing: -2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    flexBasis: '31%',
    flexGrow: 1,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tileLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileLabel: { fontSize: 12 },
  tileValue: { fontSize: 16, fontWeight: '600', marginTop: spacing.xs },
});
