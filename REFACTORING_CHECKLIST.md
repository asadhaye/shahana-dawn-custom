# Immersive Store Refactoring Checklist

## Phase 1: Dead Code Removal ✅ COMPLETE
**Risk:** None | **Time:** 30 minutes | **Value:** Immediate cleanup

- [x] Run backup script: `bash scripts/cleanup-immersive-store.sh`
- [x] Remove `normalizeHotspot()` function (line ~120)
- [x] Remove `getNormalizedHotspots()` function (line ~148)
- [x] Remove `openGlassPanel()` function (line ~1191)
- [x] Remove `closeOverlay()` function (line ~1374)
- [x] Remove `mouseMoveRafPending` variable (line ~597)
- [x] Remove `textureWidth` variable (line ~215)
- [x] Run tests: `npm test` - All tests passing ✅
- [x] Manual QA: Test room navigation, panels, wishlist
- [x] Commit: `git commit -m "refactor: remove dead code from immersive-store.js"`

---

## Phase 2: Extract Utilities ✅ COMPLETE
**Risk:** Low | **Time:** 2 hours | **Value:** High (reusability)

### 2.1 Create Utility Files
- [x] Create `assets/immersive/utils/fetch.js`
- [x] Create `assets/immersive/utils/analytics.js`
- [x] Create `assets/immersive/utils/dom.js`
- [x] Create `assets/immersive/utils/skeleton.js`

### 2.2 Extract `fetch.js`
- [x] Move `fetchWithCache()` function
- [x] Move `fetchSectionHtml()` function
- [x] Move `contentCache` object
- [x] Export as module: `window.ImmersiveFetch = { ... }`
- [x] Update imports in main file
- [x] Test: Verify panel loading still works

### 2.3 Extract `analytics.js`
- [x] Move `trackImmersiveEvent()` function
- [x] Move `trackFrictionPoint()` function
- [x] Move `frictionPoints` object
- [x] Move `getFrictionSummary()` function
- [x] Export as module: `window.ImmersiveAnalytics = { ... }`
- [x] Update imports in main file
- [x] Test: Verify GA4/Meta Pixel events fire

### 2.4 Extract `dom.js`
- [x] Move `openDialogFocus()` function
- [x] Move `closeDialogFocus()` function
- [x] Move `getFocusableElements()` function
- [x] Move `FOCUSABLE_SELECTORS` constant
- [x] Export as module: `window.ImmersiveDOM = { ... }`
- [x] Update imports in main file
- [x] Test: Verify focus management works

### 2.5 Extract `skeleton.js`
- [x] Move `renderSkeletonGrid()` function
- [x] Move `renderSkeletonProduct()` function
- [x] Move `renderSkeletonRoom()` function
- [x] Export as module: `window.ImmersiveSkeleton = { ... }`
- [x] Update imports in main file
- [x] Test: Verify loading states render

### 2.6 Testing & Commit
- [x] Write unit tests for each utility
- [x] Run full test suite: `npm test`
- [x] Manual QA: Test all features
- [x] Commit: `git commit -m "refactor: extract utilities from immersive-store.js"`

---

## Phase 3: Extract WebGL Engine ✅ COMPLETE
**Risk:** Medium | **Time:** 1 day | **Value:** High (core separation)

### 3.1 Create Core Files
- [x] Create `assets/immersive/core/webgl-engine.js`
- [x] Create `assets/immersive/core/room-manager.js`
- [x] Create `assets/immersive/core/state-manager.js`

### 3.2 Extract `webgl-engine.js`
- [x] Move Three.js initialization
- [x] Move shader definitions (vertex + fragment)
- [x] Move `initImmersiveScene()` function
- [x] Move `animate()` function
- [x] Move `handleResize()` function
- [x] Move `isWebGLSupported()` function
- [x] Move `showWebGLFallback()` function
- [x] Move renderer/scene/camera/uniforms globals
- [x] Export as module: `window.ImmersiveWebGLEngine = { ... }`
- [x] Update imports in main file
- [x] Test: Verify WebGL rendering works

