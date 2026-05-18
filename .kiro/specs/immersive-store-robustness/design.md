# Immersive Store Robustness Bugfix Design

## Overview

This bugfix addresses two critical issues in the immersive 3D store's texture management system:

1. **Texture disposal error handling**: The `disposeGalleryStage()` function calls `tex.dispose()` without error handling, which could crash the application if texture disposal fails.

2. **Texture load timeout**: The texture load timeout is set to 45 seconds, which is excessively long for users on slow connections, leading to poor user experience.

The fix implements minimal, targeted changes to improve robustness without altering the core behavior of successful operations.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - texture disposal without try-catch protection and texture load timeout set to 45000ms
- **Property (P)**: The desired behavior - texture disposal wrapped in try-catch with dev-only logging, and timeout reduced to 15000ms
- **Preservation**: Existing behavior for successful operations and other error cases that must remain unchanged
- **disposeGalleryStage()**: The function in `assets/immersive-core.js` that disposes textures and scene objects when switching rooms
- **loadRoomTextures()**: The function in `assets/immersive-core.js` that loads base and depth map textures for a room
- **textureCache**: The array that caches loaded textures to avoid redundant network requests
- **MAX_CACHED_TEXTURES**: The maximum number of texture entries to keep in cache (currently 2)

## Bug Details

### Bug Condition

The bug manifests when:

1. `disposeGalleryStage()` is called during room transitions and calls `tex.dispose()` without error handling, potentially crashing the application if disposal throws an error
2. `loadRoomTextures()` uses a 45000ms timeout for texture loading, causing excessive delays for users on slow connections

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type void (function execution context)
  OUTPUT: boolean
  
  RETURN (functionName === 'disposeGalleryStage' AND tex.dispose() called without try-catch)
         OR (functionName === 'loadRoomTextures' AND timeout === 45000)
END FUNCTION
```

### Examples

- **Example 1 - Texture disposal crash**: When switching from a room with WebGL gallery textures to another room, if `tex.dispose()` throws an error (e.g., texture already disposed, WebGL context lost), the application crashes without try-catch protection
- **Example 2 - Excessive timeout delay**: When loading textures on a slow connection (e.g., 2G), users wait 45 seconds before seeing an error, instead of a more reasonable 15-second timeout
- **Example 3 - Cache eviction crash**: When the texture cache exceeds `MAX_CACHED_TEXTURES` and evicts the oldest entry, if disposal of the cached textures fails, the application crashes

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Successful texture disposal continues to work normally without logging (only logs on failure with dev-only warning)
- Successful texture loading continues to cache textures and invoke the callback
- Error handling for network failures (non-timeout) continues to work through the existing `onError` callback
- Texture cache eviction logic continues to remove oldest entries when exceeding `MAX_CACHED_TEXTURES`

**Scope:**
All inputs that do NOT involve texture disposal or timeout configuration should be completely unaffected by this fix. This includes:
- Room transitions that succeed without errors
- Texture loading that completes within the timeout period
- All other immersive store functionality (parallax, navigation, hotspots, etc.)

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Missing Error Handling in Texture Disposal**: The `disposeGalleryStage()` function iterates over `state.textures` and calls `tex.dispose()` without wrapping in try-catch
   - This is a defensive programming oversight - dispose operations can fail for various reasons (context loss, already disposed, etc.)
   - The code does have try-catch for cache eviction (lines ~1750-1757) but not for the main texture disposal loop

2. **Excessive Timeout Value**: The `loadRoomTextures()` function uses a 45000ms timeout for texture loading
   - This was likely set conservatively to handle slow connections but is too long for good UX
   - 15000ms is a more reasonable balance between allowing slow connections and not blocking users indefinitely

## Correctness Properties

Property 1: Bug Condition - Texture Disposal and Timeout Robustness

_For any_ execution where `disposeGalleryStage()` is called or `loadRoomTextures()` is invoked, the fixed code SHALL:
- Wrap `tex.dispose()` calls in try-catch blocks to prevent crashes
- Log warnings only when `window.__IMMERSIVE_DEV__` is true and disposal fails
- Use a 15000ms timeout for texture loading instead of 45000ms

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Successful Operations and Error Handling

_For any_ execution where texture operations succeed or fail with non-timeout errors, the fixed code SHALL:
- Continue to dispose textures normally on success (no change in success path)
- Continue to cache textures and invoke callbacks on successful loading
- Continue to report network errors through the existing `onError` callback
- Preserve all existing behavior for non-buggy inputs

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

**File**: `assets/immersive-core.js`

**Function 1**: `disposeGalleryStage()` (around line ~237)

**Specific Changes**:
1. **Texture disposal error handling**: Wrap `tex.dispose()` in try-catch with dev-only logging
   - The code already has try-catch for cache eviction (lines ~1750-1757)
   - Need to add similar protection for the main texture disposal loop (lines ~237-245)
   - Use `window.__IMMERSIVE_DEV__` guard for dev-only warning logs

**Function 2**: `loadRoomTextures()` (around line ~1720)

**Specific Changes**:
1. **Reduce timeout value**: Change timeout from 45000ms to 15000ms
   - Line ~1729: `}, 45000);` → `}, 15000);`
   - This is a simple numeric value change

### Implementation Details

**Change 1 - Texture Disposal (disposeGalleryStage function)**:
```javascript
// Before (lines ~237-245):
if (state.textures) {
  state.textures.forEach(function (tex) {
    if (tex) {
      tex.dispose();  // No error handling - could crash
    }
  });
}

