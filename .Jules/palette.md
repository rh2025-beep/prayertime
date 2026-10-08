## YYYY-MM-DD - Missing Accessibility Roles in Modals
**Learning:** In this application, custom overlay modals and icon-only buttons frequently lack proper ARIA attributes, impacting screen reader accessibility.
**Action:** Always ensure `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label`s are explicitly added when modifying these UI components.
