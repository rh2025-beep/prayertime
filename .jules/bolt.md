## 2023-10-24 - Prevent Unnecessary Native Calls & Disk I/O in 1-Second Timer

**Learning:** Capacitor native plugin calls and synchronous `localStorage` writes triggered by `useEffect` hooks depending on fast-changing values (like a 1-second interval `timeLeft`) cause severe main-thread blocking and battery drain, even if the actual payload being written only changes every minute.
**Action:** Implement dirty-checking using `useRef` to compare stringified payloads before invoking expensive operations. Always include all independent parameters (like `colorTheme` and `widgetStyle`) in the check to prevent state sync regressions.
