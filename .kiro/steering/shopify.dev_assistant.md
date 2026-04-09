---
inclusion: always
---

# Shopify Immersive Theme — Development Guidelines

This is a Dawn-based Shopify theme extended with a WebGL immersive store experience. The immersive layer is a progressive enhancement on top of standard Dawn templates.

## Architecture

### Template Responsibilities

- `templates/index.json` — 2D homepage; standard Dawn layout; Bridge CTA to 3D store; header/footer render normally; no WebGL
- `templates/page.immersive.json` — sole entry point for the WebGL experience; header/footer suppressed
- `sections/immersive-canvas.liquid` — renders `<canvas>` and top-level overlay UI only; no product/collection logic
- `sections/glass-panel.liquid` — dialog shell for Section Rendering responses; owns ARIA, focus trap, and close behavior
- `sections/immersive-product-grid.liquid` — product grid content only; rendered into glass-panel via Section Rendering API
- `sections/glass-product.liquid` — product detail view (media, price, variants, add-to-cart, VTO); rendered into glass-panel
- `snippets/immersive-product-card.liquid` — self-contained card; exposes `data-product-handle` and `data-collection-handle`
- `snippets/virtual-tryon.liquid` — self-contained VTO widget; depends only on `product`, `customer`, and `settings.*`

### Section Rendering Pattern

Use the Section Rendering API for all panel content. Max 1 section per call (never exceed 5).

- Collection zone → `GET /collections/{handle}?section_id={glass-panel-section-id}`
- Product detail → `GET /products/{handle}?section_id={glass-product-section-id}`

Centralize calls in a `fetchWithCache(url)` helper that caches by URL and adds `X-Requested-With: XMLHttpRequest`.

### Standard Dawn Templates

Keep `/products/{handle}` and `/collections/{handle}` fully functional and independent. Do not move core browsing logic into immersive sections.

## Performance

### Script Loading

Load WebGL scripts only on the immersive template in `layout/theme.liquid`. `bridge-behavior.js` loads on all pages.

```liquid
{%- if template == 'page.immersive' -%}
  <script src="{{ 'three.min.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer="defer"></script>
{%- endif -%}
<script src="{{ 'bridge-behavior.js' | asset_url }}" defer="defer"></script>
```

`immersive-theme.css` is loaded conditionally on `page.immersive` only.

### WebGL Initialization

`safeBindImmersiveInit()` is the actual entry point. It guards against double-init (important in the theme editor), tears down any existing renderer before re-initializing, then defers scene setup to the next animation frame so the canvas has real layout dimensions:

```javascript
function safeBindImmersiveInit() {
  if (_immersiveInitBound) return;
  if (!document.getElementById('immersive-canvas')) return;
  _immersiveInitBound = true;

  requestAnimationFrame(function () {
    initImmersiveScene();
    bindImmersiveNav();
    setupImageParallax();
    showImmersiveOnboardingIfNeeded();
    initWishlist();
    bindCookieBanner();

    // URL deep-link params handled here
    var params = new URLSearchParams(window.location.search);
    var openProduct = params.get('open_product');
    var openCollection = params.get('open_collection');
    var openSearch = params.get('open_search');
    // open_product > open_collection > open_search priority
  });
}

// Initial page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeBindImmersiveInit);
} else {
  safeBindImmersiveInit();
}

// Theme editor re-init hooks
document.addEventListener('shopify:section:load', ...);
document.addEventListener('shopify:section:select', ...);
document.addEventListener('shopify:section:unload', ...);
```

There is no click-gated launch button — the scene initializes automatically on DOMContentLoaded.

### WebGL Tuning

```javascript
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isMobile = window.innerWidth < 768;

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
var parallaxStrength = isMobileDevice() ? 0.03 : 0.08; // UV offset magnitude
var lerpFactor = 0.08; // 0.04 = very smooth, 0.12 = snappier
```

- Load textures per room on first entry; cache last 2–3 rooms; dispose older textures when memory is tight
- Throttle `mousemove` parallax via `requestAnimationFrame`
- Disable parallax and camera animations when `reduceMotion` is true

### CSS Scoping

