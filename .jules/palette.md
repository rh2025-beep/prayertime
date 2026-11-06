## YYYY-MM-DD - Convert interactive divs to semantic buttons
**Learning:** Users who rely on keyboards or screen readers often cannot interact properly with standard div elements. Interactive `div` elements used for actions (like selecting search results) lack semantic meaning and standard keyboard focus.
**Action:** Always replace interactive `div` elements containing `onClick` handlers with semantic `button` elements, ensuring `type="button"` is set and original visual styling is preserved.
