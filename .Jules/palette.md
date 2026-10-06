## 2024-10-24 - Accessibility improvements on modals and loading states
**Learning:** Adding explicit `aria-label`s to form inputs and icon-only buttons drastically improves accessibility for screen readers on modal dialogs. Additionally, using `disabled` state with a visual `spin-icon` spinner provides necessary feedback to users during asynchronous actions.
**Action:** Always verify icon-only buttons (like search or close buttons) have explicit text or `aria-label`s, and ensure interactive elements that trigger asynchronous behavior have proper disabled and loading indicators.
