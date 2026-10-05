import { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import useTheme from '../hooks/useTheme';
import { radius, spacing } from '../theme/colors';
import { iconUrl } from '../utils/forecast';
import {
  capitalize,
  formatCityHour,
  formatTempShort,
  weekdayFromDateKey,
} from '../utils/formatters';
import { tapFeedback } from '../utils/haptics';
import GlassCard from './GlassCard';

/**
 * Forecast
 * --------
 * 5-day forecast, ported from Forecast.jsx. Tap a day to expand its
 * 3-hour breakdown, built from data we already have (zero extra calls).
 *
 * Mobile adaptations:
 *   - Day cards show high / low instead of a single midday reading.
 *   - The hourly breakdown is a horizontally swipeable strip (the
 *     pattern people know from built-in phone weather apps) and adds
 *     the chance of precipitation.
 *   - Expanding animates with LayoutAnimation and gives haptic feedback.
 *
 * Props:
 *   days      from groupForecastByDay()
 *   timezone  city UTC offset in seconds
 */
export default function Forecast({ days, timezone }) {
  const theme = useTheme();
  const [expandedDate, setExpandedDate] = useState(null);

  if (!days.length) return null;

  const expandedDay = days.find((day) => day.date === expandedDate);

  const toggleDay = (date) => {
    tapFeedback();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDate((previous) => (previous === date ? null : date));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textPrimary }]} accessibilityRole="header">
        5-day forecast
      </Text>

      <View style={styles.dayRow}>
        {days.map((day, index) => {
          const isExpanded = day.date === expandedDate;
          const condition = day.representative.weather[0];
          const dayName = index === 0 ? 'Today' : weekdayFromDateKey(day.date);

          return (
            <Pressable
              key={day.date}
              onPress={() => toggleDay(day.date)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
              accessibilityLabel={`${dayName}: ${condition.description}, high ${formatTempShort(day.high)}, low ${formatTempShort(day.low)}`}
              accessibilityHint="Shows the forecast every 3 hours"
              style={({ pressed }) => [
                styles.dayCard,
                {
                  backgroundColor: isExpanded ? theme.glassBgStrong : theme.glassBg,
                  borderColor: isExpanded ? theme.accent : theme.glassBorder,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.dayName, { color: theme.textPrimary }]} numberOfLines={1}>
                {dayName}
              </Text>
              <Image source={{ uri: iconUrl(condition.icon) }} style={styles.dayIcon} />
              <Text style={[styles.high, { color: theme.textPrimary }]}>
                {formatTempShort(day.high)}
              </Text>
              <Text style={[styles.low, { color: theme.textSecondary }]}>
                {formatTempShort(day.low)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {expandedDay && (
        <GlassCard style={styles.detail}>
          <Text style={[styles.detailTitle, { color: theme.textSecondary }]}>
            {capitalize(expandedDay.representative.weather[0].description)} through the day
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourRow}
          >
            {expandedDay.hourly.map((entry) => (
              <View
                key={entry.dt}
                style={styles.hour}
                accessible
                accessibilityLabel={`${formatCityHour(entry.dt, timezone)}: ${formatTempShort(entry.main.temp)}, ${entry.weather[0].description}, ${Math.round(entry.pop * 100)}% chance of precipitation`}
              >
                <Text style={[styles.hourTime, { color: theme.textSecondary }]}>
                  {formatCityHour(entry.dt, timezone)}
                </Text>
                <Image source={{ uri: iconUrl(entry.weather[0].icon) }} style={styles.hourIcon} />
                <Text style={[styles.hourTemp, { color: theme.textPrimary }]}>
                  {formatTempShort(entry.main.temp)}
                </Text>
                <Text style={[styles.hourPop, { color: theme.accent }]}>
                  {entry.pop >= 0.1 ? `${Math.round(entry.pop * 100)}%` : ' '}
                </Text>
              </View>
            ))}
          </ScrollView>
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  title: { fontSize: 18, fontWeight: '700' },
  dayRow: { flexDirection: 'row', gap: spacing.sm },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    minHeight: 120,
  },
  pressed: { opacity: 0.7 },
  dayName: { fontSize: 13, fontWeight: '600' },
  dayIcon: { width: 44, height: 44 },
  high: { fontSize: 16, fontWeight: '700' },
  low: { fontSize: 13, marginTop: 2 },
  detail: { paddingHorizontal: 0, paddingVertical: spacing.md },
  detailTitle: { fontSize: 13, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  hourRow: { paddingHorizontal: spacing.md, gap: spacing.xs },
  hour: { alignItems: 'center', width: 60 },
  hourTime: { fontSize: 12 },
  hourIcon: { width: 40, height: 40 },
  hourTemp: { fontSize: 15, fontWeight: '600' },
  hourPop: { fontSize: 11, marginTop: 2 },
});
