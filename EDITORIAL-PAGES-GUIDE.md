# Editorial Pages Guide — Designer Houses, Occasions, Featured Collections

**For:** Three.js/Vibe coding tools and developers  
**Purpose:** Understand how the three editorial pages connect to the 3D immersive experience  
**Context:** Shahana Collection immersive store with per-room editorial overlays

---

## Overview

The immersive store has **three editorial "living story" pages** that overlay on top of the 3D canvas:

1. **Designer Houses** — Showcase luxury Pakistani fashion brands (Suffuse, Soraya, Saad Bin Shahzad)
2. **Occasions** — Curated collections by occasion (Eid, Bridal & Mehndi, Luxury Formals, Casual Pret)
3. **Featured Collections** — Seasonal and limited-edition collections

Each editorial page is **tied to a specific 3D room** and can be accessed by clicking a hotspot in that room.

---

## Architecture

### Room Structure (Three.js Side)

The immersive store has **5 rooms** in total, with **3 editorial rooms**:

```
STORE_ROOMS = {
  storefront: {
    baseTextureUrl: "...",
    mobileBaseTextureUrl: "...",
    depthMapUrl: "...",
    mobileDepthMapUrl: "...",
    hotspots: [
      { x: 50, y: 68, label: "Enter store", targetRoom: "lounge", mobileX: 55, mobileY: 63 }
    ]
  },
  lounge: {
    baseTextureUrl: "...",
    hotspots: [
      { x: 25, y: 27, label: "Designer Houses", targetRoom: "designer_houses" },
      { x: 50, y: 27, label: "Occasions", targetRoom: "occasions" },
      { x: 75, y: 28, label: "Featured Collections", targetRoom: "featured_collections" },
      { x: 50, y: 90, label: "Back to storefront", targetRoom: "storefront" }
    ]
  },
  designer_houses: {
    baseTextureUrl: "...",
    hotspots: [
      { x: 50, y: 15, label: "Explore Designers", targetEditorialRoom: "designer_houses" },
      { x: 13, y: 40, label: "Suffuse", targetCollection: "suffuse" },
      { x: 50, y: 45, label: "Soraya", targetCollection: "soraya" },
      { x: 87, y: 40, label: "Saad Bin Shahzad", targetCollection: "saad-bin-shahzad" },
      { x: 50, y: 90, label: "Back to lounge", targetRoom: "lounge" }
    ]
  },
  occasions: {
    baseTextureUrl: "...",
    hotspots: [
      { x: 50, y: 15, label: "Our Occasions", targetEditorialRoom: "occasions" },
      { x: 25, y: 40, label: "Eid Collection", targetCollection: "eid-collection" },
      { x: 42, y: 50, label: "Bridal & Mehndi", targetCollection: "bridal-mehndi" },
      { x: 58, y: 40, label: "Luxury Formals", targetCollection: "luxury-formals" },
      { x: 75, y: 50, label: "Casual Pret", targetCollection: "casual-pret" },
      { x: 50, y: 85, label: "Back to lounge", targetRoom: "lounge" }
    ]
  },
  featured_collections: {
    baseTextureUrl: "...",
    hotspots: [
      { x: 50, y: 15, label: "Featured Stories", targetEditorialRoom: "featured_collections" },
      { x: 25, y: 40, label: "SS5 Summer Pret 26", targetCollection: "summer-pret-26" },
      { x: 50, y: 50, label: "Suffuse Luxury Pret", targetCollection: "luxury-pret-suffuse" },
      { x: 75, y: 40, label: "Soraya Eid Pret", targetCollection: "soraya-eid-pret" },
      { x: 50, y: 85, label: "Back to lounge", targetRoom: "lounge" }
    ]
  }
}
```

**Key points:**
- `x` and `y` are percentage positions on the canvas (0–100)
- `mobileX` and `mobileY` are optional mobile-specific positions
- Each hotspot has ONE of: `targetRoom`, `targetCollection`, or `targetEditorialRoom`
- All room textures and hotspot labels are **configurable from the Shopify theme editor**
- Editorial hotspots (`targetEditorialRoom`) are always at `{ x: 50, y: 15 }` (top center of room)

### Editorial Section Structure (Liquid Side)

Each editorial is a **reusable Liquid section** (`sections/immersive-editorial.liquid`) with:

