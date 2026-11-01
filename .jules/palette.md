## YYYY-MM-DD - Search Result Buttons

**Learning:** Interactive `div` elements used for displaying lists of selectable items (like search results) break keyboard navigation and screen reader tab flow.
**Action:** Always convert interactive `onClick` `div`s to semantic `<button type="button">` elements. Add inline styles `{textAlign: 'left', width: '100%', color: 'inherit'}` to preserve the original visual layout without needing custom CSS classes.
