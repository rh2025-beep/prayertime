## YYYY-MM-DD - Add Loading State to Native Device API Integration
**Learning:** Native device API integrations like `navigator.geolocation` can be slow, leaving the UI unresponsive during the operation and causing user frustration if there's no visual feedback.
**Action:** Always wrap async device API calls in state variables and add visual feedback (like `.spin-icon`) to their trigger buttons to prevent the app from appearing unresponsive.
