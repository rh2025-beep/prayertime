## 2024-05-20 - Memoizing Intl.DateTimeFormat
**Learning:** `toLocaleString` or `Intl.DateTimeFormat` without memoization in a high-frequency (1s) loop blocks the main thread. Also dirty-checking disk I/O in the 1s loop timer (`localStorage.setItem`) when variables like `timeLeft` change every second affects performance.
**Action:** Memoize the expensive formatter when formatting dates for parsing, and ensure default hour cycle so `new Date()` correctly parses it. Also, throttle/dirty-check synchronous updates or memoize `Intl.DateTimeFormat` if it executes frequently.
