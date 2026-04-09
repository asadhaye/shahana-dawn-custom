# Requirements Document

## Introduction

The immersive-editorial feature adds a per-room "living editorial" experience to the Shahana Collection immersive store. Each of the three destination rooms (`designer_houses`, `occasions`, `featured_collections`) gets a dedicated editorial section rendered in Liquid/DOM — a hero area plus a series of content banners — that sits below the Three.js canvas and is reached by clicking an editorial hotspot inside the room.

The Three.js engine (`immersive-store.js`) manages state, exposes the editorial hotspot, and scrolls/transitions to the editorial section. All editorial content (text, images, CTAs) lives exclusively in `sections/immersive-editorial.liquid`. No editorial copy is rendered inside Three.js.

The feature consists of two deliverables:

1. **`sections/immersive-editorial.liquid`** — a reusable, block-driven Shopify OS 2.0 section that powers all three room editorials via a `room_key` setting.
2. **Extensions to `assets/immersive-store.js`** — editorial state, editorial hotspots in `STORE_ROOMS`, an updated hotspot click handler, `enterEditorialMode()`, `updateCameraForMode()`, and analytics.

---

## Glossary

- **Editorial_Section**: The `sections/immersive-editorial.liquid` Shopify section; renders one editorial per room.
- **Immersive_Store**: The Three.js-powered WebGL showroom running in `assets/immersive-store.js`.
- **Room_Key**: A string identifier for a destination room — one of `designer_houses`, `occasions`, or `featured_collections`.
- **Editorial_Hotspot**: A hotspot button rendered by the Immersive_Store inside a room that carries a `targetEditorialRoom` property instead of `targetRoom` or `targetCollection`.
- **Editorial_Mode**: The application state where `immersiveState.mode === 'editorial'` and `immersiveState.editorialRoom` is set to a Room_Key.
- **Showroom_Mode**: The default application state where `immersiveState.mode === 'showroom'`.
- **Banner_Block**: A Shopify section block of type `banner` defined in the Editorial_Section schema; represents one editorial content tile.
- **Hero_Area**: The top portion of the Editorial_Section containing a background image, eyebrow text, heading, and subheading.
- **CTA**: Call-to-action link rendered inside a Banner_Block.
- **Depth_Layer**: A `data-editorial-layer` integer attribute (0–100) on each banner article, used by the scroll parallax script to compute translateY offsets.
- **Glassmorphism**: The visual style used across the immersive theme — `backdrop-filter: blur`, semi-transparent dark backgrounds, gold (`#d4af37`) accents, and subtle borders.
- **STORE_ROOMS**: The JavaScript object in `immersive-store.js` that defines room textures and hotspots.
- **immersiveState**: The JavaScript object added to `immersive-store.js` tracking `currentRoom`, `mode`, and `editorialRoom`.
- **trackImmersiveEvent**: The existing analytics helper in `immersive-store.js` that fires GA4 and Meta Pixel events.

---

## Requirements

### Requirement 1: Editorial Section Root Element and Identity

**User Story:** As a merchant, I want to place one editorial section per room on my immersive page, so that each room has its own branded story that Three.js can scroll to.

#### Acceptance Criteria

1. THE Editorial_Section SHALL render a `<section>` root element with `id="immersive-editorial-{{ section.settings.room_key | escape }}"`.
2. THE Editorial_Section SHALL apply the CSS classes `immersive-editorial`, `immersive-editorial--{{ room_key }}`, and `immersive-editorial--layout-{{ layout }}` to the root element.
3. THE Editorial_Section SHALL set `data-room-key="{{ section.settings.room_key }}"` and `data-layout="{{ section.settings.layout }}"` on the root element.
4. WHEN `section.settings.room_key` is blank, THE Editorial_Section SHALL render the root element without a room-key modifier class and without a `data-room-key` attribute.

---

### Requirement 2: Schema Settings

**User Story:** As a merchant, I want to configure the editorial section from the Shopify theme editor, so that I can assign it to a room, choose a layout, set hero content, and add banner blocks without touching code.

#### Acceptance Criteria

