## 2024-09-25 - Prevent main-thread blocking in high-frequency interval loops
**Learning:** In high-frequency interval loops (e.g., the 1-second timer in App.jsx), recreating `Intl.DateTimeFormat` dynamically and performing synchronous disk I/O (`localStorage.setItem`) or Capacitor native calls on every tick can block the main thread and cause performance bottlenecks.
**Action:** Memoize expensive formatters (like `Intl.DateTimeFormat`) and dirty-check synchronous disk I/O or Capacitor native calls using `useRef` to ensure they only run when the actual payload changes.
