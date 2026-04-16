/**
 * Unit Tests: ImmersiveRoomRecommender
 *
 * Feature: immersive-ux-enhancements
 *
 * Tests verify all rule branches, dismissal sessionStorage flag,
 * ImmersiveRecommenderOverride hook, and default fallback to lounge.
 *
 * Requirements: 6.2–6.6, 6.10, 6.11
 */

'use strict';

// ---------------------------------------------------------------------------
// getRecommendation — reproduced verbatim from assets/immersive-store.js
// ---------------------------------------------------------------------------

var BRIDAL_KEYWORDS = ['bridal', 'bride', 'wedding', 'mehndi', 'nikah', 'walima', 'barat'];
var DESIGNER_HOUSE_COLLECTIONS = ['suffuse', 'soraya', 'saad-bin-shahzad'];

function getRecommendation(context) {
  if (typeof window !== 'undefined' && typeof window.ImmersiveRecommenderOverride === 'function') {
    try {
      var override = window.ImmersiveRecommenderOverride(context);
      if (override && override.roomKey) return override;
    } catch (e) {}
  }

  var visited = context.visitedRooms || [];
  var saved = context.savedProducts || [];
  var cart = context.cartCollections || [];

  var hasBridal = saved.concat(cart).some(function (h) {
    return BRIDAL_KEYWORDS.some(function (kw) {
      return h.indexOf(kw) !== -1;
    });
  });
  if (hasBridal && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your saves' };
  }

  var hasDesigner = saved.some(function (h) {
    return DESIGNER_HOUSE_COLLECTIONS.some(function (d) {
      return h.indexOf(d) !== -1;
    });
  });
  if (hasDesigner && visited.indexOf('designer_houses') === -1) {
    return { roomKey: 'designer_houses', label: 'Designer Houses', reason: 'Based on your saves' };
  }

  if (visited.indexOf('designer_houses') !== -1 && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your browsing' };
  }

  if (visited.indexOf('occasions') !== -1 && visited.indexOf('featured_collections') === -1) {
    return { roomKey: 'featured_collections', label: 'Featured Collections', reason: 'Based on your browsing' };
  }

  return { roomKey: 'lounge', label: 'Lounge', reason: 'Continue exploring' };
}

// ---------------------------------------------------------------------------
// Dismissal helpers — reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

