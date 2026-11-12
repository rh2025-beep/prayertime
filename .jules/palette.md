## YYYY-MM-DD - Semantic Button and Keyboard Accessibility
**Learning:** Converting interactive `div` elements to semantic `button`s in React improves keyboard accessibility. But when an interactive container has another nested button, we can't use `<button>` due to invalid HTML nesting. We must instead use `role="button"`, `tabIndex={0}` and add an `onKeyDown` handler.
**Action:** When adding accessibility to interactive list items or cards, check if there are nested buttons. If so, use ARIA roles and keyboard event handlers instead of a `<button>` wrapper.
