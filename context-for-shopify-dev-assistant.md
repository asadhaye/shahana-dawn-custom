# Shahana Collection — Shopify Theme Context

A Dawn-based Shopify OS 2.0 theme implementing a WebGL-powered "Immersive Store" experience for a UK-based Pakistani luxury fashion brand.

---

## Implementation Status

This section is the authoritative punch-list of what is built vs what remains. Check here before starting any new feature.

### ✅ Implemented — treat as stable foundations

**Core WebGL engine**
- Room graph: `storefront → lounge → designer_houses / occasions / featured_collections`
- `exclusives_story` room exists in `STORE_ROOMS` (placeholder textures — falls back to `featured_collections` look until real assets uploaded)
- `goToRoom(roomKey)` drives texture loading, hotspots, and uniforms
- `ROOM_VISUAL_PROFILES` including `featured_collections:story` and `exclusives_story:gallery_stage`
- `_applyRoomVisualProfile(roomKey, mode, dt)` lerps uniforms each frame

**Story path**
- `targetStory: true` hotspot in lounge → `goToRoom('featured_collections')` + `focusStoryRailSection()` + `currentRoomSubMode = 'story'`
- `sections/immersive-story-rail.liquid` — hero + stacked chapters, emits `immersive:story-mode-change`
- `immersive-store.js` listens and toggles `currentRoomSubMode` when `currentRoomKey === 'featured_collections'`

**Gallery-stage system**
- `sections/immersive-webgl-gallery-config.liquid` — headless data provider per room
- `buildGalleryStageForRoom(roomKey, scene, options)` — curved arc of planes, drag-to-orbit, click-to-open
- `openProductPanel` / `openCollectionPanel` wired to plane clicks via raycaster

**Panels, overlays, FAB, search, wishlist**
- Glass product panel, collection grid, editorial overlays, wishlist panel, FAB, bottom nav, search — all working
- Use `openProductPanel(handle)`, `openCollectionPanel(handle)`, `enterEditorialMode(roomKey)` — do not invent new panel systems

**Codex surfaces (2D)**
- `sections/codex-collections-grid.liquid` — collection grid with theme filter pills
- `snippets/codex-collection-card.liquid` — card with `data-immersive-bridge`, `data-gallery-*`, bridge link

**Bridge system**
- `snippets/immersive-bridge-btn.liquid`, `assets/bridge-behavior.js`
- All 2D→3D bridges on collection/product/search/cart pages

---

### ❌ Not yet implemented — next steps

| Piece | File | Notes |
|-------|------|-------|
| Codex typo index | `sections/codex-typo-index.liquid` | Big-type kinetic index; blocks: `typo_entry` (collection, label, designer, theme, sub_label, image); scroll x-offset; hover peek image; `data-immersive-bridge` deep-link |
| Exclusives carousel | `sections/immersive-exclusive-carousel.liquid` | CSS 3D ring of exclusive products; DOM-only (no new WebGL); drag-to-rotate; click → `openProductPanel(handle)` |
| Codex page template | `templates/page.codex.json` | Optional; currently Codex sections are added via theme editor to a standard page |
| "Explore Codex" lounge hotspot | `STORE_ROOMS.lounge.hotspots` | Add `{ targetCodex: true }` + handler; ask whether it should open `/pages/codex` or a Codex section within `/pages/immersive` before wiring |
| Codex → room deduction | `assets/immersive-store.js` | Map Codex entry theme to room key (e.g. `'Eid' → 'occasions'`, `'Bridal' → 'designer_houses'`); read `data-codex-theme` from cards or use a `CODEX_THEME_TO_ROOM` lookup; call `goToRoom(roomKey)` before `openCollectionPanel(handle)` |
| `exclusives_story` real textures | `page.immersive.json` / Shopify Files | Upload dedicated gallery interior image; replace placeholder CDN URLs in `STORE_ROOMS.exclusives_story` |
| Gallery items with images | `page.immersive.json` | `webgl_gallery_exclusives` blocks have no `image` field set — content authoring task |
| Soraya / SBS editorial images | `page.immersive.json` | Only Suffuse has images; Soraya and Saad Bin Shahzad blocks need images added in theme editor |

