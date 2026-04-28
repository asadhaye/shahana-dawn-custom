# Design Document: immersive-room-atmosphere

## Overview

This feature adds three layered atmospheric enhancements to the Shahana Collection immersive store at `/pages/immersive`:

1. **Velocity signal** — a per-frame scalar derived from mouse movement speed that drives a subtle brightness lift in the fragment shader, making navigation feel physically responsive.
2. **Per-room mood backgrounds** — each room carries a colour palette (`background`, `blob1`, `blob2`) that feeds a new GLSL layer rendered analytically (no extra texture samples) beneath the room texture. Two animated soft blobs drift across the background, cross-fading between palettes during room transitions.
3. **Entry drift** — when navigating forward or backward between rooms, `planeMesh.position.y` briefly offsets in the direction of travel and decays back to zero, giving the plane a sense of physical momentum.

All three effects are additive — they extend the existing parallax, scroll-sinking, chromatic aberration, vignette, breathing, and film-grain pipeline without altering any existing behaviour. All motion effects respect `prefers-reduced-motion`. The feature also formalises the pre-existing `uTime` gap (declared in the fragment shader but never wired as a uniform).

### Key design decisions

- **No new `requestAnimationFrame` callbacks.** All new per-frame work runs inside the existing `animate()` function body.
- **No allocations in the hot path.** Velocity, colour lerp, and drift are all scalar or `THREE.Color.lerp()` operations — no object creation per frame.
- **New module: `assets/immersive/core/atmosphere.js`.** Mood colour state is extracted into a dedicated module with a clean public API (`window.ImmersiveAtmosphere`), following the existing modular pattern (`var` declarations, `window.X = {}` at end). This keeps `webgl-engine.js` focused on rendering and `room-manager.js` focused on navigation.
- **Vanilla JS, no bundler.** All new code uses `var` declarations throughout, consistent with the existing codebase.
- **`uTime` fix is part of this feature.** The uniform is added to `initImmersiveScene()` and incremented using `performance.now()` delta for frame-rate independence.

---

## Architecture

The feature touches three existing files and introduces one new file:

```
assets/immersive/core/
├── webgl-engine.js      ← add uTime/velocity/drift uniforms; extend animate(); extend fragment shader
├── room-manager.js      ← add mood palettes to STORE_ROOMS; extend goToRoom() and _startRoomTextureLoad()
└── atmosphere.js        ← NEW: mood colour state, lerp logic, public ImmersiveAtmosphere API
```

### Data flow

```
goToRoom(roomKey, initial, fromBack)
  │
  ├─ reads STORE_ROOMS[roomKey].mood
  ├─ calls ImmersiveAtmosphere.setNextMood(mood)   → updates bgColorNext/blob1ColorNext/blob2ColorNext
  └─ sets driftTarget (+0.04 / -0.04 / 0.0)

animate() — runs every frame
  │
  ├─ 1. Mouse lerp → uniforms.uMouse
  ├─ 2. [NEW] uTime increment (performance.now() delta / 1000)
  ├─ 3. [NEW] Velocity: raw = Euclidean(mouseCurrent - prevMouse), smooth lerp 0.15, clamp 1.0
  │         → uniforms.uVelocityIntensity
  ├─ 4. [NEW] Mood colour lerp (factor 0.04) via ImmersiveAtmosphere.updateMoodUniforms()
  │         → uniforms.uBgColor / uBlob1Color / uBlob2Color
  ├─ 5. [NEW] Drift lerp (factor 0.08): driftCurrent → driftTarget
  │         → planeMesh.position.y
  ├─ 6. Hotspot proximity scaling (unchanged)
  ├─ 7. Tilt control (unchanged)
  ├─ 8. Scroll-linked sinking (unchanged)
  └─ 9. renderer.render(scene, camera)

Fragment shader — runs every pixel every frame
  │
  ├─ [NEW] Mood background layer (uBgColor + blob1/blob2 animated by uTime)
  ├─ parallaxUv() × 2 (unchanged)
  ├─ Chromatic aberration (unchanged)
  ├─ mix(color1, color2, t) crossfade (unchanged)
  ├─ Breathing: sin(uTime * 0.8) * 0.015 + 0.985 (unchanged, now uTime is wired)
  ├─ [NEW] Velocity brightness lift: color.rgb *= (1.0 + uVelocityIntensity * 0.12)
  ├─ Film grain: noise(vUv + fract(uTime)) * 0.012 (unchanged)
  ├─ Edge vignette (unchanged)
  └─ Atmospheric mood gold tint (unchanged)
```

