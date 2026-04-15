# Requirements Document

## Introduction

This feature delivers three targeted UX improvements to the immersive 3D store at `/pages/immersive`. The improvements address three identified friction points: users not knowing which room they are in or what to do next; hotspots being too subtle to discover; and editorial glass panels lacking the editorial polish expected of a luxury fashion brand. All changes must integrate with the existing architecture — `sections/immersive-canvas.liquid`, `assets/immersive-store.js`, the `.immersive-*` BEM namespace, the `| t` localisation filter, and the `prefers-reduced-motion` media query.

---

## Glossary

- **Room_Badge**: The persistent pill/badge UI element that displays the current room name to the user.
- **Room_Guidance_Text**: The brief contextual instruction line rendered beneath the Room_Badge (e.g. "Explore hotspots to discover curated looks").
- **Hotspot**: An interactive point rendered by `renderHotspots(roomKey)` in `immersive-store.js`, positioned at `x`/`y` percentages over the canvas, with a `label` and one of `targetRoom`, `targetCollection`, or `targetEditorialRoom`.
- **Pulse_Ring**: The CSS keyframe animation that produces a pulsing concentric ring around a Hotspot to signal interactivity.
- **Hover_Label**: The tooltip-style text label that appears on pointer hover or keyboard focus over a Hotspot, showing the Hotspot's `label` value.
- **Glass_Panel**: Either `#glass-panel` (collection/product panel) or `#immersive-editorial-overlay` (editorial overlay), rendered as `role="dialog"` elements in `immersive-canvas.liquid`.
- **Editorial_Overlay**: The `#immersive-editorial-overlay` dialog element that displays per-room editorial content.
- **Slide_Up_Animation**: The CSS entrance animation applied to Glass_Panels on open — translating from below the viewport into position with a simultaneous backdrop blur.
- **Immersive_Store**: The WebGL 3D experience at `/pages/immersive`, powered by `assets/immersive-store.js` and `sections/immersive-canvas.liquid`.
- **goToRoom**: The JavaScript function in `immersive-store.js` that transitions the scene to a new room and updates `immersiveState.currentRoom`.
- **STORE_ROOMS**: The JavaScript object in `immersive-store.js` that defines room textures and hotspot configurations.
- **UI_Layer**: The `#ui-layer` DOM element that hosts all hotspot buttons rendered over the canvas.

---

## Requirements

### Requirement 1: Room Identity Badge

**User Story:** As a shopper exploring the immersive store, I want to always know which room I am in and what I should do there, so that I feel oriented and confident rather than lost.

#### Acceptance Criteria

1. THE Immersive_Store SHALL render a Room_Badge element persistently visible over the canvas while the user is in showroom mode.
2. WHEN `goToRoom(roomKey)` completes a room transition, THE Room_Badge SHALL update its displayed room name to reflect the new `roomKey` within 100ms of the transition completing.
3. THE Room_Badge SHALL display a human-readable room name derived from the current room key using the `| t` filter, with translation keys in the `sections.immersive_store` namespace.
4. THE Room_Badge SHALL render a Room_Guidance_Text line beneath the room name that provides brief contextual instruction relevant to the current room.
5. WHEN `goToRoom(roomKey)` completes a room transition, THE Room_Badge SHALL update its Room_Guidance_Text to the guidance string associated with the new room.
6. THE Room_Badge SHALL remain visible during hotspot hover and focus interactions.
7. WHILE a Glass_Panel is open, THE Room_Badge SHALL remain visible but SHALL NOT overlap or obscure the panel's interactive content.
8. THE Room_Badge SHALL use the `.immersive-room-badge` BEM block and follow the existing `.immersive-*` namespace convention.
9. THE Room_Badge SHALL be positioned so it does not overlap the immersive header controls on any viewport from 375px to 1440px wide.
10. IF the Room_Badge element is not present in the DOM when `goToRoom` is called, THEN THE Immersive_Store SHALL log a warning and continue without throwing an error.

---

### Requirement 2: Discoverable Hotspot Affordances

**User Story:** As a shopper viewing a room, I want hotspots to clearly signal that they are interactive and tell me what they lead to, so that I can confidently explore the store without guessing.

#### Acceptance Criteria

