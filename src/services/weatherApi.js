/**
 * weatherApi
 * ----------
 * Every request to OpenWeatherMap goes through this file. Screens and
 * components never call fetch() themselves; this is the same separation
 * as useWeather.js in the web version, but split into plain async
 * functions so the state logic (WeatherContext) and the network logic
 * stay independent.
 *
 * Expo exposes env vars that start with EXPO_PUBLIC_ to the app bundle
 * (the equivalent of Vite's VITE_ prefix).
 */

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

/** Mobile networks can stall; give up after 10s instead of spinning forever. */
const REQUEST_TIMEOUT_MS = 10000;

/**
 * A typed error so the UI can react differently to each failure, e.g.
 * fall back to cached data only when the problem is the network.
 */
export class WeatherApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code; // 'missing-key' | 'invalid-key' | 'not-found' | 'network' | 'server'
  }
}

const hasValidKey = () => Boolean(API_KEY) && API_KEY !== 'your_api_key_here';

const assertApiKey = () => {
  if (!hasValidKey()) {
    throw new WeatherApiError(
      'Missing API key. Add EXPO_PUBLIC_OPENWEATHER_API_KEY to your .env file, then restart Expo.',
      'missing-key'
    );
  }
};

/** fetch() with a timeout. Network failures become a WeatherApiError with code 'network'. */
const fetchWithTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    throw new WeatherApiError(
      'No internet connection. Check your network and try again.',
      'network'
    );
  } finally {
    clearTimeout(timer);
  }
};

/** Converts an HTTP error status into a specific, human-readable message. */
const assertOk = (response, notFoundLabel) => {
  if (response.ok) return;

  if (response.status === 404) {
    throw new WeatherApiError(
      `"${notFoundLabel}" not found. Check the spelling and try again.`,
      'not-found'
    );
  }
  if (response.status === 401) {
    throw new WeatherApiError(
      'Invalid API key. Check the key in your .env file (new keys can take an hour or two to activate).',
      'invalid-key'
    );
  }
  throw new WeatherApiError(
    'Something went wrong fetching the weather. Please try again.',
    'server'
  );
};

/**
 * Fetches current conditions and the 5-day forecast in parallel.
 * Exactly 2 API calls per lookup, same as the web version.
 *
 * @param {string} query     already-encoded query, e.g. "q=London" or "lat=..&lon=.."
 * @param {string} unit      'metric' | 'imperial'
 * @param {string} label     used in the "not found" message
 * @returns {{ current: object, forecast: object }}
 */
const fetchWeatherBundle = async (query, unit, label) => {
  assertApiKey();

  const [currentRes, forecastRes] = await Promise.all([
    fetchWithTimeout(`${BASE_URL}/weather?${query}&units=${unit}&appid=${API_KEY}`),
    fetchWithTimeout(`${BASE_URL}/forecast?${query}&units=${unit}&appid=${API_KEY}`),
  ]);

  assertOk(currentRes, label);
  assertOk(forecastRes, label);

  const [current, forecast] = await Promise.all([currentRes.json(), forecastRes.json()]);
  return { current, forecast };
};

export const fetchWeatherByCity = (city, unit) =>
  fetchWeatherBundle(`q=${encodeURIComponent(city)}`, unit, city);

/**
 * Coordinates are unambiguous, so this is used for GPS, saved places,
 * and autocomplete picks (avoids mixing up the two Vancouvers).
 */
export const fetchWeatherByCoords = (lat, lon, unit, label = 'location') =>
  fetchWeatherBundle(`lat=${lat}&lon=${lon}`, unit, label);

/**
 * Autocomplete via the Geocoding API. Cheap enough to call on every
 * debounced keystroke. Fails silently (returns []) because suggestions
 * are a convenience, not core functionality.
 */
export const fetchCitySuggestions = async (query) => {
  if (!hasValidKey() || !query.trim()) return [];

  try {
    const response = await fetchWithTimeout(
      `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    );
    if (!response.ok) return [];

    const places = await response.json();
    return places.map(({ name, state, country, lat, lon }) => ({ name, state, country, lat, lon }));
  } catch {
    return [];
  }
};
