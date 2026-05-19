# Kiro Steering: Shahana Collection — Immersive Store

Dawn-based Shopify 2.0 theme with a Three.js-powered 3D showroom and per-room editorial experiences.

---

## 0. High-level goals

- Preserve and extend the immersive architecture: Three.js showroom with rooms, depth maps, and per-room editorial sections
- Stay fully compatible with Online Store 2.0 and Dawn: JSON templates, `{% schema %}`, `| t` translations
- Aim for Theme Store quality: performance, accessibility (WCAG 2.1+/2.2), merchant configurability
- Three.js = world, depth, camera, mood, subtle motion. Liquid/DOM = editorial content, layouts, text, interactions
- Apply `liquid-themes`, `theme-standards`, and `theme-a11y` guides automatically when touching this theme

---

## 1. Theme foundations

### Shopify 2.0 & Dawn

- Use JSON templates (`templates/*.json`) to wire sections to pages
- Use sections + blocks with proper `{% schema %}`
- Respect Dawn's architecture and naming conventions
- When in doubt about a pattern (forms, headings, grids, modals), prefer Dawn's existing pattern first

### Theme Store readiness

Every change should preserve or improve: performance, accessibility, merchant configurability, and originality.

Never introduce:
- Hard dependencies on non-Shopify 3rd-party JS libraries (except the existing Three.js asset)
- Obfuscated or deceptive code
- Features that break standard Shopify flows (cart, checkout, customer accounts)

---

## 2. Immersive architecture

### Canonical immersive URL

The immersive experience has a single canonical URL: `/pages/immersive`

| Do | Don't |
|---|---|
| Use `/pages/immersive` for all immersive links | Use `/pages/immersive-store` (legacy, incorrect) |
| Use `?open_product=`, `?open_collection=` for deep-links | Use `?view=immersive` (unnecessary, not canonical) |
| Link to `/pages/immersive?open_collection=handle` | Link to `/pages/immersive-store?view=immersive` |

**Known bugs (fixed, do not reintroduce):**
- Preference banner used `/pages/immersive-store` instead of `/pages/immersive`
- Bridge CTAs used `?view=immersive` parameter unnecessarily

### Bridge CTAs & deep-link semantics

Bridge CTAs (`snippets/immersive-bridge-btn.liquid`) connect 2D pages to the 3D store using deep-link parameters:

| Parameter | Effect | Example |
|---|---|---|
| `?open_product={handle}` | Opens product glass panel | `/pages/immersive?open_product=silk-saree` |
| `?open_collection={handle}` | Opens collection grid panel | `/pages/immersive?open_collection=suffuse` |

**Priority:** `?open_product` takes precedence over `?open_collection` when both are present

**Do:**
- Use `/pages/immersive` as the base URL
- Pass only one deep-link parameter at a time
- Let JS handle the panel opening on page load