1. THE Immersive_Store SHALL render a Pulse_Ring animation on each Hotspot element in the UI_Layer to signal interactivity.
2. WHEN `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, THE Immersive_Store SHALL render a static visible ring on each Hotspot in place of the Pulse_Ring animation.
3. THE Immersive_Store SHALL render a Hover_Label on each Hotspot that becomes visible when the pointer enters the Hotspot's hit area.
4. THE Immersive_Store SHALL render a Hover_Label on each Hotspot that becomes visible when the Hotspot receives keyboard focus.
5. THE Hover_Label SHALL display the Hotspot's `label` value as defined in `STORE_ROOMS[roomKey].hotspots`.
6. WHEN the pointer leaves a Hotspot's hit area, THE Immersive_Store SHALL hide the Hover_Label for that Hotspot.
7. WHEN a Hotspot loses keyboard focus, THE Immersive_Store SHALL hide the Hover_Label for that Hotspot.
8. THE Immersive_Store SHALL assign `tabindex="0"` to each rendered Hotspot button so that keyboard users can reach every Hotspot via the Tab key.
9. THE Immersive_Store SHALL render Hotspot buttons in DOM order that corresponds to a logical left-to-right, top-to-bottom reading sequence based on their `x` and `y` positions, so that Tab order is predictable.
10. THE Immersive_Store SHALL assign each Hotspot button an `aria-label` attribute containing the Hotspot's `label` value.
11. THE Pulse_Ring animation SHALL use the `.immersive-hotspot__ring` BEM element and SHALL be implemented in CSS using `@keyframes`.
12. IF a Hotspot's `label` value is blank or undefined, THEN THE Immersive_Store SHALL omit the Hover_Label for that Hotspot and SHALL NOT render an empty tooltip.
13. THE Hover_Label SHALL be positioned so it does not overflow the viewport on any viewport from 375px to 1440px wide.

---

### Requirement 3: Editorial Overlay Hierarchy and Entrance Animation

**User Story:** As a shopper opening a collection panel or editorial overlay, I want the panel to feel like a premium editorial experience with clear content hierarchy and a polished entrance, so that the brand's luxury positioning is reinforced at every touchpoint.

#### Acceptance Criteria

1. THE Glass_Panel SHALL render its content in a consistent editorial hierarchy: room label → headline → standfirst → body → CTA, in that document order.
2. THE Glass_Panel SHALL apply a Slide_Up_Animation on open, translating the panel from `translateY(40px)` to `translateY(0)` with `opacity` from `0` to `1` over a duration of 350ms using a `cubic-bezier(0.16, 1, 0.3, 1)` easing curve.
3. THE Glass_Panel SHALL apply a `backdrop-filter: blur` to its background on open, with the blur value transitioning from `0px` to `16px` over the same 350ms duration as the Slide_Up_Animation.
4. WHEN `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, THE Glass_Panel SHALL appear immediately without the Slide_Up_Animation or blur transition, but SHALL still apply the final `backdrop-filter: blur(16px)` static value.
5. THE Editorial_Overlay SHALL render its content in the same editorial hierarchy: room label → headline → standfirst → body → CTA.
6. THE Editorial_Overlay SHALL apply the same Slide_Up_Animation and backdrop blur transition as the Glass_Panel on open.
7. WHEN `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, THE Editorial_Overlay SHALL apply the same reduced-motion behaviour as the Glass_Panel.
8. THE Glass_Panel room label SHALL display the name of the room from which the panel was opened, using the same translation keys as the Room_Badge.
9. THE Glass_Panel SHALL use the `.immersive-store__panel--entering` BEM modifier class to trigger the Slide_Up_Animation, applied by JavaScript on open and removed after the animation completes.
10. THE Editorial_Overlay SHALL use the `.immersive-editorial-overlay--entering` BEM modifier class to trigger the Slide_Up_Animation, applied by JavaScript on open and removed after the animation completes.
11. IF the browser does not support `backdrop-filter`, THEN THE Glass_Panel SHALL fall back to a solid semi-transparent background (`rgba(10, 15, 30, 0.92)`) with no visible degradation of the content hierarchy.
12. THE Glass_Panel CTA SHALL be a focusable element with a visible focus indicator meeting a 3:1 contrast ratio against its background.
13. WHEN the Slide_Up_Animation completes, THE Immersive_Store SHALL move keyboard focus to the first focusable element inside the Glass_Panel, consistent with the existing focus management pattern.
