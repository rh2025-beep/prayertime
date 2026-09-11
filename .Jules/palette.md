## 2026-09-11 - Location Search Modal Accessibility
**Learning:** The location search modal lacks ARIA dialog properties (`role="dialog"`, `aria-modal="true"`) and its interactive elements (close button, search input, search button) are missing `aria-label`s, making them difficult for screen readers to interpret.
**Action:** Add dialog ARIA attributes to the modal wrapper and explicitly label all icon-only buttons and inputs within the modal.
