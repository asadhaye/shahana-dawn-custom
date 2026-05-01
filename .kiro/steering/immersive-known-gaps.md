# Immersive Subsystem — Known Gaps & Implementation Status

This document tracks what is built, what is missing, and what technical debt remains.
For the full customer journey and architecture brief, see `context-for-shopify-dev-assistant.md`.

---

## 1. Feature Gaps (not yet implemented)

These are missing sections/snippets/logic needed to complete the customer journey.

| Piece | File | Priority | Notes |
|-------|------|----------|-------|
| Codex typo index | `sections/codex-typo-index.liquid` | High | Big-type kinetic index; blocks: `typo_entry`; scroll x-offset; hover peek image; `data-immersive-bridge` |
| Exclusives carousel | `sections/immersive-exclusive-carousel.liquid` | High | CSS 3D ring; DOM-only (no new WebGL); drag-to-rotate; click → `openProductPanel(handle)` |
| Codex page template | `templates/page.codex.json` | Low | Optional; Codex sections can be added via theme editor to a standard page |
| "Explore Codex" lounge hotspot | `STORE_ROOMS.lounge.hotspots` in `assets/immersive-store.js` | Medium | Add `{ targetCodex: true }`; ask whether it opens `/pages/codex` or a Codex section within `/pages/immersive` |
| Codex → room deduction | `assets/immersive-store.js` | Medium | Map Codex theme → room key; `CODEX_THEME_TO_ROOM` lookup; call `goToRoom(roomKey)` before `openCollectionPanel(handle)` |

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

| Item | Location | Notes |
|------|----------|-------|
| `exclusives_story` room textures | `page.immersive.json` → `immersive_canvas` settings | Upload dedicated gallery interior image to Shopify Files; replace placeholder CDN URLs in `STORE_ROOMS.exclusives_story` |
| Gallery-stage item images | `page.immersive.json` → `webgl_gallery_exclusives` blocks | All 5 blocks have no `image` field set |
| Soraya editorial image | `page.immersive.json` → `editorial_designer_houses` → `designer_soraya` block | No image or logo set |
| Saad Bin Shahzad editorial image | `page.immersive.json` → `editorial_designer_houses` → `designer_sbs` block | No image or logo set |
| Occasions room images | `page.immersive.json` → `immersive_canvas` settings | No `occasions_base_image` or `occasions_depth_map` set; falls back to hardcoded CDN URLs in `STORE_ROOMS` |
| Featured collections mobile depth map | `STORE_ROOMS.featured_collections.mobileDepthMapUrl` | Currently points to `brand.png` (a logo, not a depth map) — replace with a real depth map |

---

## 3. Dead JavaScript — Already Cleaned Up

These were removed in the May 2026 cleanup session.

| Item | Was at | Resolution |
|------|--------|------------|
| `openGlassPanel()` function | `assets/immersive-store.js` ~line 1191 | Removed — superseded by `openGlassPanelWithSection()` |
| `closeOverlay()` function | `assets/immersive-store.js` ~line 1374 | Removed — `exitEditorialMode()` handles deactivation |
| `getNormalizedHotspots()` function | `assets/immersive-store.js` ~line 148 | Removed — never called |
| `normalizeHotspot()` function | `assets/immersive-store.js` ~line 120 | Removed — only called by `getNormalizedHotspots()` |
| `mouseMoveRafPending` variable | `assets/immersive-store.js` ~line 597 | Removed — declared but never used |
| `textureWidth` variable | `assets/immersive-store.js` ~line 215 | Removed — declared but never read |
| 3 unguarded `console.log` calls | `assets/immersive-store.js` | Removed — were in `openProductPanel`, `openCollectionPanel`, `openSearchPanel` |
| FPS counter logging every second | `assets/immersive-store.js` | Gated behind `window.__IMMERSIVE_DEV__` |
| `transition_style` setting | `templates/page.immersive.json` | Removed — schema setting was orphaned |
| `assets/immersive/` module files | 6 files across `core/`, `editorial/`, `panels/` | Deleted — modular refactor was reverted; monolith is the architecture |

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
