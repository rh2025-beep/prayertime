## 2024-05-20 - Adding Loading State to GPS Button
**Learning:** In React apps, native device API integrations like `navigator.geolocation` can be slow, causing the app to appear unresponsive. Users may spam the button if there is no immediate visual feedback.
**Action:** Always wrap async device API calls in state variables (e.g., `isLocating`) and add visual feedback (like `.spin-icon` or disabling the button) to their trigger buttons to prevent the app from appearing unresponsive.