```liquid
<section
  id="immersive-editorial-{{ room_key }}"
  class="immersive-editorial immersive-editorial--{{ room_key }}"
  data-room-key="designer_houses"  <!-- or "occasions" or "featured_collections" -->
  data-layout="designers"           <!-- or "occasions" or "collections" -->
  data-section-id="{{ section.id }}"
>
  <!-- Hero section with background image -->
  <div class="immersive-editorial__hero">
    <img class="immersive-editorial__hero-bg" src="..." />
    <div class="immersive-editorial__hero-panel">
      <p class="immersive-editorial__eyebrow">{{ hero_eyebrow }}</p>
      <h2 class="immersive-editorial__heading">{{ hero_heading }}</h2>
      <div class="immersive-editorial__subheading">{{ hero_subheading }}</div>
    </div>
  </div>

  <!-- Banners/tiles (blocks) -->
  <div class="immersive-editorial__banners">
    {% for block in section.blocks %}
      <article class="immersive-editorial__banner">
        <img class="immersive-editorial__banner-media" src="..." />
        <div class="immersive-editorial__banner-content">
          <h3>{{ block.heading }}</h3>
          <p>{{ block.body }}</p>
          <a href="{{ block.cta_url }}">{{ block.cta_label }}</a>
        </div>
      </article>
    {% endfor %}
  </div>
</section>
```

---

## Room Configuration & Theme Editor Integration

### How Rooms Are Configured

All 5 rooms are **fully configurable from the Shopify theme editor** via **Customize → Homepage → Immersive Canvas** section settings.

**Configuration flow:**
1. Merchant uploads images in theme editor (base textures, depth maps)
2. `immersive-canvas.liquid` renders a `<script type="application/json" id="immersive-rooms-config">` block with all room settings
3. `mergeDynamicRoomConfig()` IIFE in `immersive-store.js` reads this JSON and merges it into `STORE_ROOMS`
4. Any non-null values from theme editor override the JS defaults
5. Three.js uses the merged configuration to render rooms

### Designer Houses Room Configuration

**Theme Editor Settings:**

| Setting | Type | Purpose |
|---|---|---|
| `designer_houses_base_image` | image_picker | Desktop base texture (1920px) |
| `designer_houses_base_image_mobile` | image_picker | Mobile base texture (1200px; falls back to desktop) |
| `designer_houses_depth_map` | image_picker | Desktop depth map (1920px) |
| `designer_houses_depth_map_mobile` | image_picker | Mobile depth map (1200px; falls back to desktop) |
| `designer_houses_slot_1_collection` | collection | Hotspot 1 collection (default: "suffuse") |
| `designer_houses_slot_1_label` | text | Hotspot 1 label (default: "Suffuse") |
| `designer_houses_slot_2_collection` | collection | Hotspot 2 collection (default: "soraya") |
| `designer_houses_slot_2_label` | text | Hotspot 2 label (default: "Soraya") |
| `designer_houses_slot_3_collection` | collection | Hotspot 3 collection (default: "saad-bin-shahzad") |
| `designer_houses_slot_3_label` | text | Hotspot 3 label (default: "Saad Bin Shahzad") |

**Editorial hotspot (not configurable):**
- Position: `{ x: 50, y: 15 }` (top center)
- Label: "Explore Designers" (from locale key `sections.immersive_store.nav_explore_designers`)
- Action: Opens editorial overlay for designer_houses room

### Occasions Room Configuration

**Theme Editor Settings:**

| Setting | Type | Purpose |
|---|---|---|
| `occasions_base_image` | image_picker | Desktop base texture (1920px) |
| `occasions_base_image_mobile` | image_picker | Mobile base texture (1200px; falls back to desktop) |
| `occasions_depth_map` | image_picker | Desktop depth map (1920px) |
| `occasions_depth_map_mobile` | image_picker | Mobile depth map (1200px; falls back to desktop) |
| `occasions_slot_1_collection` | collection | Hotspot 1 collection (default: "eid-collection") |
| `occasions_slot_1_label` | text | Hotspot 1 label (default: "Eid Collection") |
| `occasions_slot_2_collection` | collection | Hotspot 2 collection (default: "bridal-mehndi") |
| `occasions_slot_2_label` | text | Hotspot 2 label (default: "Bridal & Mehndi") |
| `occasions_slot_3_collection` | collection | Hotspot 3 collection (default: "luxury-formals") |
| `occasions_slot_3_label` | text | Hotspot 3 label (default: "Luxury Formals") |
| `occasions_slot_4_collection` | collection | Hotspot 4 collection (default: "casual-pret") |
| `occasions_slot_4_label` | text | Hotspot 4 label (default: "Casual Pret") |

**Editorial hotspot (not configurable):**
- Position: `{ x: 50, y: 15 }` (top center)
- Label: "Our Occasions" (from locale key `sections.immersive_store.nav_our_occasions`)
- Action: Opens editorial overlay for occasions room

### Featured Collections Room Configuration

**Theme Editor Settings:**

