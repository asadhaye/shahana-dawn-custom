# Implementation Plan: Immersive UX Enhancements

## Overview

Eight progressive-enhancement modules added to `assets/immersive-store.js`, with supporting Liquid markup in `sections/immersive-canvas.liquid`, `snippets/immersive-product-card.liquid`, `sections/immersive-product-grid.liquid`, styles in `assets/immersive-theme.css`, and locale keys in `locales/en.default.json`. All modules are vanilla JS, no new runtime dependencies.

## Tasks

- [x] 1. Add locale keys and shared CSS foundations
  - Add all new translation keys to `locales/en.default.json` under `sections.immersive_store.search.*`, `sections.immersive_store.filters.*`, `sections.immersive_store.next_actions.*`, `sections.immersive_store.recommendations.*`, `sections.immersive_store.quick_add.*`, `sections.immersive_store.bottom_nav.*`, and `sections.immersive_store.limited_time.*`
  - Add `data-msg-error-add-to-cart` attribute to `#glass-panel` in `sections/immersive-canvas.liquid`
  - Add CSS custom property tokens and shared utility classes (`.immersive-badge`, `.immersive-chip`, `.immersive-toast-bar`) to `assets/immersive-theme.css`
  - Add `@media (prefers-reduced-motion: reduce)` overrides for all new components in `assets/immersive-theme.css`
  - _Requirements: 1.13, 2.11, 3.9, 4.13, 5.8, 6.11, 7.12, 8.11_

- [x] 2. Implement ImmersiveSearch
  - [x] 2.1 Add inline search markup to `sections/immersive-canvas.liquid`
    - Replace `{%- render 'header-search', input_id: 'immersive-search-input' -%}` with a new `<div class="immersive-search" data-immersive-search>` block containing `<input type="search">`, results dropdown shell, and all locale strings as `data-*` attributes (`data-msg-no-results`, `data-msg-unavailable`, `data-placeholder`)
    - _Requirements: 1.1, 1.13_
  - [x] 2.2 Implement `ImmersiveSearch` module in `assets/immersive-store.js`
    - Write `initImmersiveSearch()` that binds `keydown` on `document` for Cmd/Ctrl+K → `focusSearch()`, debounces input at 200ms, calls `/search/suggest?q=&resources[type]=product,collection,page`, fuzzy-matches room names client-side, renders grouped dropdown (Products / Collections / Rooms), handles arrow key navigation with `aria-activedescendant`, dispatches to `openProductPanel()` / `openCollectionPanel()` / `goToRoom()` on selection, closes on Escape, shows "Search unavailable" after 3s timeout, shows "No results" message on empty results
    - _Requirements: 1.1–1.12_
  - [x] 2.3 Write property test for search result grouping
    - **Property 1: Search result grouping is exhaustive and non-overlapping**
    - **Validates: Requirements 1.4**
    - Use `fast-check`: generate arbitrary arrays of `{type, handle}` objects, assert `grouped.products.length + grouped.collections.length + grouped.rooms.length === input.length`
  - [x] 2.4 Write property test for keyboard navigation tracking
    - **Property 2: Search keyboard navigation tracks active result**
    - **Validates: Requirements 1.5**
    - Use `fast-check`: generate non-empty result lists and sequences of Up/Down presses, assert `aria-activedescendant` always references a valid result item ID
  - [x] 2.5 Write unit tests for ImmersiveSearch
    - Test debounce timing (200ms), Escape closes dropdown, Cmd/Ctrl+K focuses input, 3s timeout shows unavailable message, zero results shows no-results message
    - _Requirements: 1.2, 1.3, 1.9, 1.10, 1.11_

