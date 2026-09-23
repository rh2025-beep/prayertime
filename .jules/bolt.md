## 2024-05-18 - Memoizing Intl.DateTimeFormat & Dirty Checking Disk I/O
**Learning:** In high-frequency 1-second interval timers, re-instantiating `Intl.DateTimeFormat` (via `toLocaleString`) and running synchronous disk I/O (`localStorage.setItem`) blocks the main thread.
**Action:** Memoize `Intl.DateTimeFormat` with `useMemo`, and use `useRef` to stringify and dirty-check state payloads before syncing with `localStorage` or Capacitor native plugins to avoid unnecessary execution.
