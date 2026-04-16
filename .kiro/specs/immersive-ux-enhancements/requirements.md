# Requirements Document

## Introduction

This document defines requirements for eight UX enhancement modules added to the Shahana Collection immersive 3D store at `/pages/immersive`. The enhancements cover inline search, bottom navigation, touch gestures, smart filters, contextual next-action suggestions, room recommendations, quick add-to-cart, and limited-time urgency signals. All modules are implemented as progressive enhancements within the existing DOM overlay layer; the Three.js canvas and room navigation remain the source of truth for the 3D world.

---

## Glossary

- **ImmersiveSearch**: The inline search module that replaces the icon-only search with an always-visible input in the immersive header.
- **ImmersiveBottomNav**: The floating bottom navigation bar providing quick access to rooms, wishlist, cart, and 2D mode.
- **ImmersiveGestures**: The touch gesture handler for swipe-based room navigation and panel control.
- **ImmersiveFilters**: The smart filter toolbar injected into collection panels for color, price, and designer filtering.
- **ImmersiveNextActions**: The contextual action chip system that surfaces suggested next steps after key user events.
- **ImmersiveRoomRecommender**: The rule-based room suggestion engine that recommends the next room based on browsing context.
- **ImmersiveQuickAdd**: The quick add-to-cart module that opens a lightweight size-selector modal from product cards.
- **ImmersiveLimitedTime**: The urgency signal module rendering countdown timers, low-stock badges, and flash sale alerts.
- **FilterState**: A serialisable object containing `colors`, `priceMin`, `priceMax`, `designers`, and `sortBy` fields.
- **BrowsingContext**: An in-memory object tracking `visitedRooms`, `savedProducts`, `viewedCollections`, and `cartCollections`.
- **CountdownState**: An object with `days`, `hours`, `minutes`, `seconds`, and `expired` fields derived from a sale end time.
- **glass-panel**: The `role="dialog"` overlay that renders collection and product content via the Section Rendering API.
- **contentCache**: The URL-keyed in-memory cache used by `fetchWithCache()` for all Section Rendering API responses.
- **sessionStorage**: Browser session storage used to persist filter state and dismissal flags across panel interactions.
- **Predictive_Search_API**: The Shopify `/search/suggest` endpoint used by ImmersiveSearch for product, collection, and page results.
- **Section_Rendering_API**: The Shopify mechanism for fetching section HTML via URL params, used by ImmersiveFilters.

---

## Requirements

### Requirement 1: Inline Search Bar

**User Story:** As a shopper in the immersive store, I want an always-visible search input in the header so that I can find products, collections, and rooms without leaving the 3D experience.

#### Acceptance Criteria

1. THE ImmersiveSearch SHALL render an `<input type="search">` in `.immersive-header__right`, replacing the existing `header-search` snippet render.
2. WHEN a user presses Cmd/Ctrl+K, THE ImmersiveSearch SHALL call `focusSearch()` and move keyboard focus to the search input.
3. WHEN a user types a query, THE ImmersiveSearch SHALL debounce input at 200ms before calling the Predictive_Search_API.
4. WHEN the Predictive_Search_API returns results, THE ImmersiveSearch SHALL render a grouped dropdown containing Products, Collections, and Rooms sections.
5. WHEN a user presses the Up or Down arrow key while the dropdown is open, THE ImmersiveSearch SHALL update `aria-activedescendant` on the input to reflect the highlighted result.
6. WHEN a user selects a product result, THE ImmersiveSearch SHALL call `openProductPanel()` with the product handle.
7. WHEN a user selects a collection result, THE ImmersiveSearch SHALL call `openCollectionPanel()` with the collection handle.
8. WHEN a user selects a room result, THE ImmersiveSearch SHALL call `goToRoom()` with the room key.
9. WHEN a user presses Escape while the dropdown is open, THE ImmersiveSearch SHALL close the dropdown and blur the input.
10. IF the Predictive_Search_API does not respond within 3 seconds, THEN THE ImmersiveSearch SHALL display an inline "Search unavailable" message without blocking the input field.
11. IF the Predictive_Search_API returns zero results, THEN THE ImmersiveSearch SHALL display a "No results for '{term}'" message with a suggestion to browse rooms.
12. THE ImmersiveSearch SHALL fuzzy-match room names client-side without making an API call.
13. THE ImmersiveSearch SHALL pass all user-facing strings via `data-*` attributes on the search container rendered by Liquid.

