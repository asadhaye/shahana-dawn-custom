# Requirements Document

## Introduction

This document defines requirements for six editorial enhancement modules added to the Shahana Collection immersive 3D store at `/pages/immersive`. The enhancements deepen the editorial layer of the experience: a scroll-to-reveal gesture surfaces room editorial overlays from within the 3D canvas; a "Back to Lounge" shortcut inside each editorial overlay lets shoppers return to the hub room without going through the 3D room first; the lounge room picker visually reflects which rooms a shopper has already visited; a CSS parallax effect enriches editorial hero images as the overlay scrolls; and a CSS perspective tilt effect gives product cards tactile depth on hover. A sixth deliverable is a comprehensive customer journey document generated after implementation. All modules are implemented as progressive enhancements — the Three.js canvas, room navigation, and editorial overlay system remain authoritative for the 3D world.

---

## Glossary

- **EditorialScrollReveal**: The module that intercepts downward scroll on the canvas wrapper while in a room view and triggers `enterEditorialMode()` for that room, easing out the Three.js parallax as the editorial overlay slides in.
- **EditorialBackToLounge**: The persistent "Back to Lounge" chip rendered inside `#immersive-editorial-overlay` that calls `goToRoom('lounge')` and closes the editorial overlay.
- **VisitedRoomsIndicator**: The module that reads `_browsingContext.visitedRooms` and applies the `.is-visited` CSS class to matching `[data-room-key]` buttons in the room picker sheet (`[data-bottom-nav-room-picker]`).
- **EditorialHeroParallax**: The CSS/JS scroll-driven `translateY()` effect applied to `.immersive-editorial__hero-bg` images as the editorial overlay's scroll position changes.
- **ProductCardTilt**: The CSS perspective tilt effect on `.immersive-product-card` elements driven by `mousemove` within each card's bounds.
- **CustomerJourneyDocument**: The markdown document at `docs/customer-journey.md` mapping every shopper touchpoint, architecture decisions, and AI image-prompt guidance for each touchpoint.
- **ImmersiveGestures**: The existing touch gesture handler; owns `touchstart`/`touchmove`/`touchend` on the canvas wrapper.
- **enterEditorialMode(roomKey, triggerEl)**: The existing function in `assets/immersive-store.js` that transitions the store into editorial mode for a given room.
- **exitEditorialMode()**: The existing function in `assets/immersive-store.js` that closes the editorial overlay and returns to the 3D room.
- **goToRoom(roomKey)**: The existing function in `assets/immersive-store.js` that navigates the Three.js scene to the specified room.
- **immersiveState**: The existing state object in `assets/immersive-store.js`; relevant fields: `mode` (`'showroom'` | `'editorial'`), `editorialRoom`, `currentRoom`.
- **_browsingContext**: The existing in-memory object in `assets/immersive-store.js`; relevant field: `visitedRooms` (array of room keys visited in the current session).
- **glass-panel**: The `role="dialog"` overlay (`#glass-panel`) that renders collection and product content via the Section Rendering API.
- **room picker sheet**: The sheet revealed when the Rooms item in the bottom nav is tapped; contains `[data-bottom-nav-room-picker]` with `[data-room-key]` buttons for each room.
- **canvas wrapper**: The element wrapping `<canvas id="immersive-canvas">` and the `#ui-layer`; the scroll target for EditorialScrollReveal.
- **parallaxStrength**: The existing numeric variable in `assets/immersive-store.js` controlling the UV offset magnitude of the Three.js pointer parallax.
- **reduceMotion**: The existing boolean variable in `assets/immersive-store.js` set from `window.matchMedia('(prefers-reduced-motion: reduce)')`.

---

## Requirements

### Requirement 1: Scroll-to-Reveal Editorial

**User Story:** As a shopper exploring a room in the immersive store, I want to scroll down on the canvas to reveal the room's editorial overlay so that I can read the story behind the room without having to find and click an editorial hotspot.

