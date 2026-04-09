# Design Document: immersive-editorial

## Overview

The immersive-editorial feature adds a per-room "living editorial" layer to the Shahana Collection immersive store. Each of the three destination rooms (`designer_houses`, `occasions`, `featured_collections`) gets a dedicated editorial section rendered in Liquid/DOM — a hero area plus a series of content banners with scroll parallax — that sits below the Three.js canvas and is reached by clicking an editorial hotspot inside the room.

The feature has two deliverables:

1. **`sections/immersive-editorial.liquid`** — a single reusable Shopify OS 2.0 section, parameterised by `room_key` and `layout`, that powers all three room editorials.
2. **Extensions to `assets/immersive-store.js`** — `immersiveState` object, editorial hotspots in `STORE_ROOMS`, updated hotspot click handler, `enterEditorialMode()`, `updateCameraForMode()`, and analytics.

The design principle is strict separation: Three.js owns world, depth, camera, and motion; Liquid/DOM owns all editorial copy, images, and CTAs.


## Architecture

### Component Relationship

```
┌─────────────────────────────────────────────────────────────────┐
│  page.immersive.json  (JSON template)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sections/immersive-canvas.liquid                        │   │
│  │  • <canvas id="immersive-canvas">                        │   │
│  │  • <div id="ui-layer">  ← hotspot buttons injected here  │   │
│  │  • immersive-rooms-config JSON block                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sections/immersive-editorial.liquid  (×3 instances)     │   │
│  │  id="immersive-editorial-designer_houses"                │   │
│  │  id="immersive-editorial-occasions"                      │   │
│  │  id="immersive-editorial-featured_collections"           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  sections/glass-panel.liquid  (dialog shell)             │   │
│  │  • openCollectionPanel() / openProductPanel() targets    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

assets/immersive-store.js
  STORE_ROOMS  ──► hotspots[] with targetEditorialRoom
  immersiveState  { currentRoom, mode, editorialRoom }
  enterEditorialMode(roomKey)  ──► scrollIntoView(#immersive-editorial-{roomKey})
  updateCameraForMode()  ──► adjusts camera.fov + parallaxStrength
```

### Data Flow

1. Merchant places three `immersive-editorial` section instances on `page.immersive.json`, each with a different `room_key`.
2. On page load, `immersive-store.js` initialises the Three.js scene and renders hotspots for the current room.
3. Each destination room (`designer_houses`, `occasions`, `featured_collections`) has one editorial hotspot with `targetEditorialRoom` set.
4. When a shopper clicks an editorial hotspot, `renderHotspots` fires the click handler, which detects `targetEditorialRoom` first and calls `enterEditorialMode(roomKey)`.
5. `enterEditorialMode` updates `immersiveState`, calls `updateCameraForMode()` (subtle FOV/parallax shift), then scrolls to `#immersive-editorial-{roomKey}` using `document.startViewTransition` when available.
6. The editorial section is already in the DOM — no fetch required. The scroll brings it into view.
7. The section's `{% javascript %}` block drives scroll parallax independently per instance.


## Components and Interfaces

### 1. `sections/immersive-editorial.liquid`

#### Root Element

```html
<section
  id="immersive-editorial-{{ section.settings.room_key | escape }}"
  class="immersive-editorial
         immersive-editorial--{{ section.settings.room_key | escape }}
         immersive-editorial--layout-{{ section.settings.layout | escape }}"
  data-room-key="{{ section.settings.room_key | escape }}"
  data-layout="{{ section.settings.layout | escape }}"
  data-section-id="{{ section.id }}"
>
```

`room_key` is enforced via schema `default` and `options` — it should never be blank in practice. No blank-guard is needed in Liquid; rely on schema defaults instead.

#### Hero Area

```html
<div class="immersive-editorial__hero">
  {% if section.settings.hero_background_image %}
    <img
      class="immersive-editorial__hero-bg"
      src="{{ section.settings.hero_background_image | image_url: width: 1600 }}"
      srcset="
        {{ section.settings.hero_background_image | image_url: width: 800 }} 800w,
        {{ section.settings.hero_background_image | image_url: width: 1200 }} 1200w,
        {{ section.settings.hero_background_image | image_url: width: 1600 }} 1600w
      "
      sizes="100vw"
      width="{{ section.settings.hero_background_image.width }}"
      height="{{ section.settings.hero_background_image.height }}"
      alt="{{ section.settings.hero_background_image.alt | escape }}"
      loading="lazy"
      aria-hidden="true"
    >
  {% endif %}
  <div class="immersive-editorial__hero-panel">
    {% if section.settings.hero_eyebrow != blank %}
      <p class="immersive-editorial__eyebrow">{{ section.settings.hero_eyebrow | escape }}</p>
    {% endif %}
    {% if section.settings.hero_heading != blank %}
      <h2 class="immersive-editorial__heading">{{ section.settings.hero_heading | escape }}</h2>
    {% endif %}
    {% if section.settings.hero_subheading != blank %}
      <div class="immersive-editorial__subheading">{{ section.settings.hero_subheading }}</div>
    {% endif %}
  </div>
</div>
```

