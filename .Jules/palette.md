## 2024-09-20 - Ensure Modals and Icon Buttons are Accessible
**Learning:** In this application, custom modals and icon-only buttons frequently lack proper ARIA attributes for screen readers. Modals need `role="dialog"`, `aria-modal="true"`, and `aria-label`, and inputs/buttons need `aria-label`s.
**Action:** Always verify `role="dialog"`, `aria-modal="true"`, and `aria-label` exist when interacting with or creating custom modal overlays and ensure all icon-only buttons have an `aria-label`.
