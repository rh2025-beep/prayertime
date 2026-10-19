## YYYY-MM-DD - Optimize high-frequency render loops
**Learning:** In high-frequency React interval loops (e.g., a 1-second timer updating the current time), unoptimized synchronous disk I/O (`localStorage.setItem`), Capacitor native plugin calls, and expensive operations like `Intl.DateTimeFormat` instantiation can block the main thread and cause UI jitter.
**Action:** Use `useRef` to dirty-check stringified payloads (including state variables) before triggering expensive external syncs, and memoize `Intl.DateTimeFormat` instantiation guarded by `try-catch`.
