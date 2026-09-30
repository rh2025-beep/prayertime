## 2024-05-18 - Avoid main thread blocking from Intl.DateTimeFormat in interval
**Learning:** In a React application, calling `.toLocaleString` with complex options like `timeZone` inside a high-frequency (like a `useEffect` on `currentTime` that changes every second) can block the main thread unnecessarily and consume excessive CPU/memory.
**Action:** Memoize the `Intl.DateTimeFormat` formatter instance (using `useMemo` or a module-level variable) when dealing with frequent time-formatting operations, instead of instantiating it repeatedly within the interval.
