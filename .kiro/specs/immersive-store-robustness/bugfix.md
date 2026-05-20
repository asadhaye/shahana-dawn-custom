# Bugfix Requirements Document

## Introduction

This bugfix addresses multiple critical issues in the immersive 3D store:

1. **Missing script loading**: `immersive-store.js` is not loaded on the immersive template, causing `trackImmersiveEvent is not defined` errors

2. **Shader uniforms initialization**: The `uniforms` object in `immersive-core.js` is undefined when code tries to access `uScrollOffset`, `uScrollVignette`, etc., before the shader is initialized

3. **Texture disposal error handling**: The `disposeGalleryStage()` function calls `tex.dispose()` without error handling, which could crash the application if texture disposal fails.

4. **Texture load timeout**: The texture load timeout is set to 45 seconds, which is excessively long for users on slow connections, leading to poor user experience.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the immersive page loads THEN the system throws `Uncaught ReferenceError: trackImmersiveEvent is not defined` because `immersive-store.js` is not loaded

1.2 WHEN the immersive scene initializes and attempts to set scroll uniforms THEN the system throws `Uncaught TypeError: Cannot read properties of undefined (reading 'uScrollOffset')` because `uniforms` is undefined before shader initialization

1.3 WHEN `disposeGalleryStage()` is called for a room THEN the system may crash if `tex.dispose()` throws an error during texture disposal

1.4 WHEN texture loading takes longer than 45 seconds THEN the system waits the full 45 seconds before timing out, causing excessive delays for users on slow connections

### Expected Behavior (Correct)

2.1 WHEN the immersive page loads THEN the system SHALL load `immersive-store.js` before any code that references it

2.2 WHEN the immersive scene initializes and attempts to set scroll uniforms THEN the system SHALL check if `uniforms` is defined before accessing its properties

2.3 WHEN `disposeGalleryStage()` is called for a room THEN the system SHALL wrap `tex.dispose()` in a try-catch block to prevent crashes

2.4 WHEN texture loading takes longer than 15 seconds THEN the system SHALL timeout and report an error after 15 seconds instead of 45 seconds

### Unchanged Behavior (Regression Prevention)

3.1 WHEN texture disposal succeeds without errors THEN the system SHALL CONTINUE TO dispose textures normally and log success

3.2 WHEN texture loading completes within 15 seconds THEN the system SHALL CONTINUE TO load textures successfully and cache them

3.3 WHEN texture loading fails due to network errors (not timeout) THEN the system SHALL CONTINUE TO report the error through the existing error callback

3.4 WHEN `trackImmersiveEvent` is called THEN the system SHALL CONTINUE TO send events to GA4 and Meta Pixel as before

## Implementation Plan

### 1. Add `immersive-store.js` to template script loading

**File**: `layout/theme.liquid`

**Change**: Add `immersive-store.js` to the immersive template script loading order, before `immersive-core.js`:

```liquid
{%- if template == 'page.immersive' -%}
  <script src="{{ 'three.min.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive-store.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive-core.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive-init.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive-features.js' | asset_url }}" defer></script>
  <script src="{{ 'immersive-luxury-refinements.js' | asset_url }}" defer></script>
{%- endif -%}
```

**Rationale**: `immersive-store.js` contains `trackImmersiveEvent` and other shared utilities that `immersive-core.js` and other scripts depend on.

### 2. Guard uniforms access in `immersive-core.js`

**File**: `assets/immersive-core.js`

**Change**: Add a check for `uniforms` before accessing its properties:

```javascript
// Before (line ~1491):
uniforms.uScrollOffset.value = 0;
uniforms.uScrollVignette.value = 0;
uniforms.uScrollChroma.value = 0;

// After:
if (uniforms) {
  uniforms.uScrollOffset.value = 0;
  uniforms.uScrollVignette.value = 0;
  uniforms.uScrollChroma.value = 0;
}
```

**Rationale**: Prevents crashes when the code runs before the shader is initialized.

### 3. Add error handling to `disposeGalleryStage()`

**File**: `assets/immersive-core.js` (or wherever `disposeGalleryStage` is defined)

**Change**: Wrap `tex.dispose()` in try-catch:

```javascript
function disposeGalleryStage(roomKey) {
  var gallery = galleryStageRegistry[roomKey];
  if (!gallery) return;
  
  if (gallery.texture) {
    try {
      gallery.texture.dispose();
    } catch (e) {
      console.warn('Failed to dispose texture for room', roomKey, e);
    }
    gallery.texture = null;
  }
  
  if (gallery.material) {
    try {
      gallery.material.dispose();
    } catch (e) {
      console.warn('Failed to dispose material for room', roomKey, e);
    }
    gallery.material = null;
  }
  
  delete galleryStageRegistry[roomKey];
}
```

**Rationale**: Prevents crashes if texture disposal fails for any reason.

### 4. Reduce texture load timeout

**File**: `assets/immersive-core.js` (or wherever texture load timeout is defined)

**Change**: Reduce timeout from 45 seconds to 15 seconds:

```javascript
// Before:
var TEXTURE_LOAD_TIMEOUT = 45000;

// After:
var TEXTURE_LOAD_TIMEOUT = 15000;
```

**Rationale**: 45 seconds is excessive for users on slow connections; 15 seconds provides a better balance between allowing time for large textures to load and not blocking the UI indefinitely.

## Testing Checklist

- [ ] No `trackImmersiveEvent is not defined` errors on immersive page load
- [ ] No `Cannot read properties of undefined (reading 'uScrollOffset')` errors during scene initialization
- [ ] Texture disposal errors are logged but don't crash the application
- [ ] Texture load timeout occurs after 15 seconds instead of 45 seconds
- [ ] Analytics events still fire correctly via `trackImmersiveEvent`
- [ ] All existing tests continue to pass
