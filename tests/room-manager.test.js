/**
 * Tests for room-manager.js
 *
 * Feature: immersive-store-modular-refactor
 *
 * Covers:
 *   - Property 3: goToRoom navigation stack push invariant
 *   - Unit tests for lazy-loader removal (tasks 3.4 and 3.5)
 */

'use strict';

const fc = require('fast-check');

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
    lounge: {
      hotspots: [{ x: 20, y: 35, label: 'Designer Houses', targetRoom: 'designer_houses' }],
    },
    designer_houses: {
      hotspots: [{ x: 50, y: 15, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' }],
    },
    occasions: { hotspots: [] },
    featured_collections: { hotspots: [] },
  };

  global.transitioning = false;
  global.reduceMotion = false;
  global.isMobile = false;
  global.usesMobileImg = false;
  global.uiLayerId = 'ui-layer';
  global.immersiveCanvasId = 'immersive-canvas';
  global.glassPanelId = 'glass-panel';
  global.shopRoot = '/';
  global.BROWSING_SIGNALS_KEY = 'immersive_browsing_signals';
  global.VISITED_ROOMS_EXCLUDE = ['storefront'];
  global.ONBOARDING_KEY = 'immersive_onboarding_seen';
  global.currentRoomKey = null;
  global.currentImageAspect = 1;
  global.textureCache = [];
  global.MAX_CACHED_TEXTURES = 5;
  global.camera = null;
  global._activeHotspots = [];
  global._browsingContext = { visitedRooms: [] };

  global.uniforms = {
    uTransitionProgress: { value: 0 },
    uTexture1: { value: null },
    uDepth1: { value: null },
    uTexture2: { value: null },
    uDepth2: { value: null },
    uParallaxStrength: { value: 0.08 },
  };

  global.THREE = {
    TextureLoader: jest.fn().mockImplementation(() => ({ load: jest.fn() })),
    LinearFilter: 1,
  };

  global.saveState = jest.fn();
  global.loadRoomTextures = jest.fn();
  global.renderHotspots = jest.fn();
  global.updateRoomBadge = jest.fn();
  global.hideLoader = jest.fn();
  global.showWelcomeToast = jest.fn();
  global.trackImmersiveEvent = jest.fn();
  global.trackRoomVisit = jest.fn();
  global.clearLimitedTimeIntervals = jest.fn();
  global.updateBackButtonVisibility = jest.fn();
  global.exitGuidedMode = jest.fn();
  global.activateGuidedMode = jest.fn();
  global.openCollectionPanel = jest.fn();
  global.enterEditorialMode = jest.fn();
  global.preloadRoom = jest.fn();
  global.fetchWithCache = jest.fn().mockResolvedValue('<div></div>');
  global.updateHotspotElements = jest.fn();
  global.handleResize = jest.fn();
  global.showWebGLFallback = jest.fn();
  global.isCachedTexture = jest.fn().mockReturnValue(false);
  global.getRelevantRooms = jest.fn().mockReturnValue({});

  global.getRoomTextureUrls = jest.fn().mockImplementation(function (roomKey) {
    var knownRooms = ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'];
    if (knownRooms.indexOf(roomKey) !== -1) {
      return {
        baseTextureUrl: 'https://cdn.example.com/' + roomKey + '.jpg',
        depthMapUrl: 'https://cdn.example.com/' + roomKey + '-depth.jpg',
        roomKey: roomKey,
      };
    }
    return null;
  });

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
}

// ---------------------------------------------------------------------------
// Property 3: goToRoom navigation stack push invariant
// ---------------------------------------------------------------------------