- Use `{% stylesheet %}` blocks in sections/snippets — already done for `virtual-tryon`, `immersive-product-card`, `immersive-product-grid`, `glass-product`, `immersive-bridge-btn`
- Load `assets/immersive-theme.css` conditionally on `page.immersive` only
- Namespace all selectors: `.immersive-*`, `.glass-product-section__*`, `.vtryon__*`, `.immersive-bridge-btn*`
- Avoid bare element selectors and `!important`; prefer specificity

### Header/Footer

```liquid
{%- if template != 'page.immersive' -%}
  {% sections 'header-group' %}
{%- endif -%}
{{ content_for_layout }}
{%- if template != 'page.immersive' -%}
  {% sections 'footer-group' %}
{%- endif -%}
```

The homepage (`index`) renders header and footer normally. Only `page.immersive` suppresses them.

### Font Preloading

Use the Liquid `preload_tag` filter, not a raw HTML `rel` attribute:

```liquid
{%- unless settings.type_body_font.system? -%}
  {{ settings.type_body_font | font_url | preload_tag: as: 'font' }}
{%- endunless -%}
{%- unless settings.type_header_font.system? -%}
  {{ settings.type_header_font | font_url | preload_tag: as: 'font' }}
{%- endunless -%}
```

## SEO

### Canonical URLs

- Product pages: `<link rel="canonical" href="{{ shop.url }}{{ product.url }}">` — keep Dawn default, do not alter
- Collection pages: same pattern — keep Dawn default
- Immersive page: self-referential `<link rel="canonical" href="{{ canonical_url }}">` — do not point to any single product/collection
- Never use `?view=immersive` as a canonical URL

### Internal Linking

- Product cards and "You may also like" items must use real `<a href="{{ product.url }}">` links with `data-product-handle` for JS interception
- JS intercepts clicks via `preventDefault()` to open the glass panel; canonical URL is the fallback
- 2D→3D Bridge CTAs use `snippets/immersive-bridge-btn.liquid` on all standard Dawn templates; links use deep-link params (`/?open_collection=`, `/?open_product=`, `/?open_search=`)
- 3D→2D switch is a pill in the immersive store header linking back to `/`
- Social share buttons must use `data-product-url="{{ shop.url }}{{ panel_product.url }}"` (canonical product URL)

### SEO Metadata

Keep the existing `theme.liquid` pattern unchanged:

```liquid
<title>
  {{ page_title }}
  {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
  {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
  {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
</title>
{% if page_description %}
  <meta name="description" content="{{ page_description | escape }}">
{% endif %}
<link rel="canonical" href="{{ canonical_url }}">
{% render 'meta-tags' %}
```

Add an `<h1>` and descriptive intro in `immersive-canvas.liquid` for the immersive page (see launch button example above).

## Accessibility

### Dialogs (glass-panel, editorial overlay)

The glass panel is rendered by `immersive-canvas.liquid` as:

```liquid
<section
  id="glass-panel"
  class="immersive-store__panel hidden"
  role="dialog"
  aria-modal="true"
  aria-labelledby="glass-panel-title"
  hidden
  data-msg-added-to-cart="{{ 'sections.immersive_store.added_to_cart' | t | escape }}"
  data-msg-load-collection-error="{{ 'sections.immersive_store.error_load_collection' | t | escape }}"
  data-msg-load-product-error="{{ 'sections.immersive_store.error_load_product' | t | escape }}"
>
  <header class="immersive-store__panel-header">
    <h2 id="glass-panel-title" class="immersive-store__panel-title">
      {{ 'sections.immersive_store.panel_title' | t }}
    </h2>
    <button type="button" class="immersive-store__panel-close" aria-label="{{ 'sections.immersive_store.close' | t }}">
      {{ 'sections.immersive_store.close' | t }}
    </button>
  </header>
  <div class="immersive-store__panel-content"></div>
</section>
```

JS requirements for all dialogs:
- On open: save `document.activeElement` as `_panelTrigger`, move focus to close button or first focusable element
- While open: trap focus (Tab/Shift+Tab cycles within dialog via `openDialogFocus()`); close on `Escape`
- On close: restore focus to `_panelTrigger` via `closeDialogFocus()`

### Variant Selection

Use ARIA radiogroup pattern for variant pickers:

```liquid
<div role="radiogroup" aria-label="{{ 'sections.immersive.product_panel.variant_group_label' | t }}" data-variant-group>
  {% for value in product.options_with_values.first.values %}
    <button
      type="button"
      role="radio"
      aria-checked="{% if forloop.first %}true{% else %}false{% endif %}"
      data-variant-value="{{ value | escape }}"
    >{{ value | escape }}</button>
  {% endfor %}
</div>
```

JS must: keep `aria-checked` in sync, support arrow key navigation, and update the hidden `input[name="id"]`.

### Feedback / Toasts

```javascript
feedback.setAttribute('role', 'alert');         // errors
feedback.setAttribute('aria-live', 'assertive'); // errors
// or
feedback.setAttribute('role', 'status');
feedback.setAttribute('aria-live', 'polite');    // success/info
```

### Reduced Motion

Add CSS overrides in all immersive stylesheets:

```css
@media (prefers-reduced-motion: reduce) {
  .immersive-product-card { transform: none !important; transition: none !important; }
  /* remove hover zooms, translateY, keyframe animations */
}
```

### Virtual Try-On (VTO)

- `role="status" aria-live="polite"` on loading status element
- `role="alert" aria-live="assertive"` on error element (always in DOM, toggle text/visibility only)
- Lazy-init: only attach event listeners when VTO container is present in DOM and user has interacted
- Never store signing secrets in `settings.*` — theme settings are client-visible; use an app proxy for token signing

## Localization

All user-facing text must use the `| t` filter. No hard-coded English strings in Liquid templates.

### Key Namespaces (en.default.json)

**`sections.immersive_store`** — immersive-canvas.liquid
- `heading`, `intro`
- `panel_title`, `close`
- `cart_label` (with `count:` placeholder)
- `nav_enter_store`, `nav_designer_houses`, `nav_occasions`, `nav_featured_collections`
- `nav_explore_designers`, `nav_our_occasions`, `nav_featured_stories`, `nav_back_to_lounge`
- `collection_empty`, `collection_not_found`, `collection_panel_aria`
- `error_select_variant`, `error_add_to_cart`, `error_load_collection`, `error_load_product`, `added_to_cart`
- `wishlist.button_aria`, `wishlist.panel_title`, `wishlist.close`, `wishlist.empty`, `wishlist.save_label`, `wishlist.saved_label`, `wishlist.view_product`, `wishlist.remove`
- `cookie_banner.aria_label`, `cookie_banner.text`, `cookie_banner.learn_more`, `cookie_banner.accept`, `cookie_banner.decline`

**`sections.immersive.product_panel`** — glass-product.liquid
- `title`, `close`, `variant_group_label`
- `care_heading`, `size_heading`, `disclaimer_heading`, `disclaimer_default`
- `size_table.size`, `size_table.bust`, `size_table.waist`, `size_table.hip`
- `related_heading`, `share_label`
- `share_whatsapp`, `share_facebook`, `share_instagram`, `share_tiktok`
- `delivery_estimate` (with `{{ from }}` and `{{ to }}` placeholders)

**`sections.immersive.product_card`** — immersive-product-card.liquid
- `view_product` (aria-label with `title:` placeholder), `select_variant`, `unavailable_aria`, `badge_new`

**`sections.immersive.product_grid`** — immersive-product-grid.liquid
- `empty`, `back_to_collection`

**`sections.virtual_tryon`** — virtual-tryon.liquid
- `title`, `gate_title`, `gate_subtitle`, `gate_button`
- `subtitle`, `upload_label`, `upload_aria`, `consent_text`, `button_label`
- `loading_title`, `loading_subtitle`, `result_label`
- Error/status messages passed via `data-*` attributes on the container element

### Passing Translations to JavaScript

Inject localized strings as `data-*` attributes on container elements; read them in JS:

```liquid
<section
  class="glass-product-section"
  data-error-select-variant="{{ 'sections.immersive_store.error_select_variant' | t | escape }}"
  data-error-add-to-cart="{{ 'sections.immersive_store.error_add_to_cart' | t | escape }}"
  data-success-added="{{ 'sections.immersive_store.added_to_cart' | t | escape }}"
>
```

