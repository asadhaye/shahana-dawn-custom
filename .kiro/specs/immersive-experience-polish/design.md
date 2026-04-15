# Design Document: Immersive Experience Polish

## Overview

Six targeted polish improvements to the Shahana Collection immersive 3D store at `/pages/immersive`. The goal is to elevate the experience from functional to emotionally resonant — replacing abrupt transitions with calm motion, adding micro-animations to wishlist interactions, reframing CTAs with trust-building copy, unifying the microcopy voice, personalising the preference banner, and surfacing room suggestions based on browsing behaviour.

All six features share the same constraints:
- Vanilla JS, no build step — changes land in `assets/immersive-store.js` and Liquid files
- `reduceMotion` variable already cached at page load; all animations must branch on it
- All strings via `| t` filter; no hard-coded English in Liquid or JS
- BEM namespace `.immersive-*`
- `localStorage` wrapped in `try/catch` for private browsing

---

## Architecture

The six features map cleanly onto the existing file boundaries:

```
assets/immersive-store.js
  ├── Feature 1: goToRoom() — UI layer fade orchestration
  ├── Feature 2: addToWishlist(), renderWishlistPanel() — animations + room grouping
  ├── Feature 3: showWelcomeToast() — new function, called from initImmersiveScene()
  ├── Feature 4: string key updates (JS data-* reads)
  ├── Feature 5: preference banner dismiss animation (inline script in theme.liquid)
  └── Feature 6: recordBrowsingSignal(), getRelevantRooms(), renderHotspots() extension

sections/immersive-canvas.liquid
  ├── Feature 3: welcome toast shell HTML
  ├── Feature 4: updated data-* attributes and close button labels
  └── Feature 6: personalization indicator CSS

snippets/immersive-bridge-btn.liquid
  └── Feature 3: bridge_subtext param + subtext span

layout/theme.liquid
  └── Feature 5: animated dismiss logic in inline script

locales/en.default.json
  └── Features 3, 4, 5, 6: new and updated string keys
```

No new files are required. No new Liquid sections. No new JS assets.

---

## Components and Interfaces

### Feature 1 — Smooth Room Transitions

**Current state:** `goToRoom()` sets `uiLayer.style.opacity = '0'` synchronously before loading textures, then restores it to `'1'` after the WebGL crossfade completes. There is no coordination between the CSS fade and the WebGL animation — the UI disappears instantly and reappears instantly.

**Target state:** A three-phase sequence:

```
Phase 1 (0–250ms):   CSS fade-out of #ui-layer (opacity 1→0, ease-in-out)
Phase 2 (250–1050ms): WebGL crossfade (uTransitionProgress 0→1, existing smoothstep)
Phase 3 (1050–1300ms): CSS fade-in of #ui-layer (opacity 0→1, ease-in-out)
```

**Implementation approach:**

```javascript
function goToRoom(roomKey, initial) {
  if (transitioning && !initial) return;
  // ... existing guards ...

  var uiLayer = document.getElementById(uiLayerId);
  if (!uiLayer) return;

  if (!initial) {
    transitioning = true; // suppress hotspot clicks immediately
    if (reduceMotion) {
      uiLayer.style.opacity = '0';
      _startWebGLTransition(roomKey, uiLayer);
    } else {
      uiLayer.style.transition = 'opacity 0.25s ease-in-out';
      uiLayer.style.opacity = '0';
      setTimeout(function () {
        _startWebGLTransition(roomKey, uiLayer);
      }, 250);
    }
  } else {
    _startWebGLTransition(roomKey, uiLayer);
  }
}

function _startWebGLTransition(roomKey, uiLayer) {
  loadRoomTextures(roomData, function (baseTexture, depthTexture) {
    // ... existing WebGL crossfade step() loop ...
    // On completion:
    transitioning = false;
    renderHotspots(roomKey);
    updateRoomBadge(roomKey);
    if (reduceMotion) {
      uiLayer.style.opacity = '1';
    } else {
      uiLayer.style.transition = 'opacity 0.25s ease-in-out';
      uiLayer.style.opacity = '1';
    }
  });
}
```

The `transitioning = true` flag is set at the start of Phase 1 (not after the fade-out), so hotspot clicks are suppressed for the entire sequence. The existing `if (transitioning && !initial) return;` guard at the top of `goToRoom()` handles re-entry.

**Reduced motion:** When `reduceMotion` is true, both CSS transitions are skipped. The WebGL crossfade still runs at its existing duration (800ms with smoothstep) because it is a texture blend, not a CSS animation. The requirement says "skip CSS fade animations" — the WebGL crossfade is not a CSS animation.

### Feature 2 — Emotional Wishlist Polish

**Heart-pulse animation:**

A CSS keyframe animation `.immersive-wishlist-btn--pulse` is added to `immersive-canvas.liquid`'s `{% stylesheet %}` block. When `addToWishlist()` is called, the class is added to `[data-wishlist-open]` and removed after 600ms via `setTimeout`.

```javascript
function _triggerHeartPulse() {
  if (reduceMotion) return;
  var btn = document.querySelector('[data-wishlist-open]');
  if (!btn) return;
  btn.classList.remove('immersive-wishlist-btn--pulse'); // reset if already animating
  void btn.offsetWidth; // force reflow to restart animation
  btn.classList.add('immersive-wishlist-btn--pulse');
  setTimeout(function () { btn.classList.remove('immersive-wishlist-btn--pulse'); }, 600);
}
```

**Fly-to-wishlist token:**

When `addToWishlist()` is called from a product card context, a small circular token is created, positioned at the product card's bounding rect, and animated via CSS `transform` to the wishlist button's position. The token is appended to `document.body` (to escape any `overflow:hidden` containers), animated, then removed.

```javascript
function _flyToWishlist(sourceEl) {
  if (reduceMotion) return;
  var wishlistBtn = document.querySelector('[data-wishlist-open]');
  if (!wishlistBtn || !sourceEl) return;
  var from = sourceEl.getBoundingClientRect();
  var to = wishlistBtn.getBoundingClientRect();
  var token = document.createElement('div');
  token.className = 'immersive-fly-token';
  token.setAttribute('aria-hidden', 'true');
  token.style.cssText = 'position:fixed;left:' + (from.left + from.width/2) + 'px;top:' + (from.top + from.height/2) + 'px;';
  document.body.appendChild(token);
  requestAnimationFrame(function () {
    token.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease';
    token.style.transform = 'translate(' + (to.left - from.left) + 'px, ' + (to.top - from.top) + 'px) scale(0.3)';
    token.style.opacity = '0';
    setTimeout(function () { token.remove(); }, 550);
  });
}
```

**Room grouping in renderWishlistPanel():**

Each wishlist item gains a `discoveryRoom` field. `addToWishlist()` is updated to accept and store this:

```javascript
// _wishlistItems becomes an array of objects: { handle, discoveryRoom }
function addToWishlist(handle, source) {
  if (!handle) return;
  var alreadySaved = _wishlistItems.some(function(i) { return i.handle === handle; });
  if (alreadySaved) return;
  _wishlistItems.push({ handle: handle, discoveryRoom: immersiveState.currentRoom || null });
  _persistWishlist();
  // ...
}
```

`renderWishlistPanel()` groups items by `discoveryRoom` and renders a room label heading above each group. The empty state renders `data-msg-empty-encouragement` (a new data attribute on the panel element) instead of the plain `data-msg-empty`.

**localStorage persistence:** `_persistWishlist()` serializes the full object array (including `discoveryRoom`) to localStorage. `_loadWishlist()` deserializes it, handling both the old format (array of strings) and the new format (array of objects) for backwards compatibility.

### Feature 3 — Bridge CTAs with Trust

**Bridge subtext:** `snippets/immersive-bridge-btn.liquid` gains an optional `bridge_subtext` parameter. When provided, a `<span class="immersive-bridge-btn__subtext">` is rendered below the label. The subtext is sourced from `sections.immersive_journey_bridges.bridge_subtext` at call sites.

**Welcome toast:** A new `showWelcomeToast()` function is called from `initImmersiveScene()` after `hideLoader()`. It checks for `ONBOARDING_KEY` in localStorage — if absent, it creates and appends a toast element to the immersive canvas wrapper, then auto-dismisses after 5000ms.

The toast shell is rendered in JS (not Liquid) because it is purely session-driven and requires no server-side data. The toast text is read from a `data-msg-welcome-toast` attribute on the `#immersive-store-*` section element (set via `| t` in Liquid).

```javascript
function showWelcomeToast() {
  try { if (localStorage.getItem(ONBOARDING_KEY)) return; } catch(e) {}
  var section = document.querySelector('[data-section-id]');
  var msg = section && section.getAttribute('data-msg-welcome-toast');
  if (!msg) return;
  var toast = document.createElement('div');
  toast.className = 'immersive-welcome-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = '<span class="immersive-welcome-toast__text">' + msg + '</span>' +
    '<button type="button" class="immersive-welcome-toast__close" aria-label="' + (closeLabel || 'Close') + '">×</button>';
  if (!reduceMotion) toast.classList.add('immersive-welcome-toast--animate-in');
  document.querySelector('.immersive-store__canvas-wrapper').appendChild(toast);
  var timer = setTimeout(function () { _dismissToast(toast); }, 5000);
  toast.querySelector('.immersive-welcome-toast__close').addEventListener('click', function () {
    clearTimeout(timer);
    _dismissToast(toast);
  });
}

function _dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  if (reduceMotion) { toast.remove(); return; }
  toast.classList.add('immersive-welcome-toast--animate-out');
  setTimeout(function () { toast.remove(); }, 300);
}
```

The toast does not set `ONBOARDING_KEY` — that key is already set by the existing onboarding overlay logic. The toast simply reads it to decide whether to show.

### Feature 4 — Unified Microcopy Tone

Three new locale keys are added to `sections.immersive_store`:
- `add_to_edit`: "Add to my edit" — replaces add-to-cart labels in immersive product panels
- `action_done`: "Done" — replaces "Close" on panel close buttons
- `back_to_room`: "← Back to {{ room_name }}" — used for back-navigation labels

In `sections/immersive-canvas.liquid`, the glass panel close button is updated to use `action_done`. In `sections/glass-product.liquid` and `snippets/immersive-product-card.liquid`, add-to-cart labels within immersive surfaces are updated to use `add_to_edit`.

The `back_to_room` key uses Liquid's `| t: room_name: room_label` interpolation at render time. In JS contexts where back-navigation labels are built dynamically, the translated string with `{{ room_name }}` placeholder is passed via a `data-msg-back-to-room` attribute and the placeholder is replaced with `String.replace()`.

### Feature 5 — Preference Banner as Personalisation

The locale values for `preference_banner_text` and `preference_banner_cta` already match the requirements ("Welcome back — your 3D store is ready." and "Return to 3D Store"). No locale changes needed for these two keys.

The dismiss animation is added to the inline `<script>` block in `layout/theme.liquid`. The existing dismiss handler (which calls `banner.remove()` directly) is replaced with an animated version:

```javascript
dismissBtn.addEventListener('click', function () {
  var next = banner.nextElementSibling;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    banner.remove();
    if (next && typeof next.focus === 'function') next.focus();
    return;
  }
  banner.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  banner.style.opacity = '0';
  banner.style.transform = banner.style.transform + ' translateY(8px)';
  setTimeout(function () {
    banner.remove();
    if (next && typeof next.focus === 'function') next.focus();
  }, 260);
});
```

The CSS for the animated dismiss is already in the inline `<style>` block in `theme.liquid` — no new stylesheet needed. The `transform` slide-down is a small 8px shift to give the fade a sense of direction without being distracting.

Focus restoration to `next` (the next focusable sibling) is already implemented in the existing code. The animated version preserves this behaviour.

### Feature 6 — Personalized Room Suggestions

**Signal recording:**

A new `recordBrowsingSignal(roomKey)` function wraps all localStorage access in `try/catch`. It reads the current array, appends the room key, caps at 50 entries (slicing from the end to keep the most recent), and writes back.

```javascript
var BROWSING_SIGNALS_KEY = 'immersive_browsing_signals';

function recordBrowsingSignal(roomKey) {
  if (!roomKey) return;
  try {
    var raw = localStorage.getItem(BROWSING_SIGNALS_KEY);
    var signals = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signals)) signals = [];
    signals.push(roomKey);
    if (signals.length > 50) signals = signals.slice(signals.length - 50);
    localStorage.setItem(BROWSING_SIGNALS_KEY, JSON.stringify(signals));
  } catch(e) {}
}
```

`recordBrowsingSignal()` is called from:
1. `openCollectionPanel()` — passes `immersiveState.currentRoom`
2. `openProductPanel()` — passes `immersiveState.currentRoom`
3. `addToWishlist()` — passes `immersiveState.currentRoom`

**Relevance calculation:**

```javascript
function getRelevantRooms() {
  try {
    var raw = localStorage.getItem(BROWSING_SIGNALS_KEY);
    var signals = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signals)) return {};
    var counts = {};
    signals.forEach(function(k) { counts[k] = (counts[k] || 0) + 1; });
    var relevant = {};
    Object.keys(counts).forEach(function(k) { if (counts[k] >= 2) relevant[k] = true; });
    return relevant;
  } catch(e) { return {}; }
}
```

**Personalization indicator in renderHotspots():**

After the existing label span is appended, `renderHotspots()` checks if the hotspot targets a relevant room and appends the indicator:

```javascript
var relevantRooms = getRelevantRooms();
// ... inside forEach ...
if (hotspot.targetRoom && relevantRooms[hotspot.targetRoom]) {
  var indicator = document.createElement('span');
  indicator.className = 'immersive-hotspot__personalization';
  indicator.setAttribute('aria-label', basedOnSavesLabel);
  indicator.setAttribute('aria-hidden', 'false');
  indicator.textContent = basedOnSavesLabel;
  button.appendChild(indicator);
}
```

The `basedOnSavesLabel` is read from a `data-msg-based-on-saves` attribute on the `#ui-layer` element (set via `| t` in `immersive-canvas.liquid`).

---

## Data Models

### Wishlist item (updated)

```javascript
// Old format (backwards-compatible read):
// _wishlistItems = ['handle1', 'handle2']

// New format:
// _wishlistItems = [
//   { handle: 'silk-saree', discoveryRoom: 'designer_houses' },
//   { handle: 'bridal-set', discoveryRoom: 'occasions' }
// ]
```

localStorage key: `immersive_wishlist` (existing key, format updated)

Backwards compatibility: on load, if an item is a string (old format), it is migrated to `{ handle: item, discoveryRoom: null }`.

### Browsing signals

```javascript
// localStorage key: 'immersive_browsing_signals'
// Value: JSON array of room key strings
// Example: ["lounge", "designer_houses", "designer_houses", "occasions"]
// Max length: 50 entries (oldest discarded)
// No PII: only room keys from STORE_ROOMS
```

### New locale keys

