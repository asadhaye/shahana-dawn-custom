# 🔍 COMPLETE AUDIT FINDINGS & USER PROMPTS
*Saved: 2026-06-15*

---

## 📌 USER'S INDRAJAAL-MUSEUM LAYOUT REQUIREMENTS (3 Layout Prompts)

### Layout 1: The Narrative Story (Vertical Scroll Progression)
**Purpose**: A cinematic sequence where the camera moves through 3D space as the user scrolls.

**Setup**: 
- Use a THREE.PerspectiveCamera
- Create a "Timeline" (0 to 1) mapped to the total scrollable height of the document

**Scene Organization**:
- Place sections (Groups) at increasing depth along the Z-axis
- Section 1 (Hero): Floating PlaneGeometry meshes for main assets with slight oscillation (Math.sin) for ethereal floating effect
- Section 2 (Transition): Use a ShaderMaterial to handle "wipe" or "dissolve" effects between image textures as they pass the camera's near plane

**Agent Prompt**: "Implement a Z-axis camera movement system. Load image assets onto PlaneGeometry and space them out along the Z-axis. Map the scroll position to camera.position.z so the user 'flies' through the story images."

---

### Layout 2: The Codex (Infinite Interactive List)
**Purpose**: A high-end typography-heavy menu that reveals artifacts on hover.

**Setup**: 
- Orthographic view or perspective camera with narrow field of view
- Use Troika-Three-Text for entry names

**The List Logic**:
- Recycling System: Implement a loop where if mesh.position.y > threshold, move it to the bottom (-threshold)
- Interaction: Create a single "Floating Detail Plane"
- In the requestAnimationFrame loop, use Raycaster to detect mouse position. If intersects a text entry, update texture of Floating Detail Plane and lerp its opacity to 1
- Use Lerp for all position updates: currentY += (targetY - currentY) * 0.1

**Agent Prompt**: "Create a vertical list of text meshes in Three.js. Implement an infinite scroll loop using modulo logic. Add a hover state that follows the cursor with a plane displaying a texture relevant to the hovered text."

---

### Layout 3: The Artifact Gallery (Floating Grid / Stage)
**Purpose**: A fixed stage where multiple artifacts are displayed simultaneously in a structured grid or cluster.

**Setup**: 
- Fixed container (.gallery-stage) that uses a canvas as a background

**Component Mapping**:
- Each .gallery-item in the DOM should have a corresponding THREE.Mesh in the scene
- Sync Logic: Use getBoundingClientRect() of HTML elements to position Three.js meshes (CSS Grid for layout, Three.js for rendering)

**Effects**:
- Mouse Parallax: group.rotation.y = (mouseX - windowHalfX) * 0.0005
- Distortion: Use Fragment Shader to add "glass" or "magnify" effect when cursor passes over an artifact

**Agent Prompt**: "Map a CSS Grid to Three.js. For every .gallery-item in the HTML, place a Mesh at the same screen coordinates. Implement a smooth mouse-follow parallax effect on the entire group of meshes."

---

### Universal Instructions for All Three Layouts
- Optimization: Use InstancedMesh for many repeating elements
- Smoothing: Use lerp for smooth transitions (never set values directly)
- Responsiveness: Use resize listener to update renderer.setSize and camera.aspect
- No GSAP requirement: Use custom Tick() with performance.now() for frame-rate independent animations

---

## 🚨 USER'S REPORTED ERRORS

### Console Error When Clicking "Enter Store":
```
shopifyChatV1Widget.js:2 THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.
zr {isBufferGeometry: true, uuid: '3ea80713-8b09-4919-90f9-af8e9734e248', name: '', type: 'PlaneGeometry', index: Vn, …}

immersive-bundle.min…44936821781331603:1 [Violation] 'requestAnimationFrame' handler took 72ms
```

### User Preference for Editorial Content:
**Option A**: Rendered as 3D text/meshes within the gallery stage itself (preferred)
- Alternative: If performance or visual issues arise, fallback to 2D overlay before 3D gallery

### Merchant Configuration:
- Merchant can choose layout per room via theme editor
- Structure must be expandable for more than 3 layouts

---

## 🏗️ ARCHITECTURE OVERVIEW

### Immersive Editor & Script Loading
- `layout/theme.liquid` is the global shell
- Conditionally loads `assets/three.min.js` and `assets/immersive-store.js` only on immersive pages
- Loads `assets/bridge-behavior.js` globally
- Shows non-immersive preference banner when `localStorage.immersive_preferred_mode === '3d'`

### Immersive Page Composition
- `templates/page.immersive.json` composes immersive experience from sections
- `sections/immersive-canvas.liquid`:
  - Renders canvas and immersive overlays/panels
  - Emits room config JSON via `<script id="immersive-rooms-config" type="application/json">`
  - Exposes runtime text/settings through `data-*` attributes
