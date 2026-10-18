## YYYY-MM-DD - [Preventing Unnecessary Capacitor Native Calls]
**Learning:** High-frequency intervals (like a 1-second timer) triggering `useEffect` can cause severe main-thread blocking if they perform un-memoized synchronous disk I/O (`localStorage.setItem`) and cross-bridge Capacitor native calls (`Capacitor.Plugins.PrayerWidget.updateWidget`).
**Action:** Use `useRef` to stringify and dirty-check complex payloads and related independent states before triggering native updates or disk writes.
