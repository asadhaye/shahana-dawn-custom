# Implementation Plan: Product Designer UX Fixes

## Overview

Implement 7 critical UX improvements to the immersive 3D store. All tasks are high-priority and should be completed in sequence. Estimated total time: 1-2 days.

---

## Tasks

- [x] 1. Add locale keys for all new strings
  - Add all new translation keys to `locales/en.default.json` under `sections.immersive_store.empty_states.*`, `sections.immersive_store.skeleton.*`, `sections.immersive_store.filters.active_filters.*`
  - Add `products.product.in_stock` and `products.product.sold_out` if not already present
  - _Requirements: All requirements (locale strings)_

- [x] 2. Implement Skeleton Loaders
  - [x] 2.1 Add skeleton CSS to `assets/immersive-theme.css`
    - Add `.immersive-skeleton-grid`, `.immersive-skeleton-card`, `.immersive-skeleton-product` classes
    - Add `@keyframes shimmer` animation
    - Add `@media (prefers-reduced-motion: reduce)` overrides
    - _Requirements: 1.4, 1.5, 1.7_
  - [x] 2.2 Implement `renderSkeletonGrid()` in `assets/immersive-store.js`
    - Function signature: `renderSkeletonGrid(count)` returns HTML string
    - Generate 6 skeleton cards by default
    - Each card has image placeholder + 3 content lines
    - _Requirements: 1.1_
  - [x] 2.3 Implement `renderSkeletonProduct()` in `assets/immersive-store.js`
    - Function signature: `renderSkeletonProduct()` returns HTML string
    - Layout: media placeholder + details (title, price, description, CTA)
    - _Requirements: 1.2_
  - [x] 2.4 Integrate skeleton loaders into `openCollectionPanel()`
    - Show skeleton grid before fetch
    - Fade in real content after fetch completes
    - _Requirements: 1.1, 1.6, 1.8_
  - [x] 2.5 Integrate skeleton loaders into `openProductPanel()`
    - Show skeleton product before fetch
    - Fade in real content after fetch completes
    - _Requirements: 1.2, 1.6, 1.8_

- [x] 3. Implement Enhanced Empty States
  - [x] 3.1 Add empty state CSS to `assets/immersive-theme.css`
    - Add `.immersive-empty-state`, `.immersive-empty-state__icon`, `.immersive-empty-state__heading`, `.immersive-empty-state__body`, `.immersive-empty-state__actions` classes
    - Add hover states for action buttons
    - Add `@media (prefers-reduced-motion: reduce)` overrides
    - _Requirements: 2.6, 2.7, 2.8_
  - [x] 3.2 Add empty collection state to `sections/immersive-product-grid.liquid`
    - Wrap in `{%- if collection.products.size == 0 -%}`
    - Include icon (shopping bag), heading, body, two CTAs (Search, Browse)
    - All strings via `| t` filter
    - _Requirements: 2.1, 2.2, 2.3, 2.9_
  - [x] 3.3 Implement `renderEmptyState()` in `assets/immersive-store.js`
    - Function signature: `renderEmptyState(type, context)` returns HTML string
    - Support types: 'collection', 'search', 'wishlist'
    - Include appropriate icon, heading, body, CTAs for each type
    - _Requirements: 2.1, 2.4, 2.5_
  - [x] 3.4 Wire empty state CTAs in `assets/immersive-store.js`
    - "Search products" → focus search input
    - "Browse rooms" → open room picker sheet
    - "Explore collections" → close wishlist, open room picker
    - _Requirements: 2.2, 2.3, 2.5_

