# Shahana Collection — Immersive Store

A WebGL-powered shopping experience for a Pakistani luxury fashion brand. Single-canvas parallax rendering, room-based navigation, glassmorphism product panels, and full Shopify cart integration.

---

## File Structure

```
dawn/
├── layout/
│   └── theme.liquid                    # Modified: loads three.min.js + immersive-store.js on page.immersive only (index removed); font preloads via preload_tag; header/footer hidden on page.immersive only; immersive-theme.css conditional on page.immersive only; preference banner injected on all non-immersive/non-password templates (responsive, mobile-first styles)
├── templates/
│   └── index.json                      # Homepage — standard Dawn 2D storefront (rich-text hero with 3D Store CTA + featured-collection section); no immersive canvas; header/footer render normally
├── sections/
│   ├── immersive-canvas.liquid         # Main section — canvas, UI layer, nav, glass panel, wishlist panel shell, JSON config block for all 5 rooms, immersive-header with 3D→2D mode switch pill; CSS + schema embedded; menu defaults to immersive-menu link list
│   ├── glass-panel.liquid              # Collection grid (Section Rendering API endpoint, CSS embedded)
│   ├── glass-product.liquid            # Product detail view with add-to-cart + accelerated checkout (payment_button), wishlist toggle (Section Rendering API endpoint, CSS embedded)
│   ├── immersive-product-grid.liquid   # Standalone product grid section — used for collection panels AND search results via Section Rendering API
│   ├── immersive-editorial.liquid      # Per-room editorial section — hero + banner blocks + scroll parallax (one instance per room)
│   ├── main-collection-product-grid.liquid  # Modified: Collection Bridge CTA added above product grid
│   ├── main-search.liquid              # Modified: Search Bridge CTA added in search header when results > 0
│   ├── main-product.liquid             # Modified: Product Bridge CTA replaces hardcoded link (now localised + accessible)
│   ├── main-cart-items.liquid          # Modified: Cart Bridge CTA added after cart title when cart non-empty
│   ├── main-list-collections.liquid    # Modified: Collections List Bridge CTA added after page heading
│   ├── main-blog.liquid                # Modified: Content Bridge CTA added after blog title
│   └── main-article.liquid             # Modified: Content Bridge CTA added before back-to-blog link
├── snippets/
│   ├── immersive-bridge-btn.liquid     # NEW: shared bridge CTA anchor — accepts bridge_url, bridge_label, bridge_aria, bridge_class; dark background with gold border for high visibility; responsive across all breakpoints (tablet 749px, mobile 400px); includes scoped {% stylesheet %} block
│   ├── immersive-product-card.liquid   # Product card with hover swap, variant buttons, add-to-cart + payment_button (accelerated checkout), wishlist toggle, parallax data attributes (CSS embedded)
│   └── virtual-tryon.liquid            # Virtual Try-On UI component
├── assets/
│   ├── immersive-store.js              # WebGL engine + room config + analytics + focus management + wishlist manager + URL param handler (open_product/open_collection/open_search) + openSearchPanel + preference manager
│   ├── immersive-theme.css             # Global immersive styles (loaded conditionally on page.immersive only); .template-index selectors removed; Dawn header suppressed via four independent selectors (.header-wrapper, #shopify-section-header, sticky-header, :has(.header-wrapper))
│   └── three.min.js                    # Three.js (local — CDN blocked by Shopify MIME policy)
└── locales/
    ├── en.default.json                 # Modified: full immersive_store (incl. wishlist), immersive.product_panel, immersive.product_card, immersive.product_grid, virtual_tryon, immersive_editorial, immersive_journey_bridges translation keys; added switch_to_2d, switch_to_2d_aria, switch_to_3d, switch_to_3d_aria keys
    └── en.default.schema.json          # Modified: immersive_product_grid and glass_product schema entries added; faq_url label added to immersive_store.settings
```

Notes:
- The immersive experience runs exclusively at `/pages/immersive` (`page.immersive` template). The homepage (`index` template) is a standard 2D Dawn storefront.
- The 3D store page must exist in Shopify Admin → Pages with template set to `page.immersive`.
- Most CSS is embedded in `{% stylesheet %}` blocks inside each Liquid file. `immersive-theme.css` handles global overrides loaded conditionally on `page.immersive` only.
- `lenis.min.js` exists in assets as a leftover but is not loaded or used anywhere.

---

## Architecture

### How it works

1. User visits `/pages/immersive` (the dedicated 3D store page)
2. `theme.liquid` loads `three.min.js` and `immersive-store.js` (only on `page.immersive` template)
3. `immersive-canvas.liquid` renders the canvas, UI layer, navigation, and glass panel
4. `bindImmersiveInit()` defers scene initialization to the next animation frame (ensuring canvas has real layout dimensions), then calls `initImmersiveScene()` and `bindImmersiveNav()`
5. `immersive-store.js` initializes a Three.js renderer, loads room textures + depth maps, and renders hotspots on a UI layer
6. Clicking a hotspot either transitions to another room, fetches a section via Shopify's Section Rendering API and injects it into the glass panel, or opens the editorial overlay for that room

### Editorial overlay

When a user clicks an editorial hotspot, `enterEditorialMode(roomKey, triggerEl)` is called. It:

1. Fetches the editorial section HTML via the Section Rendering API by reading `data-section-id` from the matching `.immersive-editorial[data-room-key="{roomKey}"]` element already in the DOM — this gives the real Shopify section instance ID (e.g. `immersive_editorial_abc123`). The fetch URL is `window.location.pathname + '?section_id=' + sectionInstanceId`, which works on `/pages/immersive` and with locale URL prefixes. If no matching section is found in the DOM, a warning is logged and the function returns early (with a DOM-clone fallback if the element exists but lacks a section ID).
2. If the URL is not yet cached, injects a loading spinner into `#immersive-editorial-overlay-content` immediately while the fetch is in flight
3. Activates the overlay (`is-active` class, canvas blur) — wrapped in `document.startViewTransition()` when available, with a direct DOM mutation fallback for Safari/Firefox
4. On fetch success, replaces the spinner with the fetched HTML
5. On fetch failure, renders an inline error message with a "Try Again" button that re-calls `enterEditorialMode`

**Bidirectional View Transitions (hotspot morph):** When `document.startViewTransition` is available, opening and closing the editorial overlay is wrapped in a native view transition. On entry, the clicked hotspot button is assigned `viewTransitionName = 'editorial-morph'`, which then transitions to the overlay. On exit, the overlay morphs back down into that specific hotspot bubble. The names are managed dynamically in `enterEditorialMode` and `exitEditorialMode` and cleared once the transition finishes to keep the DOM clean.

**Sinking room effect:** The `animate()` loop tracks the editorial overlay's scroll position while `immersiveState.mode === 'editorial'`. To avoid forcing layout on every frame, the overlay element and its `maxScroll` (`scrollHeight - clientHeight`) are cached in `editorialOverlayEl` and `editorialMaxScroll` when `enterEditorialMode()` is called (and recached on `handleResize()` if the viewport changes). Per frame, only `scrollTop` is read — a cheap property that doesn't force layout. The normalised progress is lerped toward the target at factor `0.1` and written to the `uScrollOffset` uniform. When editorial mode exits, both cached values are cleared so the next entry gets a fresh lookup.

The shader uses `uScrollOffset` to apply a depth-weighted vertical shift with **background counter-motion**:

```glsl
float scrollWeight = d + 0.5; // Normalized 0.0 to 1.0 (foreground to background)
float backCounterShift = (1.0 - scrollWeight) * -0.08; // Back wall shifts slightly UP
float foreSinkingShift = scrollWeight * 0.25;           // Furniture sinks DOWN (aggressive)
float totalVerticalShift = (foreSinkingShift + backCounterShift) * uScrollOffset;

return uv + offset + vec2(0.0, totalVerticalShift);
```

Where `d = depth - 0.5`. Foreground pixels (`d > 0`) sink more than background pixels, while background pixels shift slightly upward. This creates a powerful "sinking into the room" illusion as the editorial content is scrolled. When editorial mode exits, `editorialScrollProgress` decays to zero via `*= 0.85` each frame for a smooth reset.

**Escape key:** A one-time `keydown` listener is attached to the overlay on open and removed on close, so pressing Escape calls `exitEditorialMode()`.

`exitEditorialMode()` removes `is-active`, clears the canvas blur, resets `immersiveState.mode` to `'showroom'`, and restores focus precisely to `immersiveState.lastHotspot`. This ensures a seamless loop for keyboard and screen-reader users, returning them to the exact bubble they originally launched.

### Section Rendering API pattern

Collections and products are fetched from their own URLs so the correct Liquid objects are available automatically:

```
/collections/{handle}?section_id=glass-panel      → collection object available in Liquid
/products/{handle}?section_id=glass-product        → product object available in Liquid
```

