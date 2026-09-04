## 2024-05-18 - Enhance modal accessibility
**Learning:** Modals and icon-only buttons frequently lack proper ARIA attributes, compromising screen reader accessibility.
**Action:** Always ensure role="dialog", aria-modal="true", aria-labelledby, and aria-labels are explicitly added when modifying these UI components.