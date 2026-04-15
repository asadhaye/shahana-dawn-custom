# Implementation Plan: Immersive Experience Polish

## Overview

Six targeted polish improvements to `assets/immersive-store.js` and associated Liquid/locale files. All changes are vanilla JS with no build step. Each feature branches on the existing `reduceMotion` variable and wraps `localStorage` in `try/catch`. Tests use Jest + jsdom + fast-check in `tests/`.

## Tasks

- [x] 1. Add new locale keys to `locales/en.default.json`
  - Add `sections.immersive_store.add_to_edit`, `action_done`, `back_to_room`, `welcome_toast`, `based_on_saves`
  - Add `sections.immersive_store.wishlist.empty_encouragement`
  - Add `sections.immersive_journey_bridges.bridge_label_explore_3d` and `bridge_subtext`
  - _Requirements: 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 6.5_

- [x] 2. Implement smooth room transitions in `assets/immersive-store.js`
  - [x] 2.1 Refactor `goToRoom()` to set `transitioning = true` at Phase 1 start and apply CSS fade-out on `#ui-layer` before the WebGL crossfade
    - Set `transitioning = true` immediately when `goToRoom()` is called (not after fade-out)
    - Apply `uiLayer.style.transition = 'opacity 0.25s ease-in-out'` and `uiLayer.style.opacity = '0'` then `setTimeout(250ms)` before calling `_startWebGLTransition()`
    - When `reduceMotion` is true, skip CSS transition and set opacity synchronously
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  - [x] 2.2 Implement fade-in of `#ui-layer` after WebGL crossfade completes
    - After `renderHotspots()` and `updateRoomBadge()`, apply fade-in transition (opacity 0→1, 250ms ease-in-out)
    - Set `transitioning = false` only after fade-in begins (not before)
    - When `reduceMotion` is true, restore opacity synchronously
    - _Requirements: 1.2, 1.3, 1.5, 1.6_
  - [ ]* 2.3 Write property test for hotspot suppression during transitions
    - **Property 1: Hotspot clicks are suppressed during transitions**
    - **Validates: Requirements 1.4**
  - [ ]* 2.4 Write unit tests for transition sequence
    - Test `transitioning = true` is set before fade-out; `uiLayer.style.opacity` is `'0'` after call; `uiLayer.style.opacity` is `'1'` after WebGL step completes
    - Test reduced-motion path skips CSS transition strings
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement emotional wishlist polish in `assets/immersive-store.js`
  - [x] 4.1 Update `addToWishlist()` to record `discoveryRoom` and trigger animations
    - Accept `sourceEl` parameter for fly-to animation origin
    - Store `{ handle, discoveryRoom: immersiveState.currentRoom }` instead of bare string
    - Migrate old string-format items on load: `{ handle: item, discoveryRoom: null }`
    - Call `_triggerHeartPulse()` and `_flyToWishlist(sourceEl)` (both guard on `reduceMotion`)
    - Call `recordBrowsingSignal(immersiveState.currentRoom)` (Feature 6 call site)
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.8_
  - [ ]* 4.2 Write property test for badge update regardless of motion preference
    - **Property 2: Wishlist badge always updates regardless of motion preference**
    - **Validates: Requirements 2.3**
  - [ ]* 4.3 Write property test for discovery room recorded at save time
    - **Property 3: Discovery room is recorded at save time**
    - **Validates: Requirements 2.5**
  - [x] 4.4 Add `_triggerHeartPulse()` and `_flyToWishlist()` helper functions
    - `_triggerHeartPulse()`: add/remove `.immersive-wishlist-btn--pulse` class on `[data-wishlist-open]`, force reflow with `void btn.offsetWidth`, remove after 600ms
    - `_flyToWishlist(sourceEl)`: create `.immersive-fly-token` div at source rect, animate via CSS transform to wishlist button rect, remove after 550ms
    - Both functions return early when `reduceMotion` is true
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 4.5 Update `renderWishlistPanel()` to group items by `discoveryRoom` and render empty encouragement
    - Group `_wishlistItems` by `discoveryRoom`; render a room-label heading (e.g. "Found in: Lounge") above each group
    - When `_wishlistItems` is empty, render `data-msg-empty-encouragement` attribute value instead of `data-msg-empty`
    - Add `data-msg-empty-encouragement` attribute to `#immersive-wishlist-panel` in `sections/immersive-canvas.liquid` sourced from `sections.immersive_store.wishlist.empty_encouragement | t`
    - _Requirements: 2.4, 2.6, 2.7_
  - [ ]* 4.6 Write property test for wishlist grouped by discovery room
    - **Property 4: Wishlist items are grouped by discovery room in rendered output**
    - **Validates: Requirements 2.4**
  - [ ]* 4.7 Write property test for discovery room localStorage round-trip
    - **Property 5: Discovery room survives localStorage round-trip**
    - **Validates: Requirements 2.8**
  - [x] 4.8 Add heart-pulse and fly-token CSS to `sections/immersive-canvas.liquid` `{% stylesheet %}` block
    - `.immersive-wishlist-btn--pulse` keyframe animation (scale 1→1.4→1, 600ms)
    - `.immersive-fly-token` styles (fixed position, small circle, gold color, `pointer-events:none`, `aria-hidden`)
    - `@media (prefers-reduced-motion: reduce)` block suppressing both animations
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement bridge CTAs with trust (Feature 3)
  - [x] 6.1 Add `bridge_subtext` parameter to `snippets/immersive-bridge-btn.liquid`
    - Add optional `bridge_subtext` parameter; when provided, render `<span class="immersive-bridge-btn__subtext">{{ bridge_subtext | escape }}</span>` below the label span
    - Add `.immersive-bridge-btn__subtext` CSS in the snippet's `{% stylesheet %}` block
    - _Requirements: 3.1, 3.2_
  - [x] 6.2 Add `showWelcomeToast()` function to `assets/immersive-store.js`
    - Check `localStorage.getItem(ONBOARDING_KEY)` — return early if set
    - Read toast message from `data-msg-welcome-toast` attribute on the section element
    - Create toast div with `role="status"` and `aria-live="polite"`, class `.immersive-welcome-toast`
    - Add close button; auto-dismiss after 5000ms via `setTimeout`; dismiss clears timer
    - Apply `.immersive-welcome-toast--animate-in` class unless `reduceMotion`; on dismiss apply `--animate-out` then `remove()` after 300ms (or immediate if `reduceMotion`)
    - Call `showWelcomeToast()` from `initImmersiveScene()` after `hideLoader()`
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  - [x] 6.3 Add welcome toast shell attributes and CSS to `sections/immersive-canvas.liquid`
    - Add `data-msg-welcome-toast="{{ 'sections.immersive_store.welcome_toast' | t | escape }}"` to the section root element
    - Add `.immersive-welcome-toast` CSS (position, animation keyframes, `--animate-in`, `--animate-out` classes) to the `{% stylesheet %}` block
    - Add `@media (prefers-reduced-motion: reduce)` block suppressing toast animations
    - _Requirements: 3.4, 3.5, 3.7_
  - [ ]* 6.4 Write property test for welcome toast shown iff ONBOARDING_KEY absent
    - **Property 6: Welcome toast shown iff ONBOARDING_KEY is absent**
    - **Validates: Requirements 3.3, 3.8**
  - [ ]* 6.5 Write unit tests for toast accessibility and lifecycle
    - Test toast has `role="status"` and `aria-live="polite"`
    - Test close button removes toast; test auto-dismiss after 5000ms
    - Test toast not shown when `ONBOARDING_KEY` is set
    - _Requirements: 3.5, 3.6, 3.8_