---

### Requirement 2: Bottom Navigation Bar

**User Story:** As a shopper in the immersive store, I want a persistent floating navigation bar at the bottom of the screen so that I can quickly access rooms, my wishlist, my cart, and the 2D store on any device.

#### Acceptance Criteria

1. THE ImmersiveBottomNav SHALL render a `<nav class="immersive-bottom-nav">` inside `#ui-layer` with four items: Rooms, Wishlist, Cart, and 2D.
2. THE ImmersiveBottomNav SHALL position the bar at `position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%)` with backdrop blur and gold border matching the glassmorphism aesthetic.
3. WHEN a user taps the Rooms item, THE ImmersiveBottomNav SHALL open a room-picker sheet listing all available rooms.
4. WHEN a user taps the Wishlist item, THE ImmersiveBottomNav SHALL delegate to the existing `data-wishlist-open` handler.
5. WHEN a user taps the Cart item, THE ImmersiveBottomNav SHALL delegate to the existing `#cart-toggle` handler.
6. WHEN a user taps the 2D item, THE ImmersiveBottomNav SHALL trigger the same behavior as `data-mode-switch-2d`.
7. WHEN the wishlist item count changes, THE ImmersiveBottomNav SHALL update the wishlist badge to equal the wishlist badge count in the header.
8. WHEN the cart item count changes, THE ImmersiveBottomNav SHALL update the cart badge to equal the cart item count.
9. WHILE a glass-panel is open, THE ImmersiveBottomNav SHALL hide to avoid z-index conflicts.
10. WHEN a glass-panel closes, THE ImmersiveBottomNav SHALL become visible again.
11. WHERE `prefers-reduced-motion` is enabled, THE ImmersiveBottomNav SHALL show and hide without entrance animation.

---

### Requirement 3: Swipe Gestures

**User Story:** As a mobile shopper in the immersive store, I want to swipe to navigate between rooms and control panels so that I can browse the 3D experience with natural touch gestures.

#### Acceptance Criteria

1. THE ImmersiveGestures SHALL listen to `touchstart`, `touchmove`, and `touchend` events on the canvas wrapper.
2. WHEN a touch sequence produces a horizontal delta ≥ 60px and the direction lock ratio `|deltaX| / |deltaY|` exceeds 2.5, THE ImmersiveGestures SHALL classify the gesture as horizontal.
3. WHEN a horizontal gesture is classified and no panel is open, THE ImmersiveGestures SHALL call `goToRoom()` with the adjacent room in the circular sequence: `storefront → lounge → designer_houses → occasions → featured_collections → storefront`.
4. WHEN a touch sequence produces a downward vertical delta ≥ 60px and a panel is open, THE ImmersiveGestures SHALL call `closePanel()`.
5. WHEN a touch sequence produces an upward vertical delta ≥ 60px and no panel is open, THE ImmersiveGestures SHALL open the wishlist panel.
6. IF a touch event originates on an interactive element (button, link, input, or `[role="radio"]`), THEN THE ImmersiveGestures SHALL ignore the gesture entirely.
7. THE ImmersiveGestures SHALL enforce a 600ms cooldown between room transitions to prevent rapid swipe spam.
8. FOR any touch event sequence, THE ImmersiveGestures SHALL classify at most one gesture type — never two simultaneously.
9. WHERE `prefers-reduced-motion` is enabled, THE ImmersiveGestures SHALL switch rooms instantly without transition animation.

---

### Requirement 4: Smart Filters

**User Story:** As a shopper browsing a collection panel, I want to filter products by color, price, and designer without leaving the 3D experience so that I can find relevant items quickly.

#### Acceptance Criteria

