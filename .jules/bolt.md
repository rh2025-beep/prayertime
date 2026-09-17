## 2024-05-24 - Memoize Formatting & Dirty-Check Sync Storage in React Loops
**Learning:** In high-frequency interval loops (e.g., a 1-second timer in React), doing synchronous disk I/O (like `localStorage.setItem`) and instantiating expensive formatters (`Intl.DateTimeFormat`) on every render blocks the main thread.
**Action:** Always memoize expensive formatters using `useMemo` and dirty-check synchronous operations using `useRef` to avoid unnecessary writes.
