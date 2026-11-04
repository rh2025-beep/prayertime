## YYYY-MM-DD - Semantic Buttons for Search Results
**Learning:** Interactive `div` elements used for list items (like search results) prevent keyboard navigation and lack proper screen reader context.
**Action:** Always convert them to `<button type="button">` and apply `width: '100%', textAlign: 'left', color: 'inherit'` to retain visual styling while gaining free accessibility benefits.
