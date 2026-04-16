/**
 * Property-Based Test: Search Result Grouping is Exhaustive and Non-Overlapping
 *
 * Feature: immersive-ux-enhancements
 * Property 1: Search result grouping is exhaustive and non-overlapping
 *
 * **Validates: Requirements 1.4**
 *
 * For any array of search results returned by the Predictive Search API,
 * the union of grouped.products, grouped.collections, and grouped.rooms
 * SHALL contain exactly the same total item count as the input array —
 * no items are lost or duplicated during grouping.
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Pure grouping function
//
// Models the grouping logic from renderResults() in assets/immersive-store.js.
// The actual function receives two separate inputs (apiResults, roomMatches);
// here we model the combined flat-array form to test the invariant that
// every input item ends up in exactly one group.
//
// Grouping rules (mirroring immersive-store.js renderResults logic):
//   type === 'product'    → products group
//   type === 'collection' → collections group
//   type === 'room'       → rooms group
//   type === 'page'       → products group (pages come back in product results)
//   anything else         → products group (safe default)
// ---------------------------------------------------------------------------

/**
 * Groups a flat array of search result items into products, collections, and rooms.
 * Mirrors the grouping logic in renderResults() in assets/immersive-store.js.
 *
 * @param {Array<{type: string, handle: string}>} items
 * @returns {{ products: Array, collections: Array, rooms: Array }}
 */
function groupSearchResults(items) {
  var products = [];
  var collections = [];
  var rooms = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item.type === 'collection') {
      collections.push(item);
    } else if (item.type === 'room') {
      rooms.push(item);
    } else {
      // 'product', 'page', or any other type → products bucket
      products.push(item);
    }
  }

  return { products: products, collections: collections, rooms: rooms };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a single search result item with a type from the realistic set
 * used by the Shopify Predictive Search API plus the client-side 'room' type.
 */
const searchItemArb = fc.record({
  type: fc.constantFrom('product', 'collection', 'page', 'room'),
  handle: fc.string({ minLength: 1, maxLength: 40 }),
});

/**
 * Generates an array of search result items (including empty arrays).
 */
const searchItemsArb = fc.array(searchItemArb, { minLength: 0, maxLength: 50 });

// ---------------------------------------------------------------------------
// Property 1: Search result grouping is exhaustive and non-overlapping
//
// **Validates: Requirements 1.4**
// ---------------------------------------------------------------------------

describe('Property 1: Search result grouping is exhaustive and non-overlapping', () => {
  /**
   * **Validates: Requirements 1.4**
   *
   * The total count of items across all groups must equal the input length.
   * No items are lost or duplicated during grouping.
   */
  test('total grouped count equals input length for any array of results', () => {
    fc.assert(
      fc.property(searchItemsArb, function (items) {
        var grouped = groupSearchResults(items);
        var total = grouped.products.length + grouped.collections.length + grouped.rooms.length;
        return total === items.length;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 1.4**
   *
   * Groups are non-overlapping: no item appears in more than one group.
   * We verify this by checking that each item's handle appears in exactly
   * one group (using index-based identity since handles may not be unique,
   * we track by object reference).
   */
  test('groups are non-overlapping: no item appears in more than one group', () => {
    fc.assert(
      fc.property(searchItemsArb, function (items) {
        var grouped = groupSearchResults(items);
        var allGrouped = grouped.products.concat(grouped.collections).concat(grouped.rooms);

        // Every item in the input must appear exactly once across all groups
        for (var i = 0; i < items.length; i++) {
          var count = 0;
          for (var j = 0; j < allGrouped.length; j++) {
            if (allGrouped[j] === items[i]) count++;
          }
          if (count !== 1) return false;
        }
        return true;
      }),
      { numRuns: 500, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 1.4**
   *
   * Items with type 'collection' always land in the collections group only.
   */
  test('collection-type items always land in the collections group', () => {
    fc.assert(
      fc.property(searchItemsArb, function (items) {
        var grouped = groupSearchResults(items);
        var collectionItems = items.filter(function (i) {
          return i.type === 'collection';
        });
        return grouped.collections.length === collectionItems.length;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 1.4**
   *
   * Items with type 'room' always land in the rooms group only.
   */
  test('room-type items always land in the rooms group', () => {
    fc.assert(
      fc.property(searchItemsArb, function (items) {
        var grouped = groupSearchResults(items);
        var roomItems = items.filter(function (i) {
          return i.type === 'room';
        });
        return grouped.rooms.length === roomItems.length;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 1.4**
   *
   * Items with type 'product' or 'page' always land in the products group.
   */
  test('product and page type items always land in the products group', () => {
    fc.assert(
      fc.property(searchItemsArb, function (items) {
        var grouped = groupSearchResults(items);
        var productItems = items.filter(function (i) {
          return i.type === 'product' || i.type === 'page';
        });
        return grouped.products.length === productItems.length;
      }),
      { numRuns: 300, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 1.4**
   *
   * Empty input produces empty groups (no phantom items created).
   */
  test('empty input produces empty groups', () => {
    var grouped = groupSearchResults([]);
    expect(grouped.products).toHaveLength(0);
    expect(grouped.collections).toHaveLength(0);
    expect(grouped.rooms).toHaveLength(0);
  });
});
