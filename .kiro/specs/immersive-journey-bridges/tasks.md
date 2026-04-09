# Implementation Plan: Immersive Journey Bridges

## Overview

Implement six bridge buttons connecting 2D Dawn pages back to the WebGL showroom with a rich Bridge Banner component, extend the URL parameter handler in `immersive-store.js` for collection and search deep-links, add a `openSearchPanel` function, wire the 3D mode preference manager, create device/connection-aware behavior detection, and inject the preference banner into `layout/theme.liquid`. All changes are purely additive — no existing Dawn functionality is altered.

## Tasks

- [x] 1. Update localisation keys and enhance bridge button snippet for Bridge Banner component
  - Update `locales/en.default.json` with expanded `sections.immersive_journey_bridges` keys (24 total: CTAs, aria-labels, headings, eyebrow, slow connection warning, preference banner text)
  - Update `snippets/immersive-bridge-btn.liquid` to accept new parameters: `bridge_heading`, `bridge_image`, `bridge_subtext`, `bridge_slow_connection_warning`
  - Render rich Bridge Banner component with:
    - Image preview (responsive, lazy-loaded) or placeholder SVG
    - Eyebrow text, heading, optional subtext
    - Pulsing dot animation indicator
    - CTA button with arrow icon
  - Include comprehensive `{% stylesheet %}` block with:
    - BEM naming (`.immersive-bridge-banner`, `.immersive-bridge-banner__*`)
    - Modifier classes for each bridge type (`--collection`, `--search`, `--product`, `--cart`, `--home`, `--back`)
    - Hover states with arrow animation
    - Focus-visible outline
    - Pulsing dot animation (2.4s cycle)
    - Reduced motion support
    - Responsive breakpoints (desktop, tablet, mobile)
  - _Requirements: 1.2, 1.4, 1.5, 3.2, 3.4, 3.5, 7.2, 7.4, 8.1, 8.3, 9.1, 11.2, 11.3, 11.4, 11.5, 13.2, 13.3, 13.4, 14.3, 14.4, 14.5, 15.1-15.14, 16.8_

- [x] 2. Update Collection Bridge and Search Bridge with Bridge Banner parameters
  - [x] 2.1 Update Collection Bridge in `sections/main-collection-product-grid.liquid`
    - Pass new parameters: `bridge_heading: collection.title`, `bridge_image: collection.image`, `bridge_class: '--collection'`, `bridge_slow_connection_warning`
    - _Requirements: 1.1, 1.3, 1.4, 10.1, 15.1-15.14, 16.8_

  - [ ]* 2.2 Write unit tests for Collection Bridge rendering conditions
    - Test: bridge renders when `products_count > 0`; bridge absent when `products_count == 0`
    - Test: `href` equals `/?open_collection={handle}`
    - Test: image is rendered when collection has featured image
    - _Requirements: 1.1, 1.3, 15.5_

  - [x] 2.3 Update Search Bridge in `sections/main-search.liquid`
    - Pass new parameters: `bridge_heading: 'sections.immersive_journey_bridges.search_heading' | t: terms: search.terms`, `bridge_class: '--search'`, `bridge_slow_connection_warning`
    - _Requirements: 3.1, 3.3, 3.4, 10.2, 15.1-15.14, 16.8_

  - [ ]* 2.4 Write unit tests for Search Bridge rendering conditions
    - Test: bridge renders when `search.performed` and `results_count > 0`; absent otherwise
    - Test: `href` equals `/?open_search={url_encoded_terms}`
    - _Requirements: 3.1, 3.3_

  - [ ]* 2.5 Write property test for bridge URL construction (Property 1)
    - **Property 1: Bridge URL construction is correct for all handle types**
    - **Validates: Requirements 1.1, 3.1, 11.1**
    - Use `fast-check` with `fc.stringMatching(/^[a-z0-9-]+$/)` to assert `buildBridgeUrl('open_collection', handle) === '/?open_collection=' + handle` and same for `open_product`

  - [ ]* 2.6 Write property test for bridge aria-label construction (Property 7)
    - **Property 7: Bridge aria-label contains the dynamic context value**
    - **Validates: Requirements 1.5, 3.5, 11.3**
    - Use `fast-check` with `fc.string({ minLength: 1, maxLength: 100 })` to assert `buildAriaLabel('collection', title)` contains `title`

