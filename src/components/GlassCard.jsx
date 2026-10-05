import { StyleSheet, View } from 'react-native';

import useTheme from '../hooks/useTheme';
import { radius, spacing } from '../theme/colors';

/**
 * GlassCard
 * ---------
 * The mobile version of the web app's `.glass` class: a translucent
 * panel with a soft border. CSS backdrop blur is expensive on mobile
 * GPUs (especially inside scrolling lists on Android), so we keep the
 * look with translucency alone.
 */
export default function GlassCard({ children, style }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.glassBg, borderColor: theme.glassBorder },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
