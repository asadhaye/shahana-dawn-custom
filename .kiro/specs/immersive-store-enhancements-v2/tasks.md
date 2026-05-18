# Implementation Plan: Immersive Store Enhancements v2

## Overview

Implement two additive features on top of the existing WebGL immersive store: dynamic product recommendations fetched via Shopify's Ajax Recommendations API and injected into the glass product panel (Feature A), and a first-time onboarding overlay dismissed via `localStorage` (Feature B). A read-only verification pass (Task 0) confirms the previously-implemented foundation before any code changes.

## Tasks

- [x] 0. Verify previously-implemented foundation (read-only)
  - Read `assets/immersive-store.js` and confirm all of the following are present:
    - `shopRoot` variable initialized from `window.Shopify.routes.root` with trailing-slash guard
    - `trackImmersiveEvent(name, params)` function with `window.dataLayer.push` and `window.fbq` calls
    - `saveState(patch)`, `loadState()`, `clearState()` functions referencing `STATE_KEY = 'immersive_state'` and `sessionStorage`
    - `fetchWithCache(url)` function using `contentCache` object and `X-Requested-With` header
    - `(function mergeDynamicRoomConfig()` IIFE reading `#immersive-rooms-config` and merging into `STORE_ROOMS`
  - Read `sections/immersive-canvas.liquid` and confirm:
    - `<script type="application/json" id="immersive-rooms-config">` block is present with per-room texture and hotspot data
    - Schema contains `image_picker` and `collection_picker` settings for all five rooms
    - Schema contains at least three `collection_picker` settings for the `featured_collections` room
  - Document any missing items as inline comments before proceeding to Task 1
  - _Requirements: 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8_

- [x] 1. Feature A — Prepare `glass-product.liquid` for dynamic recommendations
  - [x] 1.1 Add `data-product-id` and `data-product-handle` attributes to the root `<section>` element
    - Modify the opening `<section class="glass-product-section" ...>` tag in `sections/glass-product.liquid` to include `data-product-id="{{ panel_product.id }}"` and `data-product-handle="{{ panel_product.handle }}"` alongside the existing attributes
    - _Requirements: 1.2_
  - [x] 1.2 Replace the static "You May Also Like" block with a `data-related-root` container
    - Remove the existing static collection-based related products block (the `{% if related_collection ... %}` block near the bottom of the `{% if panel_product %}` block)
    - Add `<div class="glass-product-section__related" data-related-root></div>` in its place, inside the `{% if panel_product %}` block, after the collapsibles `<div>`
    - _Requirements: 1.1_

- [x] 2. Feature A — Create `sections/glass-product-recommendations.liquid`
  - [x] 2.1 Create the new section file with product card markup
    - Create `sections/glass-product-recommendations.liquid`
    - Guard the entire output with `{% if recommendations.performed and recommendations.products_count > 0 %}`
    - Render a heading using `{{ 'sections.immersive.product_panel.related_heading' | t }}`
    - Render a grid of `<a>` cards, each with `data-product-handle="{{ product.handle }}"`, `href="{{ product.url }}"`, and `aria-label="{{ 'sections.immersive_store.recommendations.card_aria' | t: title: product.title | escape }}"`
    - Each card image must use `loading="lazy"` with explicit `width` and `height` attributes
    - _Requirements: 1.8, 1.9, 1.10, 3.1, 3.3_
  - [ ]* 2.2 Write property test for recommendation card structure
    - **Property 5: Recommendation card structure**
    - **Validates: Requirements 1.8, 1.10**
  - [x] 2.3 Add namespaced CSS in a `{% stylesheet %}` block
    - Add a `{% stylesheet %}` block to `sections/glass-product-recommendations.liquid`
    - All selectors must be namespaced under `.glass-product-section__related` or `.immersive-rec-card`
    - Include a `@media (prefers-reduced-motion: reduce)` block suppressing hover transforms
    - _Requirements: 1.11_

