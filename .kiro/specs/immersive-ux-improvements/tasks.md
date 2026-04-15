# Implementation Plan: Immersive UX Improvements

## Overview

Three additive improvements to `sections/immersive-canvas.liquid`, `assets/immersive-store.js`, `assets/immersive-theme.css`, and `locales/en.default.json`. No new files. All changes follow the existing BEM `.immersive-*` namespace, `| t` localisation, and `prefers-reduced-motion` conventions.

## Tasks

- [x] 1. Add Room Identity Badge — HTML, translations, and CSS
  - [x] 1.1 Add `room_badge` translation keys to `locales/en.default.json`
    - Add `sections.immersive_store.room_badge` object with `name_*` and `guidance_*` keys for all five rooms: `storefront`, `lounge`, `designer_houses`, `occasions`, `featured_collections`
    - Values: see design doc Data Models section
    - _Requirements: 1.3, 1.4_

  - [x] 1.2 Add `#immersive-room-badge` HTML shell to `sections/immersive-canvas.liquid`
    - Insert `<div id="immersive-room-badge" class="immersive-room-badge" aria-live="polite" aria-atomic="true">` with `data-room-badge-name` and `data-room-badge-guidance` child spans, inside `.immersive-store__canvas-wrapper` after `#ui-layer`
    - Add all ten `data-room-name-{key}` and `data-room-guidance-{key}` attributes rendered via `| t | escape`
    - _Requirements: 1.1, 1.3, 1.4, 1.8_

  - [x] 1.3 Add `.immersive-room-badge` CSS to `assets/immersive-theme.css`
    - Position: `absolute`, `bottom: 2rem`, `left: 1.5rem`, `z-index: 20`, `pointer-events: none`
    - `flex-direction: column`, `gap: 0.25rem`, `max-width: calc(100% - 3rem)`
    - Style `__name` (gold, uppercase, letter-spacing) and `__guidance` (muted, smaller) sub-elements
    - Ensure badge does not overlap header at 375px–1440px (use `bottom` positioning, not `top`)
    - _Requirements: 1.1, 1.6, 1.7, 1.8, 1.9_

  - [x] 1.4 Implement `updateRoomBadge(roomKey)` in `assets/immersive-store.js`
    - New helper: reads `data-room-name-{roomKey}` and `data-room-guidance-{roomKey}` from `#immersive-room-badge`, sets `textContent` on `[data-room-badge-name]` and `[data-room-badge-guidance]`
    - If badge element is absent: `console.warn('[Immersive] Room badge element not found for room:', roomKey)` and return — no throw
    - Call `updateRoomBadge(roomKey)` at the end of `goToRoom()` on both the initial load path and the transition completion path
    - _Requirements: 1.2, 1.3, 1.5, 1.10_

  - [ ]* 1.5 Write property test for Room badge updates on every room transition (Property 1)
    - **Property 1: Room badge updates on every room transition**
    - Generate random room keys from `Object.keys(STORE_ROOMS)`; set `data-room-name-{key}` to a random string; call `updateRoomBadge(key)`; assert `[data-room-badge-name].textContent` equals that string
    - **Validates: Requirements 1.2, 1.3, 1.5**

  - [ ]* 1.6 Write unit tests for `updateRoomBadge` edge cases
    - Test graceful no-op when badge element is absent (no throw, `console.warn` called)
    - Test fallback to `roomKey` string when `data-room-name-{key}` attribute is missing
    - _Requirements: 1.10_

