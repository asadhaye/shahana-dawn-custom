# Shahana Collection — Shopify Theme Context

A Dawn-based Shopify OS 2.0 theme implementing a WebGL-powered "Immersive Store" experience for a UK-based Pakistani luxury fashion brand.

---

## Architecture Overview

### Dual Experience Model

| Layer | URL | Template | Purpose |
|-------|-----|----------|---------|
| **2D Storefront** | `/` | `templates/index.json` | SEO landing page, standard Dawn layout, Bridge CTAs to 3D |
| **3D Immersive** | `/pages/immersive` | `templates/page.immersive.json` | WebGL showroom, room navigation, editorial overlays |

The 2D storefront is the primary SEO surface. The 3D experience is a progressive enhancement accessed via Bridge CTAs.

---

## Core Files — Do Not Modify Without Explicit Instruction

| File | Role |
|------|------|
| `layout/theme.liquid` | Conditional asset loading (WebGL on `page.immersive` only), header/footer gating, preference banner injection |
| `sections/immersive-canvas.liquid` | Canvas + UI layer + fixed header + overlay shells + rooms config JSON |
| `sections/glass-panel.liquid` | Dialog shell for Section Rendering responses; owns ARIA + focus trap |
| `sections/glass-product.liquid` | Product detail view rendered into glass-panel |
| `sections/immersive-product-grid.liquid` | Collection grid rendered into glass-panel |
| `sections/immersive-editorial.liquid` | Per-room editorial content (designer houses, occasions, featured collections) |
| `snippets/immersive-bridge-btn.liquid` | Shared 2D→3D bridge pill CTA |
| `snippets/immersive-product-card.liquid` | Self-contained product card with `data-product-handle` |
| `snippets/virtual-tryon.liquid` | VTO widget for signed-in customers |
| `assets/immersive-store.js` | Three.js engine — world, rooms, parallax, nav, analytics, URL params, wishlist, cookie consent |
| `assets/bridge-behavior.js` | Device/connection-aware bridge behavior — runs on all pages |
| `assets/three.min.js` | Three.js local copy (CDN blocked by Shopify MIME policy) |
| `assets/immersive-theme.css` | Global immersive styles — loaded on `page.immersive` only |

---

## WebGL Architecture

### Room Structure

```
storefront → lounge → designer_houses (editorial)
                    → occasions (editorial)
                    → featured_collections (editorial)
```

### Room Configuration

- **Hardcoded defaults**: `STORE_ROOMS` object in `assets/immersive-store.js`
- **Runtime overrides**: `<script id="immersive-rooms-config" type="application/json">` rendered by `sections/immersive-canvas.liquid`
- **Merge**: `mergeDynamicRoomConfig()` merges JSON into `STORE_ROOMS` on page load

### Room Properties

Each room has:
- `baseTextureUrl` — desktop parallax base image
- `mobileBaseTextureUrl` — mobile parallax base image
- `depthMapUrl` — desktop depth map for parallax
- `mobileDepthMapUrl` — mobile depth map
- `hotspots[]` — interactive points with navigation targets

### Hotspot Behaviors

| Property | Effect |
|----------|--------|
| `targetRoom` | Navigate to another room |
| `targetCollection` | Open collection glass panel via Section Rendering API |
| `targetProduct` | Open product glass panel via Section Rendering API |
| `targetEditorialRoom` | Trigger editorial overlay for specified room |

---

## Section Rendering API Pattern

All panel content loaded via Section Rendering API (max 1 section per call):

| Action | Endpoint |
|--------|----------|
| Collection panel | `GET /collections/{handle}?section_id=glass-panel` |
| Product detail | `GET /products/{handle}?section_id=glass-product` |
| Search results | `GET /search?q={terms}&section_id=immersive-product-grid` |
| Editorial content | `GET /pages/immersive?section_id={immersive-editorial-instance-id}` |

All fetches go through `fetchWithCache(url)` — centralized, URL-keyed caching, adds `X-Requested-With: XMLHttpRequest`.

---

## URL Deep-Link Parameters

The 3D store reads these on init (priority order):

| Parameter | Handler | Effect |
|-----------|---------|--------|
| `?open_product={handle}` | `openProductPanel()` | Opens product glass panel |
| `?open_collection={handle}` | `openCollectionPanel()` | Opens collection grid panel |
| `?open_search={terms}` | `openSearchPanel()` | Opens search results panel |

---

## Bridge System (2D ↔ 3D)

### 2D → 3D Bridges

- **Snippet**: `snippets/immersive-bridge-btn.liquid`
- **Attribute**: `data-immersive-bridge`
- **Behavior**: Device/connection-aware messaging via `assets/bridge-behavior.js`
- **Deep-link params**: `/?open_collection=`, `/?open_product=`, `/?open_search=`

### 3D → 2D Switch

- **Location**: Mode switch pill in immersive store header
- **Attribute**: `data-mode-switch-2d`
- **Target**: Links back to `/`

### Preference Banner

