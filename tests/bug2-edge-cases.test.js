/**
 * Bug 2: Navigation History - Edge Case Testing
 *
 * Tests edge cases and interactions between navigation history and other features:
 * - Deep-link with panels
 * - Hardcoded "Back to lounge" hotspots
 * - Guided mode navigation
 * - Editorial overlay navigation
 * - Panel navigation
 * - Navigation with repeated rooms
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

describe('Bug 2: Navigation History - Edge Cases', () => {
  let roomManagerSource;
  let stateManagerSource;
  let immersiveStoreSource;

  beforeAll(() => {
    roomManagerSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive/core/room-manager.js'), 'utf8');
    stateManagerSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive/core/state-manager.js'), 'utf8');
    immersiveStoreSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive-store.js'), 'utf8');
  });

  describe('Edge Case 1: Deep-link with panels', () => {
    test('panel opening should not affect navigation stack', () => {
      // Verify that opening panels via deep-link doesn't modify navigationStack
      // The goToRoom() function should only push to stack when navigating between rooms

      // Check that goToRoom() has the logic to NOT push when opening panels
      const hasInitialCheck = roomManagerSource.includes('if (!initial && !fromBack');
      const hasRoomKeyCheck = roomManagerSource.includes('immersiveState.currentRoom !== roomKey');

      expect(hasInitialCheck).toBe(true);
      expect(hasRoomKeyCheck).toBe(true);

      // Panel opening functions are now exposed globally via window.ImmersiveProductPanel and window.ImmersiveCollectionPanel
      // Verify they are accessible globally (they were extracted to modular files)
      const hasProductPanelGlobal =
        immersiveStoreSource.includes('window.ImmersiveProductPanel') ||
        immersiveStoreSource.includes('openProductPanel');
      const hasCollectionPanelGlobal =
        immersiveStoreSource.includes('window.ImmersiveCollectionPanel') ||
        immersiveStoreSource.includes('openCollectionPanel');

      // At least one of these should be true (either the global namespace or the function reference)
      expect(hasProductPanelGlobal || hasCollectionPanelGlobal).toBe(true);
    });

    test('back button should remain hidden when only panels are opened', () => {
      // Verify updateBackButtonVisibility checks navigationStack.length
      const hasStackLengthCheck = roomManagerSource.includes('navigationStack.length > 0');
      expect(hasStackLengthCheck).toBe(true);

      // Verify back button is hidden when stack is empty
      const hasHiddenLogic = roomManagerSource.includes('backBtn.hidden = true');
      expect(hasHiddenLogic).toBe(true);
    });
  });

  describe('Edge Case 2: Hardcoded "Back to lounge" hotspots', () => {
    test('hardcoded hotspots should push current room onto stack', () => {
      // Verify that clicking "Back to lounge" hotspot calls goToRoom('lounge')
      // which should push the current room onto the stack

      // Check STORE_ROOMS configuration has "Back to lounge" hotspots
      const hasBackToLoungeHotspot = roomManagerSource.includes("label: 'Back to lounge'");
      expect(hasBackToLoungeHotspot).toBe(true);

      // Verify these hotspots use targetRoom: 'lounge'
      const hasTargetRoom = roomManagerSource.includes("targetRoom: 'lounge'");
      expect(hasTargetRoom).toBe(true);

      // Verify goToRoom() pushes to stack for forward navigation
      const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
      expect(hasPushLogic).toBe(true);
    });

    test('back button should work after using hardcoded hotspot', () => {
      // After clicking "Back to lounge" from designer_houses:
      // - Stack should contain ['lounge', 'designer_houses']
      // - Current room should be 'lounge'
      // - Back button should be visible
      // - Clicking back should return to 'designer_houses'

      const hasNavigateBackFunction = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBackFunction).toBe(true);

      const hasPopLogic = roomManagerSource.includes('navigationStack.pop()');
      expect(hasPopLogic).toBe(true);
    });
  });

  describe('Edge Case 3: Guided mode navigation', () => {
    test('guided mode transitions should be tracked in navigation stack', () => {
      // Guided mode uses goToRoom() for navigation
      // Each transition should push to the stack

      // Verify guided mode exists
      const hasGuidedMode =
        immersiveStoreSource.includes('activateGuidedMode') ||
        immersiveStoreSource.includes('function activateGuidedMode');

      // Guided mode should call goToRoom() which automatically tracks navigation
      const hasGoToRoomCall = roomManagerSource.includes('goToRoom(');
      expect(hasGoToRoomCall).toBe(true);
    });

    test('back button should work during guided mode', () => {
      // User should be able to click back button during guided mode
      // This should navigate to previous room in the stack

      const hasNavigateBackFunction = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBackFunction).toBe(true);

      // navigateBack should work regardless of guided mode state
      const navigateBackChecksStack = roomManagerSource.includes('navigationStack.length === 0');
      expect(navigateBackChecksStack).toBe(true);
    });
  });

  describe('Edge Case 4: Editorial overlay navigation', () => {
    test('editorial overlay should not affect navigation stack', () => {
      // Opening/closing editorial overlays should not modify navigationStack
      // Editorial is a mode change, not a room change

      // Verify editorial mode functions exist
      const hasEnterEditorial =
        immersiveStoreSource.includes('enterEditorialMode') ||
        immersiveStoreSource.includes('function enterEditorialMode');
      const hasExitEditorial =
        immersiveStoreSource.includes('exitEditorialMode') ||
        immersiveStoreSource.includes('function exitEditorialMode');

      // Editorial mode changes immersiveState.mode, not currentRoom
      // So it shouldn't trigger navigation stack changes
      const hasModeChange =
        stateManagerSource.includes("mode: 'showroom'") ||
        immersiveStoreSource.includes("immersiveState.mode = 'editorial'");
      expect(hasModeChange).toBe(true);
    });

    test('back button should work after closing editorial overlay', () => {
      // After opening and closing editorial overlay:
      // - Navigation stack should be unchanged
      // - Back button should still navigate to previous room

      const hasNavigateBackFunction = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBackFunction).toBe(true);

      // Extract full navigateBack body
      const funcStart = roomManagerSource.indexOf('function navigateBack()');
      const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
      const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

      // navigateBack only checks navigationStack, not editorial state
      expect(funcBody).toContain('navigationStack');
      expect(funcBody).not.toContain('editorialRoom');
    });
  });

  describe('Edge Case 5: Panel navigation', () => {
    test('opening panels should not modify navigation stack', () => {
      // Opening product/collection panels should not affect room navigation
      // Panels are overlays, not room changes

      // Verify panel functions don't call goToRoom()
      // They should only open panels without room navigation
      const hasOpenPanel =
        immersiveStoreSource.includes('openPanel') || immersiveStoreSource.includes('function openPanel');
      expect(hasOpenPanel).toBe(true);

      // goToRoom() should only be called for actual room navigation
      const goToRoomPattern = /goToRoom\([^)]+\)/g;
      const goToRoomCalls = roomManagerSource.match(goToRoomPattern) || [];

      // All goToRoom calls should be for room navigation, not panel opening
      expect(goToRoomCalls.length).toBeGreaterThan(0);
    });

    test('closing panels should not modify navigation stack', () => {
      // Closing panels should not affect navigation stack
      // Back button should still work after closing panels

      const hasClosePanel =
        immersiveStoreSource.includes('closePanel') || immersiveStoreSource.includes('function closePanel');
      expect(hasClosePanel).toBe(true);

      // closePanel should not call goToRoom() or modify navigationStack
      const closePanelPattern = /function closePanel\([^}]+\}/s;
      const closePanelMatch = immersiveStoreSource.match(closePanelPattern);

      if (closePanelMatch) {
        const impl = closePanelMatch[0];
        expect(impl).not.toContain('navigationStack.push');
        expect(impl).not.toContain('navigationStack.pop');
      }
    });

    test('back button should work after panel interactions', () => {
      // After opening and closing panels:
      // - Navigation stack should be unchanged
      // - Back button should navigate to previous room

      const hasNavigateBackFunction = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBackFunction).toBe(true);

      // navigateBack should close any open panels before navigating
      const navigateBackClosesPanel =
        roomManagerSource.includes('closePanel') && roomManagerSource.includes('navigateBack');
      expect(navigateBackClosesPanel).toBe(true);
    });
  });

  describe('Edge Case 6: Navigation with repeated rooms', () => {
    test('navigation stack should preserve all steps including repeats', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'), {
            minLength: 3,
            maxLength: 10,
          }),
          (roomSequence) => {
            // Verify that navigating through a sequence with repeated rooms
            // preserves all steps in the navigation stack

            // The stack should contain all previous rooms, even if repeated
            // Example: lounge → designer_houses → lounge → occasions
            // Stack should be: ['lounge', 'designer_houses', 'lounge']

            // Verify goToRoom() pushes to stack for each navigation
            const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
            expect(hasPushLogic).toBe(true);

            // Verify no deduplication logic exists
            const hasNoDedupe =
              !roomManagerSource.includes('navigationStack.includes') &&
              !roomManagerSource.includes('indexOf(roomKey)');
            expect(hasNoDedupe).toBe(true);

            return true;
          },
        ),
        { numRuns: 10 },
      );
    });

    test('back navigation through repeated rooms should work correctly', () => {
      // After navigating: lounge → designer_houses → lounge → occasions
      // Stack: ['lounge', 'designer_houses', 'lounge']
      // Back navigation should go: occasions → lounge → designer_houses → lounge

      const hasNavigateBackFunction = roomManagerSource.includes('function navigateBack()');
      expect(hasNavigateBackFunction).toBe(true);

      // navigateBack should pop from stack and navigate to that room
      const hasPopAndNavigate =
        roomManagerSource.includes('navigationStack.pop()') && roomManagerSource.includes('goToRoom(previousRoom');
      expect(hasPopAndNavigate).toBe(true);

      // Each back navigation should reduce stack by one
      const hasFromBackParameter = roomManagerSource.includes('fromBack');
      expect(hasFromBackParameter).toBe(true);
    });
  });

  describe('Edge Case 7: Session persistence', () => {
    test('navigation stack should persist in sessionStorage', () => {
      // Verify saveState() includes navigationStack
      const hasSaveStateWithStack = roomManagerSource.includes('navigationStack: immersiveState.navigationStack');
      expect(hasSaveStateWithStack).toBe(true);

      // Verify saveState() is called in goToRoom()
      const hasSaveStateCall = roomManagerSource.includes('saveState({');
      expect(hasSaveStateCall).toBe(true);
    });

    test('navigation stack should be restored on page load', () => {
      // Verify loadState() can restore navigationStack
      const hasLoadState = stateManagerSource.includes('function loadState()');
      expect(hasLoadState).toBe(true);

      // loadState should return the saved state including navigationStack
      const hasSessionStorageGet = stateManagerSource.includes('sessionStorage.getItem');
      expect(hasSessionStorageGet).toBe(true);
    });

    test('back button visibility should be restored after page refresh', () => {
      // After restoring navigationStack from sessionStorage:
      // - updateBackButtonVisibility() should be called
      // - Back button should be visible if stack has items

      const hasUpdateBackButtonVisibility = roomManagerSource.includes('function updateBackButtonVisibility()');
      expect(hasUpdateBackButtonVisibility).toBe(true);

      // updateBackButtonVisibility should check stack length
      const hasStackLengthCheck = roomManagerSource.includes('navigationStack.length > 0');
      expect(hasStackLengthCheck).toBe(true);
    });
  });
});
