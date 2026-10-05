import * as Location from 'expo-location';

/**
 * location
 * --------
 * Wraps expo-location (device GPS). Follows the platform guidelines for
 * permissions: we only ask for "while using the app" access (never
 * background), and only at the moment the feature is used, with a
 * purpose string configured in app.json.
 */

export class LocationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'LocationError';
    this.code = code; // 'permission-denied' | 'services-off' | 'unavailable'
  }
}

/**
 * Turns coordinates into a friendly name like "Surrey, British Columbia"
 * using the phone's built-in geocoder. This also solves the issue from
 * the web version where OpenWeatherMap labels results with the nearest
 * weather station's name instead of the actual town.
 */
const describeCoords = async (latitude, longitude) => {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!place) return null;

    const town = place.city || place.subregion || place.district;
    const area = place.region || place.country;
    if (town && area) return `${town}, ${area}`;
    return town || area || null;
  } catch {
    return null; // Some platforms (e.g. web) don't support reverse geocoding.
  }
};

/**
 * Asks for permission if needed, then returns the device's position.
 * @returns {Promise<{ lat: number, lon: number, label: string|null }>}
 */
export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationError(
      'Location permission is off. Enable it in your phone settings, or search for a city instead.',
      'permission-denied'
    );
  }

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    throw new LocationError(
      'Location services are turned off. Turn them on, or search for a city instead.',
      'services-off'
    );
  }

  try {
    // City-level accuracy is plenty for weather and is faster and more
    // battery-friendly than the high-accuracy GPS mode.
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const label = await describeCoords(coords.latitude, coords.longitude);
    return { lat: coords.latitude, lon: coords.longitude, label };
  } catch {
    throw new LocationError('Could not find your location. Try again in a moment.', 'unavailable');
  }
};