---

### Suggested implementation order

1. **`codex-typo-index.liquid`** — high visual impact, pure DOM, uses existing bridge system
2. **`immersive-exclusive-carousel.liquid`** — completes the featured_collections / exclusives_story wing
3. **"Explore Codex" lounge hotspot** — small code change, makes Codex discoverable in 3D
4. **Codex → room deduction logic** — smooth UX when entering from Codex deep-links; confirm theme→room mapping before implementing
5. **Content pass** — upload real textures, gallery images, Soraya/SBS editorial images (non-code)

---

### Rules when implementing missing pieces

- `codex-typo-index`: use `data-immersive-bridge` on every row; no WebGL in this section
- `immersive-exclusive-carousel`: DOM-only CSS 3D; call `openProductPanel(handle)` for immersive integration; no new canvas
- Codex hotspot: add `targetCodex: true` to `STORE_ROOMS.lounge.hotspots`; handle in the hotspot click block in `renderHotspots()`
- Room deduction: use a `CODEX_THEME_TO_ROOM` map; read theme from `data-codex-theme` on the card element; fall back to `lounge` if no match
- Content: schema and rendering paths already support it — no structural changes needed when images arrive

---

### Dual Experience Model

| Layer | URL | Template | Purpose |
|-------|-----|----------|---------|
| **2D Storefront** | `/` | `templates/index.json` | SEO landing page, standard Dawn layout, Bridge CTAs to 3D |
| **3D Immersive** | `/pages/immersive` | `templates/page.immersive.json` | WebGL showroom, room navigation, editorial overlays |
| **Codex** | `/pages/codex` (or `/`) | Standard page | 2D editorial index — collection grid + typo index |

The 2D storefront is the primary SEO surface. The 3D experience is a progressive enhancement accessed via Bridge CTAs.

---

## Customer Journey

Understanding the full shopper flow is essential before making any change.

### Step 1 — Entering: storefront → lounge

The shopper hits `/pages/immersive`. The WebGL engine initialises the `storefront` room (dark, cinematic, depth-parallax). A single hotspot ("Enter Shahana" or similar) calls `goToRoom('lounge')`. The lounge is the **hub** — the lobby of the immersive store.

### Step 2 — The Lounge: three paths

In the lounge the shopper sees hotspots for three wings:

| Hotspot | Target | What happens |
|---------|--------|--------------|
| "The Shahana Story" | `targetStory: true` | `goToRoom('featured_collections')` + scroll to story rail + `currentRoomSubMode = 'story'` |
| "Explore Codex" | `targetRoom: 'lounge'` or bridge link | Navigates to Codex page (2D) |
| Shopping wings | `targetRoom: 'designer_houses'` / `'occasions'` / `'featured_collections'` | Direct room switch |

### Step 3 — Story path (featured_collections + story submode)

Clicking the Story hotspot:
1. `goToRoom('featured_collections')` — WebGL switches to featured_collections textures
2. `currentRoomSubMode = 'story'` — shader starts lerping to `featured_collections:story` profile
3. `focusStoryRailSection()` — smooth-scrolls to `sections/immersive-story-rail.liquid`

While the story rail is in the viewport:
- The section's `IntersectionObserver` fires `immersive:story-mode-change { detail: { active: true } }`
- `immersive-store.js` sets `currentRoomSubMode = 'story'`
- Uniforms lerp to `featured_collections:story`: warmer gold tint, deeper vignette, higher chroma

When the shopper scrolls past the story:
- Observer fires `{ active: false }` → `currentRoomSubMode = null` → uniforms ease back to normal `featured_collections`

After the story, the layout flows into the **Exclusives carousel** (`sections/immersive-exclusive-carousel.liquid`) — a CSS 3D ring of exclusive products that opens glass product panels. Story + Exclusives together form the "Exclusive Wing".

### Step 4 — Codex path (2D index → immersive rooms)