All fetch URLs are built using `shopRoot` for locale-awareness (see below).

### Room configuration

Rooms are defined in `STORE_ROOMS` at the top of `immersive-store.js`. Immediately after the constant, a `mergeDynamicRoomConfig()` IIFE reads a `<script type="application/json" id="immersive-rooms-config">` block rendered by `immersive-canvas.liquid` and merges any non-null values into `STORE_ROOMS`. This allows the `featured_collections` room to be configured from the theme editor without touching JS.

```javascript
const STORE_ROOMS = {
  storefront: {
    baseTextureUrl: "https://cdn.shopify.com/.../storefront-d-base.webp",
    mobileBaseTextureUrl: "...",
    depthMapUrl: "https://cdn.shopify.com/.../storefront-d-depth-color.webp",
    mobileDepthMapUrl: "...",
    hotspots: [
      { x: 50, y: 68, label: "Enter store", targetRoom: "lounge" }
    ]
  },
  lounge: {
    hotspots: [
      { x: 25, y: 27, label: "Designer Houses", targetEditorialRoom: "designer_houses" },
      { x: 50, y: 27, label: "Occasions", targetRoom: "occasions" },
      { x: 75, y: 28, label: "Featured Collections", targetRoom: "featured_collections" },
      { x: 50, y: 90, label: "Back to storefront", targetRoom: "storefront" }
    ]
  },
  designer_houses: { ... },
  occasions: { ... },
  featured_collections: { ... }  // overridable via theme editor
};
```

