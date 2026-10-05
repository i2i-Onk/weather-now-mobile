/**
 * Formatting helpers
 * ------------------
 * Pure functions with no React or network code, so they are easy to
 * reason about and reuse across components.
 *
 * Why format times by hand instead of using toLocaleTimeString?
 * OpenWeatherMap returns UTC timestamps plus the city's UTC offset in
 * seconds. We add the offset and then read the clock back out "as UTC"
 * (same idea as the web version's sunrise/sunset fix). Doing this with
 * getUTCHours() gives identical results on iOS, Android and web, whereas
 * Intl time-zone support differs between JavaScript engines.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Shifts a UTC unix timestamp (seconds) into a Date whose UTC fields read as the city's local time. */
const toCityClock = (unixSeconds, timezoneOffset = 0) =>
  new Date((unixSeconds + timezoneOffset) * 1000);

/** 7, 0 -> "7:00 AM" style formatting from 24-hour parts. */
const formatClock = (hours24, minutes, { showMinutes = true } = {}) => {
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  if (!showMinutes) return `${hours12} ${period}`;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
};

/** City-local "6:42 AM" — used for sunrise and sunset. */
export const formatCityTime = (unixSeconds, timezoneOffset) => {
  const date = toCityClock(unixSeconds, timezoneOffset);
  return formatClock(date.getUTCHours(), date.getUTCMinutes());
};

/** City-local "3 PM" — used in the hourly forecast breakdown. */
export const formatCityHour = (unixSeconds, timezoneOffset) => {
  const date = toCityClock(unixSeconds, timezoneOffset);
  return formatClock(date.getUTCHours(), 0, { showMinutes: false });
};

/** City-local calendar date key, e.g. "2026-10-01". Used to group forecast entries by day. */
export const cityDateKey = (unixSeconds, timezoneOffset) =>
  toCityClock(unixSeconds, timezoneOffset).toISOString().slice(0, 10);

/** City-local hour of day (0-23). */
export const cityHour = (unixSeconds, timezoneOffset) =>
  toCityClock(unixSeconds, timezoneOffset).getUTCHours();

/** "2026-10-01" -> "Thu" */
export const weekdayFromDateKey = (dateKey) =>
  WEEKDAYS[new Date(`${dateKey}T00:00:00Z`).getUTCDay()];

/** Time on the DEVICE's own clock, e.g. when cached data was saved. */
export const formatDeviceTime = (timestampMs) => {
  const date = new Date(timestampMs);
  return formatClock(date.getHours(), date.getMinutes());
};

/** Hour option label for settings, e.g. 8 -> "8 AM". */
export const formatHourOption = (hour24) => formatClock(hour24, 0, { showMinutes: false });

export const degreeSymbol = (unit) => (unit === 'imperial' ? '°F' : '°C');

export const formatTemp = (value, unit) => `${Math.round(value)}${degreeSymbol(unit)}`;

/** Short form without the C/F letter, used in tight spaces like forecast cards. */
export const formatTempShort = (value) => `${Math.round(value)}°`;

export const formatWind = (speed, unit) =>
  `${Math.round(speed * 10) / 10} ${unit === 'imperial' ? 'mph' : 'm/s'}`;

/**
 * Human-readable place label from a geocoding result, e.g.
 * "Surrey, British Columbia" or "London, GB" when there is no state.
 */
export const formatPlaceLabel = ({ name, state, country }) =>
  state ? `${name}, ${state}` : `${name}, ${country}`;

/** "light rain" -> "Light rain" */
export const capitalize = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);
