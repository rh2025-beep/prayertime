## YYYY-MM-DD - Missing ARIA Labels in Icon-Only Buttons
**Learning:** Icon-only buttons (like Close, Search, Calibrate, GPS) and inputs without visible labels in React apps often lack ARIA labels, creating severe accessibility barriers for screen reader users.
**Action:** Always verify and add `aria-label` or `title` to icon-only buttons, close buttons (`&times;`), and inputs lacking explicitly associated `<label>` elements to ensure comprehensive screen reader support.
