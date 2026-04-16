/**
 * Property-Based Tests: ImmersiveFilters
 *
 * Feature: immersive-ux-enhancements
 * Property 3: Filter idempotency
 * Property 4: Filter persistence round-trip
 * Property 5: Filter URL params use only allowlisted keys
 *
 * **Validates: Requirements 4.6, 4.10, 4.12**
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Functions reproduced from assets/immersive-store.js
// ---------------------------------------------------------------------------

var FILTER_ALLOWED_PARAMS = ['filter.p.m.custom.color[]', 'filter.v.price.gte', 'filter.v.price.lte', 'sort_by'];

function saveFilters(roomKey, state, storage) {
  try {
    (storage || sessionStorage).setItem('immersive_filters_' + roomKey, JSON.stringify(state));
  } catch (e) {}
}

function loadFilters(roomKey, storage) {
  try {
    var raw = (storage || sessionStorage).getItem('immersive_filters_' + roomKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * buildFilterUrl — reproduced from assets/immersive-store.js.
 * Constructs a URL with only allowlisted filter params applied.
 */
function buildFilterUrl(baseUrl, state) {
  var url = new URL(baseUrl, 'https://example.myshopify.com');

  // Remove any existing filter params
  FILTER_ALLOWED_PARAMS.forEach(function (key) {
    url.searchParams.delete(key);
  });
  var toDelete = [];
  url.searchParams.forEach(function (val, key) {
    if (key.indexOf('filter.') === 0) toDelete.push(key);
  });
  toDelete.forEach(function (k) {
    url.searchParams.delete(k);
  });

  // Apply new state — only allowlisted keys
  if (state.colors && state.colors.length) {
    state.colors.forEach(function (c) {
      url.searchParams.append('filter.p.m.custom.color[]', c);
    });
  }
  if (state.priceMin !== null && state.priceMin !== undefined && state.priceMin !== '') {
    url.searchParams.set('filter.v.price.gte', state.priceMin);
  }
  if (state.priceMax !== null && state.priceMax !== undefined && state.priceMax !== '') {
    url.searchParams.set('filter.v.price.lte', state.priceMax);
  }
  if (state.sortBy && state.sortBy !== 'manual') {
    url.searchParams.set('sort_by', state.sortBy);
  }
  return url.pathname + url.search;
}

// ---------------------------------------------------------------------------
// In-memory sessionStorage mock for property tests
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

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const colorArb = fc.string({ minLength: 1, maxLength: 20 });
const priceArb = fc.oneof(fc.constant(null), fc.nat(100000));
const sortByArb = fc.constantFrom('manual', 'price-ascending', 'price-descending', 'title-ascending');
const roomKeyArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,19}$/);

/**
 * Generates a valid FilterState object.
 */
const filterStateArb = fc.record({
  colors: fc.array(colorArb, { minLength: 0, maxLength: 5 }),
  priceMin: priceArb,
  priceMax: priceArb,
  designers: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
  sortBy: sortByArb,
});

// ---------------------------------------------------------------------------
// Property 4: Filter persistence round-trip
//
// **Validates: Requirements 4.10**
// ---------------------------------------------------------------------------