---

## Components and Interfaces

### `assets/immersive/core/atmosphere.js` (new file)

Owns all mood colour state. Follows the existing module pattern: `var` declarations at the top, `window.ImmersiveAtmosphere = { ... }` at the bottom.

**Module-level state:**
```javascript
var bgColorCurrent    = new THREE.Color();
var blob1ColorCurrent = new THREE.Color();
var blob2ColorCurrent = new THREE.Color();
var bgColorNext       = new THREE.Color();
var blob1ColorNext    = new THREE.Color();
var blob2ColorNext    = new THREE.Color();
```

**Public API (`window.ImmersiveAtmosphere`):**

| Method | Signature | Description |
|---|---|---|
| `initMoodUniforms` | `(uniforms, initialMood)` | Sets both current and next uniforms to `initialMood` palette. Called once from `initImmersiveScene()`. |
| `setNextMood` | `(mood)` | Updates `bgColorNext`, `blob1ColorNext`, `blob2ColorNext` from a `{ background, blob1, blob2 }` palette object. Called from `goToRoom()`. |
| `updateMoodUniforms` | `(uniforms, lerpFactor)` | Lerps current colours toward next, copies to uniforms. Called every frame from `animate()`. |
| `snapCurrentToNext` | `(uniforms)` | Immediately sets current = next and updates uniforms. Called when crossfade completes (t ≥ 1). |

### `assets/immersive/core/webgl-engine.js` — changes

**New module-level variables:**
```javascript
var velocityRaw      = 0;
var velocityCurrent  = 0;
var prevMouseX       = 0.5;
var prevMouseY       = 0.5;
var driftTarget      = 0;
var driftCurrent     = 0;
var lastFrameTime    = 0;   // repurposed from dev FPS monitor to uTime delta
```

**New uniforms in `initImmersiveScene()`:**
```javascript
uTime:             { value: 0.0 },
uVelocityIntensity:{ value: 0.0 },
uReducedMotion:    { value: reduceMotion ? 1.0 : 0.0 },
uBgColor:          { value: new THREE.Color('#0a0a0f') },
uBlob1Color:       { value: new THREE.Color('#1a1025') },
uBlob2Color:       { value: new THREE.Color('#0d0d1a') },
uBgColorNext:      { value: new THREE.Color('#0a0a0f') },
uBlob1ColorNext:   { value: new THREE.Color('#1a1025') },
uBlob2ColorNext:   { value: new THREE.Color('#0d0d1a') },
```

**`animate()` additions** (inserted after mouse lerp, before hotspot proximity):
```javascript
// uTime increment
var now = performance.now();
var delta = (now - lastFrameTime) / 1000.0;
lastFrameTime = now;
uniforms.uTime.value += delta;

// Velocity signal
if (!reduceMotion) {
  var dvx = mouseCurrent.x - prevMouseX;
  var dvy = mouseCurrent.y - prevMouseY;
  velocityRaw = Math.sqrt(dvx * dvx + dvy * dvy);
  if (velocityRaw < 0.001) velocityRaw = 0;
  velocityCurrent += (velocityRaw - velocityCurrent) * 0.15;
  if (velocityCurrent > 1.0) velocityCurrent = 1.0;
  uniforms.uVelocityIntensity.value = velocityCurrent;
} else {
  velocityCurrent = 0;
  uniforms.uVelocityIntensity.value = 0.0;
}
prevMouseX = mouseCurrent.x;
prevMouseY = mouseCurrent.y;

// Mood colour lerp
ImmersiveAtmosphere.updateMoodUniforms(uniforms, 0.04);

// Drift lerp
if (!reduceMotion) {
  driftCurrent += (driftTarget - driftCurrent) * 0.08;
} else {
  driftCurrent = 0;
}
if (planeMesh) planeMesh.position.y = driftCurrent;
```

