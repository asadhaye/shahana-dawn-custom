# Requirements Document

## Introduction

This document defines requirements for **Immersive Store Enhancements v2** — two additive features built on top of the existing Dawn-based WebGL Shopify store experience:

- **Feature A**: Dynamic product recommendations rendered inside the glass product panel via Shopify's Ajax Product Recommendations API.
- **Feature B**: A first-time guided overlay (onboarding) that introduces the immersive experience to new visitors and is permanently dismissed via `localStorage`.

It also defines a verification requirement confirming that all previously-implemented changes from the `immersive-store-enhancements` spec are present and correct before new work begins.

All new code follows the established architecture: `assets/immersive-store.js` as the JS engine, Section Rendering API for panel content, `data-*` attributes for Liquid-to-JS data passing, `| t` filter for all user-facing strings, `{% stylesheet %}` blocks for scoped CSS, and `.immersive-*` / `.glass-product-section__*` selector namespacing.

---

## Glossary

- **ImmersiveStore**: The JavaScript engine in `assets/immersive-store.js` that drives the WebGL room experience.
- **GlassPanel**: The `role="dialog"` overlay (`#glass-panel`) that displays product and collection content fetched via Section Rendering API.
- **GlassProduct**: The `sections/glass-product.liquid` section rendered into GlassPanel for product detail views.
- **ImmersiveCanvas**: The `sections/immersive-canvas.liquid` section that renders the canvas, overlay UI, and all new HTML elements.
- **RecommendationsContainer**: The `<div data-related-root>` element rendered inside GlassProduct that receives dynamically fetched recommendation cards.
- **RecommendationsSection**: The new `sections/glass-product-recommendations.liquid` section that renders recommendation product cards.
- **OnboardingOverlay**: The `#immersive-onboarding` element rendered inside ImmersiveCanvas that displays first-time guidance.
- **ONBOARDING_KEY**: The `localStorage` key `'immersive_onboarding_seen'` used to persist dismissal state.
- **shopRoot**: The locale-aware URL root `(window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/'` already defined in `immersive-store.js`.
- **fetchWithCache**: The existing `fetchWithCache(url)` helper in `immersive-store.js` that caches responses by URL and adds `X-Requested-With: XMLHttpRequest`.
- **bindImmersiveInit**: The existing initialization function in `immersive-store.js` that calls `initImmersiveScene()`, `bindImmersiveNav()`, and `setupImageParallax()` on DOMContentLoaded.
- **ImmersiveFeatures**: A new file `assets/immersive-features.js` that contains extracted feature-specific functions from `immersive-store.js`, including panel setup functions (`setupVariantButtons`, `setupBuyNowForm`, `setupMediaThumbs`, `setupImageParallax`, `setupShareButton`, `setupDeliveryDates`, `setupVirtualTryOn`), product recommendations (`loadProductRecommendations`), onboarding (`showImmersiveOnboardingIfNeeded`), and other utility functions.

---

## Requirements

### Requirement 0: Verification of Previously Implemented Changes

**User Story:** As a developer, I want to confirm that all changes from the previous spec are present in the codebase, so that the new features can build on a known-good foundation without re-implementing anything.

#### Acceptance Criteria

1. THE `assets/immersive-store.js` file SHALL contain a `shopRoot` variable initialized from `window.Shopify.routes.root` with a trailing-slash guard.
2. THE `assets/immersive-store.js` file SHALL contain a `trackImmersiveEvent(name, params)` function that pushes to `window.dataLayer` and calls `window.fbq`.
3. THE `assets/immersive-store.js` file SHALL contain `saveState(patch)`, `loadState()`, and `clearState()` functions that read and write to `sessionStorage` under the key `immersive_state`.
4. THE `assets/immersive-store.js` file SHALL contain a `fetchWithCache(url)` function that caches responses by URL.
5. THE `assets/immersive-store.js` file SHALL contain a `mergeDynamicRoomConfig()` IIFE that reads from `#immersive-rooms-config` and merges values into `STORE_ROOMS`.
6. THE `sections/immersive-canvas.liquid` file SHALL contain a `<script type="application/json" id="immersive-rooms-config">` block with per-room texture URL and hotspot data derived from flat section settings.
7. THE `sections/immersive-canvas.liquid` schema SHALL include image picker and collection picker settings for all five rooms (`storefront`, `lounge`, `designer_houses`, `occasions`, `featured_collections`).
8. THE `sections/immersive-canvas.liquid` schema SHALL include settings for the `featured_collections` room with at least three collection picker slots.