From `/pages/codex` (or `/`), the shopper sees:

**Codex Collections Grid** (`sections/codex-collections-grid.liquid`):
- Editorial grid of collection cards rendered by `snippets/codex-collection-card.liquid`
- Filter pills by theme (Eid, Bridal, Heritage, etc.)
- Each card: `href="/pages/immersive?open_collection={handle}"`, `data-immersive-bridge`

**Codex Typo Index** (`sections/codex-typo-index.liquid`):
- Big-type rows: "Suffuse by Sana Yasir", "Maria B Eid 24", etc.
- Scroll-based horizontal offset; hover peek image on desktop
- Each row: `data-immersive-bridge` link to `/pages/immersive?open_collection={handle}`

When the shopper clicks any Codex entry:
1. Navigates to `/pages/immersive?open_collection={handle}`
2. Immersive JS reads `open_collection` from URL
3. Deduces the correct room (e.g. Bridal → `designer_houses`, Eid → `occasions`)
4. Calls `goToRoom(roomKey)` then `openCollectionPanel(handle)`

### Step 5 — Gallery-stage path (3D curved wall)

Within `featured_collections` (and optionally other rooms), the shopper encounters a WebGL gallery-stage:
- A curved arc of image planes built by `buildGalleryStageForRoom(roomKey, scene, options)`
- Data comes from `sections/immersive-webgl-gallery-config.liquid` → `window.immersiveWebglGalleryConfigs[roomKey]`
- Drag to orbit; click a plane → `openProductPanel(handle)` or `openCollectionPanel(handle)`

---

## Room Map

```
storefront → lounge → designer_houses  (editorial: designer houses)
                    → occasions        (editorial: occasions)
                    → featured_collections → [story submode] → story rail + exclusives carousel
                                           → [gallery_stage submode] → WebGL gallery wall
```

**Room keys in `STORE_ROOMS`:**
- `storefront`, `lounge`, `designer_houses`, `occasions`, `featured_collections`
- `exclusives_story` — gallery-stage room hanging off `featured_collections` (placeholder textures until real assets uploaded)

**Do not invent new room keys** without explicitly adding them to `STORE_ROOMS` and wiring a hotspot to reach them.

---

## Surfaces (Sections & Snippets)

| Surface | File | Associated Room | Notes |
|---------|------|-----------------|-------|
| WebGL canvas + overlays | `sections/immersive-canvas.liquid` | All rooms | Renders `<canvas>`, glass-panel shell, wishlist, editorial overlay, onboarding, FAB |
| Story rail | `sections/immersive-story-rail.liquid` | `featured_collections` | Scrollytelling editorial; emits `immersive:story-mode-change` |
| Gallery-stage config | `sections/immersive-webgl-gallery-config.liquid` | Any room | Headless data provider; populates `window.immersiveWebglGalleryConfigs` |
| Exclusives carousel | `sections/immersive-exclusive-carousel.liquid` | `featured_collections` | CSS 3D ring of exclusive products |
| Codex grid | `sections/codex-collections-grid.liquid` | 2D (Codex page) | Collection grid with theme filters |
| Codex typo index | `sections/codex-typo-index.liquid` | 2D (Codex page) | Big-type editorial index |
| Codex card | `snippets/codex-collection-card.liquid` | 2D → 3D bridge | `data-collection-handle`, `data-immersive-bridge`, `data-gallery-*` |
| Editorial overlay | `sections/immersive-editorial.liquid` | `designer_houses` / `occasions` / `featured_collections` | Per-room editorial content |
| Glass panel | `sections/glass-panel.liquid` | All rooms | Dialog shell for Section Rendering responses |
| Product detail | `sections/glass-product.liquid` | All rooms | Rendered into glass-panel |
| Collection grid | `sections/immersive-product-grid.liquid` | All rooms | Rendered into glass-panel |

---

## Hotspot Properties

