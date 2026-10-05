import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { adviceForCondition, findUpcomingPrecipitation } from '../utils/forecast';
import {
  capitalize,
  cityDateKey,
  formatCityHour,
  formatTempShort,
  weekdayFromDateKey,
} from '../utils/formatters';

/**
 * notifications
 * -------------
 * Two kinds of LOCAL notifications, scheduled on the device:
 *
 *   1. Morning forecast: one per forecast day at the hour the user picks
 *      (e.g. 8 AM), containing that day's real conditions and high/low.
 *   2. Weather alert: a heads-up one hour before rain, snow or a storm
 *      is forecast in the next 12 hours.
 *
 * Why local instead of remote push? Remote push requires a backend
 * server to send messages. Since this app already holds the full 5-day
 * forecast, it can schedule accurate notifications itself, and they
 * still arrive when the app is closed. Every time fresh weather is
 * fetched, the schedule is rebuilt so it never goes stale.
 */

/**
 * Since SDK 53, merely importing expo-notifications inside Expo Go on
 * Android throws (its push-token auto-registration runs on import), which
 * crashes the whole app. So we only load the module where it works, and
 * every function below quietly does nothing when it isn't available.
 * In a development build or a real install, notifications work normally.
 */
export const notificationsSupported = !(Platform.OS === 'android' && isRunningInExpoGo());

const Notifications = notificationsSupported ? require('expo-notifications') : null;

const CHANNEL_ID = 'forecast';
const ID_PREFIX = 'weathernow-';
const DAILY_ID = (index) => `${ID_PREFIX}daily-${index}`;
const ALERT_ID = `${ID_PREFIX}alert`;
const ONE_HOUR_MS = 60 * 60 * 1000;
const MIN_LEAD_MS = 60 * 1000;

/**
 * Must run once at startup (see app/_layout.jsx). Controls how
 * notifications look when they arrive while the app is open, and
 * creates the Android notification channel (required on Android 8+).
 */
export const configureNotifications = async () => {
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Forecast and weather alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
};

/** Asks the OS for permission. Returns true if notifications are allowed. */
export const requestNotificationPermission = async () => {
  if (!Notifications) return false;

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

const hasPermission = async () => (await Notifications.getPermissionsAsync()).granted;

/** Cancels only THIS app's scheduled notifications (identified by prefix). */
const cancelOurNotifications = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(ID_PREFIX))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier))
  );
};

const scheduleAt = (identifier, date, content) =>
  Notifications.scheduleNotificationAsync({
    identifier,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_ID,
    },
  });

/** Builds the morning summary for one forecast day. */
const buildDailyContent = (day, placeLabel) => {
  const { description, main } = day.representative.weather[0];
  const advice = adviceForCondition(main);
  const temps = `high ${formatTempShort(day.high)}, low ${formatTempShort(day.low)}`;

  return {
    title: `${weekdayFromDateKey(day.date)} in ${placeLabel}`,
    body: `${capitalize(description)}, ${temps}. ${advice}`.trim(),
  };
};

const scheduleDailyForecasts = async ({ forecastDays, timezone, placeLabel, hour }) => {
  const now = Date.now();

  for (let offset = 0; offset < forecastDays.length; offset += 1) {
    const deliverAt = new Date();
    deliverAt.setDate(deliverAt.getDate() + offset);
    deliverAt.setHours(hour, 0, 0, 0);
    if (deliverAt.getTime() < now + MIN_LEAD_MS) continue;

    // Which calendar day is it IN THE CITY at the moment we deliver?
    const cityDate = cityDateKey(Math.floor(deliverAt.getTime() / 1000), timezone);
    const day = forecastDays.find((candidate) => candidate.date === cityDate);
    if (!day) continue;

    await scheduleAt(DAILY_ID(offset), deliverAt, buildDailyContent(day, placeLabel));
  }
};

const scheduleWeatherAlert = async ({ forecastList, timezone, placeLabel }) => {
  const upcoming = findUpcomingPrecipitation(forecastList, 12);
  if (!upcoming) return;

  // Warn one hour ahead. If it's sooner than that, skip: the user just
  // opened the app and can already see it on screen.
  const deliverAt = new Date(upcoming.dt * 1000 - ONE_HOUR_MS);
  if (deliverAt.getTime() < Date.now() + MIN_LEAD_MS) return;

  const { description, main } = upcoming.weather[0];
  const headline = main === 'Thunderstorm' ? 'Storms' : main; // "Rain", "Snow", "Drizzle"
  await scheduleAt(ALERT_ID, deliverAt, {
    title: `${headline} on the way in ${placeLabel}`,
    body: `${capitalize(description)} expected around ${formatCityHour(upcoming.dt, timezone)}. ${adviceForCondition(main)}`.trim(),
  });
};

/**
 * Rebuilds the full notification schedule from the latest forecast.
 * Safe to call often: it always clears the previous schedule first.
 */
export const syncForecastNotifications = async ({
  forecastDays,
  forecastList,
  timezone,
  placeLabel,
  settings,
}) => {
  if (!Notifications) return;

  try {
    await cancelOurNotifications();

    const wantsAny = settings.dailyForecast || settings.weatherAlerts;
    if (!wantsAny || !forecastDays.length || !(await hasPermission())) return;

    if (settings.dailyForecast) {
      await scheduleDailyForecasts({
        forecastDays,
        timezone,
        placeLabel,
        hour: settings.dailyForecastHour,
      });
    }
    if (settings.weatherAlerts) {
      await scheduleWeatherAlert({ forecastList, timezone, placeLabel });
    }
  } catch {
    // Notification scheduling isn't supported on every platform (e.g. web).
    // The rest of the app keeps working without it.
  }
};

/** Fires a sample of today's forecast notification in 3 seconds, for testing. */
export const sendTestNotification = async ({ current, unit, placeLabel }) => {
  if (!Notifications) return;

  const { description, main } = current.weather[0];
  const symbol = unit === 'imperial' ? '°F' : '°C';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Right now in ${placeLabel}`,
      body: `${capitalize(description)}, ${Math.round(current.main.temp)}${symbol}. ${adviceForCondition(main)}`.trim(),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: CHANNEL_ID,
    },
  });
};
