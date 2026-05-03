# Immersive Subsystem — Known Gaps & Implementation Status

This document tracks what is built, what is missing, and what technical debt remains.
For the full customer journey and architecture brief, see `context-for-shopify-dev-assistant.md`.

---

## 1. Feature Gaps (not yet implemented)

These are missing sections/snippets/logic needed to complete the customer journey.

| Piece | File | Priority | Status | Notes |
|-------|------|----------|--------|-------|
| Codex → room deduction | `assets/immersive-store.js` | Medium | ❌ Missing | Map Codex theme → room key; `CODEX_THEME_TO_ROOM` lookup; call `goToRoom(roomKey)` before `openCollectionPanel(handle)` |

### Implemented Features (Previously Listed as Gaps)

| Piece | File | Status | Notes |
|-------|------|--------|-------|
| Codex typo index | `sections/codex-typo-index.liquid` | ✅ Implemented | In `page.immersive.json` as `codex_typo` section; 3 entries configured |
| Codex collections grid | `sections/codex-collections-grid.liquid` | ✅ Implemented | In `page.immersive.json` as `codex_grid` section; 5 entries with filtering |
| Exclusives carousel | `sections/immersive-exclusive-carousel.liquid` | ✅ Implemented | CSS 3D ring carousel (DOM-only); configured with `el-veneto-luxury-formals` collection |
| Story rail | `sections/immersive-story-rail.liquid` | ✅ Implemented | In `page.immersive.json` as `immersive_story` section; 4 blocks configured |
| WebGL Gallery config | `sections/immersive-webgl-gallery-config.liquid` | ✅ Implemented | Headless data provider for WebGL gallery stage; 5 items configured but missing images |

### Gallery/Exclusives Clarification

**The gallery is NOT a 3D room with background textures.** It consists of two separate implementations:

1. **Exclusive Carousel** (`immersive-exclusive-carousel.liquid`):
   - CSS 3D ring of product cards that rotates on drag
   - Pulls products from a collection (currently `el-veneto-luxury-formals`)
   - On mobile: flattens to horizontal scroll
   - No 3D room or background textures needed

