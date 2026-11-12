## YYYY-MM-DD - Avoid state for requestAnimationFrame values
**Learning:** Using `useState` to track high-frequency continuous events (like pointer coordinates) that are only consumed inside an active `requestAnimationFrame` loop causes continuous, expensive component re-renders and loop recreation.
**Action:** Always use `useRef` to track high-frequency event coordinates if they are only read inside a canvas/animation render loop.
