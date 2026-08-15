## 2025-08-15 - Memoizing Frequently Recalculated Arrays in React Effects
**Learning:** Arrays of objects created inside `useEffect` hooks that are triggered very frequently (like 1-second timers) cause unnecessary garbage collection churn and CPU cycles, even if the underlying data they depend on doesn't change often.
**Action:** Extract large object arrays from frequently-ticking `useEffect` hooks into `useMemo` hooks based on their true dependencies, so they are only recreated when the underlying data changes, saving allocations and computation on every tick.
