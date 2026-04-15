# Design Document: Immersive UX Improvements

## Overview

This document covers the technical design for three targeted UX improvements to the immersive 3D store at `/pages/immersive`:

1. **Room Identity Badge** — a persistent pill showing the current room name and contextual guidance text
2. **Discoverable Hotspot Affordances** — pulsing rings, hover/focus labels, and correct keyboard tab order
3. **Editorial Overlay Hierarchy & Animation** — slide-up entrance, backdrop blur, and consistent content structure

All three features share the same constraints: vanilla JS (no build step), BEM `.immersive-*` namespace, `| t` localisation for all user-facing strings, `prefers-reduced-motion` support, and integration with the existing `sections/immersive-canvas.liquid` + `assets/immersive-store.js` architecture.

---

## Architecture

### Affected files

| File | Changes |
|---|---|
| `sections/immersive-canvas.liquid` | Add Room_Badge HTML shell; update editorial overlay shell with entering modifier support |
| `assets/immersive-store.js` | Update `goToRoom()` to update badge; update `renderHotspots()` for rings, labels, tab order; update `openPanel()` and `enterEditorialMode()` for slide-up animation |
| `assets/immersive-theme.css` | Add badge styles, hotspot ring/label styles, slide-up animation keyframes |
| `locales/en.default.json` | Add room badge name keys and guidance text keys |

### No new files required

All changes are additive modifications to existing files. No new sections, snippets, or JS modules are introduced.

### Interaction with existing systems

```
goToRoom(roomKey)
  └─ [existing] loads textures, calls renderHotspots()
  └─ [NEW] calls updateRoomBadge(roomKey)

renderHotspots(roomKey)
  └─ [existing] creates <button> elements in #ui-layer
  └─ [NEW] sorts hotspots by (y, x) before rendering
  └─ [NEW] adds tabindex="0", .immersive-hotspot__ring, .immersive-hotspot__label to each button
  └─ [NEW] skips label element if hotspot.label is blank/undefined

openPanel(panel, triggerEl)
  └─ [existing] removes hidden, sets data-open, calls openDialogFocus()
  └─ [NEW] adds .immersive-store__panel--entering, removes it after 350ms, then calls openDialogFocus()

enterEditorialMode(roomKey, triggerEl)
  └─ [existing] activates overlay, fetches content
  └─ [NEW] adds .immersive-editorial-overlay--entering, removes it after 350ms
```

---

## Components and Interfaces

### Feature 1: Room Identity Badge

#### HTML shell (immersive-canvas.liquid)

Added inside `.immersive-store__canvas-wrapper`, after the `#ui-layer` div:

```html
<div
  id="immersive-room-badge"
  class="immersive-room-badge"
  aria-live="polite"
  aria-atomic="true"
>
  <span class="immersive-room-badge__name" data-room-badge-name></span>
  <span class="immersive-room-badge__guidance" data-room-badge-guidance></span>
</div>
```

- `aria-live="polite"` + `aria-atomic="true"` — screen readers announce room changes without interrupting
- `data-room-badge-name` / `data-room-badge-guidance` — JS targets these attributes, not class selectors
- The badge is always in the DOM; JS updates its text content on room transitions

#### JS: `updateRoomBadge(roomKey)`

New helper function called at the end of `goToRoom()` (both the initial load path and the transition completion path):

```javascript
function updateRoomBadge(roomKey) {
  var badge = document.getElementById('immersive-room-badge');
  if (!badge) {
    console.warn('[Immersive] Room badge element not found for room:', roomKey);
    return;
  }
  var nameEl = badge.querySelector('[data-room-badge-name]');
  var guidanceEl = badge.querySelector('[data-room-badge-guidance]');

  // Room name and guidance strings are injected as data attributes on the badge
  // element by Liquid (avoids a JS-side translation lookup)
  var name = badge.getAttribute('data-room-name-' + roomKey) || roomKey;
  var guidance = badge.getAttribute('data-room-guidance-' + roomKey) || '';

  if (nameEl) nameEl.textContent = name;
  if (guidanceEl) guidanceEl.textContent = guidance;
}
```

Room name and guidance strings are passed as `data-room-name-{key}` and `data-room-guidance-{key}` attributes on the badge element, rendered by Liquid using `| t`. This avoids any JS-side i18n lookup and keeps all translations in `en.default.json`.