- [x] 3. Implement ImmersiveBottomNav
  - [x] 3.1 Add bottom nav shell to `sections/immersive-canvas.liquid`
    - Add `<nav class="immersive-bottom-nav" data-immersive-bottom-nav>` inside `#ui-layer` with four items (Rooms, Wishlist, Cart, 2D), badge spans, and all locale strings as `data-*` attributes
    - Add room-picker sheet `<div class="immersive-bottom-nav__room-picker" hidden>` listing all rooms
    - _Requirements: 2.1, 2.2_
  - [x] 3.2 Add bottom nav CSS to `assets/immersive-theme.css`
    - Style `position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%)` with backdrop blur and gold border matching glassmorphism aesthetic
    - Add hide/show states and `prefers-reduced-motion` override (no entrance animation)
    - _Requirements: 2.2, 2.11_
  - [x] 3.3 Implement `ImmersiveBottomNav` module in `assets/immersive-store.js`
    - Write `initImmersiveBottomNav()` that wires Rooms → room-picker sheet, Wishlist → `data-wishlist-open` handler, Cart → `#cart-toggle`, 2D → `data-mode-switch-2d` behavior
    - Implement `updateBottomNavBadges(wishlistCount, cartCount)` and call it from existing wishlist and cart badge update paths
    - Hide nav when `#glass-panel` opens; show when it closes (listen to existing panel open/close events)
    - _Requirements: 2.3–2.10_
  - [x] 3.4 Write property test for badge consistency
    - **Property 9: Badge consistency**
    - **Validates: Requirements 2.7**
    - Use `fast-check`: generate arbitrary wishlist state changes, assert bottom nav badge count equals header badge count equals `_wishlistItems.length`

- [x] 4. Implement ImmersiveGestures
  - [x] 4.1 Implement `ImmersiveGestures` module in `assets/immersive-store.js`
    - Write `initImmersiveGestures()` that attaches `touchstart`, `touchmove` (`{ passive: true }`), and `touchend` listeners to the canvas wrapper
    - Track `startX`, `startY`, `startTime`; on `touchend` compute `deltaX`, `deltaY`; apply direction lock (`|deltaX| / |deltaY| > 2.5` → horizontal); dispatch: horizontal + panel closed → `goToRoom(adjacentRoom)` in circular sequence `storefront → lounge → designer_houses → occasions → featured_collections`; swipe down ≥ 60px + panel open → `closePanel()`; swipe up ≥ 60px + panel closed → open wishlist
    - Ignore gestures originating on `button, a, input, [role="radio"]`
    - Enforce 600ms cooldown between room transitions
    - Respect `prefers-reduced-motion` (instant switch, no animation)
    - _Requirements: 3.1–3.9_
  - [x] 4.2 Write property test for gesture exclusivity
    - **Property 6: Gesture exclusivity**
    - **Validates: Requirements 3.8**
    - Use `fast-check`: generate arbitrary `(deltaX, deltaY)` pairs, assert `classifyGesture(dx, dy)` returns exactly one of `'horizontal'`, `'vertical-up'`, `'vertical-down'`, or `'none'` — never two simultaneously
  - [x] 4.3 Write unit tests for ImmersiveGestures
    - Test direction lock threshold (ratio 2.5), 60px minimum distance, 600ms cooldown, interactive element guard, circular room sequence
    - _Requirements: 3.2, 3.3, 3.6, 3.7_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement ImmersiveFilters
  - [x] 6.1 Update `sections/immersive-product-grid.liquid` to accept filter params
    - Accept `filter.p.m.custom.color[]`, `filter.v.price.gte`, `filter.v.price.lte`, and `sort_by` URL params passed via Section Rendering API and apply them to the collection product loop
    - _Requirements: 4.6_
  - [x] 6.2 Implement `ImmersiveFilters` module in `assets/immersive-store.js`
    - Write `initImmersiveFilters(panelEl, collectionHandle, roomKey)` that injects a filter toolbar above the product grid inside `#glass-panel`
    - Render color swatches from product `color` option values, price range inputs with PKR label, designer chips from `vendor` values, sort dropdown (Manual / Price ↑ / Price ↓ / A–Z)
    - On filter change: construct URL params using only allowlisted keys (`filter.p.m.custom.color[]`, `filter.v.price.gte`, `filter.v.price.lte`, `sort_by`), re-fetch via Section Rendering API, update panel content
    - Implement `saveFilters(roomKey, state)` → `sessionStorage` keyed `immersive_filters_{roomKey}` and `loadFilters(roomKey)` → deserialise and return `FilterState`
    - Restore saved `FilterState` when re-entering a room's collection panel
    - "Clear all" resets state and re-fetches unfiltered collection
    - On API failure: show `data-msg-load-collection-error` toast and restore previous grid
    - All labels via locale keys `sections.immersive_store.filters.*`
    - _Requirements: 4.1–4.13_
  - [x] 6.3 Write property test for filter persistence round-trip
    - **Property 4: Filter persistence round-trip**
    - **Validates: Requirements 4.10**
    - Use `fast-check`: generate arbitrary valid `FilterState` objects and `roomKey` strings, assert `loadFilters(roomKey)` after `saveFilters(roomKey, state)` returns a value deep-equal to `state`
  - [x] 6.4 Write property test for filter URL param allowlist
    - **Property 5: Filter URL params use only allowlisted keys**
    - **Validates: Requirements 4.12**
    - Use `fast-check`: generate arbitrary `FilterState` objects, assert the constructed URL query string contains only params from the allowlisted set
  - [x] 6.5 Write property test for filter idempotency
    - **Property 3: Filter idempotency**
    - **Validates: Requirements 4.6**
    - Use `fast-check`: generate arbitrary `FilterState` objects, assert applying the same state twice produces identical URL params as applying it once
  - [x] 6.6 Write unit tests for ImmersiveFilters
    - Test `FilterState` serialisation/deserialisation, "Clear all" resets state, API failure restores previous grid, filter toolbar injection
    - _Requirements: 4.7, 4.8, 4.9, 4.11_

