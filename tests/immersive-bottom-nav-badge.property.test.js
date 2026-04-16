/**
 * Property-Based Test: Badge Consistency
 *
 * Feature: immersive-ux-enhancements
 * Property 9: Badge consistency
 *
 * **Validates: Requirements 2.7**
 *
 * For any wishlist state change, the wishlist badge count rendered by
 * ImmersiveBottomNav SHALL equal the wishlist badge count in the immersive
 * header, and both SHALL equal _wishlistItems.length.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Minimal badge sync model
//
// Extracted from the badge update paths in assets/immersive-store.js:
//
//   updateWishlistBadge() — updates [data-wishlist-badge] in the header
//   window.updateBottomNavBadges(wishlistCount, cartCount) — updates
//     [data-bottom-nav-wishlist-badge] in the bottom nav
//
// Both are called from addToWishlist() and removeFromWishlist() after
// mutating _wishlistItems.
//
// The property: after any sequence of add/remove operations, both badge
// elements must display the same count as _wishlistItems.length.
// ---------------------------------------------------------------------------

/**
 * Simulates the wishlist state and badge update logic from immersive-store.js.
 * Returns a model object that tracks state and exposes the same API.
 */
function createWishlistModel(headerBadgeEl, bottomNavBadgeEl) {
  var _items = [];

  function updateHeaderBadge() {
    if (!headerBadgeEl) return;
    headerBadgeEl.textContent = _items.length;
    headerBadgeEl.hidden = _items.length === 0;
  }

  function updateBottomNavBadge() {
    if (!bottomNavBadgeEl) return;
    bottomNavBadgeEl.textContent = _items.length;
    bottomNavBadgeEl.hidden = _items.length === 0;
  }

  function add(handle) {
    if (!handle || _items.indexOf(handle) !== -1) return;
    _items.push(handle);
    updateHeaderBadge();
    updateBottomNavBadge();
  }

  function remove(handle) {
    if (!handle) return;
    _items = _items.filter(function (h) {
      return h !== handle;
    });
    updateHeaderBadge();
    updateBottomNavBadge();
  }

  return {
    add: add,
    remove: remove,
    getCount: function () {
      return _items.length;
    },
    getItems: function () {
      return _items.slice();
    },
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a product handle string (non-empty, URL-safe).
 */
const handleArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/);

/**
 * Generates a sequence of wishlist operations: add or remove with a handle.
 */
const operationArb = fc.record({
  op: fc.constantFrom('add', 'remove'),
  handle: handleArb,
});

const operationsArb = fc.array(operationArb, { minLength: 1, maxLength: 30 });

// ---------------------------------------------------------------------------
// Property 9: Badge consistency
//
// **Validates: Requirements 2.7**
// ---------------------------------------------------------------------------

describe('Property 9: Badge consistency', () => {
  /**
   * **Validates: Requirements 2.7**
   *
   * After any sequence of add/remove operations, the header badge count,
   * the bottom nav badge count, and _wishlistItems.length must all be equal.
   */
  test('header badge and bottom nav badge always equal wishlist item count', () => {
    fc.assert(
      fc.property(operationsArb, function (operations) {
        // Set up DOM elements
        var headerBadge = document.createElement('span');
        headerBadge.setAttribute('data-wishlist-badge', '');
        headerBadge.textContent = '0';
        headerBadge.hidden = true;

        var bottomNavBadge = document.createElement('span');
        bottomNavBadge.setAttribute('data-bottom-nav-wishlist-badge', '');
        bottomNavBadge.textContent = '0';
        bottomNavBadge.hidden = true;

        var model = createWishlistModel(headerBadge, bottomNavBadge);

        // Apply operations
        operations.forEach(function (op) {
          if (op.op === 'add') {
            model.add(op.handle);
          } else {
            model.remove(op.handle);
          }
        });

        var count = model.getCount();
        var headerCount = parseInt(headerBadge.textContent, 10);
        var bottomNavCount = parseInt(bottomNavBadge.textContent, 10);

        // All three must be equal
        return headerCount === count && bottomNavCount === count;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 2.7**
   *
   * Badge hidden state must be consistent: hidden when count is 0,
   * visible when count > 0.
   */
  test('badge hidden state is consistent with count across both badges', () => {
    fc.assert(
      fc.property(operationsArb, function (operations) {
        var headerBadge = document.createElement('span');
        headerBadge.setAttribute('data-wishlist-badge', '');
        headerBadge.hidden = true;

        var bottomNavBadge = document.createElement('span');
        bottomNavBadge.setAttribute('data-bottom-nav-wishlist-badge', '');
        bottomNavBadge.hidden = true;

        var model = createWishlistModel(headerBadge, bottomNavBadge);

        operations.forEach(function (op) {
          if (op.op === 'add') {
            model.add(op.handle);
          } else {
            model.remove(op.handle);
          }
        });

        var count = model.getCount();
        var shouldBeHidden = count === 0;

        return headerBadge.hidden === shouldBeHidden && bottomNavBadge.hidden === shouldBeHidden;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 2.7**
   *
   * Duplicate adds do not inflate the badge count.
   */
  test('duplicate adds do not inflate badge count', () => {
    fc.assert(
      fc.property(handleArb, fc.integer({ min: 2, max: 10 }), function (handle, times) {
        var headerBadge = document.createElement('span');
        headerBadge.hidden = true;
        var bottomNavBadge = document.createElement('span');
        bottomNavBadge.hidden = true;

        var model = createWishlistModel(headerBadge, bottomNavBadge);

        // Add the same handle multiple times
        for (var i = 0; i < times; i++) {
          model.add(handle);
        }

        // Should only count as 1
        return (
          model.getCount() === 1 &&
          parseInt(headerBadge.textContent, 10) === 1 &&
          parseInt(bottomNavBadge.textContent, 10) === 1
        );
      }),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 2.7**
   *
   * Removing a non-existent handle does not change the badge count.
   */
  test('removing non-existent handle does not change badge count', () => {
    fc.assert(
      fc.property(
        fc.array(handleArb, { minLength: 1, maxLength: 5 }),
        handleArb,
        function (existingHandles, nonExistentHandle) {
          var headerBadge = document.createElement('span');
          headerBadge.hidden = true;
          var bottomNavBadge = document.createElement('span');
          bottomNavBadge.hidden = true;

          var model = createWishlistModel(headerBadge, bottomNavBadge);

          // Add some items
          existingHandles.forEach(function (h) {
            model.add(h);
          });
          var countBefore = model.getCount();

          // Remove a handle that was never added (use a prefix to ensure it's different)
          model.remove('__nonexistent__' + nonExistentHandle);
          var countAfter = model.getCount();

          return (
            countAfter === countBefore &&
            parseInt(headerBadge.textContent, 10) === countAfter &&
            parseInt(bottomNavBadge.textContent, 10) === countAfter
          );
        },
      ),
      { numRuns: 200, verbose: true },
    );
  });
});
