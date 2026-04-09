# Design Document

## Overview

This document describes the targeted changes required to fix 23 defects across performance, SEO, accessibility, and localization in the immersive store theme. All changes are surgical — no architectural rewrites.

**Status: All changes implemented.**

---

## Changes by File

### layout/theme.liquid ✅

1. Script loading condition: `template == 'page.immersive' or template == 'index'` → `template == 'page.immersive'`
2. Header/footer condition: `template != 'page.immersive' and template != 'index'` → `template != 'page.immersive'`
3. Font preloads: replaced raw `<link rel="preload_tag" ...>` with `{{ settings.type_body_font | font_url | preload_tag: as: 'font' }}` and equivalent for header font

### sections/immersive-canvas.liquid ✅

1. Added `<header class="immersive-store__intro">` with `<h1>{{ 'sections.immersive_store.heading' | t }}</h1>`, intro `<p>`, and `<button type="button" class="immersive-store__launch-btn" data-immersive-launch>` before the canvas wrapper
2. Localized all hard-coded strings: menu items, search aria-label, cart button, menu button via `| t` filter
3. Upgraded `#immersive-menu` to proper ARIA dialog: added `aria-labelledby="immersive-menu-title"` and a visually-hidden `<h2 id="immersive-menu-title">`
4. Upgraded `#glass-panel` from `<aside aria-live="polite">` to `<section role="dialog" aria-modal="true" aria-labelledby="glass-panel-title">` with `<h2 id="glass-panel-title">`

### sections/glass-panel.liquid ✅

1. Replaced hard-coded `"This collection has no products yet."` with `{{ 'sections.immersive_store.collection_empty' | t }}`
2. Replaced hard-coded `"Collection not found."` with `{{ 'sections.immersive_store.collection_not_found' | t }}`
3. Replaced hard-coded `aria-label="Collection panel"` with `aria-label="{{ 'sections.immersive_store.collection_panel_aria' | t }}"`

### sections/glass-product.liquid ✅

1. Added `data-error-select-variant`, `data-error-add-to-cart`, `data-success-added` attributes to the `<section>` element
2. Localized collapsible headings: "Care Instructions", "Size Chart", "Disclaimer" via `| t`
3. Localized size table headers: "Size", "Bust", "Waist", "Hip" via `| t`
4. Localized disclaimer fallback text via `| t`
5. Localized "You May Also Like" heading via `| t`
6. Localized share label and all share button labels + aria-labels via `| t`
7. Added `role="radio"` and `aria-checked` to variant buttons; first variant gets `aria-checked="true"`, rest `aria-checked="false"`
8. Wrapped related product items in `<a href="{{ product.url }}" class="glass-product-section__related-item" data-product-handle="{{ product.handle }}">`
9. Fixed schema name to use `t:sections.glass_product.name` reference

### snippets/immersive-product-card.liquid ✅

1. Replaced `<button class="immersive-product-link">` wrapping the image with `<a href="{{ product.url }}" data-product-handle="{{ product.handle }}" class="immersive-product-link">` — CSS updated to remove button-specific resets
2. Replaced `<button class="immersive-product-title-link">` with `<a href="{{ product.url }}" data-product-handle="{{ product.handle }}" class="immersive-product-title-link">` — CSS updated to add `display: block`
3. Added `role="radio"` and `aria-checked="{% if forloop.first %}true{% else %}false{% endif %}"` to variant buttons

### snippets/virtual-tryon.liquid ✅

1. Added `role="status" aria-live="polite"` to `#virtual-tryon-loading` (was missing `role="status"`)
2. Removed `style="display:none;"` from `#virtual-tryon-error`; element is always in DOM with `role="alert" aria-live="assertive" aria-atomic="true"`; hidden via CSS `:empty { display: none }` pseudo-class
3. Localized all hard-coded strings via `| t` filter; JS-consumed strings also exposed as `data-*` attributes on the container (`data-upload-label`, `data-loading-title`, `data-loading-subtitle`, `data-result-label`)

### assets/immersive-store.js ✅

