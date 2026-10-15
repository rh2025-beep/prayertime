## YYYY-MM-DD - [Loading states for async APIs]
**Learning:** Native device API integrations like `navigator.geolocation` can be slow.
**Action:** Always wrap async device API calls in state variables and add visual feedback (like `.spin-icon`) to their trigger buttons to prevent the app from appearing unresponsive.
