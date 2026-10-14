## YYYY-MM-DD - [Loading state for GPS location]
**Learning:** Native device API integrations like `navigator.geolocation` can be slow and feel unresponsive if visual feedback is not provided.
**Action:** Always wrap async device API calls in state variables and add visual feedback (like `.spin-icon`) to their trigger buttons.
