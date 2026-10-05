import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loadSettings, saveSettings } from '../services/storage';

/**
 * SettingsContext
 * ---------------
 * App-wide preferences, persisted to the device so they survive app
 * restarts (the web version reset to defaults on every page load).
 */

export const DEFAULT_SETTINGS = {
  unit: 'metric', // 'metric' (°C) | 'imperial' (°F)
  themePreference: 'system', // 'system' | 'light' | 'dark'
  dailyForecast: false, // morning forecast notification
  dailyForecastHour: 8, // 24h clock, device time
  weatherAlerts: false, // rain / snow / storm heads-up
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings(DEFAULT_SETTINGS).then((stored) => {
      // Spread over defaults so settings added in future versions get a value.
      setSettings({ ...DEFAULT_SETTINGS, ...stored });
      setIsLoaded(true);
    });
  }, []);

  /** Merge a partial update, e.g. updateSettings({ unit: 'imperial' }). */
  const updateSettings = useCallback((changes) => {
    setSettings((previous) => {
      const next = { ...previous, ...changes };
      saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ settings, isLoaded, updateSettings }),
    [settings, isLoaded, updateSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>.');
  return context;
}