- [x] 7. Implement unified microcopy tone (Feature 4)
  - [x] 7.1 Update close button labels in `sections/immersive-canvas.liquid` to use `action_done`
    - Replace `{{ 'sections.immersive_store.close' | t }}` on the glass panel close button with `{{ 'sections.immersive_store.action_done' | t }}`
    - Update `aria-label` on the same button accordingly
    - _Requirements: 4.2, 4.4, 4.5_
  - [x] 7.2 Update add-to-cart labels in `sections/glass-product.liquid` and `snippets/immersive-product-card.liquid`
    - Replace add-to-cart button text within immersive surfaces with `{{ 'sections.immersive_store.add_to_edit' | t }}`
    - _Requirements: 4.1, 4.4, 4.5_
  - [x] 7.3 Add `data-msg-back-to-room` attribute and update back-navigation labels in JS
    - Add `data-msg-back-to-room="{{ 'sections.immersive_store.back_to_room' | t: room_name: '' | escape }}"` (or pass the raw template string) to `#ui-layer` in `sections/immersive-canvas.liquid`
    - In JS, read the attribute and replace `{{ room_name }}` placeholder with the actual room label string
    - _Requirements: 4.3, 4.4_
  - [ ]* 7.4 Write property test for back_to_room interpolation
    - **Property 7: back_to_room interpolation contains the room name**
    - **Validates: Requirements 4.3**

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement preference banner animated dismiss (Feature 5)
  - [x] 9.1 Update the inline dismiss script in `layout/theme.liquid`
    - Replace the existing `banner.remove()` dismiss handler with an animated version
    - Read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at dismiss time
    - When motion allowed: set `banner.style.transition = 'opacity 0.25s ease, transform 0.25s ease'`, `opacity = '0'`, `transform += ' translateY(8px)'`, then `setTimeout(260ms)` → `banner.remove()` + focus restore
    - When reduced motion: `banner.remove()` immediately, then focus restore
    - Focus restore: `if (next && typeof next.focus === 'function') next.focus()` (preserve existing `nextElementSibling` logic)
    - _Requirements: 5.4, 5.5, 5.6_
  - [ ]* 9.2 Write property test for focus restoration after banner dismiss
    - **Property 14: Focus is restored to next sibling after banner dismiss**
    - **Validates: Requirements 5.6**
  - [ ]* 9.3 Write unit tests for banner dismiss behavior
    - Test dismiss removes banner from DOM
    - Test reduced-motion path skips CSS transition
    - Test focus moves to next focusable sibling
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 10. Implement personalized room suggestions (Feature 6)
  - [x] 10.1 Add `recordBrowsingSignal()` and `getRelevantRooms()` to `assets/immersive-store.js`
    - `recordBrowsingSignal(roomKey)`: read `immersive_browsing_signals` array, push `roomKey`, cap at 50 (keep most recent), write back — all in `try/catch`
    - `getRelevantRooms()`: read signals array, count occurrences per room key, return object with keys that appear ≥ 2 times — all in `try/catch`, return `{}` on error
    - Store only room key strings; no product handles, collection handles, or PII
    - _Requirements: 6.1, 6.2, 6.3, 6.8, 6.9, 6.10_
  - [ ]* 10.2 Write property test for browsing signals record current room
    - **Property 8: Browsing signals record the current room on panel open**
    - **Validates: Requirements 6.1, 6.2**
  - [ ]* 10.3 Write property test for browsing signals are pure room key strings
    - **Property 9: Browsing signals are pure room key strings**
    - **Validates: Requirements 6.3, 6.10**
  - [ ]* 10.4 Write property test for relevance threshold exactly 2 signals
    - **Property 10: Relevance threshold is exactly 2 signals**
    - **Validates: Requirements 6.4**
  - [ ]* 10.5 Write property test for signals array cap at 50
    - **Property 12: Browsing signals array never exceeds 50 entries**
    - **Validates: Requirements 6.9**
  - [ ]* 10.6 Write property test for localStorage failures are silent
    - **Property 13: localStorage failures are silent**
    - **Validates: Requirements 6.8**
  - [x] 10.7 Add `recordBrowsingSignal()` call sites in `openCollectionPanel()`, `openProductPanel()`, and `addToWishlist()`
    - Each call passes `immersiveState.currentRoom` as the room key
    - _Requirements: 6.1, 6.2_
  - [x] 10.8 Extend `renderHotspots()` to render `.immersive-hotspot__personalization` indicator
    - Call `getRelevantRooms()` once before the hotspot loop
    - For each hotspot targeting a relevant room, append a `<span class="immersive-hotspot__personalization">` with `aria-label` set to `basedOnSavesLabel` (read from `data-msg-based-on-saves` on `#ui-layer`)
    - Add `data-msg-based-on-saves="{{ 'sections.immersive_store.based_on_saves' | t | escape }}"` to `#ui-layer` in `sections/immersive-canvas.liquid`
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 6.8_
  - [ ]* 10.9 Write property test for personalization indicator presence
    - **Property 11: Personalization indicator appears iff room is relevant**
    - **Validates: Requirements 6.5**
  - [x] 10.10 Add `.immersive-hotspot__personalization` CSS to `sections/immersive-canvas.liquid`
    - Smaller font size than hotspot label, reduced opacity (e.g. 0.65), positioned below the hotspot label
    - Must not obscure the hotspot interaction target (`pointer-events: none`)
    - _Requirements: 6.6, 6.7_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All animation paths have a `reduceMotion` branch — test both paths
- `localStorage` is always wrapped in `try/catch`; private browsing must not throw
- Property tests run via fast-check with minimum 100 iterations each
- Test files map to features: `immersive-polish-transitions.test.js` (F1), `immersive-polish-wishlist.test.js` (F2), `immersive-polish-toast.test.js` (F3), `immersive-polish-microcopy.test.js` (F4), `immersive-polish-banner.test.js` (F5), `immersive-polish-signals.test.js` (F6)
- No new files, no new JS assets — all changes land in existing files
