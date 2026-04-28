# Future Scope — Deferred Features

Features identified as high-value but deferred due to implementation complexity or dependency on future infrastructure. These are not ready to spec in detail yet but should be revisited once the active specs are shipped.

---

## 1. Rendering HTML into a Three.js Canvas

**Source:** https://cullenwebber.github.io/three-html-to-canvas/

**What it does:** Renders DOM elements (product cards, editorial text, price tags) as textures on Three.js plane meshes inside the 3D scene. Product cards would float in 3D space as actual WebGL objects rather than DOM overlays, enabling perspective transforms, depth sorting, and 3D hover effects that are impossible with CSS.

**Why it's compelling:** This is the most architecturally significant upgrade possible for the immersive store. Instead of the current model (3D background + DOM overlay for UI), the entire UI becomes part of the 3D scene. Product cards could tilt in 3D space, cast shadows, and respond to the parallax camera. It would make the store genuinely unique.

**Why it's deferred:**
- Requires `html2canvas` or a custom `OffscreenCanvas` + `drawImage` pipeline to rasterize DOM to texture
- Shopify's CSP headers may block `OffscreenCanvas` usage — needs investigation
- Accessibility: screen readers cannot read content inside WebGL textures — requires a parallel hidden DOM for ARIA
- Performance: re-rasterizing DOM to texture on every frame is expensive; needs dirty-checking
- The current Section Rendering API pattern (fetch HTML → inject into `#glass-panel`) would need to be rethought

**Prerequisites before speccing:**
- Verify Shopify CSP allows `OffscreenCanvas` on the immersive page
- Prototype the rasterization pipeline with a single product card
- Design the ARIA accessibility strategy for WebGL-rendered content
- Decide whether to use `html2canvas` (external dependency) or native Canvas 2D API

**Estimated complexity:** Very high (3–4 week feature)

---

## 2. Dithering Process Visualization

**Source:** https://tympanus.net/Tutorials/VisualizingDitheringThreejs/

**What it does:** A dithering post-process shader applied as a loading/transition effect. Images dither in as they load — starting as a coarse ordered-dither pattern and resolving to full quality. Could be used as the room texture loading effect (replacing the current spinner) or as an alternative room transition style alongside the pixel dissolve.

**Why it's compelling:** Dithering has a strong editorial/fashion-magazine aesthetic — it references halftone printing and analog photography. For a luxury Pakistani fashion brand, this could feel more distinctive than a standard fade or pixel dissolve. It also solves the "blank screen while textures load" problem elegantly.

**Why it's deferred:**
- Lower priority than the three active specs
- The pixel-room-transition spec already covers the transition effect space — dithering would be a third transition style option, not a standalone feature
- Best implemented as an extension to `pixel-room-transition` once that spec is shipped

**Prerequisites before speccing:**
- Ship `pixel-room-transition` first
- Extend the `transition_style` section setting to include `dither` as a third option
- The dithering shader can reuse the `uResolution` and `uPixelTransition` infrastructure from `pixel-room-transition`

**Estimated complexity:** Medium (1 week, as an extension to pixel-room-transition)

---

## Active Specs (for reference)

| Spec | Path | Status |
|---|---|---|
| Skeleton Fluid Reveal | `.kiro/specs/skeleton-fluid-reveal/` | Requirements complete |
| Editorial Parallax Gallery | `.kiro/specs/editorial-parallax-gallery/` | Requirements complete |
| Pixel Room Transition | `.kiro/specs/pixel-room-transition/` | Requirements complete |
| Immersive Room Atmosphere | `.kiro/specs/immersive-room-atmosphere/` | Implemented |
| Immersive Navigation Global API Fix | `.kiro/specs/immersive-navigation-global-api-fix/` | Implemented |
