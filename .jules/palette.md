## 2024-10-30 - Added ARIA Label and Button Semantic Elements to Search Modal
**Learning:** Found interactive elements (`div` tags acting as buttons in the search results) which are missing semantic button types. These need explicit `type="button"` and inherited styling. Furthermore, icon-only buttons (like the Search button) lack `aria-label` attributes.
**Action:** Always replace interactive `div` elements containing `onClick` handlers with semantic `button` elements to provide tab focus and proper interaction handling. Remember to add `aria-label` for icon-only buttons.