#### Banner Blocks

```html
<div class="immersive-editorial__banners">
  {% for block in section.blocks %}
    <article
      class="immersive-editorial__banner"
      data-editorial-layer="{{ block.settings.depth_layer }}"
      {{ block.shopify_attributes }}
    >
      {% if block.settings.image %}
        <div class="immersive-editorial__banner-media">
          <img
            src="{{ block.settings.image | image_url: width: 1200 }}"
            srcset="
              {{ block.settings.image | image_url: width: 600 }} 600w,
              {{ block.settings.image | image_url: width: 900 }} 900w,
              {{ block.settings.image | image_url: width: 1200 }} 1200w
            "
            sizes="(max-width: 768px) 100vw, 50vw"
            width="{{ block.settings.image.width }}"
            height="{{ block.settings.image.height }}"
            alt="{{ block.settings.image.alt | escape }}"
            loading="lazy"
          >
          {% if section.settings.layout == 'designers' and block.settings.logo %}
            <img
              class="immersive-editorial__banner-logo"
              src="{{ block.settings.logo | image_url: width: 300 }}"
              width="{{ block.settings.logo.width }}"
              height="{{ block.settings.logo.height }}"
              alt="{{ block.settings.logo.alt | escape }}"
              loading="lazy"
            >
          {% endif %}
        </div>
      {% endif %}
      <div class="immersive-editorial__banner-content">
        <h3 class="immersive-editorial__banner-heading">{{ block.settings.heading | escape }}</h3>
        {% if block.settings.body != blank %}
          <div class="immersive-editorial__banner-body">{{ block.settings.body }}</div>
        {% endif %}
        {% if block.settings.cta_label != blank and block.settings.cta_url != blank %}
          <a
            class="immersive-editorial__cta"
            href="{{ block.settings.cta_url }}"
          >{{ block.settings.cta_label | escape }}</a>
        {% endif %}
        {% if block.settings.collection != blank %}
          <a
            class="immersive-editorial__collection-link"
            href="{{ block.settings.collection.url }}"
          >{{ block.settings.collection.title | escape }}</a>
        {% endif %}
      </div>
    </article>
  {% endfor %}
</div>
```

#### Schema Shape

```json
{
  "name": "t:sections.immersive_editorial.name",
  "settings": [
    { "type": "select", "id": "room_key", "default": "featured_collections", "label": "t:sections.immersive_editorial.settings.room_key.label",
      "options": [
        { "value": "designer_houses", "label": "t:sections.immersive_editorial.settings.room_key.options.designer_houses" },
        { "value": "occasions",       "label": "t:sections.immersive_editorial.settings.room_key.options.occasions" },
        { "value": "featured_collections", "label": "t:sections.immersive_editorial.settings.room_key.options.featured_collections" }
      ]
    },
    { "type": "select", "id": "layout", "default": "collections",
      "label": "t:sections.immersive_editorial.settings.layout.label",
      "options": [
        { "value": "designers",   "label": "t:sections.immersive_editorial.settings.layout.options.designers" },
        { "value": "collections", "label": "t:sections.immersive_editorial.settings.layout.options.collections" },
        { "value": "occasions",   "label": "t:sections.immersive_editorial.settings.layout.options.occasions" }
      ]
    },
    { "type": "image_picker", "id": "hero_background_image", "label": "t:sections.immersive_editorial.settings.hero_background_image.label" },
    { "type": "text",         "id": "hero_eyebrow",          "label": "t:sections.immersive_editorial.settings.hero_eyebrow.label" },
    { "type": "text",         "id": "hero_heading",          "label": "t:sections.immersive_editorial.settings.hero_heading.label" },
    { "type": "richtext",     "id": "hero_subheading",       "label": "t:sections.immersive_editorial.settings.hero_subheading.label" }
  ],
  "blocks": [
    {
      "type": "banner",
      "name": "t:sections.immersive_editorial.blocks.banner.name",
      "settings": [
        { "type": "image_picker", "id": "image",       "label": "t:sections.immersive_editorial.blocks.banner.settings.image.label" },
        { "type": "image_picker", "id": "logo",        "label": "t:sections.immersive_editorial.blocks.banner.settings.logo.label" },
        { "type": "text",         "id": "heading",     "label": "t:sections.immersive_editorial.blocks.banner.settings.heading.label" },
        { "type": "richtext",     "id": "body",        "label": "t:sections.immersive_editorial.blocks.banner.settings.body.label" },
        { "type": "text",         "id": "cta_label",   "label": "t:sections.immersive_editorial.blocks.banner.settings.cta_label.label" },
        { "type": "url",          "id": "cta_url",     "label": "t:sections.immersive_editorial.blocks.banner.settings.cta_url.label" },
        { "type": "collection",   "id": "collection",  "label": "t:sections.immersive_editorial.blocks.banner.settings.collection.label" },
        { "type": "range", "id": "depth_layer", "min": 0, "max": 100, "step": 5, "default": 50,
          "label": "t:sections.immersive_editorial.blocks.banner.settings.depth_layer.label" }
      ]
    }
  ],
  "presets": [
    {
      "name": "t:sections.immersive_editorial.presets.default.name",
      "settings": { "room_key": "featured_collections", "layout": "collections" },
      "blocks": [
        { "type": "banner", "settings": { "heading": "Collection One", "depth_layer": 30 } },
        { "type": "banner", "settings": { "heading": "Collection Two", "depth_layer": 50 } },
        { "type": "banner", "settings": { "heading": "Collection Three", "depth_layer": 70 } }
      ]
    }
  ]
}
```


