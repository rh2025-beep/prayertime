## YYYY-MM-DD - Initial Journal Setup\n**Learning:** Started tracking critical performance learnings for the Prayer Times app.\n**Action:** Log new insights as they occur.
## YYYY-MM-DD - Date Formatting Optimization
**Learning:** Repeatedly invoking Date.prototype.toLocaleString() with timeZone options during renders or frequent interval loops is computationally expensive (up to 15x slower). Using a memoized Intl.DateTimeFormat instance provides massive performance gains.
**Action:** Use useMemo with Intl.DateTimeFormat when date parsing requires continuous timezone formatting in React components.