describe('Property 4: Filter persistence round-trip', () => {
  /**
   * **Validates: Requirements 4.10**
   *
   * saveFilters(roomKey, state) followed by loadFilters(roomKey) must return
   * a value deep-equal to the saved state — no fields lost or mutated.
   */
  test('loadFilters after saveFilters returns deep-equal state', () => {
    fc.assert(
      fc.property(roomKeyArb, filterStateArb, function (roomKey, state) {
        var storage = createMockStorage();
        saveFilters(roomKey, state, storage);
        var loaded = loadFilters(roomKey, storage);

        if (!loaded) return false;

        // Deep equality check
        if (JSON.stringify(loaded) !== JSON.stringify(state)) return false;
        return true;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 4.10**
   *
   * Different roomKeys are stored independently — loading one does not
   * affect another.
   */
  test('different roomKeys are stored independently', () => {
    fc.assert(
      fc.property(
        roomKeyArb,
        roomKeyArb,
        filterStateArb,
        filterStateArb,
        function (roomKey1, roomKey2, state1, state2) {
          // Ensure keys are different
          if (roomKey1 === roomKey2) return true; // skip equal keys

          var storage = createMockStorage();
          saveFilters(roomKey1, state1, storage);
          saveFilters(roomKey2, state2, storage);

          var loaded1 = loadFilters(roomKey1, storage);
          var loaded2 = loadFilters(roomKey2, storage);

          return (
            JSON.stringify(loaded1) === JSON.stringify(state1) && JSON.stringify(loaded2) === JSON.stringify(state2)
          );
        },
      ),
      { numRuns: 200, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 4.10**
   *
   * loadFilters returns null when no state has been saved for a roomKey.
   */
  test('loadFilters returns null for unsaved roomKey', () => {
    fc.assert(
      fc.property(roomKeyArb, function (roomKey) {
        var storage = createMockStorage();
        var result = loadFilters(roomKey, storage);
        return result === null;
      }),
      { numRuns: 100, verbose: true },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Filter URL params use only allowlisted keys
//
// **Validates: Requirements 4.12**
// ---------------------------------------------------------------------------

describe('Property 5: Filter URL params use only allowlisted keys', () => {
  /**
   * **Validates: Requirements 4.12**
   *
   * The URL query string constructed by buildFilterUrl() must contain only
   * params from the allowlisted set — no user-supplied or arbitrary keys.
   */
  test('buildFilterUrl only produces allowlisted query params', () => {
    fc.assert(
      fc.property(filterStateArb, function (state) {
        var result = buildFilterUrl('/collections/test?section_id=immersive-product-grid', state);
        var url = new URL(result, 'https://example.myshopify.com');

        var valid = true;
        url.searchParams.forEach(function (val, key) {
          // section_id is a non-filter param that may be present
          if (key === 'section_id') return;
          // All other params must be in the allowlist
          if (FILTER_ALLOWED_PARAMS.indexOf(key) === -1) {
            valid = false;
          }
        });
        return valid;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 4.12**
   *
   * No filter.* params other than the allowlisted ones appear in the URL.
   */
  test('no non-allowlisted filter.* params appear in the URL', () => {
    fc.assert(
      fc.property(filterStateArb, function (state) {
        var result = buildFilterUrl('/collections/test', state);
        var url = new URL(result, 'https://example.myshopify.com');

        var valid = true;
        url.searchParams.forEach(function (val, key) {
          if (key.indexOf('filter.') === 0 && FILTER_ALLOWED_PARAMS.indexOf(key) === -1) {
            valid = false;
          }
        });
        return valid;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 4.12**
   *
   * A FilterState with no active filters produces a URL with no filter params.
   */
  test('empty FilterState produces no filter params in URL', () => {
    var emptyState = { colors: [], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
    var result = buildFilterUrl('/collections/test', emptyState);
    var url = new URL(result, 'https://example.myshopify.com');

    url.searchParams.forEach(function (val, key) {
      if (key !== 'section_id') {
        throw new Error('Unexpected param: ' + key);
      }
    });
    // No filter params present
    expect(url.searchParams.has('filter.p.m.custom.color[]')).toBe(false);
    expect(url.searchParams.has('filter.v.price.gte')).toBe(false);
    expect(url.searchParams.has('filter.v.price.lte')).toBe(false);
    expect(url.searchParams.has('sort_by')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Property 3: Filter idempotency
//
// **Validates: Requirements 4.6**
// ---------------------------------------------------------------------------

describe('Property 3: Filter idempotency', () => {
  /**
   * **Validates: Requirements 4.6**
   *
   * Applying the same FilterState twice produces identical URL params as
   * applying it once — the Section Rendering API is called with identical
   * params on both applications.
   */
  test('applying the same FilterState twice produces identical URL params', () => {
    fc.assert(
      fc.property(filterStateArb, function (state) {
        var baseUrl = '/collections/test?section_id=immersive-product-grid';
        var result1 = buildFilterUrl(baseUrl, state);
        var result2 = buildFilterUrl(baseUrl, state);
        return result1 === result2;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 4.6**
   *
   * Applying a FilterState to a URL that already has those params applied
   * produces the same result as applying it to a clean URL.
   */
  test('applying FilterState to pre-filtered URL produces same params as clean URL', () => {
    fc.assert(
      fc.property(filterStateArb, function (state) {
        var cleanUrl = '/collections/test?section_id=immersive-product-grid';

        // Apply once
        var firstApply = buildFilterUrl(cleanUrl, state);
        // Apply again to the already-filtered URL
        var secondApply = buildFilterUrl(firstApply, state);

        // Parse both and compare filter params
        var url1 = new URL(firstApply, 'https://example.myshopify.com');
        var url2 = new URL(secondApply, 'https://example.myshopify.com');

        // Compare all filter params
        var params1 = {};
        var params2 = {};
        url1.searchParams.forEach(function (v, k) {
          params1[k] = (params1[k] || []).concat(v);
        });
        url2.searchParams.forEach(function (v, k) {
          params2[k] = (params2[k] || []).concat(v);
        });

        return JSON.stringify(params1) === JSON.stringify(params2);
      }),
      { numRuns: 300, verbose: true },
    );
  });
});