```javascript
var msg = container.getAttribute('data-error-select-variant') || 'Please select a size';
```

**`sections.immersive_journey_bridges`** — `snippets/immersive-bridge-btn.liquid` + `layout/theme.liquid`
- `bridge_eyebrow`, `collection_cta`, `collection_cta_aria`
- `search_cta`, `search_cta_aria`
- `product_cta`, `product_cta_aria`
- `cart_cta`, `cart_cta_aria`
- `collections_list_cta`, `collections_list_cta_aria`
- `content_cta`, `content_cta_aria`
- `switch_to_2d`, `switch_to_2d_aria`, `switch_to_3d`, `switch_to_3d_aria`
- `preference_banner_text`, `preference_banner_cta`, `preference_banner_dismiss`, `preference_banner_dismiss_aria`, `preference_banner_aria`

### Schema Translations (en.default.schema.json)

All `label`, `name`, `content`, and `preset_name` values in `{% schema %}` blocks must reference `en.default.schema.json`. Existing namespaces: `sections.ai_vton`, `sections.immersive_store`, `sections.immersive_product_grid`, `sections.glass_product`.

### Delivery Date Formatting

Use `document.documentElement.lang` for locale-aware date formatting:

```javascript
var lang = document.documentElement.lang || 'en-GB';
function fmt(date) {
  try { return date.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' }); }
  catch(e) { return date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' }); }
}
```

## JavaScript Conventions

- Target elements via `data-*` attributes, not generic class selectors
- `{% javascript %}` blocks run once per file — attach behavior via data attributes, not `querySelectorAll` on generic classes
- Keep the WebGL engine in `assets/immersive-store.js`; use `{% javascript %}` only for small instance-scoped hooks
- Product forms must remain standard Shopify product forms (`{% form 'product', product %}`) so add-to-cart works without JS

## Bridge UX — Device/Connection-Aware Implementation

### Requirements

- Provide plain `<a href>` links in both directions (2D→3D and 3D→2D) — no JS-only navigation
- Make bridge messaging device/connection-aware via JS; never auto-redirect
- Do not conditionally block Googlebot from either `/` or `/pages/immersive` — this would be cloaking

### On the 2D homepage (`/`)

Add a visible CTA to the 3D store:

```liquid
<a href="/pages/immersive" class="bridge-btn" data-immersive-cta>
  {{ 'immersive.bridge.enter_3d' | t }}
</a>
<noscript>
  <a href="/pages/immersive">{{ 'immersive.bridge.enter_3d_noscript' | t }}</a>
</noscript>
```

Add connection-awareness in `bridge-behavior.js` (not in `immersive-store.js`):
- Use `navigator.connection.effectiveType` and `navigator.connection.saveData` if available
- Use `window.matchMedia('(prefers-reduced-motion: reduce)')` for motion sensitivity
- On slow/limited environments: update CTA text to indicate the classic store is recommended
- Do not remove the link or redirect automatically

### On the immersive page (`/pages/immersive`)

Add a "Back to classic store" CTA:

```liquid
<a href="/" class="bridge-btn bridge-btn--back">
  {{ 'immersive.bridge.back_to_classic' | t }}
</a>
```

Optionally show a non-blocking JS banner on slow connections: "3D store may feel heavy on your connection; the classic store is recommended."

### SEO rules for bridge links

- Links must be plain `<a href>` elements — no JS-only navigation
- Button text must be clear and localized
- Do not show entirely different content trees based on connection/device — only adjust messaging

## SEO — Structured Data & Headings

- Leave product and collection JSON-LD in canonical `/products/` and `/collections/` templates (Dawn defaults)
- Do not emit separate Product/Collection JSON-LD from `glass-product` or `glass-panel` overlays
- `immersive-editorial` sections must contain real, indexable text and real `<a>` links to collections/products
- One `<h1>` per template (configurable via boolean setting in section schema); use `<h2>`/`<h3>` for subsequent headings
- Ensure the Immersive Page's title/description reflect its purpose (e.g. "3D Immersive Boutique | Brand Name") — set via the Page resource in Admin
- Keep LCP on `/` fast — do not load heavy scripts above the fold on the homepage