| Setting | Type | Purpose |
|---|---|---|
| `featured_collections_base_image` | image_picker | Desktop base texture (1920px) |
| `featured_collections_base_image_mobile` | image_picker | Mobile base texture (1200px; falls back to desktop) |
| `featured_collections_depth_map` | image_picker | Desktop depth map (1920px) |
| `featured_collections_depth_map_mobile` | image_picker | Mobile depth map (1200px; falls back to desktop) |
| `featured_collections_slot_1_collection` | collection | Hotspot 1 collection (default: "summer-pret-26") |
| `featured_collections_slot_1_label` | text | Hotspot 1 label (default: "SS5 Summer Pret 26") |
| `featured_collections_slot_2_collection` | collection | Hotspot 2 collection (default: "luxury-pret-suffuse") |
| `featured_collections_slot_2_label` | text | Hotspot 2 label (default: "Suffuse Luxury Pret") |
| `featured_collections_slot_3_collection` | collection | Hotspot 3 collection (default: "soraya-eid-pret") |
| `featured_collections_slot_3_label` | text | Hotspot 3 label (default: "Soraya Eid Pret") |

**Editorial hotspot (not configurable):**
- Position: `{ x: 50, y: 15 }` (top center)
- Label: "Featured Stories" (from locale key `sections.immersive_store.nav_featured_stories`)
- Action: Opens editorial overlay for featured_collections room

### Image Optimization

All room textures are served with Shopify CDN optimization parameters:

**Desktop textures:** `width=1920&quality=75`  
**Mobile textures:** `width=1200&quality=75`  
**Depth maps:** `quality=60` (lower quality acceptable for depth)

Fallback logic:
- If mobile texture is missing → use desktop texture
- If desktop texture is missing → use JS default (if available)
- If all missing → room navigation aborts (atomic failure)

---

### Step 1: User in 3D Room (Canvas)

User is viewing the **Lounge room** in the 3D immersive store. They see three hotspots:
- "Designer Houses" (left)
- "Occasions" (center)
- "Featured Collections" (right)

### Step 2: User Clicks Hotspot

User clicks the "Designer Houses" hotspot. The hotspot has:
```javascript
{
  x: 25,
  y: 27,
  label: "Designer Houses",
  targetEditorialRoom: "designer_houses"  // ← Key trigger
}
```

### Step 3: Three.js Calls `enterEditorialMode()`

```javascript
enterEditorialMode('designer_houses', hotspotElement);
```

This function:
1. Sets `immersiveState.mode = 'editorial'`
2. Sets `immersiveState.editorialRoom = 'designer_houses'`
3. Finds the editorial section in the DOM: `<section data-room-key="designer_houses">`
4. Extracts the section instance ID: `data-section-id="abc123xyz"`
5. Fetches the section via Section Rendering API: `GET /?section_id=abc123xyz`
6. Renders the HTML into the overlay: `#immersive-editorial-overlay-content`
7. Applies View Transition animation (morph hotspot → overlay)
8. Blurs the canvas background
9. Shows the editorial overlay with scroll parallax

### Step 4: User Reads Editorial Content

The editorial overlay displays:
- **Hero section** with background image, eyebrow, heading, subheading
- **Stacked banners** (blocks) with images, text, CTAs
- **Scroll parallax** effect (canvas background moves as user scrolls)
- **Back button** to return to 3D

### Step 5: User Clicks CTA or Back Button

**Option A: Click CTA (e.g., "Explore Suffuse")**
- Exits editorial mode
- Opens collection panel in glass panel
- User can browse products in 3D

**Option B: Click Back Button**
- Exits editorial mode
- Returns to 3D room (Lounge)
- Canvas unblurs
- Focus returns to the hotspot that triggered the editorial

---

## Three Editorial Pages Explained

### 1. Designer Houses

**Purpose:** Showcase luxury Pakistani fashion brands

**Room Key:** `designer_houses`  
**Layout:** `designers`  
**Hotspot Trigger:** "Explore Designers" (top center of room)

**Content Structure:**
```
Hero Section:
  - Background image (designer houses room)
  - Eyebrow: "Our Designers"
  - Heading: "Meet the Visionaries"
  - Subheading: "Discover the brands shaping luxury fashion"

Banners (Blocks):
  Block 1: Suffuse
    - Image: Brand hero shot
    - Logo: Suffuse logo overlay
    - Heading: "Suffuse"
    - Body: "Luxury pret wear with timeless elegance..."
    - CTA: "Explore Suffuse" → opens collection panel

  Block 2: Soraya
    - Image: Brand hero shot
    - Logo: Soraya logo overlay
    - Heading: "Soraya"
    - Body: "Contemporary luxury with bold aesthetics..."
    - CTA: "Explore Soraya" → opens collection panel

  Block 3: Saad Bin Shahzad
    - Image: Brand hero shot
    - Logo: Saad Bin Shahzad logo overlay
    - Heading: "Saad Bin Shahzad"
    - Body: "Haute couture meets modern sensibility..."
    - CTA: "Explore Saad Bin Shahzad" → opens collection panel
```

**CSS Modifiers:**
- `.immersive-editorial--designer_houses` — Room-specific styling
- `.immersive-editorial--layout-designers` — Layout-specific styling (logo overlay, brand focus)

