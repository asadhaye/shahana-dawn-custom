# Design Document: Immersive Wishlist

## Overview

The wishlist is a fully client-side, guest-friendly feature layered on top of the existing immersive store architecture. It introduces no new Liquid sections — all HTML is either added to existing files (`immersive-canvas.liquid`, `glass-product.liquid`, `immersive-product-card.liquid`) or rendered dynamically by JS. All JS logic lives in `assets/immersive-store.js`, following the existing vanilla-JS, no-build-step convention.

---

## Architecture

### Data flow

```
localStorage["immersive_wishlist"]  ←→  WishlistManager (in-memory array + persistence)
        ↓                                        ↓
  page load init                        add / remove mutations
        ↓                                        ↓
  syncAllToggles()                     syncAllToggles() + updateBadge()
        ↓                                        ↓
  [data-wishlist-toggle] buttons       Wishlist_Panel card list
```

### New constants and state (immersive-store.js)

```javascript
var WISHLIST_KEY = 'immersive_wishlist';
var _wishlistItems = [];          // in-memory mirror of localStorage array
var _wishlistPanelTrigger = null; // focus-restore target for the panel
```

`_wishlistItems` is the single source of truth at runtime. It is loaded from `localStorage` once on init and written back on every mutation.

---

## Components

### 1. WishlistManager — `assets/immersive-store.js`

A group of functions added after `showImmersiveOnboardingIfNeeded`. No class or module wrapper — consistent with the rest of the file.

#### `initWishlist()`

Called from `bindImmersiveInit()` after `showImmersiveOnboardingIfNeeded()`.

```javascript
function initWishlist() {
  try {
    _wishlistItems = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    if (!Array.isArray(_wishlistItems)) _wishlistItems = [];
  } catch (e) {
    _wishlistItems = [];
  }
  updateWishlistBadge();
  syncAllWishlistToggles(document);
}
```

#### `getWishlist()` → `string[]`

Returns a shallow copy of `_wishlistItems`. Never mutates.

#### `addToWishlist(handle, source)`

Idempotent. Appends handle if not present, persists, calls `updateWishlistBadge()`, `syncAllWishlistToggles(document)`, fires `trackImmersiveEvent`.

#### `removeFromWishlist(handle, source)`

Filters out all occurrences, persists, calls `updateWishlistBadge()`, `syncAllWishlistToggles(document)`, fires `trackImmersiveEvent`.

#### `_persistWishlist()`

Private helper. Wraps `localStorage.setItem` in `try/catch`.

#### `updateWishlistBadge()`

Reads `_wishlistItems.length`, updates `[data-wishlist-badge]` text and `hidden` attribute.

#### `syncAllWishlistToggles(root)`

Queries `root.querySelectorAll('[data-wishlist-toggle]')`, sets `aria-pressed` and the `.is-saved` CSS class on each based on whether its `data-product-handle` is in `_wishlistItems`.

Called after every mutation and after every Section Rendering API injection (hooked into `openProductPanel`'s `render()` and `openCollectionPanel`'s render).

#### `toggleWishlistItem(handle, source)`

Delegates to `addToWishlist` or `removeFromWishlist` based on current state.

#### `openWishlistPanel()`

- Sets `_wishlistPanelTrigger = document.activeElement`
- Calls `renderWishlistPanel()` to populate the panel's content area
- Removes `hidden` from `#immersive-wishlist-panel`
- Calls `openDialogFocus(panel, _wishlistPanelTrigger)` — reuses existing helper
- Fires `trackImmersiveEvent('wishlist_panel_opened', { item_count: count })`

#### `closeWishlistPanel()`

- Adds `hidden` to `#immersive-wishlist-panel`
- Calls `closeDialogFocus(panel, _wishlistPanelTrigger)` — reuses existing helper
- Clears `_wishlistPanelTrigger`

#### `renderWishlistPanel()`

Builds the panel's inner HTML from `_wishlistItems`. Uses stored product data from a lightweight `_wishlistProductCache` object (handle → `{ title, price, image_url }`) populated when products are viewed. Falls back to a minimal card showing only the handle and action buttons if cache is cold.

