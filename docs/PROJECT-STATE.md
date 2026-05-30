# Shahana Dawn Custom — Project State Document

## Last Updated: 2026-05-27

---

## 1. Repository & Branch

- **Repo:** `shahana-dawn-custom`
- **Branch:** `main`
- **Local path:** `/Users/asad/Desktop/sc-ui/dawn/shahana-dawn-custom`

---

## 2. Architecture Overview

### Entry Points

| File | Purpose |
|------|---------|
| `layout/theme.liquid` | Global shell. Loads `three.min.js`, `immersive-bundle.js`, `immersive-luxury-refinements.js` on `page.immersive` template |
| `templates/page.immersive.json` | Immersive page template — section composition |
| `assets/immersive-bundle.js` | **Main runtime engine** (concatenation of `immersive-core.js` + `immersive-features.js`) |
| `assets/immersive-core.js` | Core module: WebGL rendering, room nav, state, panels, gallery, wishlist |
| `assets/immersive-features.js` | Skeleton loaders, content transitions, editorial overlay, filters, guided mode |
| `assets/immersive-luxury-refinements.js` | Intersection observer reveals, smooth timeline |
| `assets/bridge-behavior.js` | Connection-aware 2D→3D bridge button behavior |
| `sections/immersive-canvas.liquid` | Main immersive host: canvas, rooms config JSON, hotspots, gallery config JSON, onboarding, FAB, wishlist panel |
| `sections/immersive-editorial.liquid` | Room-scoped editorial content (simplified — 2D overlay layouts removed) |
| `sections/immersive-webgl-gallery-config.liquid` | Gallery item data provider (renders hidden `<ul>` with `<li>` items + inline JS that populates `window.immersiveWebglGalleryConfigs`) |
| `sections/glass-panel.liquid` | Collection panel (loaded via Section Rendering API) |
| `sections/glass-product.liquid` | Product detail panel (loaded via Section Rendering API) |

### Build Process

`immersive-bundle.js` is created by concatenating:
```bash
cat immersive-core.js immersive-features.js > immersive-bundle.js
```

**IMPORTANT:** When editing `immersive-core.js` or `immersive-features.js`, you MUST rebuild the bundle.

---

## 3. Immersive Page Template Sections (page.immersive.json)

### Enabled Sections

| Section | Type | Purpose |
|---------|------|---------|
| `immersive_notification_bar` | `immersive-notification-bar` | Store announcements marquee |
| `immersive_canvas` | `immersive-canvas` | Main 3D canvas, rooms, hotspots, gallery config |
| `editorial_designer_houses` | `immersive-editorial` | Designer Houses editorial content |
| `editorial_occasions` | `immersive-editorial` | Occasions editorial content |
| `editorial_featured_collections` | `immersive-editorial` | Featured Collections editorial content |
| `webgl_gallery_exclusives` | `immersive-webgl-gallery-config` | Gallery items for 3D gallery cards |

### Disabled Sections

| Section | Type | Reason |
|---------|------|--------|
| `immersive_story` | `immersive-story-rail` | Not needed (editorial content in canvas) |
| `exclusive_carousel` | `immersive-exclusive-carousel` | Not needed |
| `codex_typo` | `codex-typo-index` | Not needed |
| `codex_grid` | `codex-collections-grid` | Not needed |

---

## 4. Room Configuration

### Rooms

| Room | Base Image | Mobile Image | Parallax Depth | Gallery |
|------|-----------|--------------|----------------|---------|
| `storefront` | `storefront-d-base.webp` | `storefront-m-base.webp` | Yes | No |
| `lounge` | `Lounge-Base-flow.jpg` | `lounge-m-base.jpg` | Yes | No |
| `designer_houses` | `designer-d-base.jpg` | `designer-m-base.jpg` | Yes | **Yes** (vertical scroll gallery) |
| `occasions` | Configured | Configured | Yes | No |
| `featured_collections` | Configured | Configured | Yes | No |