- [x] 7. Implement ImmersiveNextActions
  - [x] 7.1 Implement `ImmersiveNextActions` module in `assets/immersive-store.js`
    - Write `initImmersiveNextActions()` and trigger functions: `showAfterProductView(product)` (after panel open ≥ 8s or explicit close), `showAfterAddToCart(product)` (after cart add), `showAfterRoomComplete(roomKey)` (all hotspots visited or back-to-lounge)
    - Render `<div class="immersive-next-actions" role="status" aria-live="polite">` with action chips and a close button
    - Auto-dismiss after 6s; manual dismiss via close button
    - Enforce singleton: new trigger replaces existing bar (never two bars simultaneously)
    - Respect `prefers-reduced-motion` (no slide-in animation)
    - Wire `showAfterAddToCart` into the existing add-to-cart success path in `immersive-store.js`
    - _Requirements: 5.1–5.8_
  - [x] 7.2 Write property test for next actions singleton
    - **Property 11: Next actions singleton**
    - **Validates: Requirements 5.7**
    - Use `fast-check`: generate arbitrary sequences of trigger events, assert at most one `.immersive-next-actions` element exists in the DOM at any time
  - [x] 7.3 Write unit tests for ImmersiveNextActions
    - Test 6s auto-dismiss, manual close, chip labels per trigger type, `prefers-reduced-motion` instant show/hide
    - _Requirements: 5.5, 5.6, 5.8_

