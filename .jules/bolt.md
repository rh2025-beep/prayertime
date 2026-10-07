## 2023-10-27 - [Optimize Widget Update Logic]
**Learning:** Avoid unthrottled sync disk I/O (`localStorage.setItem`) and native plugin calls in high-frequency interval loops (like a 1-second timer) by memoizing the payload state and performing dirty checks before execution.
**Action:** Use `useRef` to store a serialized representation of the data payload and its dependencies (`colorTheme`, `widgetStyle`). Only execute the expensive operations when the serialized payload actually changes.
