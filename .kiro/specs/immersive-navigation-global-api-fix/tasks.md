# Implementation Plan

## Phase 1: Exploratory Bug Condition Testing

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Modular Functions Not Globally Accessible
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate modular functions are not globally accessible
  - **Scoped PBT Approach**: Test concrete failing cases for each critical function across all 24 modules
  - Test that `goToRoom('designer_houses')` fails with TypeError on unfixed code (function defined in `room-manager.js` but not exposed globally)
  - Test that `openProductPanel('test-handle', 'test-collection')` fails with TypeError on unfixed code (function defined in `product-panel.js` but not exposed globally)
  - Test that `openCollectionPanel('test-collection')` fails with TypeError on unfixed code (function defined in `collection-panel.js` but not exposed globally)
  - Test that `enterEditorialMode('designer_houses', null)` fails with TypeError on unfixed code (function defined in `editorial-mode.js` but not exposed globally)
  - Test that `openSearchPanel('bridal')` fails with TypeError on unfixed code (function defined in `search.js` but not exposed globally)
  - Test that `typeof goToRoom === 'function'` returns false on unfixed code (function not in global scope)
  - Test that cross-module calls from `search.js` to `goToRoom` fail with ReferenceError on unfixed code
  - Test that cross-module calls from `editorial-mode.js` to `goToRoom` fail with ReferenceError on unfixed code
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: which functions fail, what error types occur, which modules are affected
  - Mark task complete when test is written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Cross-Module Code Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-cross-module interactions
  - Observe: `window.ImmersiveStateManager.saveState()` works correctly on unfixed code
  - Observe: `window.ImmersiveStateManager.loadState()` works correctly on unfixed code
  - Observe: Private functions prefixed with `_` are not globally accessible on unfixed code
  - Observe: WebGL scene initialization in `immersive-store.js` works correctly on unfixed code
  - Observe: Local event handlers within a single module work correctly on unfixed code
  - Observe: DOM manipulation within a single module works correctly on unfixed code
  - Observe: Analytics tracking via `window.dataLayer` and `window.fbq` works correctly on unfixed code
  - Write property-based tests capturing these observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Test that for all state management operations, `window.ImmersiveStateManager` API produces expected results
  - Test that for all private functions (prefixed with `_`), they remain locally scoped and not globally accessible
  - Test that for all WebGL operations, scene initialization and rendering work without modification
  - Test that for all local event handlers, they execute correctly without calling cross-module functions
  - Test that for all DOM operations within a module, they work correctly
  - Test that for all analytics events, tracking fires correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

## Phase 2: Foundation Modules (No Dependencies)

- [x] 3. Fix foundation modules - Phase 1

  - [x] 3.1 Expose `utils/dom.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveDOM = { ... }`
    - Add backward-compatible global aliases for critical functions
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Functions in `utils/dom.js` not exposed globally_
    - _Expected_Behavior: All public DOM utility functions accessible via `window.ImmersiveDOM`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 3.2 Expose `utils/skeleton.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveSkeleton = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Functions in `utils/skeleton.js` not exposed globally_
    - _Expected_Behavior: Skeleton rendering functions accessible via `window.ImmersiveSkeleton`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

## Phase 3: Core Navigation (Depends on Phase 2)

- [x] 4. Fix core navigation modules - Phase 2

  - [x] 4.1 Expose `core/room-manager.js` public API (CRITICAL)
    - Analyze file to identify all public functions: `goToRoom`, `preloadRoom`, `renderHotspots`, `updateRoomBadge`, `loadRoomTextures`, `getRoomTextureUrls`, `updateCameraForMode`, `syncVisitedRooms`
    - Expose `STORE_ROOMS` constant
    - Add global exposure block: `window.ImmersiveRoomManager = { goToRoom, preloadRoom, renderHotspots, updateRoomBadge, loadRoomTextures, getRoomTextureUrls, updateCameraForMode, syncVisitedRooms, STORE_ROOMS }`
    - Add backward-compatible global aliases: `window.goToRoom = goToRoom`, `window.renderHotspots = renderHotspots`
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: `goToRoom()` and other room management functions not exposed globally, causing TypeError when called from hotspot handlers_
    - _Expected_Behavior: All room management functions accessible via `window.ImmersiveRoomManager` and critical functions via global aliases_
    - _Preservation: Private functions like `_dismissWelcomeToast`, `_startRoomTextureLoad` remain locally scoped_
    - _Requirements: 2.1, 2.6, 2.7, 2.8, 2.9, 3.3_

  - [x] 4.2 Expose `core/webgl-engine.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveWebGL = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: WebGL engine functions not exposed globally_
    - _Expected_Behavior: WebGL engine functions accessible via `window.ImmersiveWebGL`_
    - _Preservation: WebGL rendering logic remains unchanged; private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.2, 3.3_

## Phase 4: Panels (Depends on Phase 2-3)