---

### Requirement 1: Dynamic Product Recommendations in the Glass Product Panel

**User Story:** As a shopper viewing a product in the immersive store, I want to see related product suggestions at the bottom of the product panel, so that I can discover more items without closing the panel or leaving the experience.

#### Acceptance Criteria

1. THE `sections/glass-product.liquid` file SHALL render a `<div class="glass-product-section__related" data-related-root>` container element near the bottom of the product section, inside the `{% if panel_product %}` block.
2. THE root `<section>` element in `sections/glass-product.liquid` SHALL carry a `data-product-id="{{ panel_product.id }}"` attribute and a `data-product-handle="{{ panel_product.handle }}"` attribute.
3. WHEN `openProductPanel(handle, collectionHandle)` is called and panel content is injected, THE ImmersiveStore SHALL call `loadProductRecommendations(panel)` passing the panel element.
4. WHEN `loadProductRecommendations(panel)` is called, THE ImmersiveStore SHALL read `data-product-id` from the panel's product section element and fetch from `shopRoot + 'recommendations/products?product_id=' + productId + '&limit=4&intent=related'` using `fetchWithCache`.
5. WHEN the recommendations fetch succeeds and returns product HTML, THE ImmersiveStore SHALL inject the response HTML into the `[data-related-root]` element.
6. IF the `[data-related-root]` element is not found in the panel, THEN THE ImmersiveStore SHALL exit `loadProductRecommendations` silently without throwing an error.
7. IF the recommendations fetch fails or returns a non-OK response, THEN THE ImmersiveStore SHALL leave the `[data-related-root]` element unchanged and not throw an error.
8. THE `sections/glass-product-recommendations.liquid` file SHALL render product cards for the recommendations response, with each card containing a `data-product-handle` attribute on the anchor element for JS click interception.
9. WHEN a recommendation card anchor is clicked inside the panel, THE ImmersiveStore SHALL intercept the click via `preventDefault()` and open the product panel for that handle.
10. THE recommendation card images SHALL use `loading="lazy"` and include explicit `width` and `height` attributes.
11. THE `sections/glass-product-recommendations.liquid` stylesheet block SHALL namespace all selectors under `.glass-product-section__related` or `.immersive-rec-card`.

---

### Requirement 2: First-Time Guided Overlay for the Immersive Experience

**User Story:** As a first-time visitor to the immersive store, I want to see a brief overlay explaining how to navigate the experience, so that I understand how to interact with hotspots and panels before I start exploring.

#### Acceptance Criteria