### Designer Houses Room

- **Hotspots:** Back to Lounge (x:50, y:90)
- **Collection Slots:** Suffuse, Soraya, Saad Bin Shahzad
- **Gallery:** 6 items (Aura, Eid Gold Mirage, Bridal Noir, Suffuse Signature, Soraya Lumene, SS5 Summer Edit)
- **Gallery Layout:** Vertical scroll (indrajaal-museum style)

---

## 5. Gallery System

### How It Works

1. `immersive-webgl-gallery-config` section renders hidden `<ul>` with `<li>` items
2. Each `<li>` has `data-gallery-index`, `data-gallery-title`, `data-gallery-subtitle`, `data-gallery-collection-handle`, and an `<img>` 
3. Inline JS in the section populates `window.immersiveWebglGalleryConfigs[roomKey]`
4. `immersive-core.js` reads this config in `loadGalleryConfigsFromDOM()`
5. On room navigation, `buildGalleryStageForRoom()` creates 3D plane meshes in the Three.js scene
6. Cards are positioned in a vertical stack with configurable spacing, height, and aspect ratio
7. Drag/wheel scrolls through cards with inertia and fade effects

### Key JS Functions

| Function | Purpose |
|----------|---------|
| `loadGalleryConfigsFromDOM()` | Reads gallery data from DOM elements and script tags |
| `getGalleryStageConfig(roomKey)` | Returns array of gallery items for a room |
| `getGalleryLayout(roomKey)` | Returns 'vertical' or 'arc' based on merchant setting |
| `buildGalleryStageForRoom(roomKey, scene, options)` | Creates 3D card meshes |
| `initGalleryCarousel(canvas)` | Sets up drag/wheel interaction |
| `animateGalleryCarousel()` | Per-frame animation (scroll, inertia, fade) |
| `disposeGalleryStage(roomKey)` | Cleans up GPU resources |

### Key Liquid Settings (immersive-canvas section)

| Setting | Default | Options |
|---------|---------|---------|
| `gallery_layout` | `vertical` | `vertical` (indrajaal style), `arc` (horizontal carousel) |

---

## 6. Critical Runtime Flows

### Page Load

1. `theme.liquid` loads `three.min.js`, `immersive-bundle.js`, `immersive-luxury-refinements.js`
2. `initImmersiveScene()` runs → creates WebGL renderer, scene, camera, shader uniforms
3. Onboarding dialog shows (if not dismissed before)
4. `loadGalleryConfigsFromDOM()` reads gallery data from DOM
5. `goToRoom('storefront', true)` renders the first room

### Room Navigation (goToRoom)

1. Fade UI layer to opacity 0
2. Load room textures (base image + depth map)
3. For non-initial loads: `showLoader()` (Three.js logo overlay fades in)
4. Crossfade shader transitions between old and new room textures
5. After transition: check `getGalleryStageConfig(roomKey).length`
6. If > 0: `buildGalleryStageForRoom()` + `initGalleryCarousel()`
7. Hide hotspot buttons (gallery cards are the interaction)
8. `hideLoader()` (logo fades out)
9. Render hotspots, update room badge, preload adjacent rooms

### Resize Handler

1. `onWindowResize()` debounced via RAF
2. `evaluateDeviceFlags()` — updates `isMobile`, `usesMobileTexture` flags
3. `handleResize()` — updates renderer size, camera aspect ratio, planeMesh scale
4. If orientation or mobile flag changed: re-render hotspots, reload textures

---

## 7. Data/State Model

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `immersive_preferred_mode` | '3d' or null — shows preference banner on 2D pages |
| `immersive_onboarding_seen` | Boolean — suppresses onboarding after first dismiss |
| `immersive_wishlist` | JSON array of product handles |
| `immersive_state` | JSON — current room, panel, product, collection |

### Merchant-Configurable Settings (Schema)

