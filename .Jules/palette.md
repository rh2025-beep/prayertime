## 2024-10-26 - Added ARIA attributes to Search Modal
**Learning:** The custom modal components in this application lack basic accessibility attributes like `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`, which makes them difficult for screen reader users to navigate. Additionally, icon-only close buttons need proper `aria-label`s.
**Action:** Ensure all future modal implementations and existing ones when modified include these crucial ARIA attributes to maintain screen reader accessibility.