**Scroll Parallax:**
- Canvas background (designer_houses room) moves subtly as user scrolls
- Parallax strength: 0.06 (mobile) or 0.12 (desktop)
- Uniforms: `uScrollOffset`, `uScrollVignette`, `uScrollChroma`

---

### 2. Occasions

**Purpose:** Curate collections by occasion (Eid, Bridal, Formals, Casual)

**Room Key:** `occasions`  
**Layout:** `occasions`  
**Hotspot Trigger:** "Our Occasions" (top center of room)

**Content Structure:**
```
Hero Section:
  - Background image (occasions room)
  - Eyebrow: "Celebrate Every Moment"
  - Heading: "Collections by Occasion"
  - Subheading: "From everyday elegance to special celebrations"

Banners (Blocks):
  Block 1: Eid Collection
    - Image: Eid-themed hero shot
    - Heading: "Eid Collection"
    - Body: "Vibrant colors and intricate embroidery for the festival of joy..."
    - CTA: "Shop Eid" → opens collection panel

  Block 2: Bridal & Mehndi
    - Image: Bridal hero shot
    - Heading: "Bridal & Mehndi"
    - Body: "Timeless bridal wear and mehndi-ready designs..."
    - CTA: "Shop Bridal" → opens collection panel

  Block 3: Luxury Formals
    - Image: Formal wear hero shot
    - Heading: "Luxury Formals"
    - Body: "Sophisticated formal wear for corporate and evening events..."
    - CTA: "Shop Formals" → opens collection panel

  Block 4: Casual Pret
    - Image: Casual pret hero shot
    - Heading: "Casual Pret"
    - Body: "Comfortable yet stylish everyday wear..."
    - CTA: "Shop Casual" → opens collection panel
```

**CSS Modifiers:**
- `.immersive-editorial--occasions` — Room-specific styling
- `.immersive-editorial--layout-occasions` — Layout-specific styling (4-column grid on desktop)

**Scroll Parallax:**
- Canvas background (occasions room) moves as user scrolls
- Same parallax strength as Designer Houses

---

### 3. Featured Collections

**Purpose:** Showcase seasonal and limited-edition collections

**Room Key:** `featured_collections`  
**Layout:** `collections`  
**Hotspot Trigger:** "Featured Stories" (top center of room)

**Content Structure:**
```
Hero Section:
  - Background image (featured collections room)
  - Eyebrow: "What's New"
  - Heading: "Featured Collections"
  - Subheading: "Discover our latest seasonal releases and limited editions"

Banners (Blocks):
  Block 1: SS5 Summer Pret 26
    - Image: Summer collection hero shot
    - Heading: "SS5 Summer Pret 26"
    - Body: "Light, breathable fabrics perfect for summer celebrations..."
    - CTA: "Shop Summer" → opens collection panel

  Block 2: Suffuse Luxury Pret
    - Image: Suffuse luxury pret hero shot
    - Heading: "Suffuse Luxury Pret"
    - Body: "Premium pret wear from the Suffuse collection..."
    - CTA: "Shop Suffuse" → opens collection panel

  Block 3: Soraya Eid Pret
    - Image: Soraya eid pret hero shot
    - Heading: "Soraya Eid Pret"
    - Body: "Soraya's exclusive Eid collection with bold colors..."
    - CTA: "Shop Soraya" → opens collection panel
```

**CSS Modifiers:**
- `.immersive-editorial--featured_collections` — Room-specific styling
- `.immersive-editorial--layout-collections` — Layout-specific styling (gallery/grid view)

**Scroll Parallax:**
- Canvas background (featured_collections room) moves as user scrolls
- Same parallax strength as other editorials

---

## Technical Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User in 3D Lounge Room (Canvas Visible)                         │
│ Sees three hotspots: Designer Houses | Occasions | Featured     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks hotspot
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Three.js: enterEditorialMode('designer_houses', hotspotEl)      │
│ - Set immersiveState.mode = 'editorial'                         │
│ - Set immersiveState.editorialRoom = 'designer_houses'          │
│ - Find section: <section data-room-key="designer_houses">       │
│ - Extract section ID: data-section-id="abc123xyz"               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Section Rendering API: GET /?section_id=abc123xyz               │
│ Returns: HTML of immersive-editorial section                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Three.js: Render HTML into #immersive-editorial-overlay-content │
│ - Apply View Transition animation (morph hotspot → overlay)     │
│ - Blur canvas background                                        │
│ - Show overlay with scroll parallax                             │
│ - Focus back button                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ User Reads Editorial Content (Overlay Visible)                  │
│ - Hero section with background image                            │
│ - Stacked banners with images, text, CTAs                       │
│ - Scroll parallax effect (canvas moves behind)                  │
│ - Back button to return to 3D                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks CTA or Back
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Three.js: exitEditorialMode()                                   │
│ - Set immersiveState.mode = 'browsing'                          │
│ - Hide overlay                                                  │
│ - Unblur canvas                                                 │
│ - Restore focus to hotspot                                      │
│ - If CTA clicked: open collection panel                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Back to 3D Room (Canvas Visible Again)                          │
│ User can click other hotspots or navigate to other rooms        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Three.js Functions

