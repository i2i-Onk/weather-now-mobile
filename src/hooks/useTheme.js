import { useColorScheme } from 'react-native';

import { useSettings } from '../context/SettingsContext';
import { darkTheme, lightTheme } from '../theme/colors';

/**
 * useTheme
 * --------
 * Returns the active colour palette. By default the app follows the
 * phone's system-wide light/dark setting (a mobile convention), and the
 * user can override it in Settings.
 */
export default function useTheme() {
  const systemScheme = useColorScheme();
  const { settings } = useSettings();

  const scheme = settings.themePreference === 'system' ? systemScheme : settings.themePreference;

  return scheme === 'light' ? lightTheme : darkTheme;
}
