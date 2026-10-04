## YYYY-MM-DD - Intl.DateTimeFormat Memoization
**Learning:** Calling `toLocaleString()` with timezone options inside frequent renders or high-frequency loops (like a 1-second interval) creates a new `Intl.DateTimeFormat` instance every time, which is highly inefficient and blocks the main thread.
**Action:** Memoize `Intl.DateTimeFormat` using `useMemo` or hoist it outside of loops, and use `.format(date)` instead. Always wrap dynamic timezone instantiations in a try-catch to prevent crashes.
