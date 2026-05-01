/**
 * Tests for wishlist-panel.js
 *
 * Feature: immersive-store-modular-refactor
 *
 * Covers:
 *   - Property 4: Wishlist round-trip persistence
 *   - Unit tests for wishlist backward-compatible aliases (task 10.2)
 */

'use strict';

const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupWishlistGlobals() {
  global.immersiveState = {
    currentRoom: 'lounge',
    mode: 'showroom',
    editorialRoom: null,
    lastHotspot: null,
    guided: false,
    navigationStack: [],
  };

  global._wishlistItems = [];
  global._wishlistProductCache = {};
  global._wishlistPanelTrigger = null;
  global.WISHLIST_KEY = 'immersive_wishlist';
  global.reduceMotion = false;

  global.trackImmersiveEvent = jest.fn();
  global.recordBrowsingSignal = jest.fn();
  global.getFocusableElements = jest.fn().mockReturnValue([]);
  global.handleEmptyStateAction = jest.fn();
  global.renderEmptyState = jest.fn().mockReturnValue('<div></div>');
  global.openProductPanel = jest.fn();
  global.updateWishlistBadge = jest.fn();
  global.syncAllWishlistToggles = jest.fn();

  global.window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// ---------------------------------------------------------------------------
// Property 4: Wishlist round-trip persistence
// ---------------------------------------------------------------------------

describe('Property 4: Wishlist round-trip persistence', () => {
  // Feature: immersive-store-modular-refactor, Property 4: Wishlist round-trip persistence
  // Validates: Requirements 9.5

  beforeEach(() => {
    jest.resetModules();
    setupWishlistGlobals();
    localStorage.clear();
  });

  test('Property 4 — addToWishlist persists handle to localStorage for any valid handle string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
        (handle) => {
          jest.resetModules();
          setupWishlistGlobals();
          localStorage.clear();

          require('../assets/immersive/panels/wishlist-panel.js');
          window.addToWishlist(handle, 'test', null);

          const raw = localStorage.getItem('immersive_wishlist');
          expect(raw).not.toBeNull();

          const stored = JSON.parse(raw);
          expect(Array.isArray(stored)).toBe(true);

          const found = stored.some((item) => {
            if (typeof item === 'string') return item === handle;
            return item.handle === handle;
          });
          expect(found).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  test('Property 4 — persisted item is stored as { handle, discoveryRoom } object', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
        (handle) => {
          jest.resetModules();
          setupWishlistGlobals();
          localStorage.clear();

          require('../assets/immersive/panels/wishlist-panel.js');
          window.addToWishlist(handle, 'test', null);

          const stored = JSON.parse(localStorage.getItem('immersive_wishlist'));
          const item = stored.find((i) => (typeof i === 'string' ? i === handle : i.handle === handle));

          expect(item).toBeDefined();
          expect(typeof item).toBe('object');
          expect(item.handle).toBe(handle);
          expect(Object.prototype.hasOwnProperty.call(item, 'discoveryRoom')).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  test('Property 4 — discoveryRoom matches immersiveState.currentRoom at time of add', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
        fc.constantFrom('lounge', 'designer_houses', 'occasions', 'featured_collections'),
        (handle, room) => {
          jest.resetModules();
          setupWishlistGlobals();
          localStorage.clear();

          global.immersiveState.currentRoom = room;
          require('../assets/immersive/panels/wishlist-panel.js');
          global.immersiveState.currentRoom = room;

          window.addToWishlist(handle, 'test', null);

          const stored = JSON.parse(localStorage.getItem('immersive_wishlist'));
          const item = stored.find((i) => (typeof i === 'string' ? i === handle : i.handle === handle));

          expect(item).toBeDefined();
          expect(item.discoveryRoom).toBe(room);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests: wishlist backward-compatible aliases (Task 10.2)
// ---------------------------------------------------------------------------

describe('wishlist-panel.js backward-compatible aliases', () => {
  beforeEach(() => {
    jest.resetModules();
    setupWishlistGlobals();
    localStorage.clear();
    require('../assets/immersive/panels/wishlist-panel.js');
  });

  test('window.addToWishlist is a function', () => {
    expect(typeof window.addToWishlist).toBe('function');
  });

  test('window.removeFromWishlist is a function', () => {
    expect(typeof window.removeFromWishlist).toBe('function');
  });

  test('window.openWishlistPanel is a function', () => {
    expect(typeof window.openWishlistPanel).toBe('function');
  });

  test('window.closeWishlistPanel is a function', () => {
    expect(typeof window.closeWishlistPanel).toBe('function');
  });

  test('window.ImmersiveWishlist namespace object exists', () => {
    expect(typeof window.ImmersiveWishlist).toBe('object');
    expect(window.ImmersiveWishlist).not.toBeNull();
  });

  test('ImmersiveWishlist has all expected keys', () => {
    const expectedKeys = [
      'addToWishlist',
      'removeFromWishlist',
      'getWishlist',
      'updateWishlistBadge',
      'syncAllWishlistToggles',
      'toggleWishlistItem',
      'cacheWishlistProduct',
      'renderWishlistPanel',
      'openWishlistPanel',
      'closeWishlistPanel',
      'initWishlist',
    ];
    expectedKeys.forEach((key) => {
      expect(typeof window.ImmersiveWishlist[key]).toBe('function');
    });
  });

  test('ImmersiveWishlist.addToWishlist and window.addToWishlist are the same function', () => {
    expect(window.ImmersiveWishlist.addToWishlist).toBe(window.addToWishlist);
  });

  test('ImmersiveWishlist.removeFromWishlist and window.removeFromWishlist are the same function', () => {
    expect(window.ImmersiveWishlist.removeFromWishlist).toBe(window.removeFromWishlist);
  });

  test('ImmersiveWishlist.openWishlistPanel and window.openWishlistPanel are the same function', () => {
    expect(window.ImmersiveWishlist.openWishlistPanel).toBe(window.openWishlistPanel);
  });

  test('ImmersiveWishlist.closeWishlistPanel and window.closeWishlistPanel are the same function', () => {
    expect(window.ImmersiveWishlist.closeWishlistPanel).toBe(window.closeWishlistPanel);
  });
});
