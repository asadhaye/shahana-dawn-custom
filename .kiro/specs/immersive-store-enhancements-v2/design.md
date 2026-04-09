# Design Document: Immersive Store Enhancements v2

## Overview

This document covers the technical design for two additive features on top of the existing Dawn-based WebGL immersive store:

- **Feature A**: Dynamic product recommendations fetched via Shopify's Ajax Product Recommendations API and rendered inside the glass product panel.
- **Feature B**: A first-time onboarding overlay that introduces the immersive experience to new visitors and is permanently dismissed via `localStorage`.

It also defines the verification approach for Requirement 0 — confirming all previously-implemented changes are present before new work begins.

All new code follows the established architecture: `assets/immersive-store.js` as the JS engine, Section Rendering API for panel content, `data-*` attributes for Liquid-to-JS data passing, `| t` filter for all user-facing strings, `{% stylesheet %}` blocks for scoped CSS, and `.immersive-*` / `.glass-product-section__*` selector namespacing.

---

## Architecture

### Existing System (unchanged)

```
immersive-canvas.liquid  ←  renders canvas, overlay UI, menu, glass-panel shell
       ↓
immersive-store.js       ←  WebGL engine, panel open/close, fetch helpers
       ↓
Section Rendering API    ←  glass-product.liquid, glass-panel.liquid
```

### New Components (this spec)

```
Feature A — Recommendations
  glass-product.liquid
    └── adds data-product-id, data-product-handle on <section>
    └── adds <div data-related-root> container

  glass-product-recommendations.liquid  (NEW)
    └── renders product cards with data-product-handle anchors

  immersive-store.js
    └── loadProductRecommendations(panel)  (NEW)
    └── openProductPanel() calls loadProductRecommendations after inject

Feature B — Onboarding
  immersive-canvas.liquid
    └── adds #immersive-onboarding dialog (hidden by default)
    └── adds CSS in {% stylesheet %} block

  immersive-store.js
    └── ONBOARDING_KEY constant  (NEW)
    └── showImmersiveOnboardingIfNeeded()  (NEW)
    └── bindImmersiveInit() calls showImmersiveOnboardingIfNeeded() after setupImageParallax()
```

### Data Flow — Feature A

```
openProductPanel(handle, collectionHandle)
  → fetchWithCache(shopRoot + 'products/' + handle + '?section_id=glass-product')
  → contentArea.innerHTML = html
  → loadProductRecommendations(panel)
       → reads panel.querySelector('.glass-product-section').dataset.productId
       → fetchWithCache(shopRoot + 'recommendations/products?product_id=...&limit=4&intent=related&section_id=glass-product-recommendations')
       → panel.querySelector('[data-related-root]').innerHTML = html
```

### Data Flow — Feature B

```
bindImmersiveInit()
  → requestAnimationFrame(...)
       → initImmersiveScene()
       → bindImmersiveNav()
       → setupImageParallax()
       → showImmersiveOnboardingIfNeeded()   ← NEW call site
            → localStorage.getItem(ONBOARDING_KEY)
            → if falsy: remove hidden, focus dismiss button
            → on dismiss: localStorage.setItem, add hidden, restore focus
```

---

## Components and Interfaces

### 1. `sections/glass-product.liquid` — modifications

Add two data attributes to the root `<section>` element:

```liquid
<section
  class="glass-product-section"
  data-product-id="{{ panel_product.id }}"
  data-product-handle="{{ panel_product.handle }}"
  ...
>
```

Add the recommendations container inside the `{% if panel_product %}` block, after the collapsibles and before `{% else %}`:

```liquid
<div class="glass-product-section__related" data-related-root></div>
```

The existing static "You May Also Like" section (collection-based) is replaced by this dynamic container. The JS will populate it via the Recommendations API.

### 2. `sections/glass-product-recommendations.liquid` — new file

Renders product cards for the Section Rendering API response. The section receives products via Shopify's recommendations endpoint.

