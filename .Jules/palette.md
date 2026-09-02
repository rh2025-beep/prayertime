## 2026-09-02 - Add ARIA properties for custom modals and icon-only buttons
**Learning:** In this application, custom modals and icon-only buttons frequently lack proper ARIA attributes, causing accessibility issues for screen reader users.
**Action:** Always ensure `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label`s are explicitly added when modifying these UI components to maintain screen reader accessibility.