### 2. `assets/immersive-store.js` Extensions

#### `immersiveState` Object

Declared at module scope, immediately after the existing `var contentCache = {}` line:

```javascript
var immersiveState = {
  currentRoom: 'storefront',  // mirrors currentRoomKey; updated in goToRoom
  mode: 'showroom',           // 'showroom' | 'editorial'
  editorialRoom: null         // null | 'designer_houses' | 'occasions' | 'featured_collections'
};
```

`goToRoom` is updated to keep `immersiveState.currentRoom` in sync:

```javascript
// inside goToRoom(), after saveState():
immersiveState.currentRoom = roomKey;
immersiveState.mode = 'showroom';
immersiveState.editorialRoom = null;
```

#### Editorial Hotspot Additions to `STORE_ROOMS`

One hotspot added to each destination room's `hotspots` array. Existing hotspots are untouched:

```javascript
// designer_houses.hotspots — append:
{ x: 50, y: 15, label: 'Our Designers', targetEditorialRoom: 'designer_houses' }

// occasions.hotspots — append:
{ x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' }

// featured_collections.hotspots — append:
{ x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' }
```

`mergeDynamicRoomConfig` only overwrites scalar fields (`baseTextureUrl`, `depthMapUrl`, etc.) and never touches the `hotspots` array, so programmatic editorial hotspots survive the merge.

#### Updated Hotspot Click Handler (inside `renderHotspots`)

The existing click handler gains a first branch for `targetEditorialRoom`:

```javascript
button.addEventListener('click', function () {
  var details = { room_key: roomKey, hotspot_label: hotspot.label };
  if (hotspot.targetEditorialRoom) {
    details.target_type = 'editorial';
    details.target_editorial_room = hotspot.targetEditorialRoom;
    trackImmersiveEvent('hotspot_clicked', details);
    enterEditorialMode(hotspot.targetEditorialRoom);
    return;                          // ← early return; no other branch executes
  }
  if (hotspot.targetRoom) {
    details.target_type = 'room';
    details.target_room_key = hotspot.targetRoom;
    trackImmersiveEvent('hotspot_clicked', details);
    goToRoom(hotspot.targetRoom);
  } else if (hotspot.targetCollection) {
    details.target_type = 'collection';
    details.target_collection_handle = hotspot.targetCollection;
    trackImmersiveEvent('hotspot_clicked', details);
    openCollectionPanel(hotspot.targetCollection);
  }
});
```

#### `enterEditorialMode(roomKey)`