### 3.3 Extract `room-manager.js`
- [x] Move `STORE_ROOMS` constant
- [x] Move `mergeDynamicRoomConfig()` function
- [x] Move `goToRoom()` function
- [x] Move `loadRoomTextures()` function
- [x] Move `getRoomTextureUrls()` function
- [x] Move `preloadRoom()` function
- [x] Move `renderHotspots()` function
- [x] Move `updateRoomBadge()` function
- [x] Move texture cache logic
- [x] Export as module: `window.ImmersiveRoomManager = { ... }`
- [x] Update imports in main file
- [x] Test: Verify room transitions work

### 3.4 Extract `state-manager.js`
- [x] Move `immersiveState` object
- [x] Move `saveState()` function
- [x] Move `loadState()` function
- [x] Move `clearState()` function
- [x] Move `writeImmersivePreference()` function
- [x] Move `readImmersivePreference()` function
- [x] Move `clearImmersivePreference()` function
- [x] Move state persistence keys
- [x] Export as module: `window.ImmersiveStateManager = { ... }`
- [x] Update imports in main file
- [x] Test: Verify state persistence works

### 3.5 Testing & Commit
- [x] Write unit tests for each module
- [x] Run full test suite: `npm test`
- [x] Visual regression tests
- [x] Performance benchmarks (FPS, memory)
- [x] Manual QA: Full immersive experience
- [x] Commit: `git commit -m "refactor: extract WebGL engine from immersive-store.js"`

---

## Phase 4: Extract Features ✅ COMPLETE
**Risk:** Low | **Time:** 3 days | **Value:** High (modularity)

### 4.1 Extract Search
- [x] Create `assets/immersive/features/search.js`
- [x] Move `initImmersiveSearch()` function
- [x] Move search-related globals
- [x] Move `doSearch()`, `renderResults()`, etc.
- [x] Export as module
- [x] Test: Verify search works

### 4.2 Extract Filters
- [x] Create `assets/immersive/features/filters.js`
- [x] Move `initImmersiveFilters()` function
- [x] Move filter state management
- [x] Move `buildFilterUrl()`, `applyFilters()`, etc.
- [x] Export as module
- [x] Test: Verify filters work

### 4.3 Extract FAB
- [x] Create `assets/immersive/features/fab.js`
- [x] Move `initImmersiveBottomNav()` function
- [x] Move FAB drag logic
- [x] Move position persistence
- [x] Export as module
- [x] Test: Verify FAB works

### 4.4 Extract Gestures
- [x] Create `assets/immersive/features/gestures.js`
- [x] Move `initImmersiveGestures()` function
- [x] Move swipe detection logic
- [x] Move `classifyGesture()` function
- [x] Export as module
- [x] Test: Verify gestures work

### 4.5 Extract Quick Add
- [x] Create `assets/immersive/features/quick-add.js`
- [x] Move `initImmersiveQuickAdd()` function
- [x] Move `openQuickAdd()`, `closeQuickAdd()` functions
- [x] Move modal rendering logic
- [x] Export as module
- [x] Test: Verify quick add works

### 4.6 Extract Limited Time
- [x] Create `assets/immersive/features/limited-time.js`
- [x] Move `initImmersiveLimitedTime()` function
- [x] Move countdown logic
- [x] Move low stock badge logic
- [x] Export as module
- [x] Test: Verify countdowns work

### 4.7 Extract Room Recommender
- [x] Create `assets/immersive/features/room-recommender.js`
- [x] Move `initImmersiveRoomRecommender()` function
- [x] Move recommendation logic
- [x] Move browsing context tracking
- [x] Export as module
- [x] Test: Verify recommendations work

### 4.8 Testing & Commit
- [x] Write unit tests for each feature
- [x] Run full test suite: `npm test`
- [x] Manual QA: Test each feature
- [x] Commit: `git commit -m "refactor: extract features from immersive-store.js"`

---

## Phase 5: Extract Panels ✅ COMPLETE
**Risk:** Medium | **Time:** 2 days | **Value:** High (core UX)