- [x] 3. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create device/connection-aware bridge behavior script
  - Create `assets/bridge-behavior.js` with:
    - `initBridgeBehavior()` function that runs on DOMContentLoaded
    - `detectSlowConnection()` function using `navigator.connection` API with feature detection
    - `applyConstraintWarning()` function that modifies bridge UI for slow connections and motion sensitivity
    - CSS modifier classes: `.immersive-bridge-banner--slow-connection`, `.immersive-bridge-banner--reduced-motion`
  - Load script in `layout/theme.liquid` with `defer` attribute
  - _Requirements: 16.1-16.8_

- [x] 5. Update Product Bridge, Cart Bridge, Collections List Bridge, and Content Bridges with Bridge Banner parameters
  - [x] 5.1 Update Product Bridge in `sections/main-product.liquid`
    - Pass new parameters: `bridge_heading: product.title`, `bridge_image: product.featured_image`, `bridge_class: '--product'`, `bridge_slow_connection_warning`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 15.1-15.14, 16.8_

  - [x] 5.2 Update Cart Bridge in `sections/main-cart-items.liquid`
    - Pass new parameters: `bridge_heading: 'sections.immersive_journey_bridges.cart_heading' | t`, `bridge_class: '--cart'`, `bridge_slow_connection_warning`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 15.1-15.14, 16.8_

  - [x] 5.3 Update Collections List Bridge in `sections/main-list-collections.liquid`
    - Pass new parameters: `bridge_heading: 'sections.immersive_journey_bridges.collections_heading' | t`, `bridge_class: '--collections-list'`, `bridge_slow_connection_warning`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 15.1-15.14, 16.8_

  - [x] 5.4 Update Content Bridge in `sections/main-blog.liquid`
    - Pass new parameters: `bridge_heading: 'sections.immersive_journey_bridges.content_heading' | t`, `bridge_class: '--content'`, `bridge_slow_connection_warning`
    - _Requirements: 14.1, 14.3, 14.4, 14.5, 15.1-15.14, 16.8_

  - [x] 5.5 Update Content Bridge in `sections/main-article.liquid`
    - Pass new parameters: `bridge_heading: 'sections.immersive_journey_bridges.content_heading' | t`, `bridge_class: '--content'`, `bridge_slow_connection_warning`
    - _Requirements: 14.2, 14.3, 14.4, 14.5, 15.1-15.14, 16.8_

  - [ ]* 5.6 Write unit tests for Cart, Collections List, and Content Bridge rendering conditions
    - Test: Cart Bridge absent when `cart.item_count == 0`
    - Test: Collections List Bridge always renders on the collections list page
    - Test: Content Bridge renders on both blog and article pages
    - _Requirements: 7.1, 7.3, 13.1, 14.1, 14.2_

- [x] 6. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Extend URL parameter handler and implement `openSearchPanel` in `immersive-store.js`
  - [x] 7.1 Add `PREFERRED_MODE_KEY` constant alongside `ONBOARDING_KEY` and `WISHLIST_KEY`
    - `var PREFERRED_MODE_KEY = 'immersive_preferred_mode';`
    - _Requirements: 5.1_

  - [x] 7.2 Extend the URL parameter block inside `safeBindImmersiveInit` (or the equivalent init block)
    - Parse `open_product`, `open_collection`, and `open_search` with explicit priority: product → collection → search
    - Guard each with a non-empty check before calling the panel function
    - Wrap the entire block in `try/catch` (existing pattern)
    - Use 400 ms `setTimeout` for all three, matching the existing `open_product` timing
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 12.1, 12.2, 12.3, 12.4_

  - [ ]* 7.3 Write property test for URL parameter extraction (Property 2)
    - **Property 2: URL parameter parser extracts the correct value for any handle**
    - **Validates: Requirements 2.1, 2.2, 12.1, 12.2**
    - Use `fast-check` with `fc.stringMatching(/^[a-z0-9-]+$/)` to assert `new URLSearchParams('open_collection=' + handle).get('open_collection') === handle`

  - [ ]* 7.4 Write property test for URL parameter priority (Property 3)
    - **Property 3: open_product always wins over open_collection**
    - **Validates: Requirements 2.4, 12.4**
    - Use `fast-check` with two handle arbitraries to assert `resolveUrlParamDispatch('?open_product=X&open_collection=Y').type === 'product'`

  - [x] 7.5 Implement `openSearchPanel(encodedQuery)` function in `immersive-store.js`
    - Decode the query with `decodeURIComponent`; fall back to raw string if decode throws
    - Return early if query is empty or panel element not found
    - Fetch `shopRoot + 'search?q=' + encodeURIComponent(query) + '&section_id=immersive-product-grid'` via `fetchWithCache`
    - Render response into the glass panel using `transitionPanelContent`, `setupVariantButtons`, `setupImageParallax`, `syncAllWishlistToggles`
    - On error call `showErrorFeedback` with the existing `data-msg-load-collection-error` message
    - Track `trackImmersiveEvent('search_panel_opened', { query: query })`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.6 Write unit tests for `openSearchPanel` edge cases
    - Test: calling with empty string returns without fetching
    - Test: calling with a malformed `%` sequence falls back to raw string (no throw)
    - _Requirements: 4.2, 4.3_

  - [ ]* 7.7 Write property test for search query encode/decode round-trip (Property 4)
    - **Property 4: Search query encode/decode round-trip is lossless**
    - **Validates: Requirements 4.1, 4.3**
    - Use `fast-check` with `fc.string({ minLength: 1 })` (200 runs) to assert `decodeURIComponent(encodeURIComponent(terms)) === terms`