- [x] 4. Implement Keyboard Navigation for Hotspots
  - [x] 4.1 Add ARIA live region to `sections/immersive-canvas.liquid`
    - Add `<div id="immersive-hotspot-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>` inside `#ui-layer`
    - _Requirements: 3.5_
  - [x] 4.2 Add hotspot focus ring CSS to `assets/immersive-theme.css`
    - Add `[data-hotspot-btn]:focus-visible` styles with gold outline
    - Add `@media (prefers-reduced-motion: reduce)` override
    - _Requirements: 3.4, 3.9_
  - [x] 4.3 Implement `initHotspotKeyboardNav()` in `assets/immersive-store.js`
    - Attach `keydown` listener to canvas
    - Handle Tab (forward), Shift+Tab (backward), Enter (activate)
    - Set canvas attributes: `tabindex="0"`, `role="application"`, `aria-label`
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.8_
  - [x] 4.4 Implement `updateHotspotElements()` in `assets/immersive-store.js`
    - Query all `[data-hotspot-btn]` elements
    - Store in `_hotspotElements` array
    - Call after `renderHotspots()`
    - _Requirements: 3.7_
  - [x] 4.5 Implement `focusNextHotspot()` in `assets/immersive-store.js`
    - Update `_focusedHotspotIndex` with wrapping
    - Apply focus to hotspot element
    - Call `announceHotspot()` with label
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  - [x] 4.6 Implement `announceHotspot()` in `assets/immersive-store.js`
    - Update `#immersive-hotspot-announcer` text content
    - _Requirements: 3.5_
  - [x] 4.7 Call `initHotspotKeyboardNav()` in `safeBindImmersiveInit()`
    - Add to init sequence after canvas setup
    - _Requirements: 3.1_

- [ ] 5. Implement Active Filter Chips
  - [x] 5.1 Add filter chip CSS to `assets/immersive-theme.css`
    - Add `.immersive-active-filters`, `.immersive-active-filters__chips`, `.immersive-chip` classes
    - Add hover states
    - Add `@media (prefers-reduced-motion: reduce)` overrides
    - _Requirements: 4.8, 4.9_
  - [x] 5.2 Add filter chips container to `sections/immersive-product-grid.liquid`
    - Add `<div data-filter-chips-container hidden></div>` above product grid
    - _Requirements: 4.1_
  - [ ] 5.3 Implement `renderActiveFilterChips()` in `assets/immersive-store.js`
    - Function signature: `renderActiveFilterChips(filterState)` returns HTML string
    - Generate chip for each active filter (colors, price, product type, designers, sort)
    - Include "Clear all" button
    - All strings via locale keys
    - _Requirements: 4.1, 4.2, 4.3, 4.10_
  - [ ] 5.4 Implement `removeFilterChip()` in `assets/immersive-store.js`
    - Remove filter from `filterState`
    - Re-fetch collection with updated filters
    - Update chip bar
    - _Requirements: 4.4_
  - [ ] 5.5 Integrate filter chips into `applyFilters()`
    - Call `renderActiveFilterChips()` after filter change
    - Show/hide chip bar based on active filters
    - _Requirements: 4.1, 4.6, 4.7_
  - [ ] 5.6 Wire "Clear all" button
    - Reset `filterState` to empty
    - Re-fetch unfiltered collection
    - Hide chip bar
    - _Requirements: 4.5_

- [x] 6. Implement Availability Badges on Product Cards
  - [x] 6.1 Add availability badge CSS to `snippets/immersive-product-card.liquid`
    - Add `.immersive-product-card__availability`, `.immersive-product-card__availability-badge` classes to `{% stylesheet %}` block
    - Green background for "In Stock", red for "Sold Out"
    - _Requirements: 5.4, 5.5_
  - [x] 6.2 Add availability badge markup to `snippets/immersive-product-card.liquid`
    - Add `<div class="immersive-product-card__availability">` after opening `<article>` tag
    - Conditional: `{%- if product.available -%}` → "In Stock", else → "Sold Out"
    - Use `products.product.in_stock` and `products.product.sold_out` locale keys
    - Add `aria-hidden="true"` (redundant with button state)
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7_