- [x] 3. Feature A — Add `loadProductRecommendations` to `immersive-store.js`
  - [x] 3.1 Implement the `loadProductRecommendations(panel)` function
    - Add `function loadProductRecommendations(panel)` to `assets/immersive-store.js` after `openProductPanel`
    - Read `data-product-id` from `panel.querySelector('.glass-product-section')`; return early if element or attribute is missing (Requirement 1.6)
    - Read `[data-related-root]` from panel; return early if missing (Requirement 1.6)
    - Construct URL: `shopRoot + 'recommendations/products?product_id=' + productId + '&limit=4&intent=related&section_id=glass-product-recommendations'`
    - Call `fetchWithCache(url)`, inject response HTML into `relatedRoot.innerHTML` on success
    - Swallow errors in `.catch` — leave `relatedRoot` unchanged on failure (Requirement 1.7)
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_
  - [ ]* 3.2 Write property test for recommendations fetch and inject round-trip
    - **Property 4: Recommendations fetch and inject round-trip**
    - **Validates: Requirements 1.4, 1.5**
  - [x] 3.3 Call `loadProductRecommendations(panel)` inside `openProductPanel`
    - In `assets/immersive-store.js`, locate the `render()` function inside `openProductPanel` (the function that sets `contentArea.innerHTML` and calls `setupVariantButtons`, `setupBuyNowForm`, etc.)
    - Add `loadProductRecommendations(panel);` as the last call inside that `render()` function
    - _Requirements: 1.3_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Feature B — Add onboarding overlay HTML to `immersive-canvas.liquid`
  - [x] 5.1 Add the `#immersive-onboarding` dialog element
    - In `sections/immersive-canvas.liquid`, add the overlay `<div>` inside `<section id="immersive-store-...">`, after the cookie banner `<div>` and before the closing `</section>`
    - Element must have: `id="immersive-onboarding"`, `class="immersive-onboarding"`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby="immersive-onboarding-title"`, `hidden`
    - Inner structure: title `<h2 id="immersive-onboarding-title">` using `{{ 'sections.immersive_store.onboarding.title' | t }}`, description `<p>` using `{{ 'sections.immersive_store.onboarding.description' | t }}`, dismiss `<button type="button" data-onboarding-dismiss>` using `{{ 'sections.immersive_store.onboarding.dismiss' | t }}`
    - No hard-coded English strings — all text via `| t` filter
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_
  - [x] 5.2 Add CSS for the onboarding overlay in the `{% stylesheet %}` block
    - Add styles for `#immersive-onboarding` and `.immersive-onboarding__*` child elements to the existing `{% stylesheet %}` block in `sections/immersive-canvas.liquid`
    - Include overlay positioning (fixed, centered, high z-index), backdrop, inner card styles, and dismiss button styles
    - Include `@media (prefers-reduced-motion: reduce)` block suppressing any entry animation
    - _Requirements: 2.12, 2.13_

- [x] 6. Feature B — Add `ONBOARDING_KEY` and `showImmersiveOnboardingIfNeeded` to `immersive-store.js`
  - [x] 6.1 Add the `ONBOARDING_KEY` constant
    - Add `var ONBOARDING_KEY = 'immersive_onboarding_seen';` near the top of `assets/immersive-store.js`, alongside the other constants (`STATE_KEY`, etc.)
    - _Requirements: 2.5_
  - [x] 6.2 Implement `showImmersiveOnboardingIfNeeded()`
    - Add `function showImmersiveOnboardingIfNeeded()` to `assets/immersive-store.js`
    - Get `#immersive-onboarding`; return early if not found
    - Wrap `localStorage.getItem(ONBOARDING_KEY)` in `try/catch`; treat exception as unseen (Requirement 2.11)
    - If seen (truthy), return without showing
    - If unseen: save `document.activeElement` as `previousFocus`, call `overlay.removeAttribute('hidden')`, focus the dismiss button via `requestAnimationFrame`
    - Attach a one-time `click` listener on `[data-onboarding-dismiss]` that: calls `localStorage.setItem(ONBOARDING_KEY, '1')` in `try/catch`, calls `overlay.setAttribute('hidden', '')`, restores focus to `previousFocus` via `requestAnimationFrame`
    - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.11_
  - [ ]* 6.3 Write property test for onboarding visibility controlled by localStorage
    - **Property 6: Onboarding visibility controlled by localStorage**
    - **Validates: Requirements 2.7, 2.8**
  - [ ]* 6.4 Write property test for onboarding dismiss round-trip
    - **Property 7: Onboarding dismiss round-trip**
    - **Validates: Requirements 2.9**
  - [x] 6.5 Update `bindImmersiveInit()` to call `showImmersiveOnboardingIfNeeded()`
    - In `assets/immersive-store.js`, locate `bindImmersiveInit()` and add `showImmersiveOnboardingIfNeeded();` as the line immediately after `setupImageParallax();` inside the `requestAnimationFrame` callback
    - _Requirements: 2.10_

- [x] 7. Add locale keys to `locales/en.default.json`
  - [x] 7.1 Add onboarding locale keys under `sections.immersive_store`
    - In `locales/en.default.json`, add an `"onboarding"` object inside `"sections"."immersive_store"` with keys: `"title": "Welcome to the Immersive Store"`, `"description": "Tap the glowing hotspots to explore collections. Tap any product to view details and add to cart."`, `"dismiss": "Start exploring"`
    - _Requirements: 2.14, 3.1_
  - [x] 7.2 Add recommendations locale keys under `sections.immersive_store`
    - In `locales/en.default.json`, add a `"recommendations"` object inside `"sections"."immersive_store"` with keys: `"heading": "You May Also Like"`, `"card_aria": "View {{ title }}"`
    - _Requirements: 3.1, 3.3_

