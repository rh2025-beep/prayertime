## 2024-10-11 - Optimize timezone date instantiation

**Learning:** When dealing with variable timezone dates using `Intl.DateTimeFormat`, instantiating the formatter repeatedly within a high-frequency interval or `useEffect` loop can be a performance bottleneck and can cause blocking if it fails.

**Action:** Memoize the `Intl.DateTimeFormat` instance based on the `metaInfo` dependency so that it is only recreated when the configuration changes. When formatting the current time, rely on this memoized instance rather than repeatedly creating `Date` objects and formatters. Note that the memory dictates to guard formatting calls against null formatters, and use `hourCycle: 'h23'` to avoid issues where midnight is incorrectly represented as `24:xx`.
