# Launch Docs — Branch Comparison

**Branches compared:** `launch-readiness-fixes` → `main`  
**Generated:** 2026-05-01  
**Purpose:** Line-by-line documentation of every immersive-related file change between the two branches.

---

## Summary

| Category | Count |
|---|---|
| Files modified | 13 |
| Files deleted in main (present only in launch-readiness-fixes) | 30+ |
| Files added in main (not in launch-readiness-fixes) | 2 |

---

## Files Changed

### Modified (present in both branches, content differs)

| File | Doc |
|---|---|
| `assets/immersive-theme.css` | [diff](./diffs/assets-immersive-theme-css.md) |
| `assets/immersive/core/room-manager.js` | [diff](./diffs/assets-immersive-core-room-manager-js.md) |
| `assets/immersive/editorial/hero-parallax.js` | [diff](./diffs/assets-immersive-editorial-hero-parallax-js.md) |
| `assets/immersive/panels/glass-panel.js` | [diff](./diffs/assets-immersive-panels-glass-panel-js.md) |
| `assets/immersive/panels/product-panel.js` | [diff](./diffs/assets-immersive-panels-product-panel-js.md) |
| `layout/theme.liquid` | [diff](./diffs/layout-theme-liquid.md) |
| `sections/immersive-canvas.liquid` | [diff](./diffs/sections-immersive-canvas-liquid.md) |
| `sections/immersive-editorial.liquid` | [diff](./diffs/sections-immersive-editorial-liquid.md) |
| `sections/glass-product.liquid` | [diff](./diffs/sections-glass-product-liquid.md) |
| `sections/immersive-product-grid.liquid` | [diff](./diffs/sections-immersive-product-grid-liquid.md) |
| `snippets/immersive-product-card.liquid` | [diff](./diffs/snippets-immersive-product-card-liquid.md) |
| `snippets/immersive-bridge-btn.liquid` | [diff](./diffs/snippets-immersive-bridge-btn-liquid.md) |
| `templates/page.immersive.json` | [diff](./diffs/templates-page-immersive-json.md) |

### Deleted in main (only in launch-readiness-fixes)

These files existed in `launch-readiness-fixes` but were removed before merging to `main`. See [deleted-files.md](./deleted-files.md).

### Added in main (not in launch-readiness-fixes)

| File | Notes |
|---|---|
| `tests/wishlist-panel.test.js` | New test added in main |
| `snippets/quick-order-product-row.liquid` | New snippet added in main |

---

## Key Themes

1. **Script loading simplified** — `launch-readiness-fixes` loaded 20+ modular JS files individually; `main` reverts to loading only `immersive-store.js` (the monolith).
2. **Room textures hardcoded** — `main` has real CDN URLs for all 5 rooms; `launch-readiness-fixes` had `null` placeholders expecting merchant configuration.
3. **Cart flow fixed** — Buy Now in `main` opens Dawn's cart drawer; `launch-readiness-fixes` navigated to a custom `/pages/immersive-cart` page (which was deleted).
4. **Search bar repositioned** — Moved from center header to right header group.
5. **Back button removed** — Navigation history back button removed from immersive header.
6. **Cookie banner removed** — Cookie consent banner HTML and CSS removed from `immersive-canvas.liquid` and `immersive-theme.css`.
7. **Auto-dismiss banner removed** — Preference banner auto-dismiss timer and `data-dismiss-timeout` setting removed.
8. **CSS cleaned up** — Feedback toast styles and editorial overlay styles removed from `immersive-theme.css` (moved to section-scoped stylesheets).
9. **Atmosphere/mood system removed** — `ImmersiveAtmosphere` calls and `mood` properties removed from room config.
10. **Transition style setting removed** — `transition_style` schema setting removed from `immersive-canvas`.
