# Tasks: Skeleton Fluid Reveal

## Task List

- [x] 1. Write exploration PBT (must fail on current code)
  - [x] 1.1 E1: `window.ImmersiveFluidReveal` does not exist
  - [x] 1.2 E2: `assets/immersive/fluid-reveal.js` does not exist
  - [x] 1.3 E3: `sections/immersive-product-grid.liquid` does not have `enable_fluid_reveal` setting
  - [x] 1.4 E4: `layout/theme.liquid` does not load `fluid-reveal.js`

- [x] 2. Write preservation PBT (must pass on current code)
  - [x] 2.1 P1 (Property 1): Scale lerp always stays in [0, maxScale] — pure arithmetic
  - [x] 2.2 P2 (Property 2): Lerp converges monotonically toward target — pure arithmetic
  - [x] 2.3 P5 (Property 5): RAF idle when scaleCurrent < 0.001 and scaleTarget = 0 — pure logic

- [x] 3. Create `assets/immersive/fluid-reveal.js`

- [x] 4. Update `sections/immersive-product-grid.liquid`

- [x] 5. Update `assets/immersive/panels/collection-panel.js`

- [x] 6. Update `assets/immersive/panels/glass-panel.js`

- [x] 7. Update `layout/theme.liquid`

- [x] 8. Verify exploration tests now pass

- [x] 9. Run full test suite