- `sections/immersive-editorial.liquid`:
  - Renders 2D HTML editorial content (designer bios, occasion cards, featured collection cards)
  - Has 3 layout variants: `designers`, `occasions`, `featured_collections`
  - Uses `data-collection-handle` on block buttons for collection navigation
  - Hidden/aria-hidden on storefront, activated by JS overlay system

### Runtime Orchestration
- `immersive-core.js` → Base room map + Three.js scene + shader transitions
- `immersive-features.js` → Hotspots, room navigation, guided mode, onboarding, wishlist, preference state
- `immersive-init.js` → Initialization orchestrator + scene bootstrap
- Missing: `InfiniteGallery` class referenced in `immersive-init.js` but not implemented

### Data/State Model
- `immersive_preferred_mode`
- `immersive_onboarding_seen`
- `immersive_wishlist`
- `immersive_state`
- `immersive_nav_history`

---

## 🔍 IDENTIFIED ISSUES (Priority Order)

### Issue 1: DUPLICATE SECTION INSTANCES — `page.immersive.json`
- Has 6 `immersive-editorial` section instances
- 3 with real content (collections assigned) ✅
- 3 duplicate "preset" instances with empty collections ⚠️
- When `enterEditorialMode()` queries for section, it picks first match (could be empty)

### Issue 2: MISSING `InfiniteGallery` CLASS
- Referenced in `immersive-init.js` as `window.InfiniteGallery`
- Class doesn't exist in codebase
- Gallery rooms that depend on this will fail silently

### Issue 3: ENTER STORE HOTSPOT NOT NAVIGATING
- When clicking "Enter Store" in storefront room, nothing happens
- Console shows NaN BufferGeometry error
- Lounge room textures are `null` in JS fallback config
- Guided mode activation or texture loading may be failing

### Issue 4: GALLERY STAGE vs HOTSPOT CONFLICT
- Rooms with gallery config items hide all hotspot buttons (`btn.style.display = 'none'`)
- If gallery fails to render, users see nothing (no hotspots, no gallery cards)
- Collection hotspots in room config won't be visible in gallery mode

### Issue 5: TEST FAILURES (6 tests)
- String mismatches: `block.settings.collection.handle` vs expected `collection.handle`
- Missing CSS selector `.immersive-editorial--source[hidden]`

### Issue 6: STALE BUNDLE
- `immersive-bundle.js` was last built June 13
- Doesn't reflect recent changes to core/features files

---

## ✅ EXECUTION PLAN

### Fix 1 (COMPLETED): Remove duplicate editorial sections from `page.immersive.json`

### Fix 2 (IN PROGRESS): Fix "Enter Store" navigation + NaN geometry error

### Fix 3 (UPCOMING): Implement 3 indrajaal-inspired 3D layouts
- **Designer Houses → Codex Layout** (text list with hover-reveal)
- **Occasions → Narrative Story Layout** (cinematic Z-axis scroll)
- **Featured Collections → Artifact Gallery Layout** (floating grid with parallax)

### Fix 4 (UPCOMING): Wire editorial content into 3D layouts (3D text/meshes)

### Fix 5 (UPCOMING): Rebuild bundle + fix tests

### Fix 6 (UPCOMING): 2D store UI/UX audit

---

## 🎯 KEY ARCHITECTURAL INSIGHTS

1. **Layout System Pattern**: Each room has a `layout` setting in `immersive-editorial.liquid`. This can be extended to support 3D layouts.
2. **Text Rendering**: Current code uses DOM elements in `immersive-editorial.liquid`. For 3D text, we'll need Troika-Three-Text integration.
3. **Gallery Stage Architecture**: Uses `immersive-webgl-gallery-config` sections which feed data to JS. This is the configuration entry point.
4. **Hotspot Configuration**: Room configs in `<script id="immersive-rooms-config">` define hotspots with `targetRoom`, `targetCollection`, `targetEditorialRoom` actions.
5. **Bundle vs Source**: Individual source files can be loaded during development; bundle for production.

---

## 💡 PROPOSED LAYOUT EXTENSION

Add to `immersive-editorial.liquid` schema:
```json
{
  "type": "select",
  "id": "immersive_layout",
  "label": "Immersive Layout Type",
  "options": [
    { "value": "narrative_story", "label": "Narrative Story (Z-scroll)" },
    { "value": "codex", "label": "Codex (Infinite List)" },
    { "value": "artifact_gallery", "label": "Artifact Gallery (Floating Grid)" },
    { "value": "none", "label": "Default (Hotspot-based)" }
  ]
}
```

The JS will read this setting and instantiate the appropriate Three.js layout class.