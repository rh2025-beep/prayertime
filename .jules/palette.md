## YYYY-MM-DD - Semantic Button Elements for List Items

**Learning:** When creating interactive lists or search results in React, using `div` elements with `onClick` handlers creates an accessibility trap by preventing keyboard users (using the Tab key) from focusing the elements and screen readers from identifying them as interactive.
**Action:** Always use semantic `<button type="button">` elements instead of `div` elements for clickable list items. This inherently provides proper focus states, keyboard interaction (Enter/Space), and screen reader support while allowing custom styling (e.g., `textAlign: 'left'`, `width: '100%'`, `color: 'inherit'`) to preserve the layout.
