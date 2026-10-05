import { StyleSheet, Text } from 'react-native';

import useTheme from '../hooks/useTheme';
import { spacing } from '../theme/colors';

/** Heading above a group of settings or a list. */
export default function SectionTitle({ children }) {
  const theme = useTheme();
  return (
    <Text style={[styles.title, { color: theme.textSecondary }]} accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
});