### `assets/immersive/core/room-manager.js` — changes

**`STORE_ROOMS` additions** — each room gains a `mood` property:
```javascript
storefront: {
  // ... existing texture URLs and hotspots ...
  mood: { background: '#0a0a0f', blob1: '#1a1025', blob2: '#0d0d1a' }
},
// ... (all 5 rooms, see Data Models section)
```

**`goToRoom()` additions** (after state updates, before `_startRoomTextureLoad`):
```javascript
if (!initial) {
  var mood = STORE_ROOMS[roomKey] && STORE_ROOMS[roomKey].mood;
  if (mood) ImmersiveAtmosphere.setNextMood(mood);

  if (!reduceMotion) {
    driftTarget = fromBack ? -0.04 : 0.04;
  } else {
    driftTarget = 0;
    driftCurrent = 0;
  }
}
```

**`_startRoomTextureLoad()` additions** (inside the `t >= 1` block, after texture swap):
```javascript
// Snap colour uniforms — no further lerp needed
ImmersiveAtmosphere.snapCurrentToNext(uniforms);
// Reset drift
driftTarget = 0;
```

---

## Data Models

### Mood palette type

```javascript
// { background: string, blob1: string, blob2: string }
// Each value is a CSS hex colour string (e.g. '#0a0a0f')
```

### STORE_ROOMS mood palettes

| Room key | `background` | `blob1` | `blob2` |
|---|---|---|---|
| `storefront` | `#0a0a0f` | `#1a1025` | `#0d0d1a` |
| `lounge` | `#0f0a08` | `#2a1a10` | `#1a0f0a` |
| `designer_houses` | `#080a12` | `#101828` | `#0a1020` |
| `occasions` | `#0a0810` | `#1e1028` | `#120a1e` |
| `featured_collections` | `#0a0a08` | `#1e1e10` | `#141408` |

All palettes are very dark (near-black) with subtle hue shifts matching each room's editorial mood. They are visible only where the room texture is dark or transparent, so they never overpower the photography.

### Fragment shader uniform additions

| Uniform | GLSL type | Description |
|---|---|---|
| `uTime` | `float` | Elapsed seconds since scene init (fixes pre-existing gap) |
| `uVelocityIntensity` | `float` | Smoothed, clamped mouse velocity [0, 1] |
| `uReducedMotion` | `float` | 1.0 if `prefers-reduced-motion`, else 0.0 |
| `uBgColor` | `vec3` | Current room background colour |
| `uBlob1Color` | `vec3` | Current room blob 1 colour |
| `uBlob2Color` | `vec3` | Current room blob 2 colour |
| `uBgColorNext` | `vec3` | Incoming room background colour |
| `uBlob1ColorNext` | `vec3` | Incoming room blob 1 colour |
| `uBlob2ColorNext` | `vec3` | Incoming room blob 2 colour |

### Fragment shader — mood background layer (GLSL pseudocode)