Key markup contract:
- Each card is an `<a>` with `data-product-handle="{{ product.handle }}"` for JS click interception
- Images use `loading="lazy"` with explicit `width` and `height`
- All selectors namespaced under `.glass-product-section__related` or `.immersive-rec-card`
- All user-facing strings use `| t` filter

```liquid
{% if recommendations.performed and recommendations.products_count > 0 %}
  <div class="glass-product-section__related">
    <h3 class="glass-product-section__related-title">
      {{ 'sections.immersive.product_panel.related_heading' | t }}
    </h3>
    <div class="glass-product-section__related-grid">
      {% for product in recommendations.products %}
        <a
          href="{{ product.url }}"
          class="immersive-rec-card"
          data-product-handle="{{ product.handle }}"
          aria-label="{{ 'sections.immersive.product_panel.related_heading' | t }}: {{ product.title | escape }}"
        >
          ...
        </a>
      {% endfor %}
    </div>
  </div>
{% endif %}
```

### 3. `assets/immersive-store.js` — `loadProductRecommendations(panel)`

New function added after `openProductPanel`:

```javascript
function loadProductRecommendations(panel) {
  var sectionEl = panel.querySelector('.glass-product-section');
  var relatedRoot = panel.querySelector('[data-related-root]');
  if (!sectionEl || !relatedRoot) return;

  var productId = sectionEl.getAttribute('data-product-id');
  if (!productId) return;

  var url = shopRoot
    + 'recommendations/products?product_id=' + productId
    + '&limit=4&intent=related'
    + '&section_id=glass-product-recommendations';

  fetchWithCache(url)
    .then(function (html) {
      if (html) relatedRoot.innerHTML = html;
    })
    .catch(function () {
      // silent — leave relatedRoot empty
    });
}
```

Call site in `openProductPanel`, inside the `render()` function after all existing setup calls:

```javascript
loadProductRecommendations(panel);
```

Click interception for recommendation cards is already handled by the existing `panel.onclick` handler in `openProductPanel` via the `a[data-product-handle]` selector (step 5 of the existing handler). No additional handler needed.

### 4. `sections/immersive-canvas.liquid` — onboarding overlay

Add the overlay HTML inside the `<section id="immersive-store-...">` element, after the cookie banner and before the closing `</section>`:

```liquid
<div
  id="immersive-onboarding"
  class="immersive-onboarding"
  role="dialog"
  aria-modal="true"
  aria-labelledby="immersive-onboarding-title"
  hidden
>
  <div class="immersive-onboarding__inner">
    <h2 id="immersive-onboarding-title" class="immersive-onboarding__title">
      {{ 'sections.immersive_store.onboarding.title' | t }}
    </h2>
    <p class="immersive-onboarding__description">
      {{ 'sections.immersive_store.onboarding.description' | t }}
    </p>
    <button
      type="button"
      class="immersive-onboarding__dismiss"
      data-onboarding-dismiss
    >
      {{ 'sections.immersive_store.onboarding.dismiss' | t }}
    </button>
  </div>
</div>
```

### 5. `assets/immersive-store.js` — `showImmersiveOnboardingIfNeeded()`

```javascript
var ONBOARDING_KEY = 'immersive_onboarding_seen';

function showImmersiveOnboardingIfNeeded() {
  var overlay = document.getElementById('immersive-onboarding');
  if (!overlay) return;

  var seen = false;
  try {
    seen = !!localStorage.getItem(ONBOARDING_KEY);
  } catch (e) {
    // localStorage blocked (private browsing) — treat as unseen
  }

  if (seen) return;

  var previousFocus = document.activeElement;
  overlay.removeAttribute('hidden');

  var dismissBtn = overlay.querySelector('[data-onboarding-dismiss]');
  if (dismissBtn) {
    requestAnimationFrame(function () { dismissBtn.focus(); });

    dismissBtn.addEventListener('click', function onDismiss() {
      dismissBtn.removeEventListener('click', onDismiss);
      try {
        localStorage.setItem(ONBOARDING_KEY, '1');
      } catch (e) {}
      overlay.setAttribute('hidden', '');
      if (previousFocus && typeof previousFocus.focus === 'function') {
        requestAnimationFrame(function () { previousFocus.focus(); });
      }
    });
  }
}
```

