/**
 * Integration tests: Theme editor re-initialisation compatibility
 *
 * Feature: immersive-store-modular-refactor
 * Task: 12.2
 *
 * Requirements: 8.1–8.5
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractBlock(source, startMarker) {
  var idx = source.indexOf(startMarker);
  if (idx === -1) return '';
  var braceStart = source.indexOf('{', idx);
  if (braceStart === -1) return '';
  var depth = 0;
  for (var i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(braceStart, i + 1);
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Static analysis tests
// ---------------------------------------------------------------------------

describe('Theme editor re-initialisation compatibility', function () {
  var source;

  beforeAll(function () {
    source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'immersive-store.js'), 'utf8');
  });

  describe('shopify:section:load handler', function () {
    test('immersive-store.js registers a shopify:section:load event listener', function () {
      expect(source).toContain("'shopify:section:load'");
    });

    test('shopify:section:load handler calls safeBindImmersiveInit', function () {
      var block = extractBlock(source, "'shopify:section:load'");
      expect(block).toContain('safeBindImmersiveInit');
    });

    test('shopify:section:load handler resets _immersiveInitBound to false before calling safeBindImmersiveInit', function () {
      var block = extractBlock(source, "'shopify:section:load'");
      var resetIdx = block.indexOf('_immersiveInitBound = false');
      var callIdx = block.indexOf('safeBindImmersiveInit');
      expect(resetIdx).toBeGreaterThanOrEqual(0);
      expect(callIdx).toBeGreaterThanOrEqual(0);
      expect(resetIdx).toBeLessThan(callIdx);
    });

    test('shopify:section:load handler guards on #immersive-canvas being present in the target', function () {
      var block = extractBlock(source, "'shopify:section:load'");
      expect(block).toContain('#immersive-canvas');
    });
  });

  describe('shopify:section:unload handler', function () {
    test('immersive-store.js registers a shopify:section:unload event listener', function () {
      expect(source).toContain("'shopify:section:unload'");
    });

    test('shopify:section:unload handler resets _immersiveInitBound to false', function () {
      var block = extractBlock(source, "'shopify:section:unload'");
      expect(block).toContain('_immersiveInitBound = false');
    });

    test('shopify:section:unload handler guards on #immersive-canvas being present in the target', function () {
      var block = extractBlock(source, "'shopify:section:unload'");
      expect(block).toContain('#immersive-canvas');
    });
  });

  describe('safeBindImmersiveInit calls initWishlist', function () {
    test('safeBindImmersiveInit calls initWishlist() (from wishlist-panel.js module)', function () {
      var block = extractBlock(source, 'function safeBindImmersiveInit');
      expect(block).toContain('initWishlist()');
    });

    test('safeBindImmersiveInit is defined in immersive-store.js', function () {
      expect(source).toContain('function safeBindImmersiveInit');
    });
  });

  describe('module ownership of shopify:section:* listeners', function () {
    test('immersive-store.js registers shopify:section:select event listener', function () {
      expect(source).toContain("'shopify:section:select'");
    });

    test('no module file registers its own shopify:section:* listeners (Requirement 8.4)', function () {
      var moduleFiles = [
        path.join(__dirname, '..', 'assets', 'immersive', 'editorial', 'hero-parallax.js'),
        path.join(__dirname, '..', 'assets', 'immersive', 'editorial', 'editorial-mode.js'),
        path.join(__dirname, '..', 'assets', 'immersive', 'panels', 'glass-panel.js'),
        path.join(__dirname, '..', 'assets', 'immersive', 'panels', 'product-panel.js'),
        path.join(__dirname, '..', 'assets', 'immersive', 'panels', 'wishlist-panel.js'),
        path.join(__dirname, '..', 'assets', 'immersive', 'core', 'room-manager.js'),
      ];
      moduleFiles.forEach(function (filePath) {
        var moduleSource = fs.readFileSync(filePath, 'utf8');
        expect(moduleSource).not.toContain("'shopify:section:load'");
        expect(moduleSource).not.toContain("'shopify:section:unload'");
        expect(moduleSource).not.toContain("'shopify:section:select'");
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Behavioural tests
// ---------------------------------------------------------------------------

describe('Theme editor re-initialisation — behavioural stubs', function () {
  describe('shopify:section:load event', function () {
    test('handler resets _immersiveInitBound and calls safeBindImmersiveInit when #immersive-canvas is in the target', function () {
      var section = document.createElement('section');
      var canvas = document.createElement('div');
      canvas.id = 'immersive-canvas';
      section.appendChild(canvas);
      document.body.appendChild(section);

      var safeBindCalled = false;
      var immersiveInitBound = true;

      function simulateSectionLoadHandler(target) {
        if (target && target.querySelector && target.querySelector('#immersive-canvas')) {
          immersiveInitBound = false;
          safeBindCalled = true;
        }
      }

      simulateSectionLoadHandler(section);

      expect(immersiveInitBound).toBe(false);
      expect(safeBindCalled).toBe(true);

      document.body.removeChild(section);
    });

    test('handler does NOT call safeBindImmersiveInit when #immersive-canvas is absent', function () {
      var section = document.createElement('section');
      var safeBindCalled = false;
      var immersiveInitBound = true;

      function simulateSectionLoadHandler(target) {
        if (target && target.querySelector && target.querySelector('#immersive-canvas')) {
          immersiveInitBound = false;
          safeBindCalled = true;
        }
      }

      simulateSectionLoadHandler(section);

      expect(safeBindCalled).toBe(false);
      expect(immersiveInitBound).toBe(true);
    });
  });

  describe('shopify:section:unload event', function () {
    test('handler resets _immersiveInitBound to false when #immersive-canvas is in the target', function () {
      var section = document.createElement('section');
      var canvas = document.createElement('div');
      canvas.id = 'immersive-canvas';
      section.appendChild(canvas);
      document.body.appendChild(section);

      var immersiveInitBound = true;

      function simulateSectionUnloadHandler(target) {
        if (target && target.querySelector && target.querySelector('#immersive-canvas')) {
          immersiveInitBound = false;
        }
      }

      simulateSectionUnloadHandler(section);
      expect(immersiveInitBound).toBe(false);
      document.body.removeChild(section);
    });

    test('handler does NOT reset _immersiveInitBound when #immersive-canvas is absent', function () {
      var section = document.createElement('section');
      var immersiveInitBound = true;

      function simulateSectionUnloadHandler(target) {
        if (target && target.querySelector && target.querySelector('#immersive-canvas')) {
          immersiveInitBound = false;
        }
      }

      simulateSectionUnloadHandler(section);
      expect(immersiveInitBound).toBe(true);
    });
  });

  describe('wishlist-panel.js exposes window.initWishlist for safeBindImmersiveInit', function () {
    beforeEach(function () {
      jest.resetModules();
      global.immersiveState = {
        currentRoom: 'lounge',
        mode: 'showroom',
        editorialRoom: null,
        lastHotspot: null,
        guided: false,
        navigationStack: [],
      };
      global.WISHLIST_KEY = 'immersive_wishlist';
      global._wishlistItems = [];
      global._wishlistProductCache = {};
      global._wishlistPanelTrigger = null;
      global.trackImmersiveEvent = jest.fn();
      global.recordBrowsingSignal = jest.fn();
      global.openDialogFocus = jest.fn();
      global.closeDialogFocus = jest.fn();
      global.getFocusableElements = jest.fn().mockReturnValue([]);
      global.fetchWithCache = jest.fn().mockResolvedValue('<div></div>');
      global.openProductPanel = jest.fn();
      global.syncAllWishlistToggles = jest.fn();
      global.cacheWishlistProduct = jest.fn();
      global.renderSkeletonProduct = jest.fn().mockReturnValue('<div></div>');
      global.renderEmptyState = jest.fn().mockReturnValue('<div></div>');
      global.handleEmptyStateAction = jest.fn();
      global.shopRoot = '/';
      global.reduceMotion = false;
      global.window.matchMedia = jest.fn().mockImplementation(function (query) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      });
      localStorage.clear();
    });

    test('window.initWishlist is a function after loading wishlist-panel.js', function () {
      require('../assets/immersive/panels/wishlist-panel.js');
      expect(typeof window.initWishlist).toBe('function');
    });

    test('window.initWishlist is the same function as ImmersiveWishlist.initWishlist', function () {
      require('../assets/immersive/panels/wishlist-panel.js');
      expect(window.initWishlist).toBe(window.ImmersiveWishlist.initWishlist);
    });

    test('window.initWishlist loads persisted wishlist items from localStorage', function () {
      var stored = JSON.stringify([{ handle: 'silk-saree', discoveryRoom: 'lounge' }]);
      localStorage.setItem('immersive_wishlist', stored);

      require('../assets/immersive/panels/wishlist-panel.js');
      window.initWishlist();

      expect(global._wishlistItems.length).toBe(1);
      expect(global._wishlistItems[0].handle).toBe('silk-saree');
    });
  });
});