- [x] 8. Implement ImmersiveRoomRecommender
  - [x] 8.1 Implement `ImmersiveRoomRecommender` module in `assets/immersive-store.js`
    - Write `initImmersiveRoomRecommender()` that maintains a `BrowsingContext` object (`visitedRooms`, `savedProducts`, `viewedCollections`, `cartCollections`) updated on wishlist change, room exit, and panel close events
    - Implement `getRecommendation(context)` rule engine: bridal/mehndi wishlist → `occasions`; designer-house wishlist → `designer_houses`; visited `designer_houses` but not `occasions` → `occasions`; visited `occasions` but not `featured_collections` → `featured_collections`; default → `lounge`
    - Render dismissible chip in bottom-right corner with room thumbnail (CSS background from `STORE_ROOMS` texture URL), label, and reason string
    - Click → `goToRoom(roomKey)`; dismiss → store `immersive_rec_dismissed_{roomKey}` in `sessionStorage` and suppress for session
    - Support `window.ImmersiveRecommenderOverride(context)` hook
    - _Requirements: 6.1–6.11_
  - [x] 8.2 Write property test for room recommendation coverage
    - **Property 10: Room recommendation coverage**
    - **Validates: Requirements 6.7**
    - Use `fast-check`: generate arbitrary `BrowsingContext` objects where `visitedRooms` is non-empty, assert `getRecommendation(context)` always returns a non-null `RoomRecommendation`
  - [x] 8.3 Write unit tests for ImmersiveRoomRecommender
    - Test all rule branches, dismissal sessionStorage flag, `ImmersiveRecommenderOverride` hook, default fallback to `lounge`
    - _Requirements: 6.2–6.6, 6.10, 6.11_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement ImmersiveQuickAdd
  - [x] 10.1 Add quick-add button to `snippets/immersive-product-card.liquid`
    - Add `<button class="immersive-product-card__quick-add" data-quick-add data-product-handle="{{ product.handle }}" type="button" aria-label="{{ 'sections.immersive_store.quick_add.button_aria' | t: title: product.title | escape }}">` inside the product card, positioned over the product image
    - Add CSS for `.immersive-product-card__quick-add` to the snippet's `{% stylesheet %}` block
    - _Requirements: 7.1_
  - [x] 10.2 Implement `ImmersiveQuickAdd` module in `assets/immersive-store.js`
    - Write `initImmersiveQuickAdd()` that delegates click events on `[data-quick-add]` via event delegation on `#glass-panel`
    - `openQuickAdd(handle, triggerEl)`: fetch `/products/{handle}.js` (cached in `contentCache` under key `quickadd_{handle}`); if single variant → add directly to cart and show success toast; if multiple variants → render modal `role="dialog" aria-modal="true"` with product title, price, size radiogroup, and "Add to cart" CTA
    - Implement focus trap (Tab/Shift+Tab cycles within modal); Escape closes modal and restores focus to `triggerEl`
    - On variant select: update price display; disable CTA and show "Sold out" label when `available === false`
    - On confirm: POST to `/cart/add.js`, show success toast, update cart badge, close modal
    - Enforce singleton: at most one modal in DOM at any time
    - On product fetch failure: show `data-msg-load-product-error` toast, do not open modal
    - On cart add failure: show `data-msg-error-add-to-cart` toast, keep modal open for retry
    - Respect `prefers-reduced-motion` (no slide-in animation)
    - _Requirements: 7.2–7.12_
  - [x] 10.3 Write property test for quick-add modal singleton
    - **Property 8: Quick Add modal singleton**
    - **Validates: Requirements 7.9**
    - Use `fast-check`: generate arbitrary sequences of `openQuickAdd()` calls, assert at most one quick-add modal element exists in the DOM at any point
  - [x] 10.4 Write unit tests for ImmersiveQuickAdd
    - Test single-variant skip-modal path, focus trap, Escape closes modal, sold-out variant disables CTA, product fetch failure shows toast, cart add failure keeps modal open
    - _Requirements: 7.4, 7.6, 7.7, 7.8, 7.10, 7.11_