// After:
if (state.textures) {
  state.textures.forEach(function (tex) {
    if (tex) {
      try {
        tex.dispose();
      } catch (e) {
        if (window.__IMMERSIVE_DEV__) {
          console.warn('[Immersive] Texture disposal failed:', tex, e);
        }
      }
    }
  });
}
```

**Change 2 - Timeout Reduction (loadRoomTextures function)**:
```javascript
// Before (line ~1729):
var timeoutId = setTimeout(function () {
  if (!loaded.base || !loaded.depth) {
    onError('timeout');
  }
}, 45000);

// After:
var timeoutId = setTimeout(function () {
  if (!loaded.base || !loaded.depth) {
    onError('timeout');
  }
}, 15000);
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify the bug exists on current code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Confirm the bug exists on current code before implementing the fix. Verify that texture disposal can crash and that the 45-second timeout is excessive.

**Test Plan**: Write tests that simulate texture disposal failures and verify timeout behavior. Run these tests on the CURRENT code to observe failures.

**Test Cases**:
1. **Texture Disposal Crash Test**: Simulate a texture that throws an error on dispose (will fail/crash on current code)
2. **Timeout Delay Test**: Verify the 45000ms timeout is set (will show excessive delay on current code)
3. **Cache Eviction Test**: Test cache eviction when exceeding MAX_CACHED_TEXTURES (may crash on current code)

**Expected Counterexamples**:
- Texture disposal throws uncaught error when dispose() fails
- Users experience 45-second delay on slow connections before timeout

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode**:
```
FOR ALL texture disposal operations DO
  result := disposeGalleryStage_fixed()
  ASSERT no crash occurs
  ASSERT warning logged only when window.__IMMERSIVE_DEV__ is true
END FOR

FOR ALL texture loading operations DO
  result := loadRoomTextures_fixed()
  ASSERT timeout occurs after 15000ms, not 45000ms
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode**:
```
FOR ALL successful texture disposal operations DO
  ASSERT disposeGalleryStage_original() = disposeGalleryStage_fixed()
END FOR

FOR ALL successful texture loading operations DO
  ASSERT loadRoomTextures_original() = loadRoomTextures_fixed()
END FOR

FOR ALL network error cases (non-timeout) DO
  ASSERT onError callback behavior unchanged
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on CURRENT code first for successful operations, then write tests to verify this continues after fix.

**Test Cases**:
1. **Successful Disposal Preservation**: Verify textures dispose normally without errors (no crash, no warning)
2. **Successful Loading Preservation**: Verify textures load successfully and are cached
3. **Network Error Preservation**: Verify network errors (non-timeout) still trigger the onError callback
4. **Cache Behavior Preservation**: Verify cache eviction and texture reuse continues to work

### Unit Tests

- Test texture disposal with normal textures (should succeed)
- Test texture disposal with mocked textures that throw errors (should not crash)
- Test texture loading with valid URLs (should succeed and cache)
- Test texture loading with invalid URLs (should trigger onError)
- Test timeout behavior (should trigger timeout after 15000ms)

### Property-Based Tests

- Generate random texture states and verify disposal never crashes
- Generate random room configurations and verify timeout is always 15000ms
- Generate random cache states and verify cache eviction behavior unchanged
- Test that dev-only logging only occurs when `window.__IMMERSIVE_DEV__` is true

### Integration Tests

- Test full room transition with gallery stage disposal (no crash)
- Test texture loading on slow simulated connections (15-second timeout)
- Test multiple rapid room transitions (cache behavior preserved)
- Test error recovery after texture loading failure (onError callback)