### 5.1 Extract Glass Panel System
- [x] Create `assets/immersive/panels/glass-panel.js`
- [x] Move `openPanel()` function
- [x] Move `closePanel()` function
- [x] Move `openGlassPanelWithSection()` function
- [x] Move panel focus management
- [x] Export as module
- [x] Test: Verify panel system works

### 5.2 Extract Product Panel
- [x] Create `assets/immersive/panels/product-panel.js`
- [x] Move `openProductPanel()` function
- [x] Move `setupVariantButtons()` function
- [x] Move `setupBuyNowForm()` function
- [x] Move `setupMediaThumbs()` function
- [x] Move `setupShareButton()` function
- [x] Move `setupDeliveryDates()` function
- [x] Move `setupVirtualTryOn()` function
- [x] Move `loadProductRecommendations()` function
- [x] Export as module
- [x] Test: Verify product panel works

### 5.3 Extract Collection Panel
- [x] Create `assets/immersive/panels/collection-panel.js`
- [x] Move `openCollectionPanel()` function
- [x] Move collection-specific logic
- [x] Export as module
- [x] Test: Verify collection panel works

### 5.4 Extract Wishlist Panel
- [x] Create `assets/immersive/panels/wishlist-panel.js`
- [x] Move `initWishlist()` function
- [x] Move `openWishlistPanel()` function
- [x] Move `closeWishlistPanel()` function
- [x] Move `renderWishlistPanel()` function
- [x] Move `toggleWishlistItem()` function
- [x] Move wishlist state management
- [x] Export as module
- [x] Test: Verify wishlist works

### 5.5 Testing & Commit
- [x] Write unit tests for each panel
- [x] Run full test suite: `npm test`
- [x] Manual QA: Test all panels
- [x] Commit: `git commit -m "refactor: extract panels from immersive-store.js"`

---

## Phase 6: Extract Editorial & Guided ✅ COMPLETE
**Risk:** Low | **Time:** 2 days | **Value:** Medium (optional features)

### 6.1 Extract Editorial Mode
- [x] Create `assets/immersive/editorial/editorial-mode.js`
- [x] Move `enterEditorialMode()` function
- [x] Move `exitEditorialMode()` function
- [x] Move `performEditorialUIActivation()` function
- [x] Move `updateCameraForMode()` function
- [x] Export as module
- [x] Test: Verify editorial mode works

### 6.2 Extract Scroll Reveal
- [x] Create `assets/immersive/editorial/scroll-reveal.js`
- [x] Move `initEditorialScrollReveal()` function
- [x] Move scroll detection logic
- [x] Export as module
- [x] Test: Verify scroll reveal works

### 6.3 Extract Hero Parallax
- [x] Create `assets/immersive/editorial/hero-parallax.js`
- [x] Move `initEditorialHeroParallax()` function
- [x] Move parallax animation logic
- [x] Export as module
- [x] Test: Verify hero parallax works

### 6.4 Extract Timeline
- [x] Create `assets/immersive/editorial/timeline.js`
- [x] Move `window.ImmersiveEditorial` object
- [x] Move timeline interaction logic
- [x] Export as module
- [x] Test: Verify timeline works

### 6.5 Extract Guided Mode
- [x] Create `assets/immersive/guided/guided-mode.js`
- [x] Move `initGuidedMode()` function
- [x] Move `activateGuidedMode()` function
- [x] Move `exitGuidedMode()` function
- [x] Move guided sequence logic
- [x] Export as module
- [x] Test: Verify guided mode works

### 6.6 Testing & Commit
- [x] Write unit tests for each module
- [x] Run full test suite: `npm test`
- [x] Manual QA: Test editorial and guided flows
- [x] Commit: `git commit -m "refactor: extract editorial and guided from immersive-store.js"`

---

## Phase 7: Performance Optimization ✅ COMPLETE
**Risk:** Low | **Time:** 1 week | **Value:** High (UX improvement)

### 7.1 Cache DOM References
- [x] Audit all `document.querySelector()` calls
- [x] Create cache object for frequently accessed elements
- [x] Add cache invalidation on DOM changes
- [x] Benchmark: Measure frame time improvement

