## YYYY-MM-DD - Modal and List Item Accessibility
**Learning:** In this application, interactive elements like search results were built using `div`s with `onClick` handlers, which break keyboard accessibility. Modals also lacked proper ARIA roles.
**Action:** Replace interactive `div` elements with semantic `button` elements to ensure automatic tab focus and proper interaction handling. Always add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` to modals, and `aria-label`s to close buttons.
