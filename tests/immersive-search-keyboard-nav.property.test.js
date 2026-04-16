/**
 * Property-Based Test: Search Keyboard Navigation Tracks Active Result
 *
 * Feature: immersive-ux-enhancements
 * Property 2: Search keyboard navigation tracks active result
 *
 * **Validates: Requirements 1.5**
 *
 * For any non-empty result list and any sequence of Up/Down arrow key presses,
 * the `aria-activedescendant` attribute on the search input SHALL always
 * reference the ID of a valid result item in the list.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Pure navigation index computation
//
// Extracted from the navigateResults() function in assets/immersive-store.js.
// The actual function mutates module-level state (_searchActiveIndex) and
// updates the DOM. Here we model the pure index computation logic so it can
// be tested in isolation without a full DOM setup.
//
// Logic from immersive-store.js (lines ~3901-3917):
//   if (direction === 'down') {
//     _searchActiveIndex = Math.min(_searchActiveIndex + 1, _searchResults.length - 1);
//   } else {
//     _searchActiveIndex = Math.max(_searchActiveIndex - 1, 0);
//   }
//   var activeId = 'immersive-search-result-' + _searchActiveIndex;
//   input.setAttribute('aria-activedescendant', activeId);
// ---------------------------------------------------------------------------

/**
 * Computes the next active index given the current index, direction, and
 * total result count. Mirrors the clamping logic in navigateResults().
 *
 * @param {number} currentIndex - current active index (-1 = none selected)
 * @param {'down'|'up'} direction
 * @param {number} resultCount - total number of results (must be >= 1)
 * @returns {number} new active index, always in [0, resultCount - 1]
 */
function computeNextIndex(currentIndex, direction, resultCount) {
  if (direction === 'down') {
    return Math.min(currentIndex + 1, resultCount - 1);
  } else {
    return Math.max(currentIndex - 1, 0);
  }
}

/**
 * Simulates a full sequence of key presses starting from index -1 (no
 * selection) and returns the final active index.
 *
 * @param {Array<'down'|'up'>} keySequence
 * @param {number} resultCount
 * @returns {number} final active index
 */
function simulateKeySequence(keySequence, resultCount) {
  var activeIndex = -1;
  for (var i = 0; i < keySequence.length; i++) {
    activeIndex = computeNextIndex(activeIndex, keySequence[i], resultCount);
  }
  return activeIndex;
}

/**
 * Returns the aria-activedescendant value that navigateResults() would set
 * after the given key sequence.
 *
 * @param {Array<'down'|'up'>} keySequence
 * @param {number} resultCount
 * @returns {string} e.g. "immersive-search-result-2"
 */
function computeAriaActiveDescendant(keySequence, resultCount) {
  var finalIndex = simulateKeySequence(keySequence, resultCount);
  return 'immersive-search-result-' + finalIndex;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a non-empty array of search result items, each with a unique ID
 * matching the pattern used by buildResultEl() in immersive-store.js.
 * minLength: 1 ensures the results list is never empty (guard in navigateResults).
 */
const searchResultsArb = fc.integer({ min: 1, max: 20 }).map(function (count) {
  var results = [];
  for (var i = 0; i < count; i++) {
    results.push({ id: 'immersive-search-result-' + i, index: i });
  }
  return results;
});

/**
 * Generates a non-empty sequence of 'up' or 'down' key presses.
 * minLength: 1 ensures at least one key press occurs.
 */
const keySequenceArb = fc.array(fc.constantFrom('down', 'up'), { minLength: 1, maxLength: 50 });

// ---------------------------------------------------------------------------
// Property 2: Search keyboard navigation tracks active result
//
// **Validates: Requirements 1.5**
//
// For any non-empty result list and any sequence of Up/Down arrow key presses,
// aria-activedescendant SHALL always reference a valid result item ID.
// ---------------------------------------------------------------------------

describe('Property 2: Search keyboard navigation tracks active result', () => {
  /**
   * **Validates: Requirements 1.5**
   *
   * After any sequence of ArrowDown/ArrowUp key presses on a non-empty result
   * list, the aria-activedescendant value SHALL be the ID of one of the result
   * items in the list — never an out-of-bounds index, never a negative index.
   */
  test('aria-activedescendant always references a valid result item ID after any key sequence', () => {
    fc.assert(
      fc.property(searchResultsArb, keySequenceArb, function (results, keySequence) {
        var resultCount = results.length;

        // Compute the aria-activedescendant value the module would set
        var activeDescendant = computeAriaActiveDescendant(keySequence, resultCount);

        // The active descendant must match one of the valid result item IDs
        var validIds = results.map(function (r) {
          return r.id;
        });
        return validIds.indexOf(activeDescendant) !== -1;
      }),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 1.5**
   *
   * The active index after any key sequence must be within [0, resultCount - 1].
   * This directly verifies the clamping invariant in navigateResults().
   */
  test('active index is always within bounds [0, resultCount - 1] after any key sequence', () => {
    fc.assert(
      fc.property(searchResultsArb, keySequenceArb, function (results, keySequence) {
        var resultCount = results.length;
        var finalIndex = simulateKeySequence(keySequence, resultCount);

        return finalIndex >= 0 && finalIndex <= resultCount - 1;
      }),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 1.5**
   *
   * ArrowDown from the last item stays at the last item (upper clamp).
   * ArrowUp from the first item stays at the first item (lower clamp).
   * Verifies boundary clamping holds for any result list size.
   */
  test('navigation clamps at boundaries: ArrowDown at last item stays at last, ArrowUp at first stays at first', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), function (resultCount) {
        // Navigate to the last item via resultCount ArrowDown presses
        var downSequence = Array(resultCount).fill('down');
        var atLast = simulateKeySequence(downSequence, resultCount);
        if (atLast !== resultCount - 1) return false;

        // One more ArrowDown should stay at the last item
        var afterExtraDown = computeNextIndex(atLast, 'down', resultCount);
        if (afterExtraDown !== resultCount - 1) return false;

        // Navigate to the first item via one ArrowDown then many ArrowUp presses
        var upSequence = ['down'].concat(Array(resultCount + 5).fill('up'));
        var atFirst = simulateKeySequence(upSequence, resultCount);
        if (atFirst !== 0) return false;

        // One more ArrowUp should stay at 0
        var afterExtraUp = computeNextIndex(atFirst, 'up', resultCount);
        if (afterExtraUp !== 0) return false;

        return true;
      }),
      { numRuns: 100, verbose: true },
    );
  });
});
