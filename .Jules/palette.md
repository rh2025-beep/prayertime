## 2024-05-18 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Several custom icon-only buttons (like `Maximize`, `RefreshCw`, `Locate`, and search/close `&times;` buttons) throughout the app lacked `aria-label` attributes, which makes them inaccessible to screen reader users as they can't determine the button's purpose from the visual icon alone.
**Action:** Always add descriptive `aria-label`s to any button whose content is purely visual/iconic. Use existing localized strings (e.g. `str.cancel`, `str.searchBtn`) where applicable to maintain translation consistency.
