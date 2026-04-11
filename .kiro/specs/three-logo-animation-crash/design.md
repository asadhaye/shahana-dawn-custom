# THREE.js Logo Animation Crash — Bugfix Design

## Overview

`assets/three.min.js` is bundled as an IIFE: `var THREE = function(t){...}({})`. This assigns the
Three.js namespace to a **file-local** variable `THREE` only. The file ends with `t}({})` — there
is no `window.THREE = THREE` statement anywhere in the file.

`assets/immersive-store.js` is a separate `defer`-loaded script. It has no access to the local
`THREE` variable from the other file. When `safeBindImmersiveInit` fires its `requestAnimationFrame`
callback and calls `initLogoAnimation()`, the guard `if (!window.THREE) return` passes silently on
the first line — but the real crash happens at `new THREE.PerspectiveCamera(...)` because `THREE`
is referenced as a bare identifier that resolves to `undefined` in the global scope.

The fix is a single-line append to `assets/three.min.js`:

```js
window.THREE = THREE;
```

This exposes the already-constructed namespace as a global, making it available to every
subsequently-loaded script on `page.immersive` without altering Three.js internals.

---

## Glossary

- **Bug_Condition (C)**: `typeof window.THREE === 'undefined'` at the moment `initLogoAnimation`
  (or any other Three.js consumer in `immersive-store.js`) executes.
- **Property (P)**: After the fix, `window.THREE` is a fully-populated object containing all
  Three.js constructors; `initLogoAnimation` constructs a `PerspectiveCamera` without error.
- **Preservation**: All existing Three.js usage in `initImmersiveScene`, `initLogoAnimation`, and
  the rest of `immersive-store.js` must continue to work identically. The `!window.THREE` fallback
  guards in both functions must continue to bail out gracefully when Three.js is genuinely absent.
- **`three.min.js`**: `assets/three.min.js` — local copy of Three.js r183, loaded with `defer` on
  `page.immersive` only. Uses the IIFE pattern `var THREE = function(t){...}({})`.
- **`immersive-store.js`**: `assets/immersive-store.js` — WebGL engine and UI controller. Loaded
  with `defer` after `three.min.js` on `page.immersive` only.
- **`safeBindImmersiveInit`**: Entry-point function in `immersive-store.js` that defers all init
  calls to the next animation frame via `requestAnimationFrame`.
- **`initLogoAnimation`**: Function in `immersive-store.js` (~line 2806) that constructs a
  Three.js logo scene. First line: `if (!window.THREE) return;`.
- **`initImmersiveScene`**: Function in `immersive-store.js` that constructs the main WebGL
  parallax scene. Contains `if (!window.THREE || !isWebGLSupported())` fallback guard.

---

## Bug Details

### Bug Condition

The bug manifests when `immersive-store.js` executes on `page.immersive` and `window.THREE` is
`undefined` because `three.min.js` never assigned its local `THREE` variable to `window.THREE`.
Every call site that references `THREE.*` constructors crashes with
`TypeError: THREE.PerspectiveCamera is not a constructor` (or similar).

**Formal Specification:**

```
FUNCTION isBugCondition(X)
  INPUT: X — execution context when immersive-store.js runs
  OUTPUT: boolean

  RETURN typeof window.THREE === 'undefined'
END FUNCTION
```

### Examples

- **Crash case**: Page loads `/pages/immersive`. `three.min.js` executes, populates local `THREE`.
  `immersive-store.js` executes. `safeBindImmersiveInit` fires. `requestAnimationFrame` callback
  calls `initLogoAnimation()`. `window.THREE` is `undefined`. The guard `if (!window.THREE) return`
  on line 2808 **does not fire** because the bare identifier `THREE` in the same file also resolves
  to `undefined` — the guard passes. `new THREE.PerspectiveCamera(45, w/h, 0.1, 100)` throws
  `TypeError`. Canvas stays blank. All subsequent init is aborted.
- **Crash case**: Same page load. `initImmersiveScene` is called. `!window.THREE` is `true`, so
  `showWebGLFallback` is called — the main scene never initialises.