### `enterEditorialMode(roomKey, triggerEl)`

**Called when:** User clicks a hotspot with `targetEditorialRoom` property

**Parameters:**
- `roomKey` — The editorial room key: `'designer_houses'`, `'occasions'`, or `'featured_collections'`
- `triggerEl` — The hotspot element that triggered the editorial (for View Transition animation)

**What it does:**
1. Sets editorial mode state
2. Finds the editorial section in the DOM
3. Fetches the section via Section Rendering API
4. Renders HTML into overlay
5. Applies View Transition animation
6. Blurs canvas background
7. Attaches event listeners (back button, escape key, collection clicks)

**Key code:**
```javascript
function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  
  var sourceSection = document.querySelector('.immersive-editorial[data-room-key="' + roomKey + '"]');
  var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');
  
  var fetchUrl = window.location.pathname + '?section_id=' + sectionInstanceId;
  
  fetchWithCache(fetchUrl)
    .then(function (html) {
      overlayContent.innerHTML = html;
      // Re-initialize parallax, etc.
    })
    .catch(function (err) {
      // Show error state
    });
}
```

### `exitEditorialMode()`

**Called when:** User clicks back button or presses Escape

**What it does:**
1. Sets browsing mode state
2. Hides overlay
3. Unblurs canvas
4. Restores focus to hotspot
5. Resets scroll position

**Key code:**
```javascript
function exitEditorialMode() {
  immersiveState.mode = 'browsing';
  immersiveState.editorialRoom = null;
  
  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden', 'true');
  canvas.classList.remove('editorial-blur');
  
  // Restore focus to hotspot
  if (immersiveState.lastHotspot) {
    immersiveState.lastHotspot.focus();
  }
}
```

### `updateCameraForMode()`

**Called when:** Entering or exiting editorial mode

**What it does:**
- Adjusts camera FOV, position, or parallax strength based on mode
- Respects `prefers-reduced-motion` setting
- Keeps changes subtle

**Key code:**
```javascript
function updateCameraForMode() {
  if (immersiveState.mode === 'editorial') {
    // Subtle camera adjustment for editorial mode
    // e.g., slightly reduce parallax strength
  } else {
    // Reset to normal browsing mode
  }
}
```

---

## Key Liquid Sections

### `sections/immersive-editorial.liquid`

**Reusable section** that powers all three editorials.

**Settings:**
- `room_key` — Which room: `designer_houses`, `occasions`, `featured_collections`
- `layout` — How to display: `designers`, `occasions`, `collections`
- `hero_background_image` — Hero section background
- `hero_eyebrow` — Hero eyebrow text
- `hero_heading` — Hero main heading
- `hero_subheading` — Hero subheading (rich text)

**Blocks:**
- `heading` — Banner heading
- `body` — Banner body text (rich text)
- `image` — Banner image
- `logo` — Brand logo (for designers layout)
- `cta_label` — CTA button text
- `cta_url` — CTA button URL
- `collection` — Collection reference (for gallery view)
- `depth_layer` — Parallax depth (0-100)

**CSS Classes:**
- `.immersive-editorial` — Base class
- `.immersive-editorial--{{ room_key }}` — Room-specific (e.g., `--designer_houses`)
- `.immersive-editorial--layout-{{ layout }}` — Layout-specific (e.g., `--layout-designers`)
- `.immersive-editorial__hero` — Hero section
- `.immersive-editorial__banners` — Banners container
- `.immersive-editorial__banner` — Individual banner
- `.immersive-editorial__banner-media` — Banner image
- `.immersive-editorial__banner-content` — Banner text content

---

## Scroll Parallax Effect — "Sinking Into the Room"

### How It Works

When a user scrolls the editorial overlay, the **canvas background creates a powerful "sinking into the room" illusion**:

1. **User scrolls** the editorial overlay
2. **JavaScript reads** scroll position: `overlay.scrollTop`
3. **Calculates** scroll progress: `scrollProgress = scrollTop / maxScroll` (0 to 1)
4. **Updates Three.js uniforms:**
   - `uScrollOffset` — Vertical offset for parallax (0 to 0.5)
   - `uScrollVignette` — Vignette fade effect (0 to 0.3)
   - `uScrollChroma` — Chromatic aberration effect (0 to 0.1)
5. **Shader applies** depth-weighted effects to canvas background
6. **Result:** Foreground pixels sink DOWN, background pixels shift UP

### The Shader Effect

The Three.js shader uses **depth-weighted counter-motion**:

```glsl
float scrollWeight = d + 0.5; // Normalized 0.0 to 1.0 (foreground to background)
float backCounterShift = (1.0 - scrollWeight) * -0.08; // Back wall shifts slightly UP
float foreSinkingShift = scrollWeight * 0.25;           // Furniture sinks DOWN (aggressive)
float totalVerticalShift = (foreSinkingShift + backCounterShift) * uScrollOffset;

return uv + offset + vec2(0.0, totalVerticalShift);
```

**What this means:**
- **Foreground objects** (furniture, close elements) sink DOWN as user scrolls
- **Background objects** (walls, far elements) shift slightly UP
- **Result:** Creates a 3D "sinking" sensation as if the user is descending into the room

### Performance Optimization

To avoid forcing layout on every frame:

1. **Cache on entry:** When `enterEditorialMode()` is called, cache:
   - `editorialOverlayEl` — the overlay element
   - `editorialMaxScroll` — `scrollHeight - clientHeight`
2. **Per-frame read:** Only read `scrollTop` (cheap property, no layout)
3. **Lerp smoothly:** Lerp toward target at factor `0.1` for smooth animation
4. **Clear on exit:** When `exitEditorialMode()` is called, clear cached values
5. **Decay on reset:** When exiting editorial mode, `editorialScrollProgress *= 0.85` each frame for smooth reset

### Code Example

```javascript
// On enter editorial mode
function enterEditorialMode(roomKey, triggerEl) {
  // ... other code ...
  cacheEditorialOverlay(); // Cache overlay element and maxScroll
}

// Per-frame animation loop
function animate() {
  if (immersiveState.mode === 'editorial' && editorialOverlayEl) {
    var scrollTop = editorialOverlayEl.scrollTop;
    var scrollProgress = editorialMaxScroll > 0 ? scrollTop / editorialMaxScroll : 0;
    
    // Lerp toward target
    editorialScrollProgress += (scrollProgress - editorialScrollProgress) * 0.1;
    
    // Update shader uniform
    if (uniforms && uniforms.uScrollOffset) {
      uniforms.uScrollOffset.value = editorialScrollProgress * 0.5;
      uniforms.uScrollVignette.value = editorialScrollProgress * 0.3;
      uniforms.uScrollChroma.value = editorialScrollProgress * 0.1;
    }
  } else if (immersiveState.mode !== 'editorial') {
    // Decay on exit
    editorialScrollProgress *= 0.85;
  }
}

// On exit editorial mode
function exitEditorialMode() {
  // ... other code ...
  editorialOverlayEl = null;
  editorialMaxScroll = null;
}
```

---

## Scroll Parallax Effect (Original)

### How It Works

1. **User scrolls** the editorial overlay
2. **JavaScript reads** scroll position: `overlay.scrollTop`
3. **Calculates** scroll progress: `scrollProgress = scrollTop / maxScroll`
4. **Updates Three.js uniforms:**
   - `uScrollOffset` — Vertical offset for parallax
   - `uScrollVignette` — Vignette fade effect
   - `uScrollChroma` — Chromatic aberration effect
5. **Shader applies** effects to canvas background
6. **Result:** Canvas background moves subtly as user scrolls editorial

### Code Example

```javascript
function handleEditorialScroll() {
  var overlay = document.getElementById('immersive-editorial-overlay');
  if (!overlay) return;
  
  var scrollTop = overlay.scrollTop;
  var maxScroll = overlay.scrollHeight - overlay.clientHeight;
  var scrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
  
  if (uniforms && uniforms.uScrollOffset) {
    uniforms.uScrollOffset.value = scrollProgress * 0.5; // 0 to 0.5
    uniforms.uScrollVignette.value = scrollProgress * 0.3; // 0 to 0.3
    uniforms.uScrollChroma.value = scrollProgress * 0.1; // 0 to 0.1
  }
}

overlay.addEventListener('scroll', handleEditorialScroll);
```

---

## View Transition Animation — Hotspot Morph

### How It Works

When entering editorial mode, the browser's **View Transition API** creates a smooth morph animation from the clicked hotspot to the editorial overlay:

1. **User clicks hotspot** (e.g., "Explore Designers")
2. **`enterEditorialMode(roomKey, triggerEl)` is called** with the hotspot element
3. **Browser captures** both elements' positions and sizes
4. **Assigns transition names:**
   - Hotspot: `view-transition-name: 'editorial-morph'`
   - Overlay: `view-transition-name: 'editorial-morph'`
5. **Browser animates** from hotspot position → overlay position
6. **Transition completes** and names are cleared

### Code Example

