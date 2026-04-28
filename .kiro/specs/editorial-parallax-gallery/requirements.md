# Requirements Document

## Introduction

The **Editorial Parallax Gallery** adds a scroll-driven horizontal parallax image strip to the hero section of each room's editorial overlay in the Shahana Collection immersive store. Inspired by cinematic depth-of-field techniques, a horizontal strip of 3–6 merchant-configured images translates at different speeds as the user scrolls the editorial overlay (`#immersive-editorial-overlay`), with foreground images moving faster than background images to create a layered, cinematic feel.

This is a CSS + vanilla JS feature. It replaces the static single hero image in `sections/immersive-editorial.liquid` (for rooms that opt in) with a multi-image parallax strip. The parallax is driven by the editorial overlay's existing `scrollTop`, which is already tracked in `webgl-engine.js` via `editorialScrollProgress`. The feature must not interfere with the existing `uScrollOffset` WebGL uniform or the scroll-sinking shader effect.

The feature applies to all three editorial rooms: `designer_houses`, `occasions`, and `featured_collections`.

---

## Glossary

- **Parallax_Gallery**: The horizontal strip of layered images rendered in the editorial hero section, driven by scroll position.
- **Editorial_Overlay**: The `#immersive-editorial-overlay` `role="dialog"` element that contains the per-room editorial content and is the scroll container for this feature.
- **Depth_Multiplier**: A per-image numeric value (range 0.0–1.0) that controls how far an image translates horizontally relative to scroll progress. Higher values produce faster movement (foreground); lower values produce slower movement (background).
- **Depth_Layer**: A named tier of parallax speed — `background` (slow), `midground` (medium), `foreground` (fast) — each corresponding to a distinct Depth_Multiplier range.
- **Scroll_Progress**: A normalized value in [0, 1] representing how far the user has scrolled through the Editorial_Overlay, computed as `scrollTop / (scrollHeight - clientHeight)`.
- **Lerp_Factor**: The linear interpolation coefficient (a value in (0, 1)) applied each animation frame to smooth the raw Scroll_Progress into a stable `scrollCurrent` value, preventing jitter.
- **Parallax_Controller**: The vanilla JS module (scoped to `{% javascript %}` in `immersive-editorial.liquid`) responsible for reading scroll position, computing per-image translations, and applying `transform: translateX()` to each image wrapper.
- **Image_Strip**: The CSS flex container that holds all Parallax_Gallery image wrappers in a single horizontal row.
- **Image_Wrapper**: The individual container for each image within the Image_Strip, which receives the `transform: translateX()` animation.
- **Section_Block**: A Shopify theme editor block within the `immersive-editorial` section schema, used by merchants to configure each gallery image (image picker + depth setting).
- **editorialScrollProgress**: The module-level variable in `webgl-engine.js` that tracks the lerped scroll progress of the Editorial_Overlay and drives the `uScrollOffset` WebGL uniform. The Parallax_Controller reads this value but must never write to it.
- **uScrollOffset**: The WebGL shader uniform in `webgl-engine.js` that drives the depth-sinking effect on the room background texture. This uniform is owned exclusively by `webgl-engine.js` and must not be modified by the Parallax_Controller.
- **Reduced_Motion**: The `prefers-reduced-motion: reduce` media query state. When active, all parallax translations are suppressed and images render in a static layout.

---

## Requirements

### Requirement 1: Horizontal Image Strip Rendering

**User Story:** As a merchant, I want to configure a horizontal strip of images in the editorial hero section, so that my customers experience a cinematic, layered visual when they open a room's editorial.

#### Acceptance Criteria

1. THE `Parallax_Gallery` SHALL render between 3 and 6 images in a single horizontal `Image_Strip` within the `immersive-editorial__hero` element when the `layout` setting is not `designers`.
2. WHEN a merchant adds fewer than 3 `Section_Block` items of type `parallax_image`, THE `Parallax_Gallery` SHALL not render the `Image_Strip` and SHALL fall back to the existing single hero image layout.
3. WHEN a merchant adds more than 6 `Section_Block` items of type `parallax_image`, THE `Parallax_Gallery` SHALL render only the first 6 blocks and ignore the remainder.
4. THE `Image_Strip` SHALL use CSS `overflow: hidden` on its container so that no `Image_Wrapper` content overflows the hero bounds during translation.
5. WHEN no image is set on a `Section_Block`, THE `Parallax_Gallery` SHALL render a placeholder element for that slot so the strip layout is preserved.
6. THE `Parallax_Gallery` SHALL be available as an opt-in `layout` value (`parallax`) on the `immersive-editorial` section, leaving all existing layout values (`designers`, `occasions`, `featured_collections`, `custom`, `coverflow`, `stacked`, `perspective`, `marquee`) unchanged.

---

### Requirement 2: Scroll-Driven Horizontal Translation

**User Story:** As a shopper, I want images in the editorial hero to move horizontally as I scroll, so that I experience a sense of cinematic depth and motion.

#### Acceptance Criteria