#### Liquid: data attributes on badge element

```liquid
<div
  id="immersive-room-badge"
  class="immersive-room-badge"
  aria-live="polite"
  aria-atomic="true"
  data-room-name-storefront="{{ 'sections.immersive_store.room_badge.name_storefront' | t | escape }}"
  data-room-guidance-storefront="{{ 'sections.immersive_store.room_badge.guidance_storefront' | t | escape }}"
  data-room-name-lounge="{{ 'sections.immersive_store.room_badge.name_lounge' | t | escape }}"
  data-room-guidance-lounge="{{ 'sections.immersive_store.room_badge.guidance_lounge' | t | escape }}"
  data-room-name-designer_houses="{{ 'sections.immersive_store.room_badge.name_designer_houses' | t | escape }}"
  data-room-guidance-designer_houses="{{ 'sections.immersive_store.room_badge.guidance_designer_houses' | t | escape }}"
  data-room-name-occasions="{{ 'sections.immersive_store.room_badge.name_occasions' | t | escape }}"
  data-room-guidance-occasions="{{ 'sections.immersive_store.room_badge.guidance_occasions' | t | escape }}"
  data-room-name-featured_collections="{{ 'sections.immersive_store.room_badge.name_featured_collections' | t | escape }}"
  data-room-guidance-featured_collections="{{ 'sections.immersive_store.room_badge.guidance_featured_collections' | t | escape }}"
>
```

#### CSS positioning

The badge is positioned in the bottom-left of the canvas wrapper, above the hotspot layer but below the glass panel. It uses `pointer-events: none` so it never intercepts hotspot clicks.

```css
.immersive-room-badge {
  position: absolute;
  bottom: 2rem;
  left: 1.5rem;
  z-index: 20; /* above hotspots (z-index: 10), below glass panel (z-index: 100) */
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: calc(100% - 3rem);
}
```

---

### Feature 2: Discoverable Hotspot Affordances

#### Updated `renderHotspots()` structure

Each hotspot button gains three new child elements:

```
<button class="immersive-hotspot" tabindex="0" aria-label="{label}">
  <span class="visually-hidden">{label}</span>   ← existing SR text
  <span class="immersive-hotspot__ring" aria-hidden="true"></span>   ← NEW: pulse ring
  <span class="immersive-hotspot__label" aria-hidden="true">{label}</span>   ← NEW: hover label (omitted if label blank)
</button>
```

The `aria-hidden="true"` on ring and label prevents double-announcement (the `visually-hidden` span already provides the accessible name via `aria-label`).

#### Sorting hotspots before render

Before the `forEach` loop in `renderHotspots()`, hotspots are sorted by reading order:

```javascript
var sortedHotspots = room.hotspots.slice().sort(function (a, b) {
  // Primary sort: top-to-bottom (y ascending)
  // Secondary sort: left-to-right (x ascending)
  var rowThreshold = 10; // hotspots within 10% y are considered the same row
  if (Math.abs(a.y - b.y) > rowThreshold) return a.y - b.y;
  return a.x - b.x;
});
```

The original `room.hotspots` array is not mutated — a copy is sorted.

#### `tabindex="0"` on all buttons

Added to every rendered hotspot button. The existing `<button>` element is already focusable by default, but `tabindex="0"` makes the intent explicit and ensures consistent behavior across browsers.

#### Blank label guard

```javascript
var labelText = hotspot.label;
if (labelText && labelText.trim()) {
  var labelEl = document.createElement('span');
  labelEl.className = 'immersive-hotspot__label';
  labelEl.setAttribute('aria-hidden', 'true');
  labelEl.textContent = labelText;
  button.appendChild(labelEl);
}
```

#### CSS: pulse ring

```css
.immersive-hotspot__ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(212, 175, 55, 0.7);
  animation: immersive-hotspot-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  pointer-events: none;
}

@keyframes immersive-hotspot-pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.35); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .immersive-hotspot__ring {
    animation: none;
    opacity: 0.6;
    transform: scale(1);
  }
}
```

#### CSS: hover/focus label

The label is hidden by default and revealed on `:hover` and `:focus-visible` of the parent button. CSS handles visibility — no JS event listeners needed for show/hide:

```css
.immersive-hotspot__label {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: rgba(10, 15, 30, 0.85);
  backdrop-filter: blur(8px);
  color: #d4af37;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  /* Viewport overflow prevention */
  max-width: min(200px, calc(100vw - 2rem));
  overflow: hidden;
  text-overflow: ellipsis;
}

.immersive-hotspot:hover .immersive-hotspot__label,
.immersive-hotspot:focus-visible .immersive-hotspot__label {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .immersive-hotspot__label {
    transition: none;
  }
}
```

---

### Feature 3: Editorial Overlay Hierarchy & Animation

#### Slide-up animation CSS

Added to `immersive-theme.css`:

```css
@keyframes immersive-slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glass panel entering state */
.immersive-store__panel--entering {
  animation: immersive-slide-up 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Editorial overlay entering state */
.immersive-editorial-overlay--entering {
  animation: immersive-slide-up 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .immersive-store__panel--entering,
  .immersive-editorial-overlay--entering {
    animation: none;
  }
}
```

#### Backdrop blur transition

The existing `#glass-panel` and `#immersive-editorial-overlay` already have `backdrop-filter` in their CSS. The entering modifier adds the transition:

```css
#glass-panel,
#immersive-editorial-overlay {
  /* existing: backdrop-filter: blur(16px) */
  /* Add transition for entering state */
}

.immersive-store__panel--entering,
.immersive-editorial-overlay--entering {
  backdrop-filter: blur(0px);
  transition: backdrop-filter 350ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* After entering class is removed, the panel retains its final blur */
#glass-panel:not(.immersive-store__panel--entering),
#immersive-editorial-overlay:not(.immersive-editorial-overlay--entering) {
  backdrop-filter: blur(16px);
}

/* Backdrop-filter fallback for unsupported browsers */
@supports not (backdrop-filter: blur(1px)) {
  #glass-panel,
  #immersive-editorial-overlay {
    background: rgba(10, 15, 30, 0.92) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .immersive-store__panel--entering,
  .immersive-editorial-overlay--entering {
    backdrop-filter: blur(16px);
    transition: none;
  }
}
```

#### Updated `openPanel()` in immersive-store.js

```javascript
function openPanel(panel, triggerEl) {
  if (!panel) return null;

  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');
  panel.setAttribute('data-open', 'true');

  // Apply entering modifier for slide-up animation
  var enteringClass = panel.id === 'glass-panel'
    ? 'immersive-store__panel--entering'
    : 'immersive-editorial-overlay--entering';

  if (!reduceMotion) {
    panel.classList.add(enteringClass);
    setTimeout(function () {
      panel.classList.remove(enteringClass);
      // Move focus after animation completes
      openDialogFocus(panel, triggerEl);
    }, 350);
  } else {
    // Reduced motion: skip animation, focus immediately
    openDialogFocus(panel, triggerEl);
  }

  return triggerEl;
}
```

#### Updated `enterEditorialMode()` for overlay animation

In `performEditorialUIActivation()`, after `overlay.classList.add('is-active')`:

```javascript
if (!reduceMotion) {
  overlay.classList.add('immersive-editorial-overlay--entering');
  setTimeout(function () {
    overlay.classList.remove('immersive-editorial-overlay--entering');
    // Focus back button after animation
    var backBtn = document.getElementById('immersive-editorial-back');
    if (backBtn) backBtn.focus();
  }, 350);
} else {
  var backBtn = document.getElementById('immersive-editorial-back');
  if (backBtn) requestAnimationFrame(function () { backBtn.focus(); });
}
```

#### Room label in glass panel

The glass panel header already has `#glass-panel-title`. A room label element is added above it:

```html
<!-- In immersive-canvas.liquid, inside #glass-panel header -->
<span
  class="immersive-store__panel-room-label"
  data-panel-room-label
  aria-hidden="true"
></span>
<h2 id="glass-panel-title" class="immersive-store__panel-title">
  {{ 'sections.immersive_store.panel_title' | t }}
</h2>
```

JS populates `data-panel-room-label` when opening a panel, using the same translation keys as the Room_Badge:

```javascript
function setPanelRoomLabel(panel) {
  var labelEl = panel.querySelector('[data-panel-room-label]');
  if (!labelEl) return;
  var badge = document.getElementById('immersive-room-badge');
  var roomName = badge
    ? badge.getAttribute('data-room-name-' + immersiveState.currentRoom) || ''
    : '';
  labelEl.textContent = roomName;
}
```

`setPanelRoomLabel()` is called inside the `renderCallback` of `openCollectionPanel()` and `openProductPanel()`.

---

## Data Models

### New translation keys (en.default.json)

Added under `sections.immersive_store.room_badge`:

```json
"room_badge": {
  "name_storefront": "Storefront",
  "guidance_storefront": "Enter the store to begin exploring",
  "name_lounge": "Lounge",
  "guidance_lounge": "Explore hotspots to discover curated looks",
  "name_designer_houses": "Designer Houses",
  "guidance_designer_houses": "Select a designer to explore their collection",
  "name_occasions": "Occasions",
  "guidance_occasions": "Choose an occasion to find the perfect look",
  "name_featured_collections": "Featured Collections",
  "guidance_featured_collections": "Discover our latest curated edits"
}
```

### Hotspot data shape (unchanged)

The existing hotspot config shape in `STORE_ROOMS` is unchanged. The new rendering logic reads the existing `label`, `x`, `y`, `mobileX`, `mobileY` fields.

### State (unchanged)

`immersiveState.currentRoom` is already maintained by `goToRoom()`. `updateRoomBadge()` reads it indirectly via the `roomKey` parameter passed to `goToRoom()`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Room badge updates on every room transition

*For any* valid `roomKey` in `STORE_ROOMS`, after `updateRoomBadge(roomKey)` is called, the badge name element's text content should equal the value of `data-room-name-{roomKey}` on the badge element.

**Validates: Requirements 1.2, 1.3, 1.5**

### Property 2: All hotspot buttons have required accessibility attributes

*For any* room configuration with N hotspots, all N rendered hotspot buttons should have `tabindex="0"` and an `aria-label` attribute whose value equals the hotspot's `label` field.

**Validates: Requirements 2.8, 2.10**

### Property 3: Hotspot DOM order matches reading order

*For any* array of hotspot configurations, the order of rendered hotspot buttons in the DOM should match the array sorted by `y` ascending (primary) then `x` ascending (secondary), using a row-grouping threshold of 10 percentage points.

**Validates: Requirements 2.9**

### Property 4: Hotspot label element reflects config label value

*For any* hotspot configuration with a non-empty `label` string, the rendered button should contain a `.immersive-hotspot__label` element whose text content equals the hotspot's `label` value.

**Validates: Requirements 2.3, 2.4, 2.5**

### Property 5: Blank labels produce no label element

*For any* hotspot configuration where `label` is blank, `undefined`, or whitespace-only, the rendered button should contain no `.immersive-hotspot__label` element.

**Validates: Requirements 2.12**

### Property 6: All hotspot buttons contain a ring element

*For any* room configuration with N hotspots, all N rendered hotspot buttons should contain exactly one `.immersive-hotspot__ring` element.

**Validates: Requirements 2.1, 2.11**

### Property 7: Panel room label matches Room_Badge room name

*For any* `roomKey`, the text content set on `[data-panel-room-label]` by `setPanelRoomLabel()` should equal the value of `data-room-name-{roomKey}` on the Room_Badge element.

**Validates: Requirements 3.8**

---

## Error Handling

### Room badge missing from DOM

`updateRoomBadge()` checks for the badge element before accessing it. If absent, it logs `console.warn('[Immersive] Room badge element not found for room:', roomKey)` and returns without throwing. `goToRoom()` continues normally. This satisfies Requirement 1.10.

### Hotspot with no target

The existing `console.warn('[Immersive] Hotspot has no target:', ...)` in `renderHotspots()` is preserved. The new ring and label elements are still rendered — the button is visible but clicking it produces no navigation.

### Animation class cleanup

If the browser fires no `animationend` event (e.g. animation is cancelled), the `setTimeout(350ms)` fallback ensures the entering class is always removed and focus is always moved. This prevents the panel from being stuck in an animated state.

### `backdrop-filter` not supported

