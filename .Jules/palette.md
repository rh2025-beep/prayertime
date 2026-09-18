## 2024-05-15 - [Modals and Icon Buttons ARIA Properties]
**Learning:** In this application, custom modals and icon-only buttons often lack proper ARIA attributes, compromising screen reader accessibility.
**Action:** Always ensure `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label`s are explicitly added when modifying these UI components to maintain screen reader accessibility.
