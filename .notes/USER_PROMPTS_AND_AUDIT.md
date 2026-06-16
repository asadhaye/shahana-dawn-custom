# USER PROMPTS & COMPLETE AUDIT FINDINGS
**Saved:** 2026-06-15 11:30

---

## 📌 PROMPT 1: Immersive Store Flow Fix & 3D Layouts

> We need to plan that how we can fix the immersive store flow and get the right 3D immersive layouts for our immersive 3D store. All I wanted was 3 layouts from https://www.indrajaal-museum.com/ to be mimic for our fashion immersive store use case but I have unable to get them right, first we got editorial layouts which were 2D overlays and then we have a gallerystage now, also the rooms flow appears to be broken now, we had storefront > Lounge and Lounge had 3 rooms > Designers > Occasions > Featured Collections, which I can't open now and not showing the collections now. We need to see what is currently present, and what is our requirement. It is very important to finish the theme for production within 6 - 9 hours. We also need to audit our 2D store UI and UX.

### User's Console Error (Critical):
```
shopifyChatV1Widget.js:2 THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.
zr {isBufferGeometry: true, uuid: '3ea80713-8b09-4919-90f9-af8e9734e248', name: '', type: 'PlaneGeometry', index: Vn, …}
immersive-bundle.min…44936821781331603:1 [Violation] 'requestAnimationFrame' handler took 72ms
```
**When:** Clicking "Enter Store" hotspot — does NOT navigate.

### User Preferences:
- Layout mapping approved: Designers→Codex, Occasions→Narrative Story, Featured Collections→Artifact Gallery
- Merchant must be able to choose layout per room in theme editor
- Structure must be expandable (more than 3 layouts possible)
- Editorial content: **Option A** — 3D text/meshes within gallery stage (fallback to 2D if performance issues)
- Bundle: individual source files for dev, minified bundle for production

---

## 📌 PROMPT 2: Indrajaal Museum 3 Layout Specifications

### Layout 1: The Narrative Story (Vertical Scroll Progression)
**Purpose:** Cinematic sequence where camera moves through 3D space as user scrolls.

**Setup:**
- THREE.PerspectiveCamera, Timeline (0→1) mapped to scroll height
- Place Groups at increasing Z-axis depth
- Hero section: Floating PlaneGeometry meshes with Math.sin oscillation (ethereal floating)
- Transitions: ShaderMaterial wipe/dissolve between image textures

**Agent Prompt:** "Implement a Z-axis camera movement system. Load image assets onto PlaneGeometry and space them out along the Z-axis. Map the scroll position to camera.position.z so the user 'flies' through the story images."

### Layout 2: The Codex (Infinite Interactive List)
**Purpose:** Typography-heavy menu revealing artifacts on hover.

**Setup:**
- Orthographic or narrow-FOV perspective camera
- Troika-Three-Text for entry names
- Infinite scroll recycling (modulo: mesh.position.y > threshold → move to -threshold)
- Single "Floating Detail Plane" with Raycaster hover detection
- Lerp for all position: currentY += (targetY - currentY) * 0.1

**Agent Prompt:** "Create a vertical list of text meshes in Three.js. Implement an infinite scroll loop using modulo logic. Add a hover state that follows the cursor with a plane displaying a texture relevant to the hovered text."

### Layout 3: The Artifact Gallery (Floating Grid / Stage)
**Purpose:** Fixed stage with multiple artifacts in structured grid/cluster.

**Setup:** Fixed container (.gallery-stage) with canvas background.
- Each .gallery-item → corresponding THREE.Mesh
- Sync: getBoundingClientRect() of HTML elements to position meshes
- Mouse Parallax: group.rotation.y = (mouseX - windowHalfX) * 0.0005
- Fragment Shader: glass/magnify effect on hover

**Agent Prompt:** "Map a CSS Grid to Three.js. For every .gallery-item in the HTML, place a Mesh at the same screen coordinates. Implement a smooth mouse-follow parallax effect on the entire group of meshes."

### Universal Instructions:
- Use InstancedMesh for repeating elements
- Always use lerp for smooth transitions
- Resize listener for renderer.setSize + camera.aspect
- Custom Tick() with performance.now() (no GSAP)

---

## 🔍 COMPLETE AUDIT FINDINGS

### Architecture
| File | LOC | Role |
|------|-----|------|
| `immersive-canvas.liquid` | 4905 | Main 3D host, room config JSON, FAB, overlays, gallery configs |
| `immersive-core.js` | 4904 | Three.js scene, textures, room transitions, hotspots, gallery builders |
| `immersive-features.js` | 4176 | Product/collection panels, editorial mode, wishlist, search |
| `immersive-init.js` | 1898 | Init orchestrator, module binding |
| `immersive-editorial.liquid` | ~130 | 2D HTML editorial overlay (designers/occasions/featured layouts) |
| `glass-product.liquid` | 1923 | Product detail panel |
| `glass-panel.liquid` | ~600 | Collection panel |

### Room Flow
Storefront → Lounge → Designer Houses / Occasions / Featured Collections

### Critical Issues Found
1. **DUPLICATE editorial sections** — 3 preset instances with empty collections (FIXED: removed)
2. **Missing InfiniteGallery class** — referenced in init.js but never defined anywhere
3. **NaN PlaneGeometry** — console error when clicking "Enter Store", likely from gallery stage creating meshes with invalid dimensions
4. **Gallery stage hides hotspots** — when gallery config exists, `btn.style.display = 'none'`
5. **Stale bundle** — last built June 13
6. **6 failing tests** — string mismatches in test expectations

### Key Code Locations
- `STORE_ROOMS` hardcoded config: lines ~80-200 in immersive-core.js
- Room config merge: `getRoomConfigWithLiquidOverride()` in immersive-core.js
- Gallery stage builder: `buildGalleryStageForRoom()` at line ~1118
- Scroll story builder: `_buildScrollStory()` at line ~652
- Infinite drag builder: `_buildInfiniteDragGallery()` at line ~1556
- Hotspot rendering: `renderHotspots()` at line ~4081
- Editorial mode: `enterEditorialMode()` in immersive-features.js at line ~476
- Panel system: `openCollectionPanel()` at line ~311, `openProductPanel()` at line ~121

### Applied Fixes (Session 1)
1. ✅ Removed 3 duplicate editorial sections from page.immersive.json (immersive_editorial_N7cRUa, immersive_editorial_cNd4fw, immersive_editorial_n6eTYr)
2. ✅ Added `_safePlaneGeometry()` NaN guard to immersive-core.js
3. ✅ Replaced `new THREE.PlaneGeometry()` calls with `_safePlaneGeometry()` in gallery builders
4. ✅ Fixed test expectations for `data-collection-handle` attribute
5. ✅ Added `.immersive-editorial--source[hidden]` CSS rule
6. ✅ Rebuilt bundle via build-immersive-bundle.sh

### Storage Keys
- `immersive_preferred_mode`
- `immersive_onboarding_seen`
- `immersive_wishlist`
- `immersive_state`
- `immersive_nav_history`

### Section Rendering
Uses `?sections=<section_id>` query param for on-demand HTML fetching.
