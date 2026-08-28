## 2024-03-22 - Add ARIA Labels and Roles
**Learning:** Found that custom modals lacked `role="dialog"` and `aria-labelledby` attributes, and icon-only buttons lacked `aria-label` attributes.
**Action:** When implementing custom modals or icon buttons, ensure semantic HTML attributes (`role`, `aria-label`, etc) are used. Always add `aria-modal="true"` to active dialogs.
