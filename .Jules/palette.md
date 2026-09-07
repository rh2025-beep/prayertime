## 2026-09-07 - Missing ARIA attributes in Modals and Icon Buttons
**Learning:** In this application's custom modal components (like the location search), critical accessibility attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label` for icon-only buttons) are frequently missing, severely impacting screen reader usability.
**Action:** Always ensure that custom modals and icon-only buttons receive these explicit ARIA attributes when modifying them or adding new ones.
