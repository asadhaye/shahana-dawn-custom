# Requirements Document

## Introduction

The Immersive Journey Bridges feature completes the end-to-end 3D shopping experience for Shahana Collection by connecting the remaining "2D islands" — collection pages, search results, and the cart — back into the WebGL showroom. It also introduces a persistent 3D mode preference so returning visitors are guided back to the immersive experience automatically.

The six bridges are:
1. **Collection Bridge** — a CTA on `/collections/*` pages that deep-links into the 3D room for that collection.
2. **Search Bridge** — a CTA on `/search` results pages that re-opens the 3D store with the search query pre-applied.
3. **3D Mode Preference** — a `localStorage` flag that remembers the user's preferred shopping mode and surfaces a re-entry prompt on 2D pages.
4. **Cart Continuity** — a "Return to 3D Browsing" link on the full cart page.
5. **Product Bridge** — a CTA on individual product pages (`/products/*`) that deep-links into the 3D store with that product pre-opened, replacing the existing hardcoded implementation.
6. **Content Page Bridges** — CTAs on the collections list page (`/collections`), blog index pages, and article pages linking back to the immersive store for users arriving from search engines or direct links.

All bridges must be non-intrusive progressive enhancements: the standard Dawn templates remain fully functional without JavaScript.

---

## Glossary

- **Bridge_Button**: A Liquid-rendered anchor element on a 2D page that links back to the immersive store with a deep-link URL parameter.
- **Collection_Bridge**: The Bridge_Button rendered on `sections/main-collection-product-grid.liquid`.
- **Search_Bridge**: The Bridge_Button rendered on `sections/main-search.liquid` when search results are present.
- **Cart_Bridge**: The Bridge_Button rendered on `sections/main-cart-items.liquid`.
- **Product_Bridge**: The Bridge_Button rendered on `sections/main-product.liquid`, replacing the existing hardcoded implementation, linking to `/?open_product={{ product.handle }}`.
- **Collections_List_Bridge**: The Bridge_Button rendered on `sections/main-list-collections.liquid`, linking to `/pages/immersive-store`.
- **Content_Bridge**: The Bridge_Button rendered on `sections/main-blog.liquid` and `sections/main-article.liquid`, linking to `/pages/immersive-store`.
- **Preference_Manager**: The JavaScript module within `assets/immersive-store.js` responsible for reading and writing the `immersive_preferred_mode` localStorage key.
- **Preference_Banner**: A non-blocking UI element injected by `layout/theme.liquid` on 2D pages when the `immersive_preferred_mode` flag is set to `'3d'`.
- **Immersive_Store**: The WebGL-powered 3D showroom running on `/` and `/pages/immersive-store`.
- **URL_Param_Handler**: The existing URL parameter parsing logic in `assets/immersive-store.js` that already handles `open_product`; extended by this feature to also handle `open_collection` and `open_search`.
- **Dawn**: The base Shopify theme this project extends.

---

## Requirements

### Requirement 1: Collection Bridge Button

**User Story:** As a shopper browsing a standard collection page, I want a prominent button to explore that collection inside the 3D showroom, so that I can switch to the immersive experience without losing my context.

#### Acceptance Criteria

1. WHEN a collection page is rendered and the collection has at least one product, THE Collection_Bridge SHALL render a visible anchor element above the product grid with the link `/?open_collection={{ collection.handle }}`.
2. THE Collection_Bridge SHALL display localised label text sourced from the `sections.immersive_journey_bridges.collection_cta` translation key.
3. WHEN a collection page is rendered and the collection has zero products, THE Collection_Bridge SHALL not be rendered.
4. THE Collection_Bridge SHALL be a standard `<a>` element so it functions as a navigation link without JavaScript.
5. THE Collection_Bridge SHALL include an `aria-label` attribute that incorporates the collection title, sourced from the `sections.immersive_journey_bridges.collection_cta_aria` translation key.

---

### Requirement 2: Collection Deep-Link URL Parameter

**User Story:** As a shopper arriving at the homepage via a Collection Bridge link, I want the 3D store to automatically open the correct collection panel, so that I land directly in the right context.

#### Acceptance Criteria