#### Acceptance Criteria

1. WHILE `immersiveState.mode === 'showroom'` and `immersiveState.currentRoom` is one of `designer_houses`, `occasions`, or `featured_collections`, THE EditorialScrollReveal SHALL listen for scroll intent on the canvas wrapper.
2. WHEN scroll intent is detected and `immersiveState.mode === 'showroom'` and no glass-panel is open, THE EditorialScrollReveal SHALL call `enterEditorialMode(immersiveState.currentRoom, null)`.
3. WHEN scroll intent is detected and the glass-panel (`#glass-panel`) is open, THE EditorialScrollReveal SHALL ignore the scroll and SHALL NOT call `enterEditorialMode()`.
4. WHEN scroll intent is detected and `immersiveState.currentRoom` is `storefront` or `lounge`, THE EditorialScrollReveal SHALL ignore the scroll and SHALL NOT call `enterEditorialMode()`.
5. WHEN transitioning into editorial mode via scroll, THE EditorialScrollReveal SHALL ease `parallaxStrength` to `0` over 300ms before the editorial overlay reaches full opacity.
6. WHERE `reduceMotion` is `true`, THE EditorialScrollReveal SHALL call `enterEditorialMode()` immediately without the parallaxStrength ease-out animation.
7. ON desktop, THE EditorialScrollReveal SHALL detect scroll intent as a `wheel` event with `deltaY > 0` on the canvas wrapper.
8. ON mobile, THE EditorialScrollReveal SHALL detect scroll intent as a downward swipe gesture (`touchend` with vertical delta ≥ 60px, `|deltaY| / |deltaX| > 2.5`) when no glass-panel is open.
9. WHEN a downward swipe is detected on mobile and the glass-panel is open, THE ImmersiveGestures SHALL close the panel (existing behavior) and THE EditorialScrollReveal SHALL NOT trigger.
10. THE EditorialScrollReveal SHALL enforce a 700ms cooldown after triggering to prevent repeated firing from a single scroll event burst.
11. THE EditorialScrollReveal SHALL be implemented exclusively in `assets/immersive-store.js` using vanilla JS with no new libraries.

---

### Requirement 2: "Back to Lounge" Shortcut in Editorial Overlays

**User Story:** As a shopper reading an editorial overlay, I want a persistent "Back to Lounge" button so that I can return directly to the lounge hub room without first closing the overlay and then navigating back through the 3D room.

#### Acceptance Criteria

1. THE EditorialBackToLounge SHALL render a `<button class="immersive-editorial__back-to-lounge" data-editorial-back-to-lounge>` inside `#immersive-editorial-overlay` as a persistent secondary action alongside the existing close button.
2. WHEN a user activates the "Back to Lounge" button, THE EditorialBackToLounge SHALL call `exitEditorialMode()` and then call `goToRoom('lounge')`.
3. WHEN the editorial overlay is for the `lounge` room itself, THE EditorialBackToLounge SHALL hide the button (the current room is already the lounge).
4. THE EditorialBackToLounge SHALL label the button using a locale key (`sections.immersive_editorial.back_to_lounge`) passed via a `data-label` attribute on the overlay shell, with a fallback of "Back to Lounge".
5. THE EditorialBackToLounge SHALL be visually distinct from the close button: the close button returns to the 3D room; the "Back to Lounge" button is a secondary chip-style action at the top of the overlay.
6. WHEN the editorial overlay receives focus for the first time (on open), THE EditorialBackToLounge SHALL ensure the close button remains the first focusable element; the "Back to Lounge" button is the second focusable element.
7. THE EditorialBackToLounge button SHALL be keyboard-accessible and activatable via Enter and Space keys.
8. THE EditorialBackToLounge button SHALL be present in the DOM at all times the overlay is open, including after the Section Rendering API content injection into `#immersive-editorial-overlay-content`.

---