2. **WebGL Gallery Stage** (`immersive-webgl-gallery-config.liquid`):
   - Headless section that exposes gallery item data via `window.immersiveWebglGalleryConfigs`
   - `immersive-store.js` reads this data to render images in a WebGL gallery
   - Configured for `exclusives_story` room (which doesn't exist yet)
   - 5 items configured but no images uploaded

**If you want a gallery 3D room:** You would need to add `exclusives_story` to `STORE_ROOMS` with background textures (base + depth map) like other rooms. The WebGL gallery config would then overlay images on top of that room's background.

### Suggested theme→room mapping (when implementing deduction logic)

```javascript
var CODEX_THEME_TO_ROOM = {
  'Eid': 'occasions',
  'Bridal': 'designer_houses',
  'Heritage': 'designer_houses',
  'Formals': 'occasions',
  'Everyday': 'featured_collections',
};
// Fallback: 'lounge'
```

Read theme from `data-codex-theme` attribute on the Codex card element, or from a metafield/tag on the collection.

---

## 2. Content Gaps (authoring tasks, not code)

These require uploading images or configuring settings in the theme editor — no code changes needed.

| Item | Location | Status | Notes |
|------|----------|--------|-------|
| WebGL Gallery item images | `page.immersive.json` → `webgl_gallery_exclusives` blocks | ❌ Missing | All 5 blocks have no `image` field set; these would be displayed in a WebGL gallery stage if `exclusives_story` room existed |
| Soraya editorial image | `page.immersive.json` → `editorial_designer_houses` → `designer_soraya` block | ❌ Missing | No image or logo set |
| Saad Bin Shahzad editorial image | `page.immersive.json` → `editorial_designer_houses` → `designer_sbs` block | ❌ Missing | No image or logo set |
| Occasions room images | `page.immersive.json` → `immersive_canvas` settings | ⚠️ Partial | No `occasions_base_image` or `occasions_depth_map` set; falls back to hardcoded CDN URLs in `STORE_ROOMS` |
| Featured collections mobile depth map | `STORE_ROOMS.featured_collections.mobileDepthMapUrl` | ⚠️ Wrong | Currently points to `brand.png` (a logo, not a depth map) — replace with a real depth map |
| Codex typo index collections | `page.immersive.json` → `codex_typo` blocks | ❌ Missing | All 3 entries have empty `collection` field |

---

## 3. Dead Code — Already Cleaned Up

These were removed in cleanup sessions (May 2026 and later).

| Item | Was at | When Removed | Resolution |
|------|--------|--------------|------------|
| `sections/codex.liquid` | Legacy decorative 3D book section | May 2026 | Deleted — was a decorative Three.js rotating book visualization; replaced by functional `codex-typo-index.liquid` and `codex-collections-grid.liquid` sections |
| `openGlassPanel()` function | `assets/immersive-store.js` ~line 1191 | May 2026 | Removed — superseded by `openGlassPanelWithSection()` |
| `closeOverlay()` function | `assets/immersive-store.js` ~line 1374 | May 2026 | Removed — `exitEditorialMode()` handles deactivation |
| `getNormalizedHotspots()` function | `assets/immersive-store.js` ~line 148 | May 2026 | Removed — never called |
| `normalizeHotspot()` function | `assets/immersive-store.js` ~line 120 | May 2026 | Removed — only called by `getNormalizedHotspots()` |
| `mouseMoveRafPending` variable | `assets/immersive-store.js` ~line 597 | May 2026 | Removed — declared but never used |
| `textureWidth` variable | `assets/immersive-store.js` ~line 215 | May 2026 | Removed — declared but never read |
| 3 unguarded `console.log` calls | `assets/immersive-store.js` | May 2026 | Removed — were in `openProductPanel`, `openCollectionPanel`, `openSearchPanel` |
| FPS counter logging every second | `assets/immersive-store.js` | May 2026 | Gated behind `window.__IMMERSIVE_DEV__` |
| `transition_style` setting | `templates/page.immersive.json` | May 2026 | Removed — schema setting was orphaned |
| `assets/immersive/` module files | 6 files across `core/`, `editorial/`, `panels/` | May 2026 | Deleted — modular refactor was reverted; monolith is the architecture |

---

## 4. URL / Legacy Bugs — Already Fixed

| Issue | Resolution |
|-------|------------|
| Preference banner linked to `/pages/immersive-store` | Fixed — now uses `/pages/immersive` |
| Bridge CTAs used `?view=immersive` | Fixed — removed |
| FAB 2D button didn't call `clearImmersivePreference()` | Fixed — now calls it directly |
| Designer houses CDN URLs had malformed query strings (`=85` instead of `&quality=85`) | Fixed |
| `featured_collections` mobile base used `picsum.photos` placeholder | Fixed — now uses real CDN URL at mobile width |

---

## 5. Test Suite Status

| Suite | Status | Notes |
|-------|--------|-------|
| `tests/glass-panel.property.test.js` | ✅ 33 tests pass | Property 11 updated to assert `#d4af37` solid gold |
| `tests/hero-parallax.test.js` | ✅ Rewritten | Static analysis against monolith; no longer requires deleted module file |
| `tests/room-manager.test.js` | ✅ Rewritten | Static analysis + pure simulation; no longer requires deleted module file |
| `tests/wishlist-panel.test.js` | ✅ Rewritten | Static analysis against monolith |
| `tests/theme-editor-reinit.test.js` | ✅ Rewritten | Module directory emptiness check replaces deleted-file load |
| `tests/module-api.test.js` | ✅ Rewritten | All function presence checks against monolith |
| All other suites | ✅ Pass | 535 tests, 33 suites, 0 failures |

---

## 6. Architecture Decisions (do not reverse)

- **Monolith**: `assets/immersive-store.js` is a single file. The modular split (`assets/immersive/`) was attempted and reverted. Do not re-introduce module files.
- **No new shaders**: To change room mood, add a profile to `ROOM_VISUAL_PROFILES` and set `currentRoomSubMode`. Do not add new shader programs.
- **DOM-first content**: All editorial content stays in Liquid/DOM. Three.js handles background, depth, and motion only.
- **Bridge links are sacred**: All 2D→3D links must be real `<a href>` elements with `data-immersive-bridge`. No JS-only navigation.
- **Room keys are canonical**: Do not invent new room keys without adding them to `STORE_ROOMS` and wiring a hotspot to reach them.
- **Codex is 2D sections within immersive page**: The Codex is implemented as `codex-typo-index.liquid` and `codex-collections-grid.liquid` sections that live on `/pages/immersive`. They are NOT a separate 3D room. The legacy `sections/codex.liquid` (decorative 3D book) was deleted.