- [x] 7. Implement Loading States for Panel Transitions
  - [x] 7.1 Add panel content CSS to `assets/immersive-theme.css`
    - Add `min-height: 400px;` to `.immersive-store__panel-content`
    - Add `transition: opacity 150ms ease-in-out;`
    - Add `@media (prefers-reduced-motion: reduce)` override
    - _Requirements: 6.4, 6.5, 6.6_
  - [x] 7.2 Implement `fadeInContent()` in `assets/immersive-store.js`
    - Function signature: `fadeInContent(container, html)`
    - Fade out, inject HTML, fade in
    - Skip animation if `reduceMotion === true`
    - _Requirements: 6.2, 6.5_
  - [x] 7.3 Implement `fadeOutContent()` in `assets/immersive-store.js`
    - Function signature: `fadeOutContent(container, callback)`
    - Fade out, call callback
    - Skip animation if `reduceMotion === true`
    - _Requirements: 6.3, 6.5_
  - [x] 7.4 Integrate fade transitions into panel open/close
    - Use `fadeInContent()` in `openCollectionPanel()` and `openProductPanel()`
    - Use `fadeOutContent()` in `closePanel()`
    - _Requirements: 6.1, 6.2, 6.3_

- [-] 8. Implement Search Result Visual Hierarchy, we hsve search bar now, please. checkt it
  - [x] 8.1 Add search result CSS to `assets/immersive-theme.css`
    - Add `.immersive-search-result`, `.immersive-search-result__icon`, `.immersive-search__group-heading` classes
    - Add hover states
    - Add `@media (prefers-reduced-motion: reduce)` overrides
    - _Requirements: 7.5, 7.6, 7.7, 7.8_
  - [x] 8.2 Implement `renderSearchResultWithIcon()` in `assets/immersive-store.js`
    - Function signature: `renderSearchResultWithIcon(result)` returns HTML string
    - Include icon based on type: shopping bag (product), grid (collection), compass (room)
    - Icon has `aria-hidden="true"`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.8_
  - [x] 8.3 Integrate icons into search result rendering
    - Modify existing search result rendering to use `renderSearchResultWithIcon()`
    - Ensure group headings are styled correctly
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 9. Final Testing & QA
  - [ ] 9.1 Test skeleton loaders
    - Verify skeleton appears before content loads
    - Verify shimmer animation works (and is disabled with `prefers-reduced-motion`)
    - Test on slow connection (throttle network in DevTools)
  - [ ] 9.2 Test empty states
    - Verify empty collection state appears when collection has zero products
    - Verify empty search state appears when search returns zero results
    - Verify empty wishlist state appears when wishlist is empty
    - Verify CTAs work correctly
  - [ ] 9.3 Test keyboard navigation
    - Verify Tab navigates through hotspots
    - Verify Shift+Tab navigates backward
    - Verify Enter activates hotspot
    - Verify focus ring is visible
    - Verify ARIA announcements work (test with screen reader)
  - [ ] 9.4 Test filter chips
    - Verify chips appear when filters are applied
    - Verify chips are dismissible
    - Verify "Clear all" works
    - Verify chips persist across panel close/reopen
  - [ ] 9.5 Test availability badges
    - Verify "In Stock" badge appears on available products
    - Verify "Sold Out" badge appears on unavailable products
    - Verify badge positioning is correct
  - [ ] 9.6 Test loading states
    - Verify fade-in animation works
    - Verify fade-out animation works
    - Verify animations are disabled with `prefers-reduced-motion`
  - [ ] 9.7 Test search result hierarchy
    - Verify icons appear for each result type
    - Verify group headings are styled correctly
    - Verify hover states work
  - [ ] 9.8 Cross-browser testing
    - Test on Chrome, Firefox, Safari (desktop)
    - Test on Chrome, Safari (mobile)
  - [ ] 9.9 Accessibility audit
    - Verify all interactive elements have ARIA labels
    - Verify all animations respect `prefers-reduced-motion`
    - Verify keyboard navigation works throughout
    - Run Lighthouse Accessibility audit (target: ≥95)

---

## Notes

- All tasks should be completed in sequence
- Test each component individually before moving to the next
- All new strings must use `| t` filter
- All animations must respect `prefers-reduced-motion`
- All interactive elements must have proper ARIA labels
- Estimated total time: 1-2 days (8-16 hours)

---

## Success Criteria

- [ ] All 7 improvements implemented and working
- [ ] No regressions in existing functionality
- [ ] All animations respect `prefers-reduced-motion`
- [ ] All interactive elements have proper ARIA labels
- [ ] All new strings use `| t` filter
- [ ] Manual QA passes on Chrome, Firefox, Safari (desktop + mobile)
- [ ] Lighthouse Accessibility score remains ≥95
