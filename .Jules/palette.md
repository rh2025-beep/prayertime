
## 2024-10-24 - Modal Dialog Accessibility Pattern
**Learning:** React modals (both full-screen and overlaid views) in this app often utilize `div`s with classes like `fullscreen-view` and `modal-content` but initially lack inherent ARIA roles, meaning screen readers cannot effectively parse them as modal dialogs.
**Action:** When implementing or modifying modal views or popovers, strictly ensure `role="dialog"`, `aria-modal="true"`, and an `aria-labelledby` linking to the view's title ID are provided. Icon-only buttons within these modals (such as the close and search buttons) also require proper `aria-label`s.