- [x] 5. Fix panel modules - Phase 3

  - [x] 5.1 Expose `panels/glass-panel.js` public API (CRITICAL)
    - Analyze file to identify all public functions: `openPanel`, `closePanel`, `setPanelRoomLabel`, `openOverlay`, `transitionPanelContent`
    - Add global exposure block: `window.ImmersiveGlassPanel = { openPanel, closePanel, setPanelRoomLabel, openOverlay, transitionPanelContent }`
    - Add backward-compatible global aliases: `window.openPanel = openPanel`, `window.closePanel = closePanel`
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: `openPanel()` and `closePanel()` not exposed globally, causing TypeError when called from other modules_
    - _Expected_Behavior: All glass panel functions accessible via `window.ImmersiveGlassPanel` and critical functions via global aliases_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 5.2 Expose `panels/product-panel.js` public API (CRITICAL)
    - Analyze file to identify all public functions: `openProductPanel`, `setupVariantButtons`, `setupBuyNowForm`, `setupMediaThumbs`, `setupImageParallax`, `setupDeliveryDates`, `setupShareButton`, `setupVirtualTryOn`, `showCartFeedback`, `showErrorFeedback`
    - Add global exposure block: `window.ImmersiveProductPanel = { openProductPanel, setupVariantButtons, setupBuyNowForm, setupMediaThumbs, setupImageParallax, setupDeliveryDates, setupShareButton, setupVirtualTryOn, showCartFeedback, showErrorFeedback }`
    - Add backward-compatible global alias: `window.openProductPanel = openProductPanel`
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: `openProductPanel()` not exposed globally, causing TypeError when called from product card click handlers_
    - _Expected_Behavior: All product panel functions accessible via `window.ImmersiveProductPanel` and `openProductPanel` via global alias_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.4, 2.9, 3.3_

  - [x] 5.3 Expose `panels/collection-panel.js` public API (CRITICAL)
    - Analyze file to identify all public functions: `openCollectionPanel`
    - Add global exposure block: `window.ImmersiveCollectionPanel = { openCollectionPanel }`
    - Add backward-compatible global alias: `window.openCollectionPanel = openCollectionPanel`
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: `openCollectionPanel()` not exposed globally, causing TypeError when called from collection hotspot handlers_
    - _Expected_Behavior: Collection panel function accessible via `window.ImmersiveCollectionPanel` and global alias_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.5, 2.9, 3.3_

  - [x] 5.4 Expose `panels/wishlist-panel.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveWishlist = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Wishlist panel functions not exposed globally_
    - _Expected_Behavior: Wishlist functions accessible via `window.ImmersiveWishlist`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

## Phase 5: Editorial (Depends on Phase 2-4)

- [x] 6. Fix editorial modules - Phase 4

  - [x] 6.1 Expose `editorial/editorial-mode.js` public API (CRITICAL)
    - Analyze file to identify all public functions: `enterEditorialMode`, `exitEditorialMode`, `initEditorialBackToLounge`
    - Add global exposure block: `window.ImmersiveEditorial = { enterEditorialMode, exitEditorialMode, initEditorialBackToLounge }`
    - Add backward-compatible global aliases: `window.enterEditorialMode = enterEditorialMode`, `window.exitEditorialMode = exitEditorialMode`
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: `enterEditorialMode()` and `exitEditorialMode()` not exposed globally, causing TypeError when called from editorial hotspot handlers_
    - _Expected_Behavior: All editorial mode functions accessible via `window.ImmersiveEditorial` and critical functions via global aliases_
    - _Preservation: Private helper functions like `_ensureEditorialScriptsLoaded` remain locally scoped_
    - _Requirements: 2.3, 2.9, 3.3_

  - [x] 6.2 Expose `editorial/hero-parallax.js` public API
    - Analyze file to identify all public functions: `initEditorialHeroParallax`, `destroyEditorialHeroParallax`
    - Add global exposure block: `window.ImmersiveEditorialParallax = { initEditorialHeroParallax, destroyEditorialHeroParallax }`
    - Add backward-compatible global aliases if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: Editorial parallax functions not exposed globally_
    - _Expected_Behavior: Editorial parallax functions accessible via `window.ImmersiveEditorialParallax`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 6.3 Expose `editorial/scroll-reveal.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveScrollReveal = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Scroll reveal functions not exposed globally_
    - _Expected_Behavior: Scroll reveal functions accessible via `window.ImmersiveScrollReveal`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 6.4 Expose `editorial/timeline.js` public API
    - Analyze file to identify all public functions: `loadTimelineCollection` (if public)
    - Add global exposure block at end of file: `window.ImmersiveTimeline = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Timeline functions not exposed globally_
    - _Expected_Behavior: Timeline functions accessible via `window.ImmersiveTimeline`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

## Phase 6: Features (Depends on Phase 2-5)

- [x] 7. Fix feature modules - Phase 5

  - [x] 7.1 Expose `features/search.js` public API (CRITICAL)
    - Analyze file to identify all public functions: `initImmersiveSearch`, `openSearchPanel`
    - Add global exposure block: `window.ImmersiveSearch = { initImmersiveSearch, openSearchPanel }`
    - Add backward-compatible global alias: `window.openSearchPanel = openSearchPanel`
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: `openSearchPanel()` not exposed globally, causing TypeError when called from search result handlers; `goToRoom()` call at line 202 fails with ReferenceError_
    - _Expected_Behavior: All search functions accessible via `window.ImmersiveSearch` and `openSearchPanel` via global alias; cross-module call to `goToRoom` works correctly_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.2, 2.7, 2.9, 3.3_

  - [x] 7.2 Expose `features/filters.js` public API
    - Analyze file to identify all public functions: `initImmersiveFilters` (if public)
    - Add global exposure block at end of file: `window.ImmersiveFilters = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Filter functions not exposed globally_
    - _Expected_Behavior: Filter functions accessible via `window.ImmersiveFilters`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 7.3 Expose `features/gestures.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveGestures = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Gesture functions not exposed globally_
    - _Expected_Behavior: Gesture functions accessible via `window.ImmersiveGestures`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 7.4 Expose `features/quick-add.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveQuickAdd = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Quick add functions not exposed globally_
    - _Expected_Behavior: Quick add functions accessible via `window.ImmersiveQuickAdd`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 7.5 Expose `features/fab.js` public API
    - Analyze file to identify all public functions (not prefixed with `_`)
    - Add global exposure block at end of file: `window.ImmersiveFAB = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: FAB functions not exposed globally_
    - _Expected_Behavior: FAB functions accessible via `window.ImmersiveFAB`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 7.6 Expose `features/limited-time.js` public API
    - Analyze file to identify all public functions: `clearLimitedTimeIntervals` (if public)
    - Add global exposure block at end of file: `window.ImmersiveLimitedTime = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Limited time functions not exposed globally_
    - _Expected_Behavior: Limited time functions accessible via `window.ImmersiveLimitedTime`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

  - [x] 7.7 Expose `features/room-recommender.js` public API
    - Analyze file to identify all public functions: `trackRoomVisit`, `getRelevantRooms` (if public)
    - Add global exposure block at end of file: `window.ImmersiveRecommender = { ... }`
    - Add backward-compatible global aliases for critical functions if needed
    - Document exposed API in comment block
    - Verify no namespace conflicts with existing globals
    - _Bug_Condition: Room recommender functions not exposed globally_
    - _Expected_Behavior: Room recommender functions accessible via `window.ImmersiveRecommender`_
    - _Preservation: Private helper functions remain locally scoped_
    - _Requirements: 2.9, 3.3_

