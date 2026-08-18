## 2024-05-18 - Memoizing Intl.DateTimeFormat

**Learning:** Repeatedly calling `date.toLocaleString("en-US", { timeZone: "..." })` inside high-frequency execution paths (like React renders or `setInterval` ticking timers) causes significant performance degradation because it instantiates a new `Intl.DateTimeFormat` object on every call under the hood.

**Action:** Extract and memoize `Intl.DateTimeFormat` instances (e.g., using a small singleton cache keyed by timezone) when repeatedly formatting dates for a specific timezone, then use `formatter.format(date)`. Ensure the cache state is updated only after successful instantiation to prevent bad values from getting stuck on errors.
