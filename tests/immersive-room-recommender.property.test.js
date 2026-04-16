/**
 * Property-Based Test: Room Recommendation Coverage
 *
 * Feature: immersive-ux-enhancements
 * Property 10: Room recommendation coverage
 *
 * **Validates: Requirements 6.7**
 *
 * For any BrowsingContext where visitedRooms is non-empty, the
 * ImmersiveRoomRecommender rule engine SHALL return a non-null
 * RoomRecommendation — the default fallback to lounge guarantees a
 * result is always produced.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// getRecommendation — reproduced verbatim from assets/immersive-store.js
// ---------------------------------------------------------------------------

var BRIDAL_KEYWORDS = ['bridal', 'bride', 'wedding', 'mehndi', 'nikah', 'walima', 'barat'];
var DESIGNER_HOUSE_COLLECTIONS = ['suffuse', 'soraya', 'saad-bin-shahzad'];

function getRecommendation(context) {
  // Override hook for ML-driven scoring (not tested here — tested in unit tests)
  if (typeof window !== 'undefined' && typeof window.ImmersiveRecommenderOverride === 'function') {
    try {
      var override = window.ImmersiveRecommenderOverride(context);
      if (override && override.roomKey) return override;
    } catch (e) {}
  }

  var visited = context.visitedRooms || [];
  var saved = context.savedProducts || [];
  var cart = context.cartCollections || [];

  // Rule 1: wishlist/cart contains bridal/mehndi → occasions
  var hasBridal = saved.concat(cart).some(function (h) {
    return BRIDAL_KEYWORDS.some(function (kw) {
      return h.indexOf(kw) !== -1;
    });
  });
  if (hasBridal && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your saves' };
  }

  // Rule 2: wishlist contains designer-house products → designer_houses
  var hasDesigner = saved.some(function (h) {
    return DESIGNER_HOUSE_COLLECTIONS.some(function (d) {
      return h.indexOf(d) !== -1;
    });
  });
  if (hasDesigner && visited.indexOf('designer_houses') === -1) {
    return { roomKey: 'designer_houses', label: 'Designer Houses', reason: 'Based on your saves' };
  }

  // Rule 3: visited designer_houses but not occasions
  if (visited.indexOf('designer_houses') !== -1 && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your browsing' };
  }

  // Rule 4: visited occasions but not featured_collections
  if (visited.indexOf('occasions') !== -1 && visited.indexOf('featured_collections') === -1) {
    return { roomKey: 'featured_collections', label: 'Featured Collections', reason: 'Based on your browsing' };
  }

  // Default fallback
  return { roomKey: 'lounge', label: 'Lounge', reason: 'Continue exploring' };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

var ALL_ROOMS = ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'];

/**
 * Generates a non-empty array of visited rooms (subset of ALL_ROOMS).
 */
const visitedRoomsArb = fc
  .array(fc.constantFrom(...ALL_ROOMS), { minLength: 1, maxLength: 5 })
  .map(function (rooms) {
    // Deduplicate
    return rooms.filter(function (r, i) {
      return rooms.indexOf(r) === i;
    });
  })
  .filter(function (rooms) {
    return rooms.length >= 1;
  });

/**
 * Generates a product handle string (may or may not contain bridal/designer keywords).
 */
const productHandleArb = fc.oneof(
  fc.string({ minLength: 1, maxLength: 30 }),
  fc.constantFrom(
    'bridal-lehenga-red',
    'mehndi-dress-green',
    'suffuse-silk-saree',
    'soraya-formal-gown',
    'casual-kurta-blue',
    'wedding-gharara',
  ),
);

/**
 * Generates a BrowsingContext with non-empty visitedRooms.
 */
const browsingContextArb = fc.record({
  visitedRooms: visitedRoomsArb,
  savedProducts: fc.array(productHandleArb, { minLength: 0, maxLength: 5 }),
  viewedCollections: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
  cartCollections: fc.array(productHandleArb, { minLength: 0, maxLength: 3 }),
});

// ---------------------------------------------------------------------------
// Property 10: Room recommendation coverage
//
// **Validates: Requirements 6.7**
// ---------------------------------------------------------------------------

describe('Property 10: Room recommendation coverage', () => {
  /**
   * **Validates: Requirements 6.7**
   *
   * For any BrowsingContext with non-empty visitedRooms, getRecommendation()
   * must return a non-null RoomRecommendation.
   */
  test('getRecommendation always returns a non-null result for non-empty visitedRooms', () => {
    fc.assert(
      fc.property(browsingContextArb, function (context) {
        var rec = getRecommendation(context);
        return rec !== null && rec !== undefined;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 6.7**
   *
   * The returned recommendation always has a valid roomKey.
   */
  test('getRecommendation always returns a recommendation with a non-empty roomKey', () => {
    fc.assert(
      fc.property(browsingContextArb, function (context) {
        var rec = getRecommendation(context);
        return rec && typeof rec.roomKey === 'string' && rec.roomKey.length > 0;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 6.7**
   *
   * The returned roomKey is always one of the known room keys.
   */
  test('getRecommendation always returns a known room key', () => {
    fc.assert(
      fc.property(browsingContextArb, function (context) {
        var rec = getRecommendation(context);
        return ALL_ROOMS.indexOf(rec.roomKey) !== -1;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 6.7**
   *
   * The returned recommendation always has a non-empty reason string.
   */
  test('getRecommendation always returns a recommendation with a reason', () => {
    fc.assert(
      fc.property(browsingContextArb, function (context) {
        var rec = getRecommendation(context);
        return rec && typeof rec.reason === 'string' && rec.reason.length > 0;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 6.7**
   *
   * Default fallback: when no rules match, lounge is recommended.
   */
  test('default fallback returns lounge when no rules match', () => {
    // Context where no rules fire: visited all rooms, no bridal/designer products
    var context = {
      visitedRooms: ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'],
      savedProducts: ['casual-kurta', 'plain-shirt'],
      viewedCollections: [],
      cartCollections: [],
    };
    var rec = getRecommendation(context);
    expect(rec.roomKey).toBe('lounge');
  });
});
