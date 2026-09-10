## 2025-02-23 - Prevent blocking main thread in high-frequency interval loops
**Learning:** High-frequency interval loops (e.g., the 1-second timer in App.jsx) can block the main thread and cause jitter if they perform expensive operations like recreating `Intl.DateTimeFormat` dynamically or executing synchronous disk I/O (`localStorage.setItem`) without dirty-checking.
**Action:** Always memoize expensive formatters and use `useRef` to dirty-check state before committing synchronous I/O or native Capacitor calls inside high-frequency intervals.