1. THE Editorial_Section schema SHALL include a `room_key` select setting with options `designer_houses`, `occasions`, and `featured_collections`.
2. THE Editorial_Section schema SHALL include a `layout` select setting with options `designers`, `collections`, and `occasions`, defaulting to `collections`.
3. THE Editorial_Section schema SHALL include an `image_picker` setting `hero_background_image`, a `text` setting `hero_eyebrow`, a `text` setting `hero_heading`, and a `richtext` setting `hero_subheading`.
4. THE Editorial_Section schema SHALL define a block type `banner` with settings: `image_picker` for `image`, `image_picker` for `logo`, `text` for `heading` (required), `richtext` for `body`, `text` for `cta_label`, `url` for `cta_url`, `collection` for `collection`, and a `range` for `depth_layer` spanning 0–100.
5. THE Editorial_Section schema SHALL include at least one preset with `room_key` set to `featured_collections`, `layout` set to `collections`, and three sample banner blocks.
6. THE Editorial_Section schema SHALL include a `{% doc %}` block at the top of the file documenting: section purpose, `room_key`-to-room mapping, available layout modes, merchant usage instructions, and the JS scroll-targeting convention (`id="immersive-editorial-{room_key}"`).

---

### Requirement 3: Hero Area Markup

**User Story:** As a shopper, I want to see a full-width hero at the top of each editorial, so that I immediately understand the room's theme and brand story.

#### Acceptance Criteria

1. THE Editorial_Section SHALL render a `<div class="immersive-editorial__hero">` element containing the hero background image and hero panel.
2. WHEN `section.settings.hero_background_image` is set, THE Editorial_Section SHALL render an `<img>` with class `immersive-editorial__hero-bg` using the `image_url` filter at width 1600, with `loading="lazy"`, explicit `width` and `height` attributes, and an `alt` attribute.
3. THE Editorial_Section SHALL render a `<div class="immersive-editorial__hero-panel">` containing: an eyebrow `<p>` (when `hero_eyebrow` is set), an `<h2>` heading (when `hero_heading` is set), and a subheading `<div>` (when `hero_subheading` is set).
4. WHEN `hero_heading` is blank, THE Editorial_Section SHALL omit the `<h2>` element entirely.

---

### Requirement 4: Banner Blocks Markup

**User Story:** As a shopper, I want to browse a series of editorial banners below the hero, so that I can discover collections, designers, or occasions and click through to explore them.

#### Acceptance Criteria

1. THE Editorial_Section SHALL render a `<div class="immersive-editorial__banners">` wrapping one `<article>` per Banner_Block.
2. EACH banner `<article>` SHALL carry `data-editorial-layer="{{ block.settings.depth_layer }}"` and `{{ block.shopify_attributes }}`.
3. WHEN `block.settings.image` is set, THE Editorial_Section SHALL render a `<div class="immersive-editorial__banner-media">` containing an `<img>` with `loading="lazy"`, explicit `width` and `height`, and an `alt` attribute.
4. WHERE the `layout` setting equals `designers` and `block.settings.logo` is set, THE Editorial_Section SHALL render the logo `<img>` inside `immersive-editorial__banner-media` alongside the main image.
5. THE Editorial_Section SHALL render a `<div class="immersive-editorial__banner-content">` containing: an `<h3>` for `block.settings.heading`, a body `<div>` (when `block.settings.body` is set), a CTA `<a class="immersive-editorial__cta">` (when both `block.settings.cta_label` and `block.settings.cta_url` are set), and a collection link `<a>` (when `block.settings.collection` is set).
6. WHEN `block.settings.cta_url` is set and `block.settings.cta_label` is blank, THE Editorial_Section SHALL omit the CTA link.
7. THE Editorial_Section SHALL render the CTA `<a>` with a visible focus outline meeting WCAG 2.2 focus-visible requirements.

---

### Requirement 5: Scoped CSS — Glassmorphism and Responsive Layout

**User Story:** As a shopper, I want the editorial to feel like a continuation of the 3D immersive world, so that the visual experience is seamless and premium.

#### Acceptance Criteria

