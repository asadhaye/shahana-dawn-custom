# Tasks: Pixel Room Transition

## Task List

- [ ] 1. Write exploration PBT (must fail on current code)
  - [ ] 1.1 E1: uniforms.uPixelTransition does not exist in webgl-engine.js
  - [ ] 1.2 E2: uniforms.uResolution does not exist in webgl-engine.js
  - [ ] 1.3 E3: fragmentShaderSource does not contain uPixelTransition uniform declaration
  - [ ] 1.4 E4: immersive-canvas.liquid does not have transition_style setting

- [ ] 2. Write preservation PBT (must pass on current code)
  - [ ] 2.1 P1: Block size formula always in [1, 32]
  - [ ] 2.2 P2: Crossfade identity when pixel dissolve inactive
  - [ ] 2.3 P3: UV quantization snaps to correct screen-space grid

- [ ] 3. Implement sections/immersive-canvas.liquid
  - [ ] 3.1 Add data-transition-style attribute to canvas wrapper
  - [ ] 3.2 Add transition_style select setting to schema

- [ ] 4. Add locale keys to locales/en.default.json

- [ ] 5. Implement assets/immersive/core/webgl-engine.js
  - [ ] 5.1 Add uPixelTransition and uResolution uniform declarations to fragmentShaderSource
  - [ ] 5.2 Replace crossfade line with pixel dissolve shader logic
  - [ ] 5.3 Add uPixelTransition and uResolution to uniforms object in initImmersiveScene()
  - [ ] 5.4 Read data-transition-style and set uPixelTransition
  - [ ] 5.5 Update uResolution in handleResize()

- [ ] 6. Verify exploration tests now pass

- [ ] 7. Run full test suite
