## YYYY-MM-DD - [Prevent redundant synchronous disk I/O and native bridge calls in high-frequency React hooks]
**Learning:** High-frequency timers can trigger `useEffect`s frequently. If those effects do synchronous disk I/O (`localStorage.setItem`) or native bridge calls (`Capacitor.Plugins.Preferences.set`), it can block the main thread and cause jank.
**Action:** Always dirty-check the payload using `useRef` to ensure native/storage calls are only made when the data actually changes.
