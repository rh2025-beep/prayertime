## YYYY-MM-DD - [Interactive Divs to Semantic Buttons]
**Learning:** Interactive `div` elements with `onClick` handlers lack native keyboard navigation and proper accessibility roles. Converting them to `<button>` elements (e.g., search results lists) automatically fixes tab-focusability and screen-reader support without adding extra ARIA roles.
**Action:** Always prefer native semantic `<button>` elements for interactive UI components over `div` elements to ensure robust out-of-the-box accessibility.
