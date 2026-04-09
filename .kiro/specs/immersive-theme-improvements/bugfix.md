# Bugfix Requirements Document

## Introduction

The immersive store experience (a WebGL progressive enhancement on top of Dawn) has accumulated a set of defects across performance, accessibility, SEO, and localization. These issues affect all visitors to the `page.immersive` template and, in some cases, bleed into standard Dawn pages. The fixes must be applied without breaking any existing Dawn functionality.

---

## Bug Analysis

### Current Behavior (Defect)

**Performance / Script Loading**

1.1 WHEN any page other than `page.immersive` is loaded THEN the system loads `three.min.js` and `immersive-store.js` on the `index` template unnecessarily, wasting bandwidth and parse time for visitors who never enter the immersive experience.

1.2 WHEN the `page.immersive` template is loaded THEN the system auto-initialises the WebGL scene on `DOMContentLoaded` without any user gesture, causing heavy GPU work before the visitor has opted in.

1.3 WHEN `layout/theme.liquid` renders font preload tags THEN the system emits `<link rel="preload_tag" ...>` as a raw HTML attribute string instead of using the Liquid `preload_tag` filter, producing invalid markup that browsers ignore.

1.4 WHEN any page other than `page.immersive` is loaded THEN the system hides the Dawn header and footer on the `index` template as well, breaking the homepage navigation.

1.5 WHEN the `page.immersive` template is loaded THEN the system does not clamp `devicePixelRatio` with a `reduceMotion` check, and does not throttle `mousemove` parallax via `requestAnimationFrame`, causing excessive GPU and CPU load on high-DPI and low-power devices.

**SEO / Internal Linking**

1.6 WHEN the `page.immersive` template is loaded THEN the system renders no `<h1>` element and no descriptive intro paragraph, leaving the page without primary heading content for search engines.

1.7 WHEN a product card is rendered in `snippets/immersive-product-card.liquid` THEN the system wraps the product image and title in `<button>` elements only, with no `<a href="{{ product.url }}">` link, so search engine crawlers cannot discover or index product pages from the immersive experience.

1.8 WHEN "You may also like" related products are rendered in `sections/glass-product.liquid` THEN the system renders them as `<div data-product-handle>` elements with no anchor tag, making them invisible to crawlers.

**Accessibility — Dialogs**

1.9 WHEN the immersive menu (`#immersive-menu`) is opened THEN the system does not move focus into the dialog, does not trap Tab/Shift+Tab within it, does not close on `Escape`, and does not restore focus to the trigger on close, violating ARIA dialog requirements.

1.10 WHEN the glass panel (`#glass-panel`) is opened THEN the system uses `aria-live="polite"` on an `<aside>` element instead of `role="dialog" aria-modal="true" aria-labelledby`, and does not implement focus management or focus trapping.

1.11 WHEN the immersive menu is rendered THEN the system omits `aria-labelledby` pointing to a dialog title element, so screen readers cannot announce the dialog name.

**Accessibility — Variant Selection**

1.12 WHEN variant buttons are rendered in `sections/glass-product.liquid` THEN the system uses `role="radiogroup"` on the container but the child `<button>` elements lack `role="radio"` and `aria-checked` attributes, breaking the radiogroup contract.

1.13 WHEN variant buttons are rendered in `snippets/immersive-product-card.liquid` THEN the same `role="radiogroup"` / missing `role="radio"` / `aria-checked` defect is present.

**Accessibility — VTO Widget**

1.14 WHEN the virtual try-on loading state is shown THEN the system uses `aria-live="polite"` on the loading container but omits `role="status"`, so some screen readers do not announce progress updates.

1.15 WHEN a virtual try-on error occurs THEN the system shows the error element with `role="alert"` but hides it with `display:none` initially and toggles it, meaning the element is not always in the DOM as required for reliable live-region announcements.

**Localization — Hard-coded Strings**

1.16 WHEN `sections/immersive-canvas.liquid` is rendered THEN the system outputs hard-coded English strings for menu items ("Storefront", "Lounge", "Designer Houses", "Occasions", "Featured Collections", "FAQ"), the search `aria-label` ("Search"), the cart button ("Cart ({{ count }})"), and the menu button ("Menu"), none of which pass through the `| t` filter.

1.17 WHEN `sections/glass-panel.liquid` is rendered with an empty collection THEN the system outputs the hard-coded string "This collection has no products yet." and "Collection not found." without using the `| t` filter.

1.18 WHEN `sections/glass-product.liquid` is rendered THEN the system outputs hard-coded English strings for collapsible headings ("Care Instructions", "Size Chart", "Disclaimer"), size table headers ("Size", "Bust", "Waist", "Hip"), the disclaimer fallback text, the "You May Also Like" heading, share button labels ("Share", "WhatsApp", "Facebook", "Instagram", "TikTok"), and share `aria-label` values, none of which pass through the `| t` filter.

