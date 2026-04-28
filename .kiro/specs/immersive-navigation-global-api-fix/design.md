# Immersive Navigation Global API Fix - Design Document

## Overview

This design document specifies the systematic exposure of modular JavaScript functions to the global scope to restore immersive store navigation functionality. After refactoring the codebase into modular files under `assets/immersive/`, these modules failed to expose their public APIs globally, breaking cross-module function calls and rendering the immersive store non-functional.

The fix follows the established pattern from `state-manager.js` (which already correctly exposes `window.ImmersiveStateManager`) and extends it consistently across all 24 modular files. Each module will expose its public API via a namespaced global object following the pattern `window.Immersive[ModuleName]`.

## Glossary

- **Bug_Condition (C)**: A function call fails with "TypeError: [function] is not a function" because the function is defined in a modular file but not exposed to the global scope
- **Property (P)**: All public functions from modular files are accessible via namespaced global objects (e.g., `window.ImmersiveRoomManager.goToRoom`)
- **Preservation**: Existing code that does not depend on cross-module function calls continues to work unchanged; `window.ImmersiveStateManager` remains functional
- **Module**: A JavaScript file under `assets/immersive/` that defines functions for a specific feature area
- **Public Function**: A function intended to be called from other modules or from `immersive-store.js`
- **Private Function**: A helper function prefixed with `_` that should remain locally scoped
- **Namespace**: A global object (e.g., `window.ImmersiveRoomManager`) that exposes a module's public API

## Bug Details

### Bug Condition

The bug manifests when any code attempts to call a function defined in a modular file under `assets/immersive/`. The modular refactoring extracted functions from `immersive-store.js` into separate files but failed to expose these functions globally, causing all cross-module function calls to fail.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type FunctionCall
  OUTPUT: boolean
  
  RETURN input.functionName IN [goToRoom, openProductPanel, openCollectionPanel, 
                                 enterEditorialMode, exitEditorialMode, openSearchPanel,
                                 activateGuidedMode, exitGuidedMode, trackImmersiveEvent,
                                 fetchWithCache, fetchSectionHtml, openPanel, closePanel,
                                 setupVariantButtons, setupBuyNowForm, setupImageParallax,
                                 setupVirtualTryOn, and 50+ other modular functions]
         AND input.functionDefinedIn IN [assets/immersive/**/*.js]
         AND NOT input.functionExposedGlobally
         AND input.calledFrom IN [immersive-store.js, other modular files, inline event handlers]
