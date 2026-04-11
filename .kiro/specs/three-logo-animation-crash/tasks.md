# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - `window.THREE` undefined after IIFE-only execution
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate that the IIFE pattern in `assets/three.min.js` never assigns to `window.THREE`
  - **Scoped PBT Approach**: The bug is deterministic — scope the property to the concrete failing case: evaluate the IIFE pattern and assert `window.THREE === undefined`
  - Create `tests/three-logo-animation-crash.property.test.js`
  - Use `fast-check` with `fc.property` to generate arbitrary execution contexts (represented as plain objects) and assert that, for all of them, evaluating only the IIFE body (without the `window.THREE = THREE` append line) leaves `window.THREE` as `undefined`
  - Simulate the IIFE pattern in jsdom: `var THREE = (function(t){ return t; })({}); ` — assert `window.THREE === undefined` (confirms root cause: `var` at file scope inside an IIFE does not leak to `window`)
  - Also assert that calling `new THREE.PerspectiveCamera(45, 1, 0.1, 100)` in a context where `window.THREE` is `undefined` throws a `TypeError` or `ReferenceError` (confirms the crash path)
  - Run test on UNFIXED code (before appending `window.THREE = THREE;` to `assets/three.min.js`)
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists)
  - Document counterexamples found (e.g. `window.THREE` is `undefined` after IIFE; `new THREE.PerspectiveCamera(...)` throws)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - `!window.THREE` guard behavior is identical before and after fix for all falsy inputs
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: `initLogoAnimation()` with `window.THREE = undefined` returns early without throwing (guard `if (!window.THREE) return` fires correctly)
  - Observe on UNFIXED code: `initImmersiveScene()` with `window.THREE = undefined` calls `showWebGLFallback` and does not attempt to construct a renderer
  - Load `assets/immersive-store.js` into jsdom (using `fs.readFileSync` + `vm.runInContext` or `eval` in the test environment, similar to the pattern in `tests/glass-panel.property.test.js`)
  - Use `fast-check` to generate arbitrary falsy values for `window.THREE`: `fc.constantFrom(undefined, null, false, 0, '')` — for each, assert:
    - `initLogoAnimation()` does not throw (returns early via guard)
    - `initImmersiveScene()` does not throw (calls fallback path)
  - Verify these tests PASS on UNFIXED code (confirms baseline behavior to preserve)
  - After fix: re-run to confirm tests still pass (no regressions introduced by the one-line append)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.4_

- [x] 3. Fix: append `window.THREE = THREE;` to `assets/three.min.js`

  - [x] 3.1 Implement the fix
    - Open `assets/three.min.js`
    - Confirm the current last line ends with `...Object.defineProperty(t,"__esModule",{value:!0}),t}({});`
    - Append exactly one new line at the end of the file: `window.THREE = THREE;`
    - No other files need changing — `layout/theme.liquid` load order is already correct, `immersive-store.js` guards are already correct
    - _Bug_Condition: `typeof window.THREE === 'undefined'` at the time `immersive-store.js` executes_
    - _Expected_Behavior: after fix, `typeof window.THREE.PerspectiveCamera === 'function'` is true before any subsequently-loaded script runs_
    - _Preservation: all `!window.THREE` fallback guards in `initImmersiveScene` and `initLogoAnimation` must continue to function correctly for genuinely-absent Three.js_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Write fix-checking tests and verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - `window.THREE` is populated and `PerspectiveCamera` is a constructor after fix
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior; when it passes it confirms the fix works
    - Additionally, add fix-checking assertions in the same test file:
      - Evaluate the fixed `three.min.js` content (IIFE + `window.THREE = THREE;`) in jsdom using `vm.runInContext` or `fs.readFileSync` + `eval`
      - Assert `typeof window.THREE !== 'undefined'`
      - Assert `typeof window.THREE.PerspectiveCamera === 'function'`
      - Assert `typeof window.THREE.WebGLRenderer === 'function'`
      - Assert `typeof window.THREE.Scene === 'function'`
      - Assert `initLogoAnimation()` proceeds past the guard when a `#logo-canvas` element and `data-logo-url` are present (no `TypeError` thrown)
      - Assert `initImmersiveScene()` proceeds past the `!window.THREE` guard (does not call `showWebGLFallback`) when `window.THREE` is populated
    - Run bug condition exploration test from task 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - `!window.THREE` guard behavior unchanged after fix
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from task 2 against the fixed codebase
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions — the one-line append is additive only)
    - Confirm that for all falsy `window.THREE` values, both `initLogoAnimation` and `initImmersiveScene` still degrade gracefully without throwing

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite: `npm test`
  - Confirm `tests/three-logo-animation-crash.property.test.js` passes completely
  - Confirm no regressions in existing test files (`tests/glass-panel.property.test.js`, `tests/bridge-behavior.unit.test.js`, etc.)
  - Ensure all tests pass; ask the user if questions arise
