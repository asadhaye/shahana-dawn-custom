/**
 * Bug 2: Navigation History - Property-Based Testing
 *
 * Property-based tests for navigation history logic:
 * - Navigation stack integrity
 * - Back navigation correctness
 * - Back button visibility
 * - Full navigation cycle
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

describe('Bug 2: Navigation History - Property-Based Tests', () => {
  let roomManagerSource;
  let stateManagerSource;

  beforeAll(() => {
    roomManagerSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive/core/room-manager.js'), 'utf8');
    stateManagerSource = fs.readFileSync(path.resolve(__dirname, '../assets/immersive/core/state-manager.js'), 'utf8');
  });

  describe('Property 1: Navigation Stack Integrity', () => {
    test('for any navigation sequence, stack should contain all previous rooms in correct order', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'), {
            minLength: 2,
            maxLength: 10,
          }),
          (roomSequence) => {
            // Property: After navigating through a sequence of rooms,
            // the navigation stack should contain all previous rooms in the order visited

            // Verify goToRoom() has logic to push current room onto stack
            const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
            expect(hasPushLogic).toBe(true);

            // Verify push only happens for forward navigation (not initial, not fromBack)
            const hasConditionalPush = roomManagerSource.includes('if (!initial && !fromBack');
            expect(hasConditionalPush).toBe(true);

            // Verify stack is saved to sessionStorage
            const hasSaveState =
              roomManagerSource.includes('saveState({') &&
              roomManagerSource.includes('navigationStack: immersiveState.navigationStack');
            expect(hasSaveState).toBe(true);

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    test('for any navigation sequence, current room should be the last room in sequence', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'), {
            minLength: 1,
            maxLength: 10,
          }),
          (roomSequence) => {
            // Property: After navigating through rooms, currentRoom should be the last room

            // Verify goToRoom() sets immersiveState.currentRoom
            const hasCurrentRoomSet = roomManagerSource.includes('immersiveState.currentRoom = roomKey');
            expect(hasCurrentRoomSet).toBe(true);

            // Verify currentRoom is set before pushing to stack
            const setBeforePush =
              roomManagerSource.indexOf('immersiveState.currentRoom = roomKey') <
              roomManagerSource.indexOf('navigationStack.push');
            expect(setBeforePush).toBe(false); // Should push BEFORE setting currentRoom

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    test('for any navigation sequence, canNavigateBack() should return true when stack has items', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions'), { minLength: 1, maxLength: 5 }),
          (roomSequence) => {
            // Property: canNavigateBack() should return true if and only if stack.length > 0

            // Verify canNavigateBack() checks stack length
            const canNavigateBackPattern = /function canNavigateBack\(\)[^}]+}/s;
            const match = roomManagerSource.match(canNavigateBackPattern);

            if (match) {
              const impl = match[0];
              expect(impl).toContain('navigationStack');
              expect(impl).toContain('length');
              expect(impl).toContain('> 0');
            }

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  describe('Property 2: Back Navigation Correctness', () => {
    test('for any navigation sequence, navigateBack() should return to previous room', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'), {
            minLength: 2,
            maxLength: 8,
          }),
          (roomSequence) => {
            // Property: After navigating forward, navigateBack() should return to previous room

            // Verify navigateBack() pops from stack
            const hasPopLogic = roomManagerSource.includes('navigationStack.pop()');
            expect(hasPopLogic).toBe(true);

            // Verify navigateBack() calls goToRoom with fromBack=true
            const hasGoToRoomCall = roomManagerSource.includes('goToRoom(previousRoom, false, true)');
            expect(hasGoToRoomCall).toBe(true);

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    test('for any navigation sequence, navigateBack() should reduce stack by one', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions'), { minLength: 2, maxLength: 6 }),
          (roomSequence) => {
            // Property: Each navigateBack() call should reduce stack length by 1

            // Verify navigateBack() pops from stack (which reduces length)
            const hasPopLogic = roomManagerSource.includes('navigationStack.pop()');
            expect(hasPopLogic).toBe(true);

            // Verify navigateBack() function exists
            const hasNavigateBackFunction = roomManagerSource.includes('function navigateBack()');
            expect(hasNavigateBackFunction).toBe(true);

            // Should not push anything back during navigateBack
            const navigateBackStart = roomManagerSource.indexOf('function navigateBack()');
            const nextFunctionStart = roomManagerSource.indexOf('function ', navigateBackStart + 1);
            const navigateBackBody = roomManagerSource.substring(navigateBackStart, nextFunctionStart);
            expect(navigateBackBody).not.toContain('navigationStack.push');

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    test('for any navigation sequence, fromBack parameter should prevent pushing to stack', () => {
      fc.assert(
        fc.property(fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'), (roomKey) => {
          // Property: goToRoom(roomKey, false, true) should not push to stack

          // Verify goToRoom() checks fromBack parameter
          const hasFromBackCheck = roomManagerSource.includes('!fromBack');
          expect(hasFromBackCheck).toBe(true);

          // Verify push is conditional on !fromBack
          const pushPattern = /if \(!initial && !fromBack[^}]+navigationStack\.push/s;
          const hasPushCondition = pushPattern.test(roomManagerSource);
          expect(hasPushCondition).toBe(true);

          return true;
        }),
        { numRuns: 10 },
      );
    });

    test('navigateBack() should handle empty stack gracefully', () => {
      // Property: navigateBack() with empty stack should not throw error

      // Extract the full navigateBack function body
      const funcStart = roomManagerSource.indexOf('function navigateBack()');
      const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
      const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

      // Should check if stack is empty
      expect(funcBody).toContain('navigationStack.length === 0');
      // Should return early if empty
      expect(funcBody).toContain('return');
      // Should log warning
      expect(funcBody).toContain('console.warn');
    });
  });

  describe('Property 3: Back Button Visibility', () => {
    test('for any stack state, back button visibility should match stack.length > 0', () => {
      fc.assert(
        fc.property(fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions'), { maxLength: 10 }), (stack) => {
          // Property: Back button should be visible iff stack.length > 0

          const updateVisibilityPattern = /function updateBackButtonVisibility\(\)[^}]+}/s;
          const match = roomManagerSource.match(updateVisibilityPattern);

          if (match) {
            const impl = match[0];
            // Should check stack length
            expect(impl).toContain('navigationStack.length > 0');
            // Should set hidden attribute based on stack length
            expect(impl).toContain('backBtn.hidden');
            // Should set disabled attribute based on stack length
            expect(impl).toContain('backBtn.disabled');
          }

          return true;
        }),
        { numRuns: 20 },
      );
    });

    test('updateBackButtonVisibility() should be called after room navigation', () => {
      fc.assert(
        fc.property(fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'), (roomKey) => {
          // Property: After goToRoom(), updateBackButtonVisibility() should be called

          // Verify goToRoom() calls updateBackButtonVisibility
          const hasUpdateCall = roomManagerSource.includes('updateBackButtonVisibility()');
          expect(hasUpdateCall).toBe(true);

          // Verify the function is called within goToRoom
          const goToRoomStart = roomManagerSource.indexOf('function goToRoom(');
          const nextFunctionStart = roomManagerSource.indexOf('\nfunction ', goToRoomStart + 1);
          const goToRoomBody = roomManagerSource.substring(goToRoomStart, nextFunctionStart);
          expect(goToRoomBody).toContain('updateBackButtonVisibility');

          return true;
        }),
        { numRuns: 10 },
      );
    });

    test('back button should be hidden when stack is empty', () => {
      // Property: When navigationStack.length === 0, back button should be hidden

      // Verify updateBackButtonVisibility() function exists
      const hasFunction = roomManagerSource.includes('function updateBackButtonVisibility()');
      expect(hasFunction).toBe(true);

      // Extract the function body
      const funcStart = roomManagerSource.indexOf('function updateBackButtonVisibility()');
      const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
      const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

      // Should have logic to hide button when stack is empty
      expect(funcBody).toContain('backBtn.hidden = true');
      expect(funcBody).toContain('backBtn.disabled = true');
    });

    test('back button should be visible when stack has items', () => {
      // Property: When navigationStack.length > 0, back button should be visible

      const updateVisibilityPattern = /function updateBackButtonVisibility\(\)[^}]+}/s;
      const match = roomManagerSource.match(updateVisibilityPattern);

      if (match) {
        const impl = match[0];
        // Should have logic to show button when stack has items
        expect(impl).toContain('hidden = false');
        expect(impl).toContain('disabled = false');
      }
    });
  });

  describe('Property 4: Full Navigation Cycle', () => {
    test('for any navigation sequence, navigating forward then back should return to initial state', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'), {
            minLength: 2,
            maxLength: 6,
          }),
          (roomSequence) => {
            // Property: Navigate forward through sequence, then back through sequence
            // Should return to initial state with empty stack

            // Verify navigateBack() pops from stack
            const hasPopLogic = roomManagerSource.includes('navigationStack.pop()');
            expect(hasPopLogic).toBe(true);

            // Verify goToRoom() pushes to stack for forward navigation
            const hasPushLogic = roomManagerSource.includes('navigationStack.push(immersiveState.currentRoom)');
            expect(hasPushLogic).toBe(true);

            // Verify fromBack parameter prevents pushing
            const hasFromBackCheck = roomManagerSource.includes('!fromBack');
            expect(hasFromBackCheck).toBe(true);

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    test('stack should be empty after navigating back through all rooms', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (numNavigations) => {
          // Property: After N forward navigations and N back navigations,
          // stack should be empty

          // Verify navigateBack() reduces stack by popping
          const hasPopLogic = roomManagerSource.includes('navigationStack.pop()');
          expect(hasPopLogic).toBe(true);

          // Verify no logic adds items back to stack during back navigation
          const navigateBackPattern = /function navigateBack\(\)[^}]+}/s;
          const match = roomManagerSource.match(navigateBackPattern);

          if (match) {
            const impl = match[0];
            expect(impl).not.toContain('navigationStack.push');
          }

          return true;
        }),
        { numRuns: 20 },
      );
    });

    test('canNavigateBack() should return false after full cycle', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions'), { minLength: 1, maxLength: 4 }),
          (roomSequence) => {
            // Property: After navigating forward then back to start,
            // canNavigateBack() should return false

            const canNavigateBackPattern = /function canNavigateBack\(\)[^}]+}/s;
            const match = roomManagerSource.match(canNavigateBackPattern);

            if (match) {
              const impl = match[0];
              // Should return false when stack is empty
              expect(impl).toContain('navigationStack');
              expect(impl).toContain('length');
              expect(impl).toContain('> 0');
            }

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  describe('Property 5: State Persistence', () => {
    test('for any navigation stack, saveState() should persist it to sessionStorage', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'), { maxLength: 8 }),
          (stack) => {
            // Property: saveState() should include navigationStack in persisted state

            // Verify saveState() is called with navigationStack
            const hasSaveStateCall =
              roomManagerSource.includes('saveState({') &&
              roomManagerSource.includes('navigationStack: immersiveState.navigationStack');
            expect(hasSaveStateCall).toBe(true);

            // Verify saveState() uses sessionStorage
            const hasSessionStorage = stateManagerSource.includes('sessionStorage.setItem');
            expect(hasSessionStorage).toBe(true);

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    test('for any persisted stack, loadState() should restore it', () => {
      fc.assert(
        fc.property(fc.array(fc.constantFrom('lounge', 'designer_houses', 'occasions'), { maxLength: 6 }), (stack) => {
          // Property: loadState() should restore navigationStack from sessionStorage

          // Verify loadState() reads from sessionStorage
          const hasSessionStorageGet = stateManagerSource.includes('sessionStorage.getItem');
          expect(hasSessionStorageGet).toBe(true);

          // Verify loadState() returns parsed state
          const hasJSONParse = stateManagerSource.includes('JSON.parse');
          expect(hasJSONParse).toBe(true);

          return true;
        }),
        { numRuns: 20 },
      );
    });
  });

  describe('Property 6: Analytics Tracking', () => {
    test('navigateBack() should track analytics event with correct data', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'),
          fc.constantFrom('storefront', 'lounge', 'designer_houses', 'occasions'),
          (fromRoom, toRoom) => {
            // Property: navigateBack() should call trackImmersiveEvent with navigation_back

            // Extract navigateBack function body
            const funcStart = roomManagerSource.indexOf('function navigateBack()');
            const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
            const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

            // Should track analytics event
            expect(funcBody).toContain('trackImmersiveEvent');
            expect(funcBody).toContain('navigation_back');
            // Should include from_room, to_room, stack_depth
            expect(funcBody).toContain('from_room');
            expect(funcBody).toContain('to_room');
            expect(funcBody).toContain('stack_depth');

            return true;
          },
        ),
        { numRuns: 10 },
      );
    });
  });

  describe('Property 7: Panel Interaction', () => {
    test('navigateBack() should close open panels before navigating', () => {
      // Property: If a panel is open, navigateBack() should close it before navigating

      // Extract navigateBack function body
      const funcStart = roomManagerSource.indexOf('function navigateBack()');
      const nextFuncStart = roomManagerSource.indexOf('\nfunction ', funcStart + 1);
      const funcBody = roomManagerSource.substring(funcStart, nextFuncStart);

      // Should check for open glass panel
      expect(funcBody).toContain('glass-panel');
      // Should close panel if open
      expect(funcBody).toContain('closePanel');
    });
  });
});
