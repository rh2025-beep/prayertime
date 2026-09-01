## 2024-11-20 - Accessibility in Modals
**Learning:** In this application, modals and icon-only buttons frequently lack proper ARIA attributes, requiring explicit assignment of roles and labels for screen readers.
**Action:** Always ensure `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label`s are explicitly added when modifying or adding modals and icon-only buttons.
