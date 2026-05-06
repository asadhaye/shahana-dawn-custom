# User Journey Flows — Immersive 3D Store

---

## Journey 1 — Occasions Wing: Eid Feature Flow

**Goal:** Test the Occasions room, Eid collection, Eid delivery metafields, and limited‑time / urgency UI.

**Flow:**

1. **Enter immersive store**
   - `/pages/immersive` loads.
   - Default room: storefront → click "Start Experience" hotspot → lounge.

2. **Go from lounge to Occasions**
   - In lounge, click the hotspot labeled "Occasions" (targetRoom: 'occasions').

3. **Open Eid editorial overlay**
   - From the occasions room, click the hotspot with `targetEditorialRoom: 'occasions'` (likely "Our Occasions" at the top).
   - This opens the `editorial_occasions` immersive-editorial instance in `#immersive-editorial-overlay`.

4. **Click "Eid Collection" hotspot**
   - Still in occasions room, click the hotspot with `targetCollection: 'eid-collection'`.

5. **Open Eid collection panel**
   - `openCollectionPanel('eid-collection')` loads `/collections/eid-collection?sections=glass-panel`.
   - Check:
     - Eid-specific product mix.
     - `custom.eid_delivery` badge on product cards.
     - Any Eid-centric editorial copy in glass-panel.

6. **Open an Eid product panel**
   - Click an Eid product card from the glass panel to open `/products/{handle}?sections=glass-product`.
   - Confirm:
     - Eid delivery metafield shows correctly.
     - Limited‑time / countdown (`custom.sale_end_date`) appears if applicable.
     - Care/size/disclaimer metafields are correct.

7. **Add to cart**
   - Add product to cart from glass product panel.
   - Check that add-to-cart updates both:
     - Cart count in FAB / header.
     - Any cart‑related immersive hints/next actions.

---

## Journey 2 — Featured Collections Wing: Limited‑Time / Flash Sale Flow

**Goal:** Exercise the featured_collections room, flash sale metadata, and urgency UI.

**Flow:**

1. **Enter immersive store → lounge → featured_collections**
   - `/pages/immersive` → "Start Experience" hotspot → lounge.
   - From lounge, click "Featured Collections" hotspot (targetRoom: 'featured_collections').

2. **Open Featured Stories editorial**
   - In featured_collections, click hotspot with `targetEditorialRoom: 'featured_collections'` (probably "Featured Stories").
   - Editorial overlay loads the `editorial_featured_collections` section instance.

3. **Choose a flash‑sale collection**
   - In the editorial overlay, click a featured collection that should be under a limited‑time promotion.

4. **Open collection grid**
   - `openCollectionPanel('{handle}')` loads `/collections/{handle}?sections=glass-panel`.
   - Check:
     - Flash sale messaging is present (from immersive-canvas flash_sale block, low_stock_threshold, sale_end_date).

5. **Inspect product card urgency**
   - Cards should surface:
     - `data-sale-end-date` from product.metafields.custom.sale_end_date.
     - Low inventory urgency (from variants and low_stock_threshold).

6. **Open a product panel & validate**
   - Ensure:
     - Countdown / limited‑time UI (from JS `initImmersiveLimitedTime()`).
     - Correct price and compare_at_price for sale badge logic.

7. **Add to cart and see next actions**
   - After adding to cart, check:
     - Immersive "next actions" module suggests relevant rooms/collections.

---

## Journey 3 — Designer Houses Wing: Timeline / Designer Grid Flow

**Goal:** Test designer timeline editorial, designer-specific collections, and immersive-designer-grid section rendering.

**Flow:**

1. **Enter immersive store → lounge → designer_houses**
   - `/pages/immersive` → start → lounge.
   - Hotspot "Designer Houses" (targetRoom: 'designer_houses').

2. **Open Designers editorial overlay**
   - Click hotspot with `targetEditorialRoom: 'designer_houses'`.
   - `editorial_designer_houses` instance opens, with layout `designers`.

3. **Use timeline / coverflow UI**
   - Scroll/swipe through designer cards (Suffuse, Soraya, Saad Bin Shahzad, etc.).
   - Click a "View collection" action tied to one designer.

4. **Designer grid via Section Rendering API**
   - JS calls `loadTimelineCollection()` which fetches:
     - `/collections/{handle}?sections=immersive-designer-grid`.
   - Confirm:
     - `immersive-designer-grid.liquid` renders designer‑specific products.
     - Designer metadata (logos, hero image, editorial copy) is correct.

5. **Open a designer product panel**
   - From designer grid, click a product card.
   - `openProductPanel(handle)` opens glass product with correct breadcrumbs (designer collection).

6. **Add to wishlist / cart**
   - Add to wishlist (localStorage).
   - Add to cart and verify badges in FAB.

---

## Journey 4 — Immersive Search → Glass Product → Related Products

**Goal:** Validate immersive search, search panel, and related product recommendations.

**Flow:**

1. **Enter immersive store and open search**
   - Start in lounge or any room.
   - Use search icon in immersive header (`initImmersiveSearch()`).

2. **Search for a term (e.g., "Eid dress")**
   - As you type, autocomplete suggests products/collections.
   - Press Enter to fully open the search panel.

3. **Search results via Section Rendering API**
   - `/search?sections=immersive-product-grid`.
   - Check:
     - Filters, pagination, empty state messaging.
     - Product cards show immersive fields (short_description, badges, etc.).

4. **Open a product from search**
   - `openProductPanel(handle)` shows glass product.