> **Cache strategy:** When `openProductPanel` renders a product, `cacheWishlistProduct(handle, panelEl)` is called to extract title, price, and featured image src from the injected HTML and store them in `_wishlistProductCache`. This avoids any additional network requests for the wishlist panel.

Empty state: if `_wishlistItems.length === 0`, renders a single `<p data-wishlist-empty>` paragraph.

---

### 2. Wishlist Panel HTML — `sections/immersive-canvas.liquid`

Added inside `<section id="immersive-store-...">`, after `#immersive-onboarding` and before the closing `</section>`.

```liquid
<div
  id="immersive-wishlist-panel"
  class="immersive-wishlist-panel"
  role="dialog"
  aria-modal="true"
  aria-labelledby="immersive-wishlist-title"
  hidden
  data-wishlist-panel
>
  <div class="immersive-wishlist-panel__inner">
    <div class="immersive-wishlist-panel__header">
      <h2 id="immersive-wishlist-title" class="immersive-wishlist-panel__heading">
        {{ 'sections.immersive_store.wishlist.panel_title' | t }}
      </h2>
      <button
        type="button"
        class="immersive-wishlist-panel__close"
        data-wishlist-close
        aria-label="{{ 'sections.immersive_store.wishlist.close' | t }}"
      >
        <svg .../>
      </button>
    </div>
    <div class="immersive-wishlist-panel__body" data-wishlist-body></div>
  </div>
</div>
```

The `[data-wishlist-body]` div is the render target for `renderWishlistPanel()`.

#### Wishlist Button in the header

Added to `.immersive-header__right` before the cart button:

```liquid
<button
  type="button"
  class="immersive-header__icon-btn immersive-header__wishlist-btn"
  data-wishlist-open
  aria-label="{{ 'sections.immersive_store.wishlist.button_aria' | t }}"
>
  <svg .../>  {%- comment -%} outline heart {%- endcomment -%}
  <span
    class="immersive-header__wishlist-badge"
    data-wishlist-badge
    hidden
    aria-hidden="true"
  >0</span>
</button>
```

`aria-hidden="true"` on the badge — the count is conveyed via the button's `aria-label` update in JS (or a visually-hidden live region if needed). The badge is purely visual.

---

### 3. Wishlist Toggle — `snippets/immersive-product-card.liquid`

Added inside `.immersive-product-info`, after the price block, before the form:

```liquid
<button
  type="button"
  class="immersive-product-card__wishlist-toggle"
  data-wishlist-toggle
  data-product-handle="{{ product.handle }}"
  aria-pressed="false"
  aria-label="{{ 'sections.immersive_store.wishlist.save' | t: title: product.title | escape }}"
  data-label-save="{{ 'sections.immersive_store.wishlist.save' | t: title: product.title | escape }}"
  data-label-saved="{{ 'sections.immersive_store.wishlist.saved' | t: title: product.title | escape }}"
>
  {%- comment -%} Outline heart (unsaved state) {%- endcomment -%}
  <svg class="immersive-product-card__heart immersive-product-card__heart--outline" .../>
  {%- comment -%} Filled heart (saved state) {%- endcomment -%}
  <svg class="immersive-product-card__heart immersive-product-card__heart--filled" .../>
</button>
```

Both SVGs are always in the DOM; CSS toggles visibility via `.is-saved` on the button.

---

### 4. Wishlist Toggle — `sections/glass-product.liquid`

Added inside `.glass-product-section__info`, immediately after the add-to-cart `{% endform %}`:

```liquid
<button
  type="button"
  class="glass-product-section__wishlist-toggle"
  data-wishlist-toggle
  data-product-handle="{{ panel_product.handle }}"
  aria-pressed="false"
  aria-label="{{ 'sections.immersive_store.wishlist.save' | t: title: panel_product.title | escape }}"
  data-label-save="{{ 'sections.immersive_store.wishlist.save' | t: title: panel_product.title | escape }}"
  data-label-saved="{{ 'sections.immersive_store.wishlist.saved' | t: title: panel_product.title | escape }}"
>
  <svg class="glass-product-section__heart glass-product-section__heart--outline" .../>
  <svg class="glass-product-section__heart glass-product-section__heart--filled" .../>
  <span class="glass-product-section__wishlist-label" aria-hidden="true">
    {{ 'sections.immersive_store.wishlist.save_label' | t }}
  </span>
</button>
```