1.19 WHEN `snippets/virtual-tryon.liquid` is rendered THEN the system outputs hard-coded English strings for the widget title ("Virtual Try-On"), gate copy ("Sign in to try this on", "Get 1 free virtual try-on…"), gate button ("Sign in / Create account"), subtitle, upload label ("Choose a photo"), consent text, try-on button ("Try this on"), loading copy ("Generating your look…", "This takes about 30–45 seconds"), and result label ("Your virtual try-on"), none of which pass through the `| t` filter.

1.20 WHEN `assets/immersive-store.js` constructs error or success feedback messages THEN the system uses hard-coded English strings ("Please select a size", "Unable to add to cart", etc.) instead of reading localised strings from `data-*` attributes on the container element.

1.21 WHEN `assets/immersive-store.js` formats delivery dates THEN the system hard-codes the locale `'en-GB'` instead of reading `document.documentElement.lang`.

**Localization — Missing Translation Keys**

1.22 WHEN `locales/en.default.json` is inspected THEN the system is missing the following keys required by the immersive sections: `sections.immersive_store.heading`, `sections.immersive_store.intro`, `sections.immersive_store.launch_button`, `sections.immersive_store.menu.*` (dialog_title, close, nav_aria, storefront, lounge, designer_houses, occasions, featured_collections, faq), `sections.immersive_store.search_aria`, `sections.immersive_store.menu_button`, `sections.immersive_store.cart_label`, `sections.immersive_store.collection_empty`, `sections.immersive_store.collection_not_found`, `sections.immersive_store.collection_panel_aria`, `sections.immersive_store.error_select_variant`, `sections.immersive_store.error_add_to_cart`, `sections.immersive_store.added_to_cart`, and all keys under `sections.immersive.product_panel` and `sections.virtual_tryon`.

1.23 WHEN `locales/en.default.schema.json` is inspected THEN the system is missing schema translation entries for `sections.immersive_product_grid` and `sections.glass_product` settings labels and preset names.

---

### Expected Behavior (Correct)

**Performance / Script Loading**

2.1 WHEN any page other than `page.immersive` is loaded THEN the system SHALL NOT load `three.min.js` or `immersive-store.js`; those scripts SHALL be gated exclusively behind `{%- if template == 'page.immersive' -%}`.

2.2 WHEN the `page.immersive` template is loaded THEN the system SHALL gate `initImmersiveScene()` behind a `[data-immersive-launch]` button click, never auto-initialising on page load.

2.3 WHEN `layout/theme.liquid` renders font preload tags THEN the system SHALL use `{{ settings.type_body_font | font_url | preload_tag: as: 'font' }}` and the equivalent for the header font, producing valid `<link rel="preload">` elements.

2.4 WHEN any page other than `page.immersive` is loaded THEN the system SHALL render the Dawn header and footer groups; the condition SHALL be `template != 'page.immersive'` only.