### Requirement 3: Lounge Room Picker — Visited State

**User Story:** As a shopper in the immersive store, I want the room picker to show which rooms I have already visited so that I can choose to revisit a favourite room or explore one I have not yet seen.

#### Acceptance Criteria

1. THE VisitedRoomsIndicator SHALL apply the CSS class `.is-visited` to every `[data-room-key]` button in `[data-bottom-nav-room-picker]` whose `data-room-key` value is present in `_browsingContext.visitedRooms`.
2. WHEN a new room key is added to `_browsingContext.visitedRooms`, THE VisitedRoomsIndicator SHALL update the `.is-visited` classes on the room picker buttons within 100ms of the update.
3. WHEN the room picker sheet is opened, THE VisitedRoomsIndicator SHALL synchronise `.is-visited` states against the current `_browsingContext.visitedRooms` array before the sheet becomes visible to the user.
4. THE VisitedRoomsIndicator SHALL NOT apply `.is-visited` to the `lounge` or `storefront` room buttons, as these are navigation hubs rather than editorial destinations.
5. THE VisitedRoomsIndicator SHALL express the visited state via a CSS-only visual indicator (e.g., a gold check mark or border on the button) defined in `assets/immersive-theme.css` under the `.is-visited` modifier.
6. THE VisitedRoomsIndicator SHALL add `aria-description` text to each visited button (via `data-visited-label` on the button, populated from locale key `sections.immersive_store.room_visited`) so that screen readers announce the visited state.
7. IF `_browsingContext.visitedRooms` is empty or undefined, THE VisitedRoomsIndicator SHALL apply no `.is-visited` classes and SHALL NOT throw an error.
8. THE VisitedRoomsIndicator logic SHALL live in `assets/immersive-store.js` and SHALL reuse the existing `_browsingContext` object without introducing a separate state store.

---

### Requirement 4: CSS Parallax on Editorial Hero Images

**User Story:** As a shopper reading an editorial overlay, I want the hero background image to shift subtly as I scroll so that the editorial feels alive and immersive even outside the Three.js canvas.

#### Acceptance Criteria

1. THE EditorialHeroParallax SHALL apply a `translateY()` transform to `.immersive-editorial__hero-bg` images in response to the editorial overlay's scroll position.
2. THE EditorialHeroParallax SHALL compute the `translateY` value as `scrollTop * 0.3` pixels, clamped to a maximum absolute displacement of `60px`.
3. THE EditorialHeroParallax SHALL listen to the `scroll` event on `#immersive-editorial-overlay` and update transforms inside a `requestAnimationFrame` callback using a lerp with factor `0.08`.
4. THE EditorialHeroParallax SHALL operate only on the hero image inside the currently active editorial overlay and SHALL clean up its scroll listener when `exitEditorialMode()` is called.
5. WHERE `reduceMotion` is `true`, THE EditorialHeroParallax SHALL apply no `translateY` transform and SHALL skip attaching the scroll listener.
6. THE EditorialHeroParallax SHALL be implemented using vanilla JS and CSS `will-change: transform` on `.immersive-editorial__hero-bg`; no WebGL or canvas involvement.
7. THE EditorialHeroParallax SHALL respect the existing `overflow: hidden` container on the hero element to prevent the parallax image from visually overflowing the hero bounds.
8. THE EditorialHeroParallax logic SHALL live in `assets/immersive-store.js`; the `will-change: transform` declaration SHALL live in `assets/immersive-theme.css`.

---

### Requirement 5: CSS Perspective Tilt on Product Card Hover

**User Story:** As a shopper browsing product cards in a collection panel, I want cards to tilt subtly towards my cursor so that the interface has a tactile, dimensional quality consistent with the 3D store aesthetic.

#### Acceptance Criteria

