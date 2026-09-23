## 2024-10-24 - Async Loading States in Modals
**Learning:** Search forms and generic input modals often lack `disabled` states and spinners during async fetches, which causes confusion and duplicate requests. Furthermore, modals often miss basic ARIA roles like `role="dialog"`.
**Action:** Always add loading spinners (`spin-icon`) to submit buttons, disable inputs during fetches, and enforce `role="dialog"` and `aria-labelledby` on all custom modals to ensure screen reader compatibility.
