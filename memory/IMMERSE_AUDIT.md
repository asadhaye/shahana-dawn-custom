# Immersive Store Audit & User Requirements

## User's Console Error (Critical)
```
shopifyChatV1Widget.js:2 THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.
zr {isBufferGeometry: true, uuid: '3ea80713-8b09-4919-90f9-af8e9734e248', name: '', type: 'PlaneGeometry', index: Vn, …}
```
**When:** Clicking "Enter Store" hotspot does NOT navigate.

## User Requirements for 3D Layouts (indrajaal-museum inspired)

### Layout 1: Narrative Story (Vertical Scroll Progression)
- **Purpose:** Cinematic Z-axis camera movement as user scrolls
- **Setup:** PerspectiveCamera, Timeline 0-1 mapped to scroll height
- **Scene:** Planes on Z-axis with floating oscillation (Math.sin)
- **Shaders:** Wipe/dissolve transitions between textures
- **For:** Occasions room (story-driven)

### Layout 2: Codex (Infinite Interactive List)
- **Purpose:** Typography-heavy menu with hover-reveal detail plane
- **Setup:** Orthographic camera or narrow FOV perspective
- **Logic:** Infinite scroll loop with modulo recycling
- **Interaction:** Raycaster + LERP for hover state + floating detail plane
- **For:** Designer Houses room (text list)

### Layout 3: Artifact Gallery (Floating Grid/Stage)
- **Purpose:** Fixed stage with multiple artifacts in structured grid
- **Setup:** CSS Grid mapped to Three.js meshes via getBoundingClientRect()
- **Effects:** Mouse parallax on group rotation + glass shader on hover
- **For:** Featured Collections room (visual grid)

## Editorial Content Preference
**Option A:** Rendered as 3D text/meshes within gallery stage itself (not 2D overlay)

## Architecture Audit Findings

### Key Files
- `immersive-canvas.liquid` (4905 lines) — Main section, room config JSON, FAB, overlays
- `immersive-core.js` (4904 lines) — Scene init, texture loading, room transitions, gallery builders
- `immersive-features.js` (4176 lines) — Product/collection panels, editorial mode
- `immersive-init.js` (1898 lines) — Init orchestrator, binds all modules
- `immersive-editorial.liquid` — 2D HTML overlay for designer/occasion/featured content (hidden by default)

### Room Flow
Storefront → Lounge → Designer Houses / Occasions / Featured Collections
- Storefront: Has "Enter Store" hotspot → targetRoom: "lounge"
- Lounge: Has 3 hotspots → Designer Houses / Occasions / Featured Collections
- Each sub-room has gallery configs that hide hotspots and show 3D gallery

### Issues Found
1. **Duplicate editorial sections** in page.immersive.json (FIXED - removed 3 duplicates)
2. **Missing InfiniteGallery class** — referenced in init.js but never defined
3. **NaN in PlaneGeometry** — likely from undefined geometry dimensions in gallery stage
4. **Bundle stale** — last built June 13, source files have changed
5. **6 failing tests** — string mismatches + missing code

### Layout Registry (in immersive-core.js)
- `asymmetric-gallery` — for organic designer layouts
- `scroll-story` — for vertical scroll-driven narratives
- `masonry-featured` — for grid with featured highlight
- `infinite-drag-gallery` — for infinite horizontal drag
- `scroll-tunnel` — for Z-axis depth tunnel

### Next Actions
- Fix NaN geometry errors (add guards, check texture loading)
- Rebuild bundle
- Implement the 3 indrajaal-inspired layouts
- Remove dependency on missing InfiniteGallery
