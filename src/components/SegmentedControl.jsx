import { Pressable, StyleSheet, Text, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { MIN_TOUCH_TARGET, radius, spacing } from '../theme/colors';
import { tapFeedback } from '../utils/haptics';

/**
 * SegmentedControl
 * ----------------
 * A row of mutually exclusive options (the iOS segmented control /
 * Material segmented button pattern). Used for theme, units and the
 * notification time.
 *
 * Props:
 *   options: [{ value, label }]
 *   value: currently selected value
 *   onChange: (value) => void
 *   accessibilityLabel: describes the whole group
 */
export default function SegmentedControl({ options, value, onChange, accessibilityLabel }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.group, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => {
              if (selected) return;
              tapFeedback();
              onChange(option.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[styles.segment, selected && { backgroundColor: theme.accent }]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? theme.accentText : theme.textPrimary },
                selected && styles.labelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  label: { fontSize: 14 },
  labelSelected: { fontWeight: '700' },
});