```javascript
function enterEditorialMode(roomKey, triggerEl) {
  // ... fetch editorial HTML ...
  
  var startTransition = function () {
    if (document.startViewTransition && triggerEl) {
      // Assign names inside the transition callback so the browser never sees
      // two elements with the same name simultaneously (avoids InvalidStateError)
      var transition = document.startViewTransition(function () {
        triggerEl.style.viewTransitionName = 'editorial-morph';
        overlay.style.viewTransitionName = 'editorial-morph';
        performUIActivation(); // Show overlay
      });
      
      // Clear names after transition finishes
      transition.finished.finally(function () {
        if (triggerEl) triggerEl.style.viewTransitionName = '';
        overlay.style.viewTransitionName = '';
      });
    } else if (document.startViewTransition) {
      // Fallback: no trigger element, just fade in
      document.startViewTransition(function () {
        performUIActivation();
      });
    } else {
      // Fallback: no View Transition API, instant transition
      performUIActivation();
    }
  };
  
  startTransition();
}
```

### Fallback Behavior

- **Modern browsers** (Chrome 111+, Edge 111+): Smooth morph animation
- **Safari/Firefox** (no View Transition API): Instant transition (no animation)
- **Older browsers**: Instant transition

### Exit Animation

When exiting editorial mode, the overlay morphs back down into the hotspot:

```javascript
function exitEditorialMode() {
  immersiveState.mode = 'browsing';
  immersiveState.editorialRoom = null;
  
  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden', 'true');
  canvas.classList.remove('editorial-blur');
  
  // Restore focus to hotspot
  if (immersiveState.lastHotspot) {
    immersiveState.lastHotspot.focus();
  }
}
```

---

## Focus Management & Accessibility

### Focus Trap

When the editorial overlay is open:

1. **Focus is trapped** inside the overlay (Tab/Shift+Tab cycles within overlay)
2. **Escape key** closes the overlay
3. **Back button** has focus on open (via `requestAnimationFrame`)
4. **Focus is restored** to the hotspot on close

### Code Example

```javascript
function enterEditorialMode(roomKey, triggerEl) {
  // ... other code ...
  
  var backBtn = document.getElementById('immersive-editorial-back');
  if (backBtn) {
    requestAnimationFrame(function () {
      backBtn.focus(); // Move focus to back button
    });
    
    if (!backBtn._editorialBound) {
      backBtn._editorialBound = true;
      backBtn.addEventListener('click', exitEditorialMode);
    }
  }
  
  // Attach Escape key listener
  if (!overlay._onEscapeEditorial) {
    overlay._onEscapeEditorial = function (e) {
      if (e.key === 'Escape') exitEditorialMode();
    };
    overlay.addEventListener('keydown', overlay._onEscapeEditorial);
  }
}
```

### ARIA Attributes

```html
<div
  id="immersive-editorial-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="immersive-editorial-overlay-heading"
  aria-hidden="true"  <!-- Hidden until enterEditorialMode() -->
>
  <h2 id="immersive-editorial-overlay-heading" class="visually-hidden">
    Editorial Content
  </h2>
  <!-- ... content ... -->
</div>
```

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

---

## SEO & Accessibility

### SEO Considerations

- Editorial sections are **rendered in the initial HTML** (not JS-only)
- Each editorial has semantic HTML: `<section>`, `<h2>`, `<p>`, `<a>`
- Content is **crawlable** by search engines
- Canonical URLs remain clean (no query params affect canonical)

### Accessibility

- Editorial overlay has `role="dialog" aria-modal="true"`
- Back button has `aria-label`
- Focus is **trapped** in overlay (Tab cycles within overlay)
- **Escape key** closes overlay
- Focus is **restored** to hotspot on exit
- Scroll parallax respects `prefers-reduced-motion`

---

## Editorial Section Settings & Blocks

### Section-Level Settings

Each editorial section instance is configured via **Customize → Sections → Immersive Editorial**:

| Setting | Type | Default | Purpose |
|---|---|---|---|
| `room_key` | select | `featured_collections` | Which room: `designer_houses`, `occasions`, or `featured_collections` |
| `layout` | select | `collections` | Visual layout: `designers` (3-col brand tiles), `occasions` (4-col story grid), `collections` (alternating 2-col banners) |
| `hero_background_image` | image_picker | — | Full-width hero background image |
| `hero_eyebrow` | text | — | Small eyebrow label above heading |
| `hero_heading` | text | — | Main hero heading (rendered as `<h2>`) |
| `hero_subheading` | richtext | — | Hero subheading / intro copy |

### Banner Block Settings

Each editorial section supports unlimited **Banner** blocks:

| Block Setting | Type | Purpose |
|---|---|---|
| `image` | image_picker | Banner image (responsive, lazy-loaded) |
| `logo` | image_picker | Brand logo (shown in `designers` layout only) |
| `heading` | text | Banner heading (required) |
| `body` | richtext | Body copy (rich text with formatting) |
| `cta_label` | text | CTA button label |
| `cta_url` | url | CTA destination URL |
| `collection` | collection | Linked Shopify collection (shows collection title as link) |
| `depth_layer` | range 0–100 | Parallax depth weight (higher = more parallax) |

### Layout Variants