```javascript
function enterEditorialMode(roomKey) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  updateCameraForMode();

  trackImmersiveEvent('editorial_entered', { room: roomKey });

  var target = document.getElementById('immersive-editorial-' + roomKey);
  if (!target) {
    console.warn('[Immersive] Editorial section not found for room:', roomKey);
    return;
  }

  if (!reduceMotion && document.startViewTransition) {
    document.startViewTransition(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } else if (reduceMotion) {
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

#### `updateCameraForMode()`

The camera in `immersive-store.js` is a `THREE.OrthographicCamera` — `fov` is not a meaningful property on it and setting it has no visual effect. The real per-mode tuning knob is `uniforms.uParallaxStrength.value`, which the shader reads on every frame. `camera.fov` and `camera.updateProjectionMatrix()` are **not** used here; they are left as a future hook if the camera is ever switched to `PerspectiveCamera`.

```javascript
function updateCameraForMode() {
  if (!camera) return;   // null guard (Req 15.5)

  var strength;

  if (immersiveState.mode === 'editorial') {
    switch (immersiveState.editorialRoom) {
      case 'designer_houses':      strength = 0.10; break;
      case 'occasions':            strength = 0.09; break;
      case 'featured_collections': strength = 0.11; break;
      default:                     strength = isMobileDevice() ? 0.03 : 0.08; break;
    }
  } else {
    strength = isMobileDevice() ? 0.03 : 0.08;
  }

  if (uniforms && uniforms.uParallaxStrength) {
    uniforms.uParallaxStrength.value = strength;
  }
  // If camera is later switched to PerspectiveCamera, add camera.fov + camera.updateProjectionMatrix() here.
}
```

`parallaxStrength` (the module-level var) is not mutated; `uniforms.uParallaxStrength.value` is updated directly so the shader picks it up on the next frame without affecting the default used by `goToRoom`.


## Data Models

### `immersiveState`

| Field | Type | Default | Description |
|---|---|---|---|
| `currentRoom` | `string` | `'storefront'` | The active room key; mirrors `currentRoomKey` |
| `mode` | `'showroom' \| 'editorial'` | `'showroom'` | Current experience mode |
| `editorialRoom` | `string \| null` | `null` | Room key of the active editorial, or null |

### Hotspot Object (extended)

Existing fields: `x`, `y`, `label`, `targetRoom?`, `targetCollection?`, `mobileX?`, `mobileY?`

New field:

| Field | Type | Description |
|---|---|---|
| `targetEditorialRoom` | `string \| undefined` | Room key to enter editorial mode for. Mutually exclusive with `targetRoom` and `targetCollection`. |

### Banner Block Settings

| Setting ID | Type | Required | Description |
|---|---|---|---|
| `image` | image_picker | No | Main banner image |
| `logo` | image_picker | No | Brand logo (used in `designers` layout) |
| `heading` | text | Yes | Banner heading (`<h3>`) |
| `body` | richtext | No | Body copy |
| `cta_label` | text | No | CTA button text |
| `cta_url` | url | No | CTA destination |
| `collection` | collection | No | Linked Shopify collection |
| `depth_layer` | range 0–100 | No | Parallax depth weight; default 50 |

### Locale Key Structure (`sections.immersive_editorial.*`)

```json
"sections": {
  "immersive_editorial": {
    "name": "Immersive Editorial",
    "settings": {
      "room_key": {
        "label": "Room",
        "options": {
          "designer_houses": "Designer Houses",
          "occasions": "Occasions",
          "featured_collections": "Featured Collections"
        }
      },
      "layout": {
        "label": "Layout",
        "options": {
          "designers": "Designer tiles",
          "collections": "Collection banners",
          "occasions": "Story segments"
        }
      },
      "hero_background_image": { "label": "Hero background image" },
      "hero_eyebrow":          { "label": "Eyebrow text" },
      "hero_heading":          { "label": "Hero heading" },
      "hero_subheading":       { "label": "Hero subheading" }
    },
    "blocks": {
      "banner": {
        "name": "Banner",
        "settings": {
          "image":       { "label": "Image" },
          "logo":        { "label": "Brand logo" },
          "heading":     { "label": "Heading" },
          "body":        { "label": "Body" },
          "cta_label":   { "label": "Button label" },
          "cta_url":     { "label": "Button link" },
          "collection":  { "label": "Collection" },
          "depth_layer": { "label": "Parallax depth" }
        }
      }
    },
    "presets": {
      "default": { "name": "Immersive Editorial" }
    }
  }
}
```

Keys reused from Dawn (no duplication): `accessibility.close`, `products.product.buy_now`.

### LiquidDoc Block

`immersive-editorial.liquid` must open with a `{% doc %}` block:

```liquid
{% doc %}
  Renders a per-room "living editorial" for the immersive store.

  One instance per room — configure `room_key` to bind it to a room.
  `immersive-store.js` scrolls to this section via `id="immersive-editorial-{room_key}"`.

  @setting {select} room_key - Immersive room this editorial belongs to (designer_houses | occasions | featured_collections).
  @setting {select} layout   - Visual layout variant (designers | collections | occasions).
  @setting {image_picker} hero_background_image - Full-width hero background.
  @setting {text}         hero_eyebrow          - Small eyebrow label above the heading.
  @setting {text}         hero_heading          - Main hero heading (rendered as <h2>).
  @setting {richtext}     hero_subheading       - Hero subheading / intro copy.

  @block {banner} - One editorial banner tile. Add one per collection, designer, or occasion.
    @setting {image_picker} image       - Banner image.
    @setting {image_picker} logo        - Brand logo (shown in designers layout only).
    @setting {text}         heading     - Banner heading (required).
    @setting {richtext}     body        - Body copy.
    @setting {text}         cta_label   - CTA button label.
    @setting {url}          cta_url     - CTA destination URL.
    @setting {collection}   collection  - Linked Shopify collection (shows "View collection" link).
    @setting {range}        depth_layer - Parallax depth weight 0–100 (higher = more movement).
{% enddoc %}
```


## CSS Architecture

All editorial CSS lives inside a `{% stylesheet %}` block in `immersive-editorial.liquid`. No global asset file is modified.

### BEM Structure

```
.immersive-editorial                    ← section root
  .immersive-editorial--{room_key}      ← room modifier (designer_houses, occasions, featured_collections)
  .immersive-editorial--layout-{layout} ← layout modifier (designers, collections, occasions)

  .immersive-editorial__hero            ← hero wrapper
    .immersive-editorial__hero-bg       ← background <img> (position: absolute, object-fit: cover)
    .immersive-editorial__hero-panel    ← glassmorphism panel over hero
      .immersive-editorial__eyebrow     ← <p> eyebrow text
      .immersive-editorial__heading     ← <h2>
      .immersive-editorial__subheading  ← richtext <div>

  .immersive-editorial__banners         ← banner grid wrapper
    .immersive-editorial__banner        ← <article> per block
      .immersive-editorial__banner-media    ← image container
        .immersive-editorial__banner-logo   ← logo overlay (designers layout)
      .immersive-editorial__banner-content  ← text + CTA
        .immersive-editorial__banner-heading ← <h3>
        .immersive-editorial__banner-body    ← richtext
        .immersive-editorial__cta            ← <a> CTA
        .immersive-editorial__collection-link ← <a> collection
