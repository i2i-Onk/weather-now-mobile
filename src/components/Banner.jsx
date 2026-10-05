import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { MIN_TOUCH_TARGET, radius, spacing } from '../theme/colors';

/**
 * Banner
 * ------
 * Inline message for errors ("City not found") and information
 * ("Offline, showing saved data"). Renders nothing without a message,
 * like ErrorMessage.jsx in the web version. `accessibilityLiveRegion`
 * makes screen readers announce it when it appears.
 *
 * Props:
 *   message: string | null
 *   tone: 'error' | 'info'
 *   onDismiss?: () => void   shows a close button when provided
 */
export default function Banner({ message, tone = 'error', onDismiss }) {
  const theme = useTheme();
  if (!message) return null;

  const isError = tone === 'error';
  const color = isError ? theme.errorText : theme.textPrimary;

  return (
    <View
      style={[styles.banner, { backgroundColor: isError ? theme.errorBg : theme.infoBg }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={isError ? 'warning-outline' : 'cloud-offline-outline'}
        size={20}
        color={color}
      />
      <Text style={[styles.text, { color }]}>{message}</Text>
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
        >
          <Ionicons name="close" size={18} color={color} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingLeft: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  text: { flex: 1, fontSize: 14, lineHeight: 20, paddingVertical: spacing.sm },
  close: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