`x` and `y` are percentage positions on the canvas (0–100). Each hotspot has either `targetRoom` (navigate to another room), `targetCollection` (open the glass panel with that collection), or `targetEditorialRoom` (scroll to the room's editorial section).

**Navigation rules:**
- Every child of lounge (`designer_houses`, `occasions`, `featured_collections`) has a "Back to lounge" hotspot
- Lounge has a "Back to storefront" hotspot
- Storefront has an "Enter store" hotspot to lounge
- The lounge "Designer Houses" hotspot uses `targetEditorialRoom: 'designer_houses'` — it opens the editorial overlay directly without navigating to the `designer_houses` room first
- The lounge "Occasions" and "Featured Collections" hotspots use `targetRoom` — they navigate to the room first
- Each destination room (`designer_houses`, `occasions`, `featured_collections`) has one editorial hotspot at `{ x: 50, y: 15 }` with `targetEditorialRoom` set to the room key — clicking it calls `enterEditorialMode(roomKey)` which fades in the editorial overlay over the 3D room

### Navigation Robustness & Fallbacks

The room navigation engine is designed to be atomic and failure-resistant:

1. **Atomic Navigation**: `goToRoom` only updates the room state and hotspots if the textures successfully load. If textures are missing (e.g. broken Merchant settings), navigation aborts to prevent a "state-image mismatch" where the user sees old images with new hotspots.
2. **Recursive Fallbacks**: `getRoomTextureUrls` automatically falls back from mobile-specific textures to high-resolution desktop textures if the former are missing.
3. **Startup Validation**: `initImmersiveScene` verifies the session's starting room. If the saved room is invalid or broken, it defaults back to the `storefront` to ensure a consistent first load.

### Theme-editor-configurable rooms

All 5 rooms can be fully configured from the Shopify theme editor via **Customize → Homepage → Immersive Canvas** section settings. JS defaults in `STORE_ROOMS` remain as fallback if no theme settings are configured.

All room texture URLs in `STORE_ROOMS` include Shopify CDN optimisation params (`&width=` and `&quality=`) to reduce payload size. JS fallback URLs use `width=1600&quality=75` (desktop base), `width=900&quality=75` (mobile base), and `quality=60` (depth maps). The Liquid JSON config block serves images at `width=1920` (desktop) and `width=1200` (mobile) — slightly larger than the JS defaults to account for high-DPI displays. Depth maps are served at `quality=60` in both paths.

**Storefront room**

| Setting | Type | Purpose |
|---|---|---|
| `storefront_base_image` | image_picker | Desktop base texture (served at width=1920) |
| `storefront_base_image_mobile` | image_picker | Mobile base texture (served at width=1200; falls back to desktop image) |
| `storefront_depth_map` | image_picker | Desktop depth map (served at width=1920) |
| `storefront_depth_map_mobile` | image_picker | Mobile depth map (served at width=1200; falls back to desktop depth map) |

Hotspots are navigation-only (Enter store → lounge) — not configurable from the editor. The Enter Store hotspot has hardcoded mobile position offsets (`mobileX: 55, mobileY: 63`) in both `STORE_ROOMS` and the JSON config block.

**Lounge room**

| Setting | Type | Purpose |
|---|---|---|
| `lounge_base_image` | image_picker | Desktop base texture (served at width=1920) |
| `lounge_base_image_mobile` | image_picker | Mobile base texture (served at width=1200; falls back to desktop image) |
| `lounge_depth_map` | image_picker | Desktop depth map (served at width=1920) |
| `lounge_depth_map_mobile` | image_picker | Mobile depth map (served at width=1200; falls back to desktop depth map) |

Hotspots are mixed: "Designer Houses" navigates to the `designer_houses` room (`targetRoom`); "Occasions" and "Featured Collections" also navigate to their respective rooms (`targetRoom`); "Back to storefront" navigates back. None are configurable from the editor.

**Designer Houses room**

| Setting | Type | Purpose |
|---|---|---|
| `designer_houses_base_image` | image_picker | Desktop base texture (served at width=1920) |
| `designer_houses_base_image_mobile` | image_picker | Mobile base texture (served at width=1200; falls back to desktop image) |
| `designer_houses_depth_map` | image_picker | Desktop depth map (served at width=1920) |
| `designer_houses_depth_map_mobile` | image_picker | Mobile depth map (served at width=1200; falls back to desktop depth map) |
| `designer_houses_slot_1_collection` | collection | Hotspot 1 collection |
| `designer_houses_slot_1_label` | text | Hotspot 1 label (default: "Suffuse") |
| `designer_houses_slot_2_collection` | collection | Hotspot 2 collection |
| `designer_houses_slot_2_label` | text | Hotspot 2 label (default: "Soraya") |
| `designer_houses_slot_3_collection` | collection | Hotspot 3 collection |
| `designer_houses_slot_3_label` | text | Hotspot 3 label (default: "Saad Bin Shahzad") |

The editorial hotspot (`{ x: 50, y: 15, targetEditorialRoom: 'designer_houses' }`) is emitted by the JSON config block using the `sections.immersive_store.nav_explore_designers` locale key. It cannot be repositioned or relabelled from the theme editor.

**Occasions room**

| Setting | Type | Purpose |
|---|---|---|
| `occasions_base_image` | image_picker | Desktop base texture (served at width=1920) |
| `occasions_base_image_mobile` | image_picker | Mobile base texture (served at width=1200; falls back to desktop image) |
| `occasions_depth_map` | image_picker | Desktop depth map (served at width=1920) |
| `occasions_depth_map_mobile` | image_picker | Mobile depth map (served at width=1200; falls back to desktop depth map) |
| `occasions_slot_1_collection` | collection | Hotspot 1 collection |
| `occasions_slot_1_label` | text | Hotspot 1 label (default: "Eid Collection") |
| `occasions_slot_2_collection` | collection | Hotspot 2 collection |
| `occasions_slot_2_label` | text | Hotspot 2 label (default: "Bridal & Mehndi") |
| `occasions_slot_3_collection` | collection | Hotspot 3 collection |
| `occasions_slot_3_label` | text | Hotspot 3 label (default: "Luxury Formals") |
| `occasions_slot_4_collection` | collection | Hotspot 4 collection |
| `occasions_slot_4_label` | text | Hotspot 4 label (default: "Casual Pret") |

The editorial hotspot (`{ x: 50, y: 15, targetEditorialRoom: 'occasions' }`) is emitted by the JSON config block using the `sections.immersive_store.nav_our_occasions` locale key. It cannot be repositioned or relabelled from the theme editor.

**Featured Collections room**

| Setting | Type | Purpose |
|---|---|---|
| `featured_collections_base_image` | image_picker | Desktop base texture (served at width=1920) |
| `featured_collections_base_image_mobile` | image_picker | Mobile base texture (served at width=1200; falls back to desktop image) |
| `featured_collections_depth_map` | image_picker | Desktop depth map (served at width=1920) |
| `featured_collections_depth_map_mobile` | image_picker | Mobile depth map (served at width=1200; falls back to desktop depth map) |
| `featured_collections_slot_1_collection` | collection | Hotspot 1 collection |
| `featured_collections_slot_1_label` | text | Hotspot 1 label (default: "Collection 1") |
| `featured_collections_slot_2_collection` | collection | Hotspot 2 collection |
| `featured_collections_slot_2_label` | text | Hotspot 2 label (default: "Collection 2") |
| `featured_collections_slot_3_collection` | collection | Hotspot 3 collection |
| `featured_collections_slot_3_label` | text | Hotspot 3 label (default: "Collection 3") |

The editorial hotspot (`{ x: 50, y: 15, targetEditorialRoom: 'featured_collections' }`) is emitted by the JSON config block using the `sections.immersive_store.nav_featured_stories` locale key. It cannot be repositioned or relabelled from the theme editor.

Navigation hotspot labels (Back to lounge, Back to storefront, Enter store, and the lounge child-room labels) are injected via the JSON config block using `| t` — keys `sections.immersive_store.nav_back_to_lounge`, `nav_back_to_storefront`, `nav_enter_store`, `nav_designer_houses`, `nav_occasions`, `nav_featured_collections`. All collection hotspot labels and all room images are configurable from the theme editor without touching code.

The slide-out menu also exposes a configurable **FAQ page link** via the `faq_url` setting (`url` type). If left blank, it falls back to `pages['faq'].url` (locale-aware), then to `/pages/faq` as a last resort.

> **Important — JSON config hotspot arrays:** The JSON config block emits a full `hotspots` array for each room, including `targetCollection` values and editorial hotspots. When a collection setting is blank, the config block falls back to the hardcoded handle from `STORE_ROOMS` (e.g. `"suffuse"` for slot 1 of designer_houses) rather than emitting `null`. Editorial hotspots (`targetEditorialRoom`) are always included in the emitted array — previously they were omitted, which caused `mergeDynamicRoomConfig` to wipe them when any theme setting was configured. This is now fixed.

> **Note — orphaned schema locale keys:** `en.default.schema.json` contains `sections.immersive_store.settings` entries for `base_image`, `depth_map` (legacy, superseded by `base_image_desktop`/`depth_map_desktop`), `enable_vto`, `vto_require_login`, `vto_allowed_tags`, `best_sellers_collection`, and `new_arrivals_collection`. None of these are referenced by any setting ID in the current `immersive-canvas.liquid` schema block. They are safe to remove from the locale file if VTO and best-sellers settings are not being added back.

### Product panel settings (glass-product.liquid)

Configurable via **Customize → Products → Glass product panel** (or when the section is rendered in context):

| Setting | Type | Default | Purpose |
|---|---|---|---|
| `media_size` | select | medium | Media column width — small / medium / large |
| `constrain_to_viewport` | checkbox | true | Constrain media height to screen height |
| `show_vendor` | checkbox | true | Show product vendor below title |
| `show_rating` | checkbox | false | Show product rating (requires a rating app) |
| `show_share_buttons` | checkbox | true | Show WhatsApp / Facebook / Instagram / TikTok share buttons |
| `show_delivery_estimate` | checkbox | true | Show estimated delivery date range |
| `show_related` | checkbox | true | Show "You may also like" related products — **not yet wired**: the `[data-related-root]` container and `loadProductRecommendations()` JS are always active regardless of this setting |
| `related_products_limit` | range (2–8) | 4 | Maximum number of related products to show — **not yet wired**: the `limit=4` in the recommendations URL is hard-coded in JS and does not read this setting |
| `enable_virtual_tryon` | checkbox | true | Enable the Virtual Try-On widget |

All settings use `!= false` guards so existing behaviour is preserved if settings are absent (e.g. when the section is fetched via Section Rendering API without a customised preset).

### Collection grid settings (immersive-product-grid.liquid)

Configurable via **Customize → Sections → Immersive product grid**:

| Setting | Type | Default | Purpose |
|---|---|---|---|
| `collection` | collection | — | Collection to display |
| `products_per_page` | range (2–24) | 8 | Number of products to show |
| `columns_desktop` | range (2–4) | 3 | Grid columns on desktop |
| `columns_mobile` | select | 2 | Grid columns on mobile (1 or 2) |
| `image_ratio` | select | portrait | Card image ratio — adapt / portrait / square |
| `show_secondary_image` | checkbox | true | Show second product image on hover |
| `show_vendor` | checkbox | true | Show vendor name on each card |
| `show_description` | checkbox | false | Show collection description above the grid |

`show_vendor` and `show_secondary_image` are passed through to `immersive-product-card.liquid` as optional render parameters.

The `collection` setting returns the collection object directly (Dawn pattern — `section.settings.collection`). The section uses it directly rather than looking it up via `collections[handle]`.

> **TODO: verify product panel/grid settings for `image_ratio`** — `image_ratio` is defined in the grid schema and documented above, but it is not currently passed to `immersive-product-card.liquid` in the render call, and the card uses a fixed `aspect-ratio: 2 / 3` in CSS. Either wire the setting through to the card or remove it from the schema.

### Editorial section settings (immersive-editorial.liquid)

One instance of this section is placed per destination room on the immersive page. Configured via **Customize → Sections → Immersive Editorial**:

| Setting | Type | Default | Purpose |
|---|---|---|---|
| `room_key` | select | `featured_collections` | Which room this editorial belongs to — `designer_houses`, `occasions`, or `featured_collections` |
| `layout` | select | `collections` | Visual layout variant — `designers` (3-col brand tiles), `collections` (alternating 2-col banners), `occasions` (alternating 2-col story segments) |
| `hero_background_image` | image_picker | — | Full-width hero background image |
| `hero_eyebrow` | text | — | Small eyebrow label above the heading |
| `hero_heading` | text | — | Main hero heading (rendered as `<h2>`) |
| `hero_subheading` | richtext | — | Hero subheading / intro copy |

Each section supports unlimited **Banner** blocks:

| Block setting | Type | Purpose |
|---|---|---|
| `image` | image_picker | Banner image |
| `logo` | image_picker | Brand logo (shown in `designers` layout only) |
| `heading` | text | Banner heading (required) |
| `body` | richtext | Body copy |
| `cta_label` | text | CTA button label |
| `cta_url` | url | CTA destination URL |
| `collection` | collection | Linked Shopify collection (shows collection title as a link) |
| `depth_layer` | range 0–100 | Parallax depth weight — higher values move more on scroll |

The section's `id` is `immersive-editorial-{room_key}`. `immersive-store.js` finds this element and clones it into the editorial overlay when an editorial hotspot is clicked.

> **Important — theme editor blocks:** Shopify ignores block definitions in `index.json` / `page.immersive.json` after the theme has been opened in the theme editor. Banner blocks must be added manually via **Customize → Home page → Immersive Editorial → Add Banner** for each of the three editorial sections. The section-level settings (`room_key`, `layout`, hero fields) are respected from the template JSON on first load but should also be verified in the editor.

### Locale-aware URLs

All Shopify endpoint URLs are built from `shopRoot`:

```javascript
var shopRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
if (shopRoot.slice(-1) !== '/') shopRoot += '/';
```

This ensures the experience works correctly on international stores with URL prefixes like `/fr/` or `/en-us/`. Affected endpoints: `cart/add.js`, `collections/`, `products/`, `checkout`.

### Session state

The current room and open panel are persisted to `sessionStorage` under the key `immersive_state`. On page load, `safeBindImmersiveInit` only restores a non-storefront room if a product or collection panel was open in the previous session — a plain refresh always starts at storefront and clears the stale state. This prevents the common issue of landing on the lounge or a child room after a refresh when the user just wanted to start fresh.

**localStorage keys used by `immersive-store.js`:**

| Key | Value | Purpose |
|---|---|---|
| `immersive_onboarding_seen` | `'1'` | Suppress onboarding overlay after first dismissal |
| `immersive_wishlist` | JSON array of handles | Persist wishlist across sessions |
| `immersive_cookie_notice` | `'1'` | Suppress cookie banner after dismissal |
| `immersive_preferred_mode` | `'3d'` | Written on `initImmersiveScene` success; read by preference banner in `theme.liquid` |

All reads and writes are wrapped in `try/catch` to handle private browsing environments.

### Onboarding overlay

First-time visitors see a dismissible onboarding overlay (`#immersive-onboarding`) that introduces the immersive experience. Dismissed state is persisted to `localStorage` under the key `immersive_onboarding_seen` (value `'1'`). The overlay is shown by `showImmersiveOnboardingIfNeeded()`, called from `bindImmersiveInit()` after `setupImageParallax()`. All `localStorage` calls are wrapped in `try/catch` to handle private browsing — if storage is blocked, the overlay is treated as unseen and shown.

### Wishlist

A client-side, guest-friendly wishlist lets shoppers save products while browsing the 3D store. No Shopify customer account is required.

**State:** `_wishlistItems` is an in-memory array of product handle strings, mirrored to `localStorage` under the key `immersive_wishlist`. All reads and writes are wrapped in `try/catch` — if storage is blocked (private browsing), the in-memory array is used for the session.

**Initialisation:** `initWishlist()` is called from `bindImmersiveInit()` after `showImmersiveOnboardingIfNeeded()`. It loads the stored array, calls `updateWishlistBadge()` to restore the header count, and calls `syncAllWishlistToggles(document)` to restore `aria-pressed` / `.is-saved` state on any toggle buttons already in the DOM.

**Toggle buttons:** Both `immersive-product-card.liquid` and `glass-product.liquid` render a `[data-wishlist-toggle]` button with `data-product-handle`, `aria-pressed`, `data-label-save`, and `data-label-saved` attributes. The button contains an outline heart SVG (unsaved) and a filled heart SVG (saved); CSS toggles visibility via the `.is-saved` class. After every Section Rendering API injection, `syncAllWishlistToggles(panel)` is called to initialise toggles in the newly injected content.

**Header button:** `immersive-canvas.liquid` renders a `[data-wishlist-open]` button in `.immersive-header__right`. A `[data-wishlist-badge]` `<span>` inside it shows the item count; it is `hidden` when the count is zero.

**Wishlist panel:** `#immersive-wishlist-panel` is a static HTML shell in `immersive-canvas.liquid` (always in the DOM, `hidden` by default). It slides in from the right as a `role="dialog"` overlay. `renderWishlistPanel()` builds the inner card list from `_wishlistItems` using cached product data from `_wishlistProductCache`. The panel reuses `openDialogFocus()` / `closeDialogFocus()` for focus trap and focus restoration.

**Product data cache:** When `openProductPanel` renders a product, `cacheWishlistProduct(handle, panelEl)` extracts title, price, and featured image src from the injected HTML into `_wishlistProductCache`. This means zero additional network requests when the wishlist panel renders products the user has already viewed. Products saved but never viewed render with a placeholder image.

**Event wiring:** A single delegated `document.addEventListener('click')` in `initWishlist()` routes all wishlist interactions — open/close panel, toggle save state, remove from panel, view product from panel. No per-element binding; survives DOM re-renders.

**JS constants and state:**

```javascript
var WISHLIST_KEY = 'immersive_wishlist';
var _wishlistItems = [];          // in-memory mirror of localStorage
var _wishlistProductCache = {};   // handle → { title, price, imageSrc }
var _wishlistPanelTrigger = null; // focus-restore target
```

**JS functions added to `immersive-store.js`:**

| Function | Purpose |
|---|---|
| `initWishlist()` | Load from localStorage, sync badge + toggles, attach delegated click listener |
| `getWishlist()` | Return shallow copy of `_wishlistItems` |
| `addToWishlist(handle, source)` | Idempotent add, persist, sync UI, fire analytics |
| `removeFromWishlist(handle, source)` | Filter out, persist, sync UI, fire analytics |
| `toggleWishlistItem(handle, source)` | Delegate to add or remove based on current state |
| `_persistWishlist()` | `localStorage.setItem` wrapped in `try/catch` |
| `updateWishlistBadge()` | Update `[data-wishlist-badge]` count and `hidden` state |
| `syncAllWishlistToggles(root)` | Set `aria-pressed` + `.is-saved` on all `[data-wishlist-toggle]` within `root` |
| `cacheWishlistProduct(handle, panelEl)` | Extract title/price/image from injected panel HTML |
| `renderWishlistPanel()` | Build card HTML from `_wishlistItems` + `_wishlistProductCache` |
| `openWishlistPanel()` | Show panel, render cards, trap focus, fire analytics |
| `closeWishlistPanel()` | Hide panel, restore focus |

---

## 2D–3D Bridges

Six bridge CTAs connect standard Dawn 2D pages back into the WebGL showroom, plus a bidirectional mode switch in the immersive header. All are purely additive progressive enhancements — the standard templates remain fully functional without JavaScript.

### 3D→2D mode switch (immersive header)

A pill button in `.immersive-header__right` lets users exit the 3D store and return to the standard 2D homepage:

```liquid
<a href="{{ routes.root_url }}" class="immersive-header__mode-switch"
   aria-label="{{ 'sections.immersive_journey_bridges.switch_to_2d_aria' | t }}"
   data-mode-switch-2d>
  <svg><!-- monitor icon --></svg>
  <span class="immersive-header__mode-switch-label">{{ 'sections.immersive_journey_bridges.switch_to_2d' | t }}</span>
</a>
```

On click, `bindImmersiveNav()` calls `clearImmersivePreference()` so the preference banner won't immediately nudge the user back to 3D on the next 2D page visit.

**Responsive behaviour:**
- Desktop/tablet (>480px): pill with icon + label text, `min-height: 36px`
- Tablet (≤768px): slightly smaller padding and font
- Mobile (≤480px): circular icon-only button (`36×36px`), label hidden via `.immersive-header__mode-switch-label { display: none }`

### 2D→3D bridge banner (`snippets/immersive-bridge-btn.liquid`)

High-visibility dark banner with gold border placed on standard 2D pages. Links to `/pages/immersive` with a deep-link URL param.

**Visual design:** Dark background (`rgba(10,15,30,0.92)`) with `1.5px` gold border — clearly visible on both light and dark page backgrounds. CTA pill has filled gold background on hover.

**Responsive behaviour:**
- Desktop: 3-column grid (thumbnail | body | CTA pill)
- Tablet (≤749px): thumbnail shrinks to 56px, CTA font `0.8rem`, `min-height: 36px` tap target
- Small mobile (≤400px): thumbnail hidden, single-column layout, full-width CTA button `min-height: 40px`

### Shared snippet: `snippets/immersive-bridge-btn.liquid`

All six bridge locations render the same snippet:

```liquid
{%- render 'immersive-bridge-btn',
  bridge_url: '/pages/immersive?open_collection=' | append: collection.handle,
  bridge_label: 'sections.immersive_journey_bridges.collection_cta' | t,
  bridge_aria: 'sections.immersive_journey_bridges.collection_cta_aria' | t: title: collection.title
-%}
```

The snippet renders an `<a data-immersive-bridge>` element with a `{% stylesheet %}` block containing `.immersive-bridge-btn` styles (gold hover/focus, `prefers-reduced-motion` guard, Dawn design tokens). Shopify deduplicates `{% stylesheet %}` output so the CSS is emitted only once even when the snippet is rendered on multiple sections of the same page.

### Bridge locations

| Bridge | Section file | URL | Condition |
|---|---|---|---|
| Collection Bridge | `main-collection-product-grid.liquid` | `/pages/immersive?open_collection={handle}` | `collection.products_count > 0` |
| Search Bridge | `main-search.liquid` | `/pages/immersive?open_search={url_encoded_terms}` | `search.performed and search.results_count > 0` |
| Product Bridge | `main-product.liquid` | `/pages/immersive?open_product={handle}` | Always (replaces hardcoded link) |
| Cart Bridge | `main-cart-items.liquid` | `/pages/immersive` | `cart.item_count > 0` |
| Collections List Bridge | `main-list-collections.liquid` | `/pages/immersive` | Always |
| Content Bridge | `main-blog.liquid`, `main-article.liquid` | `/pages/immersive` | Always |

The Collection Bridge and Search Bridge are placed **outside** `#ProductGridContainer` so facet filter Section Rendering API re-renders do not remove them.

### URL parameter handler

`safeBindImmersiveInit` reads three URL params with explicit priority ordering:

```javascript
var openProduct    = params.get('open_product');    // Priority 1
var openCollection = params.get('open_collection'); // Priority 2
var openSearch     = params.get('open_search');     // Priority 3
```

Each triggers its panel function after a 400 ms `setTimeout` (matching the existing `open_product` timing). The entire block is wrapped in `try/catch`.

### `openSearchPanel(encodedQuery)`

New function added to `immersive-store.js`. Decodes the query, fetches `/search?q={query}&section_id=immersive-product-grid` via `fetchWithCache`, and renders the response into the glass panel — reusing the existing `immersive-product-grid` section. No new section file required. Fires `trackImmersiveEvent('search_panel_opened', { query })`.

### 3D Mode Preference

**Writing:** `writeImmersivePreference()` is called inside `initImmersiveScene()` after `goToRoom(startRoom, true)`. It writes `immersive_preferred_mode = '3d'` to `localStorage` (wrapped in `try/catch`). Accepts an optional storage argument for testability.

**Clearing:** `clearImmersivePreference()` removes the key from `localStorage`. Called by the 3D→2D mode switch click handler in `bindImmersiveNav()` so the preference banner doesn't immediately reappear after the user intentionally switches to 2D.

**Reading:** `readImmersivePreference(storage)` returns `true` if the key equals `'3d'`; returns `false` on any error.

**Preference Banner:** Injected in `layout/theme.liquid` inside a `{%- unless template == 'page.immersive' or template == 'password' -%}` guard. Rendered `hidden` in HTML; a small inline `<script>` reads `localStorage` and reveals it for returning 3D shoppers. Includes a dismiss button that removes the banner from the DOM (not just hides it) and moves focus to the next sibling element. The `localStorage` flag is not cleared on dismiss — the banner reappears on the next 2D page visit unless the user clicked the 3D→2D switch (which clears it).

**Responsive:** The banner is fully responsive — on mobile (≤600px) it stacks vertically with `align-items: stretch`, readable `0.9375rem` font, `min-height: 40px` CTA tap target, and `max-width: calc(100vw - 2rem)` to prevent overflow.

**localStorage key:** `immersive_preferred_mode` (value `'3d'`). Defined as `var PREFERRED_MODE_KEY` alongside `ONBOARDING_KEY` and `WISHLIST_KEY`.

---

## Setup

### 1. Download Three.js (one-time)

Shopify blocks CDN scripts due to MIME type restrictions. Download locally:

```bash
curl -o dawn/assets/three.min.js https://threejs.org/build/three.min.js
```

### 2. Upload to Shopify

```bash
cd dawn
shopify theme push
```

Or upload files manually via Online Store > Themes > Edit code.

### 3. Upload room images

Upload to Shopify Files (Content > Files). Each room needs:
- A base image (the scene photo) — 1920×1080 recommended, WebP or PNG, under 2 MB
- A depth map (greyscale or colour — white/bright = foreground, dark = background)
- Optionally a mobile-optimised base image (portrait orientation)

For the `storefront` room, update `baseTextureUrl`, `mobileBaseTextureUrl`, `depthMapUrl`, and `mobileDepthMapUrl` directly in `STORE_ROOMS` in `immersive-store.js` as a fallback, or configure them via the theme editor. Always append `&width=1600&quality=75` (desktop) or `&width=900&quality=75` (mobile) to Shopify CDN URLs to keep texture payloads small.

For all rooms, configure images and collection hotspots via the theme editor (Online Store > Themes > Customize > navigate to `/pages/immersive` > Immersive Canvas section). JS defaults in `STORE_ROOMS` remain as fallback if no theme settings are configured.

### 4. Create collections

In Shopify Admin > Products > Collections. Handles must match exactly what's in `STORE_ROOMS` hotspot `targetCollection` values:

| Collection | Handle |
|---|---|
| Suffuse | `suffuse` |
| Soraya | `soraya` |
| Saad Bin Shahzad | `saad-bin-shahzad` |
| Eid Collection | `eid-collection` |
| Bridal & Mehndi | `bridal-mehndi` |
| Luxury Formals | `luxury-formals` |
| Casual Pret | `casual-pret` |
| SS5 Summer Pret 26 | `summer-pret-26-eid-edit-saad-bin-shahzad` |
| Suffuse Luxury Pret | `luxury-pret-suffuse` |
| Soraya Eid Pret | `lumene-festive-25-26-soraya-official` |

For the `featured_collections` room, collection handles are set via the theme editor — no code change needed.

### 5. Configure the immersive page

The 3D store runs exclusively on the `page.immersive` template at `/pages/immersive`. Create the page in Shopify Admin → Online Store → Pages:
- Title: `Immersive` (handle becomes `immersive` automatically)
- Under "Theme template", select `page.immersive`
- Save

The homepage (`index` template) is a standard 2D Dawn storefront with a "Explore 3D Store" CTA linking to `/pages/immersive`.

### 6. Theme editor customisation

Both storefronts are independently customisable from the theme editor:
- **2D homepage** → navigate to `/` in the editor — all standard Dawn sections are editable
- **3D store** → navigate to `/pages/immersive` in the editor — `immersive-canvas` section exposes all room images, depth maps, hotspot labels, menu, and onboarding settings; the three `immersive-editorial` sections below it are fully block-editable

The Dawn header section group will appear in the editor preview on the immersive page — hide it via the section visibility toggle in the editor. On the live storefront it is suppressed by CSS in `immersive-theme.css`.

---

## Customization

### Move hotspots

Edit the `hotspots` array in `STORE_ROOMS` inside `immersive-store.js`. `x` is left %, `y` is top %:

```javascript
{ x: 13, y: 40, label: "Suffuse", targetCollection: "suffuse" }
```

For `featured_collections` hotspots, use the theme editor instead.

### Add a room

1. Add an entry to `STORE_ROOMS` with `baseTextureUrl`, `depthMapUrl`, and `hotspots`
2. Upload the base image and depth map to Shopify Files
3. Add a "Back to lounge" hotspot in the new room: `{ x: 50, y: 90, label: "Back to lounge", targetRoom: "lounge" }`
4. Link to it from another room's hotspot using `targetRoom: "your_room_key"`
5. Add a menu button in `immersive-canvas.liquid` if you want it accessible from the slide-out menu

### Change the gold color

The Pakistani gold (`#d4af37`) appears in `immersive-theme.css` and in the `{% stylesheet %}` blocks of each Liquid file. Search and replace:

```
#d4af37  →  #YOUR_COLOR
rgba(212, 175, 55, ...)  →  rgba(R, G, B, ...)
```

### Adjust transition speed

In `immersive-store.js`, inside `goToRoom()`:

```javascript
var duration = reduceMotion ? 0 : 800; // ms
```

Transitions are always instant when the user has `prefers-reduced-motion` enabled.

### Adjust parallax strength and smoothness

At the top of `immersive-store.js`:

```javascript
var parallaxStrength = isMobileDevice() ? 0.03 : 0.08; // UV offset magnitude
var lerpFactor = 0.08; // 0.04 = very smooth, 0.12 = snappier
```

`parallaxStrength` controls how far the image shifts. `lerpFactor` controls how quickly the current mouse position chases the target — the lerp runs every frame in `animate()`.

The GLSL shader uses luminance from the depth map (`dot(rgb, vec3(0.299, 0.587, 0.114))`) so both greyscale and colour depth maps work correctly. Depth is remapped to `depth - 0.5` so mid-grey pixels have zero offset and foreground/background layers move in opposite directions.

### Image scaling behaviour

Cover scaling on all viewports — the image always fills the canvas with no letterboxing. Controlled in `handleResize()`.

---

## Key implementation details

### WebGL initialization

`safeBindImmersiveInit()` is the entry point. It guards against double-initialization with a `_immersiveInitBound` flag, tears down any existing WebGL renderer and clears all texture/content caches before re-initializing, then defers the actual init to the next animation frame so the canvas has real layout dimensions before `renderer.setSize()` is called:

```javascript
var _immersiveInitBound = false;

function safeBindImmersiveInit() {
  if (_immersiveInitBound) return;
  if (!document.getElementById('immersive-canvas')) return;
  _immersiveInitBound = true;

  // Tear down existing renderer if section was replaced in theme editor
  if (renderer) {
    renderer.dispose();
    renderer = null; scene = null; camera = null;
    uniforms = null; currentRoomKey = null;
    textureCache = {}; contentCache = {};
  }

  requestAnimationFrame(function () {
    initImmersiveScene();
    bindImmersiveNav();
    setupImageParallax();
    showImmersiveOnboardingIfNeeded();
    initWishlist();
    bindCookieBanner();

    // URL param deep-links — priority: open_product > open_collection > open_search
    try {
      if (window.URLSearchParams) {
        var params = new URLSearchParams(window.location.search);
        var openProduct    = params.get('open_product');
        var openCollection = params.get('open_collection');
        var openSearch     = params.get('open_search');
        if (openProduct) {
          setTimeout(function () { openProductPanel(openProduct); }, 400);
        } else if (openCollection) {
          setTimeout(function () { openCollectionPanel(openCollection); }, 400);
        } else if (openSearch) {
          setTimeout(function () { openSearchPanel(openSearch); }, 400);
        }
      }
    } catch (e) {}

    setTimeout(function () { _immersiveInitBound = false; }, 500);
  });
}

// Initial page load
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', safeBindImmersiveInit)
  : safeBindImmersiveInit();

// Theme editor: re-init when the canvas section is reloaded or selected
document.addEventListener('shopify:section:load', function (e) {
  if (e.target && e.target.querySelector('#immersive-canvas')) {
    _immersiveInitBound = false;
    safeBindImmersiveInit();
  }
});
document.addEventListener('shopify:section:select', function (e) {
  if (e.target && e.target.querySelector('#immersive-canvas')) safeBindImmersiveInit();
});
document.addEventListener('shopify:section:unload', function (e) {
  if (e.target && e.target.querySelector('#immersive-canvas')) _immersiveInitBound = false;
});
```

The `shopify:section:load/select/unload` listeners ensure the experience re-initializes correctly when settings are changed in the theme editor — without them, the old renderer holds stale DOM references and hotspots/panels stop working after a section save.

### Parallax pipeline

Mouse position is updated in `handleMouseMove` (attached to `window`) and stored in `mouseTarget`. The `animate()` loop lerps `mouseCurrent` toward `mouseTarget` each frame and writes the result to `uniforms.uMouse`:

```javascript
function animate() {
  requestAnimationFrame(animate);
  if (!uniforms) return;
  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;
  uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);
  if (renderer && scene && camera) renderer.render(scene, camera);
}
```

The `mousemove` listener is on `window` (not the canvas) because the canvas has `pointer-events: none`.

### Reduced motion

`prefers-reduced-motion` is checked once at script load. When true:
- `parallaxStrength` is not affected (WebGL parallax is a perceptual effect, not a CSS animation)
- Room transition duration is `0` (instant swap)
- CSS `@media (prefers-reduced-motion: reduce)` overrides in `{% stylesheet %}` blocks suppress transforms and transitions

### Texture loading with error handling

`loadRoomTextures()` uses `THREE.TextureLoader` (no `crossOrigin` — Shopify CDN images don't require it and setting `crossOrigin='anonymous'` triggers a CORS preflight that fails), error callbacks on both loads, and a 45-second timeout safety net. Failed textures are not cached so a retry attempt can succeed. On any failure, `showWebGLFallback()` is called if no room has loaded yet; otherwise the current room stays visible. The console warning logs both the base and depth URLs to make failures easy to diagnose.

`getRoomTextureUrls()` returns `null` if either URL is empty or missing, so `goToRoom()` never attempts a load with a broken URL. When a room has no textures configured, `goToRoom()` still updates state and renders hotspots so navigation isn't blocked — it just keeps the current canvas image visible.

### Dialog focus management

Both the glass panel and the immersive menu implement full ARIA dialog focus management via `openDialogFocus()` / `closeDialogFocus()` helpers:

- On open: saves `document.activeElement`, moves focus to close button or first focusable element
- While open: traps Tab/Shift+Tab within the dialog
- On Escape: closes the dialog
- On close: restores focus to the saved trigger element

### Buy Now / Add to Cart flow

Both `immersive-product-card.liquid` and `glass-product.liquid` use a standard Shopify product form with two purchase actions:

- **Add to cart** — `<button type="submit" name="add">` posts to `cart/add.js` via JS fetch, then redirects to checkout
- **Accelerated checkout** — `{{ form | payment_button }}` renders whichever payment methods the merchant has enabled (Shop Pay, PayPal, Apple Pay, Google Pay, etc.) directly from Shopify's payment settings — no code change needed to add or remove providers

All URLs use `shopRoot` for locale-awareness.

### Analytics

`trackImmersiveEvent(name, params)` fires to both GA4 (via `window.dataLayer`) and Meta Pixel (via `window.fbq`). Meta receives a standard `AddToCart` event for purchases and custom events for everything else.

Events tracked:

| Event name | GA4 name | Meta Pixel mapping | Fired when | Key parameters |
|---|---|---|---|---|
| `room_viewed` | `immersive_room_viewed` | Custom: `ImmersiveRoomViewed` | Room transition completes (initial load + every navigation) | `room_key` |
| `hotspot_clicked` | `immersive_hotspot_clicked` | Custom: `ImmersiveHotspotClicked` | Any hotspot button is clicked | `room_key`, `hotspot_label`, `target_type` (`room`\|`collection`\|`editorial`); plus `target_room_key` (room hotspots), `target_collection_handle` (collection hotspots), or `target_editorial_room` (editorial hotspots) |
| `editorial_entered` | `immersive_editorial_entered` | Custom: `ImmersiveEditorialEntered` | Editorial hotspot clicked and overlay opens | `room` |
| `panel_opened` | `immersive_panel_opened` | Custom: `ImmersivePanelOpened` | Collection or product panel finishes rendering | `panel_type` (`collection`\|`product`), `collection_handle` (always present; `null` for product panels opened without a collection context), `product_handle` (product panels only) |
| `search_panel_opened` | `immersive_search_panel_opened` | Custom: `ImmersiveSearchPanelOpened` | Search panel finishes rendering via `open_search` URL param | `query` |
| `add_to_cart_checkout` | `immersive_add_to_cart_checkout` | Standard: `AddToCart` | Successful cart add before checkout redirect | `product_handle` |
| `tryon_started` | `immersive_tryon_started` | Custom: `ImmersiveTryonStarted` | User clicks the Try-On button | `product_title`, `customer_id_present` |
| `tryon_completed` | `immersive_tryon_completed` | Custom: `ImmersiveTryonCompleted` | Try-on image is successfully generated | `product_title`, `customer_id_present`, `quota_remaining` |
| `tryon_failed` | `immersive_tryon_failed` | Custom: `ImmersiveTryonFailed` | Try-on request errors | `product_title`, `customer_id_present`, `error_message` |
| `wishlist_add` | `immersive_wishlist_add` | Custom: `ImmersiveWishlistAdd` | Product added to wishlist via any toggle | `product_handle`, `source` (`product_card`\|`product_panel`) |
| `wishlist_remove` | `immersive_wishlist_remove` | Custom: `ImmersiveWishlistRemove` | Product removed from wishlist via any toggle or panel remove action | `product_handle`, `source` (`product_card`\|`product_panel`\|`wishlist_panel`) |
| `wishlist_panel_opened` | `immersive_wishlist_panel_opened` | Custom: `ImmersiveWishlistPanelOpened` | Wishlist panel opens | `item_count` |
| `wishlist_view_product` | `immersive_wishlist_view_product` | Custom: `ImmersiveWishlistViewProduct` | "View product" action activated from wishlist panel | `product_handle` |

All events carry the required base payload: `event_category: 'immersive_store'` and `immersive_surface: 'immersive-3d-store'`. GA4 event names are prefixed `immersive_`.

> **Note on `add_to_cart_checkout` Meta mapping:** The `AddToCart` standard event receives the full immersive payload rather than the standard Meta schema (`content_ids`, `value`, `currency`). This is functional but Meta's conversion modelling works best with the standard fields — consider enriching the payload with product ID and price if available.

> **Note on missing `ViewContent`:** Meta best practices recommend firing `ViewContent` when a product detail panel opens. Currently no `ViewContent` event is fired on `panel_opened` for product panels. Consider adding this if Meta conversion tracking is a priority.

### Image parallax on cards

`setupImageParallax()` adds mousemove parallax to elements with `data-parallax-container`. Intensity is set via `data-parallax-intensity` (default 12px). The main product image uses intensity 18, related product thumbnails use 8, and collection grid cards use 12. A `_parallaxBound` flag prevents double-binding when called multiple times after panel re-renders.

### Localized strings in JavaScript

All user-facing strings in JS are sourced from `data-*` attributes set in Liquid:

```liquid
<section
  class="glass-product-section"
  data-error-select-variant="{{ 'sections.immersive_store.error_select_variant' | t | escape }}"
  data-error-add-to-cart="{{ 'sections.immersive_store.error_add_to_cart' | t | escape }}"
  data-success-added="{{ 'sections.immersive_store.added_to_cart' | t | escape }}"
>
```

### Content cache

All fetched section HTML is cached in memory by URL to avoid redundant requests via `fetchWithCache()`.

After each product panel render, `openProductPanel` calls `cacheWishlistProduct(productHandle, panel)` to extract title, price, and featured image from the injected HTML into `_wishlistProductCache`, and `syncAllWishlistToggles(panel)` to set the correct `aria-pressed` / `.is-saved` state on any wishlist toggle buttons in the newly injected content. This means zero additional network requests when the wishlist panel renders saved products the user has already viewed.

### Texture cache

Room textures are cached in `textureCache` by URL pair. On room transition, old textures are disposed from VRAM only if they're not in the cache. Hotspot hover preloads the next room's textures in the background via `preloadRoom()`.

### Variant buttons

ARIA radiogroup pattern — `role="radiogroup"` on the container, `role="radio"` + `aria-checked` on each button. `setupVariantButtons()` wires them up after each panel injection, including keyboard arrow-key navigation.

### Delivery date estimates

`setupDeliveryDates()` calculates 14–24 business days from today (skipping weekends) using `document.documentElement.lang` for locale-aware formatting.

### Social sharing

WhatsApp and Facebook open a share URL in a new window. Instagram and TikTok copy the product URL to clipboard (no direct web share API exists for those platforms).

### Virtual Try-On

Available on the product detail panel for signed-in customers with quota remaining. User uploads a photo → resized client-side to 768×1024 → POSTed to `https://scuk-vton.vercel.app/api/tryon` → result image displayed. Analytics events (`tryon_started`, `tryon_completed`, `tryon_failed`) are fired at each stage.

### View Transitions API

`document.startViewTransition()` is used in three places:

1. **Hotspot → editorial overlay morph** — in `enterEditorialMode()`, the clicked hotspot and the overlay are given matching `view-transition-name: editorial-morph` values before the transition fires, causing the browser to morph the bubble into the full-screen panel. Names are cleared in `transition.finished.finally()`.
2. **Panel content swaps** — `transitionPanelContent()` wraps the `innerHTML` replacement in `startViewTransition` so panel navigations (collection → product, product → product) cross-fade smoothly.
3. **Collection panel open** — `openCollectionPanel()` wraps its render call in `startViewTransition`.

All three fall back to a direct DOM mutation on browsers without View Transitions support (Safari, Firefox).

### WebGL fallback

If WebGL is not supported, `showWebGLFallback()` renders a static `<img>` of the storefront texture and still renders hotspots so the experience degrades gracefully.

---

## Locale keys

All user-facing strings use the `| t` filter. No hard-coded English in Liquid templates.

Key namespaces in `locales/en.default.json`:

**`sections.immersive_journey_bridges`** — `snippets/immersive-bridge-btn.liquid`, `layout/theme.liquid`, `sections/immersive-canvas.liquid`
- `collection_cta`, `collection_cta_aria` (with `title:` placeholder) — Collection Bridge
- `search_cta`, `search_cta_aria` (with `terms:` placeholder) — Search Bridge
- `product_cta`, `product_cta_aria` (with `title:` placeholder) — Product Bridge
- `cart_cta`, `cart_cta_aria` — Cart Bridge
- `collections_list_cta`, `collections_list_cta_aria` — Collections List Bridge
- `content_cta`, `content_cta_aria` — Blog/Article Content Bridge
- `preference_banner_text`, `preference_banner_cta`, `preference_banner_dismiss`, `preference_banner_dismiss_aria`, `preference_banner_aria` — Preference Banner in `theme.liquid`
- `switch_to_2d`, `switch_to_2d_aria` — 3D→2D mode switch pill in immersive header
- `switch_to_3d`, `switch_to_3d_aria` — reserved for future 2D→3D toggle use

**`sections.immersive_store`** — `immersive-canvas.liquid`
- `heading`, `intro`, `launch_button`
- `menu.dialog_title`, `menu.close`, `menu.nav_aria`, `menu.storefront`, `menu.lounge`, `menu.designer_houses`, `menu.occasions`, `menu.featured_collections`, `menu.faq`
- `search_aria`, `menu_button`, `menu_close_button` (label shown when menu is open)
- `cart_label`
- `collection_empty`, `collection_not_found`, `collection_panel_aria`
- `error_select_variant`, `error_add_to_cart`, `added_to_cart`
- `error_load_collection`, `error_load_product` (panel fetch error messages, read from `data-*` by JS)
- `cookie_banner.aria_label`, `cookie_banner.text`, `cookie_banner.learn_more`, `cookie_banner.decline`, `cookie_banner.accept`
- `onboarding.title`, `onboarding.description`, `onboarding.dismiss` — first-time onboarding overlay (`#immersive-onboarding`)
- `recommendations.heading`, `recommendations.card_aria` — dynamic product recommendations section (`glass-product-recommendations.liquid`)
- `nav_back_to_lounge` — "Back to lounge" hotspot label (injected via JSON config block using `| t`)
- `nav_back_to_storefront` — "Back to storefront" hotspot label (injected via JSON config block using `| t`)
- `nav_enter_store` — "Enter store" hotspot label on the storefront room (injected via JSON config block using `| t`)
- `nav_designer_houses`, `nav_occasions`, `nav_featured_collections` — lounge room navigation hotspot labels (injected via JSON config block using `| t`)
- `nav_explore_designers`, `nav_our_occasions`, `nav_featured_stories` — editorial entry hotspot labels on the designer_houses, occasions, and featured_collections rooms respectively (injected via JSON config block using `| t`)

**`sections.immersive.product_panel`** — `glass-product.liquid`
- `title`, `close`, `variant_group_label`
- `care_heading`, `care_default_dry_clean`, `care_default_no_bleach`, `care_default_iron_low`, `care_default_store` (fallback care instruction list items)
- `size_heading`, `disclaimer_heading`, `disclaimer_default`
- `size_table.size`, `size_table.bust`, `size_table.waist`, `size_table.hip`
- `related_heading`, `share_label`
- `share_whatsapp`, `share_facebook`, `share_instagram`, `share_tiktok`
- `share_on_whatsapp_aria`, `share_on_facebook_aria`, `share_on_instagram_aria`, `share_on_tiktok_aria` — ARIA labels on share buttons (previously hard-coded English, now use `| t`)
- `delivery_estimate` (with `{{ from }}` and `{{ to }}` placeholders) — rendered via `data-delivery-template` attribute; JS reads the template and substitutes formatted dates
- Media thumbnail buttons use Dawn's existing `products.product.media.load_image`, `products.product.media.load_model`, and `products.product.media.load_video` keys (with `index:` placeholder) — no new keys needed

**`sections.immersive.product_card`** — `immersive-product-card.liquid`
- `view_product` (with `title:` placeholder), `select_variant`, `unavailable_aria`, `badge_new`

**`sections.immersive.product_grid`** — `immersive-product-grid.liquid`
- `empty`, `back_to_collection`

**`sections.virtual_tryon`** — `virtual-tryon.liquid`
- `title`, `gate_title`, `gate_subtitle`, `gate_button`
- `subtitle`, `upload_label`, `upload_aria`, `consent_text`, `button_label`
- `loading_title`, `loading_subtitle`, `result_label`
- `quota_badge_title`, `quota_available`, `quota_remaining`
- `error_photo_read`, `error_quota_exceeded`, `error_auth_required` — error messages read from `data-*` by JS
- `status_uploading`, `status_processing`, `status_draping`, `status_finalizing`, `status_success` — progress status strings read from `data-*` by JS

**`sections.immersive_store.wishlist`** — `immersive-canvas.liquid`, `glass-product.liquid`, `immersive-product-card.liquid`
- `button_aria`, `panel_title`, `close`, `empty`
- `save` (with `title:` placeholder), `saved` (with `title:` placeholder)
- `save_label`, `saved_label`, `view_product`, `remove`
- `item_count` (with `count:` placeholder), `item_count_plural` (with `count:` placeholder)

**`sections.immersive_editorial`** — `immersive-editorial.liquid`, `immersive-canvas.liquid`
- `name` — section name (runtime display only; schema label is in `en.default.schema.json`)
- `overlay_title` — visually-hidden heading on the editorial overlay dialog
- `loading` — "Loading Story..." spinner text shown while editorial section is fetching (read from `data-msg-loading` on `#immersive-editorial-overlay` by JS)
- `error_unavailable` — error message shown when editorial fetch fails (read from `data-msg-error` on `#immersive-editorial-overlay` by JS)
- `try_again` — retry button label in the editorial error state (read from `data-msg-try-again` on `#immersive-editorial-overlay` by JS)

> **Note:** Schema-level keys for `immersive_editorial` (settings labels, block names, option labels, preset name) live exclusively in `en.default.schema.json` under `sections.immersive_editorial`. They are not duplicated in `en.default.json`.

**Dawn keys reused (no duplication)**
- `general.share.success_message` — "Link copied to clipboard" shown on Instagram/TikTok share button after clipboard copy (read from `data-copied-success` on the share buttons container; this string reuses Dawn key `general.share.success_message` for consistency)
- `accessibility.close` — close button labels where semantics match

Schema translations in `en.default.schema.json`: `sections.immersive_store` (includes per-room headers and hotspot labels), `sections.immersive_product_grid`, `sections.glass_product`, `sections.immersive_editorial`.

### Dawn key reuse notes

- `products.product.add_to_cart` — reused in `immersive-product-card.liquid` and `glass-product.liquid` for the add-to-cart submit button
- `products.product.sold_out` — reused in both card and product panel for sold-out state
- `products.product.from_text` — reused in `immersive-product-card.liquid` for price range display
- `products.product.no_image` — reused in `immersive-product-card.liquid` for the no-image placeholder
- `accessibility.close` — available in Dawn but the immersive panel uses `sections.immersive_store.close` for its own close button label to allow independent customisation

---

## Troubleshooting

**Canvas is black / textures not loading**
- Check `STORE_ROOMS` texture URLs are correct Shopify CDN URLs — empty string `''` is a valid placeholder that skips loading; a broken URL will 404
- Do not set `crossOrigin` on `THREE.TextureLoader` — Shopify CDN doesn't send CORS headers and the preflight will fail, causing a black canvas
- Open DevTools Network tab and look for 404s on image requests
- Check the browser console for `[Immersive] Failed to load base/depth texture` — the log now includes both URLs for easy diagnosis
- Hard-refresh (`Cmd+Shift+R`) after any JS change to clear the in-memory texture cache

**Hotspots not appearing or doing nothing when clicked**
- Inspect `#ui-layer` in DevTools — it should contain `<button class="immersive-hotspot">` elements after `renderHotspots()` runs
- If hotspots appear but clicks do nothing, open the console and look for `[Immersive] Hotspot clicked:` — if the log shows `"targetCollection": null`, the JSON config block is overriding the JS defaults with null. Ensure the config block falls back to hardcoded handles rather than emitting `null` for unconfigured slots
- If the console shows `[Immersive] Hotspot has no target`, the hotspot object has neither `targetRoom`, `targetCollection`, nor `targetEditorialRoom`

**Experience stops working after saving a setting in the theme editor**
- This was caused by the old `bindImmersiveInit` not re-running after Shopify replaces the section DOM. The new `safeBindImmersiveInit` + `shopify:section:load/select` listeners handle this automatically — if you still see stale behavior, check that the `shopify:section:load` listener is present at the bottom of `immersive-store.js`

**Storefront shows the wrong room on page load**
- `sessionStorage` was restoring the last visited room on every refresh. The current logic only restores a non-storefront room if a panel was open — a plain refresh always starts at storefront. If you still see the wrong room, open DevTools → Application → Session Storage and clear the `immersive_state` key manually

**Parallax not moving**
- Check `prefers-reduced-motion` is not enabled in OS accessibility settings (System Settings > Accessibility > Motion > Reduce Motion on macOS)
- Confirm `window.addEventListener('mousemove', handleMouseMove)` is registered — the listener is on `window`, not the canvas

**Parallax is jerky**
- Adjust `lerpFactor` at the top of `immersive-store.js` (lower = smoother)

**"THREE is not defined" error**
- `three.min.js` is missing from `assets/` — download it (see Setup step 1)

**Glass panel is empty**
- Verify the collection handle matches exactly (lowercase, hyphens)
- Test the fetch URL directly: `shopRoot + 'collections/your-handle?section_id=glass-panel'`
- Check the collection has products

**Room shows wrong images or wrong collections**
- Configure images and collections via theme editor (Customize > Homepage > Immersive Canvas section)
- If theme editor settings are blank, the JS fallback values in `STORE_ROOMS` are used — update those as a last resort

**MIME type errors for scripts**
- Do not load Three.js from a CDN — Shopify rejects them. Use a local file via `asset_url`.

**Low FPS**
- Reduce pixel ratio: `renderer.setPixelRatio(1)` in `initImmersiveScene()`
- Use smaller texture images (WebP recommended)
- Check GPU usage in browser DevTools Performance tab

**Analytics not firing**
- Confirm `window.dataLayer` is an array (GA4 gtag.js must be loaded before `immersive-store.js`)
- Confirm `window.fbq` is a function (Meta Pixel must be loaded before `immersive-store.js`)
- Check the browser console for `Analytics error` warnings

**Editorial not opening / overlay not appearing**
- Check browser console for `[Immersive] Editorial overlay not found` — means `#immersive-editorial-overlay` is missing from the DOM (check `immersive-canvas.liquid` has the overlay markup)
- Check for `[Immersive] No immersive-editorial section instance found on page for room: designer_houses` — the `querySelector('.immersive-editorial[data-room-key="designer_houses"]')` returned nothing; verify the three `immersive-editorial` sections are present in `index.json` / `page.immersive.json` with the correct `room_key` setting values
- If the section element is found but the fetch still 404s, inspect `data-section-id` on the element in DevTools and confirm it matches a real Shopify section instance ID (should look like `immersive_editorial_xxxxxxxxxxxxxxxx`)
- If the overlay appears but is empty after loading, the fetched section had no blocks — add banners via the theme editor
- Confirm `openDialogFocus()` is called after `panel.setAttribute('data-open', 'true')`
- Check that `.immersive-store__panel-close` is present in the DOM before focus is attempted

---

## Spatial Editorial UX

The editorial overlay and global immersive UI use a unified "spatial" visual language — sharp architectural corners, high-refractive glassmorphism, and a mobile-first asymmetric layout that ties the DOM content visually to the 3D room behind it.

### Glassmorphism

**Hero panel** (`immersive-editorial__hero-panel`):
- `backdrop-filter: blur(24px)` — intensified blur for a "thick glass" feel
- `box-shadow: inset 0 0 20px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)` — inset specular highlight + outer depth shadow
- `border-radius: 1px` — near-zero rounding for an architectural, premium edge

**Banner content panels** (`immersive-editorial__banner-content`):
- `backdrop-filter: blur(16px)` — slightly lighter blur than the hero
- `box-shadow: inset 0 0 15px rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.25)` — subtle inset highlight
- `border-radius: 1px` — matches hero panel sharpness

### Mobile asymmetric stagger

On viewports ≤ 767px, alternate banner cards are offset to break the monolithic stack and create spatial rhythm:

```css
@media screen and (max-width: 767px) {
  .immersive-editorial__banner:nth-child(even) {
    margin-left: 10%;
    width: 90%;
  }
  .immersive-editorial__banner:nth-child(odd) {
    margin-right: 10%;
    width: 90%;
  }
}
```

Odd cards are pushed left (right margin), even cards are pushed right (left margin). Both are 90% wide to maintain readability.

### Global sharp corners (`immersive-theme.css`)

All interactive elements in the global immersive theme use `border-radius: 0 !important` to match the spatial editorial visual language edge-to-edge:

- Search fields (`.template-search .field`, `.template-search .field__input`)
- Product cards on search results (`.template-search .card-wrapper`, `.template-search .card`)
- Cart checkout button (`.template-cart .cart__checkout-button`)

The scrollbar thumb retains `border-radius: 3px` as a functional exception.

### DOM-to-WebGL depth parallax

The scroll-linked sinking effect uses aggressive values to create a pronounced depth illusion when the editorial overlay is scrolled:

| Parameter | Value | Effect |
|---|---|---|
| `foreSinkingShift` | `scrollWeight * 0.25` | Foreground pixels sink strongly downward |
| `backCounterShift` | `(1.0 - scrollWeight) * -0.08` | Background pixels shift slightly upward |

These values were increased from the original `0.15` / `-0.05` to make the 3D room visibly react to the DOM scroll gesture, tying the physical scroll to the WebGL space.

---

## Known gaps (pre-existing, not regressions)

- **RESOLVED: `#cart-toggle`** — wired to Dawn's `<cart-drawer>` web component via `bindImmersiveNav()`. Calls `cartDrawer.open(cartToggle)` if the element is present; falls back to `shopRoot + 'cart'` if the drawer isn't in the DOM (e.g. on non-drawer cart configurations).

- **RESOLVED: `#immersive-cookie-accept` / `#immersive-cookie-decline`** — `bindCookieBanner()` handles both buttons. Both dismiss the banner and write `immersive_cookie_notice = '1'` to `localStorage`. On subsequent loads the banner stays hidden. Notice-only (no analytics gating). Called from both `bindImmersiveInit()` and `safeBindImmersiveInit()`.

- **RESOLVED: `.immersive-loader__ring` CSS** — the spin keyframe and ring styles are defined in `immersive-canvas.liquid`'s `{% stylesheet %}` block. `showLoader()` in JS also injects the keyframe inline as a belt-and-braces fallback.

---

## Active specs

| Spec | Path | Status |
|---|---|---|
| Immersive Theme Improvements | `.kiro/specs/immersive-theme-improvements/` | Complete |
| Immersive Store Enhancements v2 | `.kiro/specs/immersive-store-enhancements-v2/` | Complete |
| Immersive Editorial | `.kiro/specs/immersive-editorial/` | Complete |
| Immersive Wishlist | `.kiro/specs/immersive-wishlist/` | Complete |

---

## Browser support

| Browser | Support |
|---|---|
| Chrome 90+ | Full |
| Firefox 88+ | Full |
| Safari 14+ | Full |
| Edge 90+ | Full |
| Mobile Safari | Full |
| Chrome Android | Full |
| No WebGL | Graceful fallback (static image + hotspots) |

---

## Known Gaps

Features that are schema-ready but not yet fully implemented. These are tracked here for future development.

### Welcome Screen (Onboarding Overlay)

The onboarding overlay is fully controllable from the theme editor under the "Welcome screen" settings group. The following options are wired up and working:

- Enable/disable the overlay (`onboarding_enabled`)
- Custom title (`onboarding_title`)
- Custom description text (`onboarding_description`)
- Custom dismiss button label (`onboarding_dismiss_label`)
- Show once per visitor vs. every visit (`onboarding_show_once`)

**Not yet implemented — future work:**

- Background image or video behind the overlay
- Animation style selector (fade, slide-up, scale-in)
- Overlay opacity / blur intensity control
- Delay before showing (e.g. show after 2 seconds)
- Mobile-specific title and description overrides
- CTA link option (e.g. "Learn more" secondary button linking to an about page)
- Auto-dismiss after N seconds
- Show only to new customers (requires customer tag check via app proxy)
- A/B test variant support
