# Requirements Document

## Introduction

The Skeleton Fluid Reveal feature adds a premium hover effect to product cards in the Shahana Collection immersive store. Inspired by the fluid x-ray/skeleton displacement technique at tympanus.net/Tutorials/SkeletonFluidReveal/, the effect creates a rippling, liquid distortion on a product card's image when a user hovers over it — as if the image is being viewed through water or glass. The effect is scoped entirely to the product image area, leaving card text and interactive controls unaffected. It is implemented as a standalone module that does not touch the main Three.js render loop, respects `prefers-reduced-motion`, and degrades gracefully when WebGL is unavailable or on touch devices.

---

## Glossary

- **Fluid_Reveal_Controller**: The JavaScript module (`assets/immersive/fluid-reveal.js`) responsible for initialising, managing, and destroying per-card fluid reveal instances.
- **Reveal_Instance**: A single fluid reveal effect bound to one `.immersive-product-card` element, owning its own WebGL canvas (or SVG filter node) and animation loop.
- **Card_Image_Zone**: The `.immersive-product-link` element and its child `<img>` elements inside an `.immersive-product-card` — the only area the effect is applied to.
- **Displacement_Shader**: A GLSL fragment shader (or equivalent SVG `feTurbulence`/`feDisplacementMap` filter) that produces the fluid/liquid distortion on the product image texture.
- **Lerp_Factor**: A per-frame interpolation coefficient (0 < α ≤ 1) used to smoothly advance shader uniforms toward their target values, producing smooth entry and exit transitions.
- **Main_Render_Loop**: The existing `requestAnimationFrame` loop in `assets/immersive/core/webgl-engine.js` that drives the Three.js room scene. The Fluid_Reveal_Controller must not modify or block this loop.
- **Collection_Panel**: The `#glass-panel` dialog element that contains the product grid rendered by `sections/immersive-product-grid.liquid`.
- **Reduced_Motion**: The OS/browser accessibility preference expressed via `prefers-reduced-motion: reduce`.
- **Touch_Device**: A device where the primary input is touch (detected via `window.matchMedia('(hover: none)')`).
- **WebGL_Context**: A `WebGLRenderingContext` or `WebGL2RenderingContext` obtained from a `<canvas>` element. Distinct from the main Three.js renderer context.

---

## Requirements

### Requirement 1: Hover Activation and Deactivation

**User Story:** As a shopper browsing the collection panel, I want the fluid reveal effect to start when I hover over a product card image and reverse when I move away, so that the interaction feels responsive and intentional.

#### Acceptance Criteria

1. WHEN a pointer `mouseenter` event fires on an `.immersive-product-card`, THE Fluid_Reveal_Controller SHALL begin animating the Displacement_Shader toward its fully-active state on that card's Card_Image_Zone.
2. WHEN a pointer `mouseleave` event fires on an `.immersive-product-card`, THE Fluid_Reveal_Controller SHALL begin animating the Displacement_Shader back toward its neutral (zero-displacement) state.
3. WHILE the Displacement_Shader is transitioning between states, THE Reveal_Instance SHALL use a Lerp_Factor to advance uniform values each frame, producing a smooth continuous transition rather than an instant jump.
4. WHEN the pointer re-enters a card before the exit transition completes, THE Reveal_Instance SHALL reverse direction from the current interpolated state without resetting to zero.
5. WHERE the card has no product image (`product.featured_image` is blank), THE Fluid_Reveal_Controller SHALL skip initialisation for that card and apply no effect.

---

### Requirement 2: Fluid Displacement Effect on Product Image

**User Story:** As a shopper, I want the hover effect to feel like liquid or water distortion on the product image, so that the experience feels premium and editorial rather than a simple scale or fade.

#### Acceptance Criteria

1. WHEN the effect is active, THE Displacement_Shader SHALL apply a time-varying, spatially non-uniform UV offset to the product image texture, producing a rippling or fluid-like distortion visible to the user.
2. THE Displacement_Shader SHALL use at least two octaves of noise or turbulence to ensure the distortion pattern does not appear repetitive or mechanical.
3. WHEN the effect is at full intensity, THE Displacement_Shader SHALL produce a maximum UV displacement magnitude of no more than 0.04 normalised UV units to preserve product image legibility.
4. THE Displacement_Shader SHALL animate the distortion pattern over time using a `uTime` uniform so the fluid motion continues while the pointer remains on the card.
5. WHEN the effect is at neutral state (post-`mouseleave` transition complete), THE Displacement_Shader SHALL produce zero visible distortion, rendering the image identically to its pre-hover state.

---

### Requirement 3: Effect Scoped to Card Image Only

**User Story:** As a shopper, I want the fluid effect to apply only to the product image, not to the card's title, price, or action buttons, so that product information remains readable during the effect.

#### Acceptance Criteria

1. THE Fluid_Reveal_Controller SHALL apply the Displacement_Shader exclusively within the Card_Image_Zone (`.immersive-product-link` and its descendants).
2. THE Fluid_Reveal_Controller SHALL not alter the CSS `transform`, `opacity`, `filter`, or `z-index` of `.immersive-product-info`, variant buttons, add-to-cart buttons, wishlist toggle, or quick-add button elements.
3. WHEN a Reveal_Instance is active, THE Reveal_Instance SHALL not intercept pointer events on the card's interactive controls (wishlist toggle, quick-add button, variant buttons, product link).
4. THE Reveal_Instance canvas or filter node SHALL be positioned within the Card_Image_Zone using `position: absolute; inset: 0` with `pointer-events: none` so it does not block underlying interactions.

---

### Requirement 4: Smooth Entry and Exit Transitions

**User Story:** As a shopper, I want the effect to ease in and out gracefully rather than snapping on or off, so that the interaction feels polished and intentional.

#### Acceptance Criteria

1. WHEN a `mouseenter` event triggers the effect, THE Reveal_Instance SHALL reach full displacement intensity after a transition of no less than 300ms and no more than 800ms at the default Lerp_Factor.
2. WHEN a `mouseleave` event triggers the exit, THE Reveal_Instance SHALL return to zero displacement after a transition of no less than 300ms and no more than 800ms at the default Lerp_Factor.
3. THE Reveal_Instance SHALL use a per-frame lerp approach (e.g. `current += (target - current) * α`) rather than a fixed-duration CSS transition, so the transition speed is frame-rate independent.
4. WHEN the Reveal_Instance reaches a displacement intensity below 0.001 on exit, THE Reveal_Instance SHALL stop its animation loop and release the frame budget until the next `mouseenter`.

---

### Requirement 5: Lazy Initialisation

**User Story:** As a performance-conscious developer, I want the fluid reveal effect to initialise only when the collection panel is open and cards are visible, so that it does not consume GPU or CPU resources when the panel is closed.

#### Acceptance Criteria

1. WHEN the Collection_Panel opens and product cards are injected into the DOM, THE Fluid_Reveal_Controller SHALL initialise Reveal_Instances for all visible `.immersive-product-card` elements within the panel.
2. WHEN the Collection_Panel closes, THE Fluid_Reveal_Controller SHALL destroy all active Reveal_Instances, releasing their WebGL contexts and removing their event listeners.
3. WHEN the Collection_Panel content is replaced via the Section Rendering API (e.g. navigating to a different collection), THE Fluid_Reveal_Controller SHALL destroy existing Reveal_Instances and re-initialise for the new card set.
4. THE Fluid_Reveal_Controller SHALL not create any WebGL context or attach any event listeners before the Collection_Panel has been opened for the first time in a session.
5. WHEN a Reveal_Instance is destroyed, THE Reveal_Instance SHALL call `canvas.getContext('webgl').getExtension('WEBGL_lose_context').loseContext()` (if available) to explicitly release the GPU context.

---

### Requirement 6: Performance — No Impact on Main Render Loop

**User Story:** As a developer, I want the fluid reveal effect to be isolated from the main Three.js scene loop so that it cannot drop the immersive store below 60fps.

#### Acceptance Criteria

1. THE Fluid_Reveal_Controller SHALL run each Reveal_Instance's animation in its own `requestAnimationFrame` callback, separate from the Main_Render_Loop in `webgl-engine.js`.
2. THE Fluid_Reveal_Controller SHALL not add any code to the `animate()` function in `webgl-engine.js` or modify any Three.js uniforms, scene objects, or renderer state.
3. WHEN no card is being hovered, THE Fluid_Reveal_Controller SHALL have zero active `requestAnimationFrame` callbacks running (all loops paused per Requirement 4, criterion 4).
4. THE Reveal_Instance canvas SHALL use a pixel ratio of `Math.min(window.devicePixelRatio, 1.5)` to limit GPU fill-rate cost on high-DPI displays.
5. WHEN more than four Reveal_Instances would be active simultaneously (e.g. rapid mouse movement across cards), THE Fluid_Reveal_Controller SHALL limit concurrent active WebGL contexts to four, deferring additional initialisations until a context is released.

---

### Requirement 7: Reduced Motion Fallback

**User Story:** As a user who has enabled reduced motion in their OS settings, I want the fluid reveal effect to be completely disabled so that I am not exposed to motion that may cause discomfort.

#### Acceptance Criteria

1. WHEN `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true` at page load, THE Fluid_Reveal_Controller SHALL not initialise any Reveal_Instances and SHALL not attach any hover event listeners.
2. WHEN the `prefers-reduced-motion` media query changes to `reduce` during a session, THE Fluid_Reveal_Controller SHALL destroy all active Reveal_Instances and remove all hover event listeners.
3. WHEN Reduced_Motion is active, THE Fluid_Reveal_Controller SHALL leave the `.immersive-product-card` hover styles defined in `snippets/immersive-product-card.liquid` unchanged (the existing `translateY(-4px)` hover is already guarded by its own `@media (prefers-reduced-motion: reduce)` block).
4. IF `window.matchMedia` is unavailable in the browser environment, THEN THE Fluid_Reveal_Controller SHALL treat the condition as Reduced_Motion active and skip all initialisation.

---

### Requirement 8: WebGL Unavailability Fallback

**User Story:** As a user on a device or browser where WebGL is not available, I want the product cards to behave exactly as they do today, so that my shopping experience is not degraded.

#### Acceptance Criteria

1. WHEN `isWebGLSupported()` returns `false` (reusing the existing helper from `webgl-engine.js`), THE Fluid_Reveal_Controller SHALL not attempt to create any WebGL canvas or attach any hover listeners.
2. WHEN a WebGL context creation fails at runtime for an individual card (e.g. context limit reached), THE Reveal_Instance SHALL log a warning to the console and exit without throwing, leaving the card in its default CSS hover state.
3. IF the CSS `backdrop-filter` + SVG filter implementation path is chosen instead of WebGL, THEN THE Fluid_Reveal_Controller SHALL verify `CSS.supports('backdrop-filter', 'blur(1px)')` before applying the filter, and SHALL fall back to no effect if unsupported.
4. WHEN the fallback path is active, THE Fluid_Reveal_Controller SHALL not alter any existing card CSS or DOM structure.

---

### Requirement 9: Mobile and Touch Device Behaviour

**User Story:** As a shopper on a mobile or touch device, I want the product cards to work normally without the fluid effect, since hover interactions do not apply to touch, so that the experience is not broken or confusing.

#### Acceptance Criteria

1. WHEN `window.matchMedia('(hover: none)').matches` is `true`, THE Fluid_Reveal_Controller SHALL not initialise any Reveal_Instances and SHALL not attach `mouseenter`/`mouseleave` listeners.
2. WHERE a merchant enables the optional tap-activated variant via a section setting, THE Fluid_Reveal_Controller SHALL attach a `touchstart` listener that activates the effect for 1200ms then reverses, providing a brief fluid reveal on tap.
3. WHERE the tap-activated variant is enabled, THE Fluid_Reveal_Controller SHALL ensure the tap listener does not interfere with the card's existing `touchstart` behaviour (product link navigation, quick-add).
4. WHEN the tap-activated variant is not enabled (default), THE Fluid_Reveal_Controller SHALL produce no visible difference from the current card behaviour on touch devices.

---

### Requirement 10: Implementation Path Selection

**User Story:** As a developer, I want a clear, documented choice between the WebGL canvas approach and the CSS/SVG filter approach, so that the implementation can be selected based on browser support and performance trade-offs.

#### Acceptance Criteria

1. THE Fluid_Reveal_Controller SHALL support two implementation paths: a WebGL path (Three.js `PlaneGeometry` + custom Displacement_Shader per card) and a CSS/SVG path (`feTurbulence` + `feDisplacementMap` SVG filter with CSS animation).
2. THE Fluid_Reveal_Controller SHALL select the WebGL path when `isWebGLSupported()` returns `true` and the device is not a Touch_Device.
3. THE Fluid_Reveal_Controller SHALL select the CSS/SVG path when WebGL is unavailable but `CSS.supports('filter', 'url(#f)')` returns `true`.
4. WHEN neither path is viable, THE Fluid_Reveal_Controller SHALL apply no effect (silent no-op).
5. THE Fluid_Reveal_Controller SHALL expose a `data-fluid-reveal-path` attribute on the Collection_Panel root element set to `"webgl"`, `"svg"`, or `"none"` after path selection, to aid debugging and testing.

---

### Requirement 11: Merchant Configurability

**User Story:** As a merchant, I want to be able to enable or disable the fluid reveal effect and adjust its intensity from the theme editor, so that I can control the experience without touching code.

#### Acceptance Criteria

1. THE `sections/immersive-product-grid.liquid` section schema SHALL include a boolean setting `enable_fluid_reveal` (default: `true`) that controls whether the Fluid_Reveal_Controller is initialised.
2. THE `sections/immersive-product-grid.liquid` section schema SHALL include a range setting `fluid_reveal_intensity` (min: 1, max: 10, default: 5, step: 1) that maps to the maximum UV displacement magnitude passed to the Displacement_Shader.
3. WHEN `enable_fluid_reveal` is `false`, THE Fluid_Reveal_Controller SHALL not initialise and the cards SHALL behave as they do today.
4. THE section SHALL pass the `enable_fluid_reveal` and `fluid_reveal_intensity` values to JavaScript via `data-*` attributes on the grid container element.
5. WHEN the theme editor fires a `shopify:section:load` event for `immersive-product-grid`, THE Fluid_Reveal_Controller SHALL re-read the `data-*` attributes and re-initialise with the updated settings.

---

### Requirement 12: Accessibility — Non-Interference with Focus and ARIA

**User Story:** As a keyboard or screen reader user, I want the fluid reveal effect to be invisible to assistive technology so that it does not disrupt my navigation of the product grid.

#### Acceptance Criteria

1. THE Reveal_Instance canvas element SHALL carry `aria-hidden="true"` so it is not announced by screen readers.
2. THE Fluid_Reveal_Controller SHALL not alter the `tabindex`, `role`, `aria-label`, or `aria-pressed` attributes of any existing card element.
3. WHEN focus moves to a card via keyboard navigation, THE Fluid_Reveal_Controller SHALL not trigger the fluid effect (effect is pointer-only; `focus` and `blur` events are not wired).
4. THE Reveal_Instance canvas SHALL not receive focus (`tabindex="-1"` or no tabindex attribute).