END FUNCTION
```

### Examples

- **Room Navigation**: Click "Designer Houses" hotspot → `goToRoom('designer_houses')` called from hotspot click handler → TypeError: goToRoom is not a function (defined in `room-manager.js` line 220, not exposed globally)

- **Search Results**: Click search result → `goToRoom('lounge')` called from `search.js` line 202 → ReferenceError: goToRoom is not defined (function not in global scope)

- **Editorial Mode**: Click "Explore Designers" hotspot → `enterEditorialMode('designer_houses', button)` called from hotspot handler → TypeError: enterEditorialMode is not a function (defined in `editorial-mode.js` line 15, not exposed globally)

- **Product Panel**: Click product card → `openProductPanel(handle, collectionHandle)` called from panel click handler → TypeError: openProductPanel is not a function (defined in `product-panel.js` line 7, not exposed globally)

- **Type Check Failure**: `immersive-store.js` line 1678 checks `typeof goToRoom === 'function'` → returns false → conditional code path fails (function exists in module but not globally accessible)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `window.ImmersiveStateManager` API must continue to provide access to `saveState`, `loadState`, `clearState`, `writeImmersivePreference`, `clearImmersivePreference`, and `readImmersivePreference` exactly as before
- Private helper functions prefixed with `_` (e.g., `_dismissWelcomeToast`, `_startRoomTextureLoad`, `_guidedAdvance`) must remain locally scoped and not be exposed globally
- WebGL rendering, texture loading, and camera management in `immersive-store.js` must continue to function without modification
- Script loading order in `layout/theme.liquid` must remain unchanged
- Local event handlers and DOM manipulation within a single module that do not call cross-module functions must continue to work
- Analytics tracking via `window.dataLayer` and `window.fbq` must continue to function
- Theme editor live preview and section reloading must continue to work
- Mobile device functionality must remain identical to desktop

**Scope:**
All code that does not involve cross-module function calls should be completely unaffected by this fix. This includes:
- Internal helper functions within a single module
- Direct DOM manipulation
- Event listener attachment
- CSS class toggling
- Local variable management

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Incomplete Refactoring**: The modular refactoring extracted functions from `immersive-store.js` into separate files but did not add global exposure statements at the end of each module

2. **Missing Export Pattern**: Only `state-manager.js` correctly implements the export pattern (`window.ImmersiveStateManager = { ... }`); all other 23 modules lack this pattern

3. **Scope Isolation**: JavaScript modules have local scope by default; without explicit `window.X = ...` assignments, functions remain inaccessible to other scripts

4. **Cross-File Dependencies**: The codebase has extensive cross-module dependencies (e.g., `search.js` calls `goToRoom` from `room-manager.js`, `editorial-mode.js` calls `goToRoom` from `room-manager.js`, hotspot handlers call functions from multiple modules)

## Correctness Properties

Property 1: Bug Condition - Global API Exposure

_For any_ function call where the function is defined in a modular file under `assets/immersive/` and is intended for external use (not prefixed with `_`), the fixed code SHALL expose that function via a namespaced global object (e.g., `window.ImmersiveRoomManager.goToRoom`), allowing the function to be called successfully from any context without TypeError or ReferenceError.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10**

Property 2: Preservation - Existing Functionality

_For any_ code that does not involve cross-module function calls (local event handlers, DOM manipulation within a single module, private helper functions, WebGL rendering), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality for non-cross-module interactions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

## Fix Implementation

### Module-by-Module API Exposure Plan

The following table specifies which functions need to be exposed from each module and what the global namespace should be:

#### Core Modules (`assets/immersive/core/`)

| File | Global Namespace | Public Functions to Expose |
|------|------------------|----------------------------|
| `room-manager.js` | `window.ImmersiveRoomManager` | `goToRoom`, `preloadRoom`, `renderHotspots`, `updateRoomBadge`, `loadRoomTextures`, `getRoomTextureUrls`, `updateCameraForMode`, `syncVisitedRooms`, `STORE_ROOMS` (constant) |
| `state-manager.js` | `window.ImmersiveStateManager` | **Already exposed correctly** - no changes needed |
| `webgl-engine.js` | `window.ImmersiveWebGL` | Functions TBD based on file content (not yet analyzed) |

#### Editorial Modules (`assets/immersive/editorial/`)

| File | Global Namespace | Public Functions to Expose |
|------|------------------|----------------------------|
| `editorial-mode.js` | `window.ImmersiveEditorial` | `enterEditorialMode`, `exitEditorialMode`, `initEditorialBackToLounge` |
| `hero-parallax.js` | `window.ImmersiveEditorialParallax` | `initEditorialHeroParallax`, `destroyEditorialHeroParallax` |
| `scroll-reveal.js` | `window.ImmersiveScrollReveal` | Functions TBD based on file content |
| `timeline.js` | `window.ImmersiveTimeline` | `loadTimelineCollection` (if public) |

#### Panel Modules (`assets/immersive/panels/`)

| File | Global Namespace | Public Functions to Expose |
|------|------------------|----------------------------|
| `collection-panel.js` | `window.ImmersiveCollectionPanel` | `openCollectionPanel` |
| `product-panel.js` | `window.ImmersiveProductPanel` | `openProductPanel`, `setupVariantButtons`, `setupBuyNowForm`, `setupMediaThumbs`, `setupImageParallax`, `setupDeliveryDates`, `setupShareButton`, `setupVirtualTryOn`, `showCartFeedback`, `showErrorFeedback` |
| `glass-panel.js` | `window.ImmersiveGlassPanel` | `openPanel`, `closePanel`, `setPanelRoomLabel`, `openOverlay`, `transitionPanelContent` |
| `wishlist-panel.js` | `window.ImmersiveWishlist` | Functions TBD based on file content |

#### Feature Modules (`assets/immersive/features/`)

| File | Global Namespace | Public Functions to Expose |
|------|------------------|----------------------------|
| `search.js` | `window.ImmersiveSearch` | `initImmersiveSearch`, `openSearchPanel` |
| `filters.js` | `window.ImmersiveFilters` | `initImmersiveFilters` (if public) |
| `gestures.js` | `window.ImmersiveGestures` | Functions TBD based on file content |
| `quick-add.js` | `window.ImmersiveQuickAdd` | Functions TBD based on file content |
| `fab.js` | `window.ImmersiveFAB` | Functions TBD based on file content |
| `limited-time.js` | `window.ImmersiveLimitedTime` | `clearLimitedTimeIntervals` (if public) |
| `room-recommender.js` | `window.ImmersiveRecommender` | `trackRoomVisit`, `getRelevantRooms` (if public) |

#### Guided Mode (`assets/immersive/guided/`)

| File | Global Namespace | Public Functions to Expose |
|------|------------------|----------------------------|
| `guided-mode.js` | `window.ImmersiveGuided` | `initGuidedMode`, `activateGuidedMode`, `exitGuidedMode`, `showGuidedPrompt`, `hideGuidedPrompt` |

#### Utility Modules (`assets/immersive/utils/`)

| File | Global Namespace | Public Functions to Expose |
|------|------------------|----------------------------|
| `fetch.js` | `window.ImmersiveFetch` | **Already exposed correctly** - `fetchWithCache`, `fetchSectionHtml`, `clearCache` |
| `analytics.js` | `window.ImmersiveAnalytics` | **Already exposed correctly** - `trackImmersiveEvent`, `trackFrictionPoint`, `getFrictionSummary` |
| `dom.js` | `window.ImmersiveDOM` | Functions TBD based on file content |
| `skeleton.js` | `window.ImmersiveSkeleton` | `renderSkeletonGrid`, `renderSkeletonProduct` (if public) |

### Naming Convention

All global namespaces follow the pattern `window.Immersive[ModuleName]` where `[ModuleName]` is the PascalCase version of the module's purpose:

- **Core modules**: `ImmersiveRoomManager`, `ImmersiveStateManager`, `ImmersiveWebGL`
- **Editorial modules**: `ImmersiveEditorial`, `ImmersiveEditorialParallax`, `ImmersiveScrollReveal`, `ImmersiveTimeline`
- **Panel modules**: `ImmersiveCollectionPanel`, `ImmersiveProductPanel`, `ImmersiveGlassPanel`, `ImmersiveWishlist`
- **Feature modules**: `ImmersiveSearch`, `ImmersiveFilters`, `ImmersiveGestures`, `ImmersiveQuickAdd`, `ImmersiveFAB`, `ImmersiveLimitedTime`, `ImmersiveRecommender`
- **Guided mode**: `ImmersiveGuided`
- **Utility modules**: `ImmersiveFetch`, `ImmersiveAnalytics`, `ImmersiveDOM`, `ImmersiveSkeleton`

### Implementation Pattern

Each module file should end with a global exposure block following this pattern:

```javascript
// At the end of the module file, after all function definitions