`bindImmersiveInit` updated:

```javascript
function bindImmersiveInit() {
  if (!document.getElementById('immersive-canvas')) return;
  requestAnimationFrame(function () {
    initImmersiveScene();
    bindImmersiveNav();
    setupImageParallax();
    showImmersiveOnboardingIfNeeded();  // NEW
  });
}
```

---

## Data Models

### Shopify Recommendations API Response

The endpoint `GET /recommendations/products?product_id={id}&limit=4&intent=related&section_id=glass-product-recommendations` returns rendered HTML from the `glass-product-recommendations.liquid` section. The `recommendations` object is available in that section context with:

- `recommendations.performed` — boolean, true when the API has results
- `recommendations.products_count` — integer
- `recommendations.products` — array of product objects

### localStorage Schema

| Key | Value | Set by | Cleared by |
|-----|-------|--------|------------|
| `immersive_onboarding_seen` | `'1'` | dismiss button click | never (persists) |

### sessionStorage Schema (existing, unchanged)

| Key | Value |
|-----|-------|
| `immersive_state` | `{ room, panel, product, collection }` |

### Locale Keys — New Additions

`locales/en.default.json` additions under `sections.immersive_store`:

```json
"onboarding": {
  "title": "Welcome to the Immersive Store",
  "description": "Tap the glowing hotspots to explore collections. Tap any product to view details and add to cart.",
  "dismiss": "Start exploring"
},
"recommendations": {
  "heading": "You May Also Like",
  "card_aria": "View {{ title }}"
}
```

---

## Requirement 0 — Verification Approach

Before implementing Features A and B, the following checks confirm the previously-implemented foundation is in place. These are manual code-review checks (not automated tests), verified by reading the files directly.

| # | File | What to verify |
|---|------|----------------|
| 0.1 | `assets/immersive-store.js` | `var shopRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) \|\| '/';` followed by trailing-slash guard |
| 0.2 | `assets/immersive-store.js` | `function trackImmersiveEvent(name, params)` exists; body contains `window.dataLayer.push` and `window.fbq` |
| 0.3 | `assets/immersive-store.js` | `saveState`, `loadState`, `clearState` functions exist; all reference `STATE_KEY = 'immersive_state'` and `sessionStorage` |
| 0.4 | `assets/immersive-store.js` | `function fetchWithCache(url)` exists; uses `contentCache` object for URL-keyed caching; adds `X-Requested-With` header |
| 0.5 | `assets/immersive-store.js` | `(function mergeDynamicRoomConfig()` IIFE exists; reads `#immersive-rooms-config`; merges into `STORE_ROOMS` |
| 0.6 | `sections/immersive-canvas.liquid` | `<script type="application/json" id="immersive-rooms-config">` block present with per-room texture and hotspot data |
| 0.7 | `sections/immersive-canvas.liquid` | Schema contains `image_picker` and `collection_picker` settings for all five rooms: `storefront`, `lounge`, `designer_houses`, `occasions`, `featured_collections` |
| 0.8 | `sections/immersive-canvas.liquid` | Schema contains at least three `collection_picker` settings for `featured_collections` room |

All eight items are confirmed present in the current codebase (verified during design research).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: State round-trip

*For any* patch object passed to `saveState`, calling `loadState` immediately after should return an object containing all the same key-value pairs.

**Validates: Requirements 0.3**

### Property 2: fetchWithCache idempotence

*For any* URL, calling `fetchWithCache` twice should result in exactly one network request (the second call returns the cached value without hitting the network).

**Validates: Requirements 0.4**

### Property 3: Recommendations data attributes on product section

*For any* product rendered by `glass-product.liquid`, the root `<section>` element should carry both `data-product-id` and `data-product-handle` attributes with non-empty values matching the product's id and handle.

**Validates: Requirements 1.2**

### Property 4: Recommendations fetch and inject round-trip

