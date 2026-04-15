# Glass Panel Product Open Fix — Bugfix Design

## Overview

This spec covers three interconnected bugs discovered during investigation:

1. **Glass panel product open failure** — Product cards inside the collection glass panel are not opening the product detail panel when clicked.
2. **Editorial banner layout pollution** — The `immersive-editorial__banners` block renders unconditionally for all layouts, duplicating block content underneath every room's dedicated UI.
3. **Editorial collection links missing `data-collection`** — Banner collection links inside the editorial overlay are plain `<a href>` tags with no `data-collection` attribute, causing full-page navigation instead of opening the glass panel.

All three bugs affect the core purchase and discovery flow in the immersive store at `/pages/immersive`.

---

## Glossary

- **Bug_Condition (C)**: The set of inputs that trigger the defect.
- **`openProductPanel(handle, collectionHandle)`**: Entry point in `assets/immersive-store.js` that saves state, builds the product path, and delegates to `openGlassPanelWithSection`.
- **`openGlassPanelWithSection(path, sectionId, extraParams, panelId, renderCallback)`**: Generic panel opener that calls `fetchSectionHtml` and injects the result.
- **`fetchSectionHtml(path, sectionId, extraParams)`**: Section Rendering API fetcher that builds `?sections={sectionId}` URL and parses the JSON response.
- **`fetchWithCache(url)`**: Low-level fetch helper that caches by URL and adds `X-Requested-With: XMLHttpRequest`.
- **`collectionHandle`**: Handle of the originating collection, threaded through `openProductPanel` → `extraParams` → `?collection_handle=` → `glass-product.liquid` → back button `data-collection-handle`.
- **`data-collection`**: Attribute on editorial card/link elements read by the overlay click handler to open the collection glass panel.
- **`data-collection-handle`**: Attribute on product card `<article>` elements and designer timeline `<button>` elements.
- **`glass-product`**: Section file name (`sections/glass-product.liquid`) and the JSON key returned by `?sections=glass-product`.
- **Section Rendering API**: Shopify's `?sections=` endpoint — returns `{ "section-file-name": "<html>" }`.

---

## Bug 1: Glass Panel Product Open Failure

### Bug Condition

A click on a product card (`[data-product-handle]`) inside `#glass-panel` fails to open the product detail view.

```
FUNCTION isBugCondition(input)
  INPUT: input — a DOM click event inside #glass-panel
  LET card = input.target.closest('.immersive-product-card')
             OR input.target.closest('[data-product-handle]')
  RETURN card IS NOT NULL
         AND card.getAttribute('data-product-handle') IS NOT NULL
         AND productDetailPanel DID NOT open after the click
END FUNCTION
```

### Root Cause Analysis

**Issue 1 — Click delegation on `<a>` links inside cards:**
`openCollectionPanel`'s `panel.onclick` handler checks `event.target.closest('.immersive-product-card')` and reads `data-product-handle` from the article element. However, product cards contain `<a class="immersive-product-link" href="{{ product.url }}">` and `<a class="immersive-product-title-link">` elements. If the click lands on these `<a>` elements, the browser may follow the `href` before or instead of the JS handler intercepting it. The handler calls `event.preventDefault()` after the `closest()` check — correct ordering — but the selector only matches `.immersive-product-card` (the article), not `[data-product-handle]` on the link itself.

**Issue 2 — Silent failure when `fetchSectionHtml` returns null:**
`openGlassPanelWithSection` reads `panel.getAttribute('data-msg-load-error')` for the error message. The `#glass-panel` element in `immersive-canvas.liquid` has `data-msg-load-product-error` and `data-msg-load-collection-error` — but NOT `data-msg-load-error`. When the fetch fails (e.g. section not accessible at the product URL), `fetchSectionHtml` returns `null`, `openGlassPanelWithSection` falls back to a hardcoded English string, and `closePanel(panel)` is called — making the bug appear as "nothing happens."

**Issue 3 — Missing `data-collection-handle` on product card elements:**
`snippets/immersive-product-card.liquid` does not emit `data-collection-handle` on the `<article class="immersive-product-card">` element. The collection handle is only available via JS closure in `openCollectionPanel`. This is fragile for search panels, wishlist panels, and editorial overlays where no closure provides the collection context.

**Issue 4 — `collectionHandle` flow (confirmed correct):**
`openProductPanel` passes `extraParams = { collection_handle: collectionHandle }` → `fetchSectionHtml` appends `&collection_handle={value}` → `glass-product.liquid` reads `request.params.collection_handle` → back button gets `data-collection-handle`. This chain is architecturally correct. When `collectionHandle` is null, no param is sent and the back button does not render — correct behaviour.