The panel toggle also shows a text label ("Save" / "Saved") alongside the icon for clarity at the larger panel size.

---

### 5. Event wiring — `bindImmersiveNav()` extension

A single delegated listener on `document` handles all wishlist interactions:

```javascript
document.addEventListener('click', function (e) {
  // Wishlist open button
  if (e.target.closest('[data-wishlist-open]')) {
    openWishlistPanel();
    return;
  }
  // Wishlist close button
  if (e.target.closest('[data-wishlist-close]')) {
    closeWishlistPanel();
    return;
  }
  // Wishlist toggle (card or panel)
  var toggle = e.target.closest('[data-wishlist-toggle]');
  if (toggle) {
    var handle = toggle.getAttribute('data-product-handle');
    var source = toggle.closest('#glass-panel') ? 'product_panel' : 'product_card';
    if (handle) toggleWishlistItem(handle, source);
    return;
  }
  // Wishlist panel — remove card action
  var removeBtn = e.target.closest('[data-wishlist-remove]');
  if (removeBtn) {
    var h = removeBtn.getAttribute('data-product-handle');
    if (h) removeFromWishlist(h, 'wishlist_panel');
    return;
  }
  // Wishlist panel — view product action
  var viewBtn = e.target.closest('[data-wishlist-view]');
  if (viewBtn) {
    var vh = viewBtn.getAttribute('data-product-handle');
    if (vh) {
      trackImmersiveEvent('wishlist_view_product', { product_handle: vh });
      closeWishlistPanel();
      openProductPanel(vh, null);
    }
    return;
  }
});
```

One listener, no per-element binding, survives DOM re-renders.

---

### 6. Hook into Section Rendering API renders

In `openProductPanel`'s `render()` function, add two calls after the existing setup calls:

```javascript
// Cache product data for wishlist panel rendering
cacheWishlistProduct(productHandle, panel);
// Sync wishlist toggle state in newly injected content
syncAllWishlistToggles(panel);
```

In `openCollectionPanel`'s render equivalent, add:

```javascript
syncAllWishlistToggles(panel);
```

---

### 7. Wishlist Panel card template (JS-rendered)

`renderWishlistPanel()` builds HTML strings. Each card:

```html
<article class="immersive-wishlist-card" data-wishlist-card data-product-handle="{handle}">
  <img src="{image_url}" alt="{title}" loading="lazy" width="80" height="107">
  <div class="immersive-wishlist-card__info">
    <p class="immersive-wishlist-card__title">{title}</p>
    <p class="immersive-wishlist-card__price">{price}</p>
  </div>
  <div class="immersive-wishlist-card__actions">
    <button type="button" data-wishlist-view data-product-handle="{handle}"
      aria-label="{view_label}">{view_label}</button>
    <button type="button" data-wishlist-remove data-product-handle="{handle}"
      aria-label="{remove_label}">{remove_label}</button>
  </div>
</article>
```

All label strings are read from `data-*` attributes on `[data-wishlist-panel]` (set via `| t | escape` in Liquid), so JS never contains hard-coded English.

---

## CSS

### `sections/immersive-canvas.liquid` — `{% stylesheet %}` block additions