- [x] 10. Feature C — Feature extraction to `immersive-features.js`
  - [x] 10.1 Extract panel setup functions from `immersive-store.js`
    - Move `setupVariantButtons`, `setupBuyNowForm`, `setupMediaThumbs`, `setupImageParallax`, `setupShareButton`, `setupDeliveryDates`, `setupVirtualTryOn` to `assets/immersive-features.js`
    - Ensure all functions maintain the same signatures and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.2 Extract product recommendations function
    - Move `loadProductRecommendations` to `assets/immersive-features.js`
    - Ensure the function maintains the same signature and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.3 Extract onboarding function
    - Move `showImmersiveOnboardingIfNeeded` to `assets/immersive-features.js`
    - Ensure the function maintains the same signature and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.4 Extract wishlist manager functions
    - Move `getWishlist`, `_persistWishlist`, `updateWishlistBadge`, `syncAllWishlistToggles`, `addToWishlist`, `removeFromWishlist`, `toggleWishlistItem`, `cacheWishlistProduct`, `renderWishlistPanel`, `openWishlistPanel`, `closeWishlistPanel`, `initWishlist` to `assets/immersive-features.js`
    - Ensure all functions maintain the same signatures and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.5 Extract filter functions
    - Move `initImmersiveFilters`, `saveFilters`, `loadFilters`, `buildFilterUrl` to `assets/immersive-features.js`
    - Ensure all functions maintain the same signatures and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.6 Extract next actions functions
    - Move `showNextActions`, `dismissNextActions`, `showAfterAddToCart` to `assets/immersive-features.js`
    - Ensure all functions maintain the same signatures and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.7 Extract room recommender functions
    - Move `getRecommendation`, `evaluateRoomRecommendation`, `showRoomRecommendation`, `trackRoomVisit` to `assets/immersive-features.js`
    - Ensure all functions maintain the same signatures and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.8 Extract limited time functions
    - Move `computeCountdown`, `renderCountdown`, `renderLowStockBadge`, `scanLimitedTimeCards`, `showFlashSaleAlert` to `assets/immersive-features.js`
    - Ensure all functions maintain the same signatures and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.9 Extract editorial functions
    - Move `ImmersiveEditorial.init`, `initDesignersTimeline`, `initStoryChapters`, `initGalleryDrag`, `initArtifactStudy` to `assets/immersive-features.js`
    - Ensure all functions maintain the same signatures and behavior as in `immersive-store.js`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 10.10 Update `layout/theme.liquid` to load `immersive-features.js`
    - Add `<script src="{{ 'immersive-features.js' | asset_url }}" defer="defer"></script>` after `immersive-store.js` in the `page.immersive` conditional block
    - _Requirements: 4.4, 4.5_
  - [x] 10.11 Add feature extraction comment block to `immersive-features.js`
    - Add a comment block at the top of `assets/immersive-features.js` explaining the purpose of the file and the principles of feature extraction
    - _Requirements: 4.10_