```json
{
  "sections": {
    "immersive_store": {
      "add_to_edit": "Add to my edit",
      "action_done": "Done",
      "back_to_room": "← Back to {{ room_name }}",
      "welcome_toast": "You're in the 3D store — tap any hotspot to explore. Switch back anytime.",
      "based_on_saves": "Based on your saves",
      "wishlist": {
        "empty_encouragement": "Start exploring the rooms to discover pieces you love."
      }
    },
    "immersive_journey_bridges": {
      "bridge_label_explore_3d": "Explore in 3D",
      "bridge_subtext": "See curated rooms and collections in an interactive space."
    }
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hotspot clicks are suppressed during transitions

*For any* hotspot click handler invocation while `transitioning === true`, the navigation or panel-open action (goToRoom, openCollectionPanel, openProductPanel) should not be triggered.

**Validates: Requirements 1.4**

### Property 2: Wishlist badge always updates regardless of motion preference

*For any* product handle and any value of `reduceMotion`, calling `addToWishlist()` should always result in the wishlist badge count being incremented by 1.

**Validates: Requirements 2.3**

### Property 3: Discovery room is recorded at save time

*For any* product handle and any value of `immersiveState.currentRoom`, after calling `addToWishlist()`, the stored wishlist item for that handle should have a `discoveryRoom` equal to `immersiveState.currentRoom` at the time of the call.

**Validates: Requirements 2.5**

### Property 4: Wishlist items are grouped by discovery room in rendered output

*For any* non-empty array of wishlist items with associated discovery rooms, `renderWishlistPanel()` should produce HTML that contains a room-label heading for each distinct discovery room, with all items for that room appearing after their heading.

**Validates: Requirements 2.4**

### Property 5: Discovery room survives localStorage round-trip

*For any* product handle and room key, after `addToWishlist()` and `_persistWishlist()`, calling `_loadWishlist()` should return an item for that handle with the same `discoveryRoom` value.

**Validates: Requirements 2.8**

### Property 6: Welcome toast shown iff ONBOARDING_KEY is absent

*For any* localStorage state, `showWelcomeToast()` should show the toast if and only if `ONBOARDING_KEY` is not present in localStorage.

**Validates: Requirements 3.3, 3.8**

### Property 7: back_to_room interpolation contains the room name

*For any* room name string, the result of interpolating `sections.immersive_store.back_to_room` with that room name should contain the room name as a substring of the output.

**Validates: Requirements 4.3**

### Property 8: Browsing signals record the current room on panel open

*For any* room key value of `immersiveState.currentRoom`, after calling `openCollectionPanel()` or `openProductPanel()`, `immersive_browsing_signals` in localStorage should contain that room key.

**Validates: Requirements 6.1, 6.2**

### Property 9: Browsing signals are pure room key strings

*For any* sequence of browsing events (panel opens, wishlist adds), the value stored at `immersive_browsing_signals` should be a valid JSON array where every element is a string matching a key in `STORE_ROOMS`, with no product handles, collection handles, or other data.

**Validates: Requirements 6.3, 6.10**

### Property 10: Relevance threshold is exactly 2 signals

*For any* signals array, `getRelevantRooms()` should return a room key as relevant if and only if it appears 2 or more times in the array.

**Validates: Requirements 6.4**

### Property 11: Personalization indicator appears iff room is relevant

*For any* hotspot targeting a room, after `renderHotspots()`, the rendered hotspot DOM should contain a `.immersive-hotspot__personalization` element if and only if the target room has 2 or more signals in `immersive_browsing_signals`.

**Validates: Requirements 6.5**

### Property 12: Browsing signals array never exceeds 50 entries

*For any* number of `recordBrowsingSignal()` calls greater than 50, the length of the stored `immersive_browsing_signals` array should be exactly 50, containing the most recently recorded entries.

**Validates: Requirements 6.9**

### Property 13: localStorage failures are silent

*For any* localStorage operation in `recordBrowsingSignal()`, `getRelevantRooms()`, or `addToWishlist()` that throws an exception, the function should return without throwing and without corrupting any in-memory state.

**Validates: Requirements 6.8**

### Property 14: Focus is restored to next sibling after banner dismiss

*For any* DOM state where the preference banner has a focusable next sibling element, after the dismiss handler completes, `document.activeElement` should be that sibling element.

**Validates: Requirements 5.6**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `localStorage` unavailable (private browsing) | All reads/writes in `try/catch`; functions return gracefully with no-op |
| `localStorage` contains malformed JSON for signals | `JSON.parse` in `try/catch`; falls back to empty array |
| Wishlist items in old string format | Migration on load: `{ handle: item, discoveryRoom: null }` |
| `[data-wishlist-open]` not found when triggering heart-pulse | Guard with `if (!btn) return` |
| Source element not found for fly-to animation | Guard with `if (!sourceEl) return` |
| Welcome toast section element missing `data-msg-welcome-toast` | Guard with `if (!msg) return` |
| `ONBOARDING_KEY` localStorage read throws | `try/catch` around the read; treat as "key absent" (show toast) |
| `renderHotspots()` called with no `data-msg-based-on-saves` attribute | Fall back to empty string; indicator renders without text |
| Preference banner `nextElementSibling` is null | Guard with `if (next && typeof next.focus === 'function')` (already present) |

---

## Testing Strategy

This feature set is primarily UI behaviour and localStorage data management. The testing approach uses:

- **Property-based tests** (fast-check) for the pure logic functions: signal recording, relevance calculation, wishlist persistence, and string interpolation
- **Unit tests** (Jest + jsdom) for DOM manipulation: hotspot suppression, badge updates, toast lifecycle, focus restoration
- **Smoke checks** for locale key existence and CSS property values

### Property-based testing library

`fast-check` (already in the project's test stack).

Each property test runs a minimum of 100 iterations.

### Test file locations

```
tests/
  immersive-polish-transitions.test.js   — Feature 1 (hotspot suppression)
  immersive-polish-wishlist.test.js      — Feature 2 (room grouping, persistence)
  immersive-polish-toast.test.js         — Feature 3 (welcome toast lifecycle)
  immersive-polish-microcopy.test.js     — Feature 4 (back_to_room interpolation)
  immersive-polish-banner.test.js        — Feature 5 (focus restoration)
  immersive-polish-signals.test.js       — Feature 6 (signal recording, relevance, cap)
```

### Property test tags

Each property test is tagged with a comment referencing the design property:

```javascript
// Feature: immersive-experience-polish, Property 1: Hotspot clicks suppressed during transitions
// Feature: immersive-experience-polish, Property 12: Browsing signals array never exceeds 50 entries
```

### Unit test coverage

- Feature 1: `goToRoom()` sets `transitioning = true` before fade-out; `uiLayer.style.opacity` is `'0'` after call; `uiLayer.style.opacity` is `'1'` after WebGL step completes
- Feature 2: `addToWishlist()` adds heart-pulse class; fly-token element is created; empty state renders encouragement copy
- Feature 3: Toast has `role="status"` and `aria-live="polite"`; close button removes toast; toast not shown when `ONBOARDING_KEY` is set
- Feature 4: `back_to_room` placeholder replacement produces correct string
- Feature 5: Dismiss handler removes banner; focus moves to next sibling
- Feature 6: Indicator has `aria-label`; indicator absent when room has < 2 signals

### Reduced motion coverage

Every animation path has a corresponding test with `reduceMotion = true` verifying that no CSS transition strings are applied and DOM changes are immediate.
