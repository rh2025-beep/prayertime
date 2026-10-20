## YYYY-MM-DD - [Interactive List Accessibility]
**Learning:** Converting interactive `div` elements with `onClick` handlers to semantic `<button>` elements (with reset styles) dramatically improves keyboard navigation and screen reader support without requiring complex `tabIndex` and keyboard event listener management.
**Action:** Always prefer semantic HTML elements like `<button>` over interactive `div`s for list items or search results that trigger actions. Ensure custom styles reset default button appearances while preserving focus indicators.
