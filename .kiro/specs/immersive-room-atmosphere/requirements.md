# Requirements Document

## Introduction

The **immersive-room-atmosphere** feature adds three layered atmospheric enhancements to the Shahana Collection immersive store at `/pages/immersive`. Together they make room navigation feel alive: a velocity signal that reacts to how fast the user moves between rooms, per-room GLSL mood backgrounds that replace the current solid/texture background with animated, colour-matched environments, and a brief vertical drift on room entry that gives the plane a sense of physical momentum.

All three enhancements are implemented inside the existing Three.js WebGL pipeline (`assets/immersive/core/webgl-engine.js`, `assets/immersive/core/room-manager.js`) and the `animate()` loop. No new third-party libraries are introduced. All motion effects respect `prefers-reduced-motion`.

---

## Glossary

- **Animate_Loop**: The `animate()` function in `assets/immersive/core/webgl-engine.js` that runs every animation frame via `requestAnimationFrame`.
- **Fragment_Shader**: The GLSL fragment shader (`fragmentShaderSource`) compiled into the Three.js `ShaderMaterial` applied to `planeMesh`.
- **Mood_Palette**: A per-room colour descriptor `{ background: '#hex', blob1: '#hex', blob2: '#hex' }` stored alongside each room's entry in `STORE_ROOMS`.
- **Plane_Mesh**: The full-screen `THREE.Mesh` (`planeMesh`) that carries the depth-parallax shader.
- **Room_Manager**: `assets/immersive/core/room-manager.js`, which owns `STORE_ROOMS`, `goToRoom()`, and `_startRoomTextureLoad()`.
- **State_Manager**: `assets/immersive/core/state-manager.js`, which owns `immersiveState`.
- **Uniforms**: The `uniforms` object passed to the `ShaderMaterial`; currently contains `uTexture1/2`, `uDepth1/2`, `uTransitionProgress`, `uMouse`, `uTiltOffsetX/Y`, `uParallaxStrength`, `uScrollOffset`, `uScrollVignette`, `uScrollChroma`, `uAtmosphericMood`, and `uTime`.
- **Velocity_Signal**: A per-frame scalar derived from the rate of change of the mouse/camera position, smoothed with lerp and clamped to a maximum value.
- **Drift**: A transient vertical offset applied to `planeMesh.position.y` when entering a new room, which decays back to zero over time.
- **Reduced_Motion**: The CSS media feature `(prefers-reduced-motion: reduce)`, already read into the `reduceMotion` boolean at startup.
- **uTime**: An existing `float` uniform incremented each frame; already used by the breathing and film-grain effects in the Fragment_Shader.

---

## Requirements

---

### Requirement 1: Velocity Signal Computation

**User Story:** As a visitor navigating the immersive store, I want the scene to subtly react to how fast I move so that the experience feels physically responsive rather than static.

#### Acceptance Criteria

1. THE Animate_Loop SHALL compute a raw velocity scalar each frame as the Euclidean distance between the current and previous smoothed mouse position (`mouseCurrent`).
2. WHEN the raw velocity is below a threshold of 0.001 (normalised units), THE Animate_Loop SHALL treat the velocity as zero to prevent flicker from floating-point noise.
3. THE Animate_Loop SHALL smooth the raw velocity toward a `velocityCurrent` target using a lerp factor of approximately 0.15 each frame.
4. THE Animate_Loop SHALL clamp `velocityCurrent` to a maximum value of 1.0 after smoothing.
5. THE Animate_Loop SHALL expose `velocityCurrent` as a `uVelocityIntensity` uniform on the `ShaderMaterial` each frame.
6. WHERE `reduceMotion` is `true`, THE Animate_Loop SHALL set `uVelocityIntensity` to 0.0 and skip velocity computation.

---

### Requirement 2: Velocity-Driven Brightness Lift in the Fragment Shader

**User Story:** As a visitor, I want fast navigation to produce a subtle brightening of the scene so that movement feels energetic and rewarding.

#### Acceptance Criteria

1. THE Fragment_Shader SHALL accept a `uVelocityIntensity` uniform of type `float`.
2. WHEN `uVelocityIntensity` is greater than 0.0, THE Fragment_Shader SHALL apply a brightness lift to the final composited colour by multiplying `color.rgb` by `(1.0 + uVelocityIntensity * 0.12)` before writing `gl_FragColor`.
3. THE Fragment_Shader SHALL apply the velocity brightness lift after the existing breathing effect and before the film-grain step, preserving the existing effect order.
4. WHEN `uVelocityIntensity` is 0.0, THE Fragment_Shader SHALL produce output identical to the current shader with no brightness change.

---

### Requirement 3: Mood Palette Definition per Room

**User Story:** As a developer configuring the immersive store, I want each room to carry a colour palette so that the background shader can match the room's editorial mood.

#### Acceptance Criteria