- [x] 2. Add Discoverable Hotspot Affordances — ring, label, tab order, aria
  - [x] 2.1 Update `renderHotspots(roomKey)` in `assets/immersive-store.js` — sort and accessibility attributes
    - Before the render loop, sort hotspots: `room.hotspots.slice().sort(...)` by `y` ascending (primary), `x` ascending (secondary), using a 10-point row-grouping threshold — do not mutate the original array
    - Add `tabindex="0"` and `aria-label="{hotspot.label}"` to every rendered `<button>`
    - _Requirements: 2.8, 2.9, 2.10_

  - [x] 2.2 Add `.immersive-hotspot__ring` element to each hotspot button
    - Append `<span class="immersive-hotspot__ring" aria-hidden="true"></span>` inside every rendered hotspot button
    - _Requirements: 2.1, 2.11_

  - [x] 2.3 Add `.immersive-hotspot__label` element with blank-label guard
    - If `hotspot.label` is non-empty and non-whitespace: append `<span class="immersive-hotspot__label" aria-hidden="true">{label}</span>` inside the button
    - If `hotspot.label` is blank, `undefined`, or whitespace-only: omit the label element entirely
    - _Requirements: 2.3, 2.4, 2.5, 2.12_

  - [x] 2.4 Add hotspot ring and label CSS to `assets/immersive-theme.css`
    - `.immersive-hotspot__ring`: `position: absolute`, `inset: -6px`, `border-radius: 50%`, gold border, `animation: immersive-hotspot-pulse 2s ... infinite`
    - `@keyframes immersive-hotspot-pulse`: `0%/100%` scale 1 opacity 0.7 → `50%` scale 1.35 opacity 0
    - `@media (prefers-reduced-motion: reduce)`: `animation: none`, static ring visible at `opacity: 0.6`
    - `.immersive-hotspot__label`: `position: absolute`, `bottom: calc(100% + 8px)`, centered, pill style, `opacity: 0`, `transition: opacity 0.15s ease`
    - `.immersive-hotspot:hover .immersive-hotspot__label, .immersive-hotspot:focus-visible .immersive-hotspot__label`: `opacity: 1`
    - `@media (prefers-reduced-motion: reduce)`: `transition: none` on label
    - Viewport overflow prevention: `max-width: min(200px, calc(100vw - 2rem))`, `text-overflow: ellipsis`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.11, 2.13_

  - [ ]* 2.5 Write property test for all hotspot buttons have required accessibility attributes (Property 2)
    - **Property 2: All hotspot buttons have required accessibility attributes**
    - Generate random arrays of hotspot configs; call `renderHotspots()` with a mock room; assert every rendered button has `tabindex="0"` and `aria-label` equal to the hotspot's `label`
    - **Validates: Requirements 2.8, 2.10**

  - [ ]* 2.6 Write property test for hotspot DOM order matches reading order (Property 3)
    - **Property 3: Hotspot DOM order matches reading order**
    - Generate random hotspot configs with varied x/y; call `renderHotspots()`; assert DOM order matches sort by `y` ascending then `x` ascending within 10-point row threshold
    - **Validates: Requirements 2.9**

  - [ ]* 2.7 Write property test for hotspot label element reflects config label value (Property 4)
    - **Property 4: Hotspot label element reflects config label value**
    - Generate random hotspot configs with non-empty label strings; assert rendered button contains `.immersive-hotspot__label` with matching `textContent`
    - **Validates: Requirements 2.3, 2.4, 2.5**

  - [ ]* 2.8 Write property test for blank labels produce no label element (Property 5)
    - **Property 5: Blank labels produce no label element**
    - Generate hotspot configs with blank, `undefined`, or whitespace-only labels; assert no `.immersive-hotspot__label` element is rendered
    - **Validates: Requirements 2.12**

  - [ ]* 2.9 Write property test for all hotspot buttons contain a ring element (Property 6)
    - **Property 6: All hotspot buttons contain a ring element**
    - Generate random room configs with 1–10 hotspots; assert every rendered button contains exactly one `.immersive-hotspot__ring` element
    - **Validates: Requirements 2.1, 2.11**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add Editorial Overlay Hierarchy & Animation — slide-up, backdrop blur, room label
  - [x] 4.1 Add `[data-panel-room-label]` element to `#glass-panel` header in `sections/immersive-canvas.liquid`
    - Insert `<span class="immersive-store__panel-room-label" data-panel-room-label aria-hidden="true"></span>` immediately before `<h2 id="glass-panel-title">` inside `.immersive-store__panel-header`
    - _Requirements: 3.1, 3.8_

  - [x] 4.2 Implement `setPanelRoomLabel(panel)` in `assets/immersive-store.js`
    - New helper: queries `[data-panel-room-label]` inside `panel`; reads `data-room-name-{immersiveState.currentRoom}` from `#immersive-room-badge`; sets `textContent`
    - Call `setPanelRoomLabel(panel)` inside the `renderCallback` of both `openCollectionPanel()` and `openProductPanel()`
    - _Requirements: 3.8_

  - [x] 4.3 Update `openPanel()` in `assets/immersive-store.js` for slide-up animation
    - After removing `hidden` and setting `data-open`, determine `enteringClass` based on `panel.id`
    - If `!reduceMotion`: add `enteringClass`, call `openDialogFocus()` inside `setTimeout(350ms)` after removing `enteringClass`
    - If `reduceMotion`: skip class, call `openDialogFocus()` immediately
    - _Requirements: 3.2, 3.3, 3.4, 3.9, 3.13_

  - [x] 4.4 Update `performEditorialUIActivation()` in `assets/immersive-store.js` for overlay animation
    - After `overlay.classList.add('is-active')`, if `!reduceMotion`: add `.immersive-editorial-overlay--entering`, remove it after 350ms and focus `#immersive-editorial-back`
    - If `reduceMotion`: use `requestAnimationFrame` to focus `#immersive-editorial-back` immediately
    - _Requirements: 3.6, 3.7, 3.10_

  - [x] 4.5 Add slide-up animation and backdrop-filter CSS to `assets/immersive-theme.css`
    - `@keyframes immersive-slide-up`: `from { opacity: 0; transform: translateY(40px); }` → `to { opacity: 1; transform: translateY(0); }`
    - `.immersive-store__panel--entering` and `.immersive-editorial-overlay--entering`: `animation: immersive-slide-up 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards`
    - Entering state: `backdrop-filter: blur(0px)`, `transition: backdrop-filter 350ms cubic-bezier(0.16, 1, 0.3, 1)`
    - Non-entering state: `backdrop-filter: blur(16px)`
    - `@supports not (backdrop-filter: blur(1px))`: solid fallback `background: rgba(10, 15, 30, 0.92) !important`
    - `@media (prefers-reduced-motion: reduce)`: `animation: none`; entering state gets `backdrop-filter: blur(16px)` immediately, `transition: none`
    - `.immersive-store__panel-room-label` styles: small uppercase gold label above panel title
    - _Requirements: 3.2, 3.3, 3.4, 3.6, 3.7, 3.9, 3.10, 3.11_

  - [ ]* 4.6 Write property test for panel room label matches Room_Badge room name (Property 7)
    - **Property 7: Panel room label matches Room_Badge room name**
    - Generate random room keys and random room name strings; set badge `data-room-name-{key}` attributes; call `setPanelRoomLabel()`; assert panel label `textContent` equals the badge attribute value
    - **Validates: Requirements 3.8**

  - [ ]* 4.7 Write unit tests for `openPanel()` animation class lifecycle
    - Test that `.immersive-store__panel--entering` is added on open and removed after 350ms
    - Test that `openDialogFocus()` is called after the timeout (not before)
    - Test reduced-motion path: no entering class added, `openDialogFocus()` called synchronously
    - _Requirements: 3.2, 3.4, 3.9, 3.13_

- [x] 5. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use Jest + jsdom + fast-check (minimum 100 iterations each)
- The `reduceMotion` variable is already cached at page load in `immersive-store.js` — use it directly
- Do not mutate `room.hotspots` in `renderHotspots()` — always sort a `.slice()` copy
- `updateRoomBadge()` must be called on both the initial `goToRoom()` path and the transition completion callback
