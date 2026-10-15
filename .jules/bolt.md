## 2024-10-15 - Optimizing Capacitor Widget Calls
**Learning:** Native Capacitor plugin calls (and disk I/O like localStorage) in frequent React useEffect hooks (like timers ticking every second) can cause severe main thread blocking and jank. The widget sync effect runs every second because it depends on `timeLeft` and `progressPercent`.
**Action:** Dirty-check synchronous disk I/O (`localStorage.setItem`) and Capacitor native calls using a `useRef` to store the last stringified payload and only invoke native/disk APIs when the payload has actually changed.
