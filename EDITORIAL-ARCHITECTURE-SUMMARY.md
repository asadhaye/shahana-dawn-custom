# Editorial Architecture Summary

**For:** Three.js/Vibe coding tools, developers, and architects  
**Purpose:** Complete overview of how editorial rooms integrate with the immersive store  
**Context:** Shahana Collection immersive store with per-room editorial overlays

---

## The Big Picture

The immersive store has **5 rooms** (storefront, lounge, designer_houses, occasions, featured_collections) with **3 editorial rooms** that overlay on top of the 3D canvas.

```
┌─────────────────────────────────────────────────────────────────┐
│ 5 ROOMS IN STORE_ROOMS                                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. storefront      — Entry point (no editorial)                 │
│ 2. lounge          — Hub with 3 navigation hotspots (no edit.)  │
│ 3. designer_houses — Brand showcase (HAS editorial overlay)     │
│ 4. occasions       — Occasion curation (HAS editorial overlay)  │
│ 5. featured_colls  — Seasonal collections (HAS editorial overlay)
└─────────────────────────────────────────────────────────────────┘
```

---

## Three Editorial Rooms Explained

### 1. Designer Houses

**Room Key:** `designer_houses`  
**Editorial Layout:** `designers`  
**Purpose:** Showcase luxury Pakistani fashion brands

**Room Hotspots:**
- Top center: "Explore Designers" → Opens editorial overlay
- Left: "Suffuse" → Opens collection panel
- Center: "Soraya" → Opens collection panel
- Right: "Saad Bin Shahzad" → Opens collection panel
- Bottom: "Back to lounge" → Navigates to lounge room

**Editorial Content:**
- Hero: Brand showcase background image
- Banners: 3 brand tiles with logos, descriptions, CTAs
- Scroll parallax: Canvas background sinks as user scrolls

**Theme Editor Config:**
- Base image (desktop + mobile)
- Depth map (desktop + mobile)
- 3 collection slots (each with label + collection picker)

---

### 2. Occasions

**Room Key:** `occasions`  
**Editorial Layout:** `occasions`  
**Purpose:** Curate collections by occasion (Eid, Bridal, Formals, Casual)

**Room Hotspots:**
- Top center: "Our Occasions" → Opens editorial overlay
- 4 occasion hotspots: Eid, Bridal & Mehndi, Luxury Formals, Casual Pret → Open collection panels
- Bottom: "Back to lounge" → Navigates to lounge room

**Editorial Content:**
- Hero: Occasion showcase background image
- Banners: 4 occasion tiles with images, descriptions, CTAs
- Scroll parallax: Canvas background sinks as user scrolls

**Theme Editor Config:**
- Base image (desktop + mobile)
- Depth map (desktop + mobile)
- 4 collection slots (each with label + collection picker)

---

### 3. Featured Collections

**Room Key:** `featured_collections`  
**Editorial Layout:** `collections`  
**Purpose:** Showcase seasonal and limited-edition collections

**Room Hotspots:**
- Top center: "Featured Stories" → Opens editorial overlay
- 3 collection hotspots: SS5 Summer Pret, Suffuse Luxury Pret, Soraya Eid Pret → Open collection panels
- Bottom: "Back to lounge" → Navigates to lounge room

**Editorial Content:**
- Hero: Featured collections background image
- Banners: 3 collection tiles with images, descriptions, CTAs
- Scroll parallax: Canvas background sinks as user scrolls

**Theme Editor Config:**
- Base image (desktop + mobile)
- Depth map (desktop + mobile)
- 3 collection slots (each with label + collection picker)

---

## Technical Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. THEME EDITOR                                                 │
│    Merchant uploads images, selects collections                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. LIQUID RENDERING (immersive-canvas.liquid)                   │
│    Renders JSON config block with all room settings             │
│    <script type="application/json" id="immersive-rooms-config"> │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. THREE.JS INITIALIZATION (immersive-store.js)                 │
│    mergeDynamicRoomConfig() reads JSON and merges into STORE_ROOMS
│    Three.js uses merged config to render rooms                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. USER INTERACTION                                             │
│    User clicks editorial hotspot (e.g., "Explore Designers")    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. EDITORIAL MODE ENTRY (enterEditorialMode)                    │
│    - Find editorial section in DOM: <section data-room-key="...">
│    - Extract section ID: data-section-id="abc123xyz"            │
│    - Fetch via Section Rendering API: GET /?section_id=abc123xyz
│    - Render HTML into overlay                                   │
│    - Apply View Transition animation (hotspot → overlay)        │
│    - Blur canvas background                                     │
│    - Enable scroll parallax                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. EDITORIAL OVERLAY ACTIVE                                     │
│    - User reads editorial content                               │
│    - Scroll parallax: canvas background sinks as user scrolls   │
│    - User can click CTAs to open collection panels              │
│    - User can click back button or press Escape to exit         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. EDITORIAL MODE EXIT (exitEditorialMode)                      │
│    - Hide overlay                                               │
│    - Unblur canvas                                              │
│    - Restore focus to hotspot                                   │
│    - Reset scroll parallax                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Role |
|------|------|
| `sections/immersive-canvas.liquid` | Renders JSON config block with all room settings |
| `sections/immersive-editorial.liquid` | Reusable editorial section (one instance per room) |
| `assets/immersive-store.js` | Three.js engine + `enterEditorialMode()` + `exitEditorialMode()` |
| `layout/theme.liquid` | Loads Three.js scripts conditionally on `page.immersive` |
| `templates/page.immersive.json` | Template that includes immersive-canvas + 3 immersive-editorial sections |