window.ImmersiveModuleName = {
  publicFunction1: publicFunction1,
  publicFunction2: publicFunction2,
  publicConstant: PUBLIC_CONSTANT
};
```

**Example from `room-manager.js`:**

```javascript
// ... all function definitions above ...

// Expose public API to global scope
window.ImmersiveRoomManager = {
  goToRoom: goToRoom,
  preloadRoom: preloadRoom,
  renderHotspots: renderHotspots,
  updateRoomBadge: updateRoomBadge,
  loadRoomTextures: loadRoomTextures,
  getRoomTextureUrls: getRoomTextureUrls,
  updateCameraForMode: updateCameraForMode,
  syncVisitedRooms: syncVisitedRooms,
  STORE_ROOMS: STORE_ROOMS
};
```

**Private functions (prefixed with `_`) are NOT exposed:**

```javascript
// These remain locally scoped:
// _dismissWelcomeToast
// _startRoomTextureLoad
// _ensureEditorialScriptsLoaded
// _loadScript
```

### Backward Compatibility Strategy

To ensure existing code continues to work during and after the fix:

1. **Dual Access Pattern**: For critical functions that may be called directly (without namespace), create global aliases:

```javascript
// In room-manager.js, after the namespace export:
window.ImmersiveRoomManager = {
  goToRoom: goToRoom,
  // ... other functions
};

// Create backward-compatible global aliases for critical functions
window.goToRoom = goToRoom;
window.renderHotspots = renderHotspots;
```

2. **Gradual Migration**: The dual access pattern allows:
   - Immediate fix: All code can call `goToRoom()` directly (backward compatible)
   - Future refactoring: Code can be gradually updated to use `window.ImmersiveRoomManager.goToRoom()` (namespaced)
   - No breaking changes: Both patterns work simultaneously

3. **Type Check Compatibility**: The `typeof goToRoom === 'function'` check in `immersive-store.js` line 1678 will work with both patterns

4. **Event Handler Compatibility**: Inline event handlers in Liquid templates (e.g., `onclick="goToRoom('lounge')"`) will work with the global alias pattern

### Changes Required

**For each of the 24 modular files:**

1. **Identify Public Functions**: Review the file and list all functions that:
   - Are called from other modules
   - Are called from `immersive-store.js`
   - Are called from inline event handlers
   - Do NOT start with `_` (private convention)

2. **Add Global Exposure Block**: At the end of the file, after all function definitions, add:

```javascript
// Expose public API to global scope
window.ImmersiveModuleName = {
  publicFunction1: publicFunction1,
  publicFunction2: publicFunction2
};

// Backward-compatible global aliases for critical functions
window.publicFunction1 = publicFunction1;
```

3. **Verify No Conflicts**: Ensure the namespace does not conflict with existing global variables

4. **Document the API**: Add a comment block above the exposure statement listing all exposed functions

**Example for `editorial-mode.js`:**

```javascript
/**
 * Editorial: editorial-mode
 * Public API:
 * - enterEditorialMode(roomKey, triggerEl)
 * - exitEditorialMode()
 * - initEditorialBackToLounge()
 */

// ... all function definitions ...

// Expose public API to global scope
window.ImmersiveEditorial = {
  enterEditorialMode: enterEditorialMode,
  exitEditorialMode: exitEditorialMode,
  initEditorialBackToLounge: initEditorialBackToLounge
};

