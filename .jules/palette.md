## YYYY-MM-DD - Semantic accessibility in interactive lists
**Learning:** Converting interactive `div` elements used as list items to semantic `button` elements is an easy way to enable keyboard focus and accessibility while maintaining visual layout by using `type="button"`, `textAlign: 'left'`, and `width: '100%'`.
**Action:** Always prefer semantic `<button>` elements for interactive UI components over `div` elements with `onClick` handlers. Add `title` and `aria-label` to icon-only buttons.
