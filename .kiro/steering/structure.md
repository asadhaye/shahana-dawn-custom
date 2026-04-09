# Project Structure

## Top-level layout

```
├── layout/theme.liquid              # Conditional loading of immersive assets (page.immersive only); header/footer suppressed on page.immersive only; preference banner injected on all non-immersive/non-password templates
├── templates/                       # JSON templates (OS 2.0)
│   ├── index.json                   # Homepage — standard 2D Dawn storefront (slideshow + featured collections + Bridge CTA to 3D store); header/footer render normally
│   └── page.immersive.json          # /pages/immersive — sole entry point for the WebGL 3D experience
├── sections/                        # Liquid sections
├── snippets/                        # Liquid snippets
├── assets/                          # CSS, JS, SVG, images
├── config/                          # settings_schema.json + settings_data.json
├── locales/                         # Translation files (en.default.json is canonical)
├── docs/                            # Internal theme docs (keep in sync with code changes)
└── .kiro/
    ├── specs/                       # Feature specs
    ├── steering/                    # AI steering documents (this folder)
    └── hooks/                       # Kiro automation hooks
```

## Routing

| URL | Template | Purpose |
|---|---|---|
| `/` | `index.json` | 2D homepage — SEO landing page, standard Dawn layout, Bridge CTA to 3D store |
| `/pages/immersive` | `page.immersive.json` | 3D immersive store — WebGL canvas, rooms, editorial overlays |
| `/collections/*` | Dawn default | Standard collection pages with Collection Bridge CTA |
| `/products/*` | Dawn default | Standard product pages with Product Bridge CTA |
| `/search` | Dawn default | Search results with Search Bridge CTA |
| `/cart` | Dawn default | Cart page with Cart Bridge CTA |
| `/collections` | Dawn default | Collections list with Collections List Bridge CTA |
| `/blogs/*`, `/blogs/*/articles/*` | Dawn default | Blog/article pages with Content Bridge CTA |

## Core immersive files — do not break

| File | Role |
|---|---|
| `layout/theme.liquid` | Conditional script/CSS loading (page.immersive only); header/footer gating (page.immersive only); preference banner on all non-immersive/non-index/non-password pages |
| `sections/immersive-canvas.liquid` | Canvas + UI layer + fixed header (menu-drawer, search, account, wishlist, cart, 3D→2D mode switch) + glass panel shell (`#glass-panel`) + wishlist panel (`#immersive-wishlist-panel`) + editorial overlay (`#immersive-editorial-overlay`) + onboarding overlay (`#immersive-onboarding`) + cookie banner (`#immersive-cookie-banner`) + rooms config JSON |
| `sections/glass-panel.liquid` | Dialog shell for Section Rendering responses; owns ARIA + focus trap |
| `sections/glass-product.liquid` | Product detail view rendered into glass-panel |
| `sections/immersive-product-grid.liquid` | Collection grid rendered into glass-panel; also used for search results |
| `sections/glass-product-recommendations.liquid` | Related products panel |
| `snippets/immersive-product-card.liquid` | Self-contained product card with `data-product-handle` |
| `snippets/immersive-bridge-btn.liquid` | Shared 2D→3D bridge pill CTA; used on all 2D templates |
| `snippets/virtual-tryon.liquid` | VTO widget; depends only on `product`, `customer`, `settings.*` |
| `assets/immersive-store.js` | Three.js engine — world, rooms, parallax, nav, analytics, URL param handler, preference manager, wishlist manager, editorial overlay, cookie consent |
| `assets/bridge-behavior.js` | Device/connection-aware bridge behavior — runs on all pages |
| `assets/three.min.js` | Three.js local copy |
| `assets/immersive-theme.css` | Global immersive styles — loaded on page.immersive only |

## Bridge CTA snippet

`snippets/immersive-bridge-btn.liquid` is the shared pill CTA used across all 2D→3D entry points. Parameters:

