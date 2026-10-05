import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useTheme from '../hooks/useTheme';

/**
 * Screen
 * ------
 * Shared wrapper for every tab: draws the app's gradient background
 * (ported from the web version) and pads content below the notch /
 * status bar / Dynamic Island using the device's safe-area insets.
 * The bottom inset is handled by the tab bar.
 */
export default function Screen({ children }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style={theme.statusBar} />
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, { paddingTop: insets.top }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
