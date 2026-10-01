## 2024-10-01 - Optimize high-frequency interval loops
**Learning:** Unmemoized `Intl.DateTimeFormat` instances and synchronous native/disk I/O (`Capacitor.Plugins.PrayerWidget.updateWidget`, `localStorage.setItem`) inside high-frequency interval loops cause main thread blocking and performance bottlenecks.
**Action:** Always memoize expensive formatters and use `useRef` for dirty-checking before triggering native bridge calls or synchronous disk I/O in frequent loops.
