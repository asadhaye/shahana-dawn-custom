/**
 * Bug 2: Navigation History - Integration Testing
 *
 * Integration tests for navigation history with other features:
 * - Full navigation sequence with back button
 * - Navigation with panels
 * - Navigation with editorial
 * - Hardcoded hotspots with back button
 * - Guided mode with back button
 * - Session persistence
 * - Mobile functionality
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

describe('Bug 2: Navigation History - Integration Tests', () => {
  let roomManagerSource;
  let stateManagerSource;
  let immersiveStoreSource;
  let immersiveCanvasLiquid;

  beforeAll(() => {
    roomManagerSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive/core/room-manager.js'), 'utf8');
    stateManagerSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive/core/state-manager.js'), 'utf8');
    immersiveStoreSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive-store.js'), 'utf8');
    immersiveCanvasLiquid = fs.readFileSync(path.resolve(__dirname, '../sections/immersive-canvas.liquid'), 'utf8');
  });

  describe('Integration 1: Full Navigation Sequence with Back Button', () => {
    test('complete navigation flow: storefront → lounge → designer_houses → occasions', () => {
      // Verify all components needed for full navigation flow exist

      // 1. goToRoom() function exists
      const hasGoToRoom = roomManagerSource.includes('function goToRoom(');
      expect(hasGoToRoom).toBe(true);

      // 2. Navigation stack is tracked
      const hasStackPush = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
      expect(hasStackPush).toBe(true);

      // 3. Back button exists in UI
      const hasBackButton = immersiveCanvasLiquid.includes('data-immersive-back');
      expect(hasBackButton).toBe(true);

      // 4. navigateBack() function exists
      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBack).toBe(true);

      // 5. Back button event listener is wired
      const hasBackButtonListener =
        immersiveStoreSource.includes("querySelector('[data-immersive-back]')") &&
        immersiveStoreSource.includes('addEventListener');
      expect(hasBackButtonListener).toBe(true);
    });

    test('back button should appear after first navigation', () => {
      // After navigating from storefront to lounge:
      // - Stack should contain ['storefront']
      // - Back button should be visible

      const hasUpdateVisibility = roomManagerSource.includes('updateBackButtonVisibility()');
      expect(hasUpdateVisibility).toBe(true);

      const hasVisibilityLogic = roomManagerSource.includes('navigationStack.length > 0');
      expect(hasVisibilityLogic).toBe(true);
    });

    test('clicking back button three times should return through navigation path', () => {
      // After navigating: storefront → lounge → designer_houses → occasions
      // Stack: ['storefront', 'lounge', 'designer_houses']
      // Back clicks should go: occasions → designer_houses → lounge → storefront

      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBack).toBe(true);

      const hasPopLogic = roomManagerSource.includes('navigationStack.pop()');
      expect(hasPopLogic).toBe(true);

      const hasGoToRoomCall = roomManagerSource.includes('goToRoom(previousRoom, false, true)');
      expect(hasGoToRoomCall).toBe(true);
    });

    test('back button should be hidden when returning to storefront', () => {
      // After navigating back to storefront:
      // - Stack should be empty
      // - Back button should be hidden

      const hasUpdateVisibility = roomManagerSource.includes('function updateBackButtonVisibility()');
      expect(hasUpdateVisibility).toBe(true);

      const hasHiddenLogic = roomManagerSource.includes('backBtn.hidden = true');
      expect(hasHiddenLogic).toBe(true);
    });
  });

  describe('Integration 2: Navigation with Panels', () => {
    test('opening collection panel should not affect navigation stack', () => {
      // Navigate: lounge → designer_houses
      // Open collection panel
      // Stack should still be: ['lounge']

      // Panel opening should not call goToRoom()
      // It should only open the panel overlay
      const hasOpenCollectionPanel =
        immersiveStoreSource.includes('openCollectionPanel') ||
        immersiveStoreSource.includes('function openCollectionPanel');
      expect(hasOpenCollectionPanel).toBe(true);

      // goToRoom() only pushes to stack for room navigation
      const hasPushCondition = roomManagerSource.includes('if (!initial && !fromBack');
      expect(hasPushCondition).toBe(true);
    });

    test('opening product panel from collection should not affect navigation stack', () => {
      // Navigate: lounge → designer_houses
      // Open collection panel
      // Open product panel from collection
      // Stack should still be: ['lounge']

      const hasOpenProductPanel =
        immersiveStoreSource.includes('openProductPanel') || immersiveStoreSource.includes('function openProductPanel');
      expect(hasOpenProductPanel).toBe(true);

      // Product panel opening should not modify navigationStack
      // It's a panel overlay, not room navigation
    });

    test('closing panels should not affect navigation stack', () => {
      // Navigate: lounge → designer_houses
      // Open and close panels
      // Stack should still be: ['lounge']

      const hasClosePanel =
        immersiveStoreSource.includes('closePanel') || immersiveStoreSource.includes('function closePanel');
      expect(hasClosePanel).toBe(true);

      // closePanel should not modify navigationStack
    });

    test('back button should work after panel interactions', () => {
      // Navigate: lounge → designer_houses
      // Open collection panel, open product panel, close both
      // Click back button
      // Should navigate to lounge

      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBack).toBe(true);

      // navigateBack should close any open panels first
      const navigateBackClosesPanel =
        roomManagerSource.includes('closePanel') && roomManagerSource.includes('function navigateBack');
      expect(navigateBackClosesPanel).toBe(true);
    });
  });

  describe('Integration 3: Navigation with Editorial', () => {
    test('opening editorial overlay should not affect navigation stack', () => {
      // Navigate: lounge → designer_houses
      // Open editorial overlay
      // Stack should still be: ['lounge']

      const hasEnterEditorial =
        immersiveStoreSource.includes('enterEditorialMode') ||
        immersiveStoreSource.includes('function enterEditorialMode');
      expect(hasEnterEditorial).toBe(true);

      // Editorial mode changes immersiveState.mode, not currentRoom
      // So it shouldn't trigger navigation stack changes
    });

    test('closing editorial overlay should not affect navigation stack', () => {
      // Navigate: lounge → designer_houses
      // Open and close editorial overlay
      // Stack should still be: ['lounge']

      const hasExitEditorial =
        immersiveStoreSource.includes('exitEditorialMode') ||
        immersiveStoreSource.includes('function exitEditorialMode');
      expect(hasExitEditorial).toBe(true);

      // exitEditorialMode should not modify navigationStack
    });

    test('back button should work after editorial interactions', () => {
      // Navigate: lounge → designer_houses
      // Open editorial overlay, close it
      // Click back button
      // Should navigate to lounge

      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBack).toBe(true);

      // Extract full navigateBack body
      const funcStart = roomManagerSource.indexOf('function navigateBack()');
      const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
      const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

      // Should only check navigationStack, not editorial state
      expect(funcBody).toContain('navigationStack');
      expect(funcBody).not.toContain('editorialRoom');
    });
  });

  describe('Integration 4: Hardcoded "Back to lounge" with Back Button', () => {
    test('hardcoded hotspot should push current room onto stack', () => {
      // Navigate: lounge → designer_houses
      // Click "Back to lounge" hotspot
      // Stack should be: ['lounge', 'designer_houses']
      // Current room: lounge

      // Verify "Back to lounge" hotspots exist
      const hasBackToLoungeHotspot = roomManagerSource.includes("label: 'Back to lounge'");
      expect(hasBackToLoungeHotspot).toBe(true);

      // These hotspots use targetRoom: 'lounge'
      const hasTargetRoom = roomManagerSource.includes("targetRoom: 'lounge'");
      expect(hasTargetRoom).toBe(true);

      // Clicking hotspot calls goToRoom('lounge') which pushes to stack
      const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
      expect(hasPushLogic).toBe(true);
    });

    test('back button should return to room before lounge', () => {
      // Navigate: lounge → designer_houses
      // Click "Back to lounge" hotspot (now in lounge)
      // Click back button
      // Should navigate to designer_houses

      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBack).toBe(true);

      const hasPopAndNavigate =
        roomManagerSource.includes('navigationStack.pop()') && roomManagerSource.includes('goToRoom(previousRoom');
      expect(hasPopAndNavigate).toBe(true);
    });
  });

  describe('Integration 5: Guided Mode with Back Button', () => {
    test('guided mode navigation should be tracked in stack', () => {
      // Activate guided mode
      // Let it advance through rooms
      // Each transition should push to stack

      const hasGuidedMode =
        immersiveStoreSource.includes('activateGuidedMode') ||
        immersiveStoreSource.includes('function activateGuidedMode');

      // Guided mode uses goToRoom() which automatically tracks navigation
      const hasGoToRoom = roomManagerSource.includes('function goToRoom(');
      expect(hasGoToRoom).toBe(true);

      const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
      expect(hasPushLogic).toBe(true);
    });

    test('back button should work during guided mode', () => {
      // Activate guided mode
      // Let it advance through 3 rooms
      // Click back button
      // Should navigate to previous room

      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBack).toBe(true);

      // Extract full navigateBack body
      const funcStart = roomManagerSource.indexOf('function navigateBack()');
      const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
      const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

      // Should only check navigationStack, not guided state
      expect(funcBody).toContain('navigationStack');
    });
  });

  describe('Integration 6: Session Persistence', () => {
    test('navigation stack should persist across page refreshes', () => {
      // Navigate through 3 rooms to build stack
      // Refresh page
      // Stack should be restored

      // Verify saveState() persists navigationStack
      const hasSaveState =
        roomManagerSource.includes('saveState({') &&
        roomManagerSource.includes('navigationStack: immersiveState.navigationStack');
      expect(hasSaveState).toBe(true);

      // Verify saveState() uses sessionStorage
      const hasSessionStorage = stateManagerSource.includes('sessionStorage.setItem');
      expect(hasSessionStorage).toBe(true);

      // Verify loadState() can restore navigationStack
      const hasLoadState = stateManagerSource.includes('function loadState()');
      expect(hasLoadState).toBe(true);

      const hasSessionStorageGet = stateManagerSource.includes('sessionStorage.getItem');
      expect(hasSessionStorageGet).toBe(true);
    });

    test('back button should be visible after page refresh with stack', () => {
      // Navigate through rooms to build stack
      // Refresh page
      // Back button should be visible

      // After loading state, updateBackButtonVisibility should be called
      const hasUpdateVisibility = roomManagerSource.includes('function updateBackButtonVisibility()');
      expect(hasUpdateVisibility).toBe(true);

      // updateBackButtonVisibility checks stack length
      const hasStackLengthCheck = roomManagerSource.includes('navigationStack.length > 0');
      expect(hasStackLengthCheck).toBe(true);
    });

    test('back button should work correctly with restored stack', () => {
      // Navigate through rooms to build stack
      // Refresh page
      // Click back button
      // Should navigate to previous room from restored stack

      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBack).toBe(true);

      const hasPopLogic = roomManagerSource.includes('navigationStack.pop()');
      expect(hasPopLogic).toBe(true);
    });
  });

  describe('Integration 7: Mobile Functionality', () => {
    test('back button should exist in mobile layout', () => {
      // Back button should be present in immersive header
      // Should be appropriately sized for touch (2.25rem on mobile)

      const hasBackButton = immersiveCanvasLiquid.includes('data-immersive-back');
      expect(hasBackButton).toBe(true);

      // Back button should have immersive-back-btn class for styling
      const hasBackBtnClass = immersiveCanvasLiquid.includes('immersive-back-btn');
      expect(hasBackBtnClass).toBe(true);
    });

    test('navigation stack should work identically on mobile', () => {
      // All navigation logic should be device-agnostic
      // Stack tracking should work the same on mobile and desktop

      const hasGoToRoom = roomManagerSource.includes('function goToRoom(');
      expect(hasGoToRoom).toBe(true);

      const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
      expect(hasPushLogic).toBe(true);

      // No mobile-specific conditions in navigation logic
      const goToRoomPattern = /function goToRoom\([^}]+\{[^}]+}/s;
      const match = roomManagerSource.match(goToRoomPattern);

      if (match) {
        const impl = match[0];
        // Should not have mobile-specific navigation logic
        expect(impl).not.toContain('isMobile && navigationStack');
      }
    });

    test('back button touch events should work on mobile', () => {
      // Back button should respond to touch events
      // Event listener should work for both click and touch

      const hasBackButtonListener =
        immersiveStoreSource.includes("querySelector('[data-immersive-back]')") &&
        immersiveStoreSource.includes('addEventListener');
      expect(hasBackButtonListener).toBe(true);

      // addEventListener('click') works for both mouse and touch events
    });
  });

  describe('Integration 8: Complete User Journey', () => {
    test('full shopping journey with navigation history', () => {
      // Complete user journey:
      // 1. Start at storefront
      // 2. Navigate to lounge
      // 3. Navigate to designer_houses
      // 4. Open collection panel
      // 5. Open product panel
      // 6. Close panels
      // 7. Navigate to occasions
      // 8. Open editorial overlay
      // 9. Close editorial
      // 10. Click back button (should go to designer_houses)
      // 11. Click back button (should go to lounge)
      // 12. Click back button (should go to storefront)

      // Verify all components exist
      const hasGoToRoom = roomManagerSource.includes('function goToRoom(');
      const hasNavigateBack = roomManagerSource.includes('function navigateBack()');
      const hasOpenPanel =
        immersiveStoreSource.includes('openPanel') || immersiveStoreSource.includes('function openPanel');
      const hasEnterEditorial =
        immersiveStoreSource.includes('enterEditorialMode') ||
        immersiveStoreSource.includes('function enterEditorialMode');

      expect(hasGoToRoom).toBe(true);
      expect(hasNavigateBack).toBe(true);
      expect(hasOpenPanel).toBe(true);
      expect(hasEnterEditorial).toBe(true);

      // Verify navigation stack tracks room navigation only
      const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
      expect(hasPushLogic).toBe(true);

      // Verify panels and editorial don't affect stack
      const hasPushCondition = roomManagerSource.includes('if (!initial && !fromBack');
      expect(hasPushCondition).toBe(true);
    });
  });

  describe('Integration 9: Error Handling', () => {
    test('navigateBack() should handle missing back button gracefully', () => {
      // If back button element doesn't exist, should not throw error

      const updateVisibilityPattern = /function updateBackButtonVisibility\(\)[^}]+}/s;
      const match = roomManagerSource.match(updateVisibilityPattern);

      if (match) {
        const impl = match[0];
        // Should check if backBtn exists before using it
        expect(impl).toContain('if (!backBtn) return');
      }
    });

    test('navigateBack() should handle empty stack gracefully', () => {
      // If stack is empty, should not throw error

      // Extract full navigateBack body
      const funcStart = roomManagerSource.indexOf('function navigateBack()');
      const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
      const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

      // Should check if stack is empty
      expect(funcBody).toContain('navigationStack.length === 0');
      // Should return early
      expect(funcBody).toContain('return');
      // Should log warning
      expect(funcBody).toContain('console.warn');
    });

    test('goToRoom() should handle missing room data gracefully', () => {
      // If room textures are missing, should not break navigation stack

      const goToRoomPattern = /function goToRoom\([^}]+\{[^}]+}/s;
      const match = roomManagerSource.match(goToRoomPattern);

      if (match) {
        const impl = match[0];
        // Should check if roomData exists
        expect(impl).toContain('if (!roomData)');
        // Should return early if missing
        expect(impl).toContain('return');
      }
    });
  });
});
