import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import Screen from '../../components/Screen';
import { placeId, useSavedPlaces } from '../../context/SavedPlacesContext';
import { useWeather } from '../../context/WeatherContext';
import useTheme from '../../hooks/useTheme';
import { MIN_TOUCH_TARGET, radius, spacing } from '../../theme/colors';
import { tapFeedback } from '../../utils/haptics';

/**
 * Saved screen
 * ------------
 * Places the user starred. Tap one to view its weather. Remove it with
 * the trash button or a long press, both of which confirm first, since
 * a destructive action should never happen from a single accidental tap.
 *
 * This list makes no API calls of its own, keeping the app's request
 * count low (the free OpenWeatherMap tier has rate limits).
 */
export default function SavedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { places, removePlace } = useSavedPlaces();
  const { selectPlace, location } = useWeather();

  const openPlace = (place) => {
    tapFeedback();
    selectPlace({ lat: place.lat, lon: place.lon, label: place.label }, 'saved');
    router.navigate('/');
  };

  const confirmRemove = (place) => {
    Alert.alert('Remove saved place?', `${place.label} will be removed from your saved places.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePlace(place.id) },
    ]);
  };

  const renderPlace = ({ item }) => {
    const isShowing = Boolean(location) && item.id === placeId(location);

    return (
      <View
        style={[styles.row, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}
      >
        <Pressable
          onPress={() => openPlace(item)}
          onLongPress={() => confirmRemove(item)}
          accessibilityRole="button"
          accessibilityLabel={`Show weather for ${item.label}`}
          accessibilityHint="Long press to remove"
          style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
        >
          <Ionicons name="location" size={20} color={theme.accent} />
          <View style={styles.rowText}>
            <Text style={[styles.placeName, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.label}
            </Text>
            {isShowing && (
              <Text style={[styles.showing, { color: theme.textSecondary }]}>Showing now</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => confirmRemove(item)}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.label}`}
          style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>
    );
  };

  return (
    <Screen>
      <FlatList
        data={places}
        keyExtractor={(place) => place.id}
        renderItem={renderPlace}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Text style={[styles.title, { color: theme.textPrimary }]} accessibilityRole="header">
            Saved places
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No saved places yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Tap the star on any forecast to keep that place here for quick access.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    minHeight: 60,
  },
  rowText: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: '600' },
  showing: { fontSize: 12, marginTop: 2 },
  remove: {
    width: MIN_TOUCH_TARGET + 8,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  empty: { alignItems: 'center', gap: spacing.md, paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
