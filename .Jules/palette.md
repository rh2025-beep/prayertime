## 2024-05-19 - Location Search Modal Accessibility
**Learning:** Modals and icon-only buttons in the application frequently lack proper ARIA attributes, impacting screen reader usability. The Location Search modal was missing `role="dialog"`, `aria-modal="true"`, an associated `aria-labelledby`, and `aria-label`s for inputs and icon buttons.
**Action:** Always ensure `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label`s are explicitly added when modifying these UI components to maintain screen reader accessibility.
