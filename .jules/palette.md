## YYYY-MM-DD - Accessible Modals and Interactive Divs
**Learning:** In React applications, custom modals often lack ARIA attributes, and interactive `div` elements used for lists (like search results) break keyboard navigation.
**Action:** Always ensure modals have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`, and replace interactive `div` elements with semantic `button` elements to preserve tab focus and default behavior.
