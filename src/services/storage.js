import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * storage
 * -------
 * Small wrapper around AsyncStorage (the mobile equivalent of
 * localStorage). Values are stored as JSON. Read failures return the
 * provided fallback instead of throwing, because a corrupt or missing
 * cache should never crash the app.
 */

const KEYS = {
  settings: 'weathernow:settings',
  savedPlaces: 'weathernow:savedPlaces',
  lastWeather: 'weathernow:lastWeather',
};

const readJson = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: the app still works, it just won't remember this.
  }
};

export const loadSettings = (fallback) => readJson(KEYS.settings, fallback);
export const saveSettings = (settings) => writeJson(KEYS.settings, settings);

export const loadSavedPlaces = () => readJson(KEYS.savedPlaces, []);
export const savePlaces = (places) => writeJson(KEYS.savedPlaces, places);

/**
 * Offline cache: the most recent successful lookup. Shape:
 *   { location, unit, current, forecast, savedAt }
 */
export const loadLastWeather = () => readJson(KEYS.lastWeather, null);
export const saveLastWeather = (snapshot) => writeJson(KEYS.lastWeather, snapshot);
