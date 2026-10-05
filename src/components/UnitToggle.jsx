import { Pressable, StyleSheet, Text } from 'react-native';

import useTheme from '../hooks/useTheme';
import { MIN_TOUCH_TARGET, radius, spacing } from '../theme/colors';
import { tapFeedback } from '../utils/haptics';

/**
 * UnitToggle
 * ----------
 * The °C / °F pill from the web header, kept for one-tap switching.
 * Controlled component: the unit lives in SettingsContext.
 *
 * Props:
 *   unit: 'metric' | 'imperial'
 *   onToggle: () => void
 */
export default function UnitToggle({ unit, onToggle }) {
  const theme = useTheme();

  const handlePress = () => {
    tapFeedback();
    onToggle();
  };

  const renderOption = (value, label) => {
    const active = unit === value;
    return (
      <Text
        style={[
          styles.option,
          { color: active ? theme.accentText : theme.textSecondary },
          active && { backgroundColor: theme.accent },
        ]}
      >
        {label}
      </Text>
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.pill, { backgroundColor: theme.glassBg, borderColor: theme.glassBorder }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: unit === 'imperial' }}
      accessibilityLabel={`Temperature unit, currently ${unit === 'metric' ? 'Celsius' : 'Fahrenheit'}`}
    >
      {renderOption('metric', '°C')}
      {renderOption('imperial', '°F')}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: MIN_TOUCH_TARGET,
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: spacing.xs,
  },
  option: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
