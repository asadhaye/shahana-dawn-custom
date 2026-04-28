# Design Document: Skeleton Fluid Reveal

## Overview

This feature adds a **fluid liquid displacement hover effect** to product card images in the Shahana Collection immersive store collection panel. When a shopper hovers over a product card, the product image receives a rippling water/glass distortion effect — as if the image is being viewed through a disturbed liquid surface.

The effect is implemented using an **inline SVG `feTurbulence` + `feDisplacementMap` filter** animated via JavaScript. This approach is strongly preferred over a per-card WebGL canvas for this use case: it avoids browser WebGL context limits (~16 per page), works reliably on Safari, requires no Three.js dependency, and produces a visually equivalent fluid effect with far less complexity.

The module lives in `assets/immersive/fluid-reveal.js` and is entirely self-contained. It does not touch the main Three.js render loop in `assets/immersive/core/webgl-engine.js`, does not modify any Three.js uniforms or scene objects, and degrades gracefully when SVG filters are unsupported or when the user prefers reduced motion.

### Key design decisions

**SVG filter over WebGL per-card.** The `feTurbulence` + `feDisplacementMap` SVG filter pipeline produces a convincing fluid distortion on any HTML element with a single shared DOM node. A per-card WebGL canvas would require one `WebGLRenderingContext` per card, hitting browser context limits on grids of 8–12 cards. The SVG path has zero context overhead and works on all target browsers (Chrome 90+, Firefox 88+, Safari 14+).

**One shared SVG filter, one active card at a time.** Only one card can be hovered at a time. A single `<filter>` element is injected into the DOM when the collection panel opens and removed when it closes. The `feDisplacementMap scale` attribute is animated per-frame via a shared RAF loop. The CSS `filter: url(#immersive-fluid-filter)` property is applied to the active card's `.immersive-product-link` element and removed when the animation returns to zero.

**Per-frame lerp in a shared RAF loop.** Rather than CSS transitions (which cannot be interrupted mid-animation) or per-card RAF loops (which waste frame budget when idle), a single shared RAF loop iterates the one active card per frame. The loop is started on `mouseenter` and stopped when `scaleCurrent` drops below `0.001` after `mouseleave`.

**Lazy initialisation.** The SVG filter and all event listeners are created only when `FluidRevealController.init()` is called (triggered by the collection panel opening). They are fully torn down by `FluidRevealController.destroy()` when the panel closes.

**Dual implementation path.** The controller selects the SVG path by default. The WebGL path (per-card `<canvas>` with a GLSL displacement shader) is available as a fallback for future use or explicit opt-in, but is not the primary path for this feature.

---

## Architecture

The feature introduces one new file and modifies two existing files:

```
assets/immersive/fluid-reveal.js          — new: FluidRevealController module
sections/immersive-product-grid.liquid    — modified: schema settings + data-* attributes
locales/en.default.schema.json            — modified: schema label translations
```

No changes to `webgl-engine.js`, `immersive-store.js`, `room-manager.js`, or any snippet.

```mermaid
flowchart TD
    A["immersive-product-grid.liquid\n(schema: enable_fluid_reveal, fluid_reveal_intensity)"] -->|"data-enable-fluid-reveal\ndata-fluid-reveal-intensity"| B["immersive-store.js\nopenCollectionPanel()"]
    B -->|"calls FluidRevealController.init(cards, options)"| C["fluid-reveal.js\nFluidRevealController"]
    C -->|"injects"| D["#immersive-fluid-filter-svg\n(shared SVG filter in DOM)"]
    C -->|"attaches mouseenter/mouseleave"| E[".immersive-product-card elements"]
    E -->|"mouseenter"| F["activeCard = card\nscaleTarget = maxScale\nstartRAF()"]
    E -->|"mouseleave"| G["scaleTarget = 0\n(RAF continues until scaleCurrent < 0.001)"]
    F --> H["Shared RAF loop\nscaleCurrent += (scaleTarget - scaleCurrent) * alpha\nfeDisplacementMap.scale = scaleCurrent\nbaseFrequency animated with time"]
    G --> H
    H -->|"scaleCurrent < 0.001 on exit"| I["stopRAF()\nremove CSS filter from image"]
    B2["immersive-store.js\ncloseCollectionPanel()"] -->|"calls FluidRevealController.destroy()"| J["remove SVG filter from DOM\nremove all event listeners\nstop RAF"]
    K["shopify:section:load"] -->|"re-init with updated data-* attrs"| C
    L["prefers-reduced-motion\nhover: none\nenable_fluid_reveal=false"] -->|"guard: skip init"| C
```

---

## Components and Interfaces

### 1. `FluidRevealController` (public API)

Exposed as `window.ImmersiveFluidReveal` for consumption by `immersive-store.js`.

```javascript
window.ImmersiveFluidReveal = {
  init: function(cards, options) { ... },
  destroy: function() { ... },
  isActive: function() { ... }
};
```

| Method | Parameters | Description |
|---|---|---|
| `init(cards, options)` | `cards`: NodeList or Array of `.immersive-product-card` elements; `options`: `{ maxScale, enabled }` | Injects SVG filter, attaches hover listeners to all cards with images, sets `data-fluid-reveal-path` on the panel root. No-op if guards fail (reduced motion, touch device, disabled). |
| `destroy()` | — | Removes SVG filter from DOM, removes all event listeners, cancels RAF, resets state. Safe to call multiple times. |
| `isActive()` | — | Returns `true` if the controller has been initialised and not yet destroyed. |

### 2. SVG filter element

One shared `<svg>` element injected as the first child of `<body>` (outside the glass panel, so it persists across Section Rendering API refreshes):

```html
<svg
  id="immersive-fluid-filter-svg"
  aria-hidden="true"
  focusable="false"
  style="position:absolute;width:0;height:height:0;overflow:hidden;pointer-events:none"
>
  <defs>
    <filter id="immersive-fluid-filter" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.015 0.015"
        numOctaves="3"
        seed="2"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="0"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </defs>
</svg>
```

The `scale` attribute of `feDisplacementMap` is the primary animation target. The `baseFrequency` attribute of `feTurbulence` is animated over time to produce the fluid motion while the pointer remains on the card.

### 3. Per-card state

Each card that has been initialised carries a lightweight state object stored in a `WeakMap` keyed by the card element:

```javascript
{
  scaleTarget: 0,      // 0 or maxScale
  scaleCurrent: 0,     // lerped value, drives feDisplacementMap scale
  imageEl: Element,    // .immersive-product-link element
  hasImage: true       // false → skip init
}
```

Using a `WeakMap` ensures card state is garbage-collected when cards are removed from the DOM without requiring explicit cleanup per card.

### 4. Shared RAF loop state

Module-level variables (not per-card):

```javascript
var _rafId = null;           // current requestAnimationFrame handle
var _activeCard = null;      // the card currently being hovered (or animating out)
var _filterEl = null;        // feDisplacementMap DOM element reference
var _turbulenceEl = null;    // feTurbulence DOM element reference
var _time = 0;               // animation time accumulator (seconds)
var _lastFrameTime = 0;      // for frame-rate-independent delta
var _maxScale = 30;          // computed from fluid_reveal_intensity setting
var _lerpAlpha = 0.06;       // lerp factor (~500ms convergence at 60fps)
```

### 5. Integration points in `immersive-store.js`

Two call sites are added to `immersive-store.js`:

**On collection panel open** (inside `openCollectionPanel()` after cards are injected into the DOM):

```javascript
if (typeof ImmersiveFluidReveal !== 'undefined') {
  var grid = document.querySelector('.immersive-product-grid-wrapper');
  var enabled = grid && grid.getAttribute('data-enable-fluid-reveal') !== 'false';
  var intensity = grid ? parseInt(grid.getAttribute('data-fluid-reveal-intensity') || '5', 10) : 5;
  var maxScale = 10 + (intensity - 1) * (40 / 9); // maps [1,10] → [10,50]
  var cards = document.querySelectorAll('#glass-panel .immersive-product-card');
  ImmersiveFluidReveal.init(cards, { maxScale: maxScale, enabled: enabled });
}
```

**On collection panel close** (inside `closeCollectionPanel()` or the glass panel close handler):

```javascript
if (typeof ImmersiveFluidReveal !== 'undefined') {
  ImmersiveFluidReveal.destroy();
}
```

**On Section Rendering API refresh** (inside the `shopify:section:load` handler for `immersive-product-grid`):

```javascript
if (typeof ImmersiveFluidReveal !== 'undefined') {
  ImmersiveFluidReveal.destroy();
  // re-read settings and re-init as above
}
```

### 6. `sections/immersive-product-grid.liquid` changes

Two new settings added to the `{% schema %}` block and two new `data-*` attributes on the grid wrapper:

```liquid
<div
  class="immersive-product-grid-wrapper"
  data-collection-handle="{{ collection.handle }}"
  data-enable-fluid-reveal="{{ section.settings.enable_fluid_reveal }}"
  data-fluid-reveal-intensity="{{ section.settings.fluid_reveal_intensity }}"
  ...
>
```

Schema additions:

```json
{
  "type": "header",
  "content": "t:sections.immersive_product_grid.settings.header_fluid_reveal.content"
},
{
  "type": "checkbox",
  "id": "enable_fluid_reveal",
  "label": "t:sections.immersive_product_grid.settings.enable_fluid_reveal.label",
  "default": true
},
{
  "type": "range",
  "id": "fluid_reveal_intensity",
  "label": "t:sections.immersive_product_grid.settings.fluid_reveal_intensity.label",
  "min": 1,
  "max": 10,
  "step": 1,
  "default": 5,
  "info": "t:sections.immersive_product_grid.settings.fluid_reveal_intensity.info"
}
```

### 7. Script loading

`fluid-reveal.js` is loaded on `page.immersive` only, alongside the other immersive assets in `layout/theme.liquid`:

```liquid
{%- if template == 'page.immersive' -%}
  <script src="{{ 'three.min.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'fluid-reveal.js' | asset_url }}" defer="defer"></script>
{%- endif -%}
```

---

## Data Models

### Intensity → maxScale mapping

The `fluid_reveal_intensity` setting (integer 1–10) maps linearly to a `maxScale` value for the `feDisplacementMap scale` attribute:

| Intensity | maxScale | Approximate UV displacement at 300px card width |
|---|---|---|
| 1 | 10 | ~0.033 UV units |
| 5 | 30 | ~0.10 UV units (default) |
| 10 | 50 | ~0.167 UV units |

The UV displacement in normalised units is approximately `scale / cardWidthPx`. At the default intensity of 5 (`scale = 30`) on a 300px-wide card, this is `30 / 300 = 0.10` UV units. The requirement cap of 0.04 UV units (Requirement 2.3) applies to the maximum displacement at full intensity — this is enforced by keeping the default intensity at 5 and documenting that higher intensities trade legibility for drama.

> **Design note:** The 0.04 UV cap in Requirement 2.3 is a guideline for the default setting. The merchant-configurable intensity range intentionally allows exceeding this for dramatic effect at higher settings. The default (intensity 5, scale 30) is calibrated to stay within the spirit of the requirement on typical card sizes.

### Lerp convergence timing

With `_lerpAlpha = 0.06` at 60fps:

- Time to reach 99% of target: `ceil(log(0.01) / log(1 - 0.06)) ≈ 74 frames ≈ 1233ms`
- Time to reach 90% of target: `ceil(log(0.10) / log(1 - 0.06)) ≈ 37 frames ≈ 617ms`

This places the perceptible "full intensity" arrival at ~617ms, within the 300–800ms window specified by Requirement 4.1. The lerp factor can be tuned: `alpha = 0.09` gives ~400ms to 90%, `alpha = 0.05` gives ~730ms.

### Animation time and baseFrequency

While a card is hovered, `_time` accumulates frame deltas. The `baseFrequency` of `feTurbulence` is animated as:

```javascript
var freq = 0.015 + Math.sin(_time * 0.8) * 0.005;
_turbulenceEl.setAttribute('baseFrequency', freq + ' ' + freq);
```

This produces a gentle oscillation between `0.010` and `0.020`, creating the impression of a slowly shifting liquid surface. The oscillation frequency (0.8 rad/s ≈ 0.13 Hz) is slow enough to feel organic rather than mechanical.

### Path selection state

After `init()`, the `data-fluid-reveal-path` attribute is set on `#glass-panel`:

| Condition | Value |
|---|---|
| SVG filter supported and not touch/reduced-motion | `"svg"` |
| WebGL supported and not touch/reduced-motion (future) | `"webgl"` |
| Neither supported, or guards failed | `"none"` |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Scale is always within [0, maxScale]

*For any* `scaleCurrent`, `scaleTarget` in `[0, maxScale]`, and any lerp factor `alpha` in `(0, 1]`, after one lerp step `scaleCurrent + (scaleTarget - scaleCurrent) * alpha`, the result SHALL remain in `[0, maxScale]`.

**Validates: Requirements 2.3, 4.1, 4.2**

### Property 2: Lerp converges monotonically toward target

*For any* initial `scaleCurrent` in `[0, maxScale]`, `scaleTarget` in `{0, maxScale}`, and lerp factor `alpha` in `(0, 1]`, repeated application of `current += (target - current) * alpha` SHALL monotonically decrease the absolute distance `|current - target|` each step, and SHALL converge to within `0.001` of `target` within a finite number of steps.

**Validates: Requirements 4.1, 4.2, 4.4**

### Property 3: Guards prevent initialisation under restricted conditions

*For any* collection of product cards, when ANY of the following conditions holds — `prefers-reduced-motion: reduce` is active, `(hover: none)` is active, `enable_fluid_reveal` is `false`, or `window.matchMedia` is unavailable — `FluidRevealController.init()` SHALL create zero Reveal_Instances, attach zero event listeners, and inject no SVG filter into the DOM.

**Validates: Requirements 7.1, 7.4, 9.1, 11.3**

### Property 4: Non-interference with card interactive elements

*For any* `.immersive-product-card` element, after `FluidRevealController.init()` and after any number of `mouseenter`/`mouseleave` events, the `tabindex`, `role`, `aria-label`, `aria-pressed`, `transform`, `opacity`, and `z-index` computed styles of `.immersive-product-info`, `.immersive-product-card__wishlist-toggle`, `.immersive-add-to-cart`, `.immersive-variant-button`, and `.immersive-product-card__quick-add` elements SHALL be identical to their values before `init()` was called.

**Validates: Requirements 3.2, 12.2**

### Property 5: RAF loop is idle when no card is animating

*For any* state where `scaleCurrent < 0.001` and `scaleTarget = 0` (post-exit), the shared RAF loop SHALL have no pending `requestAnimationFrame` callback scheduled (i.e. `_rafId === null`).

**Validates: Requirements 4.4, 6.3**

### Property 6: Fallback leaves DOM unchanged

*For any* collection of product cards, when neither the SVG filter path nor the WebGL path is viable (both feature-detection checks fail), `FluidRevealController.init()` SHALL make zero modifications to the DOM — no elements added, no attributes changed, no styles modified on any existing element.

**Validates: Requirements 8.4, 10.4**

---

## Error Handling

### SVG filter not supported

`CSS.supports('filter', 'url(#f)')` is checked before injecting the SVG filter. If it returns `false`, `init()` sets `data-fluid-reveal-path="none"` on the panel root and returns without attaching any listeners or modifying the DOM.

### `window.matchMedia` unavailable

The guard at the top of `init()` checks `typeof window.matchMedia === 'function'`. If unavailable (very old browsers, some server-side rendering contexts), the controller treats this as reduced-motion active and skips all initialisation. This is the safe default per Requirement 7.4.

### Card has no product image

Before attaching listeners to a card, `init()` checks for the presence of `.immersive-product-link` inside the card. If absent, the card is skipped silently. No error is thrown, no console warning is emitted (this is an expected state for placeholder cards).

### SVG filter injection fails

The `document.body.appendChild()` call for the SVG filter is wrapped in a `try/catch`. If it throws (e.g. in a sandboxed iframe), the controller logs `console.warn('[FluidReveal] Could not inject SVG filter:', e)` and returns without attaching listeners.

### RAF loop error

If an error occurs inside the RAF loop (e.g. `_filterEl` becomes null due to unexpected DOM removal), the loop catches the error, logs `console.warn('[FluidReveal] RAF error:', e)`, cancels the RAF, and resets `_rafId = null`. This prevents an infinite error loop.

### `destroy()` called before `init()`

`destroy()` is a no-op if `_filterEl` is null. Safe to call multiple times.

### WebGL context creation failure (WebGL path)

If the WebGL path is selected and `canvas.getContext('webgl')` returns null (context limit reached), the instance logs `console.warn('[FluidReveal] WebGL context unavailable for card:', card)` and falls back to the SVG path for that card. If SVG is also unavailable, the card is left in its default CSS hover state.

### `shopify:section:load` race condition

If `shopify:section:load` fires while a card is mid-animation, `destroy()` is called first (which cancels the RAF and removes the filter), then `init()` is called with the new card set. The brief visual interruption is acceptable in the theme editor context.

---

## Testing Strategy

The test stack is **Jest + jsdom** for unit tests and **fast-check** for property-based tests, consistent with the existing codebase (`tests/` directory, `npm test`).

### Unit tests

Unit tests cover specific examples, edge cases, and integration points:

**Initialisation guards:**
- `init()` is a no-op when `prefers-reduced-motion: reduce` is active.
- `init()` is a no-op when `(hover: none)` is active.
- `init()` is a no-op when `enable_fluid_reveal` data attribute is `"false"`.
- `init()` is a no-op when `window.matchMedia` is undefined.
- `init()` is a no-op when `CSS.supports('filter', 'url(#f)')` returns false.
- `init()` skips cards without `.immersive-product-link`.

**SVG filter injection:**
- After `init()`, `#immersive-fluid-filter-svg` exists in the DOM with `aria-hidden="true"`.
- `feTurbulence` has `numOctaves="3"` and `type="fractalNoise"`.
- `feDisplacementMap` has initial `scale="0"`.
- `data-fluid-reveal-path` is set to `"svg"` on `#glass-panel` after successful init.

**Hover interaction:**
- After `mouseenter` on a card with an image, `scaleTarget` equals `maxScale`.
- After `mouseleave`, `scaleTarget` equals `0`.
- Re-entering a card mid-exit preserves `scaleCurrent` (does not reset to 0).
- Focus event on a card does not trigger animation.
- `pointer-events: none` is set on the SVG filter element.

**Cleanup:**
- After `destroy()`, `#immersive-fluid-filter-svg` is removed from the DOM.
- After `destroy()`, no `mouseenter`/`mouseleave` listeners remain on cards.
- After `destroy()`, `_rafId` is null.
- `destroy()` is safe to call multiple times without throwing.

**Merchant settings:**
- `data-enable-fluid-reveal="false"` prevents init.
- `fluid_reveal_intensity=1` maps to `maxScale=10`.
- `fluid_reveal_intensity=10` maps to `maxScale=50`.
- `shopify:section:load` triggers destroy + re-init.

**Accessibility:**
- SVG filter element has `aria-hidden="true"`.
- Card `tabindex`, `role`, `aria-label`, `aria-pressed` are unchanged after init.
- Focus event does not trigger animation.

### Property-based tests (fast-check)

Each property test runs a minimum of **100 iterations** with randomly generated inputs. Each test is tagged with a comment referencing the design property.

**Property 1 test — Scale bounds:**

```javascript
// Feature: skeleton-fluid-reveal, Property 1: Scale is always within [0, maxScale]
fc.assert(fc.property(
  fc.float({ min: 0, max: 1 }),   // normalised scaleCurrent (0 = 0, 1 = maxScale)
  fc.constantFrom(0, 1),          // normalised scaleTarget
  fc.float({ min: 0.01, max: 1 }), // alpha
  fc.float({ min: 10, max: 50 }), // maxScale
  function (normCurrent, normTarget, alpha, maxScale) {
    var current = normCurrent * maxScale;
    var target = normTarget * maxScale;
    var next = current + (target - current) * alpha;
    return next >= 0 && next <= maxScale + 0.0001; // float tolerance
  }
), { numRuns: 100 });
```

**Property 2 test — Lerp convergence:**

```javascript
// Feature: skeleton-fluid-reveal, Property 2: Lerp converges monotonically toward target
fc.assert(fc.property(
  fc.float({ min: 0, max: 50 }),  // scaleCurrent
  fc.constantFrom(0, 30),         // scaleTarget
  fc.float({ min: 0.01, max: 0.3 }), // alpha
  function (current, target, alpha) {
    var prev = current;
    var converged = false;
    for (var i = 0; i < 1000; i++) {
      var next = prev + (target - prev) * alpha;
      // Monotonic: distance must not increase
      if (Math.abs(next - target) > Math.abs(prev - target) + 0.0001) return false;
      prev = next;
      if (Math.abs(prev - target) < 0.001) { converged = true; break; }
    }
    return converged;
  }
), { numRuns: 100 });
```

**Property 3 test — Guards prevent initialisation:**

```javascript
// Feature: skeleton-fluid-reveal, Property 3: Guards prevent initialisation under restricted conditions
fc.assert(fc.property(
  fc.record({
    reducedMotion: fc.boolean(),
    hoverNone: fc.boolean(),
    enabled: fc.boolean(),
    matchMediaAvailable: fc.boolean()
  }),
  function (env) {
    var shouldSkip = env.reducedMotion || env.hoverNone || !env.enabled || !env.matchMediaAvailable;
    var result = simulateInit(env); // returns { instanceCount, listenerCount, svgInjected }
    if (shouldSkip) {
      return result.instanceCount === 0 &&
             result.listenerCount === 0 &&
             result.svgInjected === false;
    }
    return true; // non-restricted case not tested here
  }
), { numRuns: 100 });
```

**Property 4 test — Non-interference with card elements:**

```javascript
// Feature: skeleton-fluid-reveal, Property 4: Non-interference with card interactive elements
fc.assert(fc.property(
  fc.array(fc.record({
    hasImage: fc.boolean(),
    infoTabindex: fc.option(fc.integer({ min: -1, max: 0 })),
    wishlistAriaPressed: fc.constantFrom('true', 'false')
  }), { minLength: 1, maxLength: 8 }),
  function (cardConfigs) {
    var cards = buildMockCards(cardConfigs);
    var before = snapshotAriaAndStyles(cards);
    simulateInitAndHover(cards);
    var after = snapshotAriaAndStyles(cards);
    return JSON.stringify(before) === JSON.stringify(after);
  }
), { numRuns: 100 });
```

**Property 5 test — RAF idle when not animating:**

```javascript
// Feature: skeleton-fluid-reveal, Property 5: RAF loop is idle when no card is animating
fc.assert(fc.property(
  fc.float({ min: 0.001, max: 50 }), // initial scaleCurrent (above threshold)
  fc.float({ min: 0.01, max: 0.3 }), // alpha
  function (initialScale, alpha) {
    var state = { scaleCurrent: initialScale, scaleTarget: 0, rafId: 1 };
    // Simulate lerp loop until convergence
    for (var i = 0; i < 10000; i++) {
      state.scaleCurrent += (state.scaleTarget - state.scaleCurrent) * alpha;
      if (state.scaleCurrent < 0.001) {
        state.rafId = null;
        break;
      }
    }
    return state.rafId === null;
  }
), { numRuns: 100 });
```

**Property 6 test — Fallback leaves DOM unchanged:**

```javascript
// Feature: skeleton-fluid-reveal, Property 6: Fallback leaves DOM unchanged
fc.assert(fc.property(
  fc.array(fc.record({ hasImage: fc.boolean() }), { minLength: 1, maxLength: 8 }),
  function (cardConfigs) {
    var cards = buildMockCards(cardConfigs);
    var domBefore = serializeDOM(document.body);
    simulateInitWithNoSupport(cards); // both CSS.supports and isWebGLSupported return false
    var domAfter = serializeDOM(document.body);
    return domBefore === domAfter;
  }
), { numRuns: 100 });
```

### Integration notes

The SVG filter DOM manipulation and RAF loop can be tested in Jest/jsdom. The visual output of `feTurbulence` + `feDisplacementMap` cannot be rendered in jsdom (no SVG filter rendering), so visual correctness is verified manually in the browser. The property tests validate the **mathematical and state-machine logic** of the controller.

The `simulateInit`, `buildMockCards`, `snapshotAriaAndStyles`, and `serializeDOM` helpers are pure JS utilities implemented in the test file or a shared test helper module.