## Phase 7: Guided Mode (Depends on All Previous)

- [x] 8. Fix guided mode module - Phase 6

  - [x] 8.1 Expose `guided/guided-mode.js` public API
    - Analyze file to identify all public functions: `initGuidedMode`, `activateGuidedMode`, `exitGuidedMode`, `showGuidedPrompt`, `hideGuidedPrompt`
    - Add global exposure block: `window.ImmersiveGuided = { initGuidedMode, activateGuidedMode, exitGuidedMode, showGuidedPrompt, hideGuidedPrompt }`
    - Add backward-compatible global aliases: `window.activateGuidedMode = activateGuidedMode`, `window.exitGuidedMode = exitGuidedMode`
    - Document exposed API in comment block
    - Verify no namespace conflicts
    - _Bug_Condition: Guided mode functions not exposed globally, causing TypeError when called from guided mode activation handlers_
    - _Expected_Behavior: All guided mode functions accessible via `window.ImmersiveGuided` and critical functions via global aliases_
    - _Preservation: Private helper functions like `_guidedAdvance` remain locally scoped_
    - _Requirements: 2.9, 3.3_

## Phase 8: Verification

- [x] 9. Verify bug condition exploration test now passes

  - [x] 9.1 Re-run bug condition exploration test from task 1
    - **Property 1: Expected Behavior** - All Modular Functions Globally Accessible
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify `goToRoom('designer_houses')` executes successfully without TypeError
    - Verify `openProductPanel('test-handle', 'test-collection')` executes successfully without TypeError
    - Verify `openCollectionPanel('test-collection')` executes successfully without TypeError
    - Verify `enterEditorialMode('designer_houses', null)` executes successfully without TypeError
    - Verify `openSearchPanel('bridal')` executes successfully without TypeError
    - Verify `typeof goToRoom === 'function'` returns true
    - Verify cross-module calls from `search.js` to `goToRoom` work without ReferenceError
    - Verify cross-module calls from `editorial-mode.js` to `goToRoom` work without ReferenceError
    - Verify namespace access: `window.ImmersiveRoomManager.goToRoom('lounge')` works correctly
    - Verify backward compatibility: both `goToRoom('lounge')` and `window.ImmersiveRoomManager.goToRoom('lounge')` work identically
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 9.2 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Cross-Module Code Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify `window.ImmersiveStateManager` API continues to work exactly as before
    - Verify private functions (prefixed with `_`) remain locally scoped and not globally accessible
    - Verify WebGL scene initialization and rendering work without modification
    - Verify local event handlers execute correctly
    - Verify DOM operations within modules work correctly
    - Verify analytics tracking fires correctly
    - Verify theme editor live preview and section reloading work correctly
    - Verify mobile device functionality remains identical to desktop
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

