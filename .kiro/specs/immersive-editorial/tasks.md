# Implementation Plan: immersive-editorial

## Overview

Implement the per-room "living editorial" feature in two passes: first the Liquid section and locale keys, then the `immersive-store.js` extensions, then the test suite. Each step is independently runnable and wires into the existing immersive architecture without breaking it.

## Tasks

- [x] 1. Add locale keys to `locales/en.default.json`
  - Add `sections.immersive_editorial` namespace with all keys from the design's locale key structure
  - Keys needed: `name`, `settings.room_key.*`, `settings.layout.*`, `settings.hero_background_image.label`, `settings.hero_eyebrow.label`, `settings.hero_heading.label`, `settings.hero_subheading.label`, `blocks.banner.name`, `blocks.banner.settings.*`, `presets.default.name`
  - Insert inside the existing `"sections"` object, after `"immersive_canvas"`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 2. Create `sections/immersive-editorial.liquid` — doc block and root element
  - Open the file with the `{% doc %}` block documenting section purpose, `room_key`-to-room mapping, layout modes, merchant usage, and the JS scroll-targeting convention
  - Render the `<section>` root element with `id`, classes, and `data-*` attributes — all dynamic values escaped with `| escape`
  - _Requirements: 1.1, 1.2, 1.3, 2.6_

- [x] 3. Add hero area markup to `sections/immersive-editorial.liquid`
  - Render `<div class="immersive-editorial__hero">` containing the hero background `<img>` (conditional, `aria-hidden="true"`, `loading="lazy"`, explicit `width`/`height`, `srcset` at 800/1200/1600 w) and the glass hero panel
  - Hero panel contains: eyebrow `<p>` (conditional), `<h2>` heading (conditional), subheading `<div>` (conditional)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.3_

- [x] 4. Add banner blocks markup to `sections/immersive-editorial.liquid`
  - Render `<div class="immersive-editorial__banners">` wrapping one `<article>` per block with `data-editorial-layer` and `{{ block.shopify_attributes }}`
  - Each article contains: conditional `banner-media` div with `<img>` (`loading="lazy"`, explicit dimensions) and optional logo `<img>` (designers layout only), plus `banner-content` div with `<h3>`, conditional body `<div>`, conditional CTA `<a class="immersive-editorial__cta">` (only when both `cta_label` and `cta_url` are set), conditional collection `<a>`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 7.1, 7.2_

