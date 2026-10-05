import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getCurrentLocation } from '../services/location';
import { loadLastWeather, saveLastWeather } from '../services/storage';
import { fetchWeatherByCity, fetchWeatherByCoords } from '../services/weatherApi';
import { groupForecastByDay } from '../utils/forecast';
import { useSettings } from './SettingsContext';

/**
 * WeatherContext
 * --------------
 * The mobile counterpart of the web app's useWeather hook + App.jsx
 * state. It lives in a context (rather than one screen) because three
 * tabs need it: the Weather tab shows it, the Saved tab changes it, and
 * notifications are built from it.
 *
 * Mobile-specific behaviour added here:
 *   - Starts at the user's GPS location instead of hard-coded London.
 *   - Shows the last cached forecast instantly on launch, then refreshes.
 *   - Falls back to the cached forecast when offline.
 *   - Ignores out-of-date responses if the user searches quickly twice.
 */

const FALLBACK_CITY = 'London';

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const { settings, isLoaded: settingsLoaded, updateSettings } = useSettings();
  const { unit } = settings;

  // { lat, lon, label, source: 'gps' | 'search' | 'saved' }
  const [location, setLocation] = useState(null);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'refreshing'
  const [error, setError] = useState(null);
  const [cachedAt, setCachedAt] = useState(null); // set when showing offline data

  const latestRequestId = useRef(0);
  const hasStarted = useRef(false);

  /** Applies a snapshot (fresh or cached) to state in one place. */
  const applySnapshot = useCallback((snapshot) => {
    setLocation(snapshot.location);
    setCurrent(snapshot.current);
    setForecast(snapshot.forecast);
  }, []);

  /**
   * Shared lookup used by every entry point (search, GPS, saved place,
   * refresh). Returns true on success so callers can trigger haptics.
   *
   * @param {object} request { type: 'city', name } | { type: 'coords', lat, lon, label, source }
   * @param {object} options { mode: 'loading' | 'refreshing', unitOverride }
   */
  const runLookup = useCallback(
    async (request, { mode = 'loading', unitOverride } = {}) => {
      const requestId = ++latestRequestId.current;
      const requestUnit = unitOverride || unit;
      setStatus(mode);
      setError(null);

      try {
        const result =
          request.type === 'city'
            ? await fetchWeatherByCity(request.name, requestUnit)
            : await fetchWeatherByCoords(request.lat, request.lon, requestUnit, request.label);

        // A newer search started while this one was in flight: drop this result.
        if (requestId !== latestRequestId.current) return false;

        const snapshot = {
          location: {
            lat: result.current.coord.lat,
            lon: result.current.coord.lon,
            // Prefer the name the user chose / the phone's geocoder gave us over
            // OpenWeatherMap's weather-station name.
            label: request.label || `${result.current.name}, ${result.current.sys.country}`,
            source: request.source || 'search',
          },
          unit: requestUnit,
          current: result.current,
          forecast: result.forecast,
          savedAt: Date.now(),
        };

        applySnapshot(snapshot);
        setCachedAt(null);
        saveLastWeather(snapshot);
        return true;
      } catch (lookupError) {
        if (requestId !== latestRequestId.current) return false;

        // Keep whatever is on screen (fresh or cached) and explain the problem
        // in a banner, instead of blanking the screen.
        setError(lookupError.message);
        if (lookupError.code === 'network') {
          const cached = await loadLastWeather();
          if (cached && cached.unit === requestUnit) {
            applySnapshot(cached);
            setCachedAt(cached.savedAt);
          }
        }
        return false;
      } finally {
        if (requestId === latestRequestId.current) setStatus('idle');
      }
    },
    [unit, applySnapshot]
  );

  const searchCity = useCallback(
    (name) => runLookup({ type: 'city', name: name.trim() }),
    [runLookup]
  );

  /** For autocomplete picks and saved places: { lat, lon, label }. */
  const selectPlace = useCallback(
    (place, source = 'search') => runLookup({ type: 'coords', ...place, source }),
    [runLookup]
  );

  /** Uses the phone's GPS. Returns true on success. */
  const loadCurrentLocation = useCallback(async () => {
    setStatus('loading');
    try {
      const coords = await getCurrentLocation();
      return await runLookup({ type: 'coords', ...coords, source: 'gps' });
    } catch (locationError) {
      setError(locationError.message);
      setStatus('idle');
      return false;
    }
  }, [runLookup]);

  /** Pull-to-refresh: re-fetch the place currently on screen. */
  const refresh = useCallback(() => {
    if (!location) return loadCurrentLocation();
    return runLookup({ type: 'coords', ...location }, { mode: 'refreshing' });
  }, [location, runLookup, loadCurrentLocation]);

  const clearError = useCallback(() => setError(null), []);

  // Launch sequence (runs once, after saved settings are loaded so we
  // fetch in the right unit): cached data first, then live GPS weather.
  useEffect(() => {
    if (!settingsLoaded || hasStarted.current) return;
    hasStarted.current = true;

    (async () => {
      const cached = await loadLastWeather();
      const hasCache = Boolean(cached && cached.unit === unit);
      if (hasCache) {
        applySnapshot(cached);
        setCachedAt(cached.savedAt);
      }

      // With cached data on screen this is a quiet background refresh;
      // without it, the screen shows a full loading state.
      const mode = hasCache ? 'refreshing' : 'loading';
      setStatus(mode);

      try {
        const coords = await getCurrentLocation();
        await runLookup({ type: 'coords', ...coords, source: 'gps' }, { mode });
      } catch {
        // No location permission at launch is a normal choice, not an error:
        // quietly fall back to the last place viewed, or a default city.
        if (cached) {
          await runLookup({ type: 'coords', ...cached.location }, { mode });
        } else {
          await runLookup({ type: 'city', name: FALLBACK_CITY }, { mode });
        }
      }
    })();
  }, [settingsLoaded, unit, applySnapshot, runLookup]);

  /**
   * Switches °C / °F and re-fetches the same place so the numbers are
   * genuinely converted by the API, not just relabeled (same approach as
   * handleUnitToggle in the web version).
   */
  const changeUnit = useCallback(
    (nextUnit) => {
      if (nextUnit === unit) return;
      updateSettings({ unit: nextUnit });
      if (location) {
        runLookup({ type: 'coords', ...location }, { mode: 'refreshing', unitOverride: nextUnit });
      }
    },
    [unit, location, updateSettings, runLookup]
  );

  const forecastDays = useMemo(
    () => (forecast ? groupForecastByDay(forecast.list, forecast.city.timezone) : []),
    [forecast]
  );

  const value = useMemo(
    () => ({
      location,
      current,
      forecastDays,
      forecastList: forecast?.list ?? [],
      timezone: forecast?.city?.timezone ?? 0,
      unit,
      isLoading: status === 'loading',
      isRefreshing: status === 'refreshing',
      error,
      cachedAt,
      searchCity,
      selectPlace,
      loadCurrentLocation,
      refresh,
      changeUnit,
      clearError,
    }),
    [
      location,
      current,
      forecastDays,
      forecast,
      unit,
      status,
      error,
      cachedAt,
      searchCity,
      selectPlace,
      loadCurrentLocation,
      refresh,
      changeUnit,
      clearError,
    ]
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) throw new Error('useWeather must be used inside <WeatherProvider>.');
  return context;
}