**Don't:**
- Use `?view=immersive` — it's unnecessary
- Use `/pages/immersive-store` — it's a legacy URL
- Combine multiple `open_*` parameters (priority rules apply, but it's confusing)

### Preference banner behavior

The preference banner appears on 2D pages when `immersive_preferred_mode = '3d'` is set in localStorage:

- Written by `writeImmersivePreference()` on successful immersive scene init
- Read by inline script in `theme.liquid`
- Suppressed on `page.immersive`, `index`, and `password` templates
- CTA links to `/pages/immersive` (canonical URL)
- Dismiss removes banner from DOM and restores focus

**Known bug (fixed):** Preference banner previously linked to `/pages/immersive-store` — do not reintroduce.

### Core files — do not break without explicit instruction

- `layout/theme.liquid` — conditional asset loading
- `sections/immersive-canvas.liquid` — canvas + UI layer + fixed header + all overlay shells (glass panel, wishlist, editorial overlay, onboarding, cookie banner) + rooms config JSON; see section 9 for full detail
- `sections/glass-panel.liquid` — dialog shell; owns ARIA, focus trap, close behavior
- `sections/glass-product.liquid` — product detail rendered into glass-panel
- `sections/immersive-product-grid.liquid` — collection grid rendered into glass-panel
- `snippets/immersive-product-card.liquid` — self-contained card with `data-product-handle`
- `snippets/virtual-tryon.liquid` — VTO widget
- `assets/immersive-store.js` — Three.js engine, room management, parallax, editorial overlay, wishlist manager, cookie consent, onboarding, URL param handler, preference manager, search panel handler (deprecated)
- `assets/three.min.js` — local Three.js copy
- `assets/immersive-theme.css` — global immersive styles

### Three.js responsibility

`immersive-store.js` owns: scene init, room management, pointer parallax, room transitions, Section Rendering API fetches, analytics, focus management, caching, reduced-motion handling.

When extending `immersive-store.js`:
- Treat it as the world/motion controller, not a CMS
- Do not move editorial copy or layout into Three.js
- You may add state (`mode`, `editorialRoom`), new hotspot behaviors (`targetEditorialRoom`), or subtle camera/parallax tuning per mode

### Deprecated Functions

| Function | Status | Notes |
|---|---|---|
| `openSearchPanel(encodedQuery)` | Removed (May 2026) | Was used to open search results panel via Section Rendering API; functionality now handled by `openCollectionPanel()` with search context or direct navigation to `/search` |

### WebGL vs CSS responsibilities

| Use WebGL/Three.js for | Use CSS/DOM for |
|---|---|
| Room rendering with depth maps | UI overlays, panels, dialogs |
| Pointer-based parallax effect | Logo animations, icon transitions |
| Camera movement between rooms | Hover states, button effects |
| Texture-based room transitions | Fade/slide transitions |
| Per-room mood/atmosphere | Static decorative elements |

**Rule of thumb:** If an effect can be achieved with CSS transforms, transitions, or keyframe animations, do not use WebGL. WebGL is reserved for depth-based parallax and room rendering that cannot be replicated in CSS.

---

## 3. Per-room editorial sections

### Concept

One editorial per room (current scope):
- `designer_houses` room → designer houses editorial
- `occasions` room → occasions editorial
- `featured_collections` room → featured collections editorial

Each editorial is a "living story" tied to its room — hero + stacked banners/tiles, scroll parallax, live room background.

### `sections/immersive-editorial.liquid`

One reusable section powers all room editorials. It must be:

**Room-aware:**
- Setting `room_key`: values `designer_houses`, `occasions`, `featured_collections` (extensible)
- Root element: `id="immersive-editorial-{{ room_key }}"`, `class="immersive-editorial immersive-editorial--{{ room_key }}"`, `data-room-key="{{ room_key }}"`

**Layout-flexible:**
- Setting `layout`: `designers`, `collections`, `occasions`, `custom`
- DOM structure and CSS vary by layout via BEM modifiers (`.immersive-editorial--designers`, etc.)

**Block-driven:**
- Featured collections: "collection banner" blocks (image, heading, body, CTA, collection)
- Designer houses: "brand tile" blocks (logo, name, body, CTA, optional collection/metaobject)
- Occasions: "story segment" blocks (image/background, heading, copy, CTA)

Keep `immersive-editorial.liquid` generic and schema-driven so one file powers all room editorials.

### Three.js ↔ editorial interaction

In `STORE_ROOMS`, editorial hotspots use `targetEditorialRoom`:

```javascript
{ x: 50, y: 15, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' }
```

Hotspot click handler calls `enterEditorialMode(roomKey, triggerEl)`:

```javascript
function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  immersiveState.lastHotspot = triggerEl || null;
  updateCameraForMode();
  // Uses document.startViewTransition if available (morph hotspot → overlay)
  // Falls back to direct DOM activation without transition
  // Fetches editorial content via Section Rendering API: window.location.pathname + '?section_id=' + sectionInstanceId
}
```

`updateCameraForMode()` may subtly adjust FOV, camera position, or `parallaxStrength` per editorial room — keep changes subtle, respect `prefers-reduced-motion`.

The editorial overlay (`#immersive-editorial-overlay`) is a `role="dialog"` element rendered by `immersive-canvas.liquid`. Content is fetched via Section Rendering API using the `data-section-id` of the matching `immersive-editorial` section on the page, then injected into `#immersive-editorial-overlay-content`.

Do not render editorial content in Three.js. Three.js coordinates transitions only.

---

## 4. Liquid, schema, and translations

### Liquid rules

- Valid Liquid only: `{% %}` for logic, `{{ }}` for output
- Use `render`, never `include`
- All sections and blocks must have correct `{% schema %}` with valid JSON
- Add at least one preset to new sections

### Translations

- All user-facing text uses `| t` — no hard-coded English strings
- Prefer reusing Dawn keys when semantics match (`products.product.buy_now`, `accessibility.close`, etc.)
- New editorial strings: `sections.immersive_editorial.*` namespace
- Check `locales/en.default.json` before creating new keys
- Keep keys 2–3 levels deep and organised by section

### Passing strings to JS

Inject via `data-*` attributes on container elements:

```liquid
<section
  data-error-select-variant="{{ 'sections.immersive_store.error_select_variant' | t | escape }}"
>
```

```javascript
var msg = container.getAttribute('data-error-select-variant') || 'Please select a size';
```

---

## 5. CSS, JS, and accessibility

### CSS (BEM, scoped)

- BEM block for editorial: `.immersive-editorial`
- Elements: `__hero`, `__banner`, `__banner-media`, `__banner-content`
- Modifiers: `--featured_collections`, `--designer_houses`, `--collections`, `--designers`
- CSS in `{% stylesheet %}` blocks inside the section/snippet — not in assets unless global
- Use Dawn CSS custom properties for colors and spacing
- Responsive — no fixed viewport size assumptions

### JavaScript (scoped, performant)

- `{% javascript %}` blocks for section-scoped behavior
- Scope to section root (`#immersive-editorial-*`)
- Wire `shopify:section:load` re-init hooks where needed
- Scroll parallax: listen on `window`, operate only on nodes inside the section, use `requestAnimationFrame` with `scrollTarget`/`scrollCurrent` lerp
- Always guard with `prefers-reduced-motion`

### Accessibility

- Semantic HTML: `<section>`, `<h2>`, `<p>`, `<a>`, `<button>`
- Maintain heading hierarchy across sections
- Clickable cards/banners: proper focus styles + ARIA labels
- Dialogs (glass-panel, immersive-menu): focus trap, Escape to close, restore focus on close, correct `role="dialog" aria-modal="true"`
- Variant pickers: ARIA radiogroup pattern with arrow key navigation
- Feedback/toasts: `role="alert" aria-live="assertive"` for errors, `role="status" aria-live="polite"` for success
- Any new interactive behavior must include a `prefers-reduced-motion` guard

---

## 6. Performance and fallbacks

### Script/texture loading

- Load `three.min.js` and `immersive-store.js` only on `page.immersive` template
- Load `bridge-behavior.js` on all pages (it is lightweight and guards itself with `[data-immersive-bridge]` detection)
- `immersive-theme.css` loads on `page.immersive` only
- Texture URL params: desktop `&width=1600&quality=75`, mobile `&width=900&quality=75`, depth maps `&quality=60`
- Cache last 2–3 room textures; dispose older textures when memory is tight
- Throttle `mousemove` parallax via `requestAnimationFrame`
- No heavy post-processing or additional scenes unless explicitly requested

### Fallbacks

- `showWebGLFallback()` must always render a static background + clickable hotspots/links
- Without JS or with WebGL failure: store must remain navigable, collections/products reachable
- All `localStorage`/`sessionStorage` calls wrapped in `try/catch` for private browsing

---

## 7. Theme Store alignment

When adding major features or sections, ask:
- Can another luxury fashion brand reasonably use and configure this?
- Is it too brand-specific? If so, generalise via schema settings
- Is it clear how a merchant enables/disables/reorders the experience?
- Does `/docs` need updating? (Kiro may be asked to sync docs on code changes)

---

## 8. Summary rules

1. Preserve and extend the Three.js showroom — never replace or break it
2. The homepage (`/`) is a standard 2D Dawn storefront — the 3D experience lives exclusively at `/pages/immersive`
3. Bridge CTAs (`snippets/immersive-bridge-btn.liquid`) connect 2D pages to the 3D store; the mode switch pill in the immersive header connects back to 2D
4. Editorial experiences are reusable Liquid sections with `room_key` and `layout` settings
5. Three.js augments background and motion only — editorial copy stays in Liquid/DOM
6. Dawn + OS 2.0 patterns: JSON templates, section schemas, `| t` translations
7. BEM CSS, design tokens, WCAG-friendly interactions, reduced motion support throughout
8. If a change would significantly alter these principles (e.g. moving editorial text into shaders, adding heavy libraries, breaking Section Rendering API patterns), flag it and propose a Shopify-native alternative instead

---

## 9. Section responsibilities (detailed)

### `sections/immersive-canvas.liquid`

- Renders `<canvas id="immersive-canvas">`
- Renders the hotspot UI layer (`#ui-layer`)
- Renders a fixed `<header class="immersive-header">` containing: Dawn `<menu-drawer>` component (hamburger nav), search, account link, wishlist button (`data-wishlist-open`), cart button (`#cart-toggle`), tilt-control toggle button (`data-immersive-tilt-toggle`, mobile-only), and 3D→2D mode switch (`data-mode-switch-2d`)
- Renders shell DOM for: glass panel (`#glass-panel`, `role="dialog"`), wishlist panel (`#immersive-wishlist-panel`, `role="dialog"`), editorial overlay (`#immersive-editorial-overlay`, `role="dialog"`), onboarding overlay (`#immersive-onboarding`, `role="dialog"`), cookie consent banner (`#immersive-cookie-banner`)
- Renders `<script id="immersive-rooms-config" type="application/json">` — per-room texture URLs built from section settings (per-room image pickers), consumed by `mergeDynamicRoomConfig()` in `immersive-store.js`
- Keep HTML semantic (`<section>`, `<header>`, `<nav>`)
- All user-facing text uses `| t`; no inline styles except CSS custom properties from settings

### `sections/immersive-editorial.liquid`

- For each room, renders: hero eyebrow + heading, banner blocks with headings/body/CTAs linking to collections
- Must contain real, indexable text and real `<a>` links to collections and products (SEO requirement)
- Heading hierarchy: one `<h1>` per template (configurable via boolean setting), `<h2>` for hero headings, `<h3>` for banner headings
- Use `richtext` for body settings; render with `{{ block.settings.body }}` (not escaped)
- Escape headings/labels: `{{ ... | escape }}`

### `sections/immersive-product-grid.liquid`

- Renders product grid content only; rendered into glass-panel via Section Rendering API
- Used for collection grids and search results
- Accepts `?q={terms}` query parameter for search results
- Renders product cards with `data-product-handle` and `data-collection-handle` attributes
- Includes empty state handling with `[data-empty-action]` buttons

### `sections/glass-panel.liquid` & `sections/glass-product.liquid`

- Serve as Section Rendering API endpoints only — UX overlays, not canonical content
- Do not emit duplicate meta tags or structured data; leave that to canonical `/products/` and `/collections/` templates

---

## 10. Room configuration — current implementation vs. metaobjects roadmap

### Current implementation (section settings)

`immersive-rooms-config` is currently generated from per-room image picker settings directly in `sections/immersive-canvas.liquid` schema. Each room has dedicated settings:

- `{room}_base_image`, `{room}_base_image_mobile`
- `{room}_depth_map`, `{room}_depth_map_mobile`
- `{room}_slot_N_label`, `{room}_slot_N_collection` (for hotspot collection links)

The JSON is emitted inline as `<script type="application/json" id="immersive-rooms-config">` and merged into `STORE_ROOMS` by `mergeDynamicRoomConfig()` on page load. Null/empty values are skipped — JS falls back to hardcoded CDN URLs in `STORE_ROOMS`.

### Metaobjects roadmap (Phase 1 — not yet implemented)

The goal is to move room image/depth map URLs into merchant-configurable metaobjects. Room keys and basic layout remain hardcoded in `STORE_ROOMS` as defaults; metaobjects provide overrides.

**Metaobject type: `immersive_room`** — create in Admin → Settings → Custom data → Metaobjects:

| Field | Type | Notes |
|---|---|---|
| `room_key` | Single line text | `storefront`, `lounge`, `designer_houses`, `occasions`, `featured_collections` |
| `desktop_base_image` | File reference (image) | |
| `mobile_base_image` | File reference (image) | |
| `desktop_depth_map` | File reference (image) | |
| `mobile_depth_map` | File reference (image) | |

**Schema extension for `immersive-canvas`** — add a metaobject list setting:

```json
{
  "type": "metaobject",
  "id": "rooms",
  "label": "Immersive rooms",
  "metaobject_type": "immersive_room",
  "limit": 10
}
```

**Generating `immersive-rooms-config` from metaobjects:**

```liquid
<script id="immersive-rooms-config" type="application/json">
{
  {% for room in section.settings.rooms %}
    {% assign key = room.room_key | strip %}
    {% if key != blank %}
      "{{ key }}": {
        "baseTextureUrl": {{ room.desktop_base_image | image_url: width: 1600 | json }},
        "mobileBaseTextureUrl": {{ room.mobile_base_image | image_url: width: 900 | json }},
        "depthMapUrl": {{ room.desktop_depth_map | image_url: width: 1600 | json }},
        "mobileDepthMapUrl": {{ room.mobile_depth_map | image_url: width: 900 | json }}
      }{% unless forloop.last %},{% endunless %}
    {% endif %}
  {% endfor %}
}
</script>
```

`mergeDynamicRoomConfig()` requires no changes — JSON keys must match: `baseTextureUrl`, `mobileBaseTextureUrl`, `depthMapUrl`, `mobileDepthMapUrl`. Missing fields are handled gracefully (logs warnings, falls back to hardcoded defaults).

---

## 11. Tilt-control experiment (mobile-only, opt-in)

A gyroscope-based tilt control experiment for mobile devices that subtly influences the immersive showroom scene.

### Overview

- **Feature-flagged**: Disabled by default (`tiltControlEnabled = false`)
- **Mobile-only**: Guards on `isMobile === true`
- **User gesture required**: Only activates after explicit button tap (iOS permission requirement)
- **Respects reduced motion**: Disabled when `reduceMotion === true`
- **Showroom mode only**: Only active when `immersiveState.mode === 'showroom'`

### UI Entry Point

A toggle button in the immersive header:

```liquid
<button
  type="button"
  class="immersive-header__icon-btn immersive-tilt-toggle"
  data-immersive-tilt-toggle
  aria-pressed="false"
  aria-label="{{ 'sections.immersive_store.tilt_toggle' | t }}"
>
  <svg><!-- smartphone icon --></svg>
</button>
```

- Hidden on desktop (≥769px) via CSS media query
- Visual feedback when active (`aria-pressed="true"`)
- Uses existing `.immersive-header__icon-btn` base styles

### JavaScript Implementation

**Globals** (in `assets/immersive-store.js`):
- `tiltControlEnabled` — boolean flag
- `tiltBeta`, `tiltGamma` — raw device orientation values
- `tiltXSmoothed`, `tiltYSmoothed` — lerped normalized values [-1, 1]

**Functions**:
- `handleDeviceOrientation(event)` — stores raw tilt values
- `enableTiltControl()` — enables tilt with iOS permission flow
- `disableTiltControl()` — disables tilt and resets state
- `initTiltControlToggle()` — wires up the toggle button

**Render loop integration** (in `animate()`):
- Normalizes tilt to [-1, 1] range
- Lerps with 0.1 factor for gentle response
- Applies to `uTiltOffsetX`/`uTiltOffsetY` uniforms if they exist (future-proof check)
- Decays values smoothly when disabled

### iOS Permission Flow

iOS 13+ requires explicit permission for device orientation:

```javascript
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  DeviceOrientationEvent.requestPermission()
    .then(function (state) {
      if (state === 'granted') startListening();
    });
}
```

The permission request must originate from a user gesture (button click).

### Translation Keys

- `sections.immersive_store.tilt_toggle` — "Enable tilt control"
- `sections.immersive_store.tilt_toggle_enabled` — "Disable tilt control"

---

## 12. Code quality checklist

Before and after changes, verify:

- No Liquid syntax errors
- No deprecated patterns (e.g. resource handles instead of object settings)
- All user-facing strings use `| t`
- All `{% schema %}` JSON is valid and respects Shopify's schema shape
- Every significant ID/class used by `immersive-store.js` is present in sections/snippets — do not rename without updating JS
- `locales/*.json` is valid JSON with no unused or missing translation keys
- Immersive Page can be edited independently from Homepage in the theme editor
- Section blocks behave correctly when added, reordered, or removed
- No runtime console errors when using the theme editor
