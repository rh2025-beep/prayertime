## 2026-09-20 - Intl.DateTimeFormat Instantiation in Hot Loops
**Learning:** Instantiating `Intl.DateTimeFormat` dynamically inside high-frequency loops (e.g. 1-second interval timers used for countdowns) is notoriously slow in JS and can block the main thread, leading to jittery UI and performance degradation on low-end devices.
**Action:** Always memoize `Intl.DateTimeFormat` objects with `useMemo` when options (like timezone) depend on state, and reuse the `.format()` method instead of repeatedly calling `new Date(toLocaleString("...", { timeZone }))`.
