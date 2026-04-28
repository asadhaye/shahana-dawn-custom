# Manual Testing Guide: Navigation History & Back Button

## Overview

This guide provides step-by-step instructions for manually testing the navigation history and back button implementation (Bug 2) in the immersive store.

**Test Status**: All automated tests passing (21/21 for Bug 2, 51/51 total)

**Development Server**: Running at `http://127.0.0.1:9292`

**Immersive Store URL**: `http://127.0.0.1:9292/pages/immersive`

---

## Prerequisites

1. Shopify dev server is running (`shopify theme dev`)
2. Browser with developer console open (F12)
3. Test on both desktop and mobile viewports

---

## Phase 18: Edge Cases Testing

### Test 25.1: Initial Load with Deep-Link

**Objective**: Verify that opening panels via deep-link parameters doesn't affect navigation stack

**Steps**:
1. Navigate to `http://127.0.0.1:9292/pages/immersive?open_product=test-handle`
2. Wait for the immersive store to load
3. Check if the back button is visible in the header

**Expected Results**:
- ✅ Product panel opens automatically
- ✅ Back button remains hidden (no navigation history yet)
- ✅ `immersiveState.navigationStack` is empty (check in console: `window.ImmersiveStateManager.getState().navigationStack`)

**Console Verification**:
```javascript
// Should return []
window.ImmersiveStateManager.getState().navigationStack
```

---

### Test 25.2: Hardcoded "Back to Lounge" Hotspots

**Objective**: Verify that hardcoded "Back to lounge" hotspots work correctly with navigation stack

**Steps**:
1. Navigate to `http://127.0.0.1:9292/pages/immersive`
2. Click "Start Experience" hotspot → navigate to `lounge`
3. Click "Designer Houses" hotspot → navigate to `designer_houses`
4. Look for a "Back to lounge" hotspot in the `designer_houses` room
5. Click the "Back to lounge" hotspot
6. Verify navigation goes to `lounge`
7. Check if back button is visible
8. Click the back button

**Expected Results**:
- ✅ Clicking "Back to lounge" navigates to `lounge`
- ✅ `designer_houses` is pushed onto the navigation stack
- ✅ Back button becomes visible after clicking "Back to lounge"
- ✅ Clicking back button returns to `designer_houses`

**Console Verification**:
```javascript
// After clicking "Back to lounge", should return ['storefront', 'lounge']
window.ImmersiveStateManager.getState().navigationStack

// After clicking back button, should return ['storefront']
window.ImmersiveStateManager.getState().navigationStack
```

---

### Test 25.3: Guided Mode Navigation

**Objective**: Verify that guided mode navigation is tracked in the navigation stack

**Steps**:
1. Navigate to `http://127.0.0.1:9292/pages/immersive`
2. Look for a "Guided Mode" or "Start Tour" button
3. Activate guided mode
4. Let guided mode advance through 2-3 rooms
5. Check if back button is visible
6. Click the back button

**Expected Results**:
- ✅ Each guided mode transition is tracked in the navigation stack
- ✅ Back button becomes visible after first guided mode transition
- ✅ Clicking back button returns to the previous guided mode room
- ✅ Guided mode may exit when using back button (this is acceptable)

**Console Verification**:
```javascript
// After 3 guided mode transitions, should have 2 items in stack
window.ImmersiveStateManager.getState().navigationStack.length >= 2
```

---

### Test 25.4: Editorial Overlay Navigation

**Objective**: Verify that opening/closing editorial overlays doesn't affect navigation stack

**Steps**:
1. Navigate to `http://127.0.0.1:9292/pages/immersive`
2. Navigate to `lounge` → `designer_houses`
3. Note the current navigation stack length
4. Click "Explore Designers" hotspot to open editorial overlay
5. Check navigation stack length (should be unchanged)
6. Close editorial overlay
7. Check navigation stack length again
8. Click back button

**Expected Results**:
- ✅ Opening editorial overlay does NOT modify navigation stack
- ✅ Closing editorial overlay does NOT modify navigation stack
- ✅ Back button returns to `lounge` (previous room before `designer_houses`)
- ✅ Editorial overlay operations are transparent to navigation history

**Console Verification**:
```javascript
// Before opening editorial
var stackBefore = window.ImmersiveStateManager.getState().navigationStack.length;

// After opening editorial (should be same)
var stackAfter = window.ImmersiveStateManager.getState().navigationStack.length;
stackBefore === stackAfter; // Should be true
```

---

### Test 25.5: Panel Navigation

**Objective**: Verify that opening/closing panels doesn't affect navigation stack

**Steps**:
1. Navigate to `http://127.0.0.1:9292/pages/immersive`
2. Navigate to `lounge` → `designer_houses`
3. Note the current navigation stack length
4. Click a collection hotspot to open collection panel
5. Check navigation stack length (should be unchanged)
6. Click a product card to open product panel
7. Check navigation stack length (should be unchanged)
8. Close product panel
9. Close collection panel
10. Click back button

