## YYYY-MM-DD - Icon-only Search Button Accessibility
**Learning:** Icon-only buttons (like the location search button) often lack `aria-label` attributes for screen readers and miss visual loading states (spinners) during async requests, causing accessibility and UX issues.
**Action:** Ensure all icon-only interactive elements have proper `aria-label`s and utilize existing spinner classes (e.g., `.spin-icon` with `RefreshCw`) for loading states to prevent duplicate submissions and provide visual feedback.