```

### Glassmorphism Tokens

```css
/* Hero panel */
.immersive-editorial__hero-panel {
  background: rgba(10, 15, 30, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 1rem;
}

/* Banner content */
.immersive-editorial__banner-content {
  background: rgba(10, 15, 30, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 175, 55, 0.15);
}

/* Gold accent */
.immersive-editorial__heading,
.immersive-editorial__banner-heading,
.immersive-editorial__cta {
  color: #d4af37;
}
```

### Responsive Layout

- Mobile (< 768 px): single column, banners stacked vertically.
- Desktop (≥ 768 px): alternating two-column layout for `collections` and `occasions`; three-column grid for `designers`.
- Layout modifiers (`.immersive-editorial--layout-designers`) override the grid template.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .immersive-editorial *,
  .immersive-editorial *::before,
  .immersive-editorial *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Scroll Parallax JavaScript Design

The `{% javascript %}` block runs once per page load. It uses `data-section-id` to scope each instance independently.

```
┌─ initEditorialParallax(sectionId) ─────────────────────────────┐
│  root = document.getElementById('immersive-editorial-' + ...)  │
│  layers = root.querySelectorAll('[data-editorial-layer]')       │
│  scrollTarget = 0                                               │
│  scrollCurrent = 0                                              │
│  rafPending = false                                             │
│                                                                 │
│  window 'scroll' → scrollTarget = window.scrollY               │
│                    if !rafPending → requestAnimationFrame(tick) │
│                                                                 │
│  tick():                                                        │
│    rafPending = false                                           │
│    scrollCurrent += (scrollTarget - scrollCurrent) * 0.08      │
│    rect = root.getBoundingClientRect()                          │
│    viewportH = window.innerHeight                               │
│    progress = clamp(                                            │
│      (rect.top + rect.height / 2 - viewportH / 2) / viewportH, │
│      -1, 1                                                      │
│    )                                                            │
│    layers.forEach(el →                                          │
│      depth = parseInt(el.dataset.editorialLayer) / 100         │
│      el.style.transform = translateY(progress * depth * 40px)  │
│    )                                                            │
└────────────────────────────────────────────────────────────────┘
```

Key design decisions:
- **No scrolljacking**: `transform: translateY` only; `scrollTop` is never written.
- **Progress formula**: `(rect.top + rect.height/2 - viewportH/2) / viewportH` — progress is 0 when the section's midpoint is at the viewport's midpoint, negative when scrolled past, positive when approaching. This avoids double-counting scroll by using `getBoundingClientRect()` directly rather than mixing `scrollY` into the position calculation.
- **Lerp factor 0.08**: matches the existing `lerpFactor` in `immersive-store.js` for visual consistency. The lerp smooths the `scrollCurrent` value used for any secondary easing; the primary progress is computed fresh from `getBoundingClientRect()` each frame.
- **Max offset 40 px**: keeps parallax subtle; depth_layer 0–100 maps to 0–40 px.
- **`prefers-reduced-motion` guard**: checked once at init; if true, the scroll listener is never attached.
- **Instance isolation**: each call to `initEditorialParallax` closes over its own `root`, `layers`, `scrollTarget`, and `scrollCurrent` — no shared state between instances.
- **Re-init on `shopify:section:load`**: the `{% javascript %}` block listens for `shopify:section:load` and `shopify:section:select` events, re-running `initEditorialParallax` for the affected section id.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Root element identity

*For any* valid `room_key` string and `layout` string, the rendered root element must have:
- `id` equal to `"immersive-editorial-" + room_key`
- class list containing `immersive-editorial`, `immersive-editorial--{room_key}`, and `immersive-editorial--layout-{layout}`
- `data-room-key` attribute equal to `room_key`
- `data-layout` attribute equal to `layout`

**Validates: Requirements 1.1, 1.2, 1.3**

---

### Property 2: Hero conditional rendering

*For any* combination of `hero_background_image` (set or blank), `hero_eyebrow` (set or blank), `hero_heading` (set or blank), and `hero_subheading` (set or blank), the rendered hero panel must contain exactly the elements that correspond to non-blank settings and omit elements for blank settings. Specifically: if `hero_heading` is blank, no `<h2>` element appears anywhere in the output.

**Validates: Requirements 3.2, 3.3, 3.4**

---

### Property 3: Banner count matches block count

*For any* list of N banner blocks (including N = 0), the rendered `immersive-editorial__banners` wrapper must contain exactly N `<article>` elements.

**Validates: Requirement 4.1**

---

### Property 4: Banner `data-editorial-layer` reflects `depth_layer`

*For any* banner block with a `depth_layer` value D in [0, 100], the rendered `<article>` must have `data-editorial-layer` equal to the string representation of D.

**Validates: Requirement 4.2**

---

### Property 5: Banner conditional content

*For any* banner block, the rendered `<article>` must contain:
- a `banner-media` div with `<img>` if and only if `image` is set
- a logo `<img>` inside `banner-media` if and only if `layout == 'designers'` AND `logo` is set
- a `banner-body` div if and only if `body` is non-blank
- a `.immersive-editorial__cta` `<a>` if and only if both `cta_label` and `cta_url` are non-blank
- a `.immersive-editorial__collection-link` `<a>` if and only if `collection` is set

**Validates: Requirements 4.3, 4.4, 4.5, 4.6**

---

### Property 6: Parallax offset proportional to `depth_layer`

*For any* scroll progress value P in [-1, 1] and two banner elements with `depth_layer` values A and B where A ≠ B, the ratio of their computed `translateY` offsets must equal A / B (when both are non-zero). Specifically: `offset(element) = P × (depth_layer / 100) × MAX_OFFSET` where `MAX_OFFSET` is the configured maximum (40 px).

**Validates: Requirement 6.2**

---

### Property 7: Lerp converges toward target

*For any* `current` value C, `target` value T, and lerp factor F in (0, 1), applying the lerp step `C' = C + (T - C) × F` must satisfy:
- `|C' - T| < |C - T|` (distance to target strictly decreases)
- `C'` lies strictly between `C` and `T` when `C ≠ T`
- After N steps, `|C_N - T| = |C_0 - T| × (1 - F)^N`

**Validates: Requirement 6.3**

---

### Property 8: Multi-instance parallax independence

*For any* two editorial section instances with different `room_key` values and different scroll positions, the `translateY` offset computed for banners in instance A must depend only on instance A's scroll position and depth layers, and must be unaffected by instance B's state.

**Validates: Requirement 6.5**

---

### Property 9: `immersiveState.currentRoom` preserved on mode change

*For any* `currentRoom` value R, calling `enterEditorialMode(roomKey)` must leave `immersiveState.currentRoom` equal to R (unchanged). Only `mode` and `editorialRoom` are mutated.

**Validates: Requirement 9.3**

---

### Property 10: Hotspot routing — editorial branch takes priority

*For any* hotspot object:
- If `targetEditorialRoom` is set → `enterEditorialMode` is called; `goToRoom` and `openCollectionPanel` are not called.
- If only `targetRoom` is set → `goToRoom` is called; `enterEditorialMode` and `openCollectionPanel` are not called.
- If only `targetCollection` is set → `openCollectionPanel` is called; `enterEditorialMode` and `goToRoom` are not called.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

---

### Property 11: `enterEditorialMode` sets correct state

*For any* `roomKey` string, after `enterEditorialMode(roomKey)` returns:
- `immersiveState.mode === 'editorial'`
- `immersiveState.editorialRoom === roomKey`
- `trackImmersiveEvent` was called with `('editorial_entered', { room: roomKey })`

**Validates: Requirements 12.1, 12.8, 14.1**

---

### Property 12: `updateCameraForMode` maps mode/room to correct parallax strength

*For any* `(mode, editorialRoom)` pair, `updateCameraForMode()` must set `uniforms.uParallaxStrength.value` to the values specified in the design:

| mode | editorialRoom | parallaxStrength |
|---|---|---|
| `'editorial'` | `'designer_houses'` | 0.10 |
| `'editorial'` | `'occasions'` | 0.09 |
| `'editorial'` | `'featured_collections'` | 0.11 |
| `'showroom'` | any | 0.08 (desktop) / 0.03 (mobile) |

`camera.fov` is NOT set (camera is `THREE.OrthographicCamera`). When `camera` is null, the function must return without throwing.

**Validates: Requirements 13.1–13.5, 13.7, 15.5**

---

### Property 13: `mergeDynamicRoomConfig` preserves editorial hotspots

*For any* JSON config object (including one with null or missing `hotspots` fields), after `mergeDynamicRoomConfig` runs, every editorial hotspot that was present in `STORE_ROOMS` before the merge must still be present in the corresponding room's `hotspots` array after the merge.

**Validates: Requirements 10.4, 10.5**


## Error Handling

| Scenario | Handling |
|---|---|
| `enterEditorialMode` called with a `roomKey` that has no matching DOM element | Log `console.warn('[Immersive] Editorial section not found for room:', roomKey)` and return. No scroll, no throw. |
| `updateCameraForMode` called before `camera` is initialised | Early return (`if (!camera) return`). No throw. |
| `updateCameraForMode` called with unknown `editorialRoom` | Falls through to default case: fov 35, desktop parallax strength. |
| `mergeDynamicRoomConfig` receives malformed JSON | Existing `try/catch` in the IIFE swallows the error with `console.warn`. Editorial hotspots remain from the static `STORE_ROOMS` definition. |
| Parallax script runs when `[data-editorial-layer]` elements are absent | `querySelectorAll` returns empty NodeList; `forEach` is a no-op. No error. |
| `prefers-reduced-motion` is active | Parallax scroll listener is never attached; `enterEditorialMode` uses `behavior: 'auto'`; `updateCameraForMode` applies values immediately. |
| `document.startViewTransition` unavailable | Falls back to direct `scrollIntoView`. |


## Testing Strategy

### Dual Testing Approach

Unit tests cover specific examples, edge cases, and integration points. Property-based tests verify universal correctness across all inputs. Both are required.

**Property-based testing library**: `fast-check` (already in the project's `package.json`).
**Test runner**: Jest + jsdom (already configured).
**Test location**: `tests/immersive-editorial.test.js`
**Minimum iterations per property test**: 100 (fast-check default; increase to 500 for parallax math).

---

### Unit Tests (examples and edge cases)

```
immersive-editorial.liquid rendering
  ✓ renders root element with correct id, classes, data attrs for each room_key
  ✓ omits room-key modifier class when room_key is blank  [edge case: 1.4]
  ✓ omits <h2> when hero_heading is blank  [edge case: 3.4]
  ✓ omits CTA <a> when cta_url is set but cta_label is blank  [edge case: 4.6]
  ✓ schema JSON is valid and contains all required setting ids
  ✓ schema contains at least one preset with room_key=featured_collections

immersive-store.js extensions
  ✓ immersiveState object exists with correct default values  [Req 9.1]
  ✓ each destination room has exactly one editorial hotspot  [Req 10.1–10.3]
  ✓ enterEditorialMode calls updateCameraForMode  [Req 12.2]
  ✓ enterEditorialMode calls scrollIntoView with behavior:'smooth' when startViewTransition unavailable
  ✓ enterEditorialMode calls scrollIntoView with behavior:'auto' when reduceMotion is true  [edge case: 12.6]
  ✓ enterEditorialMode logs warning and does not throw when target element is null  [edge case: 12.7]
  ✓ updateCameraForMode returns without throwing when camera is null  [edge case: 15.5]
  ✓ trackImmersiveEvent is called with 'editorial_entered' and correct room  [Req 14.1]
  ✓ shopify:section:load event re-initialises parallax for the affected section
```

---

### Property-Based Tests

Each property test is tagged with a comment referencing the design property it validates.
Tag format: `// Feature: immersive-editorial, Property N: {property_text}`

```javascript
// Feature: immersive-editorial, Property 1: Root element identity
fc.assert(fc.property(
  fc.constantFrom('designer_houses', 'occasions', 'featured_collections'),
  fc.constantFrom('designers', 'collections', 'occasions'),
  (roomKey, layout) => {
    const html = renderSection({ room_key: roomKey, layout });
    const root = parseRoot(html);
    expect(root.id).toBe('immersive-editorial-' + roomKey);
    expect(root.classList).toContain('immersive-editorial');
    expect(root.classList).toContain('immersive-editorial--' + roomKey);
    expect(root.classList).toContain('immersive-editorial--layout-' + layout);
    expect(root.dataset.roomKey).toBe(roomKey);
    expect(root.dataset.layout).toBe(layout);
  }
), { numRuns: 100 });

// Feature: immersive-editorial, Property 3: Banner count matches block count
fc.assert(fc.property(
  fc.array(fc.record({ heading: fc.string(), depth_layer: fc.integer({ min: 0, max: 100 }) }), { maxLength: 10 }),
  (blocks) => {
    const html = renderSection({ blocks });
    const articles = queryAll(html, '.immersive-editorial__banner');
    expect(articles.length).toBe(blocks.length);
  }
), { numRuns: 200 });

// Feature: immersive-editorial, Property 4: data-editorial-layer reflects depth_layer
fc.assert(fc.property(
  fc.integer({ min: 0, max: 100 }),
  (depthLayer) => {
    const html = renderSection({ blocks: [{ heading: 'Test', depth_layer: depthLayer }] });
    const article = query(html, '.immersive-editorial__banner');
    expect(article.dataset.editorialLayer).toBe(String(depthLayer));
  }
), { numRuns: 100 });

// Feature: immersive-editorial, Property 6: Parallax offset proportional to depth_layer
fc.assert(fc.property(
  fc.float({ min: -1, max: 1 }),
  fc.integer({ min: 1, max: 100 }),
  fc.integer({ min: 1, max: 100 }).filter(b => b !== depthA),  // depthA from outer scope
  (progress, depthA, depthB) => {
    const offsetA = computeParallaxOffset(progress, depthA);
    const offsetB = computeParallaxOffset(progress, depthB);
    if (depthB !== 0) {
      expect(offsetA / offsetB).toBeCloseTo(depthA / depthB, 5);
    }
  }
), { numRuns: 500 });

// Feature: immersive-editorial, Property 7: Lerp converges toward target
fc.assert(fc.property(
  fc.float({ min: -1000, max: 1000 }),
  fc.float({ min: -1000, max: 1000 }),
  fc.float({ min: 0.01, max: 0.99 }),
  (current, target, factor) => {
    const next = current + (target - current) * factor;
    expect(Math.abs(next - target)).toBeLessThan(Math.abs(current - target) + Number.EPSILON);
  }
), { numRuns: 500 });

// Feature: immersive-editorial, Property 9: currentRoom preserved on mode change
fc.assert(fc.property(
  fc.constantFrom('storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'),
  fc.constantFrom('designer_houses', 'occasions', 'featured_collections'),
  (currentRoom, editorialRoom) => {
    immersiveState.currentRoom = currentRoom;
    enterEditorialMode(editorialRoom);
    expect(immersiveState.currentRoom).toBe(currentRoom);
  }
), { numRuns: 100 });

// Feature: immersive-editorial, Property 10: Hotspot routing priority
fc.assert(fc.property(
  fc.record({
    targetEditorialRoom: fc.option(fc.constantFrom('designer_houses', 'occasions', 'featured_collections')),
    targetRoom: fc.option(fc.constantFrom('lounge', 'storefront')),
    targetCollection: fc.option(fc.string({ minLength: 1 })),
    label: fc.string()
  }),
  (hotspot) => {
    const calls = simulateHotspotClick(hotspot);
    if (hotspot.targetEditorialRoom) {
      expect(calls.enterEditorialMode).toHaveBeenCalledWith(hotspot.targetEditorialRoom);
      expect(calls.goToRoom).not.toHaveBeenCalled();
      expect(calls.openCollectionPanel).not.toHaveBeenCalled();
    } else if (hotspot.targetRoom) {
      expect(calls.goToRoom).toHaveBeenCalledWith(hotspot.targetRoom);
      expect(calls.enterEditorialMode).not.toHaveBeenCalled();
    } else if (hotspot.targetCollection) {
      expect(calls.openCollectionPanel).toHaveBeenCalledWith(hotspot.targetCollection);
      expect(calls.enterEditorialMode).not.toHaveBeenCalled();
    }
  }
), { numRuns: 200 });

// Feature: immersive-editorial, Property 12: updateCameraForMode maps mode/room to correct parallax strength
fc.assert(fc.property(
  fc.constantFrom('showroom', 'editorial'),
  fc.constantFrom('designer_houses', 'occasions', 'featured_collections', null),
  (mode, editorialRoom) => {
    immersiveState.mode = mode;
    immersiveState.editorialRoom = editorialRoom;
    updateCameraForMode();
    const expected = EXPECTED_PARALLAX_SETTINGS[mode][editorialRoom] || EXPECTED_PARALLAX_SETTINGS.showroom;
    expect(uniforms.uParallaxStrength.value).toBe(expected.strength);
    // camera.fov is NOT asserted — camera is OrthographicCamera
  }
), { numRuns: 100 });

// Feature: immersive-editorial, Property 13: mergeDynamicRoomConfig preserves editorial hotspots
fc.assert(fc.property(
  fc.record({
    designer_houses: fc.option(fc.record({ baseTextureUrl: fc.option(fc.string()), hotspots: fc.constant(null) })),
    occasions: fc.option(fc.record({ baseTextureUrl: fc.option(fc.string()), hotspots: fc.constant(null) })),
    featured_collections: fc.option(fc.record({ baseTextureUrl: fc.option(fc.string()), hotspots: fc.constant(null) }))
  }),
  (config) => {
    const before = countEditorialHotspots(STORE_ROOMS);
    simulateMerge(config);
    const after = countEditorialHotspots(STORE_ROOMS);
    expect(after).toBeGreaterThanOrEqual(before);
  }
), { numRuns: 200 });
```

### Unit vs Property Balance

Unit tests handle: schema validation, specific DOM examples, event wiring, edge cases (null camera, blank room_key, missing DOM target). Property tests handle: all mathematical invariants (parallax math, lerp), all routing logic (hotspot dispatch), all state transitions (mode changes, camera mapping), and all structural rendering rules (root identity, banner count, data attributes). Together they provide comprehensive coverage without redundancy.

