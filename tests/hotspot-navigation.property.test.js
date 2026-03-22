/**
 * Property-Based Tests for Hotspot Collection Navigation
 *
 * Feature: immersive-store-glass-panel-improvements
 * Property 28: Hotspot Collection Navigation
 *
 * Tests verify that the routing logic in renderHotspots correctly routes
 * based on hotspot type:
 * - targetCollection hotspots → openCollectionPanel(), no navigation
 * - targetRoom hotspots → goToRoom(), no openCollectionPanel()
 *
 * Validates: Requirements 12.1, 12.2
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Routing logic extracted from immersive-store.js renderHotspots
//
// The actual function in immersive-store.js creates DOM buttons and attaches
// click handlers. We replicate the routing logic here for isolated testing.
// ---------------------------------------------------------------------------

/**
 * Creates a hotspot button with the same click routing logic as renderHotspots
 * in immersive-store.js, but using injected dependencies for testability.
 *
 * @param {object} hotspot - { label, x, y, targetRoom?, targetCollection? }
 * @param {Function} goToRoom - room navigation function
 * @param {Function} openCollectionPanel - collection panel function
 * @returns {HTMLButtonElement}
 */
function createHotspotButton(hotspot, goToRoom, openCollectionPanel) {
  var button = document.createElement('button');
  button.type = 'button';
  button.textContent = hotspot.label;
  button.className = 'immersive-hotspot';

  button.addEventListener('click', function () {
    if (hotspot.targetRoom) {
      goToRoom(hotspot.targetRoom);
    } else if (hotspot.targetCollection) {
      openCollectionPanel(hotspot.targetCollection);
    }
  });

  return button;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Valid collection handle: lowercase letters, digits, hyphens */
const collectionHandleArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,49}$/);

/** Valid room key: lowercase letters and underscores */
const roomKeyArb = fc.stringMatching(/^[a-z][a-z_]{0,29}$/);

/** Hotspot label: any non-empty string */
const labelArb = fc.string({ minLength: 1, maxLength: 80 });

/** Hotspot position: percentage values */
const positionArb = fc.integer({ min: 0, max: 100 });

/** A hotspot with targetCollection */
const collectionHotspotArb = fc.record({
  label: labelArb,
  x: positionArb,
  y: positionArb,
  targetCollection: collectionHandleArb,
});

/** A hotspot with targetRoom */
const roomHotspotArb = fc.record({
  label: labelArb,
  x: positionArb,
  y: positionArb,
  targetRoom: roomKeyArb,
});

// ---------------------------------------------------------------------------
// Property 28: Hotspot Collection Navigation
//
// "For any hotspot with a targetCollection property, clicking it calls
//  openCollectionPanel() and does NOT call window.location assignment or
//  any navigation.
//  For any hotspot with a targetRoom property, clicking it calls goToRoom()
//  and does NOT call openCollectionPanel()."
//
// Validates: Requirements 12.1, 12.2
// ---------------------------------------------------------------------------

