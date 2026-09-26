## 2024-11-20 - Search UI Feedback Polish
**Learning:** The search modal allows users to hit 'Enter' to search, but when they do, the search button lacks a proper loading state while fetching results, which might confuse users if the network is slow. Also, the close button on the search overlay could use an `aria-label` for better accessibility.
**Action:** Added a loading spinner state to the search button during `isSearching` and ensure `aria-label` exists on modal close buttons.