1. WHEN the Immersive_Store initialises and the URL contains the `open_collection` query parameter, THE URL_Param_Handler SHALL call `openCollectionPanel` with the parameter value after the scene is ready.
2. WHEN the `open_collection` parameter value is an empty string, THE URL_Param_Handler SHALL not call `openCollectionPanel`.
3. THE URL_Param_Handler SHALL handle the `open_collection` parameter using the same timing pattern (400 ms `setTimeout`) as the existing `open_product` handler.
4. WHEN both `open_product` and `open_collection` parameters are present in the URL, THE URL_Param_Handler SHALL prioritise `open_product` and ignore `open_collection`.

---

### Requirement 3: Search Bridge Button

**User Story:** As a shopper viewing standard search results, I want a button to view those results inside the 3D store, so that I can continue browsing immersively.

#### Acceptance Criteria

1. WHEN a search has been performed and `search.results_count` is greater than zero, THE Search_Bridge SHALL render a visible anchor element in the search results header area with the link `/?open_search={{ search.terms | url_encode }}`.
2. THE Search_Bridge SHALL display localised label text sourced from the `sections.immersive_journey_bridges.search_cta` translation key.
3. WHEN `search.results_count` is zero or a search has not been performed, THE Search_Bridge SHALL not be rendered.
4. THE Search_Bridge SHALL be a standard `<a>` element so it functions as a navigation link without JavaScript.
5. THE Search_Bridge SHALL include an `aria-label` attribute that incorporates the search terms, sourced from the `sections.immersive_journey_bridges.search_cta_aria` translation key.

---

### Requirement 4: Search Deep-Link URL Parameter

**User Story:** As a shopper arriving at the homepage via a Search Bridge link, I want the 3D store to open with the search query visible, so that I can find the same products in the immersive environment.

#### Acceptance Criteria

1. WHEN the Immersive_Store initialises and the URL contains the `open_search` query parameter with a non-empty value, THE URL_Param_Handler SHALL fetch search results using the Section Rendering API at the URL `/search?q={decoded_query}&section_id=immersive-product-grid` and render the response into the glass panel.
2. WHEN the `open_search` parameter value is an empty string, THE URL_Param_Handler SHALL not trigger a search panel.
3. THE URL_Param_Handler SHALL URL-decode the `open_search` parameter value before constructing the Section Rendering fetch URL.
4. THE URL_Param_Handler SHALL reuse the existing `immersive-product-grid` section for search results rendering; no dedicated `glass-search.liquid` section is required.

---

### Requirement 5: 3D Mode Preference — Writing the Flag

**User Story:** As a shopper who enters the 3D store, I want the site to remember my preference, so that I am guided back to the immersive experience on future visits.

#### Acceptance Criteria

1. WHEN a user successfully enters the Immersive_Store (i.e. `initImmersiveScene` completes without error), THE Preference_Manager SHALL write the value `'3d'` to `localStorage` under the key `immersive_preferred_mode`.
2. THE Preference_Manager SHALL wrap all `localStorage` writes in a `try/catch` block to handle private browsing environments gracefully.
3. WHEN a user has previously set the preference and visits the Immersive_Store again, THE Preference_Manager SHALL not overwrite the existing value with a different value.

---

### Requirement 6: 3D Mode Preference — Reading the Flag on 2D Pages

**User Story:** As a returning shopper who previously used the 3D store, I want to see a prompt on 2D pages reminding me I can return to the immersive experience, so that I can easily switch back.

#### Acceptance Criteria

1. WHEN `layout/theme.liquid` renders a non-immersive page and the `immersive_preferred_mode` localStorage key equals `'3d'`, THE Preference_Banner SHALL be injected into the DOM as a non-blocking element.
2. THE Preference_Banner SHALL contain a link to `/pages/immersive-store` with localised label text sourced from the `sections.immersive_journey_bridges.preference_banner_cta` translation key.
3. THE Preference_Banner SHALL include a dismiss button that removes the banner from the DOM for the current session without clearing the `localStorage` flag.
4. THE Preference_Banner SHALL be rendered as `hidden` in the initial HTML and revealed only by client-side JavaScript after reading `localStorage`, so that it does not flash on users without the preference set.
5. IF `localStorage` is unavailable (e.g. private browsing), THEN THE Preference_Banner SHALL not be rendered.
6. THE Preference_Banner SHALL not be rendered on `page.immersive`, `index`, or `password` templates.

---

### Requirement 7: Cart Bridge Button

