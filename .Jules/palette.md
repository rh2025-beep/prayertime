## 2024-05-15 - Improve Location Search Modal Accessibility
**Learning:** In this application, custom modals like the Location Search modal lack proper semantic roles (`role="dialog"`) and ARIA labels. Icon-only buttons (like the close and search buttons) and inputs are missing `aria-label`s, which hampers screen reader accessibility.
**Action:** When implementing or modifying custom modals and icon-only buttons, always ensure `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label`s are explicitly added to maintain accessibility.