// Backward-compatible global aliases
window.enterEditorialMode = enterEditorialMode;
window.exitEditorialMode = exitEditorialMode;
```

### Implementation Order

Fix modules in dependency order to minimize breakage during the fix process:

**Phase 1: Foundation (no dependencies)**
1. `utils/analytics.js` - Already fixed ✓
2. `utils/fetch.js` - Already fixed ✓
3. `utils/dom.js`
4. `utils/skeleton.js`
5. `core/state-manager.js` - Already fixed ✓

**Phase 2: Core Navigation (depends on Phase 1)**
6. `core/room-manager.js` - **CRITICAL** - Fixes `goToRoom`, `renderHotspots`
7. `core/webgl-engine.js`

**Phase 3: Panels (depends on Phase 1-2)**
8. `panels/glass-panel.js` - **CRITICAL** - Fixes `openPanel`, `closePanel`
9. `panels/product-panel.js` - **CRITICAL** - Fixes `openProductPanel`
10. `panels/collection-panel.js` - **CRITICAL** - Fixes `openCollectionPanel`
11. `panels/wishlist-panel.js`

**Phase 4: Editorial (depends on Phase 1-3)**
12. `editorial/editorial-mode.js` - **CRITICAL** - Fixes `enterEditorialMode`, `exitEditorialMode`
13. `editorial/hero-parallax.js`
14. `editorial/scroll-reveal.js`
15. `editorial/timeline.js`

**Phase 5: Features (depends on Phase 1-4)**
16. `features/search.js` - **CRITICAL** - Fixes `openSearchPanel`
17. `features/filters.js`
18. `features/gestures.js`
19. `features/quick-add.js`
20. `features/fab.js`
21. `features/limited-time.js`
22. `features/room-recommender.js`

**Phase 6: Guided Mode (depends on all previous)**
23. `guided/guided-mode.js` - Fixes `activateGuidedMode`, `exitGuidedMode`

**Rationale:**
- Phase 1 modules have no dependencies and are safe to fix first
- Phase 2 fixes core navigation, which is required by all other features
- Phase 3 fixes panels, which are required by editorial and search
- Phase 4 fixes editorial, which depends on panels and navigation
- Phase 5 fixes features, which depend on panels and navigation
- Phase 6 fixes guided mode, which orchestrates all other features

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that attempt to call modular functions from different contexts (other modules, inline handlers, type checks). Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Room Navigation Test**: Simulate hotspot click that calls `goToRoom('designer_houses')` (will fail on unfixed code with TypeError)
2. **Search Navigation Test**: Simulate search result click that calls `goToRoom('lounge')` from `search.js` (will fail on unfixed code with ReferenceError)
3. **Editorial Mode Test**: Simulate editorial hotspot click that calls `enterEditorialMode('designer_houses', button)` (will fail on unfixed code with TypeError)
4. **Product Panel Test**: Simulate product card click that calls `openProductPanel(handle, collectionHandle)` (will fail on unfixed code with TypeError)
5. **Type Check Test**: Check `typeof goToRoom === 'function'` in global scope (will return false on unfixed code)
6. **Cross-Module Call Test**: From `search.js`, attempt to call `goToRoom` (will fail on unfixed code with ReferenceError)

**Expected Counterexamples**:
- All function calls to modular functions fail with TypeError or ReferenceError
- Type checks for modular functions return false
- Possible causes: functions not exposed globally, scope isolation, missing export statements

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL functionCall WHERE isBugCondition(functionCall) DO
  result := executeFunction_fixed(functionCall)
  ASSERT result.success === true
  ASSERT result.errorType !== 'TypeError'
  ASSERT result.errorType !== 'ReferenceError'
END FOR
```

**Test Plan**: After implementing the fix, run the same test cases from exploratory checking and verify they all pass.

**Test Cases**:
1. **Room Navigation Test**: Verify `goToRoom('designer_houses')` executes successfully and navigates to the target room
2. **Search Navigation Test**: Verify `goToRoom('lounge')` called from `search.js` executes successfully
3. **Editorial Mode Test**: Verify `enterEditorialMode('designer_houses', button)` executes successfully and displays editorial content
4. **Product Panel Test**: Verify `openProductPanel(handle, collectionHandle)` executes successfully and displays product details
5. **Type Check Test**: Verify `typeof goToRoom === 'function'` returns true
6. **Cross-Module Call Test**: Verify `search.js` can successfully call `goToRoom` without errors
7. **Namespace Access Test**: Verify `window.ImmersiveRoomManager.goToRoom('lounge')` works correctly
8. **Backward Compatibility Test**: Verify both `goToRoom('lounge')` and `window.ImmersiveRoomManager.goToRoom('lounge')` work identically

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL code WHERE NOT isBugCondition(code) DO
  ASSERT behavior_original(code) = behavior_fixed(code)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-cross-module interactions, then write property-based tests capturing that behavior.

**Test Cases**:
1. **State Manager Preservation**: Verify `window.ImmersiveStateManager` API continues to work exactly as before (saveState, loadState, clearState, preference functions)
2. **Private Function Preservation**: Verify private functions (prefixed with `_`) remain locally scoped and are not globally accessible
3. **WebGL Rendering Preservation**: Verify scene initialization, texture loading, and camera management continue to work without modification
4. **Local Event Handler Preservation**: Verify event handlers that do not call cross-module functions continue to work
5. **DOM Manipulation Preservation**: Verify DOM operations within a single module continue to work
6. **Analytics Preservation**: Verify `window.dataLayer` and `window.fbq` tracking continues to work
7. **Theme Editor Preservation**: Verify live preview and section reloading continue to work
8. **Mobile Preservation**: Verify mobile device functionality remains identical to desktop

### Unit Tests

- Test each module's global exposure: verify namespace exists and contains expected functions
- Test backward-compatible aliases: verify critical functions are accessible both ways
- Test type checks: verify `typeof functionName === 'function'` returns true for all exposed functions
- Test cross-module calls: verify functions can be called from other modules
- Test private function isolation: verify functions prefixed with `_` are not globally accessible
- Test namespace uniqueness: verify no namespace conflicts with existing globals

### Property-Based Tests

- Generate random function call sequences and verify all exposed functions are callable without TypeError
- Generate random module combinations and verify cross-module calls work correctly
- Generate random event handler scenarios and verify functions are accessible from inline handlers
- Test that all non-cross-module code paths produce identical results before and after the fix

### Integration Tests

- Test full user journey: storefront → lounge → designer houses → collection panel → product panel
- Test search flow: search input → results → room navigation or panel opening
- Test editorial flow: hotspot click → editorial overlay → collection panel
- Test guided mode: activation → editorial → collection → completion
- Test wishlist flow: add to wishlist → view wishlist panel → navigate to product
- Test all hotspot types: room navigation, collection opening, editorial opening
- Test theme editor: section load, section select, section unload events
- Test mobile gestures: touch events, swipe navigation, tilt control

