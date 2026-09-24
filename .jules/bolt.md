## 2024-05-24 - Memoize DateTimeFormat and throttle synchronous disk I/O
**Learning:** In high-frequency loops like a 1-second interval, creating `Intl.DateTimeFormat` instances and writing to `localStorage` synchronously can block the main thread and degrade performance.
**Action:** Always memoize expensive formatters using `useMemo` and dirty-check synchronous disk I/O and Capacitor native calls using `useRef` to prevent unnecessary execution.