function createMockStorage() {
  var store = {};
  return {
    getItem: function (key) {
      return store.hasOwnProperty(key) ? store[key] : null;
    },
    setItem: function (key, value) {
      store[key] = String(value);
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
}

function isDismissed(roomKey, storage) {
  try {
    return !!(storage || sessionStorage).getItem('immersive_rec_dismissed_' + roomKey);
  } catch (e) {
    return false;
  }
}

function dismissRecommendation(roomKey, storage) {
  try {
    (storage || sessionStorage).setItem('immersive_rec_dismissed_' + roomKey, '1');
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// Tests: Rule branches (Requirements 6.2–6.6)
// ---------------------------------------------------------------------------

describe('ImmersiveRoomRecommender — rule branches', () => {
  afterEach(() => {
    // Clean up any override
    if (typeof window !== 'undefined') {
      delete window.ImmersiveRecommenderOverride;
    }
  });

  // Rule 1: bridal/mehndi wishlist → occasions (Requirement 6.2)
  test('Rule 1: bridal product in wishlist → occasions', () => {
    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['bridal-lehenga-red'],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('occasions');
  });

  test('Rule 1: mehndi product in wishlist → occasions', () => {
    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['mehndi-dress-green'],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('occasions');
  });

  test('Rule 1: wedding product in cart → occasions', () => {
    var context = {
      visitedRooms: ['lounge'],
      savedProducts: [],
      viewedCollections: [],
      cartCollections: ['wedding-gharara'],
    };
    expect(getRecommendation(context).roomKey).toBe('occasions');
  });

  test('Rule 1: bridal product but occasions already visited → skip to next rule', () => {
    var context = {
      visitedRooms: ['lounge', 'occasions'],
      savedProducts: ['bridal-lehenga-red'],
      viewedCollections: [],
      cartCollections: [],
    };
    // Rule 1 skipped (occasions visited), Rule 2 doesn't match, Rule 3 doesn't match
    // Rule 4: visited occasions but not featured_collections → featured_collections
    expect(getRecommendation(context).roomKey).toBe('featured_collections');
  });

  // Rule 2: designer-house wishlist → designer_houses (Requirement 6.3)
  test('Rule 2: suffuse product in wishlist → designer_houses', () => {
    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['suffuse-silk-saree'],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('designer_houses');
  });

  test('Rule 2: soraya product in wishlist → designer_houses', () => {
    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['soraya-formal-gown'],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('designer_houses');
  });

  test('Rule 2: designer product but designer_houses already visited → skip', () => {
    var context = {
      visitedRooms: ['lounge', 'designer_houses'],
      savedProducts: ['suffuse-silk-saree'],
      viewedCollections: [],
      cartCollections: [],
    };
    // Rule 2 skipped, Rule 3: visited designer_houses but not occasions → occasions
    expect(getRecommendation(context).roomKey).toBe('occasions');
  });

  // Rule 3: visited designer_houses but not occasions → occasions (Requirement 6.4)
  test('Rule 3: visited designer_houses but not occasions → occasions', () => {
    var context = {
      visitedRooms: ['lounge', 'designer_houses'],
      savedProducts: [],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('occasions');
  });

  // Rule 4: visited occasions but not featured_collections → featured_collections (Requirement 6.5)
  test('Rule 4: visited occasions but not featured_collections → featured_collections', () => {
    var context = {
      visitedRooms: ['lounge', 'occasions'],
      savedProducts: [],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('featured_collections');
  });

  // Default fallback → lounge (Requirement 6.6)
  test('Default: all rooms visited, no special products → lounge', () => {
    var context = {
      visitedRooms: ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'],
      savedProducts: ['plain-kurta'],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('lounge');
  });

  test('Default: empty saved products, only lounge visited → lounge', () => {
    var context = {
      visitedRooms: ['lounge'],
      savedProducts: [],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(getRecommendation(context).roomKey).toBe('lounge');
  });

  test('recommendation includes a reason string', () => {
    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['bridal-lehenga'],
      viewedCollections: [],
      cartCollections: [],
    };
    var rec = getRecommendation(context);
    expect(typeof rec.reason).toBe('string');
    expect(rec.reason.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: Dismissal sessionStorage flag (Requirement 6.10)
// ---------------------------------------------------------------------------

describe('ImmersiveRoomRecommender — dismissal sessionStorage flag', () => {
  test('dismissRecommendation stores flag in sessionStorage', () => {
    var storage = createMockStorage();
    dismissRecommendation('occasions', storage);
    expect(storage.getItem('immersive_rec_dismissed_occasions')).toBe('1');
  });

  test('isDismissed returns true after dismissal', () => {
    var storage = createMockStorage();
    dismissRecommendation('occasions', storage);
    expect(isDismissed('occasions', storage)).toBe(true);
  });

  test('isDismissed returns false before dismissal', () => {
    var storage = createMockStorage();
    expect(isDismissed('occasions', storage)).toBe(false);
  });

  test('dismissal is per-roomKey: dismissing one does not affect another', () => {
    var storage = createMockStorage();
    dismissRecommendation('occasions', storage);
    expect(isDismissed('occasions', storage)).toBe(true);
    expect(isDismissed('designer_houses', storage)).toBe(false);
  });

  test('handles sessionStorage access errors gracefully', () => {
    var brokenStorage = {
      getItem: function () {
        throw new Error('Access denied');
      },
      setItem: function () {
        throw new Error('Access denied');
      },
    };
    expect(() => dismissRecommendation('occasions', brokenStorage)).not.toThrow();
    expect(isDismissed('occasions', brokenStorage)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: ImmersiveRecommenderOverride hook (Requirement 6.11)
// ---------------------------------------------------------------------------

describe('ImmersiveRoomRecommender — ImmersiveRecommenderOverride hook', () => {
  afterEach(() => {
    delete window.ImmersiveRecommenderOverride;
  });

  test('override hook is called with the current BrowsingContext', () => {
    var capturedContext = null;
    window.ImmersiveRecommenderOverride = function (ctx) {
      capturedContext = ctx;
      return { roomKey: 'storefront', label: 'Storefront', reason: 'Override' };
    };

    var context = {
      visitedRooms: ['lounge'],
      savedProducts: [],
      viewedCollections: [],
      cartCollections: [],
    };
    getRecommendation(context);
    expect(capturedContext).toBe(context);
  });

  test('override hook return value is used instead of rule engine', () => {
    window.ImmersiveRecommenderOverride = function () {
      return { roomKey: 'storefront', label: 'Storefront', reason: 'ML override' };
    };

    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['bridal-lehenga'], // would normally trigger occasions
      viewedCollections: [],
      cartCollections: [],
    };
    var rec = getRecommendation(context);
    expect(rec.roomKey).toBe('storefront');
    expect(rec.reason).toBe('ML override');
  });

  test('override hook returning null falls back to rule engine', () => {
    window.ImmersiveRecommenderOverride = function () {
      return null;
    };

    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['bridal-lehenga'],
      viewedCollections: [],
      cartCollections: [],
    };
    var rec = getRecommendation(context);
    // Rule engine fires: bridal → occasions
    expect(rec.roomKey).toBe('occasions');
  });

  test('override hook returning object without roomKey falls back to rule engine', () => {
    window.ImmersiveRecommenderOverride = function () {
      return { label: 'No room key here' };
    };

    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['bridal-lehenga'],
      viewedCollections: [],
      cartCollections: [],
    };
    var rec = getRecommendation(context);
    expect(rec.roomKey).toBe('occasions');
  });

  test('override hook throwing an error falls back to rule engine', () => {
    window.ImmersiveRecommenderOverride = function () {
      throw new Error('Override failed');
    };

    var context = {
      visitedRooms: ['lounge'],
      savedProducts: ['bridal-lehenga'],
      viewedCollections: [],
      cartCollections: [],
    };
    expect(() => getRecommendation(context)).not.toThrow();
    var rec = getRecommendation(context);
    expect(rec.roomKey).toBe('occasions');
  });
});