- [x] 5. Add `{% stylesheet %}` block to `sections/immersive-editorial.liquid`
  - Scope all rules under `.immersive-editorial`; apply glassmorphism tokens to hero panel and banner content (backdrop-filter, semi-transparent dark bg, gold `#d4af37` accents, rgba borders)
  - Single-column layout below 768 px; alternating/grid layout at 768 px+; three-column grid for `.immersive-editorial--layout-designers`
  - Include `@media (prefers-reduced-motion: reduce)` block disabling all transform/transition/animation on `.immersive-editorial` elements
  - No bare element selectors; no `!important` outside the reduced-motion block
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Add `{% javascript %}` block to `sections/immersive-editorial.liquid`
  - Implement `initEditorialParallax(sectionId)` scoped to the section root by its `id`
  - Collect `[data-editorial-layer]` elements, compute progress via `(rect.top + rect.height/2 - viewportH/2) / viewportH` using `getBoundingClientRect()`, apply `translateY(progress * depth * 40px)` per element
  - Throttle via `requestAnimationFrame`; lerp `scrollCurrent` toward `scrollTarget` with factor 0.08
  - Guard with `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — skip listener entirely if true
  - Re-init on `shopify:section:load` and `shopify:section:select` events
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.4_

- [x] 7. Add `{% schema %}` block to `sections/immersive-editorial.liquid`
  - Include `room_key` select (options: `designer_houses`, `occasions`, `featured_collections`; default: `featured_collections`), `layout` select (options: `designers`, `collections`, `occasions`; default: `collections`), and all four hero image/text settings
  - Define `banner` block type with all eight settings (`image`, `logo`, `heading`, `body`, `cta_label`, `cta_url`, `collection`, `depth_layer` range 0–100 default 50)
  - Include one preset with `room_key: featured_collections`, `layout: collections`, and three sample banner blocks
  - All `label` and `name` values reference `t:sections.immersive_editorial.*` keys
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Checkpoint — verify section renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Extend `assets/immersive-store.js` — add `immersiveState` and update `goToRoom`
  - Declare `var immersiveState = { currentRoom: 'storefront', mode: 'showroom', editorialRoom: null }` immediately after the existing `var contentCache = {}` line
  - Inside `goToRoom()`, after the existing `saveState(...)` call, add: `immersiveState.currentRoom = roomKey; immersiveState.mode = 'showroom'; immersiveState.editorialRoom = null;`
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 10. Extend `assets/immersive-store.js` — add editorial hotspots to `STORE_ROOMS`
  - Append `{ x: 50, y: 15, label: 'Our Designers', targetEditorialRoom: 'designer_houses' }` to `designer_houses.hotspots`
  - Append `{ x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' }` to `occasions.hotspots`
  - Append `{ x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' }` to `featured_collections.hotspots`
  - Do not remove or reorder any existing hotspots
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 11. Extend `assets/immersive-store.js` — update hotspot click handler in `renderHotspots`
  - Add a first branch inside the existing click handler: `if (hotspot.targetEditorialRoom) { ... trackImmersiveEvent('hotspot_clicked', details); enterEditorialMode(hotspot.targetEditorialRoom); return; }`
  - Existing `targetRoom` and `targetCollection` branches remain unchanged below it
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 12. Extend `assets/immersive-store.js` — implement `enterEditorialMode`
  - Set `immersiveState.mode = 'editorial'` and `immersiveState.editorialRoom = roomKey`
  - Call `updateCameraForMode()` then `trackImmersiveEvent('editorial_entered', { room: roomKey })`
  - Resolve target element via `document.getElementById('immersive-editorial-' + roomKey)`; if null, log warning and return
  - Scroll: use `document.startViewTransition` wrapping `scrollIntoView({ behavior: 'smooth', block: 'start' })` when available and `!reduceMotion`; use `behavior: 'auto'` when `reduceMotion` is true; fall back to direct `scrollIntoView` when `startViewTransition` unavailable
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 14.1_

- [x] 13. Extend `assets/immersive-store.js` — implement `updateCameraForMode`
  - Guard: `if (!camera) return`
  - Set `uniforms.uParallaxStrength.value` only — NOT `camera.fov` (camera is `THREE.OrthographicCamera`)
  - Editorial mode strengths: `designer_houses` → 0.10, `occasions` → 0.09, `featured_collections` → 0.11, default → `isMobileDevice() ? 0.03 : 0.08`
  - Showroom mode: restore to `isMobileDevice() ? 0.03 : 0.08`
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.7, 15.5_

- [x] 14. Checkpoint — verify JS extensions integrate correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Create `tests/immersive-editorial.test.js` — test scaffolding and unit tests
  - Set up Jest + jsdom test file; import `fast-check` as `fc`
  - Write helpers: `renderSection(settings, blocks)` (builds minimal HTML matching the section's DOM contract), `parseRoot(html)`, `query(html, sel)`, `queryAll(html, sel)`
  - Write unit tests for: root element id/classes/data-attrs for each room_key, blank room_key edge case, omitted `<h2>` when `hero_heading` blank, omitted CTA when `cta_url` set but `cta_label` blank, `immersiveState` default values, each destination room having exactly one editorial hotspot, `enterEditorialMode` calling `updateCameraForMode`, scroll behavior variants (smooth / auto / no startViewTransition), null target warning, null camera guard, `trackImmersiveEvent` called with correct args, `shopify:section:load` re-init
  - _Requirements: 1.1–1.4, 3.4, 4.6, 9.1, 10.1–10.3, 12.2, 12.5, 12.6, 12.7, 14.1, 15.5_

- [x] 16. Add property-based tests to `tests/immersive-editorial.test.js`
  - [x] 16.1 Write property test for Property 1: Root element identity
    - `fc.constantFrom` for room_key and layout; assert id, classes, data-attrs
    - **Property 1: Root element identity**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [x] 16.2 Write property test for Property 3: Banner count matches block count
    - `fc.array` of banner records; assert article count equals block count
    - **Property 3: Banner count matches block count**
    - **Validates: Requirement 4.1**
  - [x] 16.3 Write property test for Property 4: `data-editorial-layer` reflects `depth_layer`
    - `fc.integer({ min: 0, max: 100 })`; assert `dataset.editorialLayer === String(depthLayer)`
    - **Property 4: Banner data-editorial-layer reflects depth_layer**
    - **Validates: Requirement 4.2**
  - [x] 16.4 Write property test for Property 6: Parallax offset proportional to `depth_layer`
    - `fc.float({ min: -1, max: 1 })` for progress, two distinct depth integers; assert `offsetA / offsetB ≈ depthA / depthB`; numRuns 500
    - **Property 6: Parallax offset proportional to depth_layer**
    - **Validates: Requirement 6.2**
  - [x] 16.5 Write property test for Property 7: Lerp converges toward target
    - `fc.float` for current, target, factor; assert `|next - target| < |current - target|`; numRuns 500
    - **Property 7: Lerp converges toward target**
    - **Validates: Requirement 6.3**
  - [x] 16.6 Write property test for Property 9: `currentRoom` preserved on mode change
    - `fc.constantFrom` for currentRoom and editorialRoom; assert `immersiveState.currentRoom` unchanged after `enterEditorialMode`
    - **Property 9: currentRoom preserved on mode change**
    - **Validates: Requirement 9.3**
  - [x] 16.7 Write property test for Property 10: Hotspot routing priority
    - `fc.record` with optional `targetEditorialRoom`, `targetRoom`, `targetCollection`; assert correct function called and others not called
    - **Property 10: Hotspot routing — editorial branch takes priority**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
  - [x] 16.8 Write property test for Property 12: `updateCameraForMode` parallax strength mapping
    - `fc.constantFrom` for mode and editorialRoom; assert `uniforms.uParallaxStrength.value` matches expected table; assert `camera.fov` is NOT set
    - **Property 12: updateCameraForMode maps mode/room to correct parallax strength**
    - **Validates: Requirements 13.1–13.5, 13.7, 15.5**
  - [x] 16.9 Write property test for Property 13: `mergeDynamicRoomConfig` preserves editorial hotspots
    - `fc.record` with optional room configs including `hotspots: null`; assert editorial hotspot count after merge ≥ before merge
    - **Property 13: mergeDynamicRoomConfig preserves editorial hotspots**
    - **Validates: Requirements 10.4, 10.5**

- [x] 17. Final checkpoint — ensure all tests pass
  - Run `npm test` (single pass); ensure all unit and property tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Tasks 1–7 are the Liquid deliverable; tasks 9–13 are the JS deliverable; tasks 15–16 are the test deliverable
- `camera.fov` is intentionally NOT set in `updateCameraForMode` — the camera is `THREE.OrthographicCamera`; only `uniforms.uParallaxStrength.value` is updated
- `mergeDynamicRoomConfig` must not overwrite the `hotspots` array — the existing IIFE only merges scalar fields when non-null/non-empty, so editorial hotspots added programmatically survive the merge
- Property tests use `fast-check` with `numRuns: 100` by default; parallax math tests (Properties 6, 7) use `numRuns: 500`