### Manual Testing Checklist

After implementing the fix, manually verify:

- [ ] Click "Start Experience" hotspot → navigates to lounge
- [ ] Click "Designer Houses" hotspot → navigates to designer houses room
- [ ] Click "Explore Designers" hotspot → opens editorial overlay
- [ ] Click "Suffuse" collection hotspot → opens collection panel
- [ ] Click product card in collection panel → opens product panel
- [ ] Search for "bridal" → click result → opens appropriate panel or navigates to room
- [ ] Click "Back to Lounge" in editorial → exits editorial and navigates to lounge
- [ ] Add product to cart → cart feedback appears
- [ ] Open wishlist panel → products display correctly
- [ ] Activate guided mode → sequence progresses through editorial and collection
- [ ] Open browser console → no TypeError or ReferenceError messages
- [ ] Test on mobile device → all functionality works identically
- [ ] Test in theme editor → live preview works, sections reload correctly

## Notes

- All 24 modular files must be fixed for complete functionality restoration
- The dual access pattern (namespace + global alias) ensures zero breaking changes
- Private functions (prefixed with `_`) must never be exposed globally
- The fix does not modify any function logic, only adds global exposure statements
- Testing should verify both that the bug is fixed AND that existing functionality is preserved
- The implementation order minimizes breakage during the fix process by fixing dependencies first


---

## Bug 2: Navigation History and Back Button

### Overview

This section specifies the implementation of a navigation history system and back button for the immersive store. Currently, users cannot navigate back to their previous room because the system only tracks which rooms have been visited (flat list) but not the order or sequence of navigation. This design adds a navigation stack to `immersiveState` and a back button to the immersive header.

### Bug Details

#### Bug Condition

The bug manifests when a user navigates through multiple rooms and wants to return to the previous room in their navigation path. The system lacks:
1. A navigation stack to track the sequence of visited rooms
2. A back button in the UI to trigger back navigation
3. Logic in `goToRoom()` to differentiate between forward and back navigation

**Formal Specification:**
```
FUNCTION isBugCondition_NavigationHistory(input)
  INPUT: input of type NavigationState
  OUTPUT: boolean
  
  RETURN input.currentRoom EXISTS
         AND input.navigationStack NOT EXISTS
         AND input.previousRoom NOT EXISTS
         AND input.userWantsToGoBack === true
         AND input.backButtonExists === false
END FUNCTION
```

#### Examples

- **Sequential Navigation**: User navigates `storefront → lounge → designer_houses → occasions`. When in `occasions`, clicking "Back to lounge" takes them to lounge instead of `designer_houses` (the previous room).

- **Missing Back Button**: User is in `occasions` room and wants to go back to `designer_houses`. There is no back button in the immersive header to enable this action.

- **No Stack Tracking**: `immersiveState.currentRoom = 'occasions'` but there is no `immersiveState.navigationStack` to show the path taken to reach this room.

### Expected Behavior

#### Navigation Stack Structure

The `immersiveState` object will be extended with a `navigationStack` property:

```javascript
var immersiveState = {
  currentRoom: 'lounge',
  mode: 'showroom',
  editorialRoom: null,
  lastHotspot: null,
  guided: false,
  navigationStack: []  // NEW: Array of room keys in navigation order
};
```

**Example navigation sequence:**
```javascript
// Initial state
navigationStack: []

// User clicks "Start Experience" (storefront → lounge)
navigationStack: ['storefront']
currentRoom: 'lounge'

// User clicks "Designer Houses" (lounge → designer_houses)
navigationStack: ['storefront', 'lounge']
currentRoom: 'designer_houses'

// User clicks "Occasions" (designer_houses → occasions)
navigationStack: ['storefront', 'lounge', 'designer_houses']
currentRoom: 'occasions'

// User clicks back button (occasions → designer_houses)
navigationStack: ['storefront', 'lounge']
currentRoom: 'designer_houses'
```

#### Back Button UI

A back button will be added to the immersive header next to the existing mode switch button:

**Location**: `sections/immersive-canvas.liquid` - immersive header section

**HTML Structure**:
```liquid
<button
  type="button"
  class="immersive-header__icon-btn immersive-back-btn"
  data-immersive-back
  aria-label="{{ 'sections.immersive_store.back_to_previous_room' | t }}"
  hidden
>
  <svg class="immersive-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
</button>
```

**Visibility Logic**:
- Hidden when `navigationStack.length === 0` (no previous rooms)
- Visible when `navigationStack.length > 0` (can go back)
- Disabled state when transitioning between rooms

**Styling**:
```css
.immersive-back-btn {
  /* Same base styles as other header icon buttons */
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.immersive-back-btn:hover:not(:disabled) {
  opacity: 1;
}

.immersive-back-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.immersive-back-btn[hidden] {
  display: none;
}
```

### Implementation Details

#### 1. State Manager Changes

**File**: `assets/immersive/core/state-manager.js`

Add `navigationStack` to `immersiveState`:

```javascript
var immersiveState = {
  currentRoom: 'lounge',
  mode: 'showroom',
  editorialRoom: null,
  lastHotspot: null,
  guided: false,
  navigationStack: []  // NEW
};
```

Update `saveState()` to persist navigation stack:

```javascript
function saveState(patch) {
  try {
    var current = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    // Merge patch, including navigationStack if present
    var updated = Object.assign(current, patch);
    sessionStorage.setItem(STATE_KEY, JSON.stringify(updated));
  } catch (e) {}
}
```