*For any* product panel containing a `.glass-product-section` element with a `data-product-id` attribute and a `[data-related-root]` container, calling `loadProductRecommendations(panel)` should result in `[data-related-root]` containing the HTML returned by `fetchWithCache` for the correctly-constructed recommendations URL.

**Validates: Requirements 1.4, 1.5**

### Property 5: Recommendation card structure

*For any* set of products rendered by `glass-product-recommendations.liquid`, every product card anchor element should have a non-empty `data-product-handle` attribute, and every product image should have `loading="lazy"` plus explicit `width` and `height` attributes.

**Validates: Requirements 1.8, 1.10**

### Property 6: Onboarding visibility controlled by localStorage

*For any* localStorage state, `showImmersiveOnboardingIfNeeded()` should show the overlay (remove `hidden`) if and only if `localStorage.getItem(ONBOARDING_KEY)` returns a falsy value; and should leave the overlay hidden if the key holds a truthy value.

**Validates: Requirements 2.7, 2.8**

### Property 7: Onboarding dismiss round-trip

*For any* initial state where the onboarding overlay is visible, clicking the dismiss button should result in: (a) `localStorage.getItem(ONBOARDING_KEY)` returning a truthy value, and (b) the overlay having the `hidden` attribute set.

**Validates: Requirements 2.9**

---

## Error Handling

### Feature A — Recommendations

| Scenario | Behavior |
|----------|----------|
| `[data-related-root]` not found in panel | `loadProductRecommendations` returns early, no error thrown |
| `data-product-id` attribute missing | Returns early silently |
| Fetch returns non-OK response | `fetchWithCache` rejects; `.catch` swallows error; `[data-related-root]` stays empty |
| Network timeout / offline | Same as above — silent failure, panel remains usable |
| Recommendations API returns empty results | `glass-product-recommendations.liquid` renders nothing (guarded by `{% if recommendations.performed and recommendations.products_count > 0 %}`) |

### Feature B — Onboarding

| Scenario | Behavior |
|----------|----------|
| `localStorage` blocked (private browsing, storage full) | `try/catch` around all `localStorage` calls; treats as unseen — overlay is shown |
| `#immersive-onboarding` element not in DOM | `showImmersiveOnboardingIfNeeded` returns early |
| Dismiss button not found | Overlay is shown but no dismiss handler attached; overlay remains visible until page reload |
| `previousFocus` element removed from DOM before dismiss | `focus()` call is a no-op; no error thrown |

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. Unit tests cover specific examples and integration points; property tests verify universal correctness across generated inputs.

### Unit Tests

Focus areas:
- Requirement 0 verification: assert each of the 8 structural checks passes against the actual source files (file-content assertions)
- `loadProductRecommendations`: mock `fetchWithCache`, verify correct URL construction for a known product ID
- `showImmersiveOnboardingIfNeeded`: test with mock DOM — verify overlay shown when key absent, hidden when key present
- Dismiss flow: simulate click, verify `localStorage.setItem` called and `hidden` attribute restored
- Click interception: simulate click on `a[data-product-handle]` inside panel, verify `openProductPanel` called with correct handle
- `glass-product-recommendations.liquid` rendering: snapshot test with a known product fixture

### Property-Based Tests

Use **fast-check** (JavaScript) for all property tests. Each test runs a minimum of 100 iterations.

**Property 1: State round-trip**
```
// Feature: immersive-store-enhancements-v2, Property 1: State round-trip
fc.assert(fc.property(
  fc.record({ room: fc.string(), panel: fc.option(fc.string()), product: fc.option(fc.string()) }),
  (patch) => {
    saveState(patch);
    const loaded = loadState();
    return Object.keys(patch).every(k => loaded[k] === patch[k]);
  }
), { numRuns: 100 });
```

**Property 2: fetchWithCache idempotence**
```
// Feature: immersive-store-enhancements-v2, Property 2: fetchWithCache idempotence
fc.assert(fc.property(
  fc.webUrl(),
  async (url) => {
    let callCount = 0;
    global.fetch = () => { callCount++; return Promise.resolve({ ok: true, text: () => Promise.resolve('html') }); };
    contentCache = {};
    await fetchWithCache(url);
    await fetchWithCache(url);
    return callCount === 1;
  }
), { numRuns: 100 });
```

