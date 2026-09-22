## 2023-10-25 - Prevent frequent Capacitor bridge and localStorage syncs
**Learning:** High-frequency interval loops trigger synchronous `localStorage.setItem` and native `Capacitor.Plugins.PrayerWidget.updateWidget` calls unnecessarily when the payload hasn't actually changed, causing main thread blocking and performance drops.
**Action:** Use `useRef` to dirty-check stringified payloads (including state variables passed to the plugin) to prevent redundant syncs in intervals.
