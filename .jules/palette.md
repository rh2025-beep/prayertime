
## YYYY-MM-DD - Add loading state to GPS location button
**Learning:** Native device APIs like navigator.geolocation can be slow and asynchronous.
**Action:** Always wrap async device API calls in state variables and add visual feedback (like `.spin-icon`) to their trigger buttons to prevent the app from appearing unresponsive.