| Property | Effect |
|----------|--------|
| `targetRoom` | `goToRoom(key)` — navigate to another room |
| `targetCollection` | `openCollectionPanel(handle)` — open collection glass panel |
| `targetProduct` | `openProductPanel(handle)` — open product glass panel |
| `targetEditorialRoom` | `enterEditorialMode(roomKey)` — trigger editorial overlay |
| `targetStory: true` | `goToRoom('featured_collections')` + `focusStoryRailSection()` + `currentRoomSubMode = 'story'` |

---

## Room Visual Profiles (Shader Uniforms)

Defined in `ROOM_VISUAL_PROFILES` in `assets/immersive-store.js`. Applied each frame by `_applyRoomVisualProfile(currentRoomKey, currentRoomSubMode, dt)`.

| Key | When active | Effect |
|-----|-------------|--------|
| `default` | Fallback | Neutral |
| `storefront` | In storefront room | Subtle warmth |
| `lounge` | In lounge | Soft warmth |
| `designer_houses` | In designer houses | Slightly richer |
| `occasions` | In occasions | Warm |
| `featured_collections` | In featured collections | Richer warmth |
| `featured_collections:story` | Story rail in viewport | Deep gold tint, strong vignette + chroma |
| `exclusives_story` | In exclusives_story room | Cinematic |
| `exclusives_story:gallery_stage` | Gallery-stage active | Maximum cinematic |

To change the "vibe" of a room, add or edit a profile entry — do not add new shaders.

---

## Story Mode Event Contract

The story rail section and the engine communicate via a custom event:

```javascript
// Emitted by sections/immersive-story-rail.liquid ({% javascript %} block)
// when the section enters/leaves the viewport (IntersectionObserver, threshold: 0.4)
window.dispatchEvent(new CustomEvent('immersive:story-mode-change', {
  detail: { active: true | false },
  bubbles: false,
}));

// Consumed by assets/immersive-store.js
window.addEventListener('immersive:story-mode-change', function (event) {
  if (currentRoomKey === 'featured_collections') {
    currentRoomSubMode = event.detail.active ? 'story' : null;
  }
});
```

The event is **ignored** if `currentRoomKey !== 'featured_collections'` — safe to fire from any page.

---

## Gallery-Stage Contract

```javascript
// 1. sections/immersive-webgl-gallery-config.liquid populates:
window.immersiveWebglGalleryConfigs[roomKey] = [
  { index, title, subtitle, imageSrc, imageWidth, imageHeight, productHandle, collectionHandle }
];

// 2. On room entry, immersive-store.js calls:
_notifyGalleryConfigForRoom(roomKey);
// → if items exist: buildGalleryStageForRoom(roomKey, scene, options)
// → currentRoomSubMode = 'gallery_stage'

// 3. Click on a plane:
// → openProductPanel(handle) or openCollectionPanel(handle)
```

---

## Bridge System (2D ↔ 3D)

### Rules — never break these

- All 2D→3D links must be real `<a href>` elements — no JS-only navigation
- Use `data-immersive-bridge` on every bridge link so `bridge-behavior.js` can enhance messaging
- Deep-link format: `/pages/immersive?open_collection={handle}` or `?open_product={handle}`
- Never use `?view=immersive` or `/pages/immersive-store`

### Codex card bridge pattern

```liquid
<a
  href="/pages/immersive?open_collection={{ collection.handle | url_encode }}"
  data-collection-handle="{{ collection.handle | escape }}"
  data-immersive-bridge
  data-gallery-source="codex"
  data-gallery-title="{{ collection.title | escape }}"
  data-gallery-image-src="{{ collection.featured_image | image_url: width: 1200 }}"
>
```

The `data-gallery-*` attributes allow the immersive engine to optionally build a Codex gallery-stage wall from these cards.

---

## Section Rendering API Pattern

| Action | Endpoint |
|--------|----------|
| Collection panel | `GET /collections/{handle}?section_id=glass-panel` |
| Product detail | `GET /products/{handle}?section_id=glass-product` |
| Search results | `GET /search?q={terms}&section_id=immersive-product-grid` |
| Editorial content | `GET /pages/immersive?section_id={immersive-editorial-instance-id}` |