1. THE Room_Manager SHALL define a `mood` property on each entry in `STORE_ROOMS` with the shape `{ background: string, blob1: string, blob2: string }` where each value is a CSS hex colour string.
2. THE Room_Manager SHALL define the following default palettes:

   | Room key | `background` | `blob1` | `blob2` |
   |---|---|---|---|
   | `storefront` | `#0a0a0f` | `#1a1025` | `#0d0d1a` |
   | `lounge` | `#0f0a08` | `#2a1a10` | `#1a0f0a` |
   | `designer_houses` | `#080a12` | `#101828` | `#0a1020` |
   | `occasions` | `#0a0810` | `#1e1028` | `#120a1e` |
   | `featured_collections` | `#0a0a08` | `#1e1e10` | `#141408` |

3. THE Room_Manager SHALL expose the `mood` property so that `goToRoom()` can read it when initiating a transition.

---

### Requirement 4: Mood Palette Uniforms

**User Story:** As a developer, I want the Fragment Shader to receive the current and target room palettes as uniforms so that it can blend between them during transitions.

#### Acceptance Criteria

1. THE Animate_Loop SHALL maintain two sets of colour uniforms: `uBgColor`, `uBlob1Color`, `uBlob2Color` (current room palette) and `uBgColorNext`, `uBlob1ColorNext`, `uBlob2ColorNext` (incoming room palette), each of type `vec3` in the Fragment_Shader.
2. WHEN `goToRoom()` is called, THE Room_Manager SHALL update the "next" colour uniforms (`uBgColorNext`, `uBlob1ColorNext`, `uBlob2ColorNext`) to the incoming room's Mood_Palette before the WebGL crossfade begins.
3. THE Animate_Loop SHALL lerp `uBgColor`, `uBlob1Color`, `uBlob2Color` toward their respective "next" values each frame using a lerp factor of 0.04, so that palette transitions are gradual and independent of the texture crossfade.
4. WHEN the immersive scene is first initialised, THE Animate_Loop SHALL set both current and next colour uniforms to the `storefront` room's Mood_Palette.

---

### Requirement 5: GLSL Mood Background Layer

**User Story:** As a visitor, I want each room to have a distinctive atmospheric background — not just a texture swap — so that moving between rooms feels like entering a different world.

#### Acceptance Criteria

1. THE Fragment_Shader SHALL render a flat background colour using `uBgColor` as the base layer before sampling the room textures.
2. THE Fragment_Shader SHALL render two animated soft blobs using `smoothstep` circles whose centres are animated with `uTime` at different frequencies and amplitudes, coloured by `uBlob1Color` and `uBlob2Color` respectively.
3. THE Fragment_Shader SHALL composite the blob layer over the background colour using additive blending capped at 1.0 per channel.
4. THE Fragment_Shader SHALL composite the room texture (the existing parallax-sampled `color`) over the mood background using the texture's alpha or a fixed blend weight, so that the mood background is visible only where the texture is dark or transparent.
5. THE Fragment_Shader SHALL apply the velocity brightness lift (Requirement 2) to the final composited colour that includes both the mood background and the room texture.
6. THE Fragment_Shader SHALL apply the existing film-grain noise after the velocity brightness lift, consistent with the current effect order.
7. WHERE `reduceMotion` is `true`, THE Fragment_Shader SHALL render the mood background with static blob positions (no `uTime` animation) by receiving a `uReducedMotion` uniform of type `float` (0.0 = animate, 1.0 = static).

---

### Requirement 6: Mood Background During Room Transitions

**User Story:** As a visitor, I want the background mood to smoothly blend from one room's palette to the next during navigation so that transitions feel seamless rather than abrupt.

#### Acceptance Criteria

1. WHEN `uTransitionProgress` is between 0.0 and 1.0, THE Fragment_Shader SHALL interpolate the background colour using `mix(uBgColor, uBgColorNext, uTransitionProgress)`.
2. WHEN `uTransitionProgress` is between 0.0 and 1.0, THE Fragment_Shader SHALL interpolate each blob colour using `mix(uBlob1Color, uBlob1ColorNext, uTransitionProgress)` and `mix(uBlob2Color, uBlob2ColorNext, uTransitionProgress)` respectively.
3. WHEN `uTransitionProgress` reaches 1.0 and the texture crossfade completes, THE Animate_Loop SHALL snap the current colour uniforms to the next colour values and reset the lerp target so no further blending occurs.

---

### Requirement 7: Scroll Drift on Room Entry

**User Story:** As a visitor navigating forward or backward through rooms, I want the plane to briefly drift vertically in the direction of travel so that navigation feels physically grounded.

#### Acceptance Criteria