### Fix: `assets/immersive-store.js`

**Change 1 — Broaden product card click selector in `openCollectionPanel`:**

```javascript
// BEFORE
var card = event.target.closest('.immersive-product-card');
if (card) {
  var handle = card.getAttribute('data-product-handle');
  if (handle) {
    event.preventDefault();
    openProductPanel(handle, collectionHandle);
  }
  return;
}

// AFTER
var card = event.target.closest('.immersive-product-card, [data-product-handle]');
if (card) {
  event.preventDefault();
  var handle = card.getAttribute('data-product-handle')
    || (card.closest('.immersive-product-card') && card.closest('.immersive-product-card').getAttribute('data-product-handle'));
  if (handle) {
    openProductPanel(handle, collectionHandle);
  }
  return;
}
```

### Fix: `sections/immersive-canvas.liquid`

**Change 2 — Add `data-msg-load-error` fallback to `#glass-panel`:**

```liquid
<section
  id="glass-panel"
  ...
  data-msg-load-product-error="{{ 'sections.immersive_store.error_load_product' | t | escape }}"
  data-msg-load-collection-error="{{ 'sections.immersive_store.error_load_collection' | t | escape }}"
  data-msg-load-error="{{ 'sections.immersive_store.error_load_product' | t | escape }}"
>
```

### Fix: `snippets/immersive-product-card.liquid`

**Change 3 — Add optional `collection_handle` param and emit `data-collection-handle` on article:**

```liquid
{%- doc -%}
  ...
  @param {String} [collection_handle] - Optional originating collection handle for back-navigation
{%- enddoc -%}

<article
  class="immersive-product-card"
  data-product-handle="{{ product.handle | escape }}"
  {%- if collection_handle != blank -%}
    data-collection-handle="{{ collection_handle | escape }}"
  {%- elsif collection != blank -%}
    data-collection-handle="{{ collection.handle | escape }}"
  {%- endif -%}
>
```

### Fix: `sections/glass-panel.liquid`

**Change 4 — Pass collection handle to product card snippet:**

```liquid
{%- comment -%} BEFORE {%- endcomment -%}
{% render 'immersive-product-card', product: product %}

{%- comment -%} AFTER {%- endcomment -%}
{% render 'immersive-product-card', product: product, collection: collection, collection_handle: collection.handle %}
```

---

## Bug 2: Editorial Banner Layout Pollution

### Bug Condition

The `<div class="immersive-editorial__banners">` block in `sections/immersive-editorial.liquid` renders unconditionally — outside all `{%- if section.settings.layout == '...' -%}` guards. Every layout (`occasions`, `featured_collections`, `designers`, `gallery`) renders its own dedicated UI **plus** the banners block underneath, duplicating all block content a second time.

### Layout Rendering Map (Current — Broken)

| Layout value | Dedicated UI rendered | Banners also rendered? |
|---|---|---|
| `occasions` | `immersive-occasions` cards | YES (duplicate) |
| `featured_collections` | `immersive-featured` grid | YES (duplicate) |
| `designers` | `immersive-designers` timeline + product grid | YES (duplicate) |
| `gallery` | `immersive-editorial__gallery` cards | YES (duplicate) |
| `collections` | None (banners ARE the intended UI) | YES (correct) |

### Layout Rendering Map (Target — Fixed)

| Layout value | Dedicated UI rendered | Banners rendered? |
|---|---|---|
| `occasions` | `immersive-occasions` cards | NO |
| `featured_collections` | `immersive-featured` grid | NO |
| `designers` | `immersive-designers` timeline + product grid | NO |
| `gallery` | `immersive-editorial__gallery` cards | NO |
| `custom` | None (banners ARE the intended UI) | YES |

The `collections` layout value is renamed to `custom` to accurately reflect its purpose as a free-form banner layout.

### Fix: `sections/immersive-editorial.liquid`

**Change 5 — Gate banners block to `custom` layout only:**

```liquid
{%- comment -%} BEFORE — unconditional {%- endcomment -%}
<div class="immersive-editorial__banners">
  ...
</div>

{%- comment -%} AFTER — gated {%- endcomment -%}
{%- if section.settings.layout == 'custom' -%}
  <div class="immersive-editorial__banners">
    ...
  </div>
{%- endif -%}
```

### Schema Changes Required

**Change 6 — Update `layout` select options in `{% schema %}`:**

