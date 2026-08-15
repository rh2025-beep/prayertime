## 2024-08-15 - ARIA Labels for Icon-Only Buttons
**Learning:** Some custom UI modals and overlays (like the search modal and calibration help) contain icon-only close buttons (`&times;`) without ARIA labels. This is a common pattern in custom components that degrades the screen reader experience.
**Action:** When adding new modals or interactive elements with icon-only buttons, consistently apply `aria-label` using the `str` object for localization (e.g., `aria-label={str.cancel}`) to ensure accessibility for all supported languages.
