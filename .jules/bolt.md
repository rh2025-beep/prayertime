## YYYY-MM-DD - [Use useRef instead of useState for high-frequency continuous events]
**Learning:** [In React components, tracking high-frequency events like \`onPointerMove\` with \`useState\` causes severe performance degradation due to continuous re-renders and restarting effects when the state is only needed inside an active \`requestAnimationFrame\` loop.]
**Action:** [Always use \`useRef\` instead of \`useState\` to track high-frequency continuous events if the values are only consumed inside an active \`requestAnimationFrame\` loop to avoid unnecessary re-renders.]