- **Trigger**: `immersive_preferred_mode = '3d'` in localStorage
- **Location**: Injected in `layout/theme.liquid` on non-immersive/non-index/non-password pages
- **Behavior**: Non-blocking banner offering return to 3D store

---

## Overlay Components

All overlays are `role="dialog"` elements with focus trap and Escape-to-close:

| ID | Purpose | Rendered By |
|----|---------|-------------|
| `#glass-panel` | Collection/product content shell | `immersive-canvas.liquid` |
| `#immersive-wishlist-panel` | Wishlist manager (localStorage-backed) | `immersive-canvas.liquid` |
| `#immersive-editorial-overlay` | Per-room editorial content | `immersive-canvas.liquid` |
| `#immersive-onboarding` | First-visit tutorial | `immersive-canvas.liquid` |
| `#immersive-cookie-banner` | Cookie consent | `immersive-canvas.liquid` |

---

## CSS & JavaScript Conventions

### CSS

- **Scoped styles**: `{% stylesheet %}` blocks in sections/snippets
- **Global styles**: `assets/immersive-theme.css` (page.immersive only)
- **Naming**: BEM with `.immersive-*` namespace
- **Design tokens**: Dawn CSS custom properties for colors/spacing

### JavaScript

- **No build step**: Vanilla JS only
- **Section-scoped behavior**: `{% javascript %}` blocks
- **Element targeting**: `data-*` attributes, not class selectors
- **Instance scoping**: `{% javascript %}` runs once per file — use data attributes for instances

### Script Loading

```liquid
{%- if template == 'page.immersive' -%}
  <script src="{{ 'three.min.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer="defer"></script>
{%- endif -%}
<script src="{{ 'bridge-behavior.js' | asset_url }}" defer="defer"></script>
```

---

## Localization

- **Canonical file**: `locales/en.default.json`
- **All user-facing text**: Must use `| t` filter
- **JS strings**: Injected as `data-*` attributes on container elements

### Key Namespaces

- `sections.immersive_store` — immersive-canvas.liquid
- `sections.immersive.product_panel` — glass-product.liquid
- `sections.immersive.product_card` — immersive-product-card.liquid
- `sections.immersive.product_grid` — immersive-product-grid.liquid
- `sections.immersive_editorial` — immersive-editorial.liquid
- `sections.virtual_tryon` — virtual-tryon.liquid
- `sections.immersive_journey_bridges` — bridge components

---

## Performance Guidelines

- **Texture loading**: Per-room on first entry; cache last 2–3 rooms; dispose older textures
- **Parallax**: Throttle `mousemove` via `requestAnimationFrame`
- **Reduced motion**: Disable parallax/animations when `prefers-reduced-motion: reduce`
- **Pixel ratio**: Cap at 1.5 (mobile) or 2 (desktop)
- **WebGL fallback**: `showWebGLFallback()` renders static background + clickable hotspots

---

## Accessibility Requirements

- **Dialogs**: Focus trap, Escape to close, restore focus on close
- **Variant pickers**: ARIA radiogroup pattern with arrow key navigation
- **Feedback/toasts**: `role="alert"` for errors, `role="status"` for success
- **Reduced motion**: CSS/JS guards throughout
- **Heading hierarchy**: One `<h1>` per template, proper hierarchy in editorials

---

## SEO Constraints

- **Canonical URLs**: Keep Dawn defaults for products/collections
- **Immersive page**: Self-referential canonical — do not point to single product/collection
- **Internal links**: Product cards use real `<a href>` with JS interception
- **Structured data**: Leave in canonical `/products/` and `/collections/` templates only
- **Editorial content**: Must contain real, indexable text and real `<a>` links

---

## Brand Context

- **Brand**: Shahana Collection — UK-based luxury destination for authentic Pakistani designer fashion
- **Positioning**: Trusted luxury gateway, not a marketplace or discount store
- **Audience**: Pakistani diaspora in the UK, women aged 20–45
- **Buying intent**: Weddings, Eid, formal gatherings, cultural representation
- **Core values**: Authenticity, trust, convenience, curation
- **Gold accent**: `#d4af37` (Pakistani gold)
- **Aesthetic**: Editorial, immersive, high-end fashion

---

## Constraints

- Do not replace this architecture with a standard theme layout
- Do not move editorial content into Three.js — it stays in Liquid/DOM
- Do not emit duplicate meta tags or structured data from glass panels
- Do not use `?view=immersive` as a canonical URL
- Do not load WebGL scripts on the homepage (`/`)
- Do not break Section Rendering API patterns

---

## When Making Changes

1. Preserve the dual experience model (2D storefront + 3D immersive)
2. Keep WebGL assets loaded only on `page.immersive`
3. Maintain Bridge CTA system for 2D→3D navigation
4. Respect Dawn patterns and OS 2.0 conventions
5. All new user-facing text must use `| t` filter
6. Test both 2D and 3D experiences after changes
7. Verify accessibility (focus trap, ARIA, reduced motion)
8. Check performance (texture loading, parallax throttling)