- [x] 8. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Preference Manager in `immersive-store.js`
  - [x] 9.1 Add `writeImmersivePreference()` function
    - Wraps `localStorage.setItem(PREFERRED_MODE_KEY, '3d')` in `try/catch`
    - Call it once inside `initImmersiveScene()`, after `hideLoader()` is called
    - _Requirements: 5.1, 5.2, 5.3, 10.4_

  - [x] 9.2 Add `readImmersivePreference()` function
    - Returns `localStorage.getItem(PREFERRED_MODE_KEY) === '3d'` inside `try/catch`; returns `false` on error
    - _Requirements: 6.1, 6.5_

  - [ ]* 9.3 Write property test for preference write idempotence and error swallowing (Property 5)
    - **Property 5: Preference write is idempotent and localStorage errors are swallowed**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Use `fast-check` with `fc.integer({ min: 1, max: 10 })` to assert N writes always result in `'3d'`; use a throwing mock storage to assert no exception propagates

  - [ ]* 9.4 Write property test for preference read on localStorage error (Property 6)
    - **Property 6: Preference read returns false when localStorage is unavailable**
    - **Validates: Requirements 6.5**
    - Use `fast-check` with `fc.anything()` and a throwing `getItem` mock to assert `readImmersivePreference(throwingStorage) === false`

- [x] 10. Inject Preference Banner into `layout/theme.liquid`
  - [x] 10.1 Add the banner HTML block
    - Wrap in `{%- unless template == 'page.immersive' or template == 'index' or template == 'password' -%}`
    - Render the `#immersive-preference-banner` element with `hidden`, `role="region"`, and `aria-label` from the locale key
    - Include the CTA link to `/pages/immersive-store` and the dismiss `<button>` with `data-preference-banner-dismiss`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 9.3_

  - [x] 10.2 Add the inline `<script>` block immediately after the banner HTML
    - Read `localStorage.getItem('immersive_preferred_mode')` inside `try/catch`
    - If value equals `'3d'`, call `banner.removeAttribute('hidden')`
    - Attach dismiss click handler: `banner.remove()`, then move focus to `banner.nextElementSibling`
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 9.2, 9.4_

  - [ ]* 10.3 Write unit tests for Preference Banner behaviour
    - Test: banner remains `hidden` when `localStorage` returns `null`
    - Test: banner is revealed when `localStorage` returns `'3d'`
    - Test: clicking dismiss removes the banner from the DOM; `localStorage` key is unchanged
    - Test: banner is absent from DOM on `page.immersive` and `index` templates (template guard)
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6_

- [x] 11. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All bridge buttons are purely additive — no existing Dawn markup is removed except the hardcoded product bridge in task 5.1
- The `{% stylesheet %}` block in `immersive-bridge-btn.liquid` is deduplicated by Shopify, so rendering the snippet multiple times on one page emits the CSS only once
- Property tests use `fast-check` with a minimum of 100 runs (200 for Property 4); test files live in `tests/`
- `writeImmersivePreference` and `readImmersivePreference` should accept an optional storage argument for testability (defaults to `window.localStorage`)