**User Story:** As a shopper reviewing their cart on the standard cart page, I want a link to return to the 3D showroom, so that I can continue browsing immersively after reviewing my cart.

#### Acceptance Criteria

1. WHEN the cart page is rendered and `cart.item_count` is greater than zero, THE Cart_Bridge SHALL render a visible anchor element linking to `/pages/immersive-store`.
2. THE Cart_Bridge SHALL display localised label text sourced from the `sections.immersive_journey_bridges.cart_cta` translation key.
3. WHEN the cart is empty, THE Cart_Bridge SHALL not be rendered.
4. THE Cart_Bridge SHALL be a standard `<a>` element so it functions as a navigation link without JavaScript.

---

### Requirement 8: Localisation

**User Story:** As a merchant, I want all bridge UI text to be translatable, so that the store can serve international customers.

#### Acceptance Criteria

1. THE Bridge_Button labels and aria-labels SHALL be defined in `locales/en.default.json` under the `sections.immersive_journey_bridges` namespace.
2. THE Preference_Banner text SHALL be defined in `locales/en.default.json` under the `sections.immersive_journey_bridges` namespace.
3. FOR ALL user-facing strings introduced by this feature, THE Liquid templates SHALL reference them via the `| t` filter with no hard-coded English fallback strings in template files.

---

### Requirement 9: Accessibility

**User Story:** As a user relying on assistive technology, I want all bridge elements to be accessible, so that I can navigate between 2D and 3D experiences without barriers.

#### Acceptance Criteria

1. THE Bridge_Button SHALL be a focusable element with a visible focus indicator consistent with Dawn's existing focus styles.
2. THE Preference_Banner dismiss button SHALL move focus to a logical next element in the DOM after dismissal.
3. THE Preference_Banner SHALL include `role="region"` and an `aria-label` attribute sourced from the `sections.immersive_journey_bridges.preference_banner_aria` translation key.
4. WHEN the Preference_Banner is dismissed, THE Preference_Banner SHALL be removed from the DOM (not merely hidden) so it is no longer reachable by keyboard navigation.

---

### Requirement 10: Non-Interference with Standard Dawn Templates

**User Story:** As a merchant, I want the bridge elements to be additive enhancements that do not break existing Dawn functionality, so that the standard storefront remains fully operational.

#### Acceptance Criteria

1. THE Collection_Bridge SHALL be rendered outside the `#ProductGridContainer` element so it is not affected by Section Rendering API partial re-renders triggered by facet filtering.
2. THE Search_Bridge SHALL be rendered outside the `#ProductGridContainer` element so it is not affected by Section Rendering API partial re-renders.
3. WHILE JavaScript is disabled, THE Bridge_Button links SHALL remain functional `<a>` elements that navigate to the Immersive_Store URL.
4. THE Preference_Manager localStorage writes SHALL not interfere with existing `immersive_onboarding_seen`, `immersive_wishlist`, or `immersive_cookie_notice` localStorage keys.

---

### Requirement 11: Product Bridge Button

**User Story:** As a shopper viewing a standard product page, I want a button to explore that product inside the 3D showroom, so that I can switch to the immersive experience with the correct product already open.

#### Acceptance Criteria

1. WHEN a product page is rendered, THE Product_Bridge SHALL render a visible anchor element with the link `/?open_product={{ product.handle }}`, replacing the existing hardcoded implementation in `sections/main-product.liquid`.
2. THE Product_Bridge SHALL display localised label text sourced from the `sections.immersive_journey_bridges.product_cta` translation key.
3. THE Product_Bridge SHALL include an `aria-label` attribute that incorporates the product title, sourced from the `sections.immersive_journey_bridges.product_cta_aria` translation key.
4. THE Product_Bridge SHALL apply a CSS class (`.immersive-bridge-btn`) for styling instead of inline styles.
5. THE Product_Bridge SHALL be a standard `<a>` element so it functions as a navigation link without JavaScript.

---

### Requirement 12: Product Deep-Link URL Parameter

**User Story:** As a shopper arriving at the homepage via a Product Bridge link, I want the 3D store to automatically open the correct product panel, so that I land directly on the right product.

#### Acceptance Criteria

