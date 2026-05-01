# Deleted Files — launch-readiness-fixes → main

These files existed in `launch-readiness-fixes` but were removed before merging to `main`.

---

## Immersive Cart & Checkout (custom pages — removed)

These files implemented a custom immersive cart and checkout experience that was abandoned in favour of Dawn's native cart drawer.

| File | Notes |
|---|---|
| `assets/immersive-cart.css` | Styles for custom immersive cart page |
| `assets/immersive-cart.js` | JS for custom immersive cart page |
| `assets/immersive-cart.js.liquid` | Liquid-rendered JS for immersive cart |
| `assets/immersive-checkout.css` | Styles for custom immersive checkout page |
| `assets/immersive-checkout.js` | JS for custom immersive checkout page |
| `assets/immersive-checkout.js.liquid` | Liquid-rendered JS for immersive checkout |
| `sections/immersive-cart.liquid` | Section for custom immersive cart |
| `sections/immersive-checkout.liquid` | Section for custom immersive checkout |
| `templates/immersive-cart.liquid` | Template for `/immersive-cart` URL |
| `templates/page.immersive-cart.liquid` | Template for `/pages/immersive-cart` URL |
| `templates/page.immersive-checkout.liquid` | Template for `/pages/immersive-checkout` URL |

**Why removed:** Buy Now now opens Dawn's native `<cart-drawer>` instead of navigating to a custom cart page.

---

## Modular JS Modules (removed — functionality merged back into monolith)

These were part of a modular refactor that was reverted. All functionality lives in `immersive-store.js`.

### Core modules
| File | Purpose |
|---|---|
| `assets/immersive/core/atmosphere.js` | Room mood/colour palette system |
| `assets/immersive/core/state-manager.js` | Centralised state management |
| `assets/immersive/core/webgl-engine.js` | WebGL rendering engine abstraction |

### Feature modules
| File | Purpose |
|---|---|
| `assets/immersive/features/fab.js` | Floating action button |
| `assets/immersive/features/filters.js` | Product filtering in panels |
| `assets/immersive/features/gestures.js` | Touch/swipe gesture handling |
| `assets/immersive/features/limited-time.js` | Limited-time offer badges |
| `assets/immersive/features/quick-add.js` | Quick add to cart from grid |
| `assets/immersive/features/room-recommender.js` | Room recommendation engine |
| `assets/immersive/features/search.js` | In-immersive search |

### Editorial modules
| File | Purpose |
|---|---|
| `assets/immersive/editorial/scroll-reveal.js` | Scroll-triggered reveal animations |
| `assets/immersive/editorial/timeline.js` | Timeline/story editorial layout |

### Panel modules
| File | Purpose |
|---|---|
| `assets/immersive/panels/collection-panel.js` | Collection panel logic |

### Guided mode
| File | Purpose |
|---|---|
| `assets/immersive/guided/guided-mode.js` | Guided shopping tour mode |

### Utility modules
| File | Purpose |
|---|---|
| `assets/immersive/utils/analytics.js` | Analytics event helpers |
| `assets/immersive/utils/dom.js` | DOM utility helpers |
| `assets/immersive/utils/fetch.js` | Fetch/cache utilities |
| `assets/immersive/utils/skeleton.js` | Skeleton loading screens |

### Fluid reveal
| File | Purpose |
|---|---|
| `assets/immersive/fluid-reveal.js` | WebGL fluid distortion hover effect |

---

## Room Canvas Assets (local webp files — removed)

These were locally-stored room texture files. In `main`, all room textures are served from Shopify CDN URLs hardcoded in `room-manager.js`.