1. WHEN the user scrolls the `Editorial_Overlay`, THE `Parallax_Controller` SHALL compute a `translateX` offset for each `Image_Wrapper` using the formula: `translateX = scrollCurrent × Depth_Multiplier × maxOffset`, where `maxOffset` is a configurable constant (default: 120px).
2. THE `Parallax_Controller` SHALL apply the computed `translateX` offset via `transform: translateX()` on each `Image_Wrapper` using `requestAnimationFrame` to avoid layout thrashing.
3. WHEN `Scroll_Progress` is 0 (top of overlay), THE `Parallax_Controller` SHALL set `translateX` to 0 for all `Image_Wrapper` elements.
4. WHEN `Scroll_Progress` is 1 (bottom of overlay), THE `Parallax_Controller` SHALL set `translateX` to `Depth_Multiplier × maxOffset` for each `Image_Wrapper`.
5. THE `Parallax_Controller` SHALL read scroll position from the `Editorial_Overlay`'s `scrollTop` property directly and SHALL NOT read from or write to `editorialScrollProgress` or `uScrollOffset` in `webgl-engine.js`.
6. WHEN the `Editorial_Overlay` is closed and reopened, THE `Parallax_Controller` SHALL reset `scrollCurrent` to 0 and reapply zero translations to all `Image_Wrapper` elements.

---

### Requirement 3: Depth Layer System

**User Story:** As a merchant, I want to assign each gallery image to a depth layer, so that images appear to move at different speeds and create a convincing parallax depth effect.

#### Acceptance Criteria

1. THE `Parallax_Gallery` SHALL support at least 3 named `Depth_Layer` presets: `background` (Depth_Multiplier: 0.2), `midground` (Depth_Multiplier: 0.5), and `foreground` (Depth_Multiplier: 1.0).
2. THE `Section_Block` schema SHALL expose a `select` setting for `Depth_Layer` with options `background`, `midground`, and `foreground`, defaulting to `midground`.
3. FOR ALL valid scroll progress values in [0, 1], THE `Parallax_Controller` SHALL produce a `foreground` displacement strictly greater than `midground` displacement, and `midground` displacement strictly greater than `background` displacement, when all three layers are present.
4. WHERE a merchant requires fine-grained control, THE `Section_Block` schema SHALL expose an optional `range` setting (`depth_multiplier_override`, range 0.0–1.0, step 0.05) that overrides the named `Depth_Layer` preset for that block.
5. WHEN `depth_multiplier_override` is set to a value greater than 0, THE `Parallax_Controller` SHALL use `depth_multiplier_override` instead of the named `Depth_Layer` preset for that `Image_Wrapper`.

---

### Requirement 4: Merchant Configuration via Section Blocks

**User Story:** As a merchant, I want to configure each gallery image and its parallax depth using the Shopify theme editor, so that I can tailor the editorial hero to each room without touching code.

#### Acceptance Criteria

1. THE `immersive-editorial` section schema SHALL include a block type `parallax_image` with the following settings: `image` (image_picker), `alt` (text, optional override), `depth_layer` (select: background/midground/foreground), and `depth_multiplier_override` (range 0.0–1.0, step 0.05, default 0).
2. WHEN a merchant reorders `Section_Block` items in the theme editor, THE `Parallax_Gallery` SHALL reflect the new order without requiring a page reload (via `shopify:section:load` re-init).
3. WHEN a merchant removes a `Section_Block`, THE `Parallax_Gallery` SHALL remove the corresponding `Image_Wrapper` from the `Image_Strip` and recompute the layout.
4. WHEN a merchant adds a `Section_Block`, THE `Parallax_Gallery` SHALL add the corresponding `Image_Wrapper` to the `Image_Strip` up to the maximum of 6 images.
5. THE `Section_Block` schema SHALL include a `maxOffset_px` section-level setting (range 40–240, step 10, default 120) so merchants can tune the overall parallax intensity without editing code.
6. ALL user-facing labels in the `Section_Block` schema SHALL use `en.default.schema.json` translation keys under the `sections.immersive_editorial` namespace.

---

### Requirement 5: Lerp-Based Scroll Smoothing

**User Story:** As a shopper, I want the parallax motion to feel fluid and cinematic rather than jerky, so that the gallery enhances rather than distracts from the editorial experience.

#### Acceptance Criteria

1. THE `Parallax_Controller` SHALL maintain a `scrollCurrent` variable that is updated each animation frame using linear interpolation: `scrollCurrent += (scrollTarget - scrollCurrent) × lerpFactor`, where `lerpFactor` defaults to 0.08.
2. WHEN `scrollTarget` equals `scrollCurrent`, THE `Parallax_Controller` SHALL produce zero change to `scrollCurrent` (idempotent update).
3. FOR ALL values of `scrollTarget` in [0, 1] and `scrollCurrent` in [0, 1], THE `Parallax_Controller` SHALL produce a `scrollCurrent` after one lerp step that is strictly between `scrollCurrent` and `scrollTarget` (exclusive), ensuring convergence without overshoot.
4. THE `Parallax_Controller` SHALL cancel its `requestAnimationFrame` loop when the `Editorial_Overlay` is closed and restart it when the overlay is opened, to avoid unnecessary computation while the overlay is hidden.
5. WHEN `scrollCurrent` is within 0.001 of `scrollTarget`, THE `Parallax_Controller` SHALL set `scrollCurrent` equal to `scrollTarget` and pause the animation loop until the next scroll event.