### 7.2 Batch Layout Operations
- [x] Audit all `getBoundingClientRect()` calls
- [x] Batch reads before writes
- [x] Use `requestAnimationFrame` for layout updates
- [x] Benchmark: Measure layout thrashing reduction

### 7.3 Optimize Event Listeners
- [x] Audit all event listener additions
- [x] Add cleanup on component unmount
- [x] Use event delegation where possible
- [x] Benchmark: Measure memory usage improvement

### 7.4 Lazy Load Features
- [x] Use `IntersectionObserver` for feature init
- [x] Defer non-critical features to idle time
- [x] Use dynamic imports for large modules
- [x] Benchmark: Measure initial load time improvement

### 7.5 Testing & Commit
- [x] Run performance benchmarks
- [x] Compare before/after metrics
- [x] Manual QA: Verify no regressions
- [x] Commit: `git commit -m "perf: optimize immersive store performance"`

---

## Phase 8: Testing & Documentation ✅ COMPLETE
**Risk:** None | **Time:** 1 week | **Value:** High (maintainability)

### 8.1 Unit Tests
- [x] Write tests for all utilities
- [x] Write tests for all features
- [x] Write tests for all panels
- [x] Target: >80% code coverage

### 8.2 Integration Tests
- [x] Test room transitions
- [x] Test panel workflows
- [x] Test wishlist operations
- [x] Test search functionality

### 8.3 Visual Regression Tests
- [x] Set up visual testing framework
- [x] Capture baseline screenshots
- [x] Test all rooms
- [x] Test all panels

### 8.4 Documentation
- [x] Update README with new architecture
- [x] Document each module's API
- [x] Add JSDoc comments to all functions
- [x] Create migration guide for developers

### 8.5 Final Review
- [x] Code review with team
- [x] Performance audit
- [x] Accessibility audit
- [x] Security audit

---

## Success Metrics

### Code Quality
- [x] File size: <500 lines per module (currently 6,968 in one file)
- [x] Cyclomatic complexity: <10 per function
- [x] Test coverage: >80% (currently ~40%)
- [x] Dead code: 0 items (currently 6)

### Performance
- [x] Initial JS parse time: <100ms (currently ~180ms)
- [x] Room transition time: <500ms (currently ~800ms)
- [x] Panel open time: <300ms (currently ~400ms)
- [x] FPS: 60fps sustained (currently 55-60fps)
- [x] Memory usage (10min): <30MB (currently ~45MB)

### Maintainability
- [x] Module count: ~20 modules (currently 1 monolith)
- [x] Average module size: ~300 lines
- [x] Dependency graph: Clear, no circular deps
- [x] Documentation: 100% of public APIs

---

## Rollback Plan

If any phase causes issues:

1. **Immediate Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore from Backup:**
   ```bash
   cp assets/immersive-store.js.backup.YYYYMMDD_HHMMSS assets/immersive-store.js
   ```

3. **Verify Rollback:**
   - Run tests: `npm test`
   - Manual QA: Test all features
   - Deploy to staging
   - Monitor for errors

---

## Notes

- Each phase should be completed in a separate PR
- All PRs require code review + QA approval
- Performance benchmarks required for Phase 3, 5, 7
- Visual regression tests required for Phase 3, 5, 6
- Backward compatibility must be maintained throughout
- Legacy API exports can be removed after 2 releases

---

## Timeline

| Phase | Duration | Dependencies | Risk |
|-------|----------|--------------|------|
| Phase 1 | 30 min | None | None |
| Phase 2 | 2 hours | Phase 1 | Low |
| Phase 3 | 1 day | Phase 2 | Medium |
| Phase 4 | 3 days | Phase 3 | Low |
| Phase 5 | 2 days | Phase 4 | Medium |
| Phase 6 | 2 days | Phase 5 | Low |
| Phase 7 | 1 week | Phase 6 | Low |
| Phase 8 | 1 week | Phase 7 | None |

**Total Estimated Time:** 3-4 weeks (with testing and QA)

---

## Sign-off

- [x] Technical Lead Approval
- [x] QA Lead Approval
- [x] Product Owner Approval
- [x] Deployment Plan Approved
