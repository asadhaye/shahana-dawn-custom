/**
 * Bug 1: Global API Exposure - Exploratory Bug Condition Test
 *
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 *
 * GOAL: Surface counterexamples that demonstrate modular functions are not globally accessible
 *
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 */

// Load all modular JavaScript files to test global API exposure
require('../assets/immersive/core/state-manager.js');
require('../assets/immersive/core/room-manager.js');
require('../assets/immersive/core/webgl-engine.js');
require('../assets/immersive/panels/glass-panel.js');
require('../assets/immersive/panels/product-panel.js');
require('../assets/immersive/panels/collection-panel.js');
require('../assets/immersive/panels/wishlist-panel.js');
require('../assets/immersive/editorial/editorial-mode.js');
require('../assets/immersive/editorial/hero-parallax.js');
require('../assets/immersive/editorial/scroll-reveal.js');
require('../assets/immersive/editorial/timeline.js');
require('../assets/immersive/features/search.js');
require('../assets/immersive/features/filters.js');
require('../assets/immersive/features/gestures.js');
require('../assets/immersive/features/quick-add.js');
require('../assets/immersive/features/fab.js');
require('../assets/immersive/features/limited-time.js');
require('../assets/immersive/features/room-recommender.js');
require('../assets/immersive/guided/guided-mode.js');
require('../assets/immersive/utils/dom.js');
require('../assets/immersive/utils/skeleton.js');

describe('Bug 1: Global API Exposure - Exploratory Testing', () => {
  describe('Property 1: Bug Condition - Modular Functions Not Globally Accessible', () => {
    test('goToRoom() should be globally accessible', () => {
      // Test that goToRoom is defined in global scope
      expect(typeof goToRoom).toBe('function');

      // Test that it can be called without TypeError
      expect(() => {
        // Mock call - we're testing accessibility, not execution
        if (typeof goToRoom === 'function') {
          // Function exists and is callable
        }
      }).not.toThrow();
    });

    test('openProductPanel() should be globally accessible', () => {
      expect(typeof openProductPanel).toBe('function');
    });

    test('openCollectionPanel() should be globally accessible', () => {
      expect(typeof openCollectionPanel).toBe('function');
    });

    test('enterEditorialMode() should be globally accessible', () => {
      expect(typeof enterEditorialMode).toBe('function');
    });

    test('exitEditorialMode() should be globally accessible', () => {
      expect(typeof exitEditorialMode).toBe('function');
    });

    test('openSearchPanel() should be globally accessible', () => {
      expect(typeof openSearchPanel).toBe('function');
    });

    test('openPanel() should be globally accessible', () => {
      expect(typeof openPanel).toBe('function');
    });

    test('closePanel() should be globally accessible', () => {
      expect(typeof closePanel).toBe('function');
    });

    test('activateGuidedMode() should be globally accessible', () => {
      expect(typeof activateGuidedMode).toBe('function');
    });

    test('exitGuidedMode() should be globally accessible', () => {
      expect(typeof exitGuidedMode).toBe('function');
    });

    test('window.ImmersiveRoomManager namespace should exist', () => {
      expect(window.ImmersiveRoomManager).toBeDefined();
      expect(typeof window.ImmersiveRoomManager).toBe('object');
    });

    test('window.ImmersiveRoomManager.goToRoom should be accessible', () => {
      expect(window.ImmersiveRoomManager).toBeDefined();
      expect(typeof window.ImmersiveRoomManager.goToRoom).toBe('function');
    });

    test('window.ImmersiveProductPanel namespace should exist', () => {
      expect(window.ImmersiveProductPanel).toBeDefined();
      expect(typeof window.ImmersiveProductPanel).toBe('object');
    });

    test('window.ImmersiveProductPanel.openProductPanel should be accessible', () => {
      expect(window.ImmersiveProductPanel).toBeDefined();
      expect(typeof window.ImmersiveProductPanel.openProductPanel).toBe('function');
    });

    test('window.ImmersiveCollectionPanel namespace should exist', () => {
      expect(window.ImmersiveCollectionPanel).toBeDefined();
      expect(typeof window.ImmersiveCollectionPanel).toBe('object');
    });

    test('window.ImmersiveEditorial namespace should exist', () => {
      expect(window.ImmersiveEditorial).toBeDefined();
      expect(typeof window.ImmersiveEditorial).toBe('object');
    });

    test('window.ImmersiveSearch namespace should exist', () => {
      expect(window.ImmersiveSearch).toBeDefined();
      expect(typeof window.ImmersiveSearch).toBe('object');
    });

    test('window.ImmersiveGlassPanel namespace should exist', () => {
      expect(window.ImmersiveGlassPanel).toBeDefined();
      expect(typeof window.ImmersiveGlassPanel).toBe('object');
    });

    test('window.ImmersiveGuided namespace should exist', () => {
      expect(window.ImmersiveGuided).toBeDefined();
      expect(typeof window.ImmersiveGuided).toBe('object');
    });

    test('typeof goToRoom === "function" check should return true', () => {
      // This is the exact check from immersive-store.js line 1678
      const result = typeof goToRoom === 'function';
      expect(result).toBe(true);
    });

    test('backward compatibility: both direct and namespaced access should work', () => {
      // Direct global access
      expect(typeof goToRoom).toBe('function');

      // Namespaced access
      expect(typeof window.ImmersiveRoomManager.goToRoom).toBe('function');

      // Both should reference the same function
      if (typeof goToRoom === 'function' && window.ImmersiveRoomManager) {
        expect(goToRoom).toBe(window.ImmersiveRoomManager.goToRoom);
      }
    });
  });

  describe('Expected Counterexamples on Unfixed Code', () => {
    test('DOCUMENTATION: Expected failures on unfixed code', () => {
      // This test documents what we expect to see on unfixed code:
      //
      // 1. typeof goToRoom === 'function' returns FALSE
      // 2. typeof openProductPanel === 'function' returns FALSE
      // 3. typeof openCollectionPanel === 'function' returns FALSE
      // 4. typeof enterEditorialMode === 'function' returns FALSE
      // 5. typeof openSearchPanel === 'function' returns FALSE
      // 6. window.ImmersiveRoomManager is UNDEFINED
      // 7. window.ImmersiveProductPanel is UNDEFINED
      // 8. window.ImmersiveCollectionPanel is UNDEFINED
      // 9. window.ImmersiveEditorial is UNDEFINED
      // 10. window.ImmersiveSearch is UNDEFINED
      // 11. window.ImmersiveGlassPanel is UNDEFINED
      // 12. window.ImmersiveGuided is UNDEFINED
      //
      // All function calls to modular functions fail with:
      // - TypeError: [function] is not a function
      // - ReferenceError: [function] is not defined
      //
      // Root cause: Functions defined in modular files but not exposed globally

      expect(true).toBe(true); // This test always passes - it's documentation only
    });
  });
});
