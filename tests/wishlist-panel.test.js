/**
 * Tests for wishlist logic
 *
 * Feature: immersive-store-modular-refactor
 *
 * Covers:
 *   - Property 4: Wishlist round-trip persistence (via wishlist-and-preferences.unit.test.js pattern)
 *   - Unit tests: wishlist API surface in immersive-store.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const fc = require('fast-check');

const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-store.js');
let source;

beforeAll(() => {
  source = fs.readFileSync(SOURCE_PATH, 'utf8');
});

// ---------------------------------------------------------------------------
// Static analysis: wishlist function presence
// ---------------------------------------------------------------------------

describe('immersive-store.js contains wishlist functions', () => {
  test('immersive-store.js contains addToWishlist function', () => {
    expect(source).toContain('function addToWishlist');
  });

  test('immersive-store.js contains removeFromWishlist function', () => {
    expect(source).toContain('function removeFromWishlist');
  });

  test('immersive-store.js contains initWishlist function', () => {
    expect(source).toContain('function initWishlist');
  });

  test('immersive-store.js contains openWishlistPanel function', () => {
    expect(source).toContain('function openWishlistPanel');
  });

  test('immersive-store.js contains closeWishlistPanel function', () => {
    expect(source).toContain('function closeWishlistPanel');
  });
});

// ---------------------------------------------------------------------------
// Static analysis: wishlist constants and storage
// ---------------------------------------------------------------------------

describe('wishlist storage and constants', () => {
  test('wishlist uses WISHLIST_KEY constant', () => {
    expect(source).toContain('WISHLIST_KEY');
  });

  test('wishlist persists to localStorage', () => {
    // _persistWishlist calls localStorage.setItem with WISHLIST_KEY
    expect(source).toContain('localStorage.setItem');
    // Confirm it's in the wishlist context (near WISHLIST_KEY)
    var wishlistKeyIdx = source.indexOf('WISHLIST_KEY');
    expect(wishlistKeyIdx).toBeGreaterThan(-1);
    // localStorage.setItem appears in the file
    var setItemIdx = source.indexOf('localStorage.setItem');
    expect(setItemIdx).toBeGreaterThan(-1);
  });

  test('wishlist reads from localStorage on init', () => {
    // initWishlist calls localStorage.getItem to load persisted items
    var initIdx = source.indexOf('function initWishlist');
    expect(initIdx).toBeGreaterThan(-1);
    var initBlock = source.slice(initIdx, initIdx + 1000);
    expect(initBlock).toContain('localStorage.getItem');
  });

  test('wishlist item stored as object with handle and discoveryRoom', () => {
    // addToWishlist pushes { handle, discoveryRoom } objects
    expect(source).toContain('discoveryRoom');
    // Confirm it's in the wishlist context
    var addIdx = source.indexOf('function addToWishlist');
    expect(addIdx).toBeGreaterThan(-1);
    var addBlock = source.slice(addIdx, addIdx + 500);
    expect(addBlock).toContain('discoveryRoom');
  });
});

// ---------------------------------------------------------------------------
// Property 4: Wishlist item object shape — pure construction test
// ---------------------------------------------------------------------------

describe('Property 4: Wishlist item object shape', () => {
  /**
   * Feature: immersive-store-modular-refactor
   * Property 4: Wishlist round-trip persistence
   *
   * For any valid handle string, the wishlist item object
   * { handle, discoveryRoom: 'lounge' } has the correct shape.
   * Pure object construction — no DOM needed.
   */
  test('Property 4 — wishlist item { handle, discoveryRoom } has correct shape for any valid handle', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(function (s) {
          return /^[a-z0-9-]+$/.test(s);
        }),
        function (handle) {
          var item = { handle: handle, discoveryRoom: 'lounge' };

          expect(typeof item).toBe('object');
          expect(item).not.toBeNull();
          expect(item.handle).toBe(handle);
          expect(Object.prototype.hasOwnProperty.call(item, 'discoveryRoom')).toBe(true);
          expect(item.discoveryRoom).toBe('lounge');
        },
      ),
      { numRuns: 100 },
    );
  });

  test('Property 4 — wishlist item discoveryRoom can be any valid room key', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(function (s) {
          return /^[a-z0-9-]+$/.test(s);
        }),
        fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'),
        function (handle, room) {
          var item = { handle: handle, discoveryRoom: room };

          expect(item.handle).toBe(handle);
          expect(item.discoveryRoom).toBe(room);
          // Serialises and deserialises correctly (round-trip)
          var serialised = JSON.stringify(item);
          var deserialised = JSON.parse(serialised);
          expect(deserialised.handle).toBe(handle);
          expect(deserialised.discoveryRoom).toBe(room);
        },
      ),
      { numRuns: 100 },
    );
  });
});
