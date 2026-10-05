/**
 * Colour palettes
 * ---------------
 * Ported directly from the CSS custom properties in the web version
 * (index.css), so both apps share the same visual identity.
 *
 * React Native has no CSS variables, so instead of a `data-theme`
 * attribute we pick one of these objects at runtime (see useTheme.js)
 * and pass its values into StyleSheet styles.
 */

export const lightTheme = {
  name: 'light',
  gradient: ['#A8D8FF', '#7EB6F6', '#A685E2'],
  textPrimary: '#1A1A2E',
  textSecondary: 'rgba(26, 26, 46, 0.7)',
  glassBg: 'rgba(255, 255, 255, 0.35)',
  glassBgStrong: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  accent: '#4361EE',
  accentText: '#FFFFFF',
  errorBg: 'rgba(255, 99, 99, 0.25)',
  errorText: '#8B0000',
  infoBg: 'rgba(67, 97, 238, 0.15)',
  tabBar: 'rgba(255, 255, 255, 0.85)',
  statusBar: 'dark',
};

export const darkTheme = {
  name: 'dark',
  gradient: ['#0F0C29', '#302B63', '#24243E'],
  textPrimary: '#F1F1F6',
  textSecondary: 'rgba(241, 241, 246, 0.7)',
  glassBg: 'rgba(255, 255, 255, 0.08)',
  glassBgStrong: 'rgba(255, 255, 255, 0.16)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  accent: '#8ECAE6',
  accentText: '#0F0C29',
  errorBg: 'rgba(255, 99, 99, 0.15)',
  errorText: '#FF9B9B',
  infoBg: 'rgba(142, 202, 230, 0.15)',
  tabBar: 'rgba(15, 12, 41, 0.92)',
  statusBar: 'light',
};

/** Shared spacing / sizing scale so screens line up consistently. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  pill: 999,
};

/**
 * Apple's Human Interface Guidelines recommend 44pt minimum touch
 * targets; Android's Material guidelines recommend 48dp. We use 44 as
 * the floor and add hitSlop where a visual element is smaller.
 */
export const MIN_TOUCH_TARGET = 44;