1. WHEN a collection panel opens, THE ImmersiveFilters SHALL inject a filter toolbar above the product grid inside `#glass-panel`.
2. THE ImmersiveFilters SHALL render color swatches extracted from the `color` option values of products in the loaded collection.
3. THE ImmersiveFilters SHALL render a price range input with PKR currency label using `priceMin` and `priceMax` fields.
4. THE ImmersiveFilters SHALL render designer chips extracted from the `vendor` values of products in the loaded collection.
5. THE ImmersiveFilters SHALL render a sort dropdown with options: Manual, Price ↑, Price ↓, and A–Z.
6. WHEN a filter value changes, THE ImmersiveFilters SHALL re-fetch the collection via the Section_Rendering_API with the appropriate `filter.p.m.custom.color[]`, `filter.v.price.gte`, `filter.v.price.lte`, and `sort_by` URL params.
7. WHEN a user navigates away from a room and returns, THE ImmersiveFilters SHALL restore the previously applied FilterState for that room from sessionStorage.
8. WHEN a user taps "Clear all", THE ImmersiveFilters SHALL reset the FilterState to empty and re-fetch the unfiltered collection.
9. THE ImmersiveFilters SHALL save the current FilterState to sessionStorage keyed by `immersive_filters_{roomKey}` after every filter change.
10. WHEN `loadFilters(roomKey)` is called after `saveFilters(roomKey, state)`, THE ImmersiveFilters SHALL return a value deep-equal to the saved FilterState.
11. IF the Section_Rendering_API call fails, THEN THE ImmersiveFilters SHALL display the `data-msg-load-collection-error` toast and restore the previous unfiltered product grid.
12. THE ImmersiveFilters SHALL construct filter URL params using only allowlisted option names, never user-supplied keys.
13. THE ImmersiveFilters SHALL pass all filter label strings via locale keys under `sections.immersive_store.filters.*`.

---

### Requirement 5: Suggested Next Actions

**User Story:** As a shopper in the immersive store, I want contextual action suggestions to appear after key interactions so that I am guided naturally through the shopping journey.

#### Acceptance Criteria

1. WHEN a product panel has been open for 8 seconds or is explicitly closed, THE ImmersiveNextActions SHALL display action chips: "Continue exploring [Room]" and "See more from [Vendor]".
2. WHEN a product is added to cart, THE ImmersiveNextActions SHALL display action chips: "Complete the look" and "View cart".
3. WHEN all hotspots in a room have been visited or the user navigates back to the lounge, THE ImmersiveNextActions SHALL display an action chip: "Discover what's next" that opens the room recommender.
4. THE ImmersiveNextActions SHALL render the suggestion bar as a `<div class="immersive-next-actions">` with `role="status"` and `aria-live="polite"`.
5. THE ImmersiveNextActions SHALL auto-dismiss the suggestion bar after 6 seconds.
6. THE ImmersiveNextActions SHALL provide a manual close button on the suggestion bar.
7. THE ImmersiveNextActions SHALL display at most one suggestion bar at any time; a new trigger event SHALL replace the existing bar.
8. WHERE `prefers-reduced-motion` is enabled, THE ImmersiveNextActions SHALL show and hide the suggestion bar without slide-in animation.

---

### Requirement 6: Room Recommendations

**User Story:** As a shopper in the immersive store, I want to receive a suggestion for the next room to visit based on my browsing behaviour so that I can discover relevant collections without manual exploration.

#### Acceptance Criteria

1. THE ImmersiveRoomRecommender SHALL evaluate recommendation rules on wishlist change, room exit, and panel close events.
2. WHEN the wishlist contains products tagged with bridal or mehndi categories, THE ImmersiveRoomRecommender SHALL recommend the `occasions` room.
3. WHEN the wishlist contains products from designer-house collections, THE ImmersiveRoomRecommender SHALL recommend the `designer_houses` room.
4. WHEN `designer_houses` has been visited but `occasions` has not, THE ImmersiveRoomRecommender SHALL recommend the `occasions` room.
5. WHEN `occasions` has been visited but `featured_collections` has not, THE ImmersiveRoomRecommender SHALL recommend the `featured_collections` room.
6. WHEN no other rule matches, THE ImmersiveRoomRecommender SHALL recommend the `lounge` room as the default fallback.
7. FOR any non-empty `visitedRooms` array, THE ImmersiveRoomRecommender SHALL return a recommendation and SHALL NOT return null.
8. WHEN a recommendation is shown, THE ImmersiveRoomRecommender SHALL render a dismissible chip in the bottom-right corner containing a room thumbnail, label, and reason string.
9. WHEN a user clicks the recommendation chip, THE ImmersiveRoomRecommender SHALL call `goToRoom()` with the recommended room key.
10. WHEN a user dismisses a recommendation, THE ImmersiveRoomRecommender SHALL store `immersive_rec_dismissed_{roomKey}` in sessionStorage and SHALL NOT show that recommendation again in the same session.
11. WHERE `window.ImmersiveRecommenderOverride` is defined, THE ImmersiveRoomRecommender SHALL call it with the current BrowsingContext and use its return value instead of the rule engine result.

---

### Requirement 7: Quick Add to Cart

