/**
 * API Surface Tests — Monolith (immersive-store.js)
 *
 * Feature: immersive-store-modular-refactor
 *
 * Verifies that immersive-store.js contains all required functions
 * that were previously split across module files.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(__dirname, '..', 'assets', 'immersive-store.js');
let source;

beforeAll(() => {
  source = fs.readFileSync(SOURCE_PATH, 'utf8');
});

// ---------------------------------------------------------------------------
// Glass panel functions
// ---------------------------------------------------------------------------

describe('immersive-store.js monolith — glass panel functions', () => {
  test('contains function openPanel', () => {
    expect(source).toContain('function openPanel');
  });

  test('contains function closePanel', () => {
    expect(source).toContain('function closePanel');
  });

  test('contains function setPanelRoomLabel', () => {
    expect(source).toContain('function setPanelRoomLabel');
  });

  test('contains function openOverlay', () => {
    expect(source).toContain('function openOverlay');
  });

  test('contains function transitionPanelContent', () => {
    expect(source).toContain('function transitionPanelContent');
  });
});

// ---------------------------------------------------------------------------
// Wishlist functions
// ---------------------------------------------------------------------------

describe('immersive-store.js monolith — wishlist functions', () => {
  test('contains function addToWishlist', () => {
    expect(source).toContain('function addToWishlist');
  });

  test('contains function removeFromWishlist', () => {
    expect(source).toContain('function removeFromWishlist');
  });

  test('contains function initWishlist', () => {
    expect(source).toContain('function initWishlist');
  });

  test('contains function openWishlistPanel', () => {
    expect(source).toContain('function openWishlistPanel');
  });

  test('contains function closeWishlistPanel', () => {
    expect(source).toContain('function closeWishlistPanel');
  });

  test('contains function renderWishlistPanel', () => {
    expect(source).toContain('function renderWishlistPanel');
  });

  test('contains function toggleWishlistItem', () => {
    expect(source).toContain('function toggleWishlistItem');
  });
});

// ---------------------------------------------------------------------------
// Editorial functions
// ---------------------------------------------------------------------------

describe('immersive-store.js monolith — editorial functions', () => {
  test('contains function enterEditorialMode', () => {
    expect(source).toContain('function enterEditorialMode');
  });

  test('contains function exitEditorialMode', () => {
    expect(source).toContain('function exitEditorialMode');
  });

  test('contains function initEditorialBackToLounge', () => {
    expect(source).toContain('function initEditorialBackToLounge');
  });

  test('contains function initEditorialHeroParallax', () => {
    expect(source).toContain('function initEditorialHeroParallax');
  });

  test('contains function destroyEditorialHeroParallax', () => {
    expect(source).toContain('function destroyEditorialHeroParallax');
  });
});

// ---------------------------------------------------------------------------
// Room manager functions
// ---------------------------------------------------------------------------

describe('immersive-store.js monolith — room manager functions', () => {
  test('contains function goToRoom', () => {
    expect(source).toContain('function goToRoom');
  });

  test('contains function renderHotspots', () => {
    expect(source).toContain('function renderHotspots');
  });

  test('contains function updateRoomBadge', () => {
    expect(source).toContain('function updateRoomBadge');
  });

  test('contains function loadRoomTextures', () => {
    expect(source).toContain('function loadRoomTextures');
  });

  test('contains function updateCameraForMode', () => {
    expect(source).toContain('function updateCameraForMode');
  });
});

// ---------------------------------------------------------------------------
// immersive-store.js monolith — hero-parallax functions present
//
// The modular refactor was reverted. The hero-parallax functions were never
// extracted to a separate module — they live in the monolith. These tests
// confirm the functions AND their private state vars are present.
// ---------------------------------------------------------------------------

describe('immersive-store.js monolith — hero-parallax functions present', () => {
  test('contains function initEditorialHeroParallax', () => {
    expect(source).toContain('function initEditorialHeroParallax');
  });

  test('contains function destroyEditorialHeroParallax', () => {
    expect(source).toContain('function destroyEditorialHeroParallax');
  });

  test('contains private state var _ehpScrollTarget', () => {
    expect(source).toContain('var _ehpScrollTarget');
  });

  test('contains private state var _ehpScrollCurrent', () => {
    expect(source).toContain('var _ehpScrollCurrent');
  });

  test('contains private state var _ehpRafId', () => {
    expect(source).toContain('var _ehpRafId');
  });
});