```glsl
// New uniforms (added to fragmentShaderSource declarations)
uniform vec3  uBgColor;
uniform vec3  uBlob1Color;
uniform vec3  uBlob2Color;
uniform vec3  uBgColorNext;
uniform vec3  uBlob1ColorNext;
uniform vec3  uBlob2ColorNext;
uniform float uVelocityIntensity;
uniform float uReducedMotion;

// Inside main(), BEFORE parallaxUv() calls:

// Blend palette via transition progress
vec3 bgBlended    = mix(uBgColor,    uBgColorNext,    t);
vec3 blob1Blended = mix(uBlob1Color, uBlob1ColorNext, t);
vec3 blob2Blended = mix(uBlob2Color, uBlob2ColorNext, t);

// Animated blob centres — frozen when reduceMotion=1.0
float animTime = uTime * (1.0 - uReducedMotion);
vec2 blob1Center = vec2(
  0.3 + sin(animTime * 0.23) * 0.15,
  0.4 + cos(animTime * 0.17) * 0.12
);
vec2 blob2Center = vec2(
  0.7 + cos(animTime * 0.19) * 0.13,
  0.6 + sin(animTime * 0.21) * 0.14
);

// Soft blob shapes via smoothstep
float blob1 = 1.0 - smoothstep(0.0, 0.45, length(vUv - blob1Center));
float blob2 = 1.0 - smoothstep(0.0, 0.40, length(vUv - blob2Center));

// Composite: background + additive blobs, capped at 1.0
vec3 moodBg = bgBlended
  + clamp(blob1Blended * blob1, 0.0, 1.0)
  + clamp(blob2Blended * blob2, 0.0, 1.0);
moodBg = clamp(moodBg, 0.0, 1.0);

// ... parallaxUv(), chromatic aberration, crossfade → vec4 color ...

// Composite room texture over mood background using luminance as blend weight
float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
color.rgb = mix(moodBg, color.rgb, luma);

// Breathing (unchanged)
float breathing = sin(uTime * 0.8) * 0.015 + 0.985;
color.rgb *= breathing;

// [NEW] Velocity brightness lift (after breathing, before film grain)
color.rgb *= (1.0 + uVelocityIntensity * 0.12);

// Film grain (unchanged)
float n = noise(vUv + fract(uTime));
color.rgb += (n - 0.5) * 0.012;

// Edge vignette (unchanged)
// Atmospheric mood gold tint (unchanged)
// gl_FragColor = color;
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This feature is well-suited to property-based testing. The core computations — velocity smoothing, colour lerp, drift lerp, additive blending, and mix interpolation — are all pure functions with clear input/output behaviour and large input spaces where 100+ iterations will surface edge cases that 2–3 examples would miss.

The project uses **Jest + fast-check** (see `tech.md`).

---

### Property Reflection

Before writing properties, reviewing the prework for redundancy:

- **1.3 (lerp formula) and 4.3 (colour lerp) and 7.1 (drift lerp)** all test the same lerp arithmetic pattern. They can be unified into a single "lerp step" property that covers all three usages.
- **1.4 (velocity clamp)** is distinct — it tests the upper-bound invariant after smoothing, not the lerp formula itself. Keep separate.
- **5.3 (additive blend cap) and 5.4 (luminance blend weight)** are distinct operations. Keep separate.
- **6.1 and 6.2** both test `mix()` interpolation — same mathematical property. Unify into one "palette mix" property.
- **1.6 and 9.2** both test reduced-motion zeroing of different uniforms. Combine into one "reduced motion suppresses all motion uniforms" property.
- **7.6** (drift zeroed under reduced motion) is covered by the combined reduced-motion property.
- **8.2** (uTime increment) is a distinct arithmetic property. Keep.
- **4.2** (goToRoom updates next uniforms) is a distinct behavioural property. Keep.
- **9.4** (colour lerp continues under reduced motion) is a distinct property. Keep.

After reflection: **8 distinct properties** covering all testable acceptance criteria.

---

### Property 1: Lerp step advances toward target

*For any* current scalar value, target scalar value, and lerp factor in (0, 1), a single lerp step produces a new value equal to `current + (target - current) * factor`, and the result is strictly between `current` and `target` (or equal to `target` when they are the same).

**Validates: Requirements 1.3, 4.3, 7.1**

---

### Property 2: Velocity signal is always in [0, 1]

*For any* previous mouse position and current mouse position (both in [0, 1] normalised space), and any prior `velocityCurrent` value, after one animate step the resulting `uniforms.uVelocityIntensity.value` is always in the closed interval [0.0, 1.0].

**Validates: Requirements 1.3, 1.4**

---

### Property 3: Velocity below threshold is zeroed

*For any* mouse movement whose Euclidean distance is strictly less than 0.001 (normalised units), the raw velocity fed into the smoothing step is 0.0, preventing floating-point noise from accumulating in `velocityCurrent`.

**Validates: Requirement 1.2**

---

### Property 4: Reduced motion suppresses all motion uniforms

*For any* sequence of mouse positions and room navigation calls, when `reduceMotion` is `true`, `uniforms.uVelocityIntensity.value` is always 0.0, `uniforms.uReducedMotion.value` is always 1.0, and `driftCurrent` is always 0.0.

**Validates: Requirements 1.6, 7.6, 9.1, 9.2, 9.3**

---

### Property 5: Mood colour lerp converges toward target

*For any* current colour (r, g, b) and next colour (r, g, b), after repeated applications of `updateMoodUniforms(uniforms, 0.04)`, the current colour monotonically approaches the next colour on every channel, and after sufficient iterations the distance between current and next is arbitrarily small.

**Validates: Requirements 4.3, 6.3**

---

### Property 6: Mood colour lerp continues under reduced motion

*For any* current and next colour pair, when `reduceMotion` is `true`, calling `updateMoodUniforms()` still advances the current colour toward the next colour — colour transitions are not suppressed by reduced motion.

**Validates: Requirement 9.4**

---

### Property 7: Additive blob composite is capped at 1.0 per channel

*For any* background colour (r, g, b) and blob contribution (r, g, b), the result of additive compositing `clamp(bg + blob, 0.0, 1.0)` is always in [0.0, 1.0] per channel, regardless of input magnitudes.

**Validates: Requirement 5.3**

---

### Property 8: uTime increments by elapsed seconds

*For any* positive frame delta (in milliseconds), `uniforms.uTime.value` increases by exactly `delta / 1000.0` seconds, and `uTime` is always non-decreasing across frames.

**Validates: Requirement 8.2**

---

## Error Handling

### WebGL not supported

No change to existing behaviour. `initImmersiveScene()` calls `showWebGLFallback()` before any new uniforms are created. The new code paths are never reached.

### `STORE_ROOMS[roomKey].mood` missing

`goToRoom()` guards with `var mood = STORE_ROOMS[roomKey] && STORE_ROOMS[roomKey].mood`. If `mood` is falsy (e.g. a room added without a palette), `ImmersiveAtmosphere.setNextMood()` is not called and the current palette remains unchanged. No error is thrown; the scene continues with the previous mood.

### `ImmersiveAtmosphere` not loaded

`goToRoom()` and `animate()` guard with `typeof ImmersiveAtmosphere !== 'undefined'` before calling into the module. If `atmosphere.js` fails to load (network error), the scene degrades gracefully: no mood backgrounds, no colour transitions, but all existing effects continue working.

### `THREE.Color` hex parsing

`THREE.Color.set(hexString)` silently clamps invalid values to black. If a palette entry contains a malformed hex string, the colour defaults to `#000000` — a safe fallback that is visually indistinguishable from the near-black palettes.