The `@supports not (backdrop-filter: blur(1px))` block applies a solid fallback background (`rgba(10, 15, 30, 0.92)`) so panel content remains readable on browsers without backdrop-filter support (Firefox < 103 without the flag, older Safari). Requirement 3.11.

### Reduced motion

All three features check `reduceMotion` (the cached `window.matchMedia('(prefers-reduced-motion: reduce)').matches` value set at page load in `immersive-store.js`):
- Badge: no animation involved; always updates immediately
- Hotspot ring: `animation: none` via CSS media query; static ring remains visible
- Hotspot label: `transition: none` via CSS media query; label appears/disappears instantly
- Panel/overlay: entering class not applied; `openDialogFocus()` called immediately

---

## Testing Strategy

### Unit tests (Jest + jsdom)

Unit tests cover the pure JS logic that can be exercised without a real browser or WebGL context:

- `updateRoomBadge(roomKey)` — verify text content updates for each room key; verify graceful no-op when badge element is absent
- `renderHotspots(roomKey)` — verify ring element present on each button; verify label element present/absent based on label value; verify `tabindex="0"` and `aria-label` on each button; verify DOM order matches sorted hotspot order
- `setPanelRoomLabel(panel)` — verify label text matches badge data attribute for current room

### Property-based tests (fast-check, minimum 100 iterations each)

Each property test is tagged with a comment referencing the design property it validates.

**Property 1 test** — `Feature: immersive-ux-improvements, Property 1: Room badge updates on every room transition`
Generate random room keys from `Object.keys(STORE_ROOMS)`. For each, set the badge's `data-room-name-{key}` attribute to a random string, call `updateRoomBadge(key)`, and assert the name element's text equals that string.

**Property 2 test** — `Feature: immersive-ux-improvements, Property 2: All hotspot buttons have required accessibility attributes`
Generate random arrays of hotspot configs (varying label, x, y values). Call `renderHotspots()` with a mock room. Assert every rendered button has `tabindex="0"` and `aria-label` equal to the hotspot's label.

**Property 3 test** — `Feature: immersive-ux-improvements, Property 3: Hotspot DOM order matches reading order`
Generate random arrays of hotspot configs with varied x/y positions. Call `renderHotspots()`. Assert the DOM order of rendered buttons matches the expected sorted order (y ascending, then x ascending within a 10-point row threshold).

**Property 4 test** — `Feature: immersive-ux-improvements, Property 4: Hotspot label element reflects config label value`
Generate random hotspot configs with non-empty label strings. Assert the rendered button contains a `.immersive-hotspot__label` element with matching text content.

**Property 5 test** — `Feature: immersive-ux-improvements, Property 5: Blank labels produce no label element`
Generate hotspot configs with blank, undefined, or whitespace-only labels. Assert no `.immersive-hotspot__label` element is rendered.

**Property 6 test** — `Feature: immersive-ux-improvements, Property 6: All hotspot buttons contain a ring element`
Generate random room configs with 1–10 hotspots. Assert every rendered button contains exactly one `.immersive-hotspot__ring` element.

**Property 7 test** — `Feature: immersive-ux-improvements, Property 7: Panel room label matches Room_Badge room name`
Generate random room keys and random room name strings. Set badge data attributes, call `setPanelRoomLabel()`, assert the panel label text equals the badge data attribute value.

### Manual QA checklist

- [ ] Badge visible in all 5 rooms; updates within 100ms of room transition
- [ ] Badge does not overlap header at 375px, 768px, 1440px viewports
- [ ] Badge remains visible when glass panel is open
- [ ] Hotspot rings pulse on all rooms; static ring visible with `prefers-reduced-motion: reduce`
- [ ] Hover labels appear on pointer enter; disappear on pointer leave
- [ ] Focus labels appear on keyboard focus; disappear on blur
- [ ] Tab order follows left-to-right, top-to-bottom reading sequence in each room
- [ ] Hotspot with blank label shows no tooltip
- [ ] Glass panel slides up on open (350ms); no animation with `prefers-reduced-motion: reduce`
- [ ] Editorial overlay slides up on open (350ms); no animation with `prefers-reduced-motion: reduce`
- [ ] Panel room label shows correct room name
- [ ] Focus moves to first focusable element after animation completes
- [ ] Backdrop-filter fallback visible in Firefox without the flag