---

## State Management

### `immersiveState` Object

```javascript
var immersiveState = {
  mode: 'browsing',              // 'browsing' or 'editorial'
  currentRoom: 'lounge',         // Current 3D room
  editorialRoom: null,           // Current editorial room (if in editorial mode)
  lastHotspot: null,             // Hotspot that triggered editorial (for focus restore)
  // ... other state
};
```

### Mode Transitions

```
browsing → editorial (user clicks hotspot with targetEditorialRoom)
editorial → browsing (user clicks back button or presses Escape)
browsing → browsing (user navigates to different 3D room)
```

### localStorage Keys

| Key | Value | Purpose |
|---|---|---|
| `immersive_onboarding_seen` | `'1'` | Suppress onboarding overlay after first dismissal |
| `immersive_wishlist` | JSON array | Persist wishlist across sessions |
| `immersive_cookie_notice` | `'1'` | Suppress cookie banner after dismissal |
| `immersive_preferred_mode` | `'3d'` | Written on scene init; read by preference banner |

---

## The "Sinking Room" Effect

### How It Works

When user scrolls the editorial overlay, the **canvas background creates a 3D "sinking" illusion**:

1. **Foreground objects** (furniture, close elements) sink DOWN
2. **Background objects** (walls, far elements) shift UP
3. **Result:** Powerful depth effect as if descending into the room

### Shader Logic

```glsl
float scrollWeight = d + 0.5; // Normalized 0.0 to 1.0 (foreground to background)
float backCounterShift = (1.0 - scrollWeight) * -0.08; // Back wall shifts UP
float foreSinkingShift = scrollWeight * 0.25;           // Furniture sinks DOWN
float totalVerticalShift = (foreSinkingShift + backCounterShift) * uScrollOffset;
```

### Performance

- **Cache on entry:** Store overlay element and maxScroll
- **Per-frame read:** Only read `scrollTop` (cheap, no layout)
- **Lerp smoothly:** Lerp at factor 0.1 for smooth animation
- **Clear on exit:** Remove cached values

---

## View Transition Animation

### Hotspot Morph

When entering editorial mode:

1. **Hotspot element** gets `view-transition-name: 'editorial-morph'`
2. **Overlay element** gets `view-transition-name: 'editorial-morph'`
3. **Browser animates** from hotspot position → overlay position
4. **Fallback:** Instant transition for browsers without View Transition API

### Browser Support

- **Chrome 111+, Edge 111+:** Smooth morph animation
- **Safari/Firefox:** Instant transition (no animation)
- **Older browsers:** Instant transition

---

## Focus Management & Accessibility

### Focus Trap

When editorial overlay is open:

1. **Focus trapped** inside overlay (Tab/Shift+Tab cycles)
2. **Escape key** closes overlay
3. **Back button** has focus on open
4. **Focus restored** to hotspot on close

### ARIA Attributes

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="immersive-editorial-overlay-heading"
  aria-hidden="true"  <!-- Hidden until enterEditorialMode() -->
