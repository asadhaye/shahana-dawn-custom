# Implementation Plan: immersive-room-atmosphere

## Overview

Implement three layered atmospheric enhancements to the Three.js immersive store: a velocity signal that drives a brightness lift in the fragment shader, per-room GLSL mood backgrounds with animated blobs and cross-fade transitions, and a brief vertical drift on room entry. The feature also fixes the pre-existing `uTime` gap (declared in GLSL but never wired as a uniform).

Implementation follows spec-driven development with property-based testing. Tasks are ordered: Exploration PBT (confirm bugs/gaps on current code) → Preservation PBT (capture baseline) → Implementation (dependency order) → Verification (exploration tests now pass) → Integration.

All code uses vanilla JS with `var` declarations throughout, consistent with the existing codebase.

## Tasks

- [x] 1. Write exploration property-based tests (failing on current code)
  - Create `tests/immersive-room-atmosphere.test.js` with the Jest + fast-check test scaffold
  - Write **Exploration Test E1**: assert `uniforms.uTime` exists and is incremented each frame — this MUST FAIL on current code because `uTime` is not wired as a uniform in `initImmersiveScene()`
  - Write **Exploration Test E2**: assert `uniforms.uVelocityIntensity` exists — this MUST FAIL because the uniform does not yet exist
  - Write **Exploration Test E3**: assert each entry in `STORE_ROOMS` has a `mood` property with `background`, `blob1`, `blob2` hex strings — this MUST FAIL because `mood` is not yet defined
  - Write **Exploration Test E4**: assert `uniforms.uBgColor`, `uniforms.uBlob1Color`, `uniforms.uBlob2Color` exist — this MUST FAIL because these uniforms are not yet declared
  - Run the test file and confirm all four exploration tests fail; record the failure output as evidence
  - Tag each test: `// Feature: immersive-room-atmosphere, Exploration Test EN: <description>`
  - _Requirements: 1.5, 2.1, 3.1, 4.1, 8.1_

- [x] 2. Write preservation property-based tests (passing on current code)
  - In the same test file, write **Preservation Test P1** (Property 7): for any background colour (r, g, b) and blob contribution (r, g, b), `clamp(bg + blob, 0.0, 1.0)` is always in [0.0, 1.0] per channel — this is a pure arithmetic property that passes without any code changes
  - Write **Preservation Test P2** (Property 1): for any current scalar, target scalar, and lerp factor in (0, 1), a single lerp step equals `current + (target - current) * factor` — pure arithmetic, passes on current code
  - Write **Preservation Test P3** (Property 8): for any positive frame delta in ms, `uTime` increases by exactly `delta / 1000.0` — write as a pure function test against the formula, not against the live uniform (which is not yet wired); this captures the arithmetic contract before implementation
  - Run the test file and confirm all three preservation tests pass; record the pass output as evidence
  - Tag each test: `// Feature: immersive-room-atmosphere, Property N: <property_text>`
  - _Requirements: 5.3, 1.3, 8.2_

- [x] 3. Create `assets/immersive/core/atmosphere.js` — mood colour module
  - Create the new file following the existing module pattern: `var` declarations at top, `window.ImmersiveAtmosphere = { ... }` at bottom
  - Declare six `THREE.Color` module-level variables: `bgColorCurrent`, `blob1ColorCurrent`, `blob2ColorCurrent`, `bgColorNext`, `blob1ColorNext`, `blob2ColorNext`
  - Implement `initMoodUniforms(uniforms, initialMood)`: sets both current and next colour uniforms to `initialMood` palette; called once from `initImmersiveScene()`
  - Implement `setNextMood(mood)`: updates `bgColorNext`, `blob1ColorNext`, `blob2ColorNext` from a `{ background, blob1, blob2 }` palette object; called from `goToRoom()`
  - Implement `updateMoodUniforms(uniforms, lerpFactor)`: lerps current colours toward next using `THREE.Color.lerp()`, copies results to `uniforms.uBgColor.value`, `uniforms.uBlob1Color.value`, `uniforms.uBlob2Color.value`; called every frame from `animate()`
  - Implement `snapCurrentToNext(uniforms)`: immediately sets current = next and updates uniforms; called when crossfade completes
  - Guard all public methods against missing `uniforms` argument
  - _Requirements: 4.1, 4.3, 6.3_

