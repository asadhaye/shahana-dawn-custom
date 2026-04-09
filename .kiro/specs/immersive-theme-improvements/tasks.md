# Implementation Tasks

- [x] 1. Fix layout/theme.liquid
  - [x] 1.1 Change script loading condition from `template == 'page.immersive' or template == 'index'` to `template == 'page.immersive'`
  - [x] 1.2 Change header/footer condition from `template != 'page.immersive' and template != 'index'` to `template != 'page.immersive'`
  - [x] 1.3 Replace raw `<link rel="preload_tag" ...>` font preloads with `preload_tag` Liquid filter

- [x] 2. Fix locales/en.default.json — add all missing translation keys
  - [x] 2.1 Add `sections.immersive_store` keys: heading, intro, launch_button, menu.*, search_aria, menu_button, cart_label, collection_empty, collection_not_found, collection_panel_aria, error_select_variant, error_add_to_cart, added_to_cart
  - [x] 2.2 Add `sections.immersive.product_panel` keys: title, close, variant_group_label, care_heading, size_heading, disclaimer_heading, disclaimer_default, size_table.*, related_heading, share_label, share_whatsapp, share_facebook, share_instagram, share_tiktok, share_on_*_aria, delivery_estimate, product_detail_aria
  - [x] 2.3 Add `sections.virtual_tryon` keys: title, gate_title, gate_subtitle, gate_button, subtitle, upload_label, upload_aria, consent_text, button_label, loading_title, loading_subtitle, result_label

- [x] 3. Fix locales/en.default.schema.json — add schema entries
  - [x] 3.1 Add `sections.immersive_product_grid` schema entry
  - [x] 3.2 Add `sections.glass_product` schema entry

- [x] 4. Fix sections/immersive-canvas.liquid
  - [x] 4.1 Add intro header with `<h1>`, intro `<p>`, and `<button data-immersive-launch>` before canvas wrapper
  - [x] 4.2 Localize all hard-coded strings (menu items, search aria-label, cart button, menu button)
  - [x] 4.3 Add `aria-labelledby="immersive-menu-title"` and hidden `<h2 id="immersive-menu-title">` to `#immersive-menu`
  - [x] 4.4 Upgrade `#glass-panel` from `<aside aria-live="polite">` to `<section role="dialog" aria-modal="true" aria-labelledby="glass-panel-title">` with `<h2 id="glass-panel-title">`

- [x] 5. Fix sections/glass-panel.liquid
  - [x] 5.1 Localize empty/not-found strings and aria-label

- [x] 6. Fix sections/glass-product.liquid
  - [x] 6.1 Add `data-error-select-variant`, `data-error-add-to-cart`, `data-success-added` to `<section>`
  - [x] 6.2 Localize all hard-coded strings (collapsibles, size table, share, related heading)
  - [x] 6.3 Add `role="radio"` and `aria-checked` to variant buttons
  - [x] 6.4 Wrap related product items in `<a href="{{ product.url }}" data-product-handle>`
  - [x] 6.5 Fix schema name to use `t:` reference

- [x] 7. Fix snippets/immersive-product-card.liquid
  - [x] 7.1 Replace image `<button>` wrapper with `<a href="{{ product.url }}" data-product-handle>`
  - [x] 7.2 Replace title `<button>` wrapper with `<a href="{{ product.url }}" data-product-handle>`
  - [x] 7.3 Add `role="radio"` and `aria-checked` to variant buttons

- [x] 8. Fix snippets/virtual-tryon.liquid
  - [x] 8.1 Add `role="status" aria-live="polite"` to loading container
  - [x] 8.2 Remove `style="display:none;"` from error element; keep it always in DOM
  - [x] 8.3 Localize all hard-coded strings via `data-*` attributes and `| t` filter

- [x] 9. Fix assets/immersive-store.js
  - [x] 9.1 Replace auto-init block with `bindImmersiveInit()` gated on `[data-immersive-launch]` click
  - [x] 9.2 Add `reduceMotion` flag; set `parallaxStrength = 0` when true; clamp `devicePixelRatio`
  - [x] 9.3 Throttle `mousemove` parallax via `requestAnimationFrame`
  - [x] 9.4 Read localized messages from `data-*` attributes in `setupBuyNowForm`
  - [x] 9.5 Use `document.documentElement.lang` in `setupDeliveryDates`
  - [x] 9.6 Intercept `<a data-product-handle>` clicks for related items in `openProductPanel`