Update `loadState()` to restore navigation stack:

```javascript
function loadState() {
  try {
    var state = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    // Restore navigationStack if it exists
    if (state.navigationStack && Array.isArray(state.navigationStack)) {
      immersiveState.navigationStack = state.navigationStack;
    }
    return state;
  } catch (e) {
    return {};
  }
}
```

#### 2. Room Manager Changes

**File**: `assets/immersive/core/room-manager.js`

Update `goToRoom()` signature to accept a `fromBack` parameter:

```javascript
function goToRoom(roomKey, initial, fromBack) {
  if (transitioning && !initial) return;
  var roomData = getRoomTextureUrls(roomKey);

  if (!roomData) {
    console.error('[Immersive] Cannot navigate to room without textures:', roomKey);
    return;
  }

  // NEW: Navigation stack management
  if (!initial && !fromBack) {
    // Forward navigation: push current room onto stack
    if (immersiveState.currentRoom && immersiveState.currentRoom !== roomKey) {
      immersiveState.navigationStack.push(immersiveState.currentRoom);
    }
  } else if (fromBack) {
    // Back navigation: already popped in navigateBack(), don't push
  }

  saveState({ 
    room: roomKey, 
    panel: null, 
    product: null, 
    collection: null,
    navigationStack: immersiveState.navigationStack  // NEW: persist stack
  });
  
  immersiveState.currentRoom = roomKey;
  immersiveState.mode = 'showroom';
  immersiveState.editorialRoom = null;

  // Track room visit for recommender
  if (typeof trackRoomVisit === 'function') trackRoomVisit(roomKey);
  if (typeof clearLimitedTimeIntervals === 'function') clearLimitedTimeIntervals();

  // NEW: Update back button visibility
  updateBackButtonVisibility();

  // ... rest of existing goToRoom logic ...
}
```

Add new `navigateBack()` function:

```javascript
function navigateBack() {
  if (immersiveState.navigationStack.length === 0) {
    console.warn('[Immersive] Cannot navigate back: navigation stack is empty');
    return;
  }

  // Pop the previous room from the stack
  var previousRoom = immersiveState.navigationStack.pop();
  
  // Navigate to it with fromBack=true to prevent pushing current room again
  goToRoom(previousRoom, false, true);

  // Track analytics
  if (typeof trackImmersiveEvent === 'function') {
    trackImmersiveEvent('navigation_back', {
      from_room: immersiveState.currentRoom,
      to_room: previousRoom,
      stack_depth: immersiveState.navigationStack.length
    });
  }
}
```

Add `updateBackButtonVisibility()` function:

```javascript
function updateBackButtonVisibility() {
  var backBtn = document.querySelector('[data-immersive-back]');
  if (!backBtn) return;

  if (immersiveState.navigationStack.length > 0) {
    backBtn.removeAttribute('hidden');
    backBtn.disabled = false;
  } else {
    backBtn.setAttribute('hidden', '');
    backBtn.disabled = true;
  }
}
```

Add `canNavigateBack()` helper:

```javascript
function canNavigateBack() {
  return immersiveState.navigationStack.length > 0;
}
```

Expose new functions in global API:

```javascript
window.ImmersiveRoomManager = {
  goToRoom: goToRoom,
  navigateBack: navigateBack,  // NEW
  canNavigateBack: canNavigateBack,  // NEW
  updateBackButtonVisibility: updateBackButtonVisibility,  // NEW
  preloadRoom: preloadRoom,
  renderHotspots: renderHotspots,
  updateRoomBadge: updateRoomBadge,
  loadRoomTextures: loadRoomTextures,
  getRoomTextureUrls: getRoomTextureUrls,
  updateCameraForMode: updateCameraForMode,
  syncVisitedRooms: syncVisitedRooms,
  STORE_ROOMS: STORE_ROOMS
};

// Backward-compatible global aliases
window.goToRoom = goToRoom;
window.navigateBack = navigateBack;  // NEW
window.canNavigateBack = canNavigateBack;  // NEW
```

#### 3. Immersive Canvas Changes

**File**: `sections/immersive-canvas.liquid`

Add back button to the immersive header (after the tilt toggle, before the mode switch):

```liquid
{%- comment -%} Back button - navigate to previous room {%- endcomment -%}
<button
  type="button"
  class="immersive-header__icon-btn immersive-back-btn"
  data-immersive-back
  aria-label="{{ 'sections.immersive_store.back_to_previous_room' | t }}"
  hidden
>
  <svg class="immersive-header__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
</button>
```

Add CSS for back button:

```liquid
{% stylesheet %}
  .immersive-back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 50%;
    color: #d4af37;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.6;
  }

  .immersive-back-btn:hover:not(:disabled) {
    opacity: 1;
    background: rgba(0, 0, 0, 0.6);
    border-color: rgba(212, 175, 55, 0.4);
    transform: scale(1.05);
  }

  .immersive-back-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .immersive-back-btn[hidden] {
    display: none;
  }

  .immersive-back-btn:focus-visible {
    outline: 2px solid #d4af37;
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    .immersive-back-btn {
      width: 2.25rem;
      height: 2.25rem;
    }
  }
{% endstylesheet %}
```

#### 4. Navigation Binding

**File**: `assets/immersive-store.js`

Add back button event listener in `bindImmersiveNav()`:

```javascript
function bindImmersiveNav() {
  // ... existing cart toggle and mode switch code ...

  // NEW: Wire back button
  var backBtn = document.querySelector('[data-immersive-back]');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (typeof navigateBack === 'function') {
        navigateBack();
      }
    });
  }
}
```

#### 5. Initialization Changes

**File**: `assets/immersive/core/webgl-engine.js` (or wherever `initImmersiveScene` is defined)

Restore navigation stack on initialization:

```javascript
function initImmersiveScene() {
  // ... existing initialization code ...

  // NEW: Restore navigation stack from session storage
  var savedState = loadState();
  if (savedState.navigationStack && Array.isArray(savedState.navigationStack)) {
    immersiveState.navigationStack = savedState.navigationStack;
  }

  // NEW: Update back button visibility on init
  if (typeof updateBackButtonVisibility === 'function') {
    updateBackButtonVisibility();
  }

  // ... rest of initialization ...
}
```

#### 6. Localization

**File**: `locales/en.default.json`

Add translation key for back button:

```json
{
  "sections": {
    "immersive_store": {
      "back_to_previous_room": "Back to previous room",
      "navigation_back_aria": "Navigate back to {{ room_name }}"
    }
  }
}
```

### Edge Cases and Special Handling

#### 1. Initial Load with Deep-Link

When the immersive store loads with a deep-link parameter (e.g., `?open_product=handle`):

```javascript
// In safeBindImmersiveInit()
if (openProduct) {
  // Don't modify navigation stack when opening a panel
  setTimeout(function () {
    openProductPanel(openProduct);
  }, 400);
}
```

**Behavior**: Opening a panel does not affect the navigation stack. The stack only tracks room-to-room navigation.

#### 2. Hardcoded "Back to Lounge" Hotspots

The existing "Back to lounge" hotspots in `designer_houses`, `occasions`, and `featured_collections` rooms will continue to work as before:

```javascript
// In renderHotspots() - hotspot click handler
if (hotspot.targetRoom) {
  // This will push current room onto stack before navigating
  goToRoom(hotspot.targetRoom);
}
```

**Behavior**: Clicking "Back to lounge" pushes the current room onto the stack, so the user can still use the back button to return.

#### 3. Guided Mode Navigation

Guided mode automatically advances through rooms. The navigation stack will track these transitions:

```javascript
// In guided-mode.js
function _guidedAdvance() {
  // ... existing logic ...
  goToRoom(nextRoom);  // This will push current room onto stack
}
```

**Behavior**: Guided mode navigation is tracked in the stack, allowing users to navigate back through the guided sequence.

#### 4. Editorial Overlay Navigation

Opening and closing editorial overlays does not affect the navigation stack:

```javascript
// In editorial-mode.js
function enterEditorialMode(roomKey, triggerEl) {
  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  // Navigation stack unchanged
}

function exitEditorialMode() {
  immersiveState.mode = 'showroom';
  immersiveState.editorialRoom = null;
  // Navigation stack unchanged
}
```

**Behavior**: Editorial overlays are a mode change, not room navigation. The stack remains unchanged.

#### 5. Panel Navigation

Opening and closing panels (product/collection) does not affect the navigation stack:

```javascript
// In product-panel.js
function openProductPanel(productHandle, collectionHandle) {
  // ... existing logic ...
  // Navigation stack unchanged
}
```

**Behavior**: Panels are overlays on top of the current room. The stack only tracks room changes.

#### 6. Browser Back Button Integration (Optional)

Optionally integrate with browser history API:

```javascript
// In goToRoom() - after updating immersiveState
if (!initial && !fromBack && window.history && window.history.pushState) {
  var url = new URL(window.location);
  url.searchParams.set('room', roomKey);
  window.history.pushState({ room: roomKey }, '', url);
}

// Add popstate listener
window.addEventListener('popstate', function (e) {
  if (e.state && e.state.room) {
    // Navigate back using the navigation stack, not browser history
    if (canNavigateBack()) {
      navigateBack();
    }
  }
});
```

**Note**: This is optional and should be implemented carefully to avoid conflicts with the navigation stack.

### Correctness Properties

#### Property 3: Navigation Stack Integrity

_For any_ sequence of room navigation actions, the navigation stack SHALL accurately reflect the path taken to reach the current room, allowing the user to navigate back through each step in reverse order.

**Validates: Requirements 5.1, 5.3, 5.7, 5.9, 5.10**

**Formal Specification:**
```
PROPERTY NavigationStackIntegrity
  GIVEN navigationSequence = [room1, room2, room3, ..., roomN]
  WHEN user navigates through sequence using goToRoom()
  THEN immersiveState.navigationStack = [room1, room2, ..., room(N-1)]
       AND immersiveState.currentRoom = roomN
       AND canNavigateBack() = true
       AND navigateBack() results in currentRoom = room(N-1)
                                    AND navigationStack = [room1, room2, ..., room(N-2)]
END PROPERTY
```

#### Property 4: Back Button Visibility

_For any_ navigation state, the back button SHALL be visible if and only if the navigation stack contains at least one room, ensuring users can only navigate back when a previous room exists.

**Validates: Requirements 5.5, 5.12**

**Formal Specification:**
```
PROPERTY BackButtonVisibility
  GIVEN immersiveState.navigationStack
  WHEN updateBackButtonVisibility() is called
  THEN backButton.hidden = (navigationStack.length === 0)
       AND backButton.disabled = (navigationStack.length === 0)
END PROPERTY
```