## Phase 9: Integration Testing

- [ ] 10. Integration testing

  - [ ] 10.1 Test full user journey: storefront → lounge → designer houses → collection panel → product panel
    - Navigate from storefront to lounge using hotspot
    - Navigate from lounge to designer houses using hotspot
    - Open collection panel from designer houses hotspot
    - Open product panel from collection grid
    - Verify all navigation functions execute without errors
    - Verify all panels display correctly
    - _Requirements: 2.1, 2.4, 2.5_

  - [ ] 10.2 Test search flow: search input → results → room navigation or panel opening
    - Enter search query in immersive search
    - Click search result that navigates to a room
    - Verify `goToRoom` executes successfully from search context
    - Click search result that opens a panel
    - Verify panel opens correctly
    - _Requirements: 2.2, 2.7_

  - [ ] 10.3 Test editorial flow: hotspot click → editorial overlay → collection panel
    - Click editorial hotspot (e.g., "Explore Designers")
    - Verify `enterEditorialMode` executes successfully
    - Verify editorial overlay displays correctly
    - Click collection link in editorial overlay
    - Verify collection panel opens correctly
    - Click "Back to Lounge" button
    - Verify `exitEditorialMode` executes successfully and navigates to lounge
    - _Requirements: 2.3, 2.8_

  - [ ] 10.4 Test guided mode: activation → editorial → collection → completion
    - Activate guided mode
    - Verify `activateGuidedMode` executes successfully
    - Follow guided prompts through editorial and collection
    - Verify all cross-module function calls work correctly
    - Complete guided mode
    - Verify `exitGuidedMode` executes successfully
    - _Requirements: 2.9_

  - [ ] 10.5 Test wishlist flow: add to wishlist → view wishlist panel → navigate to product
    - Add product to wishlist from product panel
    - Open wishlist panel
    - Verify wishlist functions work correctly
    - Click product in wishlist
    - Verify product panel opens correctly
    - _Requirements: 2.4, 2.9_

  - [ ] 10.6 Test all hotspot types: room navigation, collection opening, editorial opening
    - Test room navigation hotspots in all rooms
    - Test collection opening hotspots
    - Test editorial opening hotspots
    - Verify all hotspot handlers can call their target functions without errors
    - _Requirements: 2.1, 2.3, 2.5_

  - [ ] 10.7 Test theme editor: section load, section select, section unload events
    - Open theme editor
    - Load immersive canvas section
    - Verify global API exposure works in theme editor context
    - Select and unselect sections
    - Verify no errors occur during section reloading
    - _Requirements: 3.7_

  - [ ] 10.8 Test mobile functionality
    - Test all navigation flows on mobile device or mobile viewport
    - Verify touch events work correctly
    - Verify all globally exposed functions work identically on mobile
    - _Requirements: 3.8_

## Phase 10: Manual Verification

- [ ] 11. Manual verification checklist
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
  - _Requirements: All requirements 2.1-2.10, 3.1-3.10_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


---

## Bug 2: Navigation History and Back Button

### Phase 11: Exploratory Bug Condition Testing (Navigation History)

- [x] 13. Write bug condition exploration test for navigation history
  - **Property 3: Bug Condition** - No Navigation History or Back Button
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate navigation history is not tracked
  - Test that `immersiveState.navigationStack` does not exist on unfixed code
  - Test that navigating `storefront → lounge → designer_houses → occasions` does not track the path
  - Test that `_browsingContext.visitedRooms` is a flat list without order preservation
  - Test that no back button exists in the immersive header (`[data-immersive-back]` not found)
  - Test that `goToRoom()` does not accept a `fromBack` parameter on unfixed code
  - Test that clicking "Back to lounge" from `occasions` after navigating from `designer_houses` goes to lounge instead of `designer_houses`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: navigation stack missing, back button missing, no history tracking
  - Mark task complete when test is written, run, and failures are documented
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.10_

- [x] 14. Write preservation property tests for navigation history (BEFORE implementing fix)
  - **Property 5: Preservation** - Existing Navigation Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for existing navigation mechanisms
  - Observe: Hardcoded "Back to lounge" hotspots navigate directly to lounge on unfixed code
  - Observe: `_browsingContext.visitedRooms` tracks visited rooms for recommendations on unfixed code
  - Observe: `trackRoomVisit()` adds rooms to `visitedRooms` on unfixed code
  - Observe: Breadcrumbs in product/collection panels work correctly on unfixed code
  - Observe: `syncVisitedRooms()` updates room picker UI on unfixed code
  - Observe: Deep-link URL parameters open panels correctly on unfixed code
  - Observe: Guided mode navigation works correctly on unfixed code
  - Observe: Editorial overlays open/close without affecting room state on unfixed code
  - Write property-based tests capturing these observed behavior patterns
  - Test that for all hardcoded "Back to lounge" hotspot clicks, navigation goes directly to lounge
  - Test that for all room visits, `_browsingContext.visitedRooms` is updated correctly
  - Test that for all panel operations, room state remains unchanged
  - Test that for all editorial overlay operations, room state remains unchanged
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