- [x] 11. Implement ImmersiveLimitedTime
  - [x] 11.1 Add data attributes to `snippets/immersive-product-card.liquid`
    - Add `data-sale-end-date="{{ product.metafields.custom.sale_end_date | escape }}"` and `data-inventory-quantity="{{ product.selected_or_first_available_variant.inventory_quantity }}"` to the `<article>` element
    - _Requirements: 8.12_
  - [x] 11.2 Add flash sale block to `sections/immersive-canvas.liquid` schema
    - Add a `flash_sale` block type to the section schema with settings: `message` (text), `sale_end_date` (text), `enabled` (checkbox)
    - Render a `<div class="immersive-flash-sale-banner" data-flash-sale-banner data-sale-end-date="{{ block.settings.sale_end_date | escape }}" data-message="{{ block.settings.message | escape }}" hidden>` above the bottom nav inside `#ui-layer`
    - Add `low_stock_threshold` section setting (number, default 5)
    - _Requirements: 8.5, 8.10_
  - [x] 11.3 Implement `ImmersiveLimitedTime` module in `assets/immersive-store.js`
    - Write `initImmersiveLimitedTime()` that scans product cards for `data-sale-end-date` and `data-inventory-quantity` attributes
    - Implement `computeCountdown(endTime)` → `CountdownState` with `days`, `hours`, `minutes`, `seconds`, `expired`; guard invalid ISO 8601 with `isNaN()` check (silently skip); never produce negative values
    - `renderCountdown(endTime, containerEl)`: inject countdown element, start `setInterval` (1s), update display, remove element and clear interval when `expired === true`
    - `renderLowStockBadge(quantity, containerEl)`: render badge using `products.product.inventory_low_stock_show_count` locale key when `quantity <= threshold`; skip silently if inventory data unavailable
    - `showFlashSaleAlert(message, endDate)`: render dismissible banner above bottom nav; store dismissal flag `immersive_flash_dismissed` in `sessionStorage`; do not re-show after dismiss
    - Clear all active `setInterval` timers on panel close and room change (hook into existing `closePanel()` and `goToRoom()` paths)
    - Respect `prefers-reduced-motion` (update numbers without CSS animation)
    - _Requirements: 8.1–8.11_
  - [x] 11.4 Write property test for countdown non-negativity
    - **Property 7: Countdown non-negativity**
    - **Validates: Requirements 8.3**
    - Use `fast-check`: generate arbitrary `Date` objects (past and future), assert `computeCountdown(endTime)` returns `expired === true` for past times OR all of `days`, `hours`, `minutes`, `seconds` are ≥ 0 for future times
  - [x] 11.5 Write unit tests for ImmersiveLimitedTime
    - Test countdown arithmetic (days/hours/minutes/seconds), expiry removes element, invalid ISO 8601 silently skipped, flash sale banner dismissal stored in sessionStorage, timer cleanup on panel close
    - _Requirements: 8.2, 8.6, 8.7, 8.8_

- [x] 12. Wire all modules into `safeBindImmersiveInit`
  - [x] 12.1 Call all eight `init*()` functions from `safeBindImmersiveInit()` in `assets/immersive-store.js`
    - Add `initImmersiveSearch()`, `initImmersiveBottomNav()`, `initImmersiveGestures()`, `initImmersiveFilters()` (called from `openCollectionPanel()`), `initImmersiveNextActions()`, `initImmersiveRoomRecommender()`, `initImmersiveQuickAdd()`, `initImmersiveLimitedTime()` at the appropriate points in the init sequence
    - Ensure `ImmersiveFilters.init()` is called after collection panel content loads (inside the Section Rendering API callback in `openCollectionPanel()`)
    - Ensure `ImmersiveLimitedTime` scans new product cards after any panel content update
    - _Requirements: all modules_
  - [x] 12.2 Add `shopify:section:load` re-init hooks for theme editor compatibility
    - Ensure all modules that inject DOM (BottomNav, Search markup) re-initialize correctly when the section is reloaded in the theme editor
    - _Requirements: all modules_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All new JS is added to `assets/immersive-store.js` — no new asset files
- All new locale strings follow the `sections.immersive_store.*` namespace convention
- Property tests use `fast-check` (already in `devDependencies`); unit tests use Jest + jsdom
- Each module is a progressive enhancement — the 3D canvas and room navigation are unaffected if a module fails to init
- Checkpoints validate incremental correctness before proceeding to the next module group
