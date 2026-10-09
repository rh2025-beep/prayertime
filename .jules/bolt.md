## YYYY-MM-DD - [Prevent Main Thread Blocking in High-Frequency Loops]
**Learning:** [Instantiating Intl.DateTimeFormat via toLocaleString and synchronous Capacitor native plugin calls in a 1-second interval loop can block the main thread and cause performance bottlenecks.]
**Action:** [Memoize expensive formatters like Intl.DateTimeFormat and add dirty-checking with useRef to synchronous disk I/O or Capacitor native calls inside high-frequency loops to ensure they only execute when their payload actually changes.]