2.5 WHEN the `page.immersive` template is loaded THEN the system SHALL read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` into a `reduceMotion` flag, set `parallaxStrength` to `0` when true, clamp `devicePixelRatio` to `1.5` on mobile and `2` on desktop, and throttle `mousemove` parallax updates via `requestAnimationFrame`.

**SEO / Internal Linking**

2.6 WHEN the `page.immersive` template is loaded THEN the system SHALL render an `<h1>` element using `{{ 'sections.immersive_store.heading' | t }}` and a descriptive intro paragraph using `{{ 'sections.immersive_store.intro' | t }}` inside a `[data-immersive-launch]` intro header.

2.7 WHEN a product card is rendered in `snippets/immersive-product-card.liquid` THEN the system SHALL wrap the product image and title in `<a href="{{ product.url }}" data-product-handle="{{ product.handle }}">` so crawlers can follow the link; JS SHALL intercept the click via `preventDefault()` to open the glass panel instead.

2.8 WHEN "You may also like" related products are rendered in `sections/glass-product.liquid` THEN the system SHALL wrap each item in `<a href="{{ product.url }}" data-product-handle="{{ product.handle }}">` so crawlers can discover product pages.

**Accessibility — Dialogs**

2.9 WHEN the immersive menu is opened THEN the system SHALL save `document.activeElement`, move focus to the first focusable element inside the menu, trap Tab/Shift+Tab within the menu, close the menu on `Escape`, and restore focus to the trigger button on close.

2.10 WHEN the glass panel is opened THEN the system SHALL use `role="dialog" aria-modal="true" aria-labelledby="glass-panel-title"` on the panel element, save `document.activeElement`, move focus to the close button or first heading, trap Tab/Shift+Tab within the panel, close on `Escape`, and restore focus to the trigger on close.

2.11 WHEN the immersive menu is rendered THEN the system SHALL include a visually-hidden or visible `<h2 id="immersive-menu-title">` element and set `aria-labelledby="immersive-menu-title"` on the dialog container.

**Accessibility — Variant Selection**

2.12 WHEN variant buttons are rendered in `sections/glass-product.liquid` THEN the system SHALL add `role="radio"` to each button and `aria-checked="true"` to the initially selected variant, keeping `aria-checked` in sync as the user selects variants.

2.13 WHEN variant buttons are rendered in `snippets/immersive-product-card.liquid` THEN the system SHALL apply the same `role="radio"` / `aria-checked` pattern as 2.12.

**Accessibility — VTO Widget**

2.14 WHEN the virtual try-on loading state is shown THEN the system SHALL have `role="status" aria-live="polite"` on the loading container element.

2.15 WHEN the virtual try-on error element is rendered THEN the system SHALL keep it always present in the DOM (never `display:none` on initial render), toggling only its text content and visibility, with `role="alert" aria-live="assertive"` permanently set.

**Localization — Hard-coded Strings**

2.16 WHEN `sections/immersive-canvas.liquid` is rendered THEN the system SHALL output all menu items, the search aria-label, cart label, and menu button text via the `| t` filter using the keys defined in `sections.immersive_store`.

2.17 WHEN `sections/glass-panel.liquid` is rendered with an empty or missing collection THEN the system SHALL output empty/error strings via `{{ 'sections.immersive_store.collection_empty' | t }}` and `{{ 'sections.immersive_store.collection_not_found' | t }}`.

2.18 WHEN `sections/glass-product.liquid` is rendered THEN the system SHALL output all collapsible headings, size table headers, disclaimer fallback, "You May Also Like" heading, share label, share button labels, and share aria-labels via the `| t` filter using keys under `sections.immersive.product_panel`.

2.19 WHEN `snippets/virtual-tryon.liquid` is rendered THEN the system SHALL output all user-facing strings via the `| t` filter using keys under `sections.virtual_tryon`.

2.20 WHEN `assets/immersive-store.js` constructs feedback messages THEN the system SHALL read localised strings from `data-error-select-variant`, `data-error-add-to-cart`, and `data-success-added` attributes on the container element, falling back to English only if the attribute is absent.

2.21 WHEN `assets/immersive-store.js` formats delivery dates THEN the system SHALL read `document.documentElement.lang` and pass it to `toLocaleDateString`, falling back to `'en-GB'` only on error.

**Localization — Missing Translation Keys**

2.22 WHEN `locales/en.default.json` is inspected THEN the system SHALL contain all keys listed in 1.22 with appropriate English values.

2.23 WHEN `locales/en.default.schema.json` is inspected THEN the system SHALL contain schema translation entries for `sections.immersive_product_grid` and `sections.glass_product` covering all `label`, `name`, `content`, and `preset_name` values used in those sections' `{% schema %}` blocks.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN any standard Dawn page (product, collection, blog, cart, account, etc.) is loaded THEN the system SHALL CONTINUE TO render the Dawn header and footer groups as before.

3.2 WHEN any standard Dawn page is loaded THEN the system SHALL CONTINUE TO load only the Dawn core scripts (`constants.js`, `pubsub.js`, `global.js`, etc.) without any immersive-specific scripts.

3.3 WHEN `/products/{handle}` or `/collections/{handle}` is visited directly THEN the system SHALL CONTINUE TO render the full standard Dawn product/collection page independently of the immersive experience.

3.4 WHEN the `page.immersive` template is loaded and the user clicks the launch button THEN the system SHALL CONTINUE TO initialise the WebGL scene, load room textures, render hotspots, and support room navigation exactly as before.

3.5 WHEN a product card is clicked inside the immersive experience THEN the system SHALL CONTINUE TO open the glass panel with the product detail view via the Section Rendering API, with JS intercepting the anchor click via `preventDefault()`.

3.6 WHEN the glass panel is open and the user adds a product to cart THEN the system SHALL CONTINUE TO submit the standard Shopify product form (`{% form 'product', product %}`) so add-to-cart works without JS.

3.7 WHEN the virtual try-on widget is rendered for a signed-in user THEN the system SHALL CONTINUE TO allow photo upload, quota checking, and API submission as before.

3.8 WHEN the virtual try-on widget is rendered for a signed-out user THEN the system SHALL CONTINUE TO show the login gate with a link to `/account/login`.

3.9 WHEN `locales/en.default.json` already contains keys (e.g. `sections.immersive.product_card.*`, `sections.immersive.product_grid.*`) THEN the system SHALL CONTINUE TO serve those existing translations unchanged.

3.10 WHEN the WebGL scene is running on a device that does not prefer reduced motion THEN the system SHALL CONTINUE TO apply parallax effects and room transition animations at full strength.

3.11 WHEN the font preload tags are corrected THEN the system SHALL CONTINUE TO preload only non-system fonts, leaving system font configurations unaffected.
