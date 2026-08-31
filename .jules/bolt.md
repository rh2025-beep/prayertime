## 2025-01-08 - Avoid `hour12: false` in `Intl.DateTimeFormat`
**Learning:** When using `Intl.DateTimeFormat` with `en-US` and `hour12: false`, midnight is formatted as `24:xx`. `new Date('... 24:xx')` fails to parse, causing an invalid date.
**Action:** Use `hourCycle: 'h23'` instead of `hour12: false` when the formatted string is intended to be parsed by `new Date()`.

## 2025-01-08 - Dirty-check Capacitor Native Calls and Local Storage
**Learning:** `localStorage.setItem` and Capacitor native calls (`Capacitor.Plugins.PrayerWidget.updateWidget`) are synchronous and slow, blocking the main thread during high-frequency loop execution.
**Action:** Use a `useRef` to stringify and cache payloads. Before executing these expensive calls, dirty-check the payload. Only write to local storage and trigger native plugins if the payload has explicitly changed.
