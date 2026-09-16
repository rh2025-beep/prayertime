## 2024-05-15 - ARIA Labels in Custom Modals
**Learning:** Custom modals (like the search location modal) and icon-only buttons in this codebase often lack `role="dialog"`, `aria-modal="true"`, and `aria-label` attributes out-of-the-box, making them invisible or confusing to screen readers.
**Action:** When working on modals or icon-only buttons, always verify and add semantic ARIA roles and labels to ensure screen reader compatibility.