1. THE Editorial_Section SHALL include all editorial CSS inside a `{% stylesheet %}` block, scoped exclusively under `.immersive-editorial`.
2. THE Editorial_Section CSS SHALL apply Glassmorphism styling to the hero panel and banner content areas: `backdrop-filter: blur(...)`, semi-transparent dark backgrounds, gold (`#d4af37`) accents, and subtle `rgba` borders.
3. THE Editorial_Section CSS SHALL render a single-column layout on viewports narrower than 768 px.
4. THE Editorial_Section CSS SHALL render an alternating or grid layout on viewports 768 px and wider.
5. THE Editorial_Section CSS SHALL include a `@media (prefers-reduced-motion: reduce)` block that disables all `transform`, `transition`, and `animation` declarations on `.immersive-editorial` elements.
6. THE Editorial_Section CSS SHALL NOT use bare element selectors or `!important` outside the reduced-motion block.

---

### Requirement 6: Scroll Parallax JavaScript

**User Story:** As a shopper, I want subtle depth motion as I scroll through the editorial, so that the banners feel alive and connected to the 3D room behind them.

#### Acceptance Criteria

1. THE Editorial_Section SHALL include scroll parallax behavior inside a `{% javascript %}` block, scoped to the section's root element by its `id`.
2. WHEN the page is scrolled, THE Editorial_Section parallax script SHALL collect all `[data-editorial-layer]` elements within the section, compute a normalized scroll position for the section, and apply `translateY()` offsets proportional to each element's `depth_layer` value.
3. THE Editorial_Section parallax script SHALL throttle DOM updates via `requestAnimationFrame` and use a lerp (linear interpolation) between a `scrollTarget` and `scrollCurrent` value.
4. WHEN `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, THE Editorial_Section parallax script SHALL skip all `transform` applications and leave elements at their natural positions.
5. WHEN multiple Editorial_Section instances exist on the same page, THE Editorial_Section parallax script SHALL operate independently on each instance without cross-contamination.
6. WHEN a `shopify:section:load` or `shopify:section:select` event fires, THE Editorial_Section parallax script SHALL re-initialize for the affected section.

---

### Requirement 7: Accessibility

**User Story:** As a shopper using assistive technology or keyboard navigation, I want the editorial to be fully navigable, so that I can access all content and CTAs without a mouse.

#### Acceptance Criteria

1. THE Editorial_Section SHALL use semantic HTML: `<section>` as the root, `<h2>` for the hero heading, `<article>` for each banner, and `<h3>` for each banner heading.
2. THE Editorial_Section SHALL render all CTA and collection `<a>` elements as keyboard-focusable links with visible focus outlines.
3. WHEN a hero background image is decorative, THE Editorial_Section SHALL set `aria-hidden="true"` on that image.
4. THE Editorial_Section SHALL NOT introduce scrolljacking or any behavior that overrides the browser's native scroll position.
5. THE Editorial_Section SHALL follow WCAG 2.2 patterns as documented in `powers/shopify-liquid-theme/steering/theme-a11y.md`.

---

### Requirement 8: Translations

**User Story:** As a merchant selling to an international audience, I want all editorial text to use Shopify's translation system, so that the section works correctly in any locale.

#### Acceptance Criteria

1. THE Editorial_Section SHALL pass all user-facing strings through the `| t` filter with no hard-coded English strings in the Liquid template.
2. THE Editorial_Section SHALL use new locale keys under the `sections.immersive_editorial.*` namespace in `locales/en.default.json`.
3. WHEN a Dawn locale key semantically matches an editorial string (e.g. `accessibility.close`), THE Editorial_Section SHALL reuse that key rather than creating a duplicate.
4. THE Editorial_Section locale keys SHALL be 2–3 levels deep and organized by section.

---

### Requirement 9: Editorial State in immersive-store.js

**User Story:** As a developer, I want the Three.js engine to track whether the user is in showroom or editorial mode, so that camera and parallax settings can be adjusted per mode without breaking existing room navigation.

#### Acceptance Criteria

1. THE Immersive_Store SHALL declare an `immersiveState` object with properties `currentRoom` (string, default `'storefront'`), `mode` (string, default `'showroom'`), and `editorialRoom` (null or Room_Key string, default `null`).
2. THE Immersive_Store SHALL NOT remove or alter any existing room-tracking logic when adding `immersiveState`.
3. WHEN `immersiveState.mode` is set to `'editorial'`, THE Immersive_Store SHALL preserve the value of `immersiveState.currentRoom` unchanged.

---

### Requirement 10: Editorial Hotspots in STORE_ROOMS

**User Story:** As a shopper, I want to see an editorial hotspot button inside each destination room, so that I can click it to enter the room's editorial story.

#### Acceptance Criteria

1. THE Immersive_Store SHALL add one editorial hotspot to the `designer_houses` room's `hotspots` array with `targetEditorialRoom: 'designer_houses'`.
2. THE Immersive_Store SHALL add one editorial hotspot to the `occasions` room's `hotspots` array with `targetEditorialRoom: 'occasions'`.
3. THE Immersive_Store SHALL add one editorial hotspot to the `featured_collections` room's `hotspots` array with `targetEditorialRoom: 'featured_collections'`.
4. THE Immersive_Store SHALL NOT remove any existing hotspots from any room when adding editorial hotspots.
5. WHEN the `mergeDynamicRoomConfig` IIFE runs, THE Immersive_Store SHALL preserve editorial hotspots that were added programmatically and not overwrite them with null values from the JSON config.

---

### Requirement 11: Updated Hotspot Click Handler

**User Story:** As a shopper, I want clicking an editorial hotspot to open the editorial rather than a collection panel, so that the correct experience is triggered for each hotspot type.

#### Acceptance Criteria

1. THE Immersive_Store hotspot click handler SHALL check for `hotspot.targetEditorialRoom` first, before checking `hotspot.targetRoom` or `hotspot.targetCollection`.
2. WHEN `hotspot.targetEditorialRoom` is set, THE Immersive_Store SHALL call `enterEditorialMode(hotspot.targetEditorialRoom)` and return without executing any other hotspot branch.
3. WHEN `hotspot.targetRoom` is set and `hotspot.targetEditorialRoom` is not set, THE Immersive_Store SHALL call `goToRoom(hotspot.targetRoom)` as before.
4. WHEN `hotspot.targetCollection` is set and neither `targetEditorialRoom` nor `targetRoom` is set, THE Immersive_Store SHALL call `openCollectionPanel(hotspot.targetCollection)` as before.

---

### Requirement 12: enterEditorialMode Function

**User Story:** As a shopper, I want clicking an editorial hotspot to smoothly scroll me to the editorial section, so that the transition from the 3D room to the editorial feels intentional and polished.

#### Acceptance Criteria

1. WHEN `enterEditorialMode(roomKey)` is called, THE Immersive_Store SHALL set `immersiveState.mode` to `'editorial'` and `immersiveState.editorialRoom` to `roomKey`.
2. WHEN `enterEditorialMode(roomKey)` is called, THE Immersive_Store SHALL call `updateCameraForMode()`.
3. WHEN `enterEditorialMode(roomKey)` is called and `document.getElementById('immersive-editorial-' + roomKey)` returns a non-null element, THE Immersive_Store SHALL scroll to that element.
4. WHEN `document.startViewTransition` is available and `prefers-reduced-motion` is not active, THE Immersive_Store SHALL use `document.startViewTransition` to wrap the `scrollIntoView` call.
5. WHEN `document.startViewTransition` is not available, THE Immersive_Store SHALL call `scrollIntoView({ behavior: 'smooth', block: 'start' })` directly.
6. WHEN `prefers-reduced-motion` is active, THE Immersive_Store SHALL call `scrollIntoView({ behavior: 'auto', block: 'start' })` without a view transition.
7. WHEN `document.getElementById('immersive-editorial-' + roomKey)` returns `null`, THE Immersive_Store SHALL fail gracefully by logging a warning and taking no scroll action.
8. WHEN `enterEditorialMode(roomKey)` is called, THE Immersive_Store SHALL call `trackImmersiveEvent('editorial_entered', { room: roomKey })`.

---

### Requirement 13: updateCameraForMode Function

**User Story:** As a shopper, I want the 3D room background to subtly shift when I enter editorial mode, so that the camera perspective reinforces the editorial atmosphere of each room.

#### Acceptance Criteria

1. THE Immersive_Store SHALL implement `updateCameraForMode()` which reads `immersiveState.mode` and `immersiveState.editorialRoom` to determine camera settings.
2. WHEN `immersiveState.mode` is `'editorial'` and `immersiveState.editorialRoom` is `'designer_houses'`, THE Immersive_Store SHALL set `camera.fov` to `40` and `parallaxStrength` to `0.10`.
3. WHEN `immersiveState.mode` is `'editorial'` and `immersiveState.editorialRoom` is `'occasions'`, THE Immersive_Store SHALL set `camera.fov` to `42` and `parallaxStrength` to `0.09`.
4. WHEN `immersiveState.mode` is `'editorial'` and `immersiveState.editorialRoom` is `'featured_collections'`, THE Immersive_Store SHALL set `camera.fov` to `38` and `parallaxStrength` to `0.11`.
5. WHEN `immersiveState.mode` is `'showroom'`, THE Immersive_Store SHALL restore `camera.fov` to `35` and `parallaxStrength` to `0.12`.
6. WHEN `updateCameraForMode()` modifies `camera.fov`, THE Immersive_Store SHALL call `camera.updateProjectionMatrix()`.
7. WHEN `prefers-reduced-motion` is active, THE Immersive_Store SHALL apply the FOV and parallax values immediately without any animated transition.

---

### Requirement 14: Analytics

**User Story:** As a merchant, I want editorial entry events tracked in GA4 and Meta Pixel, so that I can measure engagement with the editorial experience.

#### Acceptance Criteria

1. WHEN `enterEditorialMode(roomKey)` is called, THE Immersive_Store SHALL call `trackImmersiveEvent('editorial_entered', { room: roomKey })`.
2. THE Immersive_Store SHALL use the existing `trackImmersiveEvent` function for all editorial analytics — no new analytics helpers SHALL be introduced.
3. WHEN `window.dataLayer` is available, THE Immersive_Store SHALL push the editorial event to `window.dataLayer` via the existing `trackImmersiveEvent` implementation.
4. WHEN `window.fbq` is available, THE Immersive_Store SHALL fire the editorial event via `window.fbq` via the existing `trackImmersiveEvent` implementation.

---

### Requirement 15: Performance and Safety

**User Story:** As a developer, I want the editorial additions to be lightweight and safe, so that the existing Three.js scene and room navigation are not degraded.

#### Acceptance Criteria

1. THE Immersive_Store editorial additions SHALL NOT introduce any new JavaScript libraries or additional Three.js scenes.
2. THE Immersive_Store editorial additions SHALL consist only of: state object declaration, hotspot array additions, one updated click handler branch, `enterEditorialMode`, and `updateCameraForMode`.
3. THE Immersive_Store SHALL NOT introduce any infinite loops or unbounded recursion in the editorial code paths.
4. THE Editorial_Section `{% javascript %}` block SHALL NOT load any external scripts or import any modules.
5. IF `camera` is `null` or `undefined` when `updateCameraForMode()` is called, THE Immersive_Store SHALL return early without throwing an error.

---

### Requirement 16: Content Separation

**User Story:** As a developer, I want editorial text, images, and CTAs to live exclusively in Liquid, so that the Three.js engine remains a pure world/motion controller and the Section Rendering API pattern is preserved.

#### Acceptance Criteria

1. THE Immersive_Store SHALL NOT render any editorial heading, body copy, image, or CTA inside the Three.js scene or canvas.
2. THE Editorial_Section SHALL render all editorial content (hero, banners, CTAs, collection links) as standard Liquid/DOM HTML.
3. THE Immersive_Store SHALL interact with the Editorial_Section only via `document.getElementById('immersive-editorial-' + roomKey)` and `scrollIntoView` — no direct DOM manipulation of editorial content.
4. THE Editorial_Section SHALL follow the Section Rendering API pattern: it is a standard Shopify OS 2.0 section with `{% schema %}`, `{% stylesheet %}`, and `{% javascript %}` blocks.