| Setting | Section | Default |
|---------|---------|---------|
| `gallery_layout` | `immersive-canvas` | `vertical` |
| `transition_style` | `immersive-canvas` | `crossfade` |
| `logo_image` | `immersive-canvas` | SC logo |
| `onboarding_enabled` | `immersive-canvas` | `true` |
| `onboarding_title` | `immersive-canvas` | "Welcome to Shahana Collection" |
| `low_stock_threshold` | `immersive-canvas` | 3 |
| `guided_featured_wing` | `immersive-canvas` | `designer_houses` |
| `fab_icon_svg` | `immersive-canvas` | Shahana "S" monogram |

---

## 8. Important Notes

### `.gitignore`

- `templates/page.immersive.json` was previously ignored (theme editor managed)
- **Now uncommented** — local edits are synced to dev server
- Make changes to this file carefully; theme editor may overwrite

### Asset References

- Room images: `shopify://shop_images/` — must exist in Shopify admin
- Gallery item images: `shopify://shop_images/` — must exist in Shopify admin
- Logo: `sc-logo-transparent-bg.png` (fallback) or `section.settings.logo_image`

### Common Issues

1. **Gallery cards not appearing:**
   - Check `webgl_gallery_exclusives` section is enabled in template
   - Check `room_key` matches the target room (e.g. "designer_houses")
   - Verify `loadGalleryConfigsFromDOM()` is reading from DOM elements
   - Check browser console for JS errors

2. **Parallax image not rendering:**
   - Verify `three.min.js` is loaded
   - Check `immersive-canvas` section has valid `base_image` settings
   - Verify WebGL context is created (check `document.getElementById('immersive-canvas')`)

3. **Resize/orientation not working:**
   - Camera aspect ratio must be updated in `handleResize()`
   - `evaluateDeviceFlags()` must re-run on resize

4. **Bundle not updating:**
   - After editing `immersive-core.js` or `immersive-features.js`, rebuild:
     ```bash
     cat immersive-core.js immersive-features.js > immersive-bundle.js
     ```

---

## 9. Recent Changes (May 2026)

1. **Gallery layout system** — Added `gallery_layout` setting (vertical/arc), `getGalleryLayout()` function, vertical scroll layout with drag/wheel/inertia
2. **Camera resize fix** — OrthographicCamera aspect ratio now updates on window resize
3. **Gallery config JSON** — Fixed comma separation in `immersive-canvas.liquid` template
4. **Header logo** — Moved from ceiling overlay (blocking hotspots) to header-center flex container between menu and search
5. **Transition logo** — `showLoader()`/`hideLoader()` now create Three.js fullscreen logo overlay with pulse animation
6. **Editorial section simplified** — Removed 2D overlay layout blocks and schema layout picker
7. **webgl_gallery_exclusives** — Enabled in template, set room_key to "designer_houses"
8. **data-gallery-layout** attribute — Added to section element for JS to read merchant's gallery layout choice
9. **Gallery config from DOM** — `loadGalleryConfigsFromDOM()` now reads from both `<script>` tags and `[data-immersive-webgl-gallery-config]` DOM elements
10. **immersive-bundle.js rebuilt** — Contains all above changes
11. **Auto-init fix (CRITICAL)** — Added `safeBindImmersiveInit()` wrapper with double-init guard and DOMContentLoaded listener. This was the critical missing piece — `initImmersiveScene()` was defined but never called on page load.

### How Scene Initialization Works

```
DOMContentLoaded → safeBindImmersiveInit() → initImmersiveScene()
  → Creates WebGL renderer, scene, camera, shader uniforms
  → Sets up resize handling, mouse move listener, animation loop
  → Loads gallery configs from DOM
  → Calls goToRoom('storefront', true) to render first room
```

The `_immersiveInitBound` guard prevents double-initialization (important for theme editor which fires section events rapidly).

**IMPORTANT:** This auto-init code must be at the END of `immersive-core.js`, AFTER all function definitions. When rebuilding the bundle, it will be near the end of the file.
