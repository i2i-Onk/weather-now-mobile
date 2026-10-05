import { useEffect } from 'react';

import { useSettings } from '../context/SettingsContext';
import { useWeather } from '../context/WeatherContext';
import { syncForecastNotifications } from '../services/notifications';

/**
 * useNotificationSync
 * -------------------
 * Keeps scheduled notifications in step with the app. Whenever new
 * forecast data arrives, or the user changes a notification setting,
 * the schedule is rebuilt so notifications always describe the latest
 * forecast for the place the user viewed most recently.
 *
 * Mounted once, in the root layout.
 */
export default function useNotificationSync() {
  const { forecastDays, forecastList, timezone, location } = useWeather();
  const { settings } = useSettings();
  const { dailyForecast, dailyForecastHour, weatherAlerts } = settings;

  useEffect(() => {
    if (!location) return;

    syncForecastNotifications({
      forecastDays,
      forecastList,
      timezone,
      placeLabel: location.label,
      settings: { dailyForecast, dailyForecastHour, weatherAlerts },
    });
  }, [
    forecastDays,
    forecastList,
    timezone,
    location,
    dailyForecast,
    dailyForecastHour,
    weatherAlerts,
  ]);
}