1. THE `sections/immersive-canvas.liquid` file SHALL render a `<div id="immersive-onboarding">` element with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="immersive-onboarding-title"`, and the `hidden` attribute set by default.
2. THE OnboardingOverlay SHALL contain a title element with `id="immersive-onboarding-title"` whose text is sourced from the `sections.immersive_store.onboarding.title` locale key.
3. THE OnboardingOverlay SHALL contain a description paragraph whose text is sourced from the `sections.immersive_store.onboarding.description` locale key.
4. THE OnboardingOverlay SHALL contain a dismiss button of `type="button"` with `data-onboarding-dismiss` attribute whose label text is sourced from the `sections.immersive_store.onboarding.dismiss` locale key.
5. THE `assets/immersive-store.js` file SHALL define a constant `ONBOARDING_KEY = 'immersive_onboarding_seen'`.
6. THE `assets/immersive-store.js` file SHALL define a `showImmersiveOnboardingIfNeeded()` function.
7. WHEN `showImmersiveOnboardingIfNeeded()` is called and `localStorage.getItem(ONBOARDING_KEY)` returns a truthy value, THE ImmersiveStore SHALL not show the OnboardingOverlay.
8. WHEN `showImmersiveOnboardingIfNeeded()` is called and `localStorage.getItem(ONBOARDING_KEY)` returns a falsy value, THE ImmersiveStore SHALL remove the `hidden` attribute from `#immersive-onboarding` and move focus to the dismiss button.
9. WHEN the dismiss button (`[data-onboarding-dismiss]`) is clicked, THE ImmersiveStore SHALL set `localStorage.setItem(ONBOARDING_KEY, '1')`, restore the `hidden` attribute on `#immersive-onboarding`, and return focus to the element that had focus before the overlay opened.
10. WHEN `bindImmersiveInit()` completes `setupImageParallax()`, THE ImmersiveStore SHALL call `showImmersiveOnboardingIfNeeded()` as the next step.
11. IF `localStorage` is unavailable (e.g. private browsing with storage blocked), THEN THE ImmersiveStore SHALL catch the exception and treat the onboarding as unseen, showing the overlay without throwing an error.
12. THE `sections/immersive-canvas.liquid` `{% stylesheet %}` block SHALL include CSS styles for `#immersive-onboarding` and its child elements, namespaced under `.immersive-onboarding` or `#immersive-onboarding`.
13. THE OnboardingOverlay CSS SHALL include a `@media (prefers-reduced-motion: reduce)` block that suppresses any entry animation.
14. THE `locales/en.default.json` file SHALL define `sections.immersive_store.onboarding.title`, `sections.immersive_store.onboarding.description`, and `sections.immersive_store.onboarding.dismiss` locale keys with appropriate English values.

---

### Requirement 3: Locale Key Completeness for New UI Strings

**User Story:** As a theme developer, I want all new user-facing strings introduced by these features to be defined as locale keys, so that the store can be translated without modifying template files.

#### Acceptance Criteria

1. THE `locales/en.default.json` file SHALL define all new user-facing strings under the `sections.immersive_store` namespace using the `| t` filter in all Liquid templates.
2. THE `sections/immersive-canvas.liquid` file SHALL use the `| t` filter for every new user-facing string in the OnboardingOverlay, with no hard-coded English text.
3. THE `sections/glass-product-recommendations.liquid` file SHALL use the `| t` filter for any user-facing strings it renders (e.g. loading state, empty state, or ARIA labels).

---

### Requirement 4: Feature Extraction and Code Organization

**User Story:** As a developer maintaining the immersive store, I want feature-specific functions to be organized into a dedicated `immersive-features.js` file, so that the codebase is more maintainable and easier to understand.

#### Acceptance Criteria

1. THE `assets/immersive-features.js` file SHALL contain all feature-specific functions extracted from `assets/immersive-store.js`.
2. ALL functions in `immersive-features.js` SHALL maintain the same signatures and behavior as their counterparts in `immersive-store.js`.
3. NO new dependencies SHALL be introduced in `immersive-features.js` — it SHALL depend only on `immersive-store.js` and standard browser APIs.
4. WHEN `immersive-features.js` is loaded, ALL functions SHALL be available as global functions on the `window` object.
5. THE `layout/theme.liquid` file SHALL load `immersive-features.js` AFTER `immersive-store.js` to ensure all dependencies are available.
6. IF `localStorage` is unavailable (e.g. private browsing with storage blocked), THEN ALL functions in `immersive-features.js` SHALL catch exceptions and handle the error gracefully without throwing.
7. ALL user-facing strings in `immersive-features.js` SHALL use the `| t` filter in Liquid templates and be defined in `locales/en.default.json`.
8. ALL `sessionStorage`/`localStorage` calls in `immersive-features.js` SHALL be wrapped in `try/catch` blocks to handle private browsing.
9. WHEN a function in `immersive-features.js` is called with the same inputs as its counterpart in `immersive-store.js`, THEN the output SHALL be identical.
10. THE `assets/immersive-features.js` file SHALL include a comment block at the top explaining the purpose of the file and the principles of feature extraction.
