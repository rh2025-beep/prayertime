## 2024-05-24 - Missing dialog roles and loading states
**Learning:** Custom modals (like the Location Search modal) lacked proper ARIA dialog attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), and async search operations didn't provide immediate visual feedback (like a loading spinner) within the trigger button, which is critical for UX and accessibility.
**Action:** Added proper ARIA roles to the search modal, an `aria-label` to the close button, and a spinning `RefreshCw` icon to the search button and results area during the `isSearching` state to improve feedback.
