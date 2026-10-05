import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import useTheme from '../hooks/useTheme';
import { MIN_TOUCH_TARGET, radius } from '../theme/colors';

/**
 * IconButton
 * ----------
 * Round, glass-style icon button with a guaranteed 44pt touch target
 * and a required accessibility label (icon-only buttons are invisible
 * to screen readers otherwise).
 */
export default function IconButton({ icon, label, onPress, color, disabled = false }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.glassBg, borderColor: theme.glassBorder },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Ionicons name={icon} size={22} color={color || theme.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: { opacity: 0.6 },
});