---

### Requirement 6: Reduced Motion Accessibility

**User Story:** As a shopper who has enabled reduced motion in their OS settings, I want the gallery to display as a static layout without any parallax movement, so that I am not affected by motion that could cause discomfort.

#### Acceptance Criteria

1. WHEN `prefers-reduced-motion: reduce` is active, THE `Parallax_Controller` SHALL set `translateX` to 0 for all `Image_Wrapper` elements regardless of scroll position.
2. WHEN `prefers-reduced-motion: reduce` is active, THE `Parallax_Controller` SHALL not start its `requestAnimationFrame` loop.
3. THE `Image_Strip` CSS SHALL include a `@media (prefers-reduced-motion: reduce)` block that sets `transform: none !important` and `transition: none !important` on all `Image_Wrapper` elements.
4. WHEN `prefers-reduced-motion: reduce` is active, THE `Parallax_Gallery` SHALL display all images in a static horizontal layout with equal spacing, preserving the visual composition without motion.
5. THE `Parallax_Controller` SHALL evaluate `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at initialization time and SHALL NOT attach scroll listeners when reduced motion is active.

---

### Requirement 7: Mobile and Touch Scroll Support

**User Story:** As a shopper on a mobile device, I want the parallax gallery to respond to my touch scrolling, so that I experience the same cinematic depth effect as desktop users.

#### Acceptance Criteria

1. WHEN the user scrolls the `Editorial_Overlay` via touch on a mobile device, THE `Parallax_Controller` SHALL compute and apply `translateX` translations using the same scroll listener and lerp logic as desktop scroll.
2. THE `Parallax_Controller` SHALL listen to the `scroll` event on the `Editorial_Overlay` element (not on `window`), ensuring touch-driven `scrollTop` changes are captured on both iOS and Android.
3. WHEN the device pixel ratio exceeds 2, THE `Parallax_Controller` SHALL apply the same `maxOffset` value as desktop without scaling, to avoid excessive motion on high-DPI mobile screens.
4. THE `Image_Strip` CSS SHALL use `touch-action: pan-y` on the `Editorial_Overlay` to ensure vertical touch scrolling is not blocked by horizontal image transforms.
5. WHEN the viewport width is less than 768px, THE `Parallax_Gallery` SHALL reduce `maxOffset` to 60px (50% of the desktop default) to prevent images from translating too far off-screen on narrow viewports.

---

### Requirement 8: Non-Interference with WebGL Scroll Effect

**User Story:** As a developer, I want the parallax gallery to be completely isolated from the WebGL scroll-sinking effect, so that adding the gallery does not alter the existing cinematic depth shader behavior.

#### Acceptance Criteria

1. THE `Parallax_Controller` SHALL read scroll position exclusively from `Editorial_Overlay.scrollTop` and SHALL NOT read from, write to, or modify `editorialScrollProgress` in `webgl-engine.js`.
2. THE `Parallax_Controller` SHALL NOT write to `uniforms.uScrollOffset`, `uniforms.uScrollVignette`, or `uniforms.uScrollChroma` in `webgl-engine.js`.
3. WHEN the `Parallax_Gallery` is active, THE `webgl-engine.js` animate loop SHALL continue to compute `editorialScrollProgress` and `uScrollOffset` using its existing logic, unchanged.
4. THE `Parallax_Controller` SHALL be scoped entirely within the `{% javascript %}` block of `immersive-editorial.liquid` and SHALL NOT modify any global variables defined in `immersive-store.js` or `webgl-engine.js`.
5. IF the `Editorial_Overlay` element is not found in the DOM, THE `Parallax_Controller` SHALL exit silently without throwing errors or affecting the WebGL render loop.

---

### Requirement 9: JavaScript-Disabled Fallback

**User Story:** As a shopper with JavaScript disabled, I want the editorial hero to still display all gallery images in a readable layout, so that I can view the editorial content without requiring JS.

#### Acceptance Criteria

1. WHEN JavaScript is disabled, THE `Parallax_Gallery` SHALL render all configured images in a static horizontal scrollable layout using CSS `display: flex` and `overflow-x: auto` on the `Image_Strip`.
2. THE `Image_Strip` HTML SHALL be rendered server-side by Liquid with no dependency on JavaScript for initial layout — all images SHALL be present in the DOM on page load.
3. WHEN JavaScript is disabled, THE `Image_Wrapper` elements SHALL have no `transform` applied and SHALL display at their natural CSS-defined widths.
4. THE `{% stylesheet %}` block SHALL define a base CSS layout for the `Image_Strip` that is fully functional without JavaScript, with JS only adding the `transform: translateX()` behavior on top.
5. WHEN JavaScript is disabled, THE `Parallax_Gallery` SHALL not display any broken UI states, empty containers, or layout shifts caused by missing JS-applied styles.