### `performance.now()` unavailable

`performance.now()` is available in all supported browsers (Chrome 90+, Firefox 88+, Safari 14+). No fallback is needed. `lastFrameTime` is initialised to `0`; the first frame will produce a large delta (time since page load), so `uTime` will jump on the first frame. This is acceptable — the breathing and film-grain effects are continuous and the jump is imperceptible.

### Drift on initial load

`goToRoom()` guards `driftTarget` assignment with `if (!initial)`. On the first room load, `driftTarget` and `driftCurrent` remain `0`, so `planeMesh.position.y` is unaffected.

---

## Testing Strategy

### Dual testing approach

Unit tests cover specific examples, edge cases, and error conditions. Property tests verify universal invariants across many generated inputs. Both are necessary: unit tests catch concrete bugs in specific scenarios; property tests verify general correctness across the full input space.

### Property-based testing library

**fast-check** (already in the project per `tech.md`). Each property test runs a minimum of **100 iterations**.

Tag format for each property test:
```
// Feature: immersive-room-atmosphere, Property N: <property_text>
```

### Test file location

`tests/immersive-room-atmosphere.test.js`

### Property tests (fast-check)

Each of the 8 correctness properties maps to one `fc.assert(fc.property(...))` test:

| Test | fast-check arbitraries | Assertion |
|---|---|---|
| P1: Lerp step | `fc.float()` × 3 (current, target, factor in (0,1)) | `result === current + (target - current) * factor` |
| P2: Velocity in [0,1] | `fc.float({min:0,max:1})` × 4 (prevX, prevY, currX, currY) + `fc.float()` (velocityCurrent) | `0 <= result <= 1` |
| P3: Threshold zeroing | `fc.float({min:0,max:0.0009})` (tiny distance) | `velocityRaw === 0` |
| P4: Reduced motion | `fc.array(fc.float({min:0,max:1}))` (mouse positions) | `uVelocityIntensity === 0 && uReducedMotion === 1 && driftCurrent === 0` |
| P5: Colour convergence | `fc.float({min:0,max:1})` × 6 (current/next RGB) | After 200 steps, `|current - next| < 0.001` per channel |
| P6: Colour lerp under reduceMotion | `fc.float({min:0,max:1})` × 6 | After one step, current has moved toward next |
| P7: Additive cap | `fc.float({min:0,max:2})` × 6 (bg + blob, may exceed 1) | `clamp(bg + blob) <= 1.0` per channel |
| P8: uTime increment | `fc.float({min:1,max:100})` (delta ms) | `uTime increases by delta/1000` |

