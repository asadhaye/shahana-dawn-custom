# CRITICAL AUDIT FINDINGS & USER REQUIREMENTS
**Saved:** 2026-06-15 11:02

---

## 🎯 USER'S INDRAJAAL-MUSEUM LAYOUT REQUIREMENTS

### Layout 1: The Narrative Story (Vertical Scroll Progression)
- Purpose: Cinematic sequence where camera moves through 3D space as user scrolls
- THREE.PerspectiveCamera
- Timeline (0 to 1) mapped to scrollable height
- Floating PlaneGeometry meshes with Math.sin oscillation
- ShaderMaterial for wipe/dissolve transitions between images
- Agent Prompt: "Implement a Z-axis camera movement system. Load image assets onto PlaneGeometry and space them out along the Z-axis. Map the scroll position to camera.position.z so the user 'flies' through the story images."

### Layout 2: The Codex (Infinite Interactive List)
- Purpose: High-end typography-heavy menu revealing artifacts on hover
- Orthographic/narrow FOV perspective camera
- Troika-Three-Text for entry names
- Infinite scroll recycling (modulo logic)
- Single "Floating Detail Plane" with Raycaster hover detection
- Lerp for smooth opacity/position updates
- Agent Prompt: "Create a vertical list of text meshes in Three.js. Implement an infinite scroll loop using modulo logic. Add a hover state that follows the cursor with a plane displaying a texture relevant to the hovered text."

### Layout 3: The Artifact Gallery (Floating Grid / Stage)
- Purpose: Fixed stage with multiple artifacts in structured grid/cluster
- Fixed container (.gallery-stage) with canvas background
- Each .gallery-item maps to THREE.Mesh
- Sync via getBoundingClientRect() of HTML elements
- Mouse Parallax: group.rotation.y = (mouseX - windowHalfX) * 0.0005
- Fragment Shader for glass/magnify hover effect
- Agent Prompt: "Map a CSS Grid to Three.js. For every .gallery-item in the HTML, place a Mesh at the same screen coordinates. Implement a smooth mouse-follow parallax effect on the entire group of meshes."

---

## ⚠️ CONSOLE ERROR (Critical)
When clicking "Enter Store" hotspot:
```
THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.
zr {isBufferGeometry: true, uuid: '3ea80713-8b09-4919-90f9-af8e9734e248', name: '', type: 'PlaneGeometry', index: Vn, …}

[Violation] 'requestAnimationFrame' handler took 72ms
```
**Root cause:** Likely the gallery stage is trying to create meshes with invalid dimensions or positions.

---

## 📝 USER PREFERENCES

1. **Editorial Content:** Option A - Rendered as 3D text/meshes within the gallery stage itself (if performance allows, otherwise flexible)

2. **Layout Mapping (approved):**
   - Designer Houses → **Codex** (text list with hover-reveal)
   - Occasions → **Narrative Story** (Z-axis cinematic scroll)
   - Featured Collections → **Artifact Gallery** (floating grid with parallax)
   
3. **Merchant Choice:** Must be configurable per-room in theme editor

4. **Bundle:** Individual source files for dev, minified bundle for production

---

## 🔍 AUDIT FINDINGS

### Architecture Overview
- **immersive-canvas.liquid** (4905 LOC) — main 3D host, emits room config JSON
- **immersive-core.js** (4904 LOC) — Three.js scene, textures, room transitions, hotspots, gallery stage builders
- **immersive-features.js** (4176 LOC) — product panels, editorial mode, wishlist, search
- **immersive-init.js** (1898 LOC) — initialization, module binding

### Key Data Points
- Storage keys: `immersive_preferred_mode`, `immersive_onboarding_seen`, `immersive_wishlist`, `immersive_state`, `immersive_nav_history`
- Section rendering uses `?sections=<section_id>` query param
- No separate build pipeline; bundle built via shell script

### Critical Issues Found
1. **DUPLICATE EDITORIAL SECTIONS** — 3 empty preset instances can confuse content loading
2. **MISSING InfiniteGallery CLASS** — Referenced in init.js but doesn't exist
3. **NaN GEOMETRY ERRORS** — Gallery stage creating meshes with invalid dimensions
4. **GALLERY STAGE HIDES HOTSPOTS** — Users can't navigate if gallery fails
5. **ENTER EDITORIAL MODE ROUTING** — May skip to goToRoom() if gallery config exists
6. **STALE BUNDLE** — Built June 13, missing recent changes
7. **TEST FAILURES** — 6 tests failing due to selector/attribute mismatches

### Room Structure from Data
- storefront → lounge (3 rooms: designer_houses, occasions, featured_collections)

---

## ❓ QUESTIONS BEFORE STARTING

1. Should I prioritize fixing the NaN errors and getting basic navigation working BEFORE implementing new layouts?
2. For performance concerns with 3D text: Should I implement a fallback system (3D when performant, 2D overlay when not)?
3. Do you have specific asset images ready for the Narrative Story layout, or should I use collection featured images?
4. Any preference for easing functions? (lerp is mentioned, but bezier easing could elevate the feel)

---

## 📋 EXECUTION PLAN

1. Remove duplicate editorial sections from template (DONE)
2. Fix NaN geometry errors in gallery initialization
3. Implement 3 layout classes (NarrativeStory, CodexList, ArtifactGallery)
4. Add layout picker to immersive-canvas.liquid schema
5. Wire editorial content as 3D meshes/textures
6. Rebuild bundle and fix failing tests
7. Audit 2D store UI/UX