import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loadSavedPlaces, savePlaces } from '../services/storage';

/**
 * SavedPlacesContext
 * ------------------
 * The user's bookmarked locations (a new feature for the mobile app),
 * persisted on the device. Places are stored by coordinates so opening
 * one is always unambiguous.
 */

const SavedPlacesContext = createContext(null);

/** Two places within ~1km of each other count as the same place. */
export const placeId = ({ lat, lon }) => `${lat.toFixed(2)},${lon.toFixed(2)}`;

export function SavedPlacesProvider({ children }) {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    loadSavedPlaces().then(setPlaces);
  }, []);

  const persist = useCallback((updater) => {
    setPlaces((previous) => {
      const next = updater(previous);
      savePlaces(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (location) => Boolean(location) && places.some((place) => place.id === placeId(location)),
    [places]
  );

  const removePlace = useCallback(
    (id) => persist((previous) => previous.filter((place) => place.id !== id)),
    [persist]
  );

  /** Adds the place if it isn't saved yet, removes it if it is. Returns true if now saved. */
  const toggleSaved = useCallback(
    (location) => {
      const id = placeId(location);
      const alreadySaved = places.some((place) => place.id === id);

      persist((previous) =>
        alreadySaved
          ? previous.filter((place) => place.id !== id)
          : [...previous, { id, label: location.label, lat: location.lat, lon: location.lon }]
      );
      return !alreadySaved;
    },
    [places, persist]
  );

  const value = useMemo(
    () => ({ places, isSaved, toggleSaved, removePlace }),
    [places, isSaved, toggleSaved, removePlace]
  );

  return <SavedPlacesContext.Provider value={value}>{children}</SavedPlacesContext.Provider>;
}

export function useSavedPlaces() {
  const context = useContext(SavedPlacesContext);
  if (!context) throw new Error('useSavedPlaces must be used inside <SavedPlacesProvider>.');
  return context;
}
