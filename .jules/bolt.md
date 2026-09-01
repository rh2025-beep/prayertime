## 2026-09-01 - Intl.DateTimeFormat Memoization

**Learning:** `new Date(currentTime.toLocaleString(...))` is a major performance bottleneck when called in high-frequency loops (like a 1-second interval or frequent render cycles). Re-instantiating formatting parameters or `Intl.DateTimeFormat` continuously blocks the main thread.
**Action:** Memoize `Intl.DateTimeFormat` configurations using `useMemo` or refs, and use `.format()` instead. When doing so for date parsing, always use `hourCycle: 'h23'` instead of `hour12: false` to avoid standard 24h midnight parser crashes (`24:xx:xx`).
