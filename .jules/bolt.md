## 2024-05-18 - Expensive toLocaleString in rendering/intervals
**Learning:** Calling `new Date(now.toLocaleString('en-US', { timeZone: '...' }))` is extremely expensive (~0.2ms per call). Calling it inside a `setInterval` running every 1 second or directly within a component's render method causes unnecessary CPU overhead.
**Action:** Calculate the timezone offset in milliseconds using `useMemo` when the target timezone changes, and simply add the offset (`now.getTime() + tzOffsetMs`) during render or high-frequency intervals.