```json
{
  "type": "select",
  "id": "layout",
  "default": "custom",
  "label": "t:sections.immersive_editorial.settings.layout.label",
  "options": [
    { "value": "designers",           "label": "t:sections.immersive_editorial.settings.layout.options__1.label" },
    { "value": "occasions",           "label": "t:sections.immersive_editorial.settings.layout.options__2.label" },
    { "value": "featured_collections","label": "t:sections.immersive_editorial.settings.layout.options__3.label" },
    { "value": "gallery",             "label": "t:sections.immersive_editorial.settings.layout.options__4.label" },
    { "value": "custom",              "label": "t:sections.immersive_editorial.settings.layout.options__5.label" }
  ]
}
```

**Change 7 — Add layout-specific block types to `{% schema %}`:**

Currently there is only one block type (`banner`) shared across all layouts. Each layout needs its own block type with only the settings that are relevant to it:

| Block type | Used by layout | Settings |
|---|---|---|
| `banner` | `custom` | `image`, `logo`, `heading`, `body`, `cta_label`, `cta_url`, `collection`, `depth_layer` |
| `occasion_card` | `occasions` | `image`, `heading`, `body`, `collection`, `cta_url` |
| `featured_item` | `featured_collections` | `image`, `heading`, `body`, `collection`, `cta_url` |
| `designer` | `designers` | `image`, `logo`, `heading`, `body`, `collection` |
| `gallery_card` | `gallery` | `image`, `heading`, `collection`, `cta_url` |

Each block type exposes only the settings that its layout actually uses, eliminating dead settings (e.g. `depth_layer` on occasion cards, `logo` on featured items).

**Change 8 — Update `locales/en.default.schema.json`:**

Add translations for new block types and rename `options__2` label from "Collection banners" to "Custom banners":

```json
"immersive_editorial": {
  "name": "Immersive Editorial",
  "settings": {
    "room_key": {
      "label": "Room",
      "options__1": { "label": "Designer Houses" },
      "options__2": { "label": "Occasions" },
      "options__3": { "label": "Featured Collections" }
    },
    "layout": {
      "label": "Layout",
      "options__1": { "label": "Designer timeline" },
      "options__2": { "label": "Occasions" },
      "options__3": { "label": "Featured collections" },
      "options__4": { "label": "Horizontal gallery" },
      "options__5": { "label": "Custom banners" }
    },
    "hero_background_image": { "label": "Hero background image" },
    "hero_eyebrow": { "label": "Eyebrow text" },
    "hero_heading": { "label": "Hero heading" },
    "hero_subheading": { "label": "Hero subheading" }
  },
  "blocks": {
    "banner": {
      "name": "Custom banner",
      "settings": {
        "image": { "label": "Image" },
        "logo": { "label": "Brand logo" },
        "heading": { "label": "Heading" },
        "body": { "label": "Body" },
        "cta_label": { "label": "Button label" },
        "cta_url": { "label": "Button link" },
        "collection": { "label": "Collection" },
        "depth_layer": { "label": "Parallax depth" }
      }
    },
    "occasion_card": {
      "name": "Occasion",
      "settings": {
        "image": { "label": "Image" },
        "heading": { "label": "Occasion name" },
        "body": { "label": "Description" },
        "collection": { "label": "Collection" },
        "cta_url": { "label": "Override link" }
      }
    },
    "featured_item": {
      "name": "Featured collection",
      "settings": {
        "image": { "label": "Image" },
        "heading": { "label": "Collection name" },
        "body": { "label": "Description" },
        "collection": { "label": "Collection" },
        "cta_url": { "label": "Override link" }
      }
    },
    "designer": {
      "name": "Designer",
      "settings": {
        "image": { "label": "Brand image" },
        "logo": { "label": "Brand logo" },
        "heading": { "label": "Designer name" },
        "body": { "label": "Brand manifesto" },
        "collection": { "label": "Collection" }
      }
    },
    "gallery_card": {
      "name": "Gallery card",
      "settings": {
        "image": { "label": "Image" },
        "heading": { "label": "Label" },
        "collection": { "label": "Collection" },
        "cta_url": { "label": "Override link" }
      }
    }
  },
  "presets": {
    "name": "Immersive Editorial"
  }
}
```

**Change 9 — Update Liquid block iteration per layout:**

Each layout's `{%- for block in section.blocks -%}` loop must filter to its own block type:

```liquid
{%- comment -%} occasions layout {%- endcomment -%}
{%- for block in section.blocks -%}
  {%- if block.type == 'occasion_card' -%}
    ...render occasion card...
  {%- endif -%}
{%- endfor -%}

{%- comment -%} featured_collections layout {%- endcomment -%}
{%- for block in section.blocks -%}
  {%- if block.type == 'featured_item' -%}
    ...render featured item...
  {%- endif -%}
{%- endfor -%}

{%- comment -%} designers layout {%- endcomment -%}
{%- for block in section.blocks -%}
  {%- if block.type == 'designer' -%}
    ...render designer marker...
  {%- endif -%}
{%- endfor -%}

{%- comment -%} gallery layout {%- endcomment -%}
{%- for block in section.blocks -%}
  {%- if block.type == 'gallery_card' -%}
    ...render gallery card...
  {%- endif -%}
{%- endfor -%}

{%- comment -%} custom layout — banners {%- endcomment -%}
{%- if section.settings.layout == 'custom' -%}
  <div class="immersive-editorial__banners">
    {%- for block in section.blocks -%}
      {%- if block.type == 'banner' -%}
        ...render banner...
      {%- endif -%}
    {%- endfor -%}
  </div>
{%- endif -%}
```

**Change 10 — Update presets in `{% schema %}`:**

Add one preset per layout so merchants can quickly scaffold each room type:

```json
"presets": [
  {
    "name": "Designer Houses",
    "settings": { "room_key": "designer_houses", "layout": "designers" },
    "blocks": [
      { "type": "designer", "settings": { "heading": "Suffuse" } },
      { "type": "designer", "settings": { "heading": "Soraya" } },
      { "type": "designer", "settings": { "heading": "Saad Bin Shahzad" } }
    ]
  },
  {
    "name": "Occasions",
    "settings": { "room_key": "occasions", "layout": "occasions" },
    "blocks": [
      { "type": "occasion_card", "settings": { "heading": "Eid Collection" } },
      { "type": "occasion_card", "settings": { "heading": "Bridal & Mehndi" } },
      { "type": "occasion_card", "settings": { "heading": "Luxury Formals" } }
    ]
  },
  {
    "name": "Featured Collections",
    "settings": { "room_key": "featured_collections", "layout": "featured_collections" },
    "blocks": [
      { "type": "featured_item", "settings": { "heading": "Collection One" } },
      { "type": "featured_item", "settings": { "heading": "Collection Two" } },
      { "type": "featured_item", "settings": { "heading": "Collection Three" } }
    ]
  },
  {
    "name": "Custom Banners",
    "settings": { "room_key": "featured_collections", "layout": "custom" },
    "blocks": [
      { "type": "banner", "settings": { "heading": "Banner One", "depth_layer": 30 } },
      { "type": "banner", "settings": { "heading": "Banner Two", "depth_layer": 50 } }
    ]
  }
]
```

---

## Bug 3: Editorial Collection Links Missing `data-collection`

### Bug Condition

Inside `sections/immersive-editorial.liquid`, the `immersive-editorial__collection-link` rendered inside `.immersive-editorial__banner-content` is a plain `<a href="{{ block.settings.collection.url }}">` with no `data-collection` attribute.

The editorial overlay click handler in `assets/immersive-store.js` intercepts collection links by looking for `event.target.closest('[data-collection]')`. Without the attribute, the handler does not intercept the click, the browser follows the `href`, and a full-page navigation to `/collections/{handle}` occurs instead of opening the glass panel.

### Attribute Consistency Audit

| Element | Location | Has `data-collection`? | JS reads it? |
|---|---|---|---|
| `immersive-occasions__card` | `occasions` layout | YES | YES — correct |
| `immersive-featured__item` | `featured_collections` layout | YES | YES — correct |
| `immersive-editorial__gallery-card` | `gallery` layout | YES | YES — correct |
| `immersive-designers__marker` | `designers` layout | Uses `data-collection-handle` | Read by `loadTimelineCollection()` — correct |
| `immersive-editorial__collection-link` | `banner-content` (all layouts) | **NO** | **BROKEN** |
| `immersive-editorial__cta` | `banner-content` (all layouts) | NO | Intentional — free-form URL, no handle available |

### Fix: `sections/immersive-editorial.liquid`

**Change 11 — Add `data-collection` to banner collection link:**