### Phase 12: State Manager Changes

- [x] 15. Add navigation stack to immersiveState

  - [x] 15.1 Update `immersiveState` object in `assets/immersive/core/state-manager.js`
    - Add `navigationStack: []` property to `immersiveState` object
    - Verify property is initialized as empty array
    - _Bug_Condition: `immersiveState` does not contain `navigationStack` property_
    - _Expected_Behavior: `immersiveState.navigationStack` exists and is initialized as empty array_
    - _Requirements: 5.3_

  - [x] 15.2 Update `saveState()` to persist navigation stack
    - Modify `saveState()` to include `navigationStack` in the patch object
    - Verify navigation stack is saved to `sessionStorage`
    - Test that calling `saveState({ navigationStack: ['lounge', 'designer_houses'] })` persists the stack
    - _Bug_Condition: `saveState()` does not persist navigation stack_
    - _Expected_Behavior: Navigation stack is saved to `sessionStorage` when `saveState()` is called_
    - _Requirements: 5.15_

  - [x] 15.3 Update `loadState()` to restore navigation stack
    - Modify `loadState()` to restore `navigationStack` from `sessionStorage`
    - Verify navigation stack is restored to `immersiveState.navigationStack`
    - Test that after page refresh, navigation stack is restored correctly
    - _Bug_Condition: `loadState()` does not restore navigation stack_
    - _Expected_Behavior: Navigation stack is restored from `sessionStorage` when `loadState()` is called_
    - _Requirements: 5.15_

### Phase 13: Room Manager Changes

- [x] 16. Update `goToRoom()` function

  - [x] 16.1 Add `fromBack` parameter to `goToRoom()` signature
    - Update function signature: `function goToRoom(roomKey, initial, fromBack)`
    - Add parameter documentation in comment block
    - _Bug_Condition: `goToRoom()` does not accept `fromBack` parameter_
    - _Expected_Behavior: `goToRoom()` accepts optional `fromBack` parameter_
    - _Requirements: 5.10_

  - [x] 16.2 Implement navigation stack push logic
    - Add logic to push current room onto stack when `!initial && !fromBack`
    - Verify current room is pushed before navigating to new room
    - Test that navigating `lounge → designer_houses` pushes `lounge` onto stack
    - _Bug_Condition: `goToRoom()` does not push current room onto navigation stack_
    - _Expected_Behavior: Current room is pushed onto stack before forward navigation_
    - _Requirements: 5.7, 5.9_

  - [x] 16.3 Implement navigation stack persistence
    - Update `saveState()` call to include `navigationStack: immersiveState.navigationStack`
    - Verify stack is persisted after each navigation
    - Test that stack persists across page refreshes
    - _Bug_Condition: Navigation stack is not persisted in state_
    - _Expected_Behavior: Navigation stack is saved with room state_
    - _Requirements: 5.15_

  - [x] 16.4 Add back button visibility update
    - Call `updateBackButtonVisibility()` after updating `immersiveState.currentRoom`
    - Verify back button visibility is updated after each navigation
    - Test that back button appears after first forward navigation
    - _Bug_Condition: Back button visibility is not updated after navigation_
    - _Expected_Behavior: Back button visibility is updated after each room change_
    - _Requirements: 5.5, 5.12_

- [x] 17. Implement `navigateBack()` function

  - [x] 17.1 Create `navigateBack()` function in `assets/immersive/core/room-manager.js`
    - Check if `navigationStack.length === 0`, return early with warning if empty
    - Pop previous room from stack: `var previousRoom = immersiveState.navigationStack.pop()`
    - Call `goToRoom(previousRoom, false, true)` with `fromBack=true`
    - Track analytics event: `trackImmersiveEvent('navigation_back', { from_room, to_room, stack_depth })`
    - _Bug_Condition: No `navigateBack()` function exists_
    - _Expected_Behavior: `navigateBack()` pops from stack and navigates to previous room_
    - _Requirements: 5.2, 5.10, 5.11_

  - [x] 17.2 Add error handling for empty stack
    - Verify function returns early if stack is empty
    - Log warning message: "Cannot navigate back: navigation stack is empty"
    - Test that calling `navigateBack()` with empty stack does not throw error
    - _Bug_Condition: No error handling for empty navigation stack_
    - _Expected_Behavior: Function handles empty stack gracefully_
    - _Requirements: 5.12_

- [x] 18. Implement `updateBackButtonVisibility()` function

  - [x] 18.1 Create `updateBackButtonVisibility()` function
    - Query back button: `var backBtn = document.querySelector('[data-immersive-back]')`
    - If `navigationStack.length > 0`: remove `hidden` attribute, set `disabled=false`
    - If `navigationStack.length === 0`: add `hidden` attribute, set `disabled=true`
    - _Bug_Condition: No function to update back button visibility_
    - _Expected_Behavior: Back button visibility reflects navigation stack state_
    - _Requirements: 5.5, 5.12_

  - [x] 18.2 Test visibility logic
    - Test with empty stack: button should be hidden and disabled
    - Test with one item in stack: button should be visible and enabled
    - Test with multiple items in stack: button should be visible and enabled
    - _Bug_Condition: Back button visibility logic not tested_
    - _Expected_Behavior: Button visibility correctly reflects stack state_
    - _Requirements: 5.12_

