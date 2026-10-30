## YYYY-MM-DD - Cache Intl.DateTimeFormat for better performance
**Learning:** `toLocaleString()` with `timeZone` options is up to 15x slower than reusing an `Intl.DateTimeFormat` object.
**Action:** Use `Intl.DateTimeFormat` directly and cache the formatter using `useMemo` when repeatedly converting dates across timezones.