1. WHEN the Immersive_Store initialises and the URL contains the `open_product` query parameter with a non-empty value, THE URL_Param_Handler SHALL call `openProductPanel` with the parameter value after the scene is ready.
2. WHEN the `open_product` parameter value is an empty string, THE URL_Param_Handler SHALL not call `openProductPanel`.
3. THE URL_Param_Handler SHALL handle the `open_product` parameter using a 400 ms `setTimeout` to allow the scene to render before opening the panel.
4. WHEN both `open_product` and `open_collection` parameters are present in the URL, THE URL_Param_Handler SHALL prioritise `open_product` and ignore `open_collection`.

---

### Requirement 13: Collections List Page Bridge

**User Story:** As a shopper browsing the all-collections page, I want a button to enter the 3D showroom, so that I can explore all collections in the immersive experience.

#### Acceptance Criteria

1. WHEN the collections list page (`/collections`) is rendered, THE Collections_List_Bridge SHALL render a visible anchor element linking to `/pages/immersive-store`.
2. THE Collections_List_Bridge SHALL display localised label text sourced from the `sections.immersive_journey_bridges.collections_list_cta` translation key.
3. THE Collections_List_Bridge SHALL include an `aria-label` attribute sourced from the `sections.immersive_journey_bridges.collections_list_cta_aria` translation key.
4. THE Collections_List_Bridge SHALL be a standard `<a>` element so it functions as a navigation link without JavaScript.
5. THE Collections_List_Bridge SHALL be rendered in `sections/main-list-collections.liquid` above the collections grid.

---

### Requirement 14: Blog and Article Page Bridges

**User Story:** As a shopper who lands on a blog post or blog index page from a search engine, I want a link to the 3D showroom, so that I can discover the immersive experience from content pages.

#### Acceptance Criteria

1. WHEN a blog index page is rendered, THE Content_Bridge SHALL render a visible anchor element in `sections/main-blog.liquid` linking to `/pages/immersive-store`.
2. WHEN an article page is rendered, THE Content_Bridge SHALL render a visible anchor element in `sections/main-article.liquid` linking to `/pages/immersive-store`.
3. THE Content_Bridge SHALL display localised label text sourced from the `sections.immersive_journey_bridges.content_cta` translation key.
4. THE Content_Bridge SHALL include an `aria-label` attribute sourced from the `sections.immersive_journey_bridges.content_cta_aria` translation key.
5. THE Content_Bridge SHALL be a standard `<a>` element so it functions as a navigation link without JavaScript.

---

### Requirement 15: Bridge Banner Component Implementation

**User Story:** As a developer, I want a reusable, parameterized Liquid snippet for all bridge CTAs, so that I can maintain consistent styling, accessibility, and behavior across all 2D→3D entry points.

#### Acceptance Criteria

1. THE Bridge_Banner snippet (`snippets/immersive-bridge-btn.liquid`) SHALL accept the following parameters:
   - `bridge_url` {String} — the href value (e.g. `/?open_collection=suffuse`)
   - `bridge_label` {String} — already-translated CTA label text
   - `bridge_aria` {String} — already-translated aria-label text
   - `bridge_class` {String} — optional extra CSS modifier class
   - `bridge_heading` {String} — optional override heading (defaults to `shop.name`)
   - `bridge_subtext` {String} — optional override subtext line
   - `bridge_image` {Object} — optional Shopify image object for the preview thumbnail

2. THE Bridge_Banner snippet SHALL render a semantic `<a>` element with `href="{{ bridge_url }}"` so it functions as a navigation link without JavaScript.

3. THE Bridge_Banner snippet SHALL include an `aria-label` attribute with the value `{{ bridge_aria | escape }}` to provide accessible context.

4. THE Bridge_Banner snippet SHALL escape the `bridge_label` parameter when rendering it in the CTA span to prevent unintended HTML injection.

5. WHEN `bridge_image` is provided and not blank, THE Bridge_Banner SHALL render the image using Shopify's `image_url` and `image_tag` filters with responsive widths (`160, 240, 320`) and lazy loading.

6. WHEN `bridge_image` is blank or not provided, THE Bridge_Banner SHALL render a placeholder SVG with the brand accent color (`#d4af37`) and geometric iconography.

7. THE Bridge_Banner snippet SHALL include a `data-immersive-bridge` attribute on the root `<a>` element to enable client-side device/connection-aware behavior hooks.

8. THE Bridge_Banner snippet SHALL use BEM naming conventions for all CSS classes (`.immersive-bridge-banner`, `.immersive-bridge-banner__media`, `.immersive-bridge-banner__cta`, etc.).

