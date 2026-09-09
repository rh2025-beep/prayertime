## 2026-09-09 - Intl.DateTimeFormat caching
**Learning:** Calling `toLocaleString()` with a timezone string inside a high-frequency interval or render loop (like the 1-second timer or render body) is very expensive because it instantiates a new Intl formatter every time. In this application, it blocks the main thread.
**Action:** Memoize `Intl.DateTimeFormat` instances using `useMemo` and reuse them to format dates within the render loop or interval, which yields >20x performance improvement.