1. Replaced auto-init block at bottom with `bindImmersiveInit()` pattern gated on `[data-immersive-launch]` click; `initImmersiveScene()` and `bindImmersiveNav()` are only called after user gesture
2. Added `reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches` flag at module scope; `parallaxStrength` set to `0` when true; room transition `duration` set to `0` when true; `handleMouseMove` returns early when true
3. `renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.5 : 2))` — already correct; `isMobileDevice` uses `window.innerWidth < 768`
4. `mousemove` handler throttled via `mouseMoveRafPending` RAF flag — updates `uniforms.uMouse` at most once per animation frame
5. `setupBuyNowForm`: reads `data-error-select-variant` and `data-error-add-to-cart` from `.glass-product-section` element; falls back to English strings if attributes absent
6. `setupDeliveryDates`: reads `document.documentElement.lang || 'en-GB'`; wraps `toLocaleDateString` in try/catch with `'en-GB'` fallback
7. `openProductPanel` click handler: intercepts `<a data-product-handle>` clicks (step 5 in `panel.onclick`) via `event.target.closest('a[data-product-handle]')` → `preventDefault()` → `openProductPanel()`

### locales/en.default.json ✅

Added all missing keys:

- `sections.immersive_store`: `heading`, `intro`, `launch_button`, `menu.dialog_title`, `menu.close`, `menu.nav_aria`, `menu.storefront`, `menu.lounge`, `menu.designer_houses`, `menu.occasions`, `menu.featured_collections`, `menu.faq`, `search_aria`, `menu_button`, `cart_label`, `collection_empty`, `collection_not_found`, `collection_panel_aria`, `error_select_variant`, `error_add_to_cart`, `added_to_cart`
- `sections.immersive.product_panel`: `title`, `close`, `variant_group_label`, `care_heading`, `size_heading`, `disclaimer_heading`, `disclaimer_default`, `size_table.size`, `size_table.bust`, `size_table.waist`, `size_table.hip`, `related_heading`, `share_label`, `share_whatsapp`, `share_facebook`, `share_instagram`, `share_tiktok`, `share_on_whatsapp_aria`, `share_on_facebook_aria`, `share_on_instagram_aria`, `share_on_tiktok_aria`, `delivery_estimate`, `product_detail_aria`
- `sections.virtual_tryon`: `title`, `gate_title`, `gate_subtitle`, `gate_button`, `subtitle`, `upload_label`, `upload_aria`, `consent_text`, `button_label`, `loading_title`, `loading_subtitle`, `result_label`

### locales/en.default.schema.json ✅

Added schema entries:
- `sections.immersive_product_grid`: `name`, settings labels for `collection` and `products_per_page`
- `sections.glass_product`: `name`, settings labels for `show_vendor`, `show_size_chart`, `show_care_instructions`, `show_disclaimer`, `show_related_products`, `show_vto`

---

## Implementation Notes

### CSS changes in snippets

`immersive-product-card.liquid` CSS was updated alongside the HTML changes:
- `.immersive-product-link`: removed `border: none`, `padding: 0`, `background: transparent`, `cursor: pointer` (button resets); kept `display: block`, `text-decoration: none`
- `.immersive-product-title-link`: added `display: block`

### VTO error visibility

The error element uses CSS `:empty { display: none }` rather than JS `style.display` toggling. JS clears the element's `textContent` to hide it and sets `textContent` to show it — the `:empty` rule handles the visual state automatically, keeping the live region always in the DOM for screen readers.

### `<a data-product-handle>` interception order

In `openProductPanel`'s `panel.onclick` handler, the interception order is:
1. Backdrop click → `closePanel()`
2. Close button → `closePanel()`
3. Back button (`.glass-product-section__back`) → `openCollectionPanel()`
4. Related item (`.glass-product-section__related-item`) → `openProductPanel()`
5. Any `<a data-product-handle>` → `openProductPanel()` (catches card image/title links in collection grid)

Steps 4 and 5 are separate to preserve specificity — related items are matched by class first, then the broader `a[data-product-handle]` selector catches remaining cases.

### Regression prevention

- All standard Dawn pages continue to load only Dawn core scripts
- Header/footer render on all non-immersive templates
- Standard `/products/{handle}` and `/collections/{handle}` pages are unaffected
- Existing `sections.immersive.product_card.*` and `sections.immersive.product_grid.*` locale keys are unchanged
- Product forms remain `{% form 'product', product %}` — add-to-cart works without JS
