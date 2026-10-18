## YYYY-MM-DD - Async Loading States
**Learning:** Native device API integrations like `navigator.geolocation` can be slow. Users need visual feedback when initiating these actions to prevent the app from appearing unresponsive.
**Action:** Wrap async device API calls in state variables and add visual feedback (like `.spin-icon`) to their trigger buttons.
