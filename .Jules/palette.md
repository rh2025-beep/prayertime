## 2026-09-08 - Add ARIA Attributes to Custom Modals and Icon Buttons
**Learning:** Custom modals (like the Search, Settings, and Qibla views) and icon-only buttons (like the close buttons and search button) frequently lack proper ARIA attributes, making them inaccessible to screen readers.
**Action:** When implementing or modifying custom modal components, always ensure `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` are explicitly added. For icon-only buttons, always ensure an `aria-label` is present to describe the action.
