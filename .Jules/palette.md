## YYYY-MM-DD - Missing ARIA properties on custom modals
**Learning:** Custom modal overlays (like the location search modal) frequently lack basic dialog accessibility properties (`role="dialog"`, `aria-modal="true"`, and `aria-labelledby`).
**Action:** Always ensure custom-built modals include semantic ARIA attributes and that icon-only interactive elements (like close or search buttons) have explicit `aria-label`s.
