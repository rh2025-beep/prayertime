## 2024-05-18 - Semantic Search Results
**Learning:** Using interactive `div` elements for search results breaks keyboard navigation (tabbing) and screen reader context.
**Action:** Always convert list items with click handlers to semantic `<button type="button">` elements with explicit layout styles (`textAlign: 'left'`, `width: '100%'`).