- [x] 4. Add mood palettes to `STORE_ROOMS` in `room-manager.js`
  - Add a `mood` property to each of the five room entries in `STORE_ROOMS` with the exact hex values from the spec:
    - `storefront`: `{ background: '#0a0a0f', blob1: '#1a1025', blob2: '#0d0d1a' }`
    - `lounge`: `{ background: '#0f0a08', blob1: '#2a1a10', blob2: '#1a0f0a' }`
    - `designer_houses`: `{ background: '#080a12', blob1: '#101828', blob2: '#0a1020' }`
    - `occasions`: `{ background: '#0a0810', blob1: '#1e1028', blob2: '#120a1e' }`
    - `featured_collections`: `{ background: '#0a0a08', blob1: '#1e1e10', blob2: '#141408' }`
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Checkpoint — run tests after module and palette work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Wire new uniforms in `initImmersiveScene()` in `webgl-engine.js`
  - Add the following new entries to the `uniforms` object in `initImmersiveScene()`:
    - `uTime: { value: 0.0 }`
    - `uVelocityIntensity: { value: 0.0 }`
    - `uReducedMotion: { value: reduceMotion ? 1.0 : 0.0 }`
    - `uBgColor: { value: new THREE.Color('#0a0a0f') }`
    - `uBlob1Color: { value: new THREE.Color('#1a1025') }`
    - `uBlob2Color: { value: new THREE.Color('#0d0d1a') }`
    - `uBgColorNext: { value: new THREE.Color('#0a0a0f') }`
    - `uBlob1ColorNext: { value: new THREE.Color('#1a1025') }`
    - `uBlob2ColorNext: { value: new THREE.Color('#0d0d1a') }`
  - After the `uniforms` object is created, call `ImmersiveAtmosphere.initMoodUniforms(uniforms, STORE_ROOMS.storefront.mood)` to set both current and next to the storefront palette (guard with `typeof ImmersiveAtmosphere !== 'undefined'`)
  - Declare new module-level variables at the top of the file: `var velocityRaw = 0; var velocityCurrent = 0; var prevMouseX = 0.5; var prevMouseY = 0.5; var driftTarget = 0; var driftCurrent = 0;`
  - Repurpose `lastFrameTime` (already declared for the dev FPS monitor) for the `uTime` delta computation — ensure it is initialised to `0` at module scope
  - _Requirements: 1.5, 2.1, 4.1, 4.4, 8.1_

- [x] 7. Extend `animate()` in `webgl-engine.js` — uTime, velocity, mood lerp, drift
  - Insert the following blocks immediately after the `uniforms.uMouse.value.set(...)` line and before the hotspot proximity scaling block:
  - **uTime increment**: compute `var now = performance.now(); var delta = (now - lastFrameTime) / 1000.0; lastFrameTime = now; uniforms.uTime.value += delta;` — skip the delta on the very first frame by checking `lastFrameTime === 0` and only setting `lastFrameTime = now` without adding delta
  - **Velocity signal**: if `!reduceMotion`, compute Euclidean distance between `mouseCurrent` and `(prevMouseX, prevMouseY)`, zero it if below 0.001, lerp `velocityCurrent` toward it with factor 0.15, clamp to 1.0, write to `uniforms.uVelocityIntensity.value`; else set both to 0.0; always update `prevMouseX = mouseCurrent.x; prevMouseY = mouseCurrent.y`
  - **Mood colour lerp**: call `ImmersiveAtmosphere.updateMoodUniforms(uniforms, 0.04)` (guard with `typeof ImmersiveAtmosphere !== 'undefined'`)
  - **Drift lerp**: if `!reduceMotion`, lerp `driftCurrent` toward `driftTarget` with factor 0.08; else set `driftCurrent = 0`; apply `if (planeMesh) planeMesh.position.y = driftCurrent`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 4.3, 7.1, 7.5, 7.6, 8.2, 9.1, 9.2, 9.3, 9.4_

- [x] 8. Extend `goToRoom()` and `_startRoomTextureLoad()` in `room-manager.js` — drift and mood handoff
  - In `goToRoom()`, after the state updates and before the `if (!initial)` CSS fade block, add: if `!initial`, read `STORE_ROOMS[roomKey].mood` and call `ImmersiveAtmosphere.setNextMood(mood)` (guard both); set `driftTarget = fromBack ? -0.04 : 0.04` if `!reduceMotion`, else `driftTarget = 0; driftCurrent = 0`
  - In `_startRoomTextureLoad()`, inside the `t >= 1` completion block (after the texture swap and before `renderHotspots`), add: call `ImmersiveAtmosphere.snapCurrentToNext(uniforms)` (guard with `typeof ImmersiveAtmosphere !== 'undefined'`); set `driftTarget = 0`
  - For `goToRoom()` with `initial = true`: ensure `driftTarget` and `driftCurrent` remain `0` (the `if (!initial)` guard already handles this)
  - _Requirements: 4.2, 7.2, 7.3, 7.4, 7.7, 9.3_