- [x] 11. Set up property-based test infrastructure and write all property tests
  - [x] 11.1 Set up fast-check test infrastructure
    - Confirm `fast-check` is available in `package.json` (install if missing: `npm install --save-dev fast-check`)
    - Create `tests/` directory with `unit/` and `property/` subdirectories
    - Create shared test helpers: `buildMockPanel(productId)`, `buildMockOverlay()`, `mockLocalStorage(key, value)`, `clearMockLocalStorage()`, `parseHTML(html)` in a `tests/helpers.js` file
  - [ ]* 11.2 Write property test — Property 1: State round-trip
    - Create `tests/property/state-roundtrip.property.test.js`
    - Use `fc.record({ room: fc.string(), panel: fc.option(fc.string()), product: fc.option(fc.string()) })` as the arbitrary
    - Assert that `loadState()` after `saveState(patch)` returns an object containing all patch key-value pairs
    - **Property 1: State round-trip**
    - **Validates: Requirements 0.3**
  - [ ]* 11.3 Write property test — Property 2: fetchWithCache idempotence
    - Create `tests/property/fetch-cache.property.test.js`
    - Mock `global.fetch` to count calls; reset `contentCache` between runs
    - Assert that two sequential calls to `fetchWithCache(url)` result in exactly one network request
    - **Property 2: fetchWithCache idempotence**
    - **Validates: Requirements 0.4**
  - [ ]* 11.4 Write property test — Property 3: Recommendations data attributes on product section
    - Create `tests/property/product-section-attrs.property.test.js`
    - Use `fc.record({ id: fc.integer({ min: 1 }), handle: fc.stringMatching(/^[a-z0-9-]+$/) })` as the arbitrary
    - Parse rendered HTML and assert `section.dataset.productId` and `section.dataset.productHandle` match the product fixture
    - **Property 3: Recommendations data attributes on product section**
    - **Validates: Requirements 1.2**
  - [ ]* 11.5 Write property test — Property 4: Recommendations fetch and inject round-trip
    - Create `tests/property/recommendations-inject.property.test.js`
    - Use `fc.integer({ min: 1 })` and `fc.string({ minLength: 1 })` as arbitraries
    - Mock `fetchWithCache` to return `responseHtml`; assert `[data-related-root].innerHTML === responseHtml` after `loadProductRecommendations(panel)`
    - **Property 4: Recommendations fetch and inject round-trip**
    - **Validates: Requirements 1.4, 1.5**
  - [ ]* 11.6 Write property test — Property 5: Recommendation card structure
    - Create `tests/property/rec-card-structure.property.test.js`
    - Use `fc.array(fc.record({ handle: fc.stringMatching(/^[a-z0-9-]+$/), title: fc.string() }), { minLength: 1, maxLength: 4 })` as the arbitrary
    - Parse rendered HTML; assert every `a[data-product-handle]` has a non-empty handle and every `img` has `loading="lazy"` plus non-zero `width` and `height`
    - **Property 5: Recommendation card structure**
    - **Validates: Requirements 1.8, 1.10**
  - [ ]* 11.7 Write property tests — Properties 6 & 7: Onboarding visibility and dismiss round-trip
    - Create `tests/property/onboarding-visibility.property.test.js`
    - Property 6: use `fc.option(fc.oneof(fc.constant('1'), fc.string({ minLength: 1 })))` as the arbitrary; assert overlay is hidden iff stored value is truthy
    - Property 7: use `fc.constant(null)`; call `showImmersiveOnboardingIfNeeded()`, simulate dismiss click, assert `hidden` attribute is set and `localStorage.getItem(ONBOARDING_KEY)` is truthy
    - **Property 6: Onboarding visibility controlled by localStorage**
    - **Property 7: Onboarding dismiss round-trip**
    - **Validates: Requirements 2.7, 2.8, 2.9**
  - [ ]* 11.8 Write property test — Property 8: Feature extraction API consistency
    - Create `tests/property/features-api-consistency.property.test.js`
    - For each function in `immersive-features.js`, compare output with corresponding function in `immersive-store.js`
    - **Property 8: Feature extraction API consistency**
    - **Validates: Requirement 4**
  - [ ]* 11.9 Write property test — Property 9: Wishlist state round-trip
    - Create `tests/property/wishlist-roundtrip.property.test.js`
    - Use `fc.string()` as the arbitrary for product handle
    - Assert that `getWishlist()` after `addToWishlist(handle)` contains the handle
    - **Property 9: Wishlist state round-trip**
    - **Validates: Requirement 4**
  - [ ]* 11.10 Write property test — Property 10: Filter state persistence
    - Create `tests/property/filter-persistence.property.test.js`
    - Use `fc.record({ colors: fc.array(fc.string()), priceMin: fc.option(fc.string()), priceMax: fc.option(fc.string()), sortBy: fc.string() })` as the arbitrary
    - Assert that `loadFilters(roomKey)` after `saveFilters(roomKey, state)` returns the same state
    - **Property 10: Filter state persistence**
    - **Validates: Requirement 4**

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    ["0"],
    ["1", "5"],
    ["2"],
    ["3"],
    ["6"],
    ["7"],
    ["10"],
    ["11"],
    ["12"]
  ],
  "tasks": {
    "0": "Verify previously-implemented foundation",
    "1": "Feature A — Prepare glass-product.liquid",
    "2": "Feature A — Create glass-product-recommendations.liquid",
    "3": "Feature A — Add loadProductRecommendations",
    "5": "Feature B — Add onboarding overlay HTML",
    "6": "Feature B — Add onboarding JS",
    "7": "Add locale keys",
    "10": "Feature C — Feature extraction",
    "11": "Set up property-based test infrastructure",
    "12": "Final checkpoint"
  }
}
```

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Task 0 is read-only — no file modifications; document gaps as comments only
- Task 1.2 removes the static collection-based related products block; the dynamic `loadProductRecommendations` function (Task 3) replaces it entirely
- The existing `panel.onclick` handler in `openProductPanel` already intercepts `a[data-product-handle]` clicks — no additional click handler is needed for recommendation cards (Requirement 1.9)
- All `localStorage`/`sessionStorage` calls must be wrapped in `try/catch` to handle private browsing (Requirements 2.11, 4.6)
- Property tests require a test runner that supports async properties; configure fast-check with `{ numRuns: 100 }`
- Feature extraction (Task 10) is a refactoring effort to improve code organization; all functions in `immersive-features.js` must maintain the same API as in `immersive-store.js` (Requirement 4.2)