#### Property 5: Preservation - Existing Navigation

_For any_ existing navigation mechanism (hardcoded "Back to lounge" hotspots, guided mode, editorial overlays, panel navigation), the behavior SHALL remain unchanged, with the navigation stack tracking room changes without interfering with existing functionality.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10**

### Testing Strategy

#### Unit Tests

- Test `navigateBack()` with various stack states (empty, single item, multiple items)
- Test `canNavigateBack()` returns correct boolean based on stack length
- Test `updateBackButtonVisibility()` shows/hides button correctly
- Test `goToRoom()` with `fromBack=true` does not push to stack
- Test `goToRoom()` with `fromBack=false` pushes current room to stack
- Test navigation stack persistence in `sessionStorage`
- Test navigation stack restoration on page load

#### Property-Based Tests

**Test 1: Navigation Stack Integrity**
```javascript
// Generate random navigation sequences
fc.assert(
  fc.property(
    fc.array(fc.constantFrom('storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'), { minLength: 2, maxLength: 10 }),
    function (roomSequence) {
      // Reset state
      immersiveState.navigationStack = [];
      immersiveState.currentRoom = roomSequence[0];

      // Navigate through sequence
      for (var i = 1; i < roomSequence.length; i++) {
        goToRoom(roomSequence[i], false, false);
      }

      // Verify stack contains all previous rooms
      var expectedStack = roomSequence.slice(0, -1);
      return JSON.stringify(immersiveState.navigationStack) === JSON.stringify(expectedStack)
             && immersiveState.currentRoom === roomSequence[roomSequence.length - 1];
    }
  )
);
```

**Test 2: Back Navigation Correctness**
```javascript
// Generate random navigation sequences, then navigate back
fc.assert(
  fc.property(
    fc.array(fc.constantFrom('storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'), { minLength: 3, maxLength: 10 }),
    function (roomSequence) {
      // Navigate forward through sequence
      immersiveState.navigationStack = [];
      immersiveState.currentRoom = roomSequence[0];
      for (var i = 1; i < roomSequence.length; i++) {
        goToRoom(roomSequence[i], false, false);
      }

      // Navigate back once
      navigateBack();

      // Verify we're at the previous room
      var expectedRoom = roomSequence[roomSequence.length - 2];
      var expectedStack = roomSequence.slice(0, -2);
      return immersiveState.currentRoom === expectedRoom
             && JSON.stringify(immersiveState.navigationStack) === JSON.stringify(expectedStack);
    }
  )
);
```

**Test 3: Back Button Visibility**
```javascript
// Generate random stack states and verify button visibility
fc.assert(
  fc.property(
    fc.array(fc.constantFrom('storefront', 'lounge', 'designer_houses'), { minLength: 0, maxLength: 5 }),
    function (stack) {
      immersiveState.navigationStack = stack;
      updateBackButtonVisibility();
      
      var backBtn = document.querySelector('[data-immersive-back]');
      var shouldBeVisible = stack.length > 0;
      
      return (backBtn.hidden === !shouldBeVisible) && (backBtn.disabled === !shouldBeVisible);
    }
  )
);
```

#### Integration Tests

- Test full navigation sequence: `storefront → lounge → designer_houses → occasions`, then back button three times
- Test navigation with panels: navigate rooms, open product panel, close panel, verify stack unchanged
- Test navigation with editorial: navigate rooms, open editorial, close editorial, verify stack unchanged
- Test guided mode: activate guided mode, let it advance through rooms, verify stack tracks all transitions
- Test hardcoded "Back to lounge": navigate to `designer_houses`, click "Back to lounge", verify stack contains `designer_houses`, then back button returns to `designer_houses`
- Test deep-link with navigation: load `?open_product=handle`, navigate rooms, verify stack works correctly
- Test session persistence: navigate through rooms, refresh page, verify stack restored

#### Manual Testing Checklist

- [ ] Navigate `storefront → lounge → designer_houses → occasions`
- [ ] Verify back button appears after first navigation
- [ ] Click back button → returns to `designer_houses`
- [ ] Click back button → returns to `lounge`
- [ ] Click back button → returns to `storefront`
- [ ] Verify back button hidden when at `storefront`
- [ ] Navigate to `designer_houses`, open product panel, close panel
- [ ] Verify back button still works to return to previous room
- [ ] Navigate to `occasions`, open editorial overlay, close overlay
- [ ] Verify back button still works to return to previous room
- [ ] Click hardcoded "Back to lounge" hotspot
- [ ] Verify back button can return to the room before lounge
- [ ] Activate guided mode, let it advance through rooms
- [ ] Verify back button tracks guided mode navigation
- [ ] Refresh page mid-navigation
- [ ] Verify navigation stack restored and back button works
- [ ] Test on mobile device
- [ ] Verify back button is appropriately sized for touch
- [ ] Verify back button works identically to desktop

### Notes

- The navigation stack is separate from `_browsingContext.visitedRooms` (used for recommendations)
- Panel navigation (product/collection) does not affect the room navigation stack
- Editorial overlays do not affect the room navigation stack
- Hardcoded "Back to lounge" hotspots continue to work and are tracked in the stack
- The back button is hidden when the stack is empty (no previous rooms)
- Browser history integration is optional and should be implemented carefully
- The navigation stack persists in `sessionStorage` across page refreshes within the same session