- [x] 9. Update the fragment shader in `webgl-engine.js` — new uniforms and mood background layer
  - Add the following uniform declarations to `fragmentShaderSource` (after the existing `uniform float uTime;` line):
    ```glsl
    uniform vec3  uBgColor;
    uniform vec3  uBlob1Color;
    uniform vec3  uBlob2Color;
    uniform vec3  uBgColorNext;
    uniform vec3  uBlob1ColorNext;
    uniform vec3  uBlob2ColorNext;
    uniform float uVelocityIntensity;
    uniform float uReducedMotion;
    ```
  - In `main()`, insert the mood background layer **before** the `parallaxUv()` calls:
    - Blend palette via transition progress: `vec3 bgBlended = mix(uBgColor, uBgColorNext, t);` etc. (use `t` from `clamp(uTransitionProgress, 0.0, 1.0)` — move the `float t` declaration to before this block)
    - Compute animated blob centres using `float animTime = uTime * (1.0 - uReducedMotion);` with the exact frequencies and amplitudes from the design doc (blob1: `0.3 + sin(animTime * 0.23) * 0.15`, `0.4 + cos(animTime * 0.17) * 0.12`; blob2: `0.7 + cos(animTime * 0.19) * 0.13`, `0.6 + sin(animTime * 0.21) * 0.14`)
    - Compute soft blob shapes via `smoothstep` (blob1 radius 0.45, blob2 radius 0.40)
    - Composite: `vec3 moodBg = bgBlended + clamp(blob1Blended * blob1, 0.0, 1.0) + clamp(blob2Blended * blob2, 0.0, 1.0); moodBg = clamp(moodBg, 0.0, 1.0);`
  - After the existing crossfade `vec4 color = mix(color1, color2, t);` line, composite the room texture over the mood background using luminance as blend weight: `float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114)); color.rgb = mix(moodBg, color.rgb, luma);`
  - After the existing breathing effect line, insert the velocity brightness lift: `color.rgb *= (1.0 + uVelocityIntensity * 0.12);`
  - Preserve the existing film-grain, vignette, and atmospheric mood gold tint steps in their current positions — do not reorder them
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 10.1, 10.2_

- [x] 10. Update `layout/theme.liquid` — load `atmosphere.js` before `webgl-engine.js`
  - In the `{%- if template == 'page.immersive' -%}` block, add `<script src="{{ 'immersive/core/atmosphere.js' | asset_url }}" defer></script>` immediately before the existing `<script src="{{ 'immersive/core/webgl-engine.js' | asset_url }}" defer></script>` line
  - This ensures `window.ImmersiveAtmosphere` is defined before `initImmersiveScene()` runs
  - _Requirements: 4.1, 4.4_

- [x] 11. Checkpoint — run tests after core implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Write implementation property-based tests (Properties 2–6)
  - In `tests/immersive-room-atmosphere.test.js`, add property tests for the newly implemented logic:
  - [x]* 12.1 Write property test for Property 2: Velocity signal is always in [0, 1]
    - Use `fc.float({min:0,max:1})` × 4 (prevX, prevY, currX, currY) + `fc.float()` for prior `velocityCurrent`
    - Assert `0 <= result <= 1` after one animate step
    - **Property 2: Velocity signal is always in [0, 1]**
    - **Validates: Requirements 1.3, 1.4**
  - [x]* 12.2 Write property test for Property 3: Velocity below threshold is zeroed
    - Use `fc.float({min:0,max:0.00099})` for tiny Euclidean distance
    - Assert `velocityRaw === 0` before smoothing
    - **Property 3: Velocity below threshold is zeroed**
    - **Validates: Requirement 1.2**
  - [x]* 12.3 Write property test for Property 4: Reduced motion suppresses all motion uniforms
    - Use `fc.array(fc.float({min:0,max:1}))` for mouse positions
    - Assert `uVelocityIntensity === 0`, `uReducedMotion === 1`, `driftCurrent === 0` when `reduceMotion = true`
    - **Property 4: Reduced motion suppresses all motion uniforms**
    - **Validates: Requirements 1.6, 7.6, 9.1, 9.2, 9.3**
  - [x]* 12.4 Write property test for Property 5: Mood colour lerp converges toward target
    - Use `fc.float({min:0,max:1})` × 6 for current/next RGB channels
    - After 200 steps of `updateMoodUniforms(uniforms, 0.04)`, assert `|current - next| < 0.001` per channel
    - **Property 5: Mood colour lerp converges toward target**
    - **Validates: Requirements 4.3, 6.3**
  - [x]* 12.5 Write property test for Property 6: Mood colour lerp continues under reduced motion
    - Use `fc.float({min:0,max:1})` × 6 for current/next RGB
    - Assert that after one `updateMoodUniforms` call with `reduceMotion = true`, current has moved toward next
    - **Property 6: Mood colour lerp continues under reduced motion**
    - **Validates: Requirement 9.4**
  - _Requirements: 1.2, 1.3, 1.4, 1.6, 4.3, 6.3, 7.6, 9.1, 9.2, 9.3, 9.4_

