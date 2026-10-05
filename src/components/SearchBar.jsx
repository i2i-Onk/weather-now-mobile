import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { fetchCitySuggestions } from '../services/weatherApi';
import { MIN_TOUCH_TARGET, radius, spacing } from '../theme/colors';
import { formatPlaceLabel } from '../utils/formatters';
import { tapFeedback } from '../utils/haptics';

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

/**
 * SearchBar
 * ---------
 * Same behaviour as the web version: debounced autocomplete suggestions
 * while typing (cheap geocoding calls), and a full weather fetch only
 * when the user picks a suggestion or presses the keyboard's Search key.
 *
 * Mobile adaptations:
 *   - The keyboard's return key is labelled "Search" (returnKeyType).
 *   - Suggestions render inline below the input instead of as a floating
 *     dropdown, so they never hide behind the keyboard or other content.
 *   - Picking a suggestion dismisses the keyboard.
 *   - Out-of-order responses are ignored (slow mobile networks can return
 *     the results for "Lo" after the results for "London").
 *
 * Props:
 *   onSearchCity(name: string)
 *   onSelectPlace({ lat, lon, label })
 */
export default function SearchBar({ onSearchCity, onSelectPlace }) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const latestQuery = useRef('');

  useEffect(() => {
    const trimmed = query.trim();
    latestQuery.current = trimmed;

    if (trimmed.length < MIN_QUERY_LENGTH) return undefined;

    const timer = setTimeout(async () => {
      const results = await fetchCitySuggestions(trimmed);
      if (latestQuery.current === trimmed) setSuggestions(results);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const reset = () => {
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return; // Empty search is ignored, no wasted request.
    reset();
    onSearchCity(trimmed);
  };

  const handleSelect = (suggestion) => {
    const label = formatPlaceLabel(suggestion);
    tapFeedback();
    setQuery(label);
    reset();
    onSelectPlace({ lat: suggestion.lat, lon: suggestion.lon, label });
  };

  // Hide stale suggestions as soon as the query gets too short, without
  // needing an extra state update.
  const visibleSuggestions = query.trim().length >= MIN_QUERY_LENGTH ? suggestions : [];
  const showSuggestions = isFocused && visibleSuggestions.length > 0;

  return (
    <View>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.glassBg,
            borderColor: isFocused ? theme.accent : theme.glassBorder,
          },
        ]}
      >
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for a city"
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
          clearButtonMode="never"
          accessibilityLabel="City name"
          style={[styles.input, { color: theme.textPrimary }]}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={8}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {showSuggestions && (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: theme.glassBgStrong, borderColor: theme.glassBorder },
          ]}
        >
          {visibleSuggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion.lat}-${suggestion.lon}-${index}`}
              onPress={() => handleSelect(suggestion)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.suggestion,
                index > 0 && { borderTopColor: theme.glassBorder, borderTopWidth: 1 },
                pressed && { backgroundColor: theme.glassBg },
              ]}
            >
              <Ionicons name="location-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.suggestionText, { color: theme.textPrimary }]} numberOfLines={1}>
                {suggestion.name}
                <Text style={{ color: theme.textSecondary }}>
                  {suggestion.state ? `, ${suggestion.state}` : ''}, {suggestion.country}
                </Text>
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingLeft: spacing.lg,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: spacing.md },
  clear: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: MIN_TOUCH_TARGET + 4,
  },
  suggestionText: { flex: 1, fontSize: 15 },
});