- **Fixed case**: After appending `window.THREE = THREE;` to `three.min.js`, `window.THREE` is
  populated before `immersive-store.js` runs (both scripts are `defer`; `three.min.js` is listed
  first in `theme.liquid`). `initLogoAnimation` constructs `PerspectiveCamera` without error.
- **Edge case — Three.js absent**: If `three.min.js` fails to load (network error), `window.THREE`
  remains `undefined`. Both `initImmersiveScene` and `initLogoAnimation` bail out via their
  `!window.THREE` guards. This graceful-degradation path is unchanged by the fix.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- `initImmersiveScene` must continue to check `!window.THREE || !isWebGLSupported()` and call
  `showWebGLFallback` when Three.js is genuinely absent.
- `initLogoAnimation` must continue to check `if (!window.THREE) return` and bail out silently
  when Three.js is not available (e.g. test environments, load failure).
- All Three.js constructors used by `initImmersiveScene` (`WebGLRenderer`, `Scene`,
  `OrthographicCamera`, `ShaderMaterial`, `Mesh`, `PlaneGeometry`, `TextureLoader`, `DataTexture`,
  `Vector2`, `LinearFilter`, `ReinhardToneMapping`) must remain accessible on `window.THREE`.
- All Three.js constructors used by `initLogoAnimation` (`WebGLRenderer`, `Scene`,
  `PerspectiveCamera`, `AmbientLight`, `DirectionalLight`, `PointLight`, `Group`, `TextureLoader`,
  `PlaneGeometry`, `MeshStandardMaterial`, `Color`, `DoubleSide`, `BufferGeometry`,
  `ReinhardToneMapping`, `Vector2`) must remain accessible on `window.THREE`.
- `three.min.js` must NOT be loaded on any template other than `page.immersive` — the conditional
  in `layout/theme.liquid` is unchanged.
- On non-`page.immersive` templates, `window.THREE` must remain `undefined` (the script is not
  loaded there at all).

**Scope:**

All inputs where `isBugCondition` is false — i.e. where `window.THREE` is already defined (e.g.
a test stub, a CDN fallback, or a future upgrade) — must produce identical behavior before and
after the fix. The one-line append is additive only; it does not alter any Three.js internals.

---

## Hypothesized Root Cause

Based on the bug description and confirmed by inspecting the file:

1. **IIFE scope isolation (confirmed root cause)**: `three.min.js` opens with
   `var THREE = function(t){...` and closes with `t}({})`. The `THREE` variable is declared with
   `var` at file scope inside the IIFE's outer wrapper — it is local to that script execution
   context and never assigned to `window`. In a browser with `defer`, each script file runs in its
   own top-level scope; `var` declarations do not leak to `window` when the script is a module or
   when the IIFE pattern is used this way.

2. **`defer` ordering is correct but insufficient**: `theme.liquid` loads `three.min.js` before
   `immersive-store.js`, both with `defer`. Execution order is guaranteed. The problem is not
   timing — it is that `window.THREE` is never set regardless of order.

3. **Guard condition misleads**: `initLogoAnimation` has `if (!window.THREE) return` on line 2808,
   which looks like it should protect against this. However, the bare `THREE` identifier used in
   the rest of the function body (e.g. `new THREE.PerspectiveCamera(...)`) also resolves to
   `undefined` in the global scope — so the guard fires correctly only when `window.THREE` is
   explicitly checked. The crash occurs because the guard passes (returns early) but the rest of
   the function still executes... wait — re-reading: the guard IS `if (!window.THREE) return`, so
   it should bail. The actual crash path is: `window.THREE` is `undefined`, `!window.THREE` is
   `true`, so `initLogoAnimation` returns early — but `initImmersiveScene` also checks
   `!window.THREE` and calls `showWebGLFallback`, meaning the main scene never renders either.
   Both functions are broken by the missing global.

4. **No CDN fallback**: Shopify's MIME policy blocks CDN-loaded `.js` files for Three.js, so a
   CDN `<script>` tag is not a viable alternative. The local copy must expose the global.

---

