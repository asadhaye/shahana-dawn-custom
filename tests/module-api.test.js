/**
 * Module API Surface Tests
 *
 * Feature: immersive-store-modular-refactor
 *
 * Verifies that each module file exposes its required window globals and
 * namespace objects after load. These tests load the actual module files
 * into jsdom and assert the expected API surface.
 *
 * All shared globals that the modules depend on are stubbed in beforeEach
 * so the module files can be evaluated without errors.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Global stubs
// ---------------------------------------------------------------------------

function setupImmersiveGlobals() {
  global.immersiveState = {
    currentRoom: 'lounge',
    mode: 'showroom',
    editorialRoom: null,
    lastHotspot: null,
    guided: false,
    navigationStack: [],
  };

  global.STORE_ROOMS = {
    storefront: { hotspots: [] },
    lounge: { hotspots: [{ x: 20, y: 35, label: 'Designer Houses', targetRoom: 'designer_houses' }] },
    designer_houses: { hotspots: [] },
    occasions: { hotspots: [] },
    featured_collections: { hotspots: [] },
  };

  global.reduceMotion = false;
  global.isMobile = false;
  global.usesMobileImg = false;
  global.glassPanelId = 'glass-panel';
  global.uiLayerId = 'ui-layer';
  global.immersiveCanvasId = 'immersive-canvas';
  global.shopRoot = '/';
  global.contentCache = {};
  global._wishlistItems = [];
  global._wishlistProductCache = {};
  global._wishlistPanelTrigger = null;
  global._activeHotspots = [];
  global.textureCache = [];
  global.MAX_CACHED_TEXTURES = 5;
  global.currentRoomKey = null;
  global.transitioning = false;
  global.currentImageAspect = 1;
  global.editorialScrollProgress = 0;
  global.editorialOverlayEl = null;
  global.editorialMaxScroll = 0;
  global.atmosphericMoodProgress = 0;
  global.WISHLIST_KEY = 'immersive_wishlist';
  global.ONBOARDING_KEY = 'immersive_onboarding_seen';
  global.STATE_KEY = 'immersive_state';
  global.PREFERRED_MODE_KEY = 'immersive_preferred_mode';
  global.BROWSING_SIGNALS_KEY = 'immersive_browsing_signals';
  global.VISITED_ROOMS_EXCLUDE = ['storefront'];
  global._browsingContext = { visitedRooms: [] };

  global.uniforms = {
    uTexture1: { value: null },
    uTexture2: { value: null },
    uDepth1: { value: null },
    uDepth2: { value: null },
    uTransitionProgress: { value: 0 },
    uParallaxStrength: { value: 0.08 },
    uScrollOffset: { value: 0 },
    uScrollVignette: { value: 0 },
    uScrollChroma: { value: 0 },
    uAtmosphericMood: { value: 0 },
  };

  global.camera = null;

  global.trackImmersiveEvent = jest.fn();
  global.trackFrictionPoint = jest.fn();
  global.recordBrowsingSignal = jest.fn();
  global.fetchWithCache = jest.fn().mockResolvedValue('<div></div>');
  global.fetchSectionHtml = jest.fn().mockResolvedValue('<div></div>');
  global.openDialogFocus = jest.fn();
  global.closeDialogFocus = jest.fn();
  global.getFocusableElements = jest.fn().mockReturnValue([]);
  global.saveState = jest.fn();
  global.renderSkeletonProduct = jest.fn().mockReturnValue('<div class="skeleton"></div>');
  global.renderEmptyState = jest.fn().mockReturnValue('<div class="empty"></div>');
  global.handleEmptyStateAction = jest.fn();
  global.showCartFeedback = jest.fn();
  global.showErrorFeedback = jest.fn();
  global.exitGuidedMode = jest.fn();
  global.openCollectionPanel = jest.fn();
  global.loadProductRecommendations = jest.fn();
  global.hideLoader = jest.fn();
  global.showWebGLFallback = jest.fn();
  global.showWelcomeToast = jest.fn();
  global.handleResize = jest.fn();
  global.updateHotspotElements = jest.fn();
  global.updateBackButtonVisibility = jest.fn();
  global.trackRoomVisit = jest.fn();
  global.clearLimitedTimeIntervals = jest.fn();
  global.activateGuidedMode = jest.fn();
  global.showAfterAddToCart = jest.fn();
  global.getRelevantRooms = jest.fn().mockReturnValue({});
  global.isCachedTexture = jest.fn().mockReturnValue(false);
  global.getRoomTextureUrls = jest.fn().mockReturnValue(null);
  global.preloadRoom = jest.fn();
  global.enterEditorialMode = jest.fn();
  global.exitEditorialMode = jest.fn();
  global.openPanel = jest.fn();
  global.closePanel = jest.fn();
  global.setPanelRoomLabel = jest.fn();
  global.openProductPanel = jest.fn();
  global.syncAllWishlistToggles = jest.fn();
  global.cacheWishlistProduct = jest.fn();
  global.cacheEditorialOverlay = jest.fn();
  global.updateCameraForMode = jest.fn();
  global.initEditorialHeroParallax = jest.fn();
  global.destroyEditorialHeroParallax = jest.fn();
  global.initEditorialBackToLounge = jest.fn();
  global.updateBackToLoungeVisibility = jest.fn();
  global.performEditorialUIActivation = jest.fn();
  global.goToRoom = jest.fn();
  global.renderHotspots = jest.fn();
  global.updateRoomBadge = jest.fn();
  global.loadRoomTextures = jest.fn();
  global.navigateBack = jest.fn();
  global.canNavigateBack = jest.fn().mockReturnValue(false);
  global.syncVisitedRooms = jest.fn();
  global.addToWishlist = jest.fn();
  global.removeFromWishlist = jest.fn();
  global.openWishlistPanel = jest.fn();
  global.closeWishlistPanel = jest.fn();
  global.initWishlist = jest.fn();
  global.updateWishlistBadge = jest.fn();
  global.toggleWishlistItem = jest.fn();
  global.renderWishlistPanel = jest.fn();

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
// Tests: glass-panel.js API surface
// ---------------------------------------------------------------------------

describe('glass-panel.js API surface', () => {
  beforeEach(() => {
    jest.resetModules();
    setupImmersiveGlobals();
  });

  test('exposes window.ImmersiveGlassPanel namespace object', () => {
    require('../assets/immersive/panels/glass-panel.js');
    expect(typeof window.ImmersiveGlassPanel).toBe('object');
    expect(window.ImmersiveGlassPanel).not.toBeNull();
  });

  test('ImmersiveGlassPanel has all required methods', () => {
    require('../assets/immersive/panels/glass-panel.js');
    expect(typeof window.ImmersiveGlassPanel.openPanel).toBe('function');
    expect(typeof window.ImmersiveGlassPanel.closePanel).toBe('function');
    expect(typeof window.ImmersiveGlassPanel.setPanelRoomLabel).toBe('function');
    expect(typeof window.ImmersiveGlassPanel.openOverlay).toBe('function');
    expect(typeof window.ImmersiveGlassPanel.transitionPanelContent).toBe('function');
  });

  test('exposes backward-compatible window.openPanel alias', () => {
    require('../assets/immersive/panels/glass-panel.js');
    expect(typeof window.openPanel).toBe('function');
  });

  test('exposes backward-compatible window.closePanel alias', () => {
    require('../assets/immersive/panels/glass-panel.js');
    expect(typeof window.closePanel).toBe('function');
  });

  test('ImmersiveGlassPanel.openPanel and window.openPanel are the same function', () => {
    require('../assets/immersive/panels/glass-panel.js');
    expect(window.ImmersiveGlassPanel.openPanel).toBe(window.openPanel);
  });

  test('ImmersiveGlassPanel.closePanel and window.closePanel are the same function', () => {
    require('../assets/immersive/panels/glass-panel.js');
    expect(window.ImmersiveGlassPanel.closePanel).toBe(window.closePanel);
  });
});

// ---------------------------------------------------------------------------
// Tests: wishlist-panel.js API surface
// ---------------------------------------------------------------------------

describe('wishlist-panel.js API surface', () => {
  beforeEach(() => {
    jest.resetModules();
    setupImmersiveGlobals();
    localStorage.clear();
  });

  test('exposes window.ImmersiveWishlist namespace object', () => {
    require('../assets/immersive/panels/wishlist-panel.js');
    expect(typeof window.ImmersiveWishlist).toBe('object');
    expect(window.ImmersiveWishlist).not.toBeNull();
  });

  test('ImmersiveWishlist has all required methods', () => {
    require('../assets/immersive/panels/wishlist-panel.js');
    const expected = [
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
    expected.forEach((method) => {
      expect(typeof window.ImmersiveWishlist[method]).toBe('function');
    });
  });

  test('exposes backward-compatible window.addToWishlist alias', () => {
    require('../assets/immersive/panels/wishlist-panel.js');
    expect(typeof window.addToWishlist).toBe('function');
  });

  test('exposes backward-compatible window.removeFromWishlist alias', () => {
    require('../assets/immersive/panels/wishlist-panel.js');
    expect(typeof window.removeFromWishlist).toBe('function');
  });

  test('exposes backward-compatible window.openWishlistPanel alias', () => {
    require('../assets/immersive/panels/wishlist-panel.js');
    expect(typeof window.openWishlistPanel).toBe('function');
  });

  test('exposes backward-compatible window.closeWishlistPanel alias', () => {
    require('../assets/immersive/panels/wishlist-panel.js');
    expect(typeof window.closeWishlistPanel).toBe('function');
  });

  test('ImmersiveWishlist aliases match flat window aliases', () => {
    require('../assets/immersive/panels/wishlist-panel.js');
    expect(window.ImmersiveWishlist.addToWishlist).toBe(window.addToWishlist);
    expect(window.ImmersiveWishlist.removeFromWishlist).toBe(window.removeFromWishlist);
    expect(window.ImmersiveWishlist.openWishlistPanel).toBe(window.openWishlistPanel);
    expect(window.ImmersiveWishlist.closeWishlistPanel).toBe(window.closeWishlistPanel);
  });
});

// ---------------------------------------------------------------------------
// Tests: editorial-mode.js API surface
// ---------------------------------------------------------------------------

describe('editorial-mode.js API surface', () => {
  beforeEach(() => {
    jest.resetModules();
    setupImmersiveGlobals();
  });

  test('exposes window.ImmersiveEditorial namespace object', () => {
    require('../assets/immersive/editorial/editorial-mode.js');
    expect(typeof window.ImmersiveEditorial).toBe('object');
    expect(window.ImmersiveEditorial).not.toBeNull();
  });

  test('ImmersiveEditorial has all required methods', () => {
    require('../assets/immersive/editorial/editorial-mode.js');
    expect(typeof window.ImmersiveEditorial.enterEditorialMode).toBe('function');
    expect(typeof window.ImmersiveEditorial.exitEditorialMode).toBe('function');
    expect(typeof window.ImmersiveEditorial.initEditorialBackToLounge).toBe('function');
  });

  test('exposes backward-compatible window.enterEditorialMode alias', () => {
    require('../assets/immersive/editorial/editorial-mode.js');
    expect(typeof window.enterEditorialMode).toBe('function');
  });

  test('exposes backward-compatible window.exitEditorialMode alias', () => {
    require('../assets/immersive/editorial/editorial-mode.js');
    expect(typeof window.exitEditorialMode).toBe('function');
  });

  test('ImmersiveEditorial.enterEditorialMode and window.enterEditorialMode are the same function', () => {
    require('../assets/immersive/editorial/editorial-mode.js');
    expect(window.ImmersiveEditorial.enterEditorialMode).toBe(window.enterEditorialMode);
  });

  test('ImmersiveEditorial.exitEditorialMode and window.exitEditorialMode are the same function', () => {
    require('../assets/immersive/editorial/editorial-mode.js');
    expect(window.ImmersiveEditorial.exitEditorialMode).toBe(window.exitEditorialMode);
  });
});

// ---------------------------------------------------------------------------
// Tests: room-manager.js API surface
// ---------------------------------------------------------------------------

describe('room-manager.js API surface', () => {
  beforeEach(() => {
    jest.resetModules();
    setupImmersiveGlobals();
  });

  test('exposes window.ImmersiveRoomManager namespace object', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.ImmersiveRoomManager).toBe('object');
    expect(window.ImmersiveRoomManager).not.toBeNull();
  });

  test('ImmersiveRoomManager has all required methods', () => {
    require('../assets/immersive/core/room-manager.js');
    const expected = [
      'goToRoom',
      'renderHotspots',
      'updateRoomBadge',
      'loadRoomTextures',
      'updateCameraForMode',
      'navigateBack',
      'updateBackButtonVisibility',
      'canNavigateBack',
      'syncVisitedRooms',
      'getRelevantRooms',
      'isCachedTexture',
    ];
    expected.forEach((method) => {
      expect(typeof window.ImmersiveRoomManager[method]).toBe('function');
    });
  });

  test('does not redefine STORE_ROOMS when global already set', () => {
    const original = global.STORE_ROOMS;
    require('../assets/immersive/core/room-manager.js');
    expect(window.STORE_ROOMS).toBe(original);
  });

  test('does not define lazy-loader globals', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window._loadScript).toBe('undefined');
    expect(typeof window._ensureEditorialScriptsLoaded).toBe('undefined');
    expect(typeof window._editorialScriptsLoaded).toBe('undefined');
  });

  test('exposes backward-compatible window.goToRoom alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.goToRoom).toBe('function');
  });

  test('exposes backward-compatible window.renderHotspots alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.renderHotspots).toBe('function');
  });

  test('exposes backward-compatible window.navigateBack alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.navigateBack).toBe('function');
  });

  test('exposes backward-compatible window.canNavigateBack alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.canNavigateBack).toBe('function');
  });

  test('exposes backward-compatible window.updateBackButtonVisibility alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.updateBackButtonVisibility).toBe('function');
  });

  test('exposes backward-compatible window.updateRoomBadge alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.updateRoomBadge).toBe('function');
  });

  test('exposes backward-compatible window.loadRoomTextures alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.loadRoomTextures).toBe('function');
  });

  test('exposes backward-compatible window.updateCameraForMode alias', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window.updateCameraForMode).toBe('function');
  });

  test('ImmersiveRoomManager.goToRoom and window.goToRoom are the same function', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(window.ImmersiveRoomManager.goToRoom).toBe(window.goToRoom);
  });
});

// ---------------------------------------------------------------------------
// Tests: immersive-store.js monolith isolation (Task 6.1)
// ---------------------------------------------------------------------------

describe('immersive-store.js monolith — hero-parallax functions absent', () => {
  let source;

  beforeAll(() => {
    source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'immersive-store.js'), 'utf8');
  });

  test('does not contain function initEditorialHeroParallax', () => {
    expect(source).not.toContain('function initEditorialHeroParallax');
  });

  test('does not contain function destroyEditorialHeroParallax', () => {
    expect(source).not.toContain('function destroyEditorialHeroParallax');
  });

  test('does not contain private state var _ehpScrollTarget', () => {
    expect(source).not.toContain('var _ehpScrollTarget');
  });

  test('does not contain private state var _ehpScrollCurrent', () => {
    expect(source).not.toContain('var _ehpScrollCurrent');
  });

  test('does not contain private state var _ehpRafId', () => {
    expect(source).not.toContain('var _ehpRafId');
  });
});