- [x] 19. Implement `canNavigateBack()` helper function

  - [x] 19.1 Create `canNavigateBack()` function
    - Return `immersiveState.navigationStack.length > 0`
    - Add function documentation
    - _Bug_Condition: No helper to check if back navigation is possible_
    - _Expected_Behavior: Helper function returns true if stack has items_
    - _Requirements: 5.12_

- [x] 20. Expose new functions in global API

  - [x] 20.1 Update `window.ImmersiveRoomManager` namespace
    - Add `navigateBack: navigateBack` to namespace object
    - Add `canNavigateBack: canNavigateBack` to namespace object
    - Add `updateBackButtonVisibility: updateBackButtonVisibility` to namespace object
    - _Bug_Condition: New navigation functions not exposed globally_
    - _Expected_Behavior: New functions accessible via `window.ImmersiveRoomManager`_
    - _Requirements: 2.9_

  - [x] 20.2 Add backward-compatible global aliases
    - Add `window.navigateBack = navigateBack`
    - Add `window.canNavigateBack = canNavigateBack`
    - _Bug_Condition: New functions not available as global aliases_
    - _Expected_Behavior: Critical functions accessible directly from global scope_
    - _Requirements: 2.9_

### Phase 14: UI Implementation

- [x] 21. Add back button to immersive header

  - [x] 21.1 Add back button HTML to `sections/immersive-canvas.liquid`
    - Add button after tilt toggle, before mode switch button
    - Use class `immersive-header__icon-btn immersive-back-btn`
    - Add `data-immersive-back` attribute for JavaScript targeting
    - Add `aria-label="{{ 'sections.immersive_store.back_to_previous_room' | t }}"`
    - Add `hidden` attribute (initially hidden)
    - Add back arrow SVG icon: `<path d="M19 12H5M12 19l-7-7 7-7"/>`
    - _Bug_Condition: No back button in immersive header_
    - _Expected_Behavior: Back button exists in header with proper attributes_
    - _Requirements: 5.5_

  - [x] 21.2 Add back button CSS styles
    - Add `.immersive-back-btn` base styles matching other header icon buttons
    - Add hover state: `opacity: 1`, `background: rgba(0, 0, 0, 0.6)`, `transform: scale(1.05)`
    - Add disabled state: `opacity: 0.3`, `cursor: not-allowed`
    - Add hidden state: `display: none`
    - Add focus-visible state: `outline: 2px solid #d4af37`
    - Add mobile responsive styles: smaller size on mobile (2.25rem)
    - _Bug_Condition: Back button has no styles_
    - _Expected_Behavior: Back button styled consistently with other header buttons_
    - _Requirements: 5.5_

  - [x] 21.3 Test back button rendering
    - Verify button renders in header
    - Verify button is initially hidden
    - Verify button has correct ARIA attributes
    - Verify button icon displays correctly
    - _Bug_Condition: Back button rendering not verified_
    - _Expected_Behavior: Back button renders correctly in all states_
    - _Requirements: 5.5_

### Phase 15: Event Binding

- [x] 22. Wire back button click handler

  - [x] 22.1 Add event listener in `bindImmersiveNav()` function
    - Query back button: `var backBtn = document.querySelector('[data-immersive-back]')`
    - Add click listener: `backBtn.addEventListener('click', function() { navigateBack(); })`
    - Verify listener is added during initialization
    - _Bug_Condition: Back button has no click handler_
    - _Expected_Behavior: Clicking back button calls `navigateBack()`_
    - _Requirements: 5.11_

  - [x] 22.2 Test click handler
    - Navigate through rooms to build stack
    - Click back button
    - Verify `navigateBack()` is called
    - Verify navigation occurs to previous room
    - _Bug_Condition: Click handler not tested_
    - _Expected_Behavior: Click handler triggers back navigation_
    - _Requirements: 5.11_

### Phase 16: Initialization

- [x] 23. Restore navigation stack on initialization

  - [x] 23.1 Update `initImmersiveScene()` to restore stack
    - Call `loadState()` to get saved state
    - Check if `savedState.navigationStack` exists and is array
    - Restore to `immersiveState.navigationStack`
    - Call `updateBackButtonVisibility()` after restoration
    - _Bug_Condition: Navigation stack not restored on page load_
    - _Expected_Behavior: Stack restored from sessionStorage on init_
    - _Requirements: 5.15_

  - [x] 23.2 Test stack restoration
    - Navigate through rooms to build stack
    - Refresh page
    - Verify stack is restored correctly
    - Verify back button visibility reflects restored stack
    - _Bug_Condition: Stack restoration not tested_
    - _Expected_Behavior: Stack persists across page refreshes_
    - _Requirements: 5.15_