## Correctness Properties

Property 1: Bug Condition — `window.THREE` is populated after `three.min.js` executes

_For any_ execution context where `isBugCondition(X)` holds (i.e. `window.THREE` is `undefined`
before the fix), the fixed `three.min.js` SHALL assign the fully-constructed Three.js namespace to
`window.THREE` so that `typeof window.THREE.PerspectiveCamera === 'function'` is true by the time
any subsequently-loaded script runs.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Non-buggy contexts are unaffected

_For any_ execution context where `isBugCondition(X)` does NOT hold (i.e. `window.THREE` is
already defined — e.g. a test stub or a future CDN load), the fixed `three.min.js` SHALL produce
the same observable behavior as the original: `window.THREE` retains its existing value (the
append `window.THREE = THREE` simply overwrites with the same or equivalent object), and all
`!window.THREE` fallback guards in `initImmersiveScene` and `initLogoAnimation` continue to
function correctly.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

---

## Fix Implementation

### Changes Required

**File**: `assets/three.min.js`

**Location**: End of file (after the closing `t}({})` of the IIFE)

**Specific Change**:

Append exactly one line:

```js
window.THREE = THREE;
```

The current last line of the file is:

```
...Object.defineProperty(t,"__esModule",{value:!0}),t}({});
```

After the fix, the file ends with:

```
...Object.defineProperty(t,"__esModule",{value:!0}),t}({});
window.THREE = THREE;
```

**Why this works**: The IIFE assigns its return value to the local `var THREE`. After the IIFE
completes, `THREE` is in scope at the top level of the script file. Appending
`window.THREE = THREE;` at that same top level assigns the already-constructed namespace to the
global `window` object, making it accessible to all subsequently-loaded scripts.

**Why no other files need changing**:
- `layout/theme.liquid`: load order is already correct (`three.min.js` before `immersive-store.js`,
  both `defer`). No change needed.
- `immersive-store.js`: the `!window.THREE` guards in `initImmersiveScene` and `initLogoAnimation`
  are correct and must be preserved as-is. No change needed.
- No build step, no bundler — the append is the complete fix.

---

## Testing Strategy

### Validation Approach

Two-phase: first run exploratory tests on the **unfixed** code to surface counterexamples and
confirm the root cause; then apply the fix and run fix-checking + preservation-checking tests.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug on unfixed code. Confirm that
`window.THREE` is `undefined` when `immersive-store.js` runs, and that this causes crashes in
both `initImmersiveScene` and `initLogoAnimation`.

**Test Plan**: In a jsdom environment, simulate the script execution order: load `immersive-store.js`
without setting `window.THREE`. Call `initLogoAnimation()` and `initImmersiveScene()` directly.
Assert that they crash or degrade incorrectly.

**Test Cases**:

1. **`initLogoAnimation` with `window.THREE = undefined`**: Call `initLogoAnimation()` with a
   mock `#logo-canvas` element present and `window.THREE` unset. Expect the function to return
   early (guard fires) — confirming the guard works but the scene is never built. (Will pass on
   unfixed code — the guard saves us from a hard crash here, but the feature is broken.)
2. **`initImmersiveScene` with `window.THREE = undefined`**: Call `initImmersiveScene()` with
   `#immersive-canvas` present and `window.THREE` unset. Expect `showWebGLFallback` to be called
   instead of scene construction. (Will pass on unfixed code — but confirms the main scene is
   also broken.)
3. **`new THREE.PerspectiveCamera` without global**: In a raw jsdom context with no `window.THREE`,
   attempt `new THREE.PerspectiveCamera(45, 1, 0.1, 100)` — expect `ReferenceError` or
   `TypeError`. This is the actual crash that would occur if the guard were absent.
4. **`window.THREE` is `undefined` after simulated `three.min.js` load (IIFE only)**: Evaluate
   the IIFE pattern `var THREE = (function(t){return t;})({}); ` in jsdom and assert
   `window.THREE === undefined`. Confirms the root cause.