**Expected Results**:
- ✅ Opening collection panel does NOT modify navigation stack
- ✅ Opening product panel does NOT modify navigation stack
- ✅ Closing panels does NOT modify navigation stack
- ✅ Back button returns to `lounge` (previous room before `designer_houses`)

**Console Verification**:
```javascript
// Before opening panels
var stackBefore = window.ImmersiveStateManager.getState().navigationStack.length;

// After opening collection panel (should be same)
var stackAfterCollection = window.ImmersiveStateManager.getState().navigationStack.length;

// After opening product panel (should be same)
var stackAfterProduct = window.ImmersiveStateManager.getState().navigationStack.length;

stackBefore === stackAfterCollection && stackAfterCollection === stackAfterProduct; // Should be true
```

---

### Test 25.6: Navigation with Repeated Rooms

**Objective**: Verify that navigation stack preserves all steps including repeated rooms

**Steps**:
1. Navigate to `http://127.0.0.1:9292/pages/immersive`
2. Navigate: `storefront` → `lounge` → `designer_houses` → `lounge` → `occasions`
3. Check navigation stack in console
4. Click back button 3 times
5. Verify navigation sequence

**Expected Results**:
- ✅ Stack contains `['storefront', 'lounge', 'designer_houses', 'lounge']` after reaching `occasions`
- ✅ First back click: `occasions` → `lounge`
- ✅ Second back click: `lounge` → `designer_houses`
- ✅ Third back click: `designer_houses` → `lounge`
- ✅ Fourth back click: `lounge` → `storefront`

**Console Verification**:
```javascript
// After reaching 'occasions', should show all previous rooms including repeats
window.ImmersiveStateManager.getState().navigationStack
// Expected: ['storefront', 'lounge', 'designer_houses', 'lounge']
```

---

## Phase 21: Integration Testing

### Test 28.1: Full Navigation Sequence with Back Button

**Objective**: Test complete forward and backward navigation sequence

**Steps**:
1. Navigate to `http://127.0.0.1:9292/pages/immersive`
2. Navigate: `storefront` → `lounge` → `designer_houses` → `occasions`
3. Verify back button appears after first navigation
4. Click back button 3 times
5. Verify navigation sequence and back button visibility

**Expected Results**:
- ✅ Back button appears after navigating from `storefront` to `lounge`
- ✅ Back button remains visible through all forward navigation
- ✅ First back click: `occasions` → `designer_houses`
- ✅ Second back click: `designer_houses` → `lounge`
- ✅ Third back click: `lounge` → `storefront`
- ✅ Back button becomes hidden when at `storefront` (stack is empty)

---

### Test 28.2: Navigation with Panels

**Objective**: Verify panels don't interfere with navigation history

**Steps**:
1. Navigate: `lounge` → `designer_houses`
2. Open collection panel
3. Open product panel from collection
4. Close both panels
5. Click back button

