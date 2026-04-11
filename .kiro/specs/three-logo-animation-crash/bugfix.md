# Bugfix Requirements Document

## Introduction

`initLogoAnimation` crashes with `TypeError: THREE.PerspectiveCamera is not a constructor` at line ~2830 of `assets/immersive-store.js`. The crash occurs on every page load of `/pages/immersive` because `assets/three.min.js` never assigns the Three.js library to `window.THREE`. The file uses an IIFE pattern (`var THREE = function(t){...}({})`) that populates a local variable only — `immersive-store.js`, loaded as a separate `defer`ed script, has no access to that local variable and sees `THREE` as `undefined`. The crash propagates up through `safeBindImmersiveInit → requestAnimationFrame callback → initLogoAnimation`, halting the entire immersive scene initialisation.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `initLogoAnimation` is called and `window.THREE` is `undefined` (because `three.min.js` never assigns to `window.THREE`) THEN the system throws `TypeError: THREE.PerspectiveCamera is not a constructor` and crashes

1.2 WHEN `three.min.js` is loaded via `defer` before `immersive-store.js` THEN the system does NOT expose the Three.js namespace as a global (`window.THREE` remains `undefined`)

1.3 WHEN the `requestAnimationFrame` callback inside `safeBindImmersiveInit` executes `initLogoAnimation()` THEN the system crashes before the main WebGL scene (`initImmersiveScene`) can complete, leaving the canvas blank and all subsequent immersive initialisation aborted

### Expected Behavior (Correct)

2.1 WHEN `three.min.js` finishes executing THEN the system SHALL expose the Three.js namespace on `window.THREE` so that any subsequently loaded script can access `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`, and all other Three.js constructors

2.2 WHEN `initLogoAnimation` is called and `window.THREE` is defined and fully populated THEN the system SHALL construct a `THREE.PerspectiveCamera` without error and proceed with logo animation initialisation

2.3 WHEN `safeBindImmersiveInit` fires its `requestAnimationFrame` callback THEN the system SHALL complete `initImmersiveScene`, `initLogoAnimation`, and all other init calls without a `TypeError` crash

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `three.min.js` is loaded on `page.immersive` THEN the system SHALL CONTINUE TO provide all Three.js classes (`WebGLRenderer`, `Scene`, `OrthographicCamera`, `ShaderMaterial`, `Mesh`, `PlaneGeometry`, `TextureLoader`, `DataTexture`, `Vector2`, `BufferGeometry`, `PointLight`, `DirectionalLight`, `AmbientLight`, `Group`, `MeshStandardMaterial`, `Color`, `DoubleSide`, `LinearFilter`, `ReinhardToneMapping`) used by `initImmersiveScene` and the rest of `immersive-store.js`

3.2 WHEN `three.min.js` is NOT loaded (i.e. on any non-`page.immersive` template) THEN the system SHALL CONTINUE TO leave `window.THREE` undefined and `immersive-store.js` SHALL CONTINUE TO not be loaded on those pages

3.3 WHEN `initImmersiveScene` checks `!window.THREE` as a WebGL fallback guard THEN the system SHALL CONTINUE TO fall through to `showWebGLFallback` correctly when Three.js is genuinely absent

3.4 WHEN `initLogoAnimation` checks `if (!window.THREE) return` THEN the system SHALL CONTINUE TO bail out gracefully when Three.js is not available (e.g. in test environments or if the script failed to load)

---

## Bug Condition (Pseudocode)

```pascal
FUNCTION isBugCondition(X)
  INPUT: X — execution context when immersive-store.js runs
  OUTPUT: boolean

  // Bug fires when THREE is not on window at the time initLogoAnimation executes
  RETURN typeof window.THREE === 'undefined'
END FUNCTION
```

```pascal
// Property: Fix Checking
FOR ALL X WHERE isBugCondition(X) DO
  // After fix: three.min.js must assign window.THREE before immersive-store.js runs
  ASSERT typeof window.THREE !== 'undefined'
  ASSERT typeof window.THREE.PerspectiveCamera === 'function'
  ASSERT no_crash(initLogoAnimation())
END FOR
```

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  // window.THREE was already defined (e.g. CDN fallback or test stub)
  ASSERT F(X) = F'(X)  // behaviour is identical before and after fix
END FOR
```
