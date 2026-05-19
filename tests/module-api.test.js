/**
 * API Surface Tests — Modular (immersive-core.js, immersive-features.js, immersive-init.js)
 *
 * Feature: immersive-store-modular-refactor
 *
 * Verifies that the modular files contain all required functions
 * that were previously in the monolith.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CORE_PATH = path.join(__dirname, '..', 'assets', 'immersive-core.js');
const FEATURES_PATH = path.join(__dirname, '..', 'assets', 'immersive-features.js');
const INIT_PATH = path.join(__dirname, '..', 'assets', 'immersive-init.js');
let coreSource;
let featuresSource;
let initSource;

beforeAll(() => {
  coreSource = fs.readFileSync(CORE_PATH, 'utf8');
  featuresSource = fs.readFileSync(FEATURES_PATH, 'utf8');
  initSource = fs.readFileSync(INIT_PATH, 'utf8');
});

// ---------------------------------------------------------------------------
// Glass panel functions (immersive-core.js)
// ---------------------------------------------------------------------------

describe('immersive-core.js — glass panel functions', () => {
  test('contains function openPanel', () => {
    expect(coreSource).toContain('function openPanel');
  });

  test('contains function closePanel', () => {
    expect(coreSource).toContain('function closePanel');
  });

  test('contains function setPanelRoomLabel', () => {
    expect(coreSource).toContain('function setPanelRoomLabel');
  });

  test('contains function openOverlay', () => {
    expect(coreSource).toContain('function openOverlay');
  });

  test('contains function transitionPanelContent', () => {
    expect(featuresSource).toContain('function transitionPanelContent');
  });
});

// ---------------------------------------------------------------------------
// Wishlist functions (immersive-features.js)
// ---------------------------------------------------------------------------

describe('immersive-features.js — wishlist functions', () => {
  test('contains function addToWishlist', () => {
    expect(featuresSource).toContain('function addToWishlist');
  });

  test('contains function removeFromWishlist', () => {
    expect(featuresSource).toContain('function removeFromWishlist');
  });

  test('contains function initWishlist', () => {
    expect(featuresSource).toContain('function initWishlist');
  });

  test('contains function openWishlistPanel', () => {
    expect(featuresSource).toContain('function openWishlistPanel');
  });

  test('contains function closeWishlistPanel', () => {
    expect(featuresSource).toContain('function closeWishlistPanel');
  });

  test('contains function renderWishlistPanel', () => {
    expect(featuresSource).toContain('function renderWishlistPanel');
  });

  test('contains function toggleWishlistItem', () => {
    expect(featuresSource).toContain('function toggleWishlistItem');
  });
});

// ---------------------------------------------------------------------------
// Editorial functions (immersive-features.js)
// ---------------------------------------------------------------------------

describe('immersive-features.js — editorial functions', () => {
  test('contains function enterEditorialMode', () => {
    expect(featuresSource).toContain('function enterEditorialMode');
  });

  test('contains function exitEditorialMode', () => {
    expect(featuresSource).toContain('function exitEditorialMode');
  });

  test('contains function initEditorialBackToLounge', () => {
    expect(initSource).toContain('function initEditorialBackToLounge');
  });

  test('contains function initEditorialHeroParallax', () => {
    expect(featuresSource).toContain('function initEditorialHeroParallax');
  });

  test('contains function destroyEditorialHeroParallax', () => {
    expect(featuresSource).toContain('function destroyEditorialHeroParallax');
  });
});

// ---------------------------------------------------------------------------
// Room manager functions (immersive-core.js)
// ---------------------------------------------------------------------------

describe('immersive-core.js — room manager functions', () => {
  test('contains function goToRoom', () => {
    expect(coreSource).toContain('function goToRoom');
  });

  test('contains function renderHotspots', () => {
    expect(coreSource).toContain('function renderHotspots');
  });

  test('contains function updateRoomBadge', () => {
    expect(coreSource).toContain('function updateRoomBadge');
  });

  test('contains function loadRoomTextures', () => {
    expect(coreSource).toContain('function loadRoomTextures');
  });

  test('contains function updateCameraForMode', () => {
    expect(coreSource).toContain('function updateCameraForMode');
  });
});

// ---------------------------------------------------------------------------
// immersive-features.js — hero-parallax functions present
//
// The hero-parallax functions live in immersive-features.js.
// These tests confirm the functions AND their private state vars are present.
// ---------------------------------------------------------------------------

describe('immersive-features.js — hero-parallax functions present', () => {
  test('contains function initEditorialHeroParallax', () => {
    expect(featuresSource).toContain('function initEditorialHeroParallax');
  });

  test('contains function destroyEditorialHeroParallax', () => {
    expect(featuresSource).toContain('function destroyEditorialHeroParallax');
  });

  test('contains private state var _ehpScrollTarget', () => {
    expect(featuresSource).toContain('var _ehpScrollTarget');
  });

  test('contains private state var _ehpScrollCurrent', () => {
    expect(featuresSource).toContain('var _ehpScrollCurrent');
  });

  test('contains private state var _ehpRafId', () => {
    expect(featuresSource).toContain('var _ehpRafId');
  });
});

// ---------------------------------------------------------------------------
// immersive-init.js — init wrapper functions present
// ---------------------------------------------------------------------------

describe('immersive-init.js — init wrapper functions present', () => {
  test('contains function safeBindImmersiveInit', () => {
    expect(initSource).toContain('function safeBindImmersiveInit');
  });

  test('contains shopify:section:load listener', () => {
    expect(initSource).toContain("'shopify:section:load'");
  });

  test('contains shopify:section:unload listener', () => {
    expect(initSource).toContain("'shopify:section:unload'");
  });
});