```css
/* ── Wishlist Button (header) ─────────────────────────── */
.immersive-header__wishlist-btn { position: relative; }

.immersive-header__wishlist-badge {
  position: absolute;
  top: -4px; right: -6px;
  min-width: 18px; height: 18px;
  background: #d4af37; color: #000;
  border-radius: 999px;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}

/* ── Wishlist Panel ───────────────────────────────────── */
.immersive-wishlist-panel {
  position: fixed; inset: 0;
  z-index: 1100;
  display: flex; align-items: flex-start; justify-content: flex-end;
}

.immersive-wishlist-panel[hidden] { display: none; }

.immersive-wishlist-panel__inner {
  width: min(420px, 100vw);
  height: 100%;
  background: rgba(10, 15, 30, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid rgba(212, 175, 55, 0.25);
  display: flex; flex-direction: column;
  overflow: hidden;
}

.immersive-wishlist-panel__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  flex-shrink: 0;
}

.immersive-wishlist-panel__heading {
  font-size: 1.25rem; font-weight: 600; color: #d4af37; margin: 0;
}

.immersive-wishlist-panel__close {
  background: transparent; border: none; cursor: pointer;
  color: rgba(212, 175, 55, 0.7); padding: 0.5rem;
  border-radius: 0.25rem;
  transition: color 0.2s;
}
.immersive-wishlist-panel__close:hover { color: #d4af37; }
.immersive-wishlist-panel__close:focus-visible {
  outline: 2px solid #d4af37; outline-offset: 2px;
}

.immersive-wishlist-panel__body {
  flex: 1; overflow-y: auto; padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}

/* ── Wishlist Card ────────────────────────────────────── */
.immersive-wishlist-card {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem; align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 0.5rem;
}

.immersive-wishlist-card img {
  width: 80px; height: 107px; object-fit: cover;
  border-radius: 0.25rem; display: block;
}

.immersive-wishlist-card__title {
  font-size: 0.9rem; font-weight: 600; color: #d4af37;
  margin: 0 0 0.25rem; line-height: 1.3;
}

.immersive-wishlist-card__price {
  font-size: 0.875rem; color: rgba(212, 175, 55, 0.8); margin: 0;
}

.immersive-wishlist-card__actions {
  display: flex; flex-direction: column; gap: 0.5rem;
}

.immersive-wishlist-card__actions button {
  padding: 0.4rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem; font-weight: 600; cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.immersive-wishlist-card__actions [data-wishlist-view] {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #d4af37;
}
.immersive-wishlist-card__actions [data-wishlist-view]:hover {
  background: rgba(212, 175, 55, 0.3);
}

.immersive-wishlist-card__actions [data-wishlist-remove] {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: rgba(148, 163, 184, 0.8);
}
.immersive-wishlist-card__actions [data-wishlist-remove]:hover {
  border-color: rgba(239, 68, 68, 0.5); color: rgb(239, 68, 68);
}

.immersive-wishlist-card__actions button:focus-visible {
  outline: 2px solid #d4af37; outline-offset: 2px;
}

/* Empty state */
[data-wishlist-empty] {
  color: rgba(212, 175, 55, 0.6);
  font-size: 0.9rem; text-align: center;
  padding: 3rem 1rem;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .immersive-wishlist-panel__inner,
  .immersive-wishlist-card {
    transition: none !important;
    animation: none !important;
  }
}
```

### `snippets/immersive-product-card.liquid` — `{% stylesheet %}` block additions

```css
/* ── Wishlist Toggle (card) ───────────────────────────── */
.immersive-product-card__wishlist-toggle {
  position: absolute; top: 0.5rem; right: 0.5rem;
  width: 32px; height: 32px;
  background: rgba(10, 15, 30, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  z-index: 2;
}

.immersive-product-card__wishlist-toggle:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.6);
  transform: scale(1.1);
}

.immersive-product-card__wishlist-toggle:focus-visible {
  outline: 2px solid #d4af37; outline-offset: 2px;
}

.immersive-product-card__heart { color: #d4af37; }

.immersive-product-card__heart--filled { display: none; }
.immersive-product-card__wishlist-toggle.is-saved .immersive-product-card__heart--outline { display: none; }
.immersive-product-card__wishlist-toggle.is-saved .immersive-product-card__heart--filled { display: block; }

@media (prefers-reduced-motion: reduce) {
  .immersive-product-card__wishlist-toggle {
    transition: none !important; transform: none !important;
  }
}
```

### `sections/glass-product.liquid` — `{% stylesheet %}` block additions