#### `designers` Layout
- **Purpose:** Showcase luxury brands with logos
- **Grid:** 3 columns on desktop, 1 column on mobile
- **Features:**
  - Brand logo overlay on image
  - Brand name as heading
  - Brand description in body
  - "Explore [Brand]" CTA
- **Used by:** Designer Houses editorial

#### `occasions` Layout
- **Purpose:** Curate collections by occasion
- **Grid:** 4 columns on desktop, 2 columns on tablet, 1 column on mobile
- **Features:**
  - Occasion image
  - Occasion name as heading
  - Occasion description in body
  - "Shop [Occasion]" CTA
- **Used by:** Occasions editorial

#### `collections` Layout
- **Purpose:** Showcase seasonal/featured collections
- **Grid:** Alternating 2-column layout on desktop, stacked on mobile
- **Features:**
  - Collection image
  - Collection name as heading
  - Collection description in body
  - "Shop [Collection]" CTA
- **Used by:** Featured Collections editorial

### CSS Classes

```
.immersive-editorial                          # Base class
.immersive-editorial--{{ room_key }}          # Room-specific (e.g., --designer_houses)
.immersive-editorial--layout-{{ layout }}     # Layout-specific (e.g., --layout-designers)
.immersive-editorial__hero                    # Hero section
.immersive-editorial__hero-bg                 # Hero background image
.immersive-editorial__hero-panel              # Hero text panel
.immersive-editorial__eyebrow                 # Hero eyebrow
.immersive-editorial__heading                 # Hero heading
.immersive-editorial__subheading              # Hero subheading
.immersive-editorial__banners                 # Banners container
.immersive-editorial__banner                  # Individual banner
.immersive-editorial__banner-media            # Banner image
.immersive-editorial__banner-logo             # Brand logo (designers layout)
.immersive-editorial__banner-content          # Banner text content
.immersive-editorial__banner-heading          # Banner heading
.immersive-editorial__banner-body             # Banner body text
.immersive-editorial__cta                     # CTA button
.immersive-editorial__collection-link         # Collection link
```

### Important Notes

**Theme Editor Blocks:** Shopify ignores block definitions in `page.immersive.json` after the theme has been opened in the theme editor. Banner blocks must be added manually via:

**Customize → Home page → Immersive Editorial → Add Banner**

This must be done for each of the three editorial sections (Designer Houses, Occasions, Featured Collections).

**Section Instance IDs:** Each editorial section has a unique instance ID (e.g., `immersive_editorial_abc123`). When a user clicks an editorial hotspot, `enterEditorialMode()` reads this ID from `data-section-id` and uses it to fetch the section via Section Rendering API:

```liquid
<section
  id="immersive-editorial-{{ room_key }}"
  data-room-key="designer_houses"
  data-section-id="{{ section.id }}"  <!-- ← Shopify instance ID -->
>
  <!-- ... content ... -->
</section>
```

---

**When explaining these three editorial pages to a Three.js/Vibe coding tool, emphasize:**

1. **Three editorial rooms** tied to three Liquid sections (Designer Houses, Occasions, Featured Collections)
2. **Hotspots in the Lounge room** trigger editorial mode via `enterEditorialMode(roomKey)`
3. **Section Rendering API** fetches the editorial HTML dynamically
4. **View Transition animation** morphs hotspot → overlay
5. **Scroll parallax** effect: canvas background moves as user scrolls editorial
6. **Exit via back button or Escape** returns to 3D browsing mode
7. **CTAs in editorial** can open collection panels or navigate to 2D pages
8. **State management** tracks mode (browsing vs editorial) and current room

**Key files:**
- `sections/immersive-editorial.liquid` — Reusable editorial section
- `assets/immersive-store.js` — `enterEditorialMode()`, `exitEditorialMode()`, `updateCameraForMode()`
- `sections/immersive-canvas.liquid` — Hotspot definitions with `targetEditorialRoom`

---

## Example: Adding a Fourth Editorial

To add a fourth editorial (e.g., "Collaborations"):

1. **Add room to STORE_ROOMS** in `immersive-canvas.liquid`:
   ```javascript
   "collaborations": {
     "baseTextureUrl": "...",
     "hotspots": [
       { x: 50, y: 15, label: "Our Collaborations", targetEditorialRoom: "collaborations" },
       // ... other hotspots
     ]
   }
   ```

2. **Add hotspot to Lounge** that links to collaborations room

3. **Create editorial section instance** in `templates/page.immersive.json`:
   ```json
   {
     "type": "immersive-editorial",
     "settings": {
       "room_key": "collaborations",
       "layout": "collections",
       "hero_heading": "Our Collaborations"
     }
   }
   ```

4. **Three.js automatically handles** the rest via `enterEditorialMode('collaborations')`

---

**That's it!** The three editorial pages are a elegant blend of Three.js state management, Liquid templating, and the Section Rendering API.