**User Story:** As a shopper browsing product cards, I want a quick add button that opens a size selector without navigating to the full product panel so that I can add items to my cart faster.

#### Acceptance Criteria

1. THE ImmersiveQuickAdd SHALL add a `<button class="immersive-product-card__quick-add" data-quick-add>` to `immersive-product-card.liquid`.
2. WHEN a user clicks the quick-add button, THE ImmersiveQuickAdd SHALL fetch `/products/{handle}.js` for variant data, using the contentCache to avoid duplicate requests.
3. WHEN variant data is loaded and the product has more than one variant, THE ImmersiveQuickAdd SHALL render a modal with `role="dialog" aria-modal="true"` containing: product title, price, size radiogroup, and an "Add to cart" CTA.
4. WHEN a product has exactly one variant, THE ImmersiveQuickAdd SHALL skip the modal and add the product directly to cart, then show a success toast.
5. WHEN a user selects a variant and confirms, THE ImmersiveQuickAdd SHALL POST to `/cart/add.js`, show a success toast, update the cart badge, and close the modal.
6. WHEN the modal opens, THE ImmersiveQuickAdd SHALL trap focus within the modal and restore focus to the triggering button on close.
7. WHEN a user presses Escape while the modal is open, THE ImmersiveQuickAdd SHALL close the modal and restore focus to the triggering button.
8. WHILE a selected variant has `available === false`, THE ImmersiveQuickAdd SHALL disable the "Add to cart" CTA and display a "Sold out" label.
9. THE ImmersiveQuickAdd SHALL ensure at most one quick-add modal exists in the DOM at any time.
10. IF the product fetch fails, THEN THE ImmersiveQuickAdd SHALL display the `data-msg-load-product-error` toast and SHALL NOT open the modal.
11. IF the cart add POST fails, THEN THE ImmersiveQuickAdd SHALL display the `data-msg-error-add-to-cart` toast and keep the modal open for retry.
12. WHERE `prefers-reduced-motion` is enabled, THE ImmersiveQuickAdd SHALL open and close the modal without slide-in animation.

---

### Requirement 8: Limited-Time Indicators

**User Story:** As a shopper in the immersive store, I want to see countdown timers, low-stock badges, and flash sale alerts so that I am aware of time-sensitive offers without leaving the 3D experience.

#### Acceptance Criteria

1. WHEN a product has a `custom.sale_end_date` metafield set to a future ISO 8601 date, THE ImmersiveLimitedTime SHALL render a countdown timer inside the product card and product panel, updating every second.
2. WHEN a countdown timer reaches zero, THE ImmersiveLimitedTime SHALL set `expired = true` on the CountdownState and remove the countdown element from the DOM.
3. FOR any `endTime` in the future, THE ImmersiveLimitedTime SHALL ensure all fields of CountdownState (`days`, `hours`, `minutes`, `seconds`) are ≥ 0.
4. WHEN a product's `inventory_quantity` is less than or equal to the configured low-stock threshold (default: 5), THE ImmersiveLimitedTime SHALL render a low-stock badge on the product card using the `products.product.inventory_low_stock_show_count` locale key.
5. WHEN a flash sale block is configured in the `immersive-canvas.liquid` schema, THE ImmersiveLimitedTime SHALL render a dismissible banner above the bottom nav with the merchant-configured text and optional countdown.
6. WHEN a user dismisses the flash sale banner, THE ImmersiveLimitedTime SHALL store a dismissal flag in sessionStorage and SHALL NOT re-show the banner in the same session.
7. WHEN a panel closes or a room changes, THE ImmersiveLimitedTime SHALL clear all active countdown `setInterval` timers associated with that panel or room.
8. IF the `custom.sale_end_date` metafield value is not a valid ISO 8601 date, THEN THE ImmersiveLimitedTime SHALL silently skip rendering the countdown without throwing an error.
9. IF inventory data is unavailable for a product, THEN THE ImmersiveLimitedTime SHALL silently skip rendering the low-stock badge.
10. THE ImmersiveLimitedTime SHALL source the low-stock threshold from a configurable section setting with a default value of 5 units.
11. WHERE `prefers-reduced-motion` is enabled, THE ImmersiveLimitedTime SHALL update countdown numbers without CSS animation.
12. THE ImmersiveLimitedTime SHALL add `data-sale-end-date` and `data-inventory-quantity` attributes to `immersive-product-card.liquid` from product metafields.
