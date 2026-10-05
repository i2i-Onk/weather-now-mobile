# Weather Now — Mobile 🌤️

A React Native (Expo) weather app for iOS and Android. It is the mobile version of my
**Weather Now** web app (React + Vite), rebuilt for phones. It shows the weather where you
are using GPS, sends morning forecast and severe-weather notifications, and keeps working
offline.

Weather data comes from the [OpenWeatherMap API](https://openweathermap.org/api).

---

## Contents

1. [Purpose](#purpose)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Installation and running the app](#installation-and-running-the-app)
5. [How to use the app](#how-to-use-the-app)
6. [How to test the mobile features](#how-to-test-the-mobile-features)
7. [Project structure](#project-structure)
8. [Design decisions](#design-decisions)
9. [Mobile guidelines followed](#mobile-guidelines-followed)
10. [Development notes and challenges](#development-notes-and-challenges)
11. [Changes from the web version](#changes-from-the-web-version)
12. [Known limitations](#known-limitations)
13. [Troubleshooting](#troubleshooting)

---

## Purpose

The web version of Weather Now answers "what's the weather in this city?" On a phone, people
usually want something more immediate: "what's the weather **here**, and do I need an
umbrella today?" This app adapts the original project to that use. It finds your location
automatically, tells you about the day's weather before you ask, and still shows a forecast
when you have no signal.

---

## Features

### Carried over from the web app

- 🔍 **City search with autocomplete.** Type at least two letters to see matching places
  (debounced so it doesn't send a request on every keystroke), or press the keyboard's
  **Search** key.
- 🌡️ **Current conditions.** Temperature, description, feels-like, humidity, wind, pressure,
  and sunrise and sunset in the city's own local time.
- 📅 **5-day forecast.** Tap any day to expand a 3-hour breakdown. This uses data that's
  already loaded, so it makes no extra API calls.
- 🔄 **°C / °F toggle.** Switching re-fetches the data so the numbers are converted by the
  API, not just relabelled.
- 🌗 **Dark and light themes** with the same glassmorphism gradient look as the web app.
- ⚠️ **Specific error messages** for city not found, invalid or missing API key, and no
  connection.

### New mobile features

| Feature | What it does | Code |
| --- | --- | --- |
| 📍 **Geolocation** | Shows the weather at your GPS location when the app opens, or when you tap the navigation button. Uses the phone's geocoder to name your town. | `src/services/location.js` |
| 🔔 **Morning forecast notification** | A notification each morning at 6, 7, 8 or 9 AM (your choice) with that day's real conditions and high/low, e.g. *"Thu in Surrey, British Columbia: light rain, high 14°, low 8°. Bring an umbrella."* | `src/services/notifications.js` |
| ⛈️ **Weather alerts** | A notification one hour before rain, snow or storms are forecast in the next 12 hours. | `src/services/notifications.js` |
| 📤 **Native sharing** | Opens the phone's share sheet to send the current weather by text, WhatsApp, email, etc. | `src/app/(tabs)/index.jsx` |
| 📳 **Haptic feedback** | A light tick on taps and toggles, plus a success or error vibration after a search. | `src/utils/haptics.js` |
| 📶 **Offline support** | The last forecast is saved on the device. It appears instantly on launch and is shown with a notice when there's no connection. | `src/services/storage.js` |
| ⭐ **Saved places** | Star a place to keep it in the Saved tab for one-tap access. | `src/context/SavedPlacesContext.js` |
| 🔃 **Pull to refresh** | Pull down on the Weather tab to reload. | `src/app/(tabs)/index.jsx` |
| 🌓 **System theme** | Follows the phone's light/dark setting by default, with a manual override. | `src/hooks/useTheme.js` |
| 💾 **Remembered settings** | Unit, theme and notification choices survive app restarts. | `src/context/SettingsContext.js` |

---

## Tech stack

- **[Expo](https://expo.dev) SDK 57** with **React Native 0.86** and **React 19**
- **Expo Router** for file-based navigation with bottom tabs
- **expo-location** for GPS and reverse geocoding
- **expo-notifications** for scheduled local notifications
- **expo-haptics**, **expo-linear-gradient**, **@expo/vector-icons** (Ionicons)
- **AsyncStorage** for saving settings, saved places and the offline forecast
- **ESLint** (`eslint-config-expo`) and **Prettier** for consistent, checked code style
- **OpenWeatherMap API**: `/weather`, `/forecast` and Geocoding `/direct`

The project is written in JavaScript, like the web version.

---

## Installation and running the app

### Prerequisites

- **Node.js** version 20.19.4 or newer (the current LTS is recommended). Check with
  `node -v`.
- **One way to run the app:**
  - **Easiest:** the free **Expo Go** app on your phone
    ([iOS App Store](https://apps.apple.com/app/expo-go/id982107779) /
    [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)).
    Make sure it's up to date so it supports SDK 57.
  - **Or:** an Android emulator (Android Studio) or the iOS Simulator (Xcode, macOS only).
- A free **OpenWeatherMap API key**.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd weather-now-mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get an OpenWeatherMap API key

1. Sign up at [openweathermap.org](https://home.openweathermap.org/users/sign_up). The free
   plan is enough.
2. Open **API keys** in your account and copy your key.
3. New keys can take **up to a couple of hours** to activate. Until then the app will show
   "Invalid API key".

### 4. Add your key to a `.env` file

Copy the example file:

```bash
# macOS / Linux
cp .env.example .env

# Windows (Command Prompt)
copy .env.example .env
```

Then open `.env` and replace the placeholder:

```
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_actual_key_here
```

`.env` is listed in `.gitignore`, so your key is never committed.

> Expo only exposes variables that start with `EXPO_PUBLIC_` to the app. This is the Expo
> equivalent of Vite's `VITE_` prefix used in the web version.

### 5. Start the development server

```bash
npx expo start
```

A QR code appears in the terminal.

### 6. Open the app

- **On your phone (Expo Go):** Connect the phone to the **same Wi-Fi** as your computer.
  - **iOS:** Scan the QR code with the Camera app.
  - **Android:** Scan it from inside the Expo Go app.
- **Android emulator:** Press `a` in the terminal.
- **iOS Simulator:** Press `i` in the terminal (macOS only).

If your phone can't connect (common on school or work networks), run
`npx expo start --tunnel` instead.

### Available scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` / `npm run ios` | Start and open on an emulator or simulator |
| `npm run lint` | Check the code with ESLint |
| `npm run format` | Format all source files with Prettier |

---

## How to use the app

1. **First launch.** The app asks for location access. Choose **Allow While Using App** to see
   your local weather. If you decline, it shows the last place you viewed, or London on a
   first run, and you can search for any city.
2. **Weather tab.**
   - Search for a city at the top.
   - Tap the **navigation arrow** to return to your current location.
   - Tap the **°C/°F pill** to switch units.
   - Tap a **forecast day** to see it every 3 hours, and swipe that strip sideways.
   - Use the **star** to save the place and the **share** icon to send the weather to someone.
   - **Pull down** to refresh.
3. **Saved tab.**
   - Tap a place to view its weather.
   - Remove a place with the trash icon or a long press. You'll be asked to confirm.
4. **Settings tab.**
   - Choose **appearance** (System, Light or Dark) and **temperature unit**.
   - Turn on **Morning forecast** and pick a time.
   - Turn on **Weather alerts**.
   - The app asks for notification permission the first time you turn one of these on.

Notifications describe the place you viewed most recently, and are rebuilt every time new
weather loads.

---

## How to test the mobile features

These steps let a reviewer check each mobile feature quickly.

| Feature | How to test it |
| --- | --- |
| **Geolocation** | Allow location on first launch, then tap the navigation arrow. **Android emulator:** set a location from the **⋯ → Location** panel. **iOS Simulator:** use **Features → Location → Custom Location**. |
| **Notifications** | In **Settings**, tap **Send a test notification**, then go to the home screen. A notification arrives in about 3 seconds. |
| **Morning forecast** | Turn on **Morning forecast**. Notifications are scheduled for the next 5 mornings at the chosen time. |
| **Weather alerts** | Turn on **Weather alerts**, then search a city where rain is currently forecast. An alert is scheduled one hour before the rain. |
| **Offline mode** | Load a forecast, turn on **airplane mode**, then pull to refresh. The last forecast stays on screen with an "Offline" notice. |
| **Sharing** | Tap the share icon on the weather card. |
| **Haptics** | Tap forecast days or toggles on a physical phone. Simulators don't vibrate. |
| **System theme** | Set Appearance to **System**, then switch your phone between light and dark mode. |

---

## Project structure

```
weather-now-mobile/
├── app.json                 # App name, icons, permissions and config plugins
├── .env.example             # Template for your API key
├── eslint.config.js         # Lint rules (eslint-config-expo)
├── .prettierrc              # Formatting rules
├── assets/                  # App icon, Android adaptive icon, favicon
└── src/
    ├── app/                 # Screens (Expo Router: every file is a route)
    │   ├── _layout.jsx          # Root: providers + notification scheduler
    │   └── (tabs)/
    │       ├── _layout.jsx      # Bottom tab bar
    │       ├── index.jsx        # Weather tab (home)
    │       ├── saved.jsx        # Saved places tab
    │       └── settings.jsx     # Settings tab
    ├── components/          # Presentational UI (receive props, no fetching)
    │   ├── WeatherCard.jsx      # Current conditions (was WeatherDisplay.jsx)
    │   ├── Forecast.jsx         # 5-day forecast + hourly strip
    │   ├── SearchBar.jsx        # Debounced autocomplete search
    │   ├── UnitToggle.jsx       # °C / °F pill
    │   ├── Banner.jsx           # Error / offline messages (was ErrorMessage.jsx)
    │   ├── Screen.jsx           # Gradient background + safe-area padding
    │   ├── GlassCard.jsx        # Glass panel (was the .glass CSS class)
    │   ├── IconButton.jsx       # Accessible round icon button
    │   ├── SegmentedControl.jsx, SettingRow.jsx, SectionTitle.jsx
    ├── context/             # Shared state for all tabs
    │   ├── WeatherContext.js    # Fetching, GPS, caching, offline fallback
    │   ├── SettingsContext.js   # Persisted preferences
    │   └── SavedPlacesContext.js
    ├── hooks/
    │   ├── useTheme.js          # Active colour palette
    │   └── useNotificationSync.js # Reschedules notifications when data changes
    ├── services/            # Everything that talks to the outside world
    │   ├── weatherApi.js        # OpenWeatherMap requests + typed errors
    │   ├── location.js          # GPS + permission handling
    │   ├── notifications.js     # Scheduling local notifications
    │   └── storage.js           # AsyncStorage wrapper
    ├── theme/colors.js      # Light/dark palettes ported from index.css
    └── utils/               # Pure functions (no React, easy to test)
        ├── formatters.js        # Times, temperatures, labels
        ├── forecast.js          # Grouping by day, rain detection
        └── haptics.js
```

---

## Design decisions

- **Same layering as the web app, split more clearly.** In the web version, `useWeather.js`
  did both the fetching and the state. Here, network code lives in `services/`, shared state
  lives in `context/`, and `components/` only render props. Screens in `app/` just connect the
  two. Each file has one job, which made the move to mobile easier to reason about.
- **Context instead of one hook.** The web app was one page. The mobile app has three tabs
  that need the same data: the Weather tab shows it, the Saved tab changes it, and
  notifications are built from it. React Context shares it without passing props through
  every screen.
- **Local notifications instead of remote push.** Remote push needs a server to send
  messages. The app already holds a 5-day forecast, so it can schedule accurate notifications
  on the device itself. They still arrive when the app is closed, and the schedule is rebuilt
  every time fresh data loads, so they're never stale.
- **Coordinates everywhere.** Saved places, GPS lookups and autocomplete picks all fetch by
  latitude and longitude. This keeps the web version's fix for same-named cities, such as the
  two Vancouvers.
- **Translucency without blur.** CSS `backdrop-filter` blur is expensive on phone GPUs,
  especially inside scrolling lists on Android. The glass look is kept with semi-transparent
  colours and borders. The web version's animated background gradient was also dropped to
  save battery.
- **Formatting times by hand.** Times are calculated from UTC timestamps and the city's
  offset using `getUTCHours()`, so they come out identical on iOS, Android and web. `Intl`
  time-zone support varies between JavaScript engines.

---

## Mobile guidelines followed

These follow Apple's Human Interface Guidelines and Google's Material Design guidelines.

- **Navigation:** A bottom tab bar, the standard top-level pattern on both platforms, within
  thumb reach.
- **Touch targets:** Every tappable element is at least 44×44 pt (`MIN_TOUCH_TARGET` in
  `theme/colors.js`).
- **Safe areas:** Content is padded clear of the notch, Dynamic Island and status bar.
- **Permissions in context:**
  - Location is requested "while using the app" only, never in the background, with a clear
    purpose message in `app.json`.
  - Notification permission is requested only when the user turns a notification on.
  - If permission was previously denied, the app explains why it's needed and offers an
    **Open settings** button.
- **Keyboard:** The return key reads **Search**. Tapping a suggestion dismisses the keyboard.
  Dragging the list also dismisses it, and taps on suggestions work while it's open.
- **Destructive actions are confirmed** with a native alert before a saved place is removed.
- **Feedback:** Haptics, pull to refresh, loading indicators, and dimming old content while
  new data loads instead of blanking the screen.
- **Accessibility:** Icon-only buttons have screen-reader labels. Toggles report their state.
  Forecast cards read out a full sentence. Banners are announced when they appear.
- **System integration:** The app follows the system dark/light setting, uses the native
  share sheet, and creates an Android notification channel that users can control in system
  settings.
- **Resilience on mobile networks:** Requests time out after 10 seconds, and there's an
  offline cache.

---

## Development notes and challenges

**Porting CSS to React Native.** React Native has no CSS files, class names or CSS variables.
I converted the web app's theme variables from `index.css` into two JavaScript palettes in
`theme/colors.js`, and `useTheme()` picks one at runtime. This replaces the web version's
`data-theme` attribute.

**The dropdown problem.** The web search used an absolutely positioned dropdown that closed
on outside clicks. On a phone, a floating dropdown can be hidden behind the keyboard, and
"click outside" doesn't exist. I render suggestions inline below the input instead. Using
`keyboardShouldPersistTaps="handled"` on the scroll view lets the first tap select a
suggestion rather than just closing the keyboard.

**Out-of-order responses.** On slow mobile data, results for "Lo" can arrive after results
for "London" and overwrite them. Both the search suggestions and the weather lookups now
track the latest request and ignore older responses.

**A timezone bug found while porting.** The web version grouped forecast days using
`dt_txt`, which is in UTC. For a city at UTC-7 like Vancouver, readings from 5 PM onward were
counted as the next day. The mobile version groups by the city's own local date, and picks
each day's summary from the reading closest to local midday.

**Keeping notifications accurate.** A scheduled notification's text is fixed when it's
scheduled, so a repeating "daily" notification would always say the same thing. The app
schedules one notification per forecast day with that day's real data, and
`useNotificationSync` rebuilds the schedule whenever new weather loads or a setting changes.

**Launch without a blank screen.** The app shows the cached forecast immediately, refreshes
it quietly in the background, and only shows an "Offline" notice if that refresh fails.
Getting this order right meant tracking a separate "refreshing" state alongside "loading".

**Following React's current rules.** ESLint flagged that I was changing state inside a
`useEffect` to re-fetch after a unit change. I replaced it with a `changeUnit()` action that
updates the setting and re-fetches in one step. This is the same approach as
`handleUnitToggle` in the web app, and it avoids an extra render.

**Dependency versions.** Expo releases change APIs often, so all packages were installed with
`npx expo install` to get versions matched to SDK 57. `react-dom` is pinned to the exact
version Expo expects, because a newer one causes a peer-dependency conflict during
`npm install`.

---

## Changes from the web version

| Web (React + Vite) | Mobile (React Native + Expo) |
| --- | --- |
| Opens on London | Opens on your GPS location, or the last place viewed |
| Single page | Bottom tabs: Weather, Saved, Settings |
| `<div>`, `<button>`, CSS files | `<View>`, `<Pressable>`, `StyleSheet` |
| `VITE_OPENWEATHER_API_KEY` | `EXPO_PUBLIC_OPENWEATHER_API_KEY` |
| Theme resets on reload | Theme, unit and notification settings are saved |
| No offline support | Last forecast cached on the device |
| Forecast cards show a midday reading | Forecast cards show the day's high and low |
| Hourly detail as a vertical list | Swipeable hourly strip with chance of rain |
| Forecast grouped by UTC date | Forecast grouped by the city's local date |
| Weather-station names could replace the town | Phone's geocoder names your GPS location |
| None | Notifications, sharing, haptics, saved places |

---

## Known limitations

- Notifications are rebuilt whenever the app loads new weather. If the app isn't opened for
  more than 5 days, the scheduled notifications run out, because the free API only forecasts
  5 days ahead.
- Notifications use the place viewed most recently, not always your GPS location.
- `EXPO_PUBLIC_` variables are bundled into the app, so the API key is visible to anyone who
  inspects the build. The same is true of the web version. A production app would call the
  API through its own backend.
- Haptics only work on physical devices. Notifications and geolocation are best tested on a
  real phone.
- The OpenWeatherMap free tier limits how many requests can be made per minute.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Missing API key" | Make sure `.env` is in the project root and uses `EXPO_PUBLIC_OPENWEATHER_API_KEY`. Then stop Expo and restart it with `npx expo start --clear`. |
| "Invalid API key" | New keys can take a couple of hours to activate. Double-check that you copied the whole key. |
| Phone can't connect to Expo | Put the phone and computer on the same Wi-Fi, or run `npx expo start --tunnel`. |
| Expo Go says the project is incompatible | Update Expo Go from the app store so it supports SDK 57. |
| `npm install` fails with ERESOLVE | Delete `node_modules` and `package-lock.json`, then run `npm install` again. Keep `react-dom` at the version in `package.json`. |
| No notification arrives | Check that notifications are allowed for Expo Go (or Weather Now) in your phone settings. On Android, check that the "Forecast and weather alerts" channel is enabled. |
| Location always shows London | Location permission was denied. Enable it in phone settings, then tap the navigation arrow. |

---

## Credits

- Weather data and icons: [OpenWeatherMap](https://openweathermap.org)
- Icons: [Ionicons](https://ionic.io/ionicons) via `@expo/vector-icons`
- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
