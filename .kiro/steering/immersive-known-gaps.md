# Immersive Subsystem — Known Gaps & Technical Debt

This document tracks identified dead code, unused sections, and technical debt in the immersive subsystem. Items are prioritized for future cleanup sprints.

---

## 1. Dead JavaScript Functions

These functions are defined but never called. Safe for removal.

| Function | File | Line | Notes |
|----------|------|------|-------|
| `openGlassPanel(fetchUrl, panelId, renderCallback)` | `assets/immersive-store.js` | 1191 | Superseded by `openGlassPanelWithSection()` which uses Section Rendering API |
| `closeOverlay(overlay, triggerEl)` | `assets/immersive-store.js` | 1374 | Never called; `exitEditorialMode()` has inline deactivation logic |
| `getNormalizedHotspots(roomKey)` | `assets/immersive-store.js` | 148 | Never called; was intended for normalized hotspot handling |
| `normalizeHotspot(raw, roomKey, index)` | `assets/immersive-store.js` | 120 | Only called by unused `getNormalizedHotspots()` |

---

## 2. Dead JavaScript Globals

These variables are declared but never read or written.

| Variable | File | Line | Notes |
|----------|------|------|-------|
| `mouseMoveRafPending` | `assets/immersive-store.js` | 597 | Declared `false`, never used |
| `textureWidth` | `assets/immersive-store.js` | 215 | Declared but never read |

---

## 3. Unused Liquid Sections

**None identified.** All immersive-related sections are actively used:

| Section | Usage |
|---------|-------|
| `immersive-designer-grid.liquid` | Used by `loadTimelineCollection()` in `immersive-store.js` (line 2940) for editorial product grids |
| `immersive-product-grid.liquid` | Used for search results (`openSearchPanel()` line 1552) and collection panels |
| `glass-product-recommendations.liquid` | Used by `loadProductRecommendations()` in `immersive-store.js` (line 2829) for related products |

---

## 4. Potentially Unused Snippets

**None identified.** All immersive-related snippets are actively used:

| Snippet | Usage |
|---------|-------|
| `immersive-product-card.liquid` | Used by `immersive-designer-grid.liquid`, `immersive-product-grid.liquid`, and `glass-panel.liquid` |

---

## 5. Cleanup Checklist

When ready to address technical debt, follow this order:

### Phase 1: JavaScript Cleanup (Low Risk)
- [ ] Remove `openGlassPanel()` function (line 1191)
- [ ] Remove `closeOverlay()` function (line 1374)
- [ ] Remove `getNormalizedHotspots()` function (line 148)
- [ ] Remove `normalizeHotspot()` function (line 120)
- [ ] Remove `mouseMoveRafPending` variable (line 597)
- [ ] Remove `textureWidth` variable (line 215)
- [ ] Run full test suite after each removal

### Phase 2: Verification
- [ ] Run `npm test` to ensure no regressions
- [ ] Test immersive store manually in browser
- [ ] Test collection panel opening
- [ ] Test product panel opening
- [ ] Test editorial overlay opening

---

## 6. What Was Already Fixed

| Issue | Resolution | Date |
|-------|------------|------|
| Duplicate `enterEditorialMode()` definitions | Removed v1 (inline), kept v2 (helper-based) | 2026-04-13 |
| Duplicate `exitEditorialMode()` definitions | Removed v1 (inline), kept v2 (helper-based) | 2026-04-13 |
| Legacy `/pages/immersive-store` URL | Not found in codebase — already fixed | 2026-04-13 |
| Legacy `?view=immersive` parameter | Not found in codebase — already fixed | 2026-04-13 |
| Incorrect "unused sections" documentation | Corrected: all sections are actively used | 2026-04-13 |

---

## 7. Statistics

| Category | Count |
|----------|-------|
| Dead JS functions | 4 |
| Dead JS globals | 2 |
| Unused sections | 0 |
| Unused snippets | 0 |
| Dead CSS selectors | 0 |
| Legacy URLs remaining | 0 |
| Commented-out blocks | 0 |

---

## 8. Notes

- All items in this document were identified through static analysis and grep searches
- Functions were verified as "never called" by searching the entire codebase
- Sections were verified as "unused" by checking all JSON templates and Section Rendering API calls
- Before removing any item, run the test suite and perform manual QA