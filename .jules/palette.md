## 2024-11-05 - Search Location Icon Button Accessibility
**Learning:** Icon-only buttons (like the Search and Locate buttons) without `aria-label`s are inaccessible to screen reader users, failing the WCAG guideline.
**Action:** Always add `aria-label` attributes to `button` elements that only contain an icon, describing their functionality clearly. Ensure standard buttons use semantic `<button>` instead of `<div>` with `onClick`.
