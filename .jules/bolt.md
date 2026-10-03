## YYYY-MM-DD - Preventing Interval-Driven Main Thread Blocking
**Learning:** High-frequency useEffect dependencies (like a 1-second timer) cause identical rounded values to trigger expensive synchronous I/O operations like localStorage.setItem, which blocks the main thread.
**Action:** Always dirty-check the final serialized state using useRef before performing synchronous disk I/O or native plugin calls in high-frequency interval loops.