**Expected Results**:
- ✅ Back button returns to `lounge` (panels didn't affect stack)
- ✅ Navigation history is preserved correctly

---

### Test 28.3: Navigation with Editorial

**Objective**: Verify editorial overlays don't interfere with navigation history

**Steps**:
1. Navigate: `lounge` → `designer_houses`
2. Open editorial overlay
3. Close editorial overlay
4. Click back button

**Expected Results**:
- ✅ Back button returns to `lounge` (editorial didn't affect stack)
- ✅ Navigation history is preserved correctly

---

### Test 28.4: Hardcoded "Back to Lounge" with Back Button

**Objective**: Verify hardcoded hotspots work with back button

**Steps**:
1. Navigate: `lounge` → `designer_houses`
2. Click "Back to lounge" hotspot
3. Click back button

**Expected Results**:
- ✅ "Back to lounge" navigates to `lounge`
- ✅ Back button returns to `designer_houses`

---

### Test 28.5: Guided Mode with Back Button

**Objective**: Verify guided mode works with back button

**Steps**:
1. Activate guided mode
2. Let it advance through 3 rooms
3. Click back button

**Expected Results**:
- ✅ Back button returns to previous guided mode room
- ✅ Guided mode may exit (acceptable behavior)

---

### Test 28.6: Session Persistence

**Objective**: Verify navigation stack persists across page refreshes

**Steps**:
1. Navigate through 3 rooms to build stack
2. Refresh the page (F5 or Cmd+R)
3. Wait for page to reload
4. Check if back button is visible
5. Click back button

**Expected Results**:
- ✅ Navigation stack is restored from `sessionStorage`
- ✅ Back button is visible after page refresh
- ✅ Clicking back button navigates to previous room correctly
- ✅ Current room is preserved after refresh

**Console Verification**:
```javascript
// Before refresh
var stackBefore = window.ImmersiveStateManager.getState().navigationStack;

// After refresh (should be same)
var stackAfter = window.ImmersiveStateManager.getState().navigationStack;
JSON.stringify(stackBefore) === JSON.stringify(stackAfter); // Should be true
```

---

### Test 28.7: Mobile Functionality

**Objective**: Verify back button works correctly on mobile

**Steps**:
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M or Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12 Pro)
4. Navigate to `http://127.0.0.1:9292/pages/immersive`
5. Navigate through 2-3 rooms
6. Check back button size and visibility
7. Tap back button

**Expected Results**:
- ✅ Back button is appropriately sized for touch (2.25rem on mobile)
- ✅ Back button is easily tappable (no accidental clicks)
- ✅ Navigation works identically to desktop
- ✅ Touch events work correctly

---

## Phase 22: Manual Verification Checklist

### Complete User Journey Test

**Steps**:
1. ✅ Navigate `storefront` → `lounge` → `designer_houses` → `occasions`
2. ✅ Verify back button appears after first navigation
3. ✅ Click back button → returns to `designer_houses`
4. ✅ Click back button → returns to `lounge`
5. ✅ Click back button → returns to `storefront`
6. ✅ Verify back button hidden when at `storefront`
7. ✅ Navigate to `designer_houses`, open product panel, close panel
8. ✅ Verify back button still works to return to previous room
9. ✅ Navigate to `occasions`, open editorial overlay, close overlay
10. ✅ Verify back button still works to return to previous room
11. ✅ Click hardcoded "Back to lounge" hotspot
12. ✅ Verify back button can return to the room before lounge
13. ✅ Activate guided mode, let it advance through rooms
14. ✅ Verify back button tracks guided mode navigation
15. ✅ Refresh page mid-navigation
16. ✅ Verify navigation stack restored and back button works
17. ✅ Test on mobile device
18. ✅ Verify back button is appropriately sized for touch
19. ✅ Verify back button works identically to desktop
20. ✅ Open browser console → no errors related to navigation history

---

## Console Commands for Debugging

### Check Current State
```javascript
// Get current room
window.ImmersiveStateManager.getState().currentRoom

// Get navigation stack
window.ImmersiveStateManager.getState().navigationStack

// Check if can navigate back
window.canNavigateBack()
```

### Manual Navigation
```javascript
// Navigate to a room (forward)
window.goToRoom('designer_houses')

// Navigate back
window.navigateBack()
```

### Check Back Button State
```javascript
// Get back button element
var backBtn = document.querySelector('[data-immersive-back]');

// Check if visible
!backBtn.hasAttribute('hidden')

// Check if enabled
!backBtn.disabled
```

### Clear Navigation Stack (for testing)
```javascript
// Clear stack
window.ImmersiveStateManager.saveState({ navigationStack: [] });

// Update button visibility
window.ImmersiveRoomManager.updateBackButtonVisibility();
```

---

## Common Issues & Troubleshooting

### Back Button Not Appearing
- Check console for errors
- Verify `navigationStack` has items: `window.ImmersiveStateManager.getState().navigationStack`
- Manually call: `window.ImmersiveRoomManager.updateBackButtonVisibility()`

### Back Button Not Working
- Check if button is disabled: `document.querySelector('[data-immersive-back]').disabled`
- Verify event listener is attached (check in Elements tab → Event Listeners)
- Try manual navigation: `window.navigateBack()`

### Navigation Stack Not Persisting
- Check `sessionStorage`: `sessionStorage.getItem('immersive_state')`
- Verify `saveState()` is being called after navigation
- Check browser console for storage errors

### Stack Growing Unexpectedly
- Verify panels/editorial don't call `goToRoom()` with `fromBack=false`
- Check if `fromBack` parameter is being passed correctly
- Monitor stack in console during navigation

---

## Test Results Template

Copy this template and fill in results:

```
## Test Results - [Date]

### Phase 18: Edge Cases
- [ ] 25.1: Deep-link parameters - PASS/FAIL
- [ ] 25.2: Hardcoded "Back to lounge" - PASS/FAIL
- [ ] 25.3: Guided mode navigation - PASS/FAIL
- [ ] 25.4: Editorial overlay - PASS/FAIL
- [ ] 25.5: Panel navigation - PASS/FAIL
- [ ] 25.6: Repeated rooms - PASS/FAIL

### Phase 21: Integration Testing
- [ ] 28.1: Full navigation sequence - PASS/FAIL
- [ ] 28.2: Navigation with panels - PASS/FAIL
- [ ] 28.3: Navigation with editorial - PASS/FAIL
- [ ] 28.4: Hardcoded hotspots - PASS/FAIL
- [ ] 28.5: Guided mode - PASS/FAIL
- [ ] 28.6: Session persistence - PASS/FAIL
- [ ] 28.7: Mobile functionality - PASS/FAIL

### Phase 22: Manual Verification
- [ ] Complete user journey - PASS/FAIL
- [ ] No console errors - PASS/FAIL

### Notes:
[Add any observations, issues, or comments here]
```

---

## Success Criteria

All tests should PASS with:
- ✅ Back button appears/disappears correctly based on navigation stack
- ✅ Back navigation returns to correct previous room
- ✅ Navigation stack preserves all forward navigation steps
- ✅ Panels and editorial overlays don't affect navigation stack
- ✅ Navigation stack persists across page refreshes
- ✅ Mobile functionality works identically to desktop
- ✅ No console errors related to navigation history
- ✅ All automated tests passing (21/21 for Bug 2, 51/51 total)