describe('Property 3: goToRoom navigation stack push invariant', () => {
  // Feature: immersive-store-modular-refactor, Property 3: goToRoom navigation stack push invariant

  const VALID_ROOMS = ['lounge', 'designer_houses', 'occasions', 'featured_collections'];

  beforeEach(() => {
    jest.resetModules();
    setupImmersiveGlobals();
    document.body.innerHTML = '<div id="ui-layer"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Property 3a — goToRoom(target, false, false) pushes startRoom onto navigationStack when startRoom !== target', () => {
    // Feature: immersive-store-modular-refactor, Property 3: goToRoom navigation stack push invariant
    fc.assert(
      fc.property(fc.constantFrom(...VALID_ROOMS), fc.constantFrom(...VALID_ROOMS), function (startRoom, targetRoom) {
        fc.pre(startRoom !== targetRoom);

        jest.resetModules();
        setupImmersiveGlobals();
        document.body.innerHTML = '<div id="ui-layer"></div>';

        require('../assets/immersive/core/room-manager.js');

        global.immersiveState.currentRoom = startRoom;
        global.immersiveState.navigationStack = [];

        window.goToRoom(targetRoom, false, false);

        expect(global.immersiveState.navigationStack).toContain(startRoom);
        expect(global.immersiveState.navigationStack.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  test('Property 3b — goToRoom(target, false, true) does NOT push to navigationStack (fromBack=true)', () => {
    // Feature: immersive-store-modular-refactor, Property 3: goToRoom navigation stack push invariant
    fc.assert(
      fc.property(fc.constantFrom(...VALID_ROOMS), fc.constantFrom(...VALID_ROOMS), function (startRoom, targetRoom) {
        fc.pre(startRoom !== targetRoom);

        jest.resetModules();
        setupImmersiveGlobals();
        document.body.innerHTML = '<div id="ui-layer"></div>';

        require('../assets/immersive/core/room-manager.js');

        global.immersiveState.currentRoom = startRoom;
        global.immersiveState.navigationStack = [];

        window.goToRoom(targetRoom, false, true);

        expect(global.immersiveState.navigationStack).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  test('Property 3c — goToRoom(target, true, false) does NOT push to navigationStack (initial=true)', () => {
    // Feature: immersive-store-modular-refactor, Property 3: goToRoom navigation stack push invariant
    fc.assert(
      fc.property(fc.constantFrom(...VALID_ROOMS), fc.constantFrom(...VALID_ROOMS), function (startRoom, targetRoom) {
        fc.pre(startRoom !== targetRoom);

        jest.resetModules();
        setupImmersiveGlobals();
        document.body.innerHTML = '<div id="ui-layer"></div>';

        require('../assets/immersive/core/room-manager.js');

        global.immersiveState.currentRoom = startRoom;
        global.immersiveState.navigationStack = [];

        window.goToRoom(targetRoom, true, false);

        expect(global.immersiveState.navigationStack).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests: lazy-loader removal (task 3.5)
// ---------------------------------------------------------------------------

describe('room-manager.js lazy-loader removal', () => {
  beforeEach(() => {
    jest.resetModules();
    setupImmersiveGlobals();
    document.body.innerHTML = '<div id="ui-layer"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('window._loadScript is undefined after loading room-manager.js', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window._loadScript).toBe('undefined');
  });

  test('window._ensureEditorialScriptsLoaded is undefined after loading room-manager.js', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window._ensureEditorialScriptsLoaded).toBe('undefined');
  });

  test('window._editorialScriptsLoaded is undefined after loading room-manager.js', () => {
    require('../assets/immersive/core/room-manager.js');
    expect(typeof window._editorialScriptsLoaded).toBe('undefined');
  });

  test('editorial hotspot click calls enterEditorialMode synchronously (not via Promise)', () => {
    require('../assets/immersive/core/room-manager.js');

    const enterEditorialSpy = jest.fn();
    global.enterEditorialMode = enterEditorialSpy;

    global.STORE_ROOMS = {
      lounge: {
        hotspots: [{ x: 50, y: 50, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' }],
      },
    };

    window.renderHotspots('lounge');

    const button = document.querySelector('[data-hotspot-btn]');
    expect(button).not.toBeNull();
    button.click();

    expect(enterEditorialSpy).toHaveBeenCalledTimes(1);
    expect(enterEditorialSpy).toHaveBeenCalledWith('designer_houses', button);
  });

  test('room-manager.js does not redefine window.STORE_ROOMS when a global STORE_ROOMS is already set', () => {
    const originalStoreRooms = global.STORE_ROOMS;
    require('../assets/immersive/core/room-manager.js');
    expect(window.STORE_ROOMS).toBe(originalStoreRooms);
  });
});