- [x] 13. Write unit tests for mood palette data and behavioural contracts
  - [x]* 13.1 Write unit tests for mood palette data correctness
    - Assert each of the five rooms in `STORE_ROOMS` has a `mood` property
    - Assert each `mood` has `background`, `blob1`, `blob2` as valid CSS hex strings matching `/^#[0-9a-f]{6}$/i`
    - Assert exact hex values for all five rooms match the spec table
    - _Requirements: 3.1, 3.2_
  - [x]* 13.2 Write unit tests for drift direction on `goToRoom()`
    - Call `goToRoom('lounge', false, false)` (forward), assert `driftTarget === 0.04`
    - Call `goToRoom('lounge', false, true)` (backward), assert `driftTarget === -0.04`
    - Call `goToRoom('storefront', true, false)` (initial), assert `driftTarget === 0` and `driftCurrent === 0`
    - _Requirements: 7.2, 7.3, 7.7_
  - [x]* 13.3 Write unit tests for crossfade completion behaviour
    - Simulate the `t >= 1` block in `_startRoomTextureLoad()`, assert `driftTarget === 0`
    - Assert current colour uniforms equal next colour uniforms after `snapCurrentToNext()`
    - _Requirements: 6.3, 7.4_
  - [x]* 13.4 Write unit tests for `initImmersiveScene()` uniform initialisation
    - Assert `uniforms.uTime.value === 0.0` after init
    - Assert `uniforms.uBgColor.value` matches storefront `background` hex
    - Assert `uniforms.uBgColorNext.value` matches storefront `background` hex
    - _Requirements: 4.4, 8.1_
  - [x]* 13.5 Write unit test for `goToRoom()` updating next colour uniforms
    - Call `goToRoom('lounge', false, false)`, assert `uniforms.uBgColorNext.value` matches lounge `background` hex `#0f0a08`
    - _Requirements: 4.2_
  - [x]* 13.6 Write regression unit tests for existing uniforms
    - Run one `animate()` step, assert `uniforms.uScrollOffset`, `uniforms.uAtmosphericMood`, `uniforms.uTiltOffsetX`, `uniforms.uTiltOffsetY` are unchanged from their pre-step values
    - _Requirements: 10.3, 10.4_

- [x] 14. Verification — re-run exploration tests (they must now pass)
  - Re-run the full test suite and confirm all four exploration tests (E1–E4) now pass
  - E1 passes: `uniforms.uTime` exists and is incremented correctly
  - E2 passes: `uniforms.uVelocityIntensity` exists and is in [0, 1]
  - E3 passes: all five rooms in `STORE_ROOMS` have valid `mood` properties
  - E4 passes: `uniforms.uBgColor`, `uniforms.uBlob1Color`, `uniforms.uBlob2Color` exist
  - If any exploration test still fails, return to the relevant implementation task and fix before proceeding
  - _Requirements: 1.5, 2.1, 3.1, 4.1, 8.1_

- [x] 15. Final checkpoint — full test suite green
  - Run `npm test` and ensure all tests pass (exploration, preservation, property, and unit tests)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Exploration tests (Task 1) are written to FAIL on the current codebase — this is intentional and confirms the gaps exist before implementation begins
- Preservation tests (Task 2) are written to PASS on the current codebase — they capture arithmetic contracts that must remain true throughout
- `atmosphere.js` must be loaded before `webgl-engine.js` in `theme.liquid` (Task 10) because `initImmersiveScene()` calls `ImmersiveAtmosphere.initMoodUniforms()` during scene setup
- `uTime` is already declared in `fragmentShaderSource` but is not wired as a uniform — Task 6 fixes this gap (Requirement 8)
- All new per-frame work (velocity, colour lerp, drift) uses scalar arithmetic only — no array allocations or object creation in the hot path (Requirement 11.2)
- The `driftTarget` and `driftCurrent` variables live in `webgl-engine.js` scope; `goToRoom()` in `room-manager.js` writes to them directly (they share the same global scope in the browser)
- Property tests use a minimum of 100 fast-check iterations each
- Each property test is tagged with `// Feature: immersive-room-atmosphere, Property N: <property_text>`