```css
/* ── Wishlist Toggle (product panel) ─────────────────── */
.glass-product-section__wishlist-toggle {
  display: flex; align-items: center; gap: 0.5rem;
  width: 100%; max-width: 300px;
  margin: 0.75rem auto 0;
  padding: 0.6rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 999px;
  color: rgba(212, 175, 55, 0.8);
  font-size: 0.875rem; font-weight: 500; cursor: pointer;
  justify-content: center;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.glass-product-section__wishlist-toggle:hover {
  border-color: rgba(212, 175, 55, 0.7);
  color: #d4af37;
  background: rgba(212, 175, 55, 0.06);
}

.glass-product-section__wishlist-toggle:focus-visible {
  outline: 2px solid #d4af37; outline-offset: 2px;
}

.glass-product-section__heart--filled { display: none; }
.glass-product-section__wishlist-toggle.is-saved .glass-product-section__heart--outline { display: none; }
.glass-product-section__wishlist-toggle.is-saved .glass-product-section__heart--filled { display: block; }

.glass-product-section__wishlist-toggle.is-saved {
  border-color: rgba(212, 175, 55, 0.6);
  color: #d4af37;
  background: rgba(212, 175, 55, 0.08);
}

@media (prefers-reduced-motion: reduce) {
  .glass-product-section__wishlist-toggle { transition: none !important; }
}
```

---

## Locale keys — `locales/en.default.json`

Under `sections.immersive_store.wishlist`:

```json
"wishlist": {
  "button_aria": "Wishlist",
  "panel_title": "Your Wishlist",
  "close": "Close wishlist",
  "empty": "You haven't saved any products yet.",
  "save": "Save {{ title }} to wishlist",
  "saved": "Remove {{ title }} from wishlist",
  "save_label": "Save",
  "saved_label": "Saved",
  "view_product": "View product",
  "remove": "Remove from wishlist",
  "item_count": "{{ count }} saved item",
  "item_count_plural": "{{ count }} saved items"
}
```

JS-consumed strings (passed via `data-*` on `[data-wishlist-panel]`):

```liquid
data-msg-empty="{{ 'sections.immersive_store.wishlist.empty' | t | escape }}"
data-msg-view="{{ 'sections.immersive_store.wishlist.view_product' | t | escape }}"
data-msg-remove="{{ 'sections.immersive_store.wishlist.remove' | t | escape }}"
data-msg-save-label="{{ 'sections.immersive_store.wishlist.save_label' | t | escape }}"
data-msg-saved-label="{{ 'sections.immersive_store.wishlist.saved_label' | t | escape }}"
```

---

## Files changed

| File | Change |
|---|---|
| `assets/immersive-store.js` | Add `WISHLIST_KEY`, `_wishlistItems`, `_wishlistProductCache`, `_wishlistPanelTrigger`; add all WishlistManager functions; add delegated click listener; hook `syncAllWishlistToggles` + `cacheWishlistProduct` into `openProductPanel` render and `openCollectionPanel` render; call `initWishlist()` from `bindImmersiveInit()` |
| `sections/immersive-canvas.liquid` | Add wishlist button to `.immersive-header__right`; add `#immersive-wishlist-panel` dialog; add CSS to `{% stylesheet %}` block |
| `sections/glass-product.liquid` | Add wishlist toggle button after `{% endform %}`; add CSS to `{% stylesheet %}` block |
| `snippets/immersive-product-card.liquid` | Add wishlist toggle button; add CSS to `{% stylesheet %}` block |
| `locales/en.default.json` | Add `sections.immersive_store.wishlist.*` keys |

No new files. No new Liquid sections. No new JS assets.

---

## Key design decisions

**No new section file.** The wishlist panel is a static HTML shell in `immersive-canvas.liquid` with a JS-rendered body — the same pattern as the onboarding overlay. This avoids a Section Rendering API call for the panel itself and keeps the panel always available in the DOM.

**Product data cache over API calls.** Rather than fetching product data when the wishlist panel opens, product metadata is extracted from already-fetched panel HTML and cached in `_wishlistProductCache`. This means zero additional network requests for the wishlist panel in the common case (user has viewed the products they saved).

**Single delegated listener.** All wishlist click handling uses one `document.addEventListener('click', ...)` with `closest()` routing — the same pattern used by `panel.onclick` in `openProductPanel`. This survives DOM re-renders without rebinding.

**Reuse `openDialogFocus` / `closeDialogFocus`.** The wishlist panel is a proper ARIA dialog and uses the existing focus trap helpers unchanged. The only difference from the glass panel is that the wishlist panel slides in from the right (CSS) rather than covering the full viewport.

**`syncAllWishlistToggles(root)` scoped to a root.** Passing `document` syncs everything; passing `panel` syncs only newly injected content. This avoids redundant DOM queries on every mutation.
