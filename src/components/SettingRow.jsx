import { StyleSheet, Text, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { MIN_TOUCH_TARGET, spacing } from '../theme/colors';

/**
 * SettingRow
 * ----------
 * A label + optional description on the left, a control (Switch, etc.)
 * on the right. Standard settings-screen layout on both platforms.
 */
export default function SettingRow({ title, description, children }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  text: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 18, marginTop: 2 },
});
