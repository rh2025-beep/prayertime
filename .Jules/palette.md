## 2024-05-18 - Search Modal Accessibility
**Learning:** Modals in this application (e.g., Location Search) often lack standard ARIA attributes (`role="dialog"`, `aria-modal="true"`) and have icon-only close buttons (`&times;`) that are inaccessible to screen readers.
**Action:** When working on modals in this repository, always explicitly add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and ensure icon-only buttons (like close) have an explicit, localized `aria-label`.
