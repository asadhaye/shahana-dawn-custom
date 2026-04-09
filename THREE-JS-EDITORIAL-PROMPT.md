# Three Editorial Rooms — Three.js Implementation Guide

## Overview

The immersive store has **3 editorial rooms** that overlay on top of the 3D canvas. Each room is triggered by a hotspot and displays rich editorial content with scroll parallax effects.

---

## The 3 Rooms

### 1. Designer Houses
- **Room Key:** `designer_houses`
- **Hotspot:** Top center `{ x: 50, y: 15 }` → "Explore Designers"
- **Action:** Opens editorial overlay with brand showcase
- **Content:** Hero + 3 brand tiles (Suffuse, Soraya, Saad Bin Shahzad)
- **Parallax:** Yes — canvas background sinks as user scrolls

### 2. Occasions
- **Room Key:** `occasions`
- **Hotspot:** Top center `{ x: 50, y: 15 }` → "Our Occasions"
- **Action:** Opens editorial overlay with occasion curation
- **Content:** Hero + 4 occasion tiles (Eid, Bridal, Formals, Casual)
- **Parallax:** Yes — canvas background sinks as user scrolls

### 3. Featured Collections
- **Room Key:** `featured_collections`
- **Hotspot:** Top center `{ x: 50, y: 15 }` → "Featured Stories"
- **Action:** Opens editorial overlay with seasonal collections
- **Content:** Hero + 3 collection tiles (SS5 Summer, Suffuse Luxury, Soraya Eid)
- **Parallax:** Yes — canvas background sinks as user scrolls

---

## How It Works

### User Flow

```
1. User clicks editorial hotspot (e.g., "Explore Designers")
   ↓
2. enterEditorialMode('designer_houses', hotspotElement)
   ↓
3. Find editorial section in DOM: <section data-room-key="designer_houses">
   ↓
4. Extract section ID: data-section-id="abc123xyz"
   ↓
5. Fetch via Section Rendering API: GET /?section_id=abc123xyz
   ↓
6. Render HTML into overlay
   ↓
7. Apply View Transition animation (hotspot → overlay morph)
   ↓
8. Blur canvas background
   ↓
9. Enable scroll parallax
   ↓
10. User scrolls editorial content
    ↓
11. Canvas background moves (foreground sinks DOWN, background shifts UP)
    ↓
12. User clicks back button or presses Escape
    ↓
13. exitEditorialMode()
    ↓
14. Hide overlay, unblur canvas, restore focus to hotspot
```

---

## Key Three.js Functions

### `enterEditorialMode(roomKey, triggerEl)`

**Purpose:** Open editorial overlay for a room

**Parameters:**
- `roomKey` — `'designer_houses'`, `'occasions'`, or `'featured_collections'`
- `triggerEl` — The hotspot element (for View Transition animation)

**What it does:**
1. Sets `immersiveState.mode = 'editorial'`
2. Finds editorial section in DOM
3. Fetches section via Section Rendering API
4. Renders HTML into `#immersive-editorial-overlay-content`
5. Applies View Transition animation (hotspot morphs to overlay)
6. Blurs canvas with `canvas.classList.add('editorial-blur')`
7. Caches overlay element and maxScroll for parallax
8. Attaches event listeners (back button, Escape key)

**Code pattern:**
```javascript
function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  immersiveState.lastHotspot = triggerEl;
  
  // Find section in DOM
  var sourceSection = document.querySelector('.immersive-editorial[data-room-key="' + roomKey + '"]');
  var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');
  
  // Fetch via Section Rendering API
  var fetchUrl = window.location.pathname + '?section_id=' + sectionInstanceId;
  
  // Apply View Transition animation
  if (document.startViewTransition && triggerEl) {
    document.startViewTransition(function () {
      triggerEl.style.viewTransitionName = 'editorial-morph';
      overlay.style.viewTransitionName = 'editorial-morph';
      // Show overlay
    });
  }
  
  // Fetch and render
  fetchWithCache(fetchUrl).then(function (html) {
    overlayContent.innerHTML = html;
  });
  
  // Cache for parallax
  cacheEditorialOverlay();
}
```

