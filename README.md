# Shahana Collection – Immersive Store (Dawn-based OS 2.0 theme)

Shahana Collection is a heavily customized Shopify Online Store 2.0 theme built on top of [Dawn](/changelog/online-store-2-0-new-reference-theme-available-dawn). It implements a dual‑mode “Immersive Store” experience:

- A conventional 2D storefront at `/` powered by `templates/index.json`
- A WebGL 3D experience at `/pages/immersive` powered by the alternate JSON template `templates/page.immersive.json`

The immersive 3D page uses a single Three.js canvas to move shoppers through a series of “rooms” that drive navigation, product discovery, and editorial overlays, while still respecting Shopify’s [alternate template](/docs/storefronts/themes/architecture/templates/alternate-templates) and [Section Rendering API](/docs/api/ajax/section-rendering) patterns.

This README explains the architecture, how the immersive flow works, and how to safely change or debug behavior without replacing the existing layout with a standard one.

---

## Table of contents

1. [Architecture overview](#architecture-overview)  
2. [Routing and templates](#routing-and-templates)  
   - [2D storefront – `templates/index.json`](#2d-storefront--templatesindexjson)  
   - [3D immersive page – `templates/page.immersive.json`](#3d-immersive-page--templatespageimmersivejson)  
   - [Alternate template behavior (`?view=immersive`)](#alternate-template-behavior-viewimmersive)  
3. [Core immersive experience](#core-immersive-experience)  
   - [Rooms and navigation (`STORE_ROOMS`)](#rooms-and-navigation-store_rooms)  
   - [WebGL canvas and parallax depth maps](#webgl-canvas-and-parallax-depth-maps)  
   - [Glass panels (collections & products)](#glass-panels-collections--products)  
   - [Editorial overlays](#editorial-overlays)  
4. [Key Liquid files](#key-liquid-files)  
   - [`sections/immersive-canvas.liquid`](#sectionsimmersive-canvasliquid)  
   - [`sections/immersive-editorial.liquid`](#sectionsimmersive-editorialliquid)  
   - [`snippets/immersive-bridge-btn.liquid`](#snippetsimmersive-bridge-btnliquid)  
   - [`layout/theme.liquid`](#layoutthemeliquid)  
5. [JavaScript & CSS](#javascript--css)  
   - [`assets/immersive-store.js`](#assetsimmersive-storejs)  
   - [`assets/immersive-theme.css`](#assetsimmersive-themecss)  
   - [`assets/bridge-behavior.js`](#assetsbridge-behaviorjs)  
6. [State & preferences](#state--preferences)  
   - [`immersive_preferred_mode` in `localStorage`](#immersive_preferred_mode-in-localstorage)  
   - [Onboarding and cookies](#onboarding-and-cookies)  
7. [Developing & debugging](#developing--debugging)  
   - [Working with room config](#working-with-room-config)  
   - [Debugging Section Rendering calls](#debugging-section-rendering-calls)  
   - [Editing immersive/editorial sections in the theme editor](#editing-immersiveeditorial-sections-in-the-theme-editor)  
   - [Common pitfalls](#common-pitfalls)  

---

## Architecture overview

This theme keeps a **standard Dawn layout and 2D storefront**, and layers an immersive 3D experience on top via:

- A **page alternate template**: `page.immersive.json` (for `/pages/immersive`)
- A **single immersive canvas section** (`sections/immersive-canvas.liquid`) that:
  - Boots a Three.js scene from `assets/three.min.js`
  - Exposes room configuration to JS via an inline JSON script block
  - Hosts overlays (wishlist, onboarding, cookie consent, editorial)
- A **set of supporting sections/snippets** that use Shopify’s [Section Rendering API](/docs/api/ajax/section-rendering) to load collections/products/editorial content into the immersive UI without full page reloads.

All JavaScript is **vanilla ES** and lives in `assets/*.js`. There is **no bundler**; any new scripts must be vendor‑ready and referenced directly in Liquid.

---

## Routing and templates

### 2D storefront – `templates/index.json`

- Path: `/`
- Template: `templates/index.json`
- Behavior: Standard Dawn home page (header, hero, featured collections, etc.).
- The 2D experience is the default for all visitors who haven’t explicitly chosen the immersive mode or who are on devices/network conditions where immersive mode isn’t appropriate.

You **should not** add immersive‑only markup or logic to `index.json` itself; instead, use reusable snippets like `snippets/immersive-bridge-btn.liquid` as “bridges” leading to `/pages/immersive`.

---

### 3D immersive page – `templates/page.immersive.json`

- Path: `/pages/immersive`
- Template file: `templates/page.immersive.json`
- This is an **alternate page template** that follows Shopify’s naming convention:
- Keep Liquid, HTML, CSS, and JS valid and free from external library dependencies (beyond `three.min.js`).
- Maintain translation coverage by using `{{ 'key' | t }}` for any new user-facing text.
- Preserve the existing immersive architecture rather than replacing it with a standard Dawn layout.


text page.immersive.json

  where:
  - `template-name` = `page`
  - `template-suffix` = `immersive`
  - `template-file-type` = `json`  

  See [Alternate templates – Name structure](/docs/storefronts/themes/architecture/templates/alternate-templates#name-structure) for details.

- This JSON template typically includes:
  - A main `immersive-canvas` section
  - One or more `immersive-editorial` sections that will be rendered on demand via the Section Rendering API
  - Minimal surrounding Dawn layout (header/footer still come from `layout/theme.liquid`)

To assign it to the “Immersive” page in the Shopify admin:

1. Create a standard Page (e.g. “Immersive Store”) at `/pages/immersive`.
2. In the page settings (Online Store → Pages → Immersive Store):
   - Choose the **Theme template** named `page.immersive`.
3. Save.

---

### Alternate template behavior (`?view=immersive`)

Because `page.immersive.json` is an alternate template, you can also **force it via the `view` parameter**:


text /pages/immersive?view=immersive

This follows the pattern described in the docs for [rendering alternate templates with `view`](/docs/storefronts/themes/architecture/templates/alternate-templates#render-an-alternate-template):


text /products/example-product?view=alternate

In practice, normal navigation to `/pages/immersive` is enough once the page is assigned the `page.immersive` template, but the `?view=` trick is useful for debugging template selection issues.

---

## Core immersive experience

### Rooms and navigation (`STORE_ROOMS`)

All immersive “rooms” are defined in JavaScript:

- File: `assets/immersive-store.js`
- Global configuration: `STORE_ROOMS`

`STORE_ROOMS` acts as the **source of truth** for room metadata:

- Room keys:  
  `storefront → lounge → designer_houses / occasions / featured_collections`
- Per-room config:
  - Texture/asset URLs (backgrounds, depth maps)
  - Hotspot locations and behaviors
  - Optional editorial configuration (which `immersive-editorial` section it maps to)

At runtime, this config is **merged/overridden** with per‑section JSON emitted by `sections/immersive-canvas.liquid` (see next section).

#### How room config override works

1. **Base config**: `STORE_ROOMS` (hardcoded in `assets/immersive-store.js`).
2. **Runtime overrides**:
   - `sections/immersive-canvas.liquid` renders a `<script>` element:


   html

      - On page load, `immersive-store.js` reads this script, parses the JSON, and shallow/deep merges it with `STORE_ROOMS`.
   - This enables you to:
     - Adjust room textures
     - Change hotspots
     - Point to different collections/products/editorial without touching the JS file.

Whenever possible, **prefer editing the JSON emitted by `immersive-canvas`** over changing `STORE_ROOMS` directly, so that non‑technical collaborators can tweak content in the Theme Editor.

---

### WebGL canvas and parallax depth maps

- Core script: `assets/immersive-store.js`
- Three.js vendor file: `assets/three.min.js`
- Canvas is created and controlled from within `sections/immersive-canvas.liquid` (markup) and `immersive-store.js` (logic).

Features:

- Single `<canvas>` element for all rooms.
- Each room uses:
  - A color texture
  - A depth map (for parallax/displacement on mouse/touch move)
- Camera/scene updates are tied to the current `roomKey` and triggered by hotspot interaction.

If you need to debug or extend the experience:

- Inspect the `<canvas>` and its container on `/pages/immersive`.
- Look at room transitions fired by hotspot click handlers in `immersive-store.js`.
- Add `console.debug` logs keyed by `roomKey` and the active `STATE` object (if present) to track transitions.

---

### Glass panels (collections & products)

Glass panels are **lazy‑loaded fragments** retrieved from the **Section Rendering API** based on a Section ID:

- Collection glass panel: `?section_id=glass-panel`
- Product glass panel: `?section_id=glass-product`

Flow:

1. A hotspot in a room is configured to open either a collection or a product glass panel.
2. When clicked:
   - JS in `assets/immersive-store.js` calls the Section Rendering API:

   text /?section_id=glass-panel /?section_id=glass-product

     > Note: This is a variant of the [Section Rendering API](/docs/api/ajax/section-rendering); instead of using `?sections=...` it uses `?section_id=...` to retrieve a single section.

3. The returned HTML is injected into the appropriate glass panel container in the immersive DOM.
4. Panel open/close, focus management, and scroll locking are handled by `immersive-store.js`.

To **change the content or layout** of the glass panels, edit the corresponding section files (e.g. `sections/glass-panel.liquid`, `sections/glass-product.liquid` if present in this theme).

---

### Editorial overlays

Editorial content is handled separately from product/collection glass panels.

- Section file: `sections/immersive-editorial.liquid` (multiple instances allowed)
- JS entry point: `enterEditorialMode(roomKey, triggerEl)` in `assets/immersive-store.js`
- Target DOM container: `#immersive-editorial-overlay`

Flow:

1. Each relevant room in `STORE_ROOMS` is given an editorial reference (via the runtime JSON config or the base config).
2. That reference resolves to a particular `immersive-editorial` section instance in `page.immersive.json`.
3. When a room’s editorial hotspot is triggered:
   - `enterEditorialMode(roomKey, triggerEl)` is called.
   - JS reads `data-section-id` from the corresponding `immersive-editorial` section instance.
   - It calls the Section Rendering API with `?section_id=<that-id>`.
   - The response markup is injected into `#immersive-editorial-overlay`.
4. Overlay open/close, transitions, and focus behavior are handled by `immersive-store.js`.

**To add or modify editorial content:**

- Add/duplicate an `immersive-editorial` section in `templates/page.immersive.json`.
- Use the Theme Editor to populate its content.
- Ensure its `id` is wired up to the right `roomKey` via the runtime JSON config from `immersive-canvas`.

---

## Key Liquid files

### `sections/immersive-canvas.liquid`

Responsibilities:

- Render the host containers for:
  - WebGL `<canvas>`
  - Wishlist panel: `#immersive-wishlist-panel`
  - Onboarding overlay: `#immersive-onboarding`
  - Cookie banner: `#immersive-cookie-banner`
  - Editorial overlay container: `#immersive-editorial-overlay`
- Emit a `<script id="immersive-rooms-config" type="application/json">` block with per‑room overrides.
- Include any per‑section styling via `{% stylesheet %}` blocks (BEM: `.immersive-*`).

When editing:

- Keep IDs and class names in sync with `immersive-store.js`.
- Avoid hardcoding URLs in JS; prefer passing them via the JSON config from this section.

---

### `sections/immersive-editorial.liquid`

Responsibilities:

- Provide structured editorial content (copy, media, CTAs) for specific rooms.
- Be **static on the page**, but only rendered on demand via the Section Rendering API.
- Each instance has a unique `section.id` which `immersive-store.js` uses in `?section_id=` requests.

When editing:

- Treat each instance as a “scene” or “chapter” tied to one room.
- Expose enough settings (title, subtitle, body, image, CTA link) to be editable in the Theme Editor.
- Don’t add direct references to the WebGL canvas; that’s handled by `immersive-canvas`.

---

### `snippets/immersive-bridge-btn.liquid`

Responsibilities:

- Render “bridge” CTAs on 2D pages that link into the immersive experience.
- Use an attribute like `data-immersive-bridge` that `assets/bridge-behavior.js` listens for.
- All user-facing text must be translated via `{{ 'key' | t }}`; don’t hardcode labels.

Typical use:
liquid {% render 'immersive-bridge-btn', context: 'homepage_hero' %}

Behavior:

- On click, `bridge-behavior.js`:
  - Checks device capabilities and network conditions.
  - Decides whether to:
    - Navigate directly to `/pages/immersive`
    - Show a warning or a “Try 2D instead” message
    - Potentially respect `immersive_preferred_mode` from `localStorage`

When modifying:

- Keep the button’s markup lightweight and semantic.
- Ensure you preserve the `data-immersive-bridge` hook.

---

### `layout/theme.liquid`

Responsibilities:

- Standard Dawn layout: `<head>`, `<body>`, global header/footer, `{{ content_for_layout }}`.
- Hosts the **preference banner** that appears on non‑immersive pages when a user has chosen immersive as their preferred mode.

Behavior:

- On 2D pages, if `localStorage.immersive_preferred_mode === '3d'`, a **preference banner** is shown.
- The banner likely contains:
  - Messaging like “You prefer our 3D experience – continue in immersive mode?”
  - A CTA back to `/pages/immersive`

When editing:

- Keep this banner minimal and accessible (use ARIA roles and focus trapping if it’s modal‑like).
- Don’t move immersive‑specific overlays here; they belong inside `immersive-canvas` on the immersive page.

---

## JavaScript & CSS

### `assets/immersive-store.js`

This is the **main immersive engine**.

Key responsibilities:

- Initialize Three.js scene from `assets/three.min.js`.
- Manage `STORE_ROOMS` (base config) and apply overrides from `#immersive-rooms-config`.
- Wire up hotspots:
  - Room transitions
  - Collection/product glass panels (`?section_id=glass-panel` / `?section_id=glass-product`)
  - Editorial overlays (`enterEditorialMode(roomKey, triggerEl)`)
- Control:
  - Wishlist panel (`#immersive-wishlist-panel`)
  - Onboarding overlay (`#immersive-onboarding`)
  - Cookie banner (`#immersive-cookie-banner`)
- Handle **View Transitions API** where applicable for smoother UI state changes.

Guidelines:

- Keep it vanilla JS, no build step.
- When adding features, prefer modular functions rather than growing single monolith handlers.
- Respect existing global namespaces to avoid collisions.

---

### `assets/immersive-theme.css`

- Applies only on the immersive page / immersive flows.
- Contains base styling for `.immersive-*` BEM classes.
- More component‑specific CSS can still live in `{% stylesheet %}` blocks within sections/snippets, but this file holds:
  - Layout scaffolding for the immersive page
  - Shared tokens (colors, typography) for immersive components

If you add new immersive UI elements, define:

- Structural/layout styles here.
- Fine‑grained component styling in the relevant Liquid section’s `{% stylesheet %}` block.

---

### `assets/bridge-behavior.js`

Responsibilities:

- Finds all elements with `data-immersive-bridge`.
- Hooks click events to:
  - Examine device type and connection information (e.g., `navigator.connection` if available).
  - Decide how/whether to route to `/pages/immersive`.
  - Potentially:
    - Show tailored copy for low‑power devices
    - Offer a 2D‑only fallback
    - Record user choice (`immersive_preferred_mode`).

When editing:

- Keep logic defensive: if network/device APIs aren’t available, fall back to simple navigation.
- Keep any user‑facing strings in Liquid (for translation), and just toggle classes/attributes from JS.

---

## State & preferences

### `immersive_preferred_mode` in `localStorage`

- Key: `immersive_preferred_mode`
- Values:
  - `'3d'` – user prefers immersive mode
  - Potentially `'2d'` or unset – user prefers 2D or hasn’t chosen

Usage:

- When a user accepts immersive mode (e.g., from onboarding or a bridge CTA), `immersive-store.js` or `bridge-behavior.js` writes `localStorage.immersive_preferred_mode = '3d'`.
- On non‑immersive pages, `layout/theme.liquid` checks this key and, if set to `'3d'`, displays a **preference banner** prompting users to re‑enter the 3D experience.

---

### Onboarding and cookies

Handled by `sections/immersive-canvas.liquid` and `assets/immersive-store.js`:

- Onboarding overlay: `#immersive-onboarding`
  - Introduces controls, movement, and expectations for 3D.
  - Likely tied to a localStorage or cookie flag to avoid re‑showing it each visit.
- Cookie banner: `#immersive-cookie-banner`
  - Provides any legally required notices for the immersive experience.
  - JS manages its visibility and dismissal.

Keep these overlays:

- Accessible (focus handling, escape key to close).
- Light in markup and entirely controllable from JS and theme settings.

---

## Developing & debugging

### Working with room config

To **change room visuals or hotspots** without editing JS:

1. Go to the Theme Editor for the `page.immersive` template.
2. Select the `Immersive canvas` section.
3. Look for a “Room configuration” setting that produces the JSON rendered into `<script id="immersive-rooms-config">`.
4. Edit that JSON (or structured form inputs) to modify:
   - Background/depth textures
   - Hotspot positions and destinations
   - Editorial bindings (`roomKey` → `immersive-editorial` section ID)

For **structural changes** (new room keys, major behavior changes), you’ll need to update both:

- `STORE_ROOMS` in `assets/immersive-store.js`
- The associated runtime JSON schema in `immersive-canvas.liquid`

---

### Debugging Section Rendering calls

The immersive experience relies heavily on [Section Rendering](/docs/api/ajax/section-rendering). To debug:

1. Open the Network tab in DevTools on `/pages/immersive`.
2. Trigger a hotspot that should open a glass panel or editorial overlay.
3. Look for XHR/Fetch requests with:
   - `?section_id=glass-panel`
   - `?section_id=glass-product`
   - `?section_id=<immersive-editorial-id>`
4. Verify:
   - The request URL is correct for the current route.
   - The response status is `200`.
   - The response text contains the expected HTML.

If a section is missing or misnamed in the template:

- Shopify will return `null` or an empty response.
- Fix the section ID in:
  - `templates/page.immersive.json` (the section’s `id`)
  - The runtime config/JS mapping.

---

### Editing immersive/editorial sections in the theme editor

- Switch to the `page.immersive` template in the Theme Editor.
- You should see:
  - `Immersive canvas` (required)
  - One or more `Immersive editorial` sections
- Use section settings for:
  - Text copy, images, CTAs
  - Optional per‑room overrides (if exposed)

Avoid:

- Moving relocated immersive sections (like `immersive-canvas`) into other templates unless you also update the corresponding JS logic.

---

### Common pitfalls

- **Template mismatch**  
  If `/pages/immersive` doesn’t load the 3D experience, confirm:
  - The page is assigned to `page.immersive`.
  - There’s no conflicting `?view=` parameter.

- **Broken Section Rendering**  
  If glass panels or editorial overlays don’t appear:
  - Check that the relevant sections exist and are included in `page.immersive.json`.
  - Verify that their `section.id` matches what `immersive-store.js` expects.

- **Missing `immersive-rooms-config`**  
  If rooms don’t load or default to fallback visuals:
  - Inspect the page source and confirm there is a `<script id="immersive-rooms-config" type="application/json">` block.
  - Validate the JSON (no trailing commas, valid structure).

- **Incorrect DOM selectors**  
  Any change to IDs/classes in the Liquid sections (e.g., `#immersive-wishlist-panel`, `#immersive-onboarding`) must be reflected in `assets/immersive-store.js` to avoid orphaned UI.

---

## Contributing

1. Clone the repo and connect it to a development store using [Shopify CLI](/docs/storefronts/themes/tools/cli).
2. Run: bash shopify theme dev

   and open the provided URL.
3. Use the Theme Editor to test both:
   - The default `index` template (2D)
   - The `page.immersive` template (3D)

When submitting changes:

- Keep Liquid, HTML, CSS, and JS valid and free from external library dependencies (beyond `three.min.js`).
- Maintain translation coverage by using `{{ 'key' | t }}` for any new user-facing text.
- Preserve the existing immersive architecture rather than replacing it with a standard Dawn layout.


---

## License

Copyright (c) 2021-present Shopify Inc. See [LICENSE](/LICENSE.md) for further details.
