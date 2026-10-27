## 2024-05-19 - [Optimize Pointer Tracking in Animation Loop]
**Learning:** Using React `useState` to track high-frequency continuous events (like `onPointerMove`) that are only consumed inside an active `requestAnimationFrame` loop causes severe performance degradation due to unnecessary component re-renders on every mouse pixel movement.
**Action:** Always use `useRef` instead of `useState` for values that are rapidly updated by events but only read continuously within an isolated animation loop, as mutations to a ref bypass React's render cycle completely.