### Phase 17: Localization

- [x] 24. Add translation keys

  - [x] 24.1 Add keys to `locales/en.default.json`
    - Add `sections.immersive_store.back_to_previous_room`: "Back to previous room"
    - Add `sections.immersive_store.navigation_back_aria`: "Navigate back to {{ room_name }}"
    - Verify keys are properly namespaced
    - _Bug_Condition: Translation keys missing_
    - _Expected_Behavior: Translation keys exist for back button_
    - _Requirements: 5.5_

  - [x] 24.2 Test translations
    - Verify back button uses translated aria-label
    - Test with different locales if available
    - _Bug_Condition: Translations not tested_
    - _Expected_Behavior: Back button uses localized strings_
    - _Requirements: 5.5_

### Phase 18: Edge Cases

- [x] 25. Handle edge cases

  - [x] 25.1 Test initial load with deep-link
    - Load page with `?open_product=handle` parameter
    - Verify navigation stack remains empty (panel opening doesn't affect stack)
    - Verify back button remains hidden
    - _Bug_Condition: Deep-link affects navigation stack incorrectly_
    - _Expected_Behavior: Panel opening does not modify navigation stack_
    - _Preservation: Deep-link behavior unchanged_
    - _Requirements: 5.13, 6.6_

  - [x] 25.2 Test hardcoded "Back to lounge" hotspots
    - Navigate `lounge → designer_houses`
    - Click "Back to lounge" hotspot
    - Verify navigation goes to lounge
    - Verify `designer_houses` is pushed onto stack
    - Click back button
    - Verify navigation returns to `designer_houses`
    - _Bug_Condition: Hardcoded hotspots don't work with navigation stack_
    - _Expected_Behavior: Hardcoded hotspots push current room onto stack_
    - _Preservation: Hardcoded hotspots continue to navigate to lounge_
    - _Requirements: 5.7, 6.1_

  - [x] 25.3 Test guided mode navigation
    - Activate guided mode
    - Let guided mode advance through rooms
    - Verify each transition is tracked in navigation stack
    - Click back button
    - Verify navigation returns to previous guided mode room
    - _Bug_Condition: Guided mode navigation not tracked in stack_
    - _Expected_Behavior: Guided mode transitions tracked in stack_
    - _Preservation: Guided mode navigation unchanged_
    - _Requirements: 5.7, 6.7_

  - [x] 25.4 Test editorial overlay navigation
    - Navigate to `designer_houses`
    - Open editorial overlay
    - Close editorial overlay
    - Verify navigation stack unchanged
    - Click back button
    - Verify navigation returns to previous room (not affected by editorial)
    - _Bug_Condition: Editorial overlay affects navigation stack_
    - _Expected_Behavior: Editorial overlay does not modify stack_
    - _Preservation: Editorial overlay behavior unchanged_
    - _Requirements: 5.14, 6.8_

  - [x] 25.5 Test panel navigation
    - Navigate to `designer_houses`
    - Open collection panel
    - Open product panel from collection
    - Close product panel
    - Close collection panel
    - Verify navigation stack unchanged
    - Click back button
    - Verify navigation returns to previous room (not affected by panels)
    - _Bug_Condition: Panel navigation affects navigation stack_
    - _Expected_Behavior: Panel navigation does not modify stack_
    - _Preservation: Panel navigation unchanged_
    - _Requirements: 5.13, 5.14, 6.4_

  - [x] 25.6 Test navigation with repeated rooms
    - Navigate `lounge → designer_houses → lounge → occasions`
    - Verify stack contains `['lounge', 'designer_houses', 'lounge']`
    - Click back button three times
    - Verify navigation sequence: `occasions → lounge → designer_houses → lounge`
    - _Bug_Condition: Repeated rooms not handled correctly_
    - _Expected_Behavior: Stack preserves all navigation steps including repeats_
    - _Requirements: 5.9_

### Phase 19: Verification

- [x] 26. Verify bug condition exploration test now passes

  - [x] 26.1 Re-run bug condition exploration test from task 13
    - **Property 3: Expected Behavior** - Navigation History Tracked
    - **IMPORTANT**: Re-run the SAME test from task 13 - do NOT write a new test
    - Run bug condition exploration test from step 13
    - Verify `immersiveState.navigationStack` exists and is an array
    - Verify navigating `storefront → lounge → designer_houses → occasions` tracks path in stack
    - Verify stack contains `['storefront', 'lounge', 'designer_houses']` after navigation
    - Verify back button exists in DOM (`[data-immersive-back]` found)
    - Verify `goToRoom()` accepts `fromBack` parameter
    - Verify `navigateBack()` function exists and works correctly
    - Verify `canNavigateBack()` returns true when stack has items
    - Verify back button is visible when stack has items
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.7, 5.10, 5.11, 5.12_

  - [x] 26.2 Verify preservation tests still pass
    - **Property 5: Preservation** - Existing Navigation Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 14 - do NOT write new tests
    - Run preservation property tests from step 14
    - Verify hardcoded "Back to lounge" hotspots still navigate directly to lounge
    - Verify `_browsingContext.visitedRooms` continues to track visited rooms for recommendations
    - Verify `trackRoomVisit()` continues to add rooms to `visitedRooms`
    - Verify breadcrumbs in product/collection panels continue to work correctly
    - Verify `syncVisitedRooms()` continues to update room picker UI
    - Verify deep-link URL parameters continue to open panels correctly
    - Verify guided mode navigation continues to work correctly
    - Verify editorial overlays continue to open/close without affecting room state
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

### Phase 20: Property-Based Testing

- [x] 27. Property-based tests for navigation history

  - [x] 27.1 Test navigation stack integrity
    - Generate random navigation sequences (2-10 rooms)
    - Navigate through sequence using `goToRoom()`
    - Verify stack contains all previous rooms in correct order
    - Verify current room is last room in sequence
    - Verify `canNavigateBack()` returns true
    - _Property: Navigation stack accurately reflects navigation path_
    - _Requirements: 5.1, 5.3, 5.7, 5.9_

  - [x] 27.2 Test back navigation correctness
    - Generate random navigation sequences (3-10 rooms)
    - Navigate forward through sequence
    - Call `navigateBack()` once
    - Verify current room is previous room in sequence
    - Verify stack is reduced by one item
    - Verify stack order is preserved
    - _Property: Back navigation returns to previous room and updates stack correctly_
    - _Requirements: 5.2, 5.10_

  - [x] 27.3 Test back button visibility
    - Generate random stack states (0-5 items)
    - Set `immersiveState.navigationStack` to generated stack
    - Call `updateBackButtonVisibility()`
    - Verify button visibility matches stack state (visible if length > 0)
    - Verify button disabled state matches stack state (disabled if length === 0)
    - _Property: Back button visibility correctly reflects navigation stack state_
    - _Requirements: 5.5, 5.12_

  - [x] 27.4 Test full navigation cycle
    - Generate random navigation sequences
    - Navigate forward through entire sequence
    - Navigate back through entire sequence using `navigateBack()`
    - Verify final state matches initial state
    - Verify stack is empty after navigating back through all rooms
    - _Property: Full forward-then-back cycle returns to initial state_
    - _Requirements: 5.2, 5.10, 5.12_

### Phase 21: Integration Testing

- [x] 28. Integration testing for navigation history

  - [x] 28.1 Test full navigation sequence with back button
    - Navigate `storefront → lounge → designer_houses → occasions`
    - Verify back button appears after first navigation
    - Click back button three times
    - Verify navigation sequence: `occasions → designer_houses → lounge → storefront`
    - Verify back button hidden when at `storefront`
    - _Requirements: 5.1, 5.2, 5.5, 5.11, 5.12_

  - [x] 28.2 Test navigation with panels
    - Navigate `lounge → designer_houses`
    - Open collection panel
    - Open product panel from collection
    - Close panels
    - Click back button
    - Verify navigation returns to `lounge` (panels didn't affect stack)
    - _Requirements: 5.13, 5.14_

  - [x] 28.3 Test navigation with editorial
    - Navigate `lounge → designer_houses`
    - Open editorial overlay
    - Close editorial overlay
    - Click back button
    - Verify navigation returns to `lounge` (editorial didn't affect stack)
    - _Requirements: 5.14, 6.8_

  - [x] 28.4 Test hardcoded "Back to lounge" with back button
    - Navigate `lounge → designer_houses`
    - Click "Back to lounge" hotspot
    - Verify navigation goes to `lounge`
    - Click back button
    - Verify navigation returns to `designer_houses`
    - _Requirements: 5.7, 6.1_

  - [x] 28.5 Test guided mode with back button
    - Activate guided mode
    - Let guided mode advance through 3 rooms
    - Click back button
    - Verify navigation returns to previous guided mode room
    - Verify guided mode is exited (back navigation exits guided mode)
    - _Requirements: 5.7, 6.7_

  - [x] 28.6 Test session persistence
    - Navigate through 3 rooms to build stack
    - Refresh page
    - Verify stack is restored
    - Verify back button is visible
    - Click back button
    - Verify navigation works correctly with restored stack
    - _Requirements: 5.15_

  - [x] 28.7 Test mobile functionality
    - Test all navigation history flows on mobile device or mobile viewport
    - Verify back button is appropriately sized for touch (2.25rem)
    - Verify touch events work correctly
    - Verify navigation stack works identically on mobile
    - _Requirements: 6.10_

### Phase 22: Manual Verification

- [ ] 29. Manual verification checklist for navigation history
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
  - [ ] Open browser console → no errors related to navigation history
  - _Requirements: All requirements 5.1-5.15, 6.1-6.10_

- [x] 30. Final checkpoint - Ensure all tests pass
  - Ensure all tests for both Bug 1 (Global API) and Bug 2 (Navigation History) pass
  - Ask the user if questions arise
  - Verify no regressions in existing functionality
  - Verify both bugs are completely fixed