>
```

---

## Configuration Hierarchy

### Room Configuration Sources (in order of precedence)

1. **Theme Editor Settings** (highest priority)
   - Merchant uploads images, selects collections
   - Rendered in JSON config block by Liquid
   - Merged into STORE_ROOMS by `mergeDynamicRoomConfig()`

2. **JSON Config Block** (immersive-canvas.liquid)
   - Rendered by Liquid with theme editor values
   - Read by `mergeDynamicRoomConfig()` IIFE
   - Merges non-null values into STORE_ROOMS

3. **STORE_ROOMS JS Defaults** (lowest priority)
   - Fallback values in immersive-store.js
   - Used if theme editor settings are blank

### Example: Designer Houses Room

**Theme Editor:**
```
base_image: "https://cdn.shopify.com/.../designer-houses-base.webp"
depth_map: "https://cdn.shopify.com/.../designer-houses-depth.webp"
slot_1_collection: "suffuse"
slot_1_label: "Suffuse"
```

**JSON Config Block (rendered by Liquid):**
```json
{
  "designer_houses": {
    "baseTextureUrl": "https://cdn.shopify.com/.../designer-houses-base.webp?width=1920&quality=75",
    "depthMapUrl": "https://cdn.shopify.com/.../designer-houses-depth.webp?quality=60",
    "hotspots": [
      { "x": 50, "y": 15, "label": "Explore Designers", "targetEditorialRoom": "designer_houses" },
      { "x": 13, "y": 40, "label": "Suffuse", "targetCollection": "suffuse" },
      // ... more hotspots ...
    ]
  }
}
```

**STORE_ROOMS (after merge):**
```javascript
STORE_ROOMS.designer_houses = {
  baseTextureUrl: "https://cdn.shopify.com/.../designer-houses-base.webp?width=1920&quality=75",
  depthMapUrl: "https://cdn.shopify.com/.../designer-houses-depth.webp?quality=60",
  hotspots: [
    { x: 50, y: 15, label: "Explore Designers", targetEditorialRoom: "designer_houses" },
    { x: 13, y: 40, label: "Suffuse", targetCollection: "suffuse" },
    // ... more hotspots ...
  ]
}
```

---

## Editorial Section Instances

Each editorial room has **one section instance** on the immersive page:

```liquid
<!-- Designer Houses Editorial -->
<section
  id="immersive-editorial-designer_houses"
  class="immersive-editorial immersive-editorial--designer_houses"
  data-room-key="designer_houses"
  data-section-id="immersive_editorial_abc123"  <!-- Shopify instance ID -->
>
  <!-- Hero + Banners -->
</section>

<!-- Occasions Editorial -->
<section
  id="immersive-editorial-occasions"
  class="immersive-editorial immersive-editorial--occasions"
  data-room-key="occasions"
  data-section-id="immersive_editorial_def456"
>
  <!-- Hero + Banners -->
</section>

<!-- Featured Collections Editorial -->
<section
  id="immersive-editorial-featured_collections"
  class="immersive-editorial immersive-editorial--featured_collections"
  data-room-key="featured_collections"
  data-section-id="immersive_editorial_ghi789"
>
  <!-- Hero + Banners -->
</section>
```

When user clicks an editorial hotspot, `enterEditorialMode()` reads the `data-section-id` and fetches the section via Section Rendering API.

---

## Summary for Three.js Tool

**When explaining editorial rooms to a Three.js/Vibe coding tool, emphasize:**

1. **5 rooms total** with **3 editorial rooms** (designer_houses, occasions, featured_collections)
2. **Editorial hotspots** at `{ x: 50, y: 15 }` (top center) with `targetEditorialRoom` property
3. **Clicking editorial hotspot** calls `enterEditorialMode(roomKey)` which:
   - Finds editorial section in DOM
   - Fetches section via Section Rendering API
   - Renders into overlay
   - Applies View Transition animation
   - Enables scroll parallax
4. **Scroll parallax** creates "sinking room" effect via depth-weighted shader
5. **Exit via back button or Escape** returns to 3D browsing
6. **All room config** is theme-editor-configurable (images, collections, labels)
7. **State management** tracks mode (browsing vs editorial) and current room
8. **Focus management** ensures accessibility (focus trap, focus restore)

---

## Next Steps for Implementation

### For Three.js Developers

1. **Understand STORE_ROOMS structure** — 5 rooms with hotspots
2. **Understand `enterEditorialMode()`** — How editorial overlay is triggered
3. **Understand scroll parallax** — How canvas background moves during scroll
4. **Understand View Transition API** — How hotspot morph animation works
5. **Understand state management** — How mode and room state is tracked

### For Liquid Developers

1. **Understand immersive-editorial.liquid** — Reusable section with blocks
2. **Understand theme editor config** — How rooms are configured
3. **Understand Section Rendering API** — How editorial HTML is fetched
4. **Understand JSON config block** — How room settings are passed to Three.js

### For Designers

1. **Understand the 3 editorial layouts** — designers, occasions, collections
2. **Understand scroll parallax effect** — How canvas background moves
3. **Understand View Transition animation** — How hotspot morphs to overlay
4. **Understand focus management** — How keyboard navigation works

---

**That's the complete editorial architecture!** 🎨
