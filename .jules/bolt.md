## YYYY-MM-DD - [Dirty Check Sync Optimization]
**Learning:** High-frequency loop triggers caused `localStorage.setItem` and native Capacitor plugin syncs to run on every 1-second interval, blocking the main thread, even when the payload properties hadn't changed.
**Action:** Add a dirty-check wrapper using `useRef` stringification to prevent redundant sync executions and I/O.