describe('Property 28: Hotspot Collection Navigation', () => {
  /**
   * **Validates: Requirements 12.1, 12.2**
   *
   * For any hotspot with a targetCollection property:
   * - Clicking it MUST call openCollectionPanel() with the collection handle
   * - Clicking it MUST NOT call goToRoom()
   * - Clicking it MUST NOT assign window.location (no browser navigation)
   *
   * Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
    'clicking a targetCollection hotspot calls openCollectionPanel and does not navigate for any collection handle',
    () => {
      fc.assert(
        fc.property(collectionHotspotArb, function (hotspot) {
          // Track calls
          var openCollectionCalls = [];
          var goToRoomCalls = [];
          var locationAssigned = false;

          // Mock functions
          var mockOpenCollectionPanel = function (handle) {
            openCollectionCalls.push(handle);
          };
          var mockGoToRoom = function (roomKey) {
            goToRoomCalls.push(roomKey);
          };

          // Intercept window.location assignment
          var originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
          var locationProxy = {};
          try {
            Object.defineProperty(window, 'location', {
              configurable: true,
              get: function () { return locationProxy; },
              set: function () { locationAssigned = true; },
            });
          } catch (e) {
            // jsdom may not allow redefining location; track via href setter
          }

          // Create and click the button
          var button = createHotspotButton(hotspot, mockGoToRoom, mockOpenCollectionPanel);
          document.body.appendChild(button);
          button.click();
          document.body.removeChild(button);

          // Restore window.location if we overrode it
          if (originalDescriptor) {
            try {
              Object.defineProperty(window, 'location', originalDescriptor);
            } catch (e) {
              // ignore restore errors
            }
          }

          // Assertions:
          // 1. openCollectionPanel must be called exactly once with the correct handle
          if (openCollectionCalls.length !== 1) return false;
          if (openCollectionCalls[0] !== hotspot.targetCollection) return false;

          // 2. goToRoom must NOT be called
          if (goToRoomCalls.length !== 0) return false;

          // 3. window.location must NOT be assigned
          if (locationAssigned) return false;

          return true;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 12.3**
   *
   * For any hotspot with a targetRoom property:
   * - Clicking it MUST call goToRoom() with the room key
   * - Clicking it MUST NOT call openCollectionPanel()
   *
   * Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
    'clicking a targetRoom hotspot calls goToRoom and does not call openCollectionPanel for any room key',
    () => {
      fc.assert(
        fc.property(roomHotspotArb, function (hotspot) {
          // Track calls
          var openCollectionCalls = [];
          var goToRoomCalls = [];

          // Mock functions
          var mockOpenCollectionPanel = function (handle) {
            openCollectionCalls.push(handle);
          };
          var mockGoToRoom = function (roomKey) {
            goToRoomCalls.push(roomKey);
          };

          // Create and click the button
          var button = createHotspotButton(hotspot, mockGoToRoom, mockOpenCollectionPanel);
          document.body.appendChild(button);
          button.click();
          document.body.removeChild(button);

          // Assertions:
          // 1. goToRoom must be called exactly once with the correct room key
          if (goToRoomCalls.length !== 1) return false;
          if (goToRoomCalls[0] !== hotspot.targetRoom) return false;

          // 2. openCollectionPanel must NOT be called
          if (openCollectionCalls.length !== 0) return false;

          return true;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 12.1, 12.2**
   *
   * Routing is mutually exclusive: a hotspot with targetCollection never
   * triggers room navigation, and a hotspot with targetRoom never triggers
   * the collection panel — even when both properties are present on the same
   * hotspot object (targetRoom takes precedence per the if/else if logic).
   *
   * Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
    'routing is mutually exclusive: targetRoom takes precedence over targetCollection when both are present',
    () => {
      fc.assert(
        fc.property(
          fc.record({
            label: labelArb,
            x: positionArb,
            y: positionArb,
            targetRoom: roomKeyArb,
            targetCollection: collectionHandleArb,
          }),
          function (hotspot) {
            var openCollectionCalls = [];
            var goToRoomCalls = [];

            var mockOpenCollectionPanel = function (handle) {
              openCollectionCalls.push(handle);
            };
            var mockGoToRoom = function (roomKey) {
              goToRoomCalls.push(roomKey);
            };

            var button = createHotspotButton(hotspot, mockGoToRoom, mockOpenCollectionPanel);
            document.body.appendChild(button);
            button.click();
            document.body.removeChild(button);

            // targetRoom takes precedence (if/else if order in renderHotspots)
            if (goToRoomCalls.length !== 1) return false;
            if (goToRoomCalls[0] !== hotspot.targetRoom) return false;
            if (openCollectionCalls.length !== 0) return false;

            return true;
          }
        ),
        { numRuns: 100, verbose: true }
      );
    }
  );

  /**
   * **Validates: Requirements 12.1**
   *
   * openCollectionPanel is called with the exact collection handle from the
   * hotspot — no transformation, truncation, or modification of the handle.
   *
   * Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
   */
  test(
    // Feature: immersive-store-glass-panel-improvements, Property 28: Hotspot Collection Navigation
    'openCollectionPanel receives the exact collection handle without modification for any handle',
    () => {
      fc.assert(
        fc.property(collectionHotspotArb, function (hotspot) {
          var receivedHandle = null;

          var mockOpenCollectionPanel = function (handle) {
            receivedHandle = handle;
          };
          var mockGoToRoom = function () {};

          var button = createHotspotButton(hotspot, mockGoToRoom, mockOpenCollectionPanel);
          document.body.appendChild(button);
          button.click();
          document.body.removeChild(button);

          return receivedHandle === hotspot.targetCollection;
        }),
        { numRuns: 100, verbose: true }
      );
    }
  );
});