| File | Notes |
|---|---|
| `assets/room-canvas/storefront-base.webp` | Storefront room desktop base |
| `assets/room-canvas/storefront-depth.webp` | Storefront room depth map |
| `assets/room-canvas/storefront-m-base.webp` | Storefront room mobile base |
| `assets/room-canvas/lounge-base.webp` | Lounge room desktop base |
| `assets/room-canvas/lounge-depth.webp` | Lounge room depth map |
| `assets/room-canvas/lounge-m-base.webp` | Lounge room mobile base |
| `assets/room-canvas/designer-houses-base.webp` | Designer houses desktop base |
| `assets/room-canvas/designer-houses-m-base.webp` | Designer houses mobile base |
| `assets/room-canvas/designer_houses-depth.webp` | Designer houses depth map |
| `assets/room-canvas/occasions-base.webp` | Occasions desktop base |
| `assets/room-canvas/occasions-depth.webp` | Occasions depth map |
| `assets/room-canvas/occasions-m-base.webp` | Occasions mobile base |
| `assets/room-canvas/featured-collections-base.webp` | Featured collections desktop base |
| `assets/room-canvas/featured-collections-m-base.webp` | Featured collections mobile base |
| `assets/room-canvas/featured_collections-depth.webp` | Featured collections depth map |
| `assets/room-canvas/ceremonial-editorial-base.webp` | Ceremonial editorial base |
| `assets/room-canvas/ceremonial-editorial-depth.webp` | Ceremonial editorial depth map |
| `assets/room-canvas/ceremonial-editorial-m-base.webp` | Ceremonial editorial mobile base |
| `assets/room-canvas/heritage-editorial-base.webp` | Heritage editorial base |
| `assets/room-canvas/heritage-editorial-depth.webp` | Heritage editorial depth map |
| `assets/room-canvas/heritage-editorial-m-base.webp` | Heritage editorial mobile base |
| `assets/room-canvas/tmp_attar/` | Experimental Attar theme room variants (5 files) |

### Python scripts (removed)
| File | Purpose |
|---|---|
| `assets/room-canvas/generate_rooms.py` | Room texture generation script |
| `assets/room-canvas/generate_rooms_attar.py` | Attar variant generation script |
| `assets/room-canvas/generate_editorial.py` | Editorial texture generation script |
| `assets/room-canvas/generate_editorial_depth_maps.py` | Depth map generation script |
| `assets/room-canvas/deploy_attar.py` | Attar deployment script |
| `assets/room-canvas/ATTAR-philosophy.md` | Attar design philosophy doc |
| `assets/room-canvas/ROOM-SPECS.md` | Room specifications doc |

---

## Sections (removed)

| File | Notes |
|---|---|
| `sections/immersive-homepage-bridge.liquid` | Custom homepage bridge section (replaced by standard bridge snippet) |

---

## Snippets (removed)

| File | Notes |
|---|---|
| `snippets/cart-terms.liquid` | Cart terms and conditions snippet (used by immersive cart) |

---

## Tests (removed)

These tests covered features that were removed or reverted.

| File | What it tested |
|---|---|
| `tests/bug1-global-api-exploration.test.js` | Bug 1 exploration (global API fix) |
| `tests/bug1-preservation.test.js` | Bug 1 preservation check |
| `tests/bug2-edge-cases.test.js` | Bug 2 edge cases |
| `tests/bug2-integration.test.js` | Bug 2 integration |
| `tests/bug2-navigation-history-exploration.test.js` | Navigation history bug exploration |
| `tests/bug2-preservation.test.js` | Bug 2 preservation check |
| `tests/bug2-property-based.test.js` | Bug 2 property-based tests |
| `tests/editorial-parallax-gallery.test.js` | Parallax gallery feature (removed) |
| `tests/immersive-accessibility.test.js` | Accessibility tests |
| `tests/immersive-bridge-behavior.unit.test.js` | Bridge behavior unit tests |
| `tests/immersive-bridge-button.unit.test.js` | Bridge button unit tests |
| `tests/immersive-integration.test.js` | Integration tests |
| `tests/immersive-performance.test.js` | Performance tests |
| `tests/immersive-preference-banner.unit.test.js` | Preference banner unit tests |
| `tests/immersive-preference-manager.unit.test.js` | Preference manager unit tests |
| `tests/immersive-room-atmosphere.test.js` | Room atmosphere tests (module removed) |
| `tests/immersive-shopping-journey-properties.test.js` | Shopping journey property tests |
| `tests/immersive-url-parameter-handler.unit.test.js` | URL parameter handler unit tests |
| `tests/pixel-room-transition.test.js` | Pixel dissolve transition tests (feature removed) |
| `tests/preference-banner-focus-restoration.test.js` | Preference banner focus restoration tests |
| `tests/skeleton-fluid-reveal.test.js` | Skeleton/fluid reveal tests (modules removed) |
