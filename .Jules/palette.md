## 2024-05-15 - Missing ARIA Attributes on Custom Modals and Icon Buttons
**Learning:** Custom modals (like Settings, Qibla, Search) implemented via conditional rendering and `.fullscreen-view`/`.modal-content` lacked foundational `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` attributes. Additionally, several utility icon-only buttons lacked `aria-label`s.
**Action:** Always verify custom modal overlays have `role="dialog"` and `aria-modal="true"`, and ensure their title is referenced via `aria-labelledby`. Double-check all icon-only utility buttons for explicit `aria-label`s.
