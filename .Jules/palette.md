## YYYY-MM-DD - Modal Accessibility & Async Feedback
**Learning:** Adding explicit ARIA roles (dialog, modal, labelledby) to custom modals and feedback (spinners, disabled states) to async search buttons significantly improves screen reader and keyboard usability. Replacing interactive `div`s with `button`s in lists automatically provides tab focus and keyboard execution.
**Action:** Always verify custom modal accessibility attributes, add feedback to async actions, and use semantic HTML elements (`button` instead of `div` with `onClick`) for interactive list items.