**Property 3: Recommendations data attributes on product section**
```
// Feature: immersive-store-enhancements-v2, Property 3: Recommendations data attributes on product section
fc.assert(fc.property(
  fc.record({ id: fc.integer({ min: 1 }), handle: fc.stringMatching(/^[a-z0-9-]+$/) }),
  (product) => {
    const html = renderGlassProductSection(product); // test helper
    const doc = parseHTML(html);
    const section = doc.querySelector('.glass-product-section');
    return section.dataset.productId === String(product.id)
      && section.dataset.productHandle === product.handle;
  }
), { numRuns: 100 });
```

**Property 4: Recommendations fetch and inject round-trip**
```
// Feature: immersive-store-enhancements-v2, Property 4: Recommendations fetch and inject round-trip
fc.assert(fc.property(
  fc.integer({ min: 1 }), fc.string({ minLength: 1 }),
  async (productId, responseHtml) => {
    const panel = buildMockPanel(productId);
    mockFetchWithCache(responseHtml);
    await loadProductRecommendations(panel);
    return panel.querySelector('[data-related-root]').innerHTML === responseHtml;
  }
), { numRuns: 100 });
```

**Property 5: Recommendation card structure**
```
// Feature: immersive-store-enhancements-v2, Property 5: Recommendation card structure
fc.assert(fc.property(
  fc.array(fc.record({ handle: fc.stringMatching(/^[a-z0-9-]+$/), title: fc.string() }), { minLength: 1, maxLength: 4 }),
  (products) => {
    const html = renderRecommendationsSection(products);
    const doc = parseHTML(html);
    const anchors = doc.querySelectorAll('a[data-product-handle]');
    const images = doc.querySelectorAll('img');
    return anchors.length === products.length
      && Array.from(anchors).every(a => a.dataset.productHandle)
      && Array.from(images).every(img => img.loading === 'lazy' && img.width && img.height);
  }
), { numRuns: 100 });
```

**Property 6: Onboarding visibility controlled by localStorage**
```
// Feature: immersive-store-enhancements-v2, Property 6: Onboarding visibility controlled by localStorage
fc.assert(fc.property(
  fc.option(fc.oneof(fc.constant('1'), fc.string({ minLength: 1 }))),
  (storedValue) => {
    const overlay = buildMockOverlay();
    mockLocalStorage(ONBOARDING_KEY, storedValue);
    showImmersiveOnboardingIfNeeded();
    const isHidden = overlay.hasAttribute('hidden');
    return storedValue ? isHidden : !isHidden;
  }
), { numRuns: 100 });
```

**Property 7: Onboarding dismiss round-trip**
```
// Feature: immersive-store-enhancements-v2, Property 7: Onboarding dismiss round-trip
fc.assert(fc.property(
  fc.constant(null), // no meaningful input variation; tests the dismiss sequence
  () => {
    clearMockLocalStorage();
    const overlay = buildMockOverlay();
    showImmersiveOnboardingIfNeeded();
    overlay.querySelector('[data-onboarding-dismiss]').click();
    return overlay.hasAttribute('hidden')
      && !!mockLocalStorage.getItem(ONBOARDING_KEY);
  }
), { numRuns: 100 });
```

### Test File Organization

```
tests/
  unit/
    requirement-0-verification.test.js   — structural checks for all 8 Req 0 items
    recommendations.test.js              — loadProductRecommendations unit tests
    onboarding.test.js                   — showImmersiveOnboardingIfNeeded unit tests
  property/
    state-roundtrip.property.test.js     — Property 1
    fetch-cache.property.test.js         — Property 2
    product-section-attrs.property.test.js — Property 3
    recommendations-inject.property.test.js — Property 4
    rec-card-structure.property.test.js  — Property 5
    onboarding-visibility.property.test.js — Properties 6 & 7
```
