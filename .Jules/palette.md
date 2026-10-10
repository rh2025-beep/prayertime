## YYYY-MM-DD - Add loading feedback for async geolocation requests
**Learning:** Users lack feedback when tapping "Use GPS", leading to confusion and potential multiple taps while waiting for the async geolocation API to respond.
**Action:** Always provide immediate visual feedback (e.g., spinning icon) and disable the trigger button during async location requests to communicate progress and prevent duplicate actions.