All fetches go through `fetchWithCache(url)` — centralised, URL-keyed caching, adds `X-Requested-With: XMLHttpRequest`.

---

## URL Deep-Link Parameters

| Parameter | Handler | Effect |
|-----------|---------|--------|
| `?open_product={handle}` | `openProductPanel()` | Opens product glass panel |
| `?open_collection={handle}` | `openCollectionPanel()` | Opens collection grid panel |
| `?open_search={terms}` | `openSearchPanel()` | Opens search results panel |

Priority: `open_product` > `open_collection` > `open_search`.

---

## Core Files — Do Not Modify Without Explicit Instruction

| File | Role |
|------|------|
| `layout/theme.liquid` | Conditional asset loading (WebGL on `page.immersive` only), header/footer gating, preference banner |
| `sections/immersive-canvas.liquid` | Canvas + UI layer + fixed header + overlay shells + rooms config JSON |
| `sections/glass-panel.liquid` | Dialog shell for Section Rendering responses; owns ARIA + focus trap |
| `sections/glass-product.liquid` | Product detail view rendered into glass-panel |
| `sections/immersive-product-grid.liquid` | Collection grid rendered into glass-panel |
| `sections/immersive-editorial.liquid` | Per-room editorial content |
| `sections/immersive-story-rail.liquid` | Scrollytelling story rail; emits `immersive:story-mode-change` |
| `sections/immersive-webgl-gallery-config.liquid` | Headless gallery-stage data provider |
| `sections/codex-collections-grid.liquid` | Codex collection grid with theme filters |
| `sections/codex-typo-index.liquid` | Codex big-type editorial index |
| `snippets/immersive-bridge-btn.liquid` | Shared 2D→3D bridge pill CTA |
| `snippets/immersive-product-card.liquid` | Self-contained product card |
| `snippets/codex-collection-card.liquid` | Codex card with `data-gallery-*` and bridge link |
| `assets/immersive-store.js` | Three.js engine — monolith; all WebGL, rooms, panels, wishlist, story, gallery-stage |
| `assets/bridge-behavior.js` | Device/connection-aware bridge behavior — runs on all pages |
| `assets/three.min.js` | Three.js local copy (CDN blocked by Shopify MIME policy) |
| `assets/immersive-theme.css` | Global immersive styles — loaded on `page.immersive` only |

---

## JavaScript Architecture — Monolith

`assets/immersive-store.js` is a **single monolith**. There are no module files in `assets/immersive/`. The modular split was attempted and reverted. Do not re-introduce module files.

Key functions:

| Function | Purpose |
|----------|---------|
| `goToRoom(roomKey, initial)` | Switch WebGL room |
| `focusStoryRailSection()` | Smooth-scroll to story rail |
| `openProductPanel(handle, collectionHandle)` | Open product glass panel |
| `openCollectionPanel(handle)` | Open collection glass panel |
| `openSearchPanel(query)` | Open search results panel |
| `enterEditorialMode(roomKey, triggerEl)` | Open editorial overlay |
| `exitEditorialMode()` | Close editorial overlay |
| `buildGalleryStageForRoom(roomKey, scene, options)` | Build WebGL gallery arc |
| `_applyRoomVisualProfile(roomKey, mode, dt)` | Lerp shader uniforms per frame |
| `addToWishlist(handle, title, image)` | Add to localStorage wishlist |
| `initWishlist()` | Load persisted wishlist on init |
| `fetchWithCache(url)` | Centralised fetch with URL cache |
| `safeBindImmersiveInit()` | Entry point; guards double-init |

---

## CSS & JavaScript Conventions

- **No build step** — vanilla JS only, no bundler
- **Scoped styles** — `{% stylesheet %}` blocks in sections/snippets
- **Global styles** — `assets/immersive-theme.css` (page.immersive only)
- **BEM naming** — `.immersive-*`, `.glass-product-section__*`, `.codex-*`
- **Element targeting** — `data-*` attributes, not class selectors
- **`{% javascript %}` blocks** — run once per file; use data attributes for instance scoping