```liquid
{%- comment -%} BEFORE {%- endcomment -%}
{%- if block.settings.collection != blank -%}
  <a class="immersive-editorial__collection-link" href="{{ block.settings.collection.url }}">
    {{- block.settings.collection.title | escape -}}
  </a>
{%- endif -%}

{%- comment -%} AFTER {%- endcomment -%}
{%- if block.settings.collection != blank -%}
  <a
    class="immersive-editorial__collection-link"
    href="{{ block.settings.collection.url }}"
    data-collection="{{ block.settings.collection.handle | escape }}"
  >
    {{- block.settings.collection.title | escape -}}
  </a>
{%- endif -%}
```

This applies to the `custom` layout banners only (after Bug 2 fix gates banners to `custom`). The same fix must be applied to any new layout-specific block templates that render collection links.

---

## Correctness Properties

**Property 1 — Product card click opens product panel:**
For any click on `[data-product-handle]` inside `#glass-panel` where the attribute is non-empty, the handler SHALL call `event.preventDefault()`, extract the handle, call `openProductPanel(handle, collectionHandle)`, and inject product HTML into `#glass-panel .immersive-store__panel-content`.

**Property 2 — Preservation of non-product-card interactions:**
For any interaction that is NOT a product card click (collection hotspot, panel close, back button, URL deep-link, search panel), the fixed code SHALL produce exactly the same behaviour as the original code.

**Property 3 — Each editorial layout renders only its own UI:**
For any `immersive-editorial` section with `layout != 'custom'`, the rendered HTML SHALL NOT contain `.immersive-editorial__banners` or any `<article class="immersive-editorial__banner">` elements.

**Property 4 — Editorial collection links open glass panel:**
For any click on `[data-collection]` inside the editorial overlay, the handler SHALL call `event.preventDefault()`, call `exitEditorialMode()`, and then call `openCollectionPanel(handle)` — no full-page navigation.

---

## Files Changed

| File | Changes |
|---|---|
| `assets/immersive-store.js` | Broaden product card click selector in `openCollectionPanel` |
| `sections/immersive-canvas.liquid` | Add `data-msg-load-error` fallback to `#glass-panel` |
| `snippets/immersive-product-card.liquid` | Add optional `collection_handle` param; emit `data-collection-handle` on article |
| `sections/glass-panel.liquid` | Pass `collection_handle` to `immersive-product-card` snippet |
| `sections/immersive-editorial.liquid` | Gate banners to `custom` layout; add layout-specific block type filtering; add `data-collection` to collection links; update schema with per-layout block types and presets |
| `locales/en.default.schema.json` | Add translations for new block types; rename layout option labels |

---

## Testing Strategy

### Exploratory (run on unfixed code to confirm bugs)

1. Click a product card inside a collection glass panel — assert `openProductPanel` is NOT called (confirms click delegation bug).
2. Click the `<a>` link inside a product card — assert `event.defaultPrevented` is false (confirms `<a>` interception gap).
3. Mock `fetchSectionHtml` to return `null` — assert panel closes silently with no error toast (confirms silent failure).
4. Render `immersive-editorial` with `layout = 'occasions'` — assert `.immersive-editorial__banners` IS present in the DOM (confirms layout pollution).
5. Click `.immersive-editorial__collection-link` inside the overlay — assert browser navigates away (confirms missing `data-collection`).

### Fix Checking

1. Click product card (article element) — assert `openProductPanel` called with correct handle and collection handle.
2. Click `<a>` inside product card — assert `event.defaultPrevented` is true and `openProductPanel` called.
3. Render `immersive-editorial` with `layout = 'occasions'` — assert `.immersive-editorial__banners` is NOT present.
4. Render `immersive-editorial` with `layout = 'custom'` — assert `.immersive-editorial__banners` IS present.
5. Click `.immersive-editorial__collection-link` — assert `openCollectionPanel` called, no navigation.

### Preservation Checking (property-based)

- Generate random collection handles → `openCollectionPanel` always fetches `?sections=glass-panel`.
- Generate random product handles → `fetchSectionHtml` always builds valid `?sections=glass-product` URL.
- Generate random click targets (close button, backdrop, back button) → `openProductPanel` never called.
- Generate random `layout` values → banners only rendered when `layout == 'custom'`.

### Integration Tests

- Open collection panel → click product card → product detail opens → click back → collection panel reopens.
- Open collection panel → click product card → product detail opens → click close → focus restored to hotspot.
- Open editorial overlay → click collection link → overlay closes → collection glass panel opens.
- URL deep-link `?open_product=handle` on page load → product panel opens, back button absent (no collection).
- Render `designers` layout → assert only `.immersive-designers` present, no `.immersive-editorial__banners`.
- Render `featured_collections` layout → assert only `.immersive-featured` present, no `.immersive-editorial__banners`.