1. THE Room_Manager SHALL track a `driftTarget` scalar (Y-axis, normalised units) and THE Animate_Loop SHALL maintain a `driftCurrent` scalar that lerps toward `driftTarget` each frame with a factor of 0.08.
2. WHEN `goToRoom()` is called with a room that is deeper in the navigation stack (forward navigation), THE Room_Manager SHALL set `driftTarget` to `+0.04` (upward drift in clip space).
3. WHEN `goToRoom()` is called with `fromBack = true` (backward navigation), THE Room_Manager SHALL set `driftTarget` to `-0.04` (downward drift in clip space).
4. WHEN the room texture crossfade completes (i.e. `uTransitionProgress` reaches 1.0), THE Room_Manager SHALL reset `driftTarget` to `0.0` so the plane returns to centre.
5. THE Animate_Loop SHALL apply `driftCurrent` to `planeMesh.position.y` each frame.
6. WHERE `reduceMotion` is `true`, THE Room_Manager SHALL set `driftTarget` to `0.0` immediately on any room navigation call and THE Animate_Loop SHALL set `driftCurrent` to `0.0` without lerping.
7. WHEN `goToRoom()` is called for the initial room load (`initial = true`), THE Room_Manager SHALL set `driftTarget` to `0.0` and THE Animate_Loop SHALL set `driftCurrent` to `0.0` with no drift applied.

---

### Requirement 8: uTime Uniform Availability

**User Story:** As a developer, I want the `uTime` uniform to be reliably incremented each frame so that all time-based shader effects (breathing, film grain, blob animation) share a single consistent clock.

#### Acceptance Criteria

1. THE Animate_Loop SHALL declare `uTime` as a uniform in the `uniforms` object initialised in `initImmersiveScene()` with an initial value of `0.0`.
2. THE Animate_Loop SHALL increment `uniforms.uTime.value` by the elapsed time in seconds since the previous frame each frame, using `performance.now()` to compute the delta.
3. THE Fragment_Shader SHALL declare `uniform float uTime` and use it for the breathing effect, film-grain offset, and blob position animation.

> **Note:** `uTime` is already present in the current `fragmentShaderSource` declaration but is not yet wired as a uniform in `initImmersiveScene()`. This requirement formalises and completes that wiring.

---

### Requirement 9: Reduced Motion Compliance

**User Story:** As a visitor who has enabled `prefers-reduced-motion`, I want all new atmospheric motion effects to be suppressed so that the experience remains accessible.

#### Acceptance Criteria

1. WHERE `reduceMotion` is `true`, THE Animate_Loop SHALL set `uVelocityIntensity` to `0.0` (Requirement 1, criterion 6).
2. WHERE `reduceMotion` is `true`, THE Animate_Loop SHALL pass `uReducedMotion = 1.0` to the Fragment_Shader so blob animation is frozen (Requirement 5, criterion 7).
3. WHERE `reduceMotion` is `true`, THE Room_Manager SHALL set `driftTarget` to `0.0` and THE Animate_Loop SHALL set `driftCurrent` to `0.0` immediately, skipping the lerp (Requirement 7, criterion 6).
4. WHERE `reduceMotion` is `true`, THE Animate_Loop SHALL still update the mood palette colour uniforms via lerp so that colour transitions remain smooth — colour change is not considered motion.

---

### Requirement 10: No Regression to Existing Effects

**User Story:** As a developer, I want the new atmospheric effects to be additive so that the existing parallax, scroll-sinking, chromatic aberration, vignette, breathing, and film-grain effects continue to work exactly as before.

#### Acceptance Criteria

1. THE Fragment_Shader SHALL preserve the existing `parallaxUv()` function signature and behaviour unchanged.
2. THE Fragment_Shader SHALL preserve the existing chromatic aberration, vignette, breathing, and film-grain steps in their current positions in the render pipeline, with the velocity brightness lift inserted between the breathing step and the film-grain step.
3. THE Animate_Loop SHALL preserve the existing `uScrollOffset`, `uScrollVignette`, `uScrollChroma`, and `uAtmosphericMood` uniform update logic unchanged.
4. THE Animate_Loop SHALL preserve the existing tilt-control (`uTiltOffsetX`, `uTiltOffsetY`) update logic unchanged.
5. WHEN WebGL is not supported, THE Animate_Loop SHALL not execute and THE Room_Manager SHALL fall back to `showWebGLFallback()` as before, with no new failure modes introduced.

---

### Requirement 11: Performance Constraints

**User Story:** As a visitor on a mid-range device, I want the new atmospheric effects to have negligible frame-time impact so that the experience remains smooth at 60 fps.

#### Acceptance Criteria

1. THE Fragment_Shader SHALL add no texture samples beyond those already present in the current shader; the mood background and blobs SHALL be computed analytically using `smoothstep` and trigonometric functions only.
2. THE Animate_Loop SHALL perform all new per-frame CPU work (velocity computation, colour lerp, drift lerp) using scalar arithmetic only — no array allocations, no DOM queries, and no object creation per frame.
3. THE Animate_Loop SHALL not introduce any additional `requestAnimationFrame` callbacks; all new per-frame logic SHALL execute inside the existing `animate()` function body.