5. **Scroll to related products**
   - glass-product-recommendations.liquid loaded from:
     - `/recommendations/products?sections=glass-product-recommendations`.
   - Confirm:
     - Recommendations relevant to query / base product.
     - Cards use the immersive product card snippet (or consistent design).

6. **Add to cart from product panel**
   - Check consistent behavior for related product add-to-cart or quick add.

---

## Journey 5 — Wishlist‑First Flow

**Goal:** Validate that wishlist state is consistent across immersive, panels, and FAB.

**Flow:**

1. **Enter immersive store and browse**
   - Navigate between lounge, designer_houses, featured_collections.

2. **Add products to wishlist from cards**
   - Use wishlist toggle on immersive-product-card.liquid.
   - Confirm:
     - LocalStorage (immersive_wishlist) updated.
     - FAB wishlist badge increments.

3. **Open wishlist panel**
   - Tap FAB → wishlist action (data-bottom-nav-wishlist).
   - `#immersive-wishlist-panel` opens.

4. **Inspect wishlist contents**
   - Products, vendors, prices, and badges match what's stored and visible on cards.

5. **Open a wishlist product panel**
   - Click a wishlist item.
   - `openProductPanel(handle)` navigates correctly, with breadcrumb pointing back to originating collection (if available).

6. **Remove from wishlist & add to cart**
   - Confirm both:
     - Wishlist badge decrements.
     - Cart badge increments.

---

## Journey 6 — Guided Mode Journey

**Goal:** Test guided mode activation, progression through rooms, and exit behavior (including the exitGuidedMode() you just fixed).

**Flow:**

1. **Idle to trigger guided prompt**
   - Enter immersive store and do nothing for long enough to trigger `showGuidedPrompt()` (idle timer).

2. **Activate guided mode**
   - Click "Start guided journey" from `#immersive-guided-prompt`.

3. **Step through rooms**
   - Let `_guidedAdvance()` move the shopper through:
     - lounge → designer_houses → occasions → featured_collections.
   - At each step:
     - Check overlays, badges, and prompts.

4. **Exit via hotspot**
   - Click a hotspot that calls `exitGuidedMode()` indirectly (e.g., a non‑start hotspot, product/collection open).
   - Confirm:
     - Guided prompt & progress UI is hidden.
     - `immersiveState.guided` is set to false.

5. **Exit via FAB or explicit "Exit tour"**
   - If there's a dedicated "Exit guided" action/button, test that as well.
   - Confirm `exitGuidedMode()` works from multiple entry points.

---

## Journey 7 — 2D → 3D Bridge and Deep Link

**Goal:** Validate that browsing from the classic store into immersive uses correct deep links and state.

**Flow:**

1. **Start on 2D homepage**
   - `/` with immersive-homepage-bridge section.

2. **Click a Bridge CTA to immersive**
   - CTA points to:
     - `/pages/immersive?open_collection={handle}`
     - or `/pages/immersive?open_product={handle}`
   - bridge-behavior.js should:
     - Add connection‑aware note (slow/medium/fast).
     - Not auto‑redirect.

3. **Arrive at immersive with deep link**
   - Immersive store reads URL params:
     - `open_collection` → `openCollectionPanel`.
     - `open_product` → `openProductPanel`.
   - Confirm:
     - Correct room opens (based on room detection / mapping).
     - Correct panel opens immediately.

4. **Back to 2D from FAB**
   - Use FAB action `data-bottom-nav-2d` to return to `routes.root_url`.

---

## Journey 8 — Immersive Exclusive Carousel

**Goal:** Validate your new immersive-exclusive-carousel section and its integration with immersive product panels and bridge behavior.

**Flow:**

1. **Place carousel on a 2D or immersive‑adjacent page**
   - Section immersive-exclusive-carousel on homepage or a landing page.

2. **Drag carousel**
   - On desktop:
     - Drag to rotate ring, confirm inertia and snap behavior (using the settings wired via `data-ring-radius`, `data-drag-friction`, `data-snap-strength`).
   - On mobile:
     - Confirm it falls back to horizontal scroll layout.

3. **Click a product card**
   - Card has `data-immersive-bridge` and `href="{{ product.url }}"`.
   - On 2D pages:
     - Confirm click opens canonical product page unless immersive intercepts.
   - On immersive page (if used there):
     - JS should intercept and call `openProductPanel(handle)`.

4. **Check data correctness**
   - Vendor, title, price, sale badge, and image all match the underlying product.
   - Clicking through lands you in the same glass product view as other flows.

---

## Known Issues (from audit)

| Room | Issue |
|------|-------|
| Designer Houses | 2 of 3 collection handles not found (soraya, saad-bin-shahzad) |
| Occasions | All 4 collection handles not found (eid-collection, bridal-mehndi, luxury-formals, casual-pret) |
| Featured Collections | All 3 collection handles not found |
| Purchase Flow | Collections need to be mapped to existing store collections |

---

## Test Environment

- **Store:** shahana-uk.myshopify.com
- **Theme:** shahana-dawn-custom
- **Page:** /pages/immersive

---

## Metafields Required for Full Support

| Metafield | Namespace | Key | Type |
|-----------|-----------|-----|------|
| Eid Delivery | custom | eid_delivery | text |
| Sale End Date | custom | sale_end_date | date_time |
| Low Stock Threshold | settings | low_stock_threshold | number |
| Short Description | custom | short_description | rich_text |
| Care Instructions | custom | care_instructions | richtext |
| Size Guide | custom | size_guide | richtext |
| Disclaimer | custom | disclaimer | richtext |