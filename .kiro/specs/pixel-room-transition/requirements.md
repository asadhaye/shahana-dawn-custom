# Requirements Document

## Introduction

This feature replaces the existing linear WebGL crossfade between rooms in the Shahana Collection immersive store with an optional pixel dissolve effect. Inspired by pixelation dissolve aesthetics, the transition works in two phases: the outgoing room's texture pixelates out (block size grows from 1px to ~32px), then the incoming room's texture pixelates in (block size shrinks from ~32px to 1px). The effect is implemented entirely in GLSL inside the existing `fragmentShaderSource` in `webgl-engine.js`, requiring no changes to the JavaScript transition loop or timing. Merchants can choose between the existing `crossfade` style and the new `pixel_dissolve` style via a section setting. The feature respects `prefers-reduced-motion` by always falling back to the smooth crossfade.

## Glossary

- **Shader**: A GLSL program executed on the GPU that computes the colour of each pixel on the WebGL canvas.
- **Fragment_Shader**: The GLSL fragment shader (`fragmentShaderSource`) in `webgl-engine.js` that composites room textures, parallax, mood, and post-processing effects.
- **uTransitionProgress**: The existing `float` uniform (range 0.0–1.0) that drives all room transition animation. Animated by the JS transition loop in `_startRoomTextureLoad` over 800 ms.
- **uTexture1**: The existing `sampler2D` uniform holding the outgoing room's base texture.
- **uTexture2**: The existing `sampler2D` uniform holding the incoming room's base texture.
- **uPixelTransition**: A new `float` uniform (0.0 = crossfade, 1.0 = pixel dissolve) that toggles the effect in the shader. Set once on scene init and updated when the merchant setting changes.
- **Pixel_Dissolve**: The two-phase pixelation effect: outgoing room pixelates out during `uTransitionProgress` 0.0→0.5, incoming room pixelates in during `uTransitionProgress` 0.5→1.0.
- **Block_Size**: The side length in screen-space pixels of each pixelation cell. Ranges from 1 px (sharp) to 32 px (fully pixelated). Computed in the shader from `uTransitionProgress`.
- **Crossover_Point**: The moment at `uTransitionProgress = 0.5` when the shader switches from sampling `uTexture1` to sampling `uTexture2`.
- **Pixelation_Grid**: The quantization of UV coordinates to a uniform grid of cells, computed in screen-space so block size is consistent regardless of image resolution.
- **Transition_Style**: The merchant-configurable setting (`crossfade` or `pixel_dissolve`) stored in the `immersive-canvas` section schema.
- **Reduced_Motion**: The OS/browser accessibility preference `prefers-reduced-motion: reduce`, already read into the `reduceMotion` JS variable and the `uReducedMotion` uniform.
- **WebGL_Engine**: `assets/webgl-engine.js` — owns the Three.js scene, shader sources, uniforms, and the `animate()` render loop.
- **Room_Manager**: `assets/immersive/core/room-manager.js` — owns `goToRoom()`, `_startRoomTextureLoad()`, and the 800 ms JS transition loop.
- **Immersive_Canvas**: `sections/immersive-canvas.liquid` — renders the canvas, section settings, and the `immersive-rooms-config` JSON consumed by the JS engine.

## Requirements

---

### Requirement 1: Pixel Dissolve Shader Effect

**User Story:** As a shopper, I want room transitions to feel cinematic and distinctive, so that navigating between rooms feels like a premium editorial experience.

#### Acceptance Criteria

1. WHEN `uTransitionProgress` is between 0.0 and 0.5 and `uPixelTransition` equals 1.0, THE Fragment_Shader SHALL sample `uTexture1` through a pixelation grid whose Block_Size increases linearly from 1 px at `uTransitionProgress = 0.0` to 32 px at `uTransitionProgress = 0.5`.

2. WHEN `uTransitionProgress` is between 0.5 and 1.0 and `uPixelTransition` equals 1.0, THE Fragment_Shader SHALL sample `uTexture2` through a pixelation grid whose Block_Size decreases linearly from 32 px at `uTransitionProgress = 0.5` to 1 px at `uTransitionProgress = 1.0`.

3. WHEN `uTransitionProgress` equals exactly 0.5 and `uPixelTransition` equals 1.0, THE Fragment_Shader SHALL switch from sampling `uTexture1` to sampling `uTexture2` at the Crossover_Point.

4. THE Fragment_Shader SHALL compute the Pixelation_Grid in screen-space pixels using the canvas resolution, so that Block_Size is consistent regardless of the source image resolution or aspect ratio.

5. WHEN `uPixelTransition` equals 0.0, THE Fragment_Shader SHALL produce output identical to the existing smooth crossfade (`mix(color1, color2, t)`), with no pixelation applied.

---

### Requirement 2: No New JavaScript Uniforms or Timing Changes

**User Story:** As a developer, I want the pixel dissolve to be a pure shader modification, so that the existing JS transition loop and 800 ms timing remain unchanged.

#### Acceptance Criteria

1. THE WebGL_Engine SHALL add exactly one new uniform, `uPixelTransition` (type `float`), to the `uniforms` object in `initImmersiveScene()`.

2. THE Room_Manager SHALL NOT modify the 800 ms transition duration, the `requestAnimationFrame` step loop, or the `uTransitionProgress` animation curve in `_startRoomTextureLoad()`.

3. THE WebGL_Engine SHALL NOT add any new `requestAnimationFrame` loops, `setTimeout` calls, or JS-side animation state for the pixel dissolve effect.

4. THE Fragment_Shader SHALL derive Block_Size entirely from `uTransitionProgress` and the canvas resolution, requiring no additional uniforms beyond `uPixelTransition`.

---

### Requirement 3: Merchant Transition Style Setting

**User Story:** As a merchant, I want to choose the room transition style in the theme editor, so that I can match the effect to my brand aesthetic without touching code.

#### Acceptance Criteria

1. THE Immersive_Canvas SHALL expose a `select` setting with id `transition_style`, offering options `crossfade` (label: "Smooth Crossfade") and `pixel_dissolve` (label: "Pixel Dissolve"), with `crossfade` as the default value.

2. WHEN the `transition_style` setting equals `pixel_dissolve`, THE WebGL_Engine SHALL set `uniforms.uPixelTransition.value` to `1.0` during scene initialisation.

3. WHEN the `transition_style` setting equals `crossfade`, THE WebGL_Engine SHALL set `uniforms.uPixelTransition.value` to `0.0` during scene initialisation.

4. THE Immersive_Canvas SHALL pass the `transition_style` setting value to JavaScript via a `data-transition-style` attribute on the canvas wrapper element, so that `immersive-store.js` can read it without Liquid logic in JS files.

5. WHERE the `transition_style` setting is `pixel_dissolve`, THE Immersive_Canvas SHALL display a help text note informing the merchant that the effect is automatically replaced with a smooth crossfade for visitors who have enabled reduced motion in their OS settings.

---

### Requirement 4: Reduced Motion Fallback

**User Story:** As a shopper with vestibular or motion sensitivity, I want room transitions to remain smooth regardless of the merchant's style setting, so that the immersive store is accessible to me.

#### Acceptance Criteria

1. WHEN `reduceMotion` is `true` at scene initialisation, THE WebGL_Engine SHALL set `uniforms.uPixelTransition.value` to `0.0`, overriding any merchant setting.

2. WHILE `uReducedMotion` equals `1.0` in the Fragment_Shader, THE Fragment_Shader SHALL produce the smooth crossfade output regardless of the value of `uPixelTransition`.

3. THE WebGL_Engine SHALL evaluate `prefers-reduced-motion` once at scene initialisation using the existing `reduceMotion` variable, with no runtime re-evaluation required.

4. IF `reduceMotion` is `true` and `transition_style` is `pixel_dissolve`, THEN THE WebGL_Engine SHALL log a single console message at the `info` level indicating that the pixel dissolve effect has been suppressed due to reduced motion preference.

---

### Requirement 5: Screen-Space Pixelation Grid

**User Story:** As a developer, I want the pixelation grid to be based on screen-space pixels, so that the block size looks the same on all image resolutions and device pixel ratios.

#### Acceptance Criteria

1. THE Fragment_Shader SHALL accept a `vec2` uniform `uResolution` representing the canvas dimensions in CSS pixels, used to convert UV coordinates to screen-space pixel coordinates for grid quantization.

2. THE WebGL_Engine SHALL add `uResolution` to the `uniforms` object and update its value in the `handleResize()` function whenever the canvas dimensions change.

3. THE Fragment_Shader SHALL quantize UV coordinates by: converting UV to pixel coordinates (`uv * uResolution`), snapping to the nearest Block_Size grid cell (`floor(pixelCoords / blockSize) * blockSize`), then converting back to UV (`snappedPixelCoords / uResolution`).

4. WHEN Block_Size equals 1.0, THE Fragment_Shader SHALL produce UV coordinates identical to the unquantized input, resulting in a pixel-perfect sharp image with no visible grid.

5. THE WebGL_Engine SHALL initialise `uResolution` with the canvas dimensions at scene start, before the first frame is rendered.

---

### Requirement 6: Vanilla JS and `var` Conventions

**User Story:** As a developer, I want the implementation to follow the existing codebase conventions, so that the new code is consistent and maintainable without a build step.

#### Acceptance Criteria

1. THE WebGL_Engine SHALL declare all new JavaScript variables using `var`, consistent with the existing codebase convention.

2. THE WebGL_Engine SHALL NOT introduce any ES6+ syntax (`let`, `const`, arrow functions, template literals, destructuring) in `webgl-engine.js` or `room-manager.js`.

3. THE Fragment_Shader GLSL code SHALL be written as a string concatenated into the existing `fragmentShaderSource` variable, with no external shader files or module imports.

4. THE WebGL_Engine SHALL NOT introduce any new JavaScript dependencies, npm packages, or bundler requirements.

---

### Requirement 7: Performance — No CPU Cost

**User Story:** As a shopper on any device, I want room transitions to remain smooth and frame-rate-stable, so that the pixel dissolve effect does not degrade the experience.

#### Acceptance Criteria

1. THE Fragment_Shader SHALL compute the pixelation effect entirely in GLSL on the GPU, with no per-frame CPU-side computation beyond setting the existing `uTransitionProgress` uniform.

2. THE WebGL_Engine SHALL NOT perform any pixel-level image manipulation in JavaScript (e.g. `canvas.getContext('2d')`, `ImageData`, `putImageData`) as part of the pixel dissolve effect.

3. WHEN `uPixelTransition` equals `0.0`, THE Fragment_Shader SHALL execute no pixelation code paths, preserving the existing shader performance profile for the crossfade style.

4. THE Fragment_Shader pixelation function SHALL consist of a single `texture2D` call per pixel using quantized UV coordinates, with no additional texture samples or iterative loops.

---

### Requirement 8: Shader Correctness — Round-Trip and Edge Cases

**User Story:** As a developer, I want the shader to handle boundary conditions correctly, so that transitions start and end cleanly with no visual artefacts.

#### Acceptance Criteria

1. WHEN `uTransitionProgress` equals `0.0` and `uPixelTransition` equals `1.0`, THE Fragment_Shader SHALL output the unquantized `uTexture1` sample (Block_Size = 1 px), visually identical to the pre-transition state.

2. WHEN `uTransitionProgress` equals `1.0` and `uPixelTransition` equals `1.0`, THE Fragment_Shader SHALL output the unquantized `uTexture2` sample (Block_Size = 1 px), visually identical to the post-transition state.

3. THE Fragment_Shader SHALL clamp `uTransitionProgress` to the range [0.0, 1.0] before computing Block_Size, preventing artefacts if the uniform is set outside this range.

4. THE Fragment_Shader SHALL clamp Block_Size to a minimum of 1.0 px and a maximum of 32.0 px, preventing division-by-zero and excessively large blocks.

5. FOR ALL values of `uTransitionProgress` in [0.0, 1.0], THE Fragment_Shader SHALL produce a continuous output with no sudden jumps in brightness or colour at the Crossover_Point, except for the intended texture switch.
