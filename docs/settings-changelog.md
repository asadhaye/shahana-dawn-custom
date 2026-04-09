# Settings Changelog

## 2026-04-02

### locales/en.default.schema.json — immersive_store section

- **Removed** `enable_vto`, `vto_require_login`, `vto_allowed_tags`, `best_sellers_collection`, `new_arrivals_collection` schema locale entries. These were stale — the corresponding setting IDs do not exist in `sections/immersive-canvas.liquid`'s `{% schema %}` block. No merchant-visible settings were affected.

### locales/en.default.schema.json — immersive_product_grid section

- **Added** locale keys for all previously hard-coded schema strings: `header_grid_layout`, `columns_desktop`, `columns_mobile` (+ option labels), `header_product_card`, `image_ratio` (+ option labels), `show_secondary_image`, `show_vendor`, `show_description`.

### locales/en.default.schema.json — glass_product section

- **Added** full locale key coverage for all `glass-product.liquid` schema settings: `header_media`, `media_size` (+ option labels), `constrain_to_viewport`, `header_product_info`, `show_vendor`, `show_rating` (+ info), `show_share_buttons`, `show_delivery_estimate`, `header_related`, `show_related`, `related_products_limit`, `header_vto`, `enable_virtual_tryon`.

### sections/glass-product.liquid — schema

- **Updated** all `"label"`, `"content"`, and `"info"` values to use `t:` references pointing to the new `sections.glass_product.settings.*` locale keys. No setting IDs, types, or defaults changed — no behavior impact.

### sections/immersive-product-grid.liquid — schema

- **Updated** all previously hard-coded `"label"`, `"content"`, and option `"label"` values to use `t:` references. No setting IDs, types, or defaults changed — no behavior impact.

## 2026-04-04

### locales/en.default.schema.json — immersive_editorial section (audit)

- **No change required.** An incoming diff attempted to restructure `options__1/2/3` keys into a nested `options.{value}` format (e.g. `options.designer_houses`). This format is non-standard for Shopify schema locales — the theme editor requires positional `options__N` keys. The file was already correct; the diff was reverted. No merchant-visible impact.

### IMMERSIVE-STORE.md — Product panel settings table

- **Updated** `show_related` and `related_products_limit` rows to note they are not yet wired: the `[data-related-root]` container and `loadProductRecommendations()` are always active regardless of `show_related`, and the `limit=4` in the recommendations URL is hard-coded in JS rather than reading `related_products_limit`.

### Prop wiring audit — immersive-product-card.liquid

- **No change.** `show_vendor` and `show_secondary_image` are correctly passed from `immersive-product-grid.liquid` to the card snippet and used in the card template.
- **Existing TODO confirmed:** `image_ratio` is defined in the grid schema and documented in IMMERSIVE-STORE.md but is not passed to the card render call and the card uses a fixed `aspect-ratio: 2 / 3` in CSS. See existing TODO note in IMMERSIVE-STORE.md.

### Translation key coverage — all three sections

- **glass-product.liquid**: all schema strings use `t:sections.glass_product.*` — fully covered in `en.default.schema.json`.
- **immersive-product-grid.liquid**: all schema strings use `t:sections.immersive_product_grid.*` — fully covered.
- **immersive-editorial.liquid**: all schema strings use `t:sections.immersive_editorial.*` — fully covered.

## 2026-04-05

### locales/en.default.json — wishlist keys added

- **Added** `sections.immersive_store.wishlist` object with 12 keys: `button_aria`, `panel_title`, `close`, `empty`, `save`, `saved`, `save_label`, `saved_label`, `view_product`, `remove`, `item_count`, `item_count_plural`. These are consumed by the immersive wishlist feature (Task 1 of the immersive-wishlist spec).
- No schema changes. No setting IDs, types, defaults, or guard logic changed. No behavior impact on existing shops.

### Prop wiring audit (triggered by locale edit)

- **No change required.** `show_vendor` and `show_secondary_image` remain correctly wired from `immersive-product-grid.liquid` → `immersive-product-card.liquid`. `image_ratio` TODO remains open (not passed to card render call; card uses fixed `aspect-ratio: 2 / 3`).

### Wishlist toggle markup — pre-implementation check

- `immersive-product-card.liquid` and `glass-product.liquid` already contain `[data-wishlist-toggle]` buttons with correct `data-product-handle`, `aria-pressed`, `data-label-save`, `data-label-saved` attributes and wishlist CSS in their `{% stylesheet %}` blocks. Tasks 3 and 4 of the wishlist spec are complete.

## 2026-04-08

### assets/immersive-store.js — init guard and additional subsystems

- **`safeBindImmersiveInit()`** replaces the simpler `bindImmersiveInit()` as the actual DOMContentLoaded entry point. It guards against double-init (critical in the theme editor), tears down the existing WebGL renderer before re-initializing, and handles `shopify:section:load`, `shopify:section:select`, and `shopify:section:unload` events.
- **`showImmersiveOnboardingIfNeeded()`** — reads `ONBOARDING_KEY` from localStorage; shows `#immersive-onboarding` dialog on first visit if `section.settings.onboarding_enabled` is true. Controlled by `data-show-once` attribute.
- **`initWishlist()`** — initializes the localStorage-backed wishlist manager. Reads `WISHLIST_KEY`, wires `[data-wishlist-open]`, `[data-wishlist-close]`, and `[data-wishlist-toggle]` buttons. Wishlist panel is `#immersive-wishlist-panel`.
- **`bindCookieBanner()`** — shows `#immersive-cookie-banner` if `COOKIE_KEY` not set in localStorage. Accept and decline both dismiss the banner and set the key.
- **URL param handling** moved inside `safeBindImmersiveInit()` — no separate `handleURLParams()` function. Priority: `open_product` > `open_collection` > `open_search`.

### steering docs — sync with actual code

- Updated `shopify.dev_assistant.md`: corrected `bindImmersiveInit` → `safeBindImmersiveInit`, fixed glass panel DOM class (`immersive-store__panel`), updated `sections.immersive_store` locale key list to include wishlist and cookie banner namespaces.
- Updated `immersive-store.md` section 2: corrected core files description for `immersive-canvas.liquid` and `immersive-store.js`.
- Updated `tech.md`: added wishlist manager, cookie consent, onboarding to `immersive-store.js` description.