### `exitEditorialMode()`

**Purpose:** Close editorial overlay and return to 3D browsing

**What it does:**
1. Sets `immersiveState.mode = 'browsing'`
2. Hides overlay: `overlay.classList.remove('is-active')`
3. Unblurs canvas: `canvas.classList.remove('editorial-blur')`
4. Restores focus to hotspot: `immersiveState.lastHotspot.focus()`
5. Clears cached parallax values

**Code pattern:**
```javascript
function exitEditorialMode() {
  immersiveState.mode = 'browsing';
  immersiveState.editorialRoom = null;
  
  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden', 'true');
  canvas.classList.remove('editorial-blur');
  
  // Restore focus
  if (immersiveState.lastHotspot) {
    immersiveState.lastHotspot.focus();
  }
  
  // Clear parallax cache
  editorialOverlayEl = null;
  editorialMaxScroll = null;
}
```

### `updateCameraForMode()`

**Purpose:** Adjust camera for editorial mode

**What it does:**
- Subtly adjusts camera FOV or parallax strength
- Respects `prefers-reduced-motion`
- Keeps changes subtle

---

## Scroll Parallax — "Sinking Room" Effect

### How It Works

As user scrolls the editorial overlay, the **canvas background creates a 3D "sinking" illusion**:

1. **Read scroll position:** `scrollTop = overlay.scrollTop`
2. **Calculate progress:** `scrollProgress = scrollTop / maxScroll` (0 to 1)
3. **Update uniforms:**
   - `uScrollOffset` = scrollProgress × 0.5 (0 to 0.5)
   - `uScrollVignette` = scrollProgress × 0.3 (0 to 0.3)
   - `uScrollChroma` = scrollProgress × 0.1 (0 to 0.1)
4. **Shader applies depth-weighted effect:**
   - Foreground pixels sink DOWN
   - Background pixels shift UP

### Shader Logic

```glsl
float scrollWeight = d + 0.5; // Normalized 0.0 to 1.0 (foreground to background)
float backCounterShift = (1.0 - scrollWeight) * -0.08; // Back wall shifts UP
float foreSinkingShift = scrollWeight * 0.25;           // Furniture sinks DOWN
float totalVerticalShift = (foreSinkingShift + backCounterShift) * uScrollOffset;

return uv + offset + vec2(0.0, totalVerticalShift);
```

### Performance Optimization

```javascript
// Cache on entry (avoid per-frame DOM queries)
function cacheEditorialOverlay() {
  editorialOverlayEl = document.getElementById('immersive-editorial-overlay');
  editorialMaxScroll = editorialOverlayEl.scrollHeight - editorialOverlayEl.clientHeight;
}

// Per-frame animation loop
function animate() {
  if (immersiveState.mode === 'editorial' && editorialOverlayEl) {
    var scrollTop = editorialOverlayEl.scrollTop; // Cheap read, no layout
    var scrollProgress = editorialMaxScroll > 0 ? scrollTop / editorialMaxScroll : 0;
    
    // Lerp toward target (smooth animation)
    editorialScrollProgress += (scrollProgress - editorialScrollProgress) * 0.1;
    
    // Update shader uniforms
    if (uniforms && uniforms.uScrollOffset) {
      uniforms.uScrollOffset.value = editorialScrollProgress * 0.5;
      uniforms.uScrollVignette.value = editorialScrollProgress * 0.3;
      uniforms.uScrollChroma.value = editorialScrollProgress * 0.1;
    }
  } else if (immersiveState.mode !== 'editorial') {
    // Decay on exit (smooth reset)
    editorialScrollProgress *= 0.85;
  }
}

// Clear on exit
function exitEditorialMode() {
  // ... other code ...
  editorialOverlayEl = null;
  editorialMaxScroll = null;
}
```

---

## View Transition Animation

### Hotspot Morph

When entering editorial mode, the browser's **View Transition API** creates a smooth morph from hotspot to overlay:

```javascript
if (document.startViewTransition && triggerEl) {
  var transition = document.startViewTransition(function () {
    triggerEl.style.viewTransitionName = 'editorial-morph';
    overlay.style.viewTransitionName = 'editorial-morph';
    performUIActivation(); // Show overlay
  });
  
  transition.finished.finally(function () {
    triggerEl.style.viewTransitionName = '';
    overlay.style.viewTransitionName = '';
  });
} else {
  performUIActivation(); // Instant transition fallback
}
```

**Browser support:**
- Chrome 111+, Edge 111+ → Smooth morph
- Safari, Firefox → Instant transition (no animation)

---

## State Management

### `immersiveState` Object

```javascript
var immersiveState = {
  mode: 'browsing',              // 'browsing' or 'editorial'
  currentRoom: 'lounge',         // Current 3D room
  editorialRoom: null,           // Current editorial room (if in editorial mode)
  lastHotspot: null,             // Hotspot that triggered editorial (for focus restore)
};
```

### Mode Transitions

```
browsing → editorial (user clicks editorial hotspot)
editorial → browsing (user clicks back button or presses Escape)
```

---

## Hotspot Definitions

### Designer Houses Room

```javascript
{
  x: 50,
  y: 15,
  label: "Explore Designers",
  targetEditorialRoom: "designer_houses"  // ← Triggers enterEditorialMode()
}
```

### Occasions Room

```javascript
{
  x: 50,
  y: 15,
  label: "Our Occasions",
  targetEditorialRoom: "occasions"  // ← Triggers enterEditorialMode()
}
```

### Featured Collections Room

```javascript
{
  x: 50,
  y: 15,
  label: "Featured Stories",
  targetEditorialRoom: "featured_collections"  // ← Triggers enterEditorialMode()
}
```

---

## Accessibility

### Focus Management

- **Focus trap:** Tab/Shift+Tab cycles within overlay
- **Escape key:** Closes overlay
- **Back button:** Has focus on open
- **Focus restore:** Returns to hotspot on close

### ARIA Attributes

```html
<div
  id="immersive-editorial-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="immersive-editorial-overlay-heading"
  aria-hidden="true"  <!-- Hidden until enterEditorialMode() -->
>
```

---

## Configuration

### Room Configuration (Theme Editor)

All room settings are configurable from **Customize → Homepage → Immersive Canvas**:

- Base images (desktop + mobile)
- Depth maps (desktop + mobile)
- Collection hotspots (3-4 per room)
- Hotspot labels

### Merged into STORE_ROOMS

```javascript
// mergeDynamicRoomConfig() IIFE reads JSON config block and merges into STORE_ROOMS
const STORE_ROOMS = {
  designer_houses: {
    baseTextureUrl: "...",
    mobileBaseTextureUrl: "...",
    depthMapUrl: "...",
    mobileDepthMapUrl: "...",
    hotspots: [
      { x: 50, y: 15, label: "Explore Designers", targetEditorialRoom: "designer_houses" },
      // ... other hotspots ...
    ]
  },
  // ... other rooms ...
};
```

---

## Summary

**For Three.js implementation:**

1. **Hotspots with `targetEditorialRoom`** trigger `enterEditorialMode(roomKey, hotspotEl)`
2. **`enterEditorialMode()`** fetches editorial HTML via Section Rendering API and renders into overlay
3. **View Transition API** morphs hotspot to overlay (fallback: instant transition)
4. **Canvas blurs** while overlay is active
5. **Scroll parallax** updates shader uniforms as user scrolls (foreground sinks, background shifts)
6. **Back button or Escape** calls `exitEditorialMode()` to return to 3D
7. **Focus is restored** to the hotspot that triggered the editorial

**Key files:**
- `assets/immersive-store.js` — `enterEditorialMode()`, `exitEditorialMode()`, `updateCameraForMode()`
- `sections/immersive-canvas.liquid` — Hotspot definitions with `targetEditorialRoom`
- `sections/immersive-editorial.liquid` — Editorial section (fetched via Section Rendering API)

---

**That's it!** 🎨
