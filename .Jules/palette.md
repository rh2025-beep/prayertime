## 2024-05-18 - Missing ARIA attributes on Location Search Modal
**Learning:** Custom modal implementations and icon-only buttons in this codebase frequently lack fundamental ARIA attributes, hindering screen reader accessibility.
**Action:** Always verify and add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-label`s to custom modals and icon-only buttons to maintain accessibility standards.
