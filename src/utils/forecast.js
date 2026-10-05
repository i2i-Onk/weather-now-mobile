import { cityDateKey, cityHour } from './formatters';

/**
 * Forecast helpers
 * ----------------
 * OpenWeatherMap's /forecast endpoint returns 40 entries at 3-hour
 * intervals (5 days). These helpers reshape that list for the UI and
 * for notifications. Everything here is derived from data that was
 * already fetched, so it costs ZERO extra API calls (same principle as
 * the web version's expandable forecast).
 */

const MIDDAY = 12;
const FORECAST_DAYS = 5;

/** Conditions worth warning someone about ahead of time. */
const ALERT_CONDITIONS = ['Thunderstorm', 'Rain', 'Drizzle', 'Snow'];

/**
 * Groups the 3-hour forecast list by the CITY's local calendar date.
 *
 * Improvement over the web version: the web app grouped by `dt_txt`,
 * which is in UTC. For cities far from UTC (e.g. Vancouver, UTC-7),
 * that put late-evening readings under the next day. Grouping by the
 * city's own date fixes that.
 *
 * Each day contains:
 *   date            "2026-10-01" (city-local)
 *   representative  entry closest to midday, used for the summary card
 *   hourly          every entry for that day, used for the detail view
 *   high / low      max / min temperature across the day
 *
 * @param {Array} list            forecastResponse.list
 * @param {number} timezoneOffset forecastResponse.city.timezone (seconds)
 */
export const groupForecastByDay = (list = [], timezoneOffset = 0) => {
  const days = new Map();

  list.forEach((entry) => {
    const date = cityDateKey(entry.dt, timezoneOffset);

    if (!days.has(date)) {
      days.set(date, { date, representative: entry, hourly: [], high: -Infinity, low: Infinity });
    }

    const day = days.get(date);
    day.hourly.push(entry);
    day.high = Math.max(day.high, entry.main.temp_max);
    day.low = Math.min(day.low, entry.main.temp_min);

    const distance = Math.abs(cityHour(entry.dt, timezoneOffset) - MIDDAY);
    const bestDistance = Math.abs(cityHour(day.representative.dt, timezoneOffset) - MIDDAY);
    if (distance < bestDistance) {
      day.representative = entry;
    }
  });

  return Array.from(days.values()).slice(0, FORECAST_DAYS);
};

/**
 * Finds the first rain / snow / storm reading within the next
 * `withinHours` hours, or null if the coast is clear.
 */
export const findUpcomingPrecipitation = (list = [], withinHours = 12, now = Date.now()) => {
  const limit = now + withinHours * 60 * 60 * 1000;

  return (
    list.find((entry) => {
      const timeMs = entry.dt * 1000;
      return timeMs > now && timeMs <= limit && ALERT_CONDITIONS.includes(entry.weather[0].main);
    }) || null
  );
};

/** A short, practical tip to append to a notification. */
export const adviceForCondition = (condition) => {
  switch (condition) {
    case 'Thunderstorm':
      return 'Storms expected, so plan to stay indoors if you can.';
    case 'Rain':
    case 'Drizzle':
      return 'Bring an umbrella.';
    case 'Snow':
      return 'Dress warm and allow extra travel time.';
    case 'Clear':
      return 'Looks like a nice one.';
    default:
      return '';
  }
};

/** OpenWeatherMap icon URL. size: '' (50px), '@2x' (100px) or '@4x' (200px). */
export const iconUrl = (iconCode, size = '@2x') =>
  `https://openweathermap.org/img/wn/${iconCode}${size}.png`;