| Param | Type | Required | Description |
|---|---|---|---|
| `bridge_url` | string | yes | Destination URL (e.g. `/?open_collection=suffuse`) |
| `bridge_label` | string | yes | Already-translated CTA label |
| `bridge_aria` | string | yes | Already-translated aria-label |
| `bridge_class` | string | no | Optional BEM modifier suffix (e.g. `collection`) |

## Section Rendering API pattern

```
Collection panel:  GET /collections/{handle}?section_id=glass-panel
Product detail:    GET /products/{handle}?section_id=glass-product
Search results:    GET /search?q={terms}&section_id=immersive-product-grid
```

All fetch calls go through `fetchWithCache(url)` — centralised, URL-keyed, adds `X-Requested-With: XMLHttpRequest`.

## URL deep-link parameters

The 3D store at `/pages/immersive` (and `/`) reads these on init:

| Parameter | Handler | Effect |
|---|---|---|
| `?open_product={handle}` | `openProductPanel()` | Opens product glass panel |
| `?open_collection={handle}` | `openCollectionPanel()` | Opens collection grid panel |
| `?open_search={terms}` | `openSearchPanel()` | Opens search results panel |

`open_product` takes priority over `open_collection` when both are present.

## Room structure

Rooms defined in `STORE_ROOMS` in `immersive-store.js`. Dynamic overrides merged from `<script type="application/json" id="immersive-rooms-config">` rendered by `immersive-canvas.liquid`.

```
storefront → lounge → designer_houses (editorial)
                    → occasions (editorial)
                    → featured_collections (editorial)
```

Each room: `baseTextureUrl`, `mobileBaseTextureUrl`, `depthMapUrl`, `mobileDepthMapUrl`, `hotspots[]`

## Preference system

- `writeImmersivePreference()` — called on `initImmersiveScene()` success; writes `immersive_preferred_mode = '3d'` to localStorage
- `readImmersivePreference()` — read by inline script in `theme.liquid`; shows preference banner on 2D pages when flag is set
- Preference banner is suppressed on `page.immersive`, `index`, and `password` templates
- Preference banner CTA links to `/pages/immersive-store` (the actual page handle used in the store)
- Preference banner dismiss removes the banner from DOM and restores focus to the next sibling element

## Locales

- `locales/en.default.json` — canonical; all user-facing strings use `| t`
- `locales/en.default.schema.json` — schema label translations
- Key namespaces: `sections.immersive_store`, `sections.immersive.product_panel`, `sections.immersive.product_card`, `sections.immersive.product_grid`, `sections.virtual_tryon`, `sections.immersive_editorial`, `sections.immersive_journey_bridges`

## Specs

| Spec | Path |
|---|---|
| Immersive Journey Bridges | `.kiro/specs/immersive-journey-bridges/` |
| Immersive Theme Improvements | `.kiro/specs/immersive-theme-improvements/` |
| Immersive Store Enhancements v2 | `.kiro/specs/immersive-store-enhancements-v2/` |

## Routing constraints (Shopify platform)

- Shopify has exactly one homepage: `templates/index.json` at `/`
- All other content types have fixed URL prefixes: `/pages/`, `/collections/`, `/products/`, `/blogs/`
- Do not attempt to place the 3D store at `/immersive` as a native template — this is not supported
- Keep the 3D store as a Page resource with handle `immersive` → URL `/pages/immersive`
- If a marketing URL like `/immersive` is desired, use Admin → Navigation → URL Redirects (`/immersive` → `/pages/immersive`); the browser address bar will still show `/pages/...` after redirect

## page.immersive.json required sections

`templates/page.immersive.json` must contain these section assignments:

| Section key | Section file |
|---|---|
| `immersive_canvas` | `immersive-canvas` |
| `editorial_designer_houses` | `immersive-editorial` |
| `editorial_occasions` | `immersive-editorial` |
| `editorial_featured_collections` | `immersive-editorial` |

Assign this template to the Immersive Store Page in Admin (Online Store → Pages → select page → Theme template: `page.immersive`).
