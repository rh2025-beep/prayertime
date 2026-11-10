## 2026-11-09 - Memoize Intl.DateTimeFormat
**Learning:** Using `Date.prototype.toLocaleString()` with timezone options inside frequent intervals or renders is very slow (takes ~1.6s for 10k iterations). Using a cached `Intl.DateTimeFormat` instance with `hourCycle: 'h23'` is ~35x faster.
**Action:** Always memoize `Intl.DateTimeFormat` instances for time zone formatting, especially inside frequent timers or render functions.