---

## Localization

All user-facing text uses `| t`. Key namespaces:

- `sections.immersive_store` — immersive-canvas.liquid
- `sections.immersive.product_panel` — glass-product.liquid
- `sections.immersive.product_card` — immersive-product-card.liquid
- `sections.immersive.product_grid` — immersive-product-grid.liquid
- `sections.immersive_editorial` — immersive-editorial.liquid
- `sections.immersive_story` — immersive-story-rail.liquid
- `sections.immersive_webgl_gallery` — immersive-webgl-gallery-config.liquid
- `sections.codex_collections_hub` — codex-collections-grid.liquid
- `sections.virtual_tryon` — virtual-tryon.liquid
- `sections.immersive_journey_bridges` — bridge components

---

## Performance Guidelines

- Texture loading: per-room on first entry; cache last 2–3 rooms; dispose older textures
- Parallax: throttle `mousemove` via `requestAnimationFrame`
- Reduced motion: disable parallax/animations when `prefers-reduced-motion: reduce`
- Pixel ratio: cap at 1.5 (mobile) or 2 (desktop)
- WebGL fallback: `showWebGLFallback()` renders static background + clickable hotspots
- DOM queries in hot paths (animate loop): cache references, do not call `getElementById` every frame

---

## Accessibility Requirements

- Dialogs: focus trap, Escape to close, restore focus on close
- Variant pickers: ARIA radiogroup pattern with arrow key navigation
- Feedback/toasts: `role="alert"` for errors, `role="status"` for success
- Reduced motion: CSS/JS guards throughout
- Heading hierarchy: one `<h1>` per template, proper hierarchy in editorials
- Bridge links: real `<a href>` elements with descriptive `aria-label`

---

## SEO Constraints

- Canonical URLs: keep Dawn defaults for products/collections
- Immersive page: self-referential canonical — do not point to single product/collection
- Internal links: product cards use real `<a href>` with JS interception
- Structured data: leave in canonical `/products/` and `/collections/` templates only
- Editorial content: must contain real, indexable text and real `<a>` links

---

## Brand Context

- **Brand**: Shahana Collection — UK-based luxury destination for authentic Pakistani designer fashion
- **Positioning**: Trusted luxury gateway, not a marketplace or discount store
- **Audience**: Pakistani diaspora in the UK, women aged 20–45
- **Buying intent**: Weddings, Eid, formal gatherings, cultural representation
- **Gold accent**: `#d4af37` (Pakistani gold)
- **Aesthetic**: Editorial, immersive, high-end fashion

---

## Decision Rules for New Features

Before implementing anything new, answer these questions:

**Which room does this belong to?**
- Narrative/editorial content → `featured_collections` (story submode)
- Designer-specific content → `designer_houses`
- Occasion-specific content → `occasions`
- Gallery/exclusives → `featured_collections` or `exclusives_story`
- Hub/navigation → `lounge`

**Does it need WebGL integration?**
- If yes: expose data via `data-gallery-*` attributes or a headless config section; let the engine read it
- If no: pure DOM/CSS section is fine

**How does it link into the immersive store?**
- Always: real `<a href="/pages/immersive?open_*=...">` + `data-immersive-bridge`
- Never: JS-only navigation, `?view=immersive`, `/pages/immersive-store`

**Does it change the shader mood?**
- If yes: add a profile to `ROOM_VISUAL_PROFILES` and set `currentRoomSubMode`
- Never: add a new shader or new uniform without discussion

---

## Constraints

- Do not replace this architecture with a standard theme layout
- Do not move editorial content into Three.js — it stays in Liquid/DOM
- Do not emit duplicate meta tags or structured data from glass panels
- Do not use `?view=immersive` as a canonical URL
- Do not load WebGL scripts on the homepage (`/`)
- Do not break Section Rendering API patterns
- Do not re-introduce `assets/immersive/` module files — the monolith is the architecture
- Do not add new room keys to `STORE_ROOMS` without also adding a hotspot to reach them

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
9. Run `npm test` after any JS change
