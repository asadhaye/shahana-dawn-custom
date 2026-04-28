# Tasks: Editorial Parallax Gallery

## Task List

- [x] 1. Write exploration PBT (must fail on current code)
  - [x] 1.1 E1: `sections/immersive-editorial.liquid` does not have `parallax` as a layout option
  - [x] 1.2 E2: `sections/immersive-editorial.liquid` does not have `parallax_image` block type
  - [x] 1.3 E3: `sections/immersive-editorial.liquid` does not have `max_offset_px` setting
  - [x] 1.4 E4: `sections/immersive-editorial.liquid` does not have `data-parallax-gallery` attribute

- [x] 2. Write preservation PBT (must pass on current code)
  - [x] 2.1 P1: Scroll progress always in [0, 1] — pure arithmetic
  - [x] 2.2 P2: translateX always in [0, maxOffset] — pure arithmetic
  - [x] 2.3 P3: Lerp converges monotonically without overshoot — pure arithmetic
  - [x] 2.4 P5: Depth layer ordering holds — pure arithmetic

- [x] 3. Implement `sections/immersive-editorial.liquid`
  - [x] 3a. Add parallax gallery HTML
  - [x] 3b. Add `parallax` option to layout select
  - [x] 3c. Add `max_offset_px` setting
  - [x] 3d. Add `parallax_image` block type
  - [x] 3e. Add CSS
  - [x] 3f. Add JavaScript controller

- [x] 4. Verify exploration tests now pass

- [x] 5. Run full test suite