### Unit tests (Jest example-based)

- **Mood palette data**: assert each room in `STORE_ROOMS` has a `mood` with valid hex strings for `background`, `blob1`, `blob2`.
- **Palette values**: assert exact hex values for all 5 rooms match the spec table.
- **`goToRoom()` forward drift**: call with `fromBack=false`, assert `driftTarget === 0.04`.
- **`goToRoom()` backward drift**: call with `fromBack=true`, assert `driftTarget === -0.04`.
- **`goToRoom()` initial**: call with `initial=true`, assert `driftTarget === 0` and `driftCurrent === 0`.
- **Crossfade completion**: simulate `t >= 1` block, assert `driftTarget === 0` and current colour uniforms equal next colour uniforms.
- **`initImmersiveScene()` uniforms**: assert `uniforms.uTime.value === 0.0` and both current/next colour uniforms equal storefront palette.
- **`goToRoom()` updates next uniforms**: call with `roomKey = 'lounge'`, assert `uBgColorNext` matches lounge palette.
- **Regression — existing uniforms unchanged**: run one animate step, assert `uScrollOffset`, `uAtmosphericMood`, `uTiltOffsetX`, `uTiltOffsetY` are unchanged.

### Integration / visual tests

- Manual QA: navigate all 5 rooms, verify mood background is visible and cross-fades smoothly.
- Manual QA: move mouse quickly, verify subtle brightness lift.
- Manual QA: navigate forward and backward, verify vertical drift.
- Manual QA: enable `prefers-reduced-motion` in OS settings, verify all motion effects are suppressed while colour transitions still occur.
- Manual QA: disable WebGL (block canvas context), verify fallback renders correctly with no JS errors.