1. THE ProductCardTilt SHALL listen to `mousemove` events within `.immersive-product-card` elements and apply a CSS `perspective` + `rotateX` / `rotateY` transform driven by cursor position relative to the card bounds.
2. THE ProductCardTilt SHALL compute the normalised cursor offset as `(cursorX - cardCenterX) / (cardWidth / 2)` for the X axis and `(cursorY - cardCenterY) / (cardHeight / 2)` for the Y axis, both clamped to `[-1, 1]`.
3. THE ProductCardTilt SHALL apply a maximum tilt of `8deg` on each axis (`rotateY = normalX * 8deg`, `rotateX = -normalY * 8deg`) with a CSS `perspective` of `600px` set on the card element.
4. THE ProductCardTilt SHALL throttle transform updates to one per `requestAnimationFrame` tick.
5. WHEN the cursor leaves a card (`mouseleave`), THE ProductCardTilt SHALL reset the transform to `rotateX(0) rotateY(0)` using a CSS `transition: transform 400ms ease-out`.
6. WHERE `reduceMotion` is `true`, THE ProductCardTilt SHALL apply no transform on `mousemove` and SHALL NOT attach the `mousemove` listener.
7. THE ProductCardTilt SHALL be implemented using vanilla JS event delegation on the collection panel container, not individual card listeners, to handle dynamically injected cards.
8. THE ProductCardTilt CSS (`perspective`, `transform-style: preserve-3d`, `transition`, and the reduced-motion override) SHALL be declared in the `{% stylesheet %}` block of `snippets/immersive-product-card.liquid`.
9. THE ProductCardTilt SHALL have no effect on touch devices; the `mousemove` listener SHALL only fire on devices where `pointer: fine` is available, guarded by `window.matchMedia('(pointer: fine)')`.
10. WHEN a product card is focused via keyboard, THE ProductCardTilt SHALL NOT apply any tilt transform, preserving a flat, stable appearance for keyboard users.

---

### Requirement 6: Customer Journey Document

**User Story:** As a developer or content team member, I want a comprehensive customer journey document for the Shahana Collection 3D store so that every shopper touchpoint is mapped, the architecture is explained, and an AI agent can generate on-brand images for each touchpoint.

#### Acceptance Criteria

1. THE CustomerJourneyDocument SHALL be generated as `docs/customer-journey.md` after all five preceding enhancements have been implemented.
2. THE CustomerJourneyDocument SHALL map every named shopper touchpoint in the immersive store, grouped into journey phases: Discovery, Entry, Room Navigation, Editorial Exploration, Product Browsing, Cart & Checkout, and Return Visit.
3. FOR each touchpoint, THE CustomerJourneyDocument SHALL include: touchpoint name, journey phase, triggering action, system response, key files involved, and relevant state changes in `immersiveState` or `_browsingContext`.
4. THE CustomerJourneyDocument SHALL include an Architecture Overview section describing the layered rendering model: Three.js canvas layer, DOM overlay layer (glass panel, editorial overlay, bottom nav), and Liquid/Section Rendering API content injection.
5. THE CustomerJourneyDocument SHALL include an Image Prompt Guidance section with one AI image-generation prompt per touchpoint, each prompt specifying: subject, environment, lighting, mood, aspect ratio, and style keywords consistent with the Shahana Collection brand aesthetic (gold accents `#d4af37`, editorial luxury fashion, Pakistani bridal and formal wear).
6. THE CustomerJourneyDocument SHALL reference all five enhancements in this spec (EditorialScrollReveal, EditorialBackToLounge, VisitedRoomsIndicator, EditorialHeroParallax, ProductCardTilt) as touchpoints or architectural notes where applicable.
7. THE CustomerJourneyDocument SHALL be valid Markdown with a table of contents, consistent heading hierarchy (h1 title, h2 phases, h3 touchpoints), and no broken internal links.
8. IF `docs/customer-journey.md` already exists at the time of generation, THE CustomerJourneyDocument SHALL overwrite the existing file rather than creating a duplicate.