9. THE Bridge_Banner snippet SHALL include responsive CSS via `{% stylesheet %}` block with breakpoints at `749px` and `400px` to adapt layout for tablet and mobile viewports.

10. THE Bridge_Banner snippet SHALL include a `:focus-visible` outline style (`2px solid #d4af37`, `outline-offset: 3px`) for keyboard navigation accessibility.

11. THE Bridge_Banner snippet SHALL include a `@media (prefers-reduced-motion: reduce)` block that removes all transitions and animations (including the pulsing dot animation) for users with motion sensitivity.

12. THE Bridge_Banner snippet SHALL include hover states that:
    - Brighten the border color to `#d4af37`
    - Increase the box-shadow intensity
    - Animate the CTA arrow with a subtle `translateX(3px)` transform

13. THE Bridge_Banner snippet SHALL include a pulsing animation on the eyebrow dot (`.immersive-bridge-banner__dot`) that cycles opacity and scale over 2.4 seconds.

14. THE Bridge_Banner snippet SHALL support optional CSS modifier classes via the `bridge_class` parameter (e.g. `.immersive-bridge-banner--home`, `.immersive-bridge-banner--back`) for context-specific styling.

---

### Requirement 16: Device/Connection-Aware Bridge Behavior

**User Story:** As a shopper on a slow connection or with motion sensitivity enabled, I want the bridge CTA to acknowledge my device constraints, so that I can make an informed decision about entering the 3D store.

#### Acceptance Criteria

1. THE Bridge_Behavior script (centralized in theme JS, not in `immersive-store.js`) SHALL query all elements with `[data-immersive-bridge]` on DOMContentLoaded.

2. THE Bridge_Behavior script SHALL detect the user's connection type via `navigator.connection` (or vendor-prefixed variants) and check for `saveData` flag.

3. THE Bridge_Behavior script SHALL classify connections as "slow" if:
   - `connection.saveData` is true, OR
   - `connection.effectiveType` is `'slow-2g'`, `'2g'`, or `'3g'`

4. THE Bridge_Behavior script SHALL detect motion sensitivity via `window.matchMedia('(prefers-reduced-motion: reduce)')`.

5. WHEN a bridge link points to the 3D store (`/pages/immersive-store` or `/?open_*`) AND the user is on a slow connection OR has motion sensitivity enabled, THE Bridge_Behavior script SHALL:
   - Modify the `.immersive-bridge-banner__heading` text to a localized warning message (e.g. "3D store is heavier on slower connections")
   - Optionally adjust CSS styling (e.g. reduce opacity, add a warning icon) to signal the constraint
   - NOT auto-redirect or prevent navigation; the link remains fully functional

6. THE Bridge_Behavior script SHALL wrap all `navigator.connection` checks in feature detection guards to handle browsers that do not support the Network Information API.

7. THE Bridge_Behavior script SHALL NOT modify bridge links pointing to 2D pages (e.g. `/` or `/collections/*`).

8. THE Bridge_Behavior script SHALL use `data-*` attributes on the bridge element to pass localized warning strings from Liquid, avoiding hard-coded English text in JavaScript.

---

### Requirement 17: SEO and Canonical URL Integrity

**User Story:** As a search engine crawler, I want all bridge links to be discoverable and canonical, so that the immersive store is properly indexed and linked from 2D pages.

#### Acceptance Criteria

1. ALL Bridge_Button links SHALL be rendered as semantic `<a href>` elements with valid, absolute or root-relative URLs so that crawlers can follow them.

2. THE Bridge_Button links SHALL NOT be hidden from crawlers via `display: none`, `visibility: hidden`, or JavaScript-only rendering.

3. WHEN a bridge link includes query parameters (e.g. `?open_collection=suffuse`), THE query parameter SHALL be URL-encoded and the canonical URL of the destination page SHALL remain clean (without the query parameter in the canonical tag).

4. THE Bridge_Button links SHALL NOT use `rel="nofollow"` or `rel="noindex"` attributes; they are standard navigation links.

5. THE Preference_Banner link to `/pages/immersive-store` SHALL be a standard `<a>` element with a valid href, not a JavaScript-only navigation trigger.

6. ALL Bridge_Button links SHALL preserve the existing canonical URL structure of the destination page (e.g. the immersive store page's canonical tag shall point to itself, not to a 2D page).
