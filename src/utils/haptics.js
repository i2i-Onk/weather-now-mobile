import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback helpers
 * -----------------------
 * Small vibrations that confirm an action, following platform
 * guidelines: a light "selection" tick for toggles and taps, and a
 * success/error pattern for outcomes. Wrapped in catch() because
 * haptics aren't available on every device (or on web).
 */
export const tapFeedback = () => Haptics.selectionAsync().catch(() => {});

export const successFeedback = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

export const errorFeedback = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
