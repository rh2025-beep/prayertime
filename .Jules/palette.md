## 2024-05-22 - Accessible Search Modal with Loading State
**Learning:** Modals for async actions (like search) in this app lack crucial ARIA attributes for screen readers and visual loading indicators on the primary action button, leaving users confused about the current state.
**Action:** Always add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` to modals, and provide clear loading states (`RefreshCw` spinner) on action buttons when `isSearching` or similar flags are active.
