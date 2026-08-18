## 2026-08-18 - Localized Aria Labels
**Learning:** The application uses dynamic translation with a `str` variable populated by `t[lang]`. Using these existing localized strings directly in `aria-label` and `title` tags ensures accessible labels correctly match the user's selected language.
**Action:** Next time when adding accessibility labels in apps with custom localization patterns, find the dynamic text variable and use it for ARIA labels instead of hardcoding strings.