**Expected Counterexamples**:
- `window.THREE` is `undefined` after the IIFE executes — root cause confirmed.
- `initImmersiveScene` falls through to `showWebGLFallback` — main scene broken.
- `initLogoAnimation` returns early — logo animation broken.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed `three.min.js`
populates `window.THREE` correctly.

**Pseudocode:**

```
FOR ALL X WHERE isBugCondition(X) DO
  // Simulate: evaluate three.min.js IIFE + window.THREE = THREE
  result := evaluateFixedThreeMinJs(X)
  ASSERT typeof window.THREE !== 'undefined'
  ASSERT typeof window.THREE.PerspectiveCamera === 'function'
  ASSERT typeof window.THREE.WebGLRenderer === 'function'
  ASSERT typeof window.THREE.Scene === 'function'
  ASSERT no_crash(initLogoAnimation())
  ASSERT no_crash(initImmersiveScene())
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fix produces
identical behavior to the original.

**Pseudocode:**

```
FOR ALL X WHERE NOT isBugCondition(X) DO
  // window.THREE already defined (e.g. test stub)
  ASSERT window.THREE_before_fix === window.THREE_after_fix  // same object reference or equivalent
  ASSERT initImmersiveScene_original(X) = initImmersiveScene_fixed(X)
  ASSERT initLogoAnimation_original(X) = initLogoAnimation_fixed(X)
END FOR
```

**Testing Approach**: Property-based testing with `fast-check` is well-suited here because:
- We can generate many variations of `window.THREE` stub objects (with/without specific
  constructors) and verify the guards behave identically before and after the fix.
- It catches edge cases like `window.THREE = null`, `window.THREE = {}` (no constructors),
  `window.THREE = { PerspectiveCamera: undefined }`.

**Test Cases**:

1. **Guard preservation — `initLogoAnimation`**: For any value of `window.THREE` that is falsy
   (`undefined`, `null`, `false`, `0`, `""`), verify `initLogoAnimation` returns early without
   throwing. This behavior must be identical before and after the fix.
2. **Guard preservation — `initImmersiveScene`**: For any falsy `window.THREE`, verify
   `initImmersiveScene` calls `showWebGLFallback` and does not attempt to construct a renderer.
3. **Stub passthrough**: Set `window.THREE` to a minimal stub object before evaluating the fixed
   `three.min.js` append line. Verify `window.THREE` is overwritten with the real Three.js
   namespace (the append always runs; the stub is replaced). This is acceptable — on `page.immersive`
   there is no pre-existing `window.THREE` stub in production.

### Unit Tests

- Test that `window.THREE` is `undefined` when only the IIFE body runs (no append line).
- Test that `window.THREE` is a populated object when the append line is present.
- Test that `window.THREE.PerspectiveCamera` is a constructor function after the fix.
- Test that `initLogoAnimation` returns early (no throw) when `window.THREE` is `undefined`.
- Test that `initImmersiveScene` calls `showWebGLFallback` when `window.THREE` is `undefined`.
- Test that `initLogoAnimation` proceeds past the guard when `window.THREE` is a valid stub.

### Property-Based Tests

- Generate arbitrary falsy values for `window.THREE`; assert both guard functions return/degrade
  without throwing — behavior must be identical before and after the fix (preservation property).
- Generate arbitrary truthy stub objects for `window.THREE`; assert `initLogoAnimation` proceeds
  past the guard (fix-checking property for the guard path).
- Generate the full set of Three.js constructor names required by `initLogoAnimation` and
  `initImmersiveScene`; assert all are present on `window.THREE` after the fix is applied.

### Integration Tests

- Simulate full `page.immersive` load sequence in jsdom: evaluate `three.min.js` (with fix), then
  evaluate `immersive-store.js`, then call `safeBindImmersiveInit`. Assert no `TypeError` is thrown
  and `window.THREE` is defined throughout.
- Verify that the `defer` ordering guarantee (three.min.js before immersive-store.js) combined
  with the fix means `window.THREE` is always set before any consumer runs.
- Verify that on a non-`page.immersive` template (simulated by not loading `three.min.js`),
  `window.THREE` remains `undefined` and no errors occur.
