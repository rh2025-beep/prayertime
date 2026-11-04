## YYYY-MM-DD - Caching Intl.DateTimeFormat
**Learning:** `Date.prototype.toLocaleString()` with timeZone options is extremely slow in JavaScript, especially when called repeatedly in rendering loops or frequent intervals.
**Action:** Use a memoized `Intl.DateTimeFormat` instance instead. Note that when caching for programmatic date parsing (`new Date(formatter.format(date))`), you must use `hourCycle: 'h23'` rather than `hour12: false` with the `en-US` locale to prevent midnight from formatting as `24:xx:xx`, which leads to an 'Invalid Date' error.
