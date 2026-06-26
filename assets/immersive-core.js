/**
 * immersive-core.js — Shahana Dawn Immersive Store
 * Core module: WebGL rendering, room navigation, state management,
 * panel system, product/collection panels, wishlist, and event tracking.
 *
 * This file MUST load before immersive-features.js.
 * Both files replace the former monolithic immersive-store.js.
 */

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED NAMESPACE — single source of truth for all immersive state & animation
// ─────────────────────────────────────────────────────────────────────────────
window.ImmersiveTheme = window.ImmersiveTheme || {};
window.ShahanaImmersive = window.ShahanaImmersive || window.ImmersiveTheme;
var Immersive = window.ImmersiveTheme;

// No-op stub for analytics tracking (may be overridden by external analytics)
if (typeof window.trackImmersiveEvent === 'undefined') {
  window.trackImmersiveEvent = function () {};
}

/* IMMERSIVE_THREE.JS_COMPATIBILITY
 * Shim for backwards compatibility with three.js r150–r170+.
 */
(function () {
  if (typeof THREE === 'undefined') return;

  // Encoding shims - sRGBEncoding was renamed to SRGBColorSpace in r152+
  if (!THREE.SRGBColorSpace && THREE.sRGBEncoding) {
    THREE.SRGBColorSpace = THREE.sRGBEncoding;
  }

  // LinearEncoding was renamed in later versions
  if (!THREE.LinearEncoding) {
    THREE.LinearEncoding = 3001;
  }

  // LinearFilter should always exist, but just in case
  if (!THREE.LinearFilter) {
    THREE.LinearFilter = 9728;
  }

  // MathUtils.degToRad was moved in r155+
  if (!THREE.MathUtils) {
    THREE.MathUtils = {
      degToRad: function (degrees) {
        return (degrees * Math.PI) / 180;
      },
    };
  }

  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] three.js compatibility shims applied');
  }
})();

/* OVERRIDE NOTICE: Several functions defined in this file (e.g., getRecommendation,
 * evaluateRoomRecommendation, showRoomRecommendation, trackRoomVisit,
 * performEditorialUIActivation, exitGuidedMode, activateGuidedMode,
 * updateCameraForMode, updateBackToLoungeVisibility) are intentionally minimal
 * stubs that get overridden by immersive-features.js when both files load together.
 * Do NOT remove these stubs — they serve as fallbacks if features.js is absent. */

var STORE_ROOMS = {
  storefront: {
    hotspots: [
      {
        x: 50,
        y: 68,
        label: 'Start Experience',
        targetRoom: 'lounge',
        mobileX: 55,
        mobileY: 63,
        startExperience: true,
      },
    ],
  },

  lounge: {
    hotspots: [
      { x: 20, y: 35, label: 'Designer Houses', targetRoom: 'designer_houses', mobileX: 15, mobileY: 80 },
      { x: 50, y: 35, label: 'Occasions', targetRoom: 'occasions', mobileX: 50, mobileY: 80 },
      { x: 80, y: 35, label: 'Featured Collections', targetRoom: 'featured_collections', mobileX: 85, mobileY: 80 },
      { x: 40, y: 45, label: 'Story', targetRoom: 'featured_collections', targetStory: true, mobileX: 40, mobileY: 45 },
      { x: 65, y: 55, label: 'Codex', targetCodex: true, mobileX: 65, mobileY: 50 },
    ],
  },

  designer_houses: {
    hotspots: [
      { x: 50, y: 15, label: 'Explore Designers', targetEditorialRoom: 'designer_houses' },
      { x: 13, y: 40, label: 'Suffuse', targetCollection: 'suffuse' },
      { x: 50, y: 45, label: 'Soraya', targetCollection: 'soraya' },
      { x: 87, y: 40, label: 'Saad Bin Shahzad', targetCollection: 'saad-bin-shahzad' },
      { x: 50, y: 90, label: 'Back to lounge', targetRoom: 'lounge' },
    ],
  },

  occasions: {
    hotspots: [
      { x: 25, y: 40, label: 'Eid Collection', targetCollection: 'eid-collection' },
      { x: 42, y: 50, label: 'Bridal & Mehndi', targetCollection: 'bridal-mehndi' },
      { x: 58, y: 40, label: 'Luxury Formals', targetCollection: 'luxury-formals' },
      { x: 75, y: 50, label: 'Casual Pret', targetCollection: 'casual-pret' },
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Our Occasions', targetEditorialRoom: 'occasions' },
    ],
  },

  featured_collections: {
    hotspots: [
      { x: 25, y: 40, label: 'SS5 Summer Pret 26', targetCollection: 'summer-pret-26-eid-edit-saad-bin-shahzad' },
      { x: 50, y: 40, label: 'Suffuse Luxury Pret', targetCollection: 'luxury-pret-suffuse' },
      { x: 75, y: 40, label: 'Soraya Eid Pret', targetCollection: 'lumene-festive-25-26-soraya-official' },
      { x: 50, y: 85, label: 'Back to lounge', targetRoom: 'lounge' },
      { x: 50, y: 15, label: 'Featured Stories', targetEditorialRoom: 'featured_collections' },
    ],
  },
};

// Fallback textures — loaded from data attributes on the canvas wrapper
var fallbackBaseTexture = null;
var fallbackDepthTexture = null;

function loadFallbackTextures(wrapper) {
  if (!wrapper || !window.THREE) return;
  var fallbackBaseUrl = wrapper.getAttribute('data-fallback-base-url');
  var fallbackDepthUrl = wrapper.getAttribute('data-fallback-depth-url');
  if (!fallbackBaseUrl && !fallbackDepthUrl) return;

  var loader = new THREE.TextureLoader();
  if (fallbackBaseUrl) {
    loader.load(
      fallbackBaseUrl,
      function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        fallbackBaseTexture = tex;
      },
      undefined,
      function () {
        if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Failed to load fallback base texture');
      },
    );
  }
  if (fallbackDepthUrl) {
    loader.load(
      fallbackDepthUrl,
      function (tex) {
        fallbackDepthTexture = tex;
      },
      undefined,
      function () {
        if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Failed to load fallback depth texture');
      },
    );
  }
}

function loadTextureWithFallback(primaryUrl, fallbackTexture) {
  return new Promise(function (resolve) {
    if (!primaryUrl) {
      resolve(fallbackTexture);
      return;
    }
    if (!window.THREE) {
      resolve(fallbackTexture);
      return;
    }
    var loader = new THREE.TextureLoader();
    loader.load(
      primaryUrl,
      function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      function () {
        if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Failed to load texture, using fallback:', primaryUrl);
        resolve(fallbackTexture);
      },
    );
  });
}

var CODEX_THEME_TO_ROOM = {
  Eid: 'occasions',
  Bridal: 'designer_houses',
  Heritage: 'designer_houses',
  Formals: 'occasions',
  Everyday: 'occasions',
};

// ─────────────────────────────────────────────────────────────────────────────
// LISTENER REGISTRY - Prevent memory leaks
// ─────────────────────────────────────────────────────────────────────────────
var ListenerRegistry = {
  registry: {},

  add: function (key, element, event, handler, options) {
    if (!this.registry[key]) this.registry[key] = [];
    element.addEventListener(event, handler, options);
    this.registry[key].push({ element: element, event: event, handler: handler });
  },

  cleanup: function (key) {
    if (!this.registry[key]) return;
    this.registry[key].forEach(function (listener) {
      try {
        listener.element.removeEventListener(listener.event, listener.handler);
      } catch (e) {
        if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Listener removal failed', e);
      }
    });
    delete this.registry[key];
  },

  cleanupAll: function () {
    var self = this;
    Object.keys(this.registry).forEach(function (key) {
      self.cleanup(key);
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// IMMERSIVE STORE NAMESPACE - Prevent global pollution
// ─────────────────────────────────────────────────────────────────────────────
if (!window.ShahanaImmersive) {
  window.ShahanaImmersive = window.ImmersiveTheme;
}

// Only add sub-objects if they don't already exist (preserve StateManager data)
Immersive.store = Immersive.store || {};
Immersive.graphics = Immersive.graphics || {
  renderer: null,
  scene: null,
  camera: null,
  planeMesh: null,
  uniforms: null,
};
Immersive.room = Immersive.room || {
  current: null,
  subMode: null,
  transitioning: false,
};
Immersive.cache = Immersive.cache || {
  textures: [],
  content: {},
  gallery: {},
};
Immersive.settings = Immersive.settings || {
  reduceMotion: false,
  isMobile: false,
  isTablet: false,
  textureQuality: 1.0,
  targetFPS: 60,
  interactionEnabled: false,
};
Immersive.search = Immersive.search || {
  activeIndex: -1,
  results: [],
  debounceTimer: null,
  abortController: null,
};
Immersive.gesture = Immersive.gesture || {
  lastRoomTransition: 0,
  cooldown: 600,
  roomSequence: ['storefront', 'lounge', 'designer_houses', 'occasions', 'featured_collections'],
};
Immersive.quickAdd = Immersive.quickAdd || {
  modal: null,
  trigger: null,
};
Immersive.hotspot = Immersive.hotspot || {
  elements: [],
  focusedIndex: -1,
};
Immersive.device = Immersive.device || {
  isMobile: false,
  isTablet: false,
  isLowEnd: false,
};
Immersive.layout = Immersive.layout || {
  registry: {},
  current: {},
};

// ─────────────────────────────────────────────────────────────────────────────
// STATE HELPERS — route through ImmersiveTheme.state
// ─────────────────────────────────────────────────────────────────────────────
function _sm() {
  return window.ImmersiveTheme && window.ImmersiveTheme.state;
}

function saveImmersiveSessionState(patch) {
  var sm = _sm();
  if (!sm) return;
  var current = sm.get('immersive.session.state') || {};
  sm.set('immersive.session.state', Object.assign({}, current, patch), { persist: 'session' });
}

function loadImmersiveSessionState() {
  var sm = _sm();
  if (!sm) return {};
  return sm.get('immersive.session.state') || {};
}

function clearImmersiveSessionState() {
  var sm = _sm();
  if (!sm) return;
  sm.set('immersive.session.state', {}, { persist: 'session' });
}

function _saveNavHistory(history) {
  var sm = _sm();
  if (!sm) return;
  sm.set('immersive.navigation.history', history || [], { persist: 'session' });
}

function _loadNavHistory() {
  var sm = _sm();
  if (!sm) return [];
  return sm.get('immersive.navigation.history') || [];
}

function hasSeenOnboarding() {
  var sm = _sm();
  if (!sm) return false;
  return !!sm.get('onboarding.seen');
}

function markOnboardingSeen() {
  var sm = _sm();
  if (!sm) return;
  sm.set('onboarding.seen', true, { persist: 'local' });
}

function loadBrowsingSignals() {
  var sm = _sm();
  if (!sm) return [];
  var v = sm.get('immersive.browsing.signals');
  return Array.isArray(v) ? v : [];
}

function saveBrowsingSignals(signals) {
  var sm = _sm();
  if (!sm) return;
  sm.set('immersive.browsing.signals', signals || [], { persist: 'local' });
}

function isRoomDismissed(roomKey) {
  var sm = _sm();
  if (!sm) return false;
  var map = sm.get('immersive.recommendations.dismissedRooms') || {};
  return !!map[roomKey];
}

function dismissRoom(roomKey) {
  var sm = _sm();
  if (!sm) return;
  var map = sm.get('immersive.recommendations.dismissedRooms') || {};
  map[roomKey] = true;
  sm.set('immersive.recommendations.dismissedRooms', map, { persist: 'session' });
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE OPTIMIZATION
// ─────────────────────────────────────────────────────────────────────────────
function initDeviceOptimization() {
  var isMobile = /iPhone|iPad|Android|Mobile/.test(navigator.userAgent);
  var isTablet = /iPad|Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);
  var cores = navigator.hardwareConcurrency || 1;
  var memory = navigator.deviceMemory || 4;
  var isLowEnd = cores <= 2 || memory <= 2;

  // Ensure namespace objects exist before setting properties
  window.ShahanaImmersive = window.ShahanaImmersive || {};
  window.ShahanaImmersive.device = window.ShahanaImmersive.device || {};
  window.ShahanaImmersive.settings = window.ShahanaImmersive.settings || {};

  window.ShahanaImmersive.device.isMobile = isMobile;
  window.ShahanaImmersive.device.isTablet = isTablet;
  window.ShahanaImmersive.device.isLowEnd = isLowEnd;
  window.ShahanaImmersive.settings.isMobile = isMobile;
  window.ShahanaImmersive.settings.isTablet = isTablet;

  if (isLowEnd) {
    window.ShahanaImmersive.settings.textureQuality = 0.5;
    window.ShahanaImmersive.settings.targetFPS = 24;
  } else if (window.isMobile || isMobile) {
    window.ShahanaImmersive.settings.textureQuality = 0.75;
    window.ShahanaImmersive.settings.targetFPS = 30;
  } else {
    window.ShahanaImmersive.settings.textureQuality = 1.0;
    window.ShahanaImmersive.settings.targetFPS = 60;
  }

  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Device optimization initialized:', {
      isMobile: window.isMobile || isMobile,
      isTablet: window.isTablet || isTablet,
      isLowEnd: isLowEnd,
      textureQuality: window.ShahanaImmersive.settings.textureQuality,
      targetFPS: window.ShahanaImmersive.settings.targetFPS,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
var LoadingState = {
  isLoading: false,
  startTime: null,
  timeout: 15000,
  timeoutId: null,

  start: function () {
    this.isLoading = true;
    this.startTime = Date.now();
    var self = this;
    this.timeoutId = setTimeout(function () {
      if (self.isLoading) {
        self.fail('Loading took too long. Please check your connection.');
      }
    }, this.timeout);
  },

  complete: function () {
    this.isLoading = false;
    clearTimeout(this.timeoutId);
  },

  fail: function (message) {
    this.isLoading = false;
    clearTimeout(this.timeoutId);
    if (typeof showFeedback === 'function') {
      showFeedback(message, 'error');
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
var Analytics = {
  track: function (event, data) {
    try {
      if (window.gtag) {
        gtag('event', event, data);
      }
      if (window.shopifyAnalytics && typeof shopifyAnalytics.track === 'function') {
        shopifyAnalytics.track('immersive:' + event, data);
      }
    } catch (e) {
      if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Analytics error:', e);
    }
  },

  trackRoomTransition: function (fromRoom, toRoom) {
    this.track('room_transition', { from: fromRoom, to: toRoom, timestamp: Date.now() });
  },

  trackError: function (errorType, message) {
    this.track('error', { type: errorType, message: message, timestamp: Date.now() });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT REGISTRY - Three Configurable Layouts
// ─────────────────────────────────────────────────────────────────────────────
var LAYOUT_REGISTRY = {
  'asymmetric-gallery': {
    name: 'Asymmetric Gallery',
    description: 'Indrajaal-inspired organic gallery layout for Designer Houses',
    rooms: ['designer_houses'],
    config: {
      spacing: 3.5,
      maxItems: 12,
      draggable: true,
      physics: true,
      parallaxStrength: 0.08,
    },
  },
  'scroll-narrative': {
    name: 'Scroll Narrative',
    description: 'Story-driven vertical scroll layout for Occasions',
    rooms: ['occasions'],
    config: {
      spacing: 2.5,
      maxItems: 8,
      draggable: false,
      physics: false,
      parallaxStrength: 0.04,
      scrollDriven: true,
    },
  },
  'masonry-featured': {
    name: 'Masonry Featured',
    description: 'Curated grid with featured highlight for Collections',
    rooms: ['featured_collections'],
    config: {
      spacing: 3.0,
      maxItems: 9,
      draggable: true,
      physics: false,
      parallaxStrength: 0.06,
      featuredIndex: 0,
    },
  },
  'infinite-drag-gallery': {
    name: 'Infinite Drag Gallery',
    description: '2D infinite draggable grid with inertia and wrap',
    rooms: ['designer_houses', 'occasions', 'featured_collections'],
    config: {
      spacing: 0.08,
      cardWidth: 0.7,
      cardHeight: 1.05,
      columns: 4,
      friction: 0.95,
      draggable: true,
      physics: true,
      infinite: true,
      shaderEffects: true,
    },
  },
  'scroll-story': {
    name: 'Scroll Story',
    description: 'Native RAF infinite scroll list with LERP + modulo recycling + shaders',
    rooms: ['designer_houses', 'occasions', 'featured_collections'],
    config: {
      itemSpacing: 2.5,
      lerpFactor: 0.1,
      cardHeight: 0.5,
      cardAspect: 3 / 4,
      draggable: true,
      physics: true,
      scrollDriven: true,
      shaderEffects: true,
    },
  },
  'scroll-tunnel': {
    name: 'Scroll Tunnel',
    description: 'PerspectiveCamera scroll-driven Z-axis depth tunnel with chromatic aberration',
    rooms: ['designer_houses', 'occasions', 'featured_collections'],
    config: {
      tunnelLength: 15,
      fov: 60,
      cardHeight: 0.5,
      cardAspect: 3 / 4,
      draggable: true,
      physics: true,
      scrollDriven: true,
      shaderEffects: true,
    },
  },
  // ── Indrajaal-inspired 3D layouts (merchant-configurable) ──
  'narrative-story': {
    name: 'Narrative Story',
    description: 'Cinematic Z-axis scroll-driven story with floating planes + shader transitions',
    rooms: ['occasions', 'designer_houses', 'featured_collections'],
    config: {
      cardSpacing: 3.5,
      cardHeight: 2.2,
      cardAspect: 2 / 3,
      floatAmplitude: 0.08,
      floatSpeed: 0.8,
      draggable: true,
      scrollDriven: true,
      shaderEffects: true,
    },
  },
  'codex-list': {
    name: 'Codex',
    description: 'Infinite vertical text list with hover-reveal detail plane (typography-driven)',
    rooms: ['designer_houses', 'occasions', 'featured_collections'],
    config: {
      itemSpacing: 1.8,
      cardHeight: 0.6,
      cardAspect: 3 / 4,
      lerpFactor: 0.12,
      hoverPlaneAspect: 16 / 9,
      draggable: true,
      scrollDriven: true,
      shaderEffects: true,
    },
  },
  'artifact-gallery': {
    name: 'Artifact Gallery',
    description: 'Floating grid with mouse parallax + glass shader distortion on hover',
    rooms: ['featured_collections', 'designer_houses', 'occasions'],
    config: {
      gridCols: 3,
      gridSpacing: 0.8,
      cardHeight: 0.5,
      cardAspect: 3 / 4,
      parallaxStrength: 0.0005,
      glassDistortion: 0.015,
      draggable: true,
      scrollDriven: true,
      shaderEffects: true,
    },
  },
};

function getLayoutForRoom(roomKey) {
  if (!roomKey || typeof roomKey !== 'string') {
    if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Invalid roomKey:', roomKey);
    return null;
  }
  for (var layoutKey in LAYOUT_REGISTRY) {
    var layout = LAYOUT_REGISTRY[layoutKey];
    if (layout && layout.rooms && layout.rooms.indexOf(roomKey) !== -1) {
      return layout;
    }
  }
  return null;
}

function applyLayoutToRoom(roomKey, layoutKey) {
  if (!LAYOUT_REGISTRY[layoutKey]) {
    console.error('[Immersive] Layout not found:', layoutKey);
    return false;
  }
  window.ShahanaImmersive.layout.current[roomKey] = layoutKey;
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Applied layout', layoutKey, 'to room', roomKey);
  }
  return true;
}

function getRoomForCollectionHandleFromCodex(handle) {
  if (!handle || !window.codexCollectionThemes) return null;
  var theme = window.codexCollectionThemes[handle];
  if (!theme) return null;
  var roomKey = CODEX_THEME_TO_ROOM[theme];
  if (!roomKey) return null;
  var room = getRoomData(roomKey);
  if (!room) return null;
  return roomKey;
}

var ROOM_VISUAL_PROFILES = {
  default: {
    uAtmosphericMood: 0.25,
    uScrollVignette: 0.1,
    uScrollChroma: 0.05,
  },
  featured_collections: {
    uAtmosphericMood: 0.5,
    uScrollVignette: 0.18,
    uScrollChroma: 0.09,
  },
  'featured_collections:story': {
    uAtmosphericMood: 0.8,
    uScrollVignette: 0.32,
    uScrollChroma: 0.16,
  },
};

function getRoomVisualProfile(roomKey, mode) {
  var key = mode ? roomKey + ':' + mode : roomKey;
  var profile = ROOM_VISUAL_PROFILES[key] || ROOM_VISUAL_PROFILES[roomKey] || null;

  if (!profile) {
    if (window.__IMMERSIVE_DEV__) {
      console.warn(
        '[Immersive] No visual profile defined for room "' +
          roomKey +
          '"' +
          (mode ? ' (mode: "' + mode + '")' : '') +
          '. Falling back to default profile. Add a profile to ROOM_VISUAL_PROFILES to fix.',
      );
    }
    profile = ROOM_VISUAL_PROFILES.default;
  }

  return profile;
}

function applyRoomVisualProfile(roomKey, mode, deltaTimeSec) {
  if (!uniforms) return;
  var profile = getRoomVisualProfile(roomKey, mode);
  var dt = typeof deltaTimeSec === 'number' ? deltaTimeSec : 0.016;
  var speed = 2;

  function lerp(current, target, dtLocal) {
    return current + (target - current) * Math.min(1, dtLocal * speed);
  }

  if (uniforms.uAtmosphericMood && typeof uniforms.uAtmosphericMood.value === 'number') {
    uniforms.uAtmosphericMood.value = lerp(uniforms.uAtmosphericMood.value, profile.uAtmosphericMood, dt);
  }
  if (uniforms.uScrollVignette && typeof uniforms.uScrollVignette.value === 'number') {
    uniforms.uScrollVignette.value = lerp(uniforms.uScrollVignette.value, profile.uScrollVignette, dt);
  }
  if (uniforms.uScrollChroma && typeof uniforms.uScrollChroma.value === 'number') {
    uniforms.uScrollChroma.value = lerp(uniforms.uScrollChroma.value, profile.uScrollChroma, dt);
  }
}

// Dispose gallery stage resources to prevent GPU memory leaks
function disposeGalleryStage(roomKey) {
  var state = galleryStageRegistry[roomKey];
  if (!state) return;

  // Track cleanup for analytics
  Analytics.track('gallery_stage_disposed', { room: roomKey, timestamp: Date.now() });

  if (state.group) {
    state.group.traverse(function (obj) {
      if (obj.isMesh) {
        if (obj.geometry) {
          try {
            obj.geometry.dispose();
          } catch (e) {}
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(function (m) {
              if (m.map) {
                try {
                  m.map.dispose();
                } catch (e) {}
              }
              try {
                m.dispose();
              } catch (e) {}
            });
          } else {
            if (obj.material.map) {
              try {
                obj.material.map.dispose();
              } catch (e) {}
            }
            try {
              obj.material.dispose();
            } catch (e) {}
          }
        }
      }
    });
    try {
      scene.remove(state.group);
    } catch (e) {}
  }

  // Dispose all textures
  if (state.textures) {
    state.textures.forEach(function (tex) {
      if (tex) {
        try {
          tex.dispose();
        } catch (e) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Texture disposal failed:', tex, e);
          }
        }
      }
    });
    state.textures = [];
  }

  // Clean up listeners
  ListenerRegistry.cleanup('gallery-' + roomKey);

  // Clear state
  state.dragState = null;
  state.scrollState = null;
  state.interactionListeners = null;
  state.group = null;

  delete galleryStageRegistry[roomKey];
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Disposed gallery stage for room:', roomKey);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL STORY — Native RAF infinite scroll list with LERP + modulo recycling
// ─────────────────────────────────────────────────────────────────────────────
// ── NaN guard: wrap PlaneGeometry creation to catch invalid dimensions ──
function _safePlaneGeometry(w, h, label) {
  if (typeof w !== 'number' || typeof h !== 'number' || isNaN(w) || isNaN(h) || !isFinite(w) || !isFinite(h)) {
    console.error('[Immersive] NaN/Infinite PlaneGeometry blocked:', {
      w: w,
      h: h,
      label: label || 'unknown',
      stack: new Error().stack.split('\n').slice(1, 4).join('\n'),
    });
    return new THREE.PlaneGeometry(0.01, 0.01, 1, 1); // tiny fallback to avoid crash
  }
  return new THREE.PlaneGeometry(w, h, 1, 1);
}

function _buildScrollStory(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var isScrollStory = options.layout === 'scroll-story';
  var vpH = (options && options.viewportHeight) || 2;
  var vpW = (options && options.viewportWidth) || 2;

  // Viewport-aware sizing
  var cardH = isScrollStory ? vpH * 0.35 : vpH * 0.3;
  var cardAspect = isScrollStory ? 3 / 4 : 2 / 3;
  var cardW = cardH * cardAspect;
  var itemSpacing = cardH * 0.5; // 50% of card height as gap
  var lerpFactor = cfg.lerpFactor || 0.1;
  var isHelix = !isScrollStory;

  // ── Scroll state ──
  // Cards are positioned from Y=0 center, extending downward
  // This ensures first cards are visible in initial viewport
  group.userData.currentScrollY = 0;
  group.userData.targetScrollY = 0;
  group.userData.itemSpacing = itemSpacing;
  group.userData.totalHeight = items.length * itemSpacing;
  group.userData.lerpFactor = lerpFactor;
  group.userData.isScrollStory = isScrollStory;

  var count = items.length;
  var loadedItems = [];
  var texCache = {};

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Story texture load error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    var uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'immersive-gallery-empty-msg';
      emptyMsg.textContent = uiLayer.getAttribute('data-msg-empty-collection') || 'This collection is currently empty.';
      uiLayer.appendChild(emptyMsg);
    }
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: isScrollStory ? 'scroll-story' : 'helix',
      cardCount: 0,
      itemSpacing: itemSpacing,
      isScrollStory: isScrollStory,
      currentScrollY: 0,
      targetScrollY: 0,
      lerpFactor: lerpFactor,
    };
    return;
  }

  // ── Shared shader uniforms ──
  var sharedUniforms = isScrollStory
    ? {
        uTime: { value: 0 },
        uScrollY: { value: 0 },
        uVelocity: { value: 0 },
      }
    : null;

  // ── Vertex shader: wave bend from scroll velocity ──
  var vertSrc = [
    'varying vec2 vUv;',
    'varying float vDist;',
    'uniform float uTime;',
    'uniform float uScrollY;',
    'uniform float uVelocity;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 pos = position;',
    // Wave bend: skew geometry based on scroll velocity
    '  float wave = sin(pos.y * 2.0 + uTime * 3.0) * uVelocity * 0.02;',
    '  pos.x += wave;',
    '  pos.z += abs(wave) * 0.5;',
    '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
    '  vDist = -mv.z;',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n');

  // ── Fragment shader: chromatic aberration + vignette ──
  var fragSrc = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    'uniform float uScrollY;',
    'uniform float uVelocity;',
    'varying vec2 vUv;',
    'varying float vDist;',
    'void main() {',
    '  float aberration = smoothstep(1.0, 8.0, vDist) * 0.003 * (1.0 + abs(uVelocity) * 0.5);',
    '  vec2 dir = vUv - 0.5;',
    '  float edge = smoothstep(0.0, 0.5, length(dir));',
    '  float shift = aberration * edge;',
    '  vec2 rUV = clamp(vUv + dir * shift, 0.001, 0.999);',
    '  vec2 gUV = vUv;',
    '  vec2 bUV = clamp(vUv - dir * shift, 0.001, 0.999);',
    '  float r = texture2D(uTexture, rUV).r;',
    '  float g = texture2D(uTexture, gUV).g;',
    '  float b = texture2D(uTexture, bUV).b;',
    '  float a = texture2D(uTexture, gUV).a;',
    '  float vig = 1.0 - smoothstep(0.3, 0.8, length(vUv - 0.5));',
    '  gl_FragColor = vec4(r, g, b, a * vig);',
    '}',
  ].join('\n');

  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var item = entry.item;
    var geom = _safePlaneGeometry(cardW, cardH, 'gallery-main');

    var mat;
    if (isScrollStory) {
      mat = new THREE.ShaderMaterial({
        vertexShader: vertSrc,
        fragmentShader: fragSrc,
        uniforms: {
          uTexture: { value: entry.tex },
          uTime: sharedUniforms.uTime,
          uScrollY: sharedUniforms.uScrollY,
          uVelocity: sharedUniforms.uVelocity,
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    } else {
      mat = new THREE.MeshBasicMaterial({
        map: entry.tex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });
    }

    var mesh = new THREE.Mesh(geom, mat);

    if (isScrollStory) {
      // ── Flat Y-axis list ──
      var yPos = -(idx * itemSpacing);
      mesh.position.set(0, yPos, 0);
      mesh.userData.initialY = yPos;
    } else {
      // ── Helix fallback ──
      var angle = (idx / count) * Math.PI * 2 * 2.5;
      var y = (idx - count / 2) * 0.6;
      mesh.position.set(Math.cos(angle) * 0.8, y, Math.sin(angle) * 0.8);
      mesh.lookAt(0, y, 0);
      mesh.rotateY(Math.PI);
    }

    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: item.title || '',
      productHandle: item.productHandle || null,
      collectionHandle: item.collectionHandle || null,
      layout: isScrollStory ? 'scroll-story' : 'helix',
      initialY: mesh.position.y,
      baseY: mesh.position.y,
    };

    group.add(mesh);
    planes.push(mesh);

    // ── Canvas title label ──
    if (item.title) {
      var labelCanvas = document.createElement('canvas');
      var lCtx = labelCanvas.getContext('2d');
      labelCanvas.width = 768;
      labelCanvas.height = 120;
      lCtx.clearRect(0, 0, 768, 120);
      lCtx.font = 'bold 48px Georgia, serif';
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillStyle = '#ece3c2';
      lCtx.fillText(item.title.toUpperCase(), 384, 40);
      lCtx.font = '500 12px Arial, sans-serif';
      lCtx.fillStyle = 'rgba(255,255,255,0.5)';
      lCtx.fillText('[ TAP TO EXPLORE ]', 384, 90);

      var labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      var labelMat = new THREE.MeshBasicMaterial({
        map: labelTex,
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      var labelW = cardW * 0.9;
      var labelH = labelW * (120 / 768);
      var labelMesh = new THREE.Mesh(_safePlaneGeometry(labelW, labelH, 'scroll-story-label'), labelMat);
      labelMesh.position.set(0, mesh.position.y - cardH * 0.55, isScrollStory ? 0.05 : 0);
      labelMesh.renderOrder = 999;
      group.add(labelMesh);
      labels.push(labelMesh);
    }
  });

  scene.add(group);

  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: isScrollStory ? 'scroll-story' : 'helix',
    isScrollStory: isScrollStory,
    isScrollDriven: isScrollStory,
    itemSpacing: itemSpacing,
    totalHeight: count * itemSpacing,
    lerpFactor: lerpFactor,
    currentScrollY: 0,
    targetScrollY: 0,
    prevScrollY: 0,
    cardCount: count,
    sharedUniforms: sharedUniforms,
  };
}

// -----------------------------------------------------------------------------
// SCROLL TUNNEL — PerspectiveCamera scroll-driven 3D tunnel
// -----------------------------------------------------------------------------
function _buildScrollTunnel(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var vpH = (options && options.viewportHeight) || 2;

  // Viewport-aware sizing
  var cardH = vpH * 0.35;
  var cardAspect = options.cardAspect || 3 / 4;
  var cardW = cardH * cardAspect;
  var tunnelLength = Math.max(cardH * 4, 3); // Visible tunnel: ~4 cards deep
  var fov = cfg.fov || 60;
  var near = cfg.near || 0.1;
  var far = cfg.far || 100;

  // ── Create PerspectiveCamera for tunnel depth effect ──
  // Replace the global OrthographicCamera with a PerspectiveCamera
  // so that cards at different Z depths appear with proper foreshortening
  var size = new THREE.Vector2();
  renderer.getSize(size);
  var width = size.x || (renderer.domElement ? renderer.domElement.clientWidth : window.innerWidth);
  var height = size.y || (renderer.domElement ? renderer.domElement.clientHeight : window.innerHeight);
  var aspect = width && height ? width / height : 1;
  var tunnelCam = new THREE.PerspectiveCamera(fov, aspect, near, far);
  if (camera && camera.dispose) camera.dispose();
  tunnelCam.position.z = 0;
  camera = tunnelCam; // replace global camera ref

  group.userData.scrollZ = 0;
  group.userData.targetScrollZ = 0;
  group.userData.tunnelLength = tunnelLength;
  group.userData.fov = fov;
  group.userData.isScrollTunnel = true;

  var count = items.length;
  var loadedItems = [];
  var texCache = {};

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Tunnel texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    var uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'immersive-gallery-empty-msg';
      emptyMsg.textContent = uiLayer.getAttribute('data-msg-empty-collection') || 'This collection is currently empty.';
      uiLayer.appendChild(emptyMsg);
    }
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'scroll-tunnel',
      cardCount: 0,
      tunnelLength: tunnelLength,
      scrollZ: 0,
      targetScrollZ: 0,
      fov: fov,
      isScrollTunnel: true,
      sharedUniforms: { uTime: { value: 0 }, uScrollZ: { value: 0 }, uFov: { value: fov } },
    };
    return;
  }

  var sharedUniforms = {
    uTime: { value: 0 },
    uScrollZ: { value: 0 },
    uFov: { value: fov },
  };

  var vertSrc = [
    'varying vec2 vUv;',
    'varying float vDist;',
    'uniform float uTime;',
    'uniform float uScrollZ;',
    'uniform float uFov;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 pos = position;',
    '  float velocity = uScrollZ;', // reused as velocity proxy
    '  float wave = sin(pos.y * 2.0 + uTime * 3.0) * velocity * 0.01;',
    '  pos.x += clamp(wave, -0.5, 0.5);',
    '  pos.z += abs(wave) * 0.3;',
    '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
    '  vDist = -mv.z;',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n');

  var fragSrc = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    'uniform float uScrollZ;',
    'uniform float uFov;',
    'varying vec2 vUv;',
    'varying float vDist;',
    'void main() {',
    '  float aberration = smoothstep(1.0, 12.0, vDist) * 0.006;',
    '  vec2 dir = vUv - 0.5;',
    '  float edge = smoothstep(0.0, 0.5, length(dir));',
    '  float shift = aberration * edge;',
    '  vec2 rUV = clamp(vUv + dir * shift, 0.001, 0.999);',
    '  vec2 gUV = vUv;',
    '  vec2 bUV = clamp(vUv - dir * shift, 0.001, 0.999);',
    '  float r = texture2D(uTexture, rUV).r;',
    '  float g = texture2D(uTexture, gUV).g;',
    '  float b = texture2D(uTexture, bUV).b;',
    '  float a = texture2D(uTexture, gUV).a;',
    '  float vig = 1.0 - smoothstep(0.3, 0.85, length(vUv - 0.5));',
    '  gl_FragColor = vec4(r, g, b, a * vig);',
    '}',
  ].join('\n');

  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var item = entry.item;
    var geom = _safePlaneGeometry(cardW, cardH, 'gallery-main');

    var mat = new THREE.ShaderMaterial({
      vertexShader: vertSrc,
      fragmentShader: fragSrc,
      uniforms: {
        uTexture: { value: entry.tex },
        uTime: sharedUniforms.uTime,
        uScrollZ: sharedUniforms.uScrollZ,
        uFov: sharedUniforms.uFov,
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    var mesh = new THREE.Mesh(geom, mat);

    var zPos = -2 - (idx / Math.max(count - 1, 1)) * tunnelLength;
    var xOff = (idx % 2 === 0 ? -1 : 1) * (0.2 + (idx % 3) * 0.1);
    var yOff = Math.sin(idx * 0.7) * 0.15;
    mesh.position.set(xOff, yOff, zPos);
    mesh.lookAt(0, yOff, zPos - 1);

    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: item.title || '',
      productHandle: item.productHandle || null,
      collectionHandle: item.collectionHandle || null,
      layout: 'scroll-tunnel',
      baseZ: zPos,
      baseY: yOff,
      parallaxFactor: 1.0 + (idx % 5) * 0.15,
    };

    group.add(mesh);
    planes.push(mesh);

    if (item.title) {
      var labelCanvas = document.createElement('canvas');
      var lCtx = labelCanvas.getContext('2d');
      labelCanvas.width = 768;
      labelCanvas.height = 120;
      lCtx.clearRect(0, 0, 768, 120);
      lCtx.font = 'bold 48px Georgia, serif';
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillStyle = '#ece3c2';
      lCtx.fillText(item.title.toUpperCase(), 384, 40);
      lCtx.font = '500 12px Arial, sans-serif';
      lCtx.fillStyle = 'rgba(255,255,255,0.5)';
      lCtx.fillText('[ TAP TO EXPLORE ]', 384, 90);

      var labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      var labelMat = new THREE.MeshBasicMaterial({
        map: labelTex,
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      var labelW = cardW * 0.9;
      var labelH = labelW * (120 / 768);
      var labelMesh = new THREE.Mesh(_safePlaneGeometry(labelW, labelH, 'tunnel-label'), labelMat);
      labelMesh.position.set(xOff, yOff - cardH * 0.55, zPos - 0.05);
      labelMesh.renderOrder = 999;
      group.add(labelMesh);
      labels.push(labelMesh);
    }
  });

  scene.add(group);

  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'scroll-tunnel',
    tunnelLength: tunnelLength,
    fov: fov,
    scrollZ: 0,
    targetScrollZ: 0,
    prevScrollZ: 0,
    cardCount: count,
    sharedUniforms: sharedUniforms,
    isScrollTunnel: true,
    isScrollDriven: true,
  };
}

function buildGalleryStageForRoom(roomKey, scene, options) {
  // Dispose old gallery stage before creating new one
  if (currentRoomKey && galleryStageRegistry[currentRoomKey]) {
    disposeGalleryStage(currentRoomKey);
  }

  var items = getGalleryStageConfig(roomKey);
  if (!items.length) return null;
  if (!window.THREE) return null;
  var THREE = window.THREE;

  options = options || {};
  var layout = options.layout || 'arc';

  // Inject viewport dimensions for builders to use
  var vpH = camera.top - camera.bottom;
  var vpW = camera.right - camera.left;
  options.viewportHeight = vpH;
  options.viewportWidth = vpW;

  // Restore OrthographicCamera if switching away from scroll-tunnel
  if (layout !== 'scroll-tunnel' && camera instanceof THREE.PerspectiveCamera) {
    if (camera && camera.dispose) camera.dispose();
    var size = new THREE.Vector2();
    renderer.getSize(size);
    var width = size.x || (renderer.domElement ? renderer.domElement.clientWidth : window.innerWidth);
    var height = size.y || (renderer.domElement ? renderer.domElement.clientHeight : window.innerHeight);
    var aspect = width && height ? width / height : 1;
    camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 2);
    camera.position.z = 1;
    camera.updateProjectionMatrix();
  }

  var radius = options.radius || 7;
  var arcDegrees = options.arcDegrees || 140;
  var verticalOffset = options.verticalOffset || 0.2;
  var tiltDegrees = options.tiltDegrees || -4;

  var group = new THREE.Group();
  group.position.set(0, 0, 0);
  var textureLoader = new THREE.TextureLoader();
  var planes = [];
  var textures = [];
  var labels = [];

  var count = items.length;

  if (
    layout === 'scroll-story' ||
    (layout === 'helix' && !(options.layoutConfig && options.layoutConfig.scrollDriven))
  ) {
    _buildScrollStory(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (layout === 'scroll-tunnel') {
    _buildScrollTunnel(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (
    layout === 'masonry-featured' ||
    (layout === 'grid' && options.layoutConfig && options.layoutConfig.featuredIndex !== undefined)
  ) {
    // ── Masonry Featured layout ──
    // First item (featuredIndex) is a large hero card, centered, closer to camera.
    // Remaining items arranged in masonry grid around it with varying sizes
    // and subtle 3D depth offsets for a curated editorial feel.
    var isMasonry = layout === 'masonry-featured';
    var featuredIdx =
      options.layoutConfig && options.layoutConfig.featuredIndex !== undefined ? options.layoutConfig.featuredIndex : 0;
    var masonrySpacing = (options.layoutConfig && options.layoutConfig.spacing) || 0.6;
    var parallaxStr = (options.layoutConfig && options.layoutConfig.parallaxStrength) || 0.06;
    var gridCols = options.gridCols || 3;
    var gridSpacingX = options.gridSpacingX || masonrySpacing;
    var gridSpacingY = options.gridSpacingY || masonrySpacing * 1.2;
    var baseCardH = options.cardHeight || 0.5;
    var gridCardAspect = options.cardAspect || 3 / 4;
    var baseCardW = baseCardH * gridCardAspect;

    var startX = -((gridCols - 1) * gridSpacingX) / 2;
    var startY = ((Math.ceil(count / gridCols) - 1) * gridSpacingY) / 2;

    items.forEach(function (item, index) {
      if (!item.imageSrc) return;

      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      textures.push(tex);

      var isFeatured = index === featuredIdx;

      // Featured card: 2x size, centered, closer to camera
      var thisCardH = isFeatured ? baseCardH * 1.8 : baseCardH;
      var thisCardAspect = isFeatured ? gridCardAspect : gridCardAspect * (0.9 + (index % 5) * 0.04);
      var thisCardW = thisCardH * thisCardAspect;

      var geom = _safePlaneGeometry(thisCardW, thisCardH, 'masonry-card');
      var mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });

      var mesh = new THREE.Mesh(geom, mat);

      var col, row, x, y, z;
      if (isFeatured) {
        // Featured: centered, closer to camera (Z=1.5, well within frustum)
        x = 0;
        y = 0;
        z = 1.5;
      } else {
        // Masonry: grid with organic offsets, Z centered around 0.8-1.2
        var masonryIndex = index < featuredIdx ? index : index - 1;
        col = masonryIndex % gridCols;
        row = Math.floor(masonryIndex / gridCols);
        x = startX + col * gridSpacingX + (isMasonry ? ((masonryIndex % 7) - 3) * 0.1 : 0);
        y = startY - row * gridSpacingY + (isMasonry ? ((masonryIndex % 5) - 2) * 0.08 : 0);
        z = 1.0 + Math.abs(col - gridCols / 2) * parallaxStr * 0.3 + row * parallaxStr * 0.2;
      }

      mesh.position.set(x, y, z);
      mesh.lookAt(0, y, z - 10);

      mesh.userData = {
        roomKey: roomKey,
        galleryIndex: item.index,
        title: item.title || '',
        productHandle: item.productHandle || null,
        collectionHandle: item.collectionHandle || null,
        layout: isMasonry ? 'masonry-featured' : 'grid',
        baseX: x,
        baseY: y,
        baseZ: z,
        isFeatured: isFeatured,
        col: isFeatured ? -1 : col,
        row: isFeatured ? -1 : row,
      };

      group.add(mesh);
      planes.push(mesh);

      // Title overlay at bottom of card
      if (item.title) {
        var labelCanvas = document.createElement('canvas');
        var lCtx = labelCanvas.getContext('2d');
        labelCanvas.width = isFeatured ? 1024 : 512;
        labelCanvas.height = isFeatured ? 96 : 64;
        lCtx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
        lCtx.font = 'bold ' + (isFeatured ? 36 : 28) + 'px Georgia, serif';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        lCtx.fillStyle = isFeatured ? '#d4af37' : '#ffffff';
        lCtx.fillText(item.title, labelCanvas.width / 2, labelCanvas.height / 2);

        var labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        var labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthTest: false,
          side: THREE.DoubleSide,
        });
        var labelW = thisCardW * (isFeatured ? 0.7 : 0.85);
        var labelH = labelW * (labelCanvas.height / labelCanvas.width);
        var labelGeom = _safePlaneGeometry(labelW, labelH, 'masonry-label');
        var labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(x, y - thisCardH * 0.5 - labelH * 0.3, z + 0.01);
        labelMesh.renderOrder = 999;
        group.add(labelMesh);
        labels.push(labelMesh);
      }
    });

    scene.add(group);

    galleryStageRegistry[roomKey] = {
      group: group,
      planes: planes,
      labels: labels,
      textures: textures,
      layout: isMasonry ? 'masonry-featured' : 'grid',
      currentPage: 0,
      targetPage: 0,
      totalPages: 1,
      gridCols: gridCols,
      gridSpacingX: gridSpacingX,
      gridSpacingY: gridSpacingY,
      baseCardW: baseCardW,
      baseCardH: baseCardH,
      startX: startX,
      startY: startY,
      featuredIndex: featuredIdx,
      parallaxStrength: parallaxStr,
    };
  } else if (layout === 'vertical') {
    // ── Vertical scroll layout (indrajaal-museum homepage style) ──
    // Items stacked vertically in 3D space, scroll-driven
    var cardSpacing = options.cardSpacing || 3.5;
    var cardH = options.cardHeight || 2.2;
    var cardAspect = options.cardAspect || 2 / 3;
    var cardW = cardH * cardAspect;
    var startY = ((count - 1) * cardSpacing) / 2;

    items.forEach(function (item, index) {
      if (!item.imageSrc) return;

      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      textures.push(tex);

      var geom = _safePlaneGeometry(cardW, cardH, 'gallery-main');
      var mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.85,
        metalness: 0.15,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });

      var mesh = new THREE.Mesh(geom, mat);
      var y = startY - index * cardSpacing;
      mesh.position.set(0, y, 0);
      mesh.rotation.x = THREE.MathUtils.degToRad(tiltDegrees);

      mesh.userData = {
        roomKey: roomKey,
        galleryIndex: item.index,
        title: item.title || '',
        productHandle: item.productHandle || null,
        collectionHandle: item.collectionHandle || null,
        layout: 'vertical',
        baseY: y,
      };

      group.add(mesh);
      planes.push(mesh);

      // Large title label below each card (indrajaal style: ~100px font, tight spacing, cream on dark)
      if (item.title) {
        var labelCanvas = document.createElement('canvas');
        var lCtx = labelCanvas.getContext('2d');
        labelCanvas.width = 1024;
        labelCanvas.height = 160;
        lCtx.clearRect(0, 0, 1024, 160);
        lCtx.font = 'bold 72px Georgia, serif';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        lCtx.fillStyle = '#ece3c2';
        lCtx.letterSpacing = '-5px';
        lCtx.fillText(item.title.toUpperCase(), 512, 60);

        // Sub-label: "[ EXPLORE COLLECTION ]"
        lCtx.font = '500 14px Arial, sans-serif';
        lCtx.fillStyle = 'rgba(255,255,255,0.5)';
        lCtx.letterSpacing = '3px';
        lCtx.fillText('[ EXPLORE COLLECTION ]', 512, 120);

        var labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        var labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthTest: false,
          side: THREE.DoubleSide,
        });
        var labelW = cardW * 1.2;
        var labelH = labelW * (160 / 1024);
        var labelGeom = _safePlaneGeometry(labelW, labelH, 'arc-label');
        var labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(0, y - cardH * 0.5 - labelH * 0.6, 0.05);
        labelMesh.renderOrder = 999;
        group.add(labelMesh);
        labels.push(labelMesh);
      }
    });

    scene.add(group);

    galleryStageRegistry[roomKey] = {
      group: group,
      planes: planes,
      labels: labels,
      textures: textures,
      layout: 'vertical',
      scrollY: 0,
      targetScrollY: 0,
      currentRotationX: 0,
      targetRotationX: 0,
      cardSpacing: cardSpacing,
      cardCount: count,
      cardH: cardH,
      startY: startY,
    };
  } else if (layout === 'asymmetric-gallery') {
    // ── Indrajaal-style grid: 5-col, equal cards, row parallax, drag-to-explore ──
    _buildIndrajaalGrid(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (layout === 'infinite-drag-gallery') {
    _buildInfiniteDragGallery(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (layout === 'narrative-story') {
    _buildNarrativeStory(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (layout === 'codex-list') {
    _buildCodexList(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else if (layout === 'artifact-gallery') {
    _buildArtifactGallery(roomKey, scene, group, planes, labels, textures, textureLoader, items, options);
  } else {
    // ── Arc carousel layout (original horizontal rotation) ──
    // Cards arranged in an arc in FRONT of the camera (positive Z)
    // Camera is at Z=1, near=0, far=2, so Z must be > 0
    var arcRadius = Math.min(vpH, vpW) * 0.25; // 25% of smaller viewport
    var arcCardH = vpH * 0.35;
    var arcCardAspect = options.cardAspect || (16 / 9);
    var arcCardW = arcCardH / arcCardAspect;
    var arcArcDeg = 120;
    var step = count > 1 ? arcArcDeg / (count - 1) : 0;
    var startAngle = -arcArcDeg / 2;

    items.forEach(function (item, index) {
      if (!item.imageSrc) return;

      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      textures.push(tex);

      var geom = _safePlaneGeometry(arcCardW, arcCardH, 'arc-gallery');
      var mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.85,
        metalness: 0.15,
        transparent: true,
        opacity: 0.95,
      });

      var mesh = new THREE.Mesh(geom, mat);
      var angleDeg = startAngle + step * index;
      var rad = (angleDeg * Math.PI) / 180;
      // Arc in XY plane at Z=0.5 (in front of camera at Z=1)
      var x = Math.sin(rad) * arcRadius;
      var y = Math.cos(rad) * arcRadius * 0.3; // Slight vertical arc

      mesh.position.set(x, y, 0.5);
      mesh.lookAt(new THREE.Vector3(0, 0, 1)); // Face the camera
      mesh.rotation.x = 0;

      mesh.userData = {
        roomKey: roomKey,
        galleryIndex: item.index,
        title: item.title || '',
        productHandle: item.productHandle || null,
        collectionHandle: item.collectionHandle || null,
        layout: 'arc',
      };

      group.add(mesh);
      planes.push(mesh);

      // Add a text label below the card
      if (item.title) {
        var labelCanvas = document.createElement('canvas');
        var lCtx = labelCanvas.getContext('2d');
        labelCanvas.width = 512;
        labelCanvas.height = 96;
        lCtx.clearRect(0, 0, 512, 96);
        lCtx.font = 'bold 36px Georgia, serif';
        lCtx.textAlign = 'center';
        lCtx.textBaseline = 'middle';
        lCtx.fillStyle = '#d4af37';
        lCtx.fillText(item.title, 256, 48);

        var labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
        var labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          depthTest: false,
        });
        var labelW = w * 0.8;
        var labelH = labelW * (96 / 512);
        var labelGeom = _safePlaneGeometry(labelW, labelH, 'arc-car-label');
        var labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.set(x, verticalOffset - h * 0.55, z);
        labelMesh.lookAt(new THREE.Vector3(0, verticalOffset - h * 0.55, 0));
        labelMesh.rotation.x += THREE.MathUtils.degToRad(tiltDegrees);
        labelMesh.renderOrder = 999;
        group.add(labelMesh);
        labels.push(labelMesh);
      }
    });

    scene.add(group);

    galleryStageRegistry[roomKey] = {
      group: group,
      planes: planes,
      labels: labels,
      textures: textures,
      layout: 'arc',
      currentAngle: 0,
      targetAngle: 0,
      radius: radius,
      arcDegrees: arcDegrees,
      verticalOffset: verticalOffset,
      tiltDegrees: tiltDegrees,
    };
  }

  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Gallery stage built for room:', roomKey, 'items:', items.length, 'layout:', layout);
  }
  return galleryStageRegistry[roomKey];
}

// ─────────────────────────────────────────────────────────────
// INFINITE DRAG GALLERY — shared builder
// ─────────────────────────────────────────────────────────────
// INDRAAJAL GRID — 5-col equal cards, row parallax, drag-to-explore
// ─────────────────────────────────────────────────────────────
function _buildIndrajaalGrid(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var cols = cfg.columns || 5;
  var spacing = cfg.spacing || 0.5;
  var cardH = options.cardHeight || 2.0;
  var cardAspect = options.cardAspect || 2 / 3;
  var cardW = cardH * cardAspect;

  // ── Viewport-adaptive card sizing ──
  // OrthographicCamera: camera frustum is (-aspect, aspect, 1, -1)
  // So visible height = 2, visible width = 2 * aspect
  var vpH = camera.top - camera.bottom;    // = 2
  var vpW = camera.right - camera.left;     // = 2 * aspect
  var isMobileRoom = vpH < 5;

  // Always size cards to fit viewport
  // Desktop: 5 cols fit in 80% of viewport width, cards ~30% of viewport height
  // Mobile: 3 cols fit in 80% of viewport width
  var availableW = vpW * 0.85;
  var availableH = vpH * 0.85;

  if (isMobileRoom) {
    cols = 3;
    cardW = availableW / cols;
    cardH = cardW / cardAspect;
    if (cardH > availableH * 0.5) cardH = availableH * 0.5;
    spacing = cardW * 0.15;
  } else {
    cardW = availableW / cols;
    cardH = cardW / cardAspect;
    if (cardH > availableH * 0.45) cardH = availableH * 0.45;
    spacing = cardW * 0.12;
  }
  cardW = cardH * cardAspect;

  var loadedItems = [];
  var texCache = {};
  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Indrajaal texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group, planes: [], labels: [], textures: textures,
      layout: 'asymmetric-gallery', cardCount: 0,
      targetX: 0, currentX: 0, targetY: 0, currentY: 0,
      gridW: 0, gridH: 0, cols: cols, cardW: cardW, cardH: cardH, spacing: spacing,
    };
    return;
  }

  // ── Grid dimensions ──
  var rows = Math.ceil(loadedItems.length / cols);
  var gridW = cols * cardW + (cols - 1) * spacing;
  var gridH = rows * cardH + (rows - 1) * spacing;

  // Parallax multipliers per row (top row moves fastest, deeper rows slower)
  var rowParallax = [];
  for (var r = 0; r < rows; r++) {
    rowParallax.push(1 - (r * 0.08));
  }

  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var item = entry.item;
    var col = idx % cols;
    var row = Math.floor(idx / cols);

    var geom = _safePlaneGeometry(cardW, cardH, 'indrajaal-grid');
    var mat = new THREE.MeshBasicMaterial({
      map: entry.tex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    var mesh = new THREE.Mesh(geom, mat);

    // Center the grid around origin
    var x = -gridW / 2 + cardW / 2 + col * (cardW + spacing);
    var y = gridH / 2 - cardH / 2 - row * (cardH + spacing);

    mesh.position.set(x, y, 0);

    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: item.title || '',
      productHandle: item.productHandle || null,
      collectionHandle: item.collectionHandle || null,
      layout: 'asymmetric-gallery',
      baseX: x,
      baseY: y,
      baseZ: 0,
      cardW: cardW,
      cardH: cardH,
      row: row,
      col: col,
      parallaxMult: rowParallax[row],
    };

    group.add(mesh);
    planes.push(mesh);
  });

  scene.add(group);
  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'asymmetric-gallery',
    cardCount: loadedItems.length,
    targetX: 0,
    currentX: 0,
    targetY: 0,
    currentY: 0,
    onX: 0,
    onY: 0,
    gridW: gridW,
    gridH: gridH,
    cols: cols,
    cardW: cardW,
    cardH: cardH,
    spacing: spacing,
    rowParallax: rowParallax,
  };
}

// ─────────────────────────────────────────────────────────────
function _buildInfiniteDragGallery(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var COLS = cfg.columns || 4;
  var GUTTER = cfg.spacing || 0.08;
  var cardW = cfg.cardWidth || 0.7;
  var cardH = cfg.cardHeight || 1.05;
  var useShader = !!cfg.shaderEffects;

  var loadedItems = [];
  var texCache = {};
  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Gallery texture load error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    var uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'immersive-gallery-empty-msg';
      emptyMsg.textContent = uiLayer.getAttribute('data-msg-empty-collection') || 'This collection is currently empty.';
      uiLayer.appendChild(emptyMsg);
    }
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'infinite-drag-gallery',
      cardCount: 0,
      gridCols: COLS,
      gridTotalW: 0,
      gridTotalH: 0,
      cardW: cardW,
      cardH: cardH,
      spacing: GUTTER,
      velocityX: 0,
      velocityY: 0,
      useShader: useShader,
    };
    return;
  }

  // Duplicate to fill 3 viewport widths + 3 viewport heights for infinite drag
  var vpH = camera.top - camera.bottom;
  var vpW = camera.right - camera.left;
  var minRows = Math.max(6, Math.ceil((3 * vpH) / (cardH + GUTTER)));
  var minCols = Math.max(4, Math.ceil((3 * vpW) / (cardW + GUTTER)));
  var totalCardsNeeded = minCols * minRows;
  var dupItems = [];
  var si = 0;
  while (dupItems.length < totalCardsNeeded) {
    var src = loadedItems[si % loadedItems.length];
    if (!src) break;
    dupItems.push({ item: src.item, tex: src.tex, originalIndex: src.index });
    si++;
  }

  var totalRows = Math.ceil(dupItems.length / COLS);
  var gridTotalW = COLS * cardW + (COLS - 1) * GUTTER;
  var gridTotalH = totalRows * (cardH + GUTTER);
  var startX = -gridTotalW / 2 + cardW / 2;
  var startY = gridTotalH / 2 - cardH / 2;

  // Shared shader uniforms
  var sharedUniforms = {
    uTime: { value: 0 },
    uVelocity: { value: 0 },
  };

  dupItems.forEach(function (entry, idx) {
    if (!entry) return;
    var item = entry.item;
    var col = idx % COLS;
    var row = Math.floor(idx / COLS);
    var geom = _safePlaneGeometry(cardW, cardH, 'gallery-main');

    var mat;
    if (useShader) {
      mat = new THREE.ShaderMaterial({
        vertexShader: [
          'varying vec2 vUv;',
          'void main() {',
          '  vUv = uv;',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}',
        ].join('\n'),
        fragmentShader: [
          'precision highp float;',
          'uniform sampler2D uTexture;',
          'uniform float uTime;',
          'uniform float uVelocity;',
          'varying vec2 vUv;',
          'void main() {',
          '  float shift = uVelocity * 0.003;',
          '  vec2 dir = vUv - 0.5;',
          '  float dist = length(dir);',
          '  float edge = smoothstep(0.0, 0.5, dist);',
          '  float amount = shift * edge;',
          '  vec2 rUV = clamp(vUv + dir * amount, 0.0, 1.0);',
          '  vec2 gUV = vUv;',
          '  vec2 bUV = clamp(vUv - dir * amount, 0.0, 1.0);',
          '  float r = texture2D(uTexture, rUV).r;',
          '  float g = texture2D(uTexture, gUV).g;',
          '  float b = texture2D(uTexture, bUV).b;',
          '  float a = texture2D(uTexture, gUV).a;',
          '  gl_FragColor = vec4(r, g, b, a);',
          '}',
        ].join('\n'),
        uniforms: {
          uTexture: { value: entry.tex },
          uTime: sharedUniforms.uTime,
          uVelocity: sharedUniforms.uVelocity,
        },
        transparent: true,
        side: THREE.DoubleSide,
      });
    } else {
      mat = new THREE.MeshBasicMaterial({ map: entry.tex, transparent: true, opacity: 1.0, side: THREE.DoubleSide });
    }

    var mesh = new THREE.Mesh(geom, mat);
    var x = startX + col * (cardW + GUTTER);
    var y = startY - row * (cardH + GUTTER);
    mesh.position.set(x, y, 1.0);
    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.originalIndex,
      title: item.title || '',
      productHandle: item.productHandle || null,
      collectionHandle: item.collectionHandle || null,
      layout: 'infinite-drag-gallery',
      baseX: x,
      baseY: y,
      baseZ: 1.0,
      cardW: cardW,
      cardH: cardH,
      row: row,
      col: col,
    };
    group.add(mesh);
    planes.push(mesh);
  });

  scene.add(group);
  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'infinite-drag-gallery',
    cardCount: dupItems.length,
    gridCols: COLS,
    totalRows: totalRows,
    cardW: cardW,
    cardH: cardH,
    spacing: GUTTER,
    gridTotalW: gridTotalW,
    gridTotalH: gridTotalH,
    velocityX: 0,
    velocityY: 0,
    useShader: useShader,
    sharedUniforms: sharedUniforms,
  };
}

// ─────────────────────────────────────────────────────────────
// LAYOUT A: NARRATIVE STORY — Z-axis cinematic scroll
// Indrajaal-museum inspired: PerspectiveCamera + floating planes + shader wipe
// ─────────────────────────────────────────────────────────────
function _buildNarrativeStory(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var vpH = (options && options.viewportHeight) || 2;

  var cardH = vpH * 0.4;
  var cardAspect = cfg.cardAspect || 2 / 3;
  var cardW = cardH * cardAspect;
  var cardSpacing = cardH * 0.6;
  var floatAmp = cfg.floatAmplitude || 0.02;
  var floatSpeed = cfg.floatSpeed || 0.8;

  // Switch to PerspectiveCamera for depth
  if (camera instanceof THREE.OrthographicCamera) {
    var size = new THREE.Vector2();
    renderer.getSize(size);
    var w = size.x || window.innerWidth,
      h = size.y || window.innerHeight;
    if (camera && camera.dispose) camera.dispose();
    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }

  group.userData.isNarrativeStory = true;
  group.userData.scrollZ = 0;
  group.userData.targetScrollZ = 0;
  group.userData.floatAmp = floatAmp;
  group.userData.floatSpeed = floatSpeed;

  var count = items.length;
  var loadedItems = [];
  var texCache = {};

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (t) {
          t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          t.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Narrative texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (!loadedItems.length) {
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'narrative-story',
      cardCount: 0,
      scrollZ: 0,
      targetScrollZ: 0,
    };
    return;
  }

  // Shared shader uniforms
  var sharedUniforms = { uTime: { value: 0 }, uScrollZ: { value: 0 }, uFloatAmp: { value: floatAmp } };

  var vertSrc = [
    'varying vec2 vUv;',
    'varying float vDist;',
    'uniform float uTime;',
    'uniform float uFloatAmp;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 pos = position;',
    '  float wave = sin(pos.y * 1.5 + uTime * 0.8) * uFloatAmp;',
    '  pos.x += wave;',
    '  pos.z += abs(wave) * 0.3;',
    '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
    '  vDist = -mv.z;',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n');

  var fragSrc = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform float uTime;',
    'uniform float uScrollZ;',
    'varying vec2 vUv;',
    'varying float vDist;',
    'void main() {',
    '  float aberration = smoothstep(2.0, 12.0, vDist) * 0.004;',
    '  vec2 dir = vUv - 0.5;',
    '  float edge = smoothstep(0.0, 0.5, length(dir));',
    '  float shift = aberration * edge;',
    '  vec2 rUV = clamp(vUv + dir * shift, 0.001, 0.999);',
    '  vec2 gUV = vUv;',
    '  vec2 bUV = clamp(vUv - dir * shift, 0.001, 0.999);',
    '  float r = texture2D(uTexture, rUV).r;',
    '  float g = texture2D(uTexture, gUV).g;',
    '  float b = texture2D(uTexture, bUV).b;',
    '  float a = texture2D(uTexture, gUV).a;',
    '  float vig = 1.0 - smoothstep(0.3, 0.9, length(vUv - 0.5));',
    '  gl_FragColor = vec4(r, g, b, a * vig);',
    '}',
  ].join('\n');

  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var zPos = -(idx * cardSpacing);
    var geom = _safePlaneGeometry(cardW, cardH, 'narrative-plane');
    var mat = new THREE.ShaderMaterial({
      vertexShader: vertSrc,
      fragmentShader: fragSrc,
      uniforms: {
        uTexture: { value: entry.tex },
        uTime: sharedUniforms.uTime,
        uScrollZ: sharedUniforms.uScrollZ,
        uFloatAmp: sharedUniforms.uFloatAmp,
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    var mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 0, zPos);
    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: entry.item.title || '',
      productHandle: entry.item.productHandle || null,
      collectionHandle: entry.item.collectionHandle || null,
      layout: 'narrative-story',
      baseZ: zPos,
      floatAmp: floatAmp,
    };
    group.add(mesh);
    planes.push(mesh);

    // Title label as 3D text plane below each card
    if (entry.item.title) {
      var lCanvas = document.createElement('canvas');
      var lCtx = lCanvas.getContext('2d');
      lCanvas.width = 1024;
      lCanvas.height = 160;
      lCtx.clearRect(0, 0, 1024, 160);
      lCtx.font = 'bold 64px Georgia, serif';
      lCtx.textAlign = 'center';
      lCtx.textBaseline = 'middle';
      lCtx.fillStyle = '#ece3c2';
      lCtx.fillText(entry.item.title.toUpperCase(), 512, 55);
      lCtx.font = '500 13px Arial, sans-serif';
      lCtx.fillStyle = 'rgba(255,255,255,0.5)';
      lCtx.fillText('[ SCROLL TO EXPLORE ]', 512, 120);
      var lTex = new THREE.CanvasTexture(lCanvas);
      lTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      var lMat = new THREE.MeshBasicMaterial({
        map: lTex,
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      var lW = cardW * 1.1;
      var lH = lW * (160 / 1024);
      var lMesh = new THREE.Mesh(_safePlaneGeometry(lW, lH, 'narrative-label'), lMat);
      lMesh.position.set(0, -cardH * 0.55, zPos + 0.05);
      lMesh.renderOrder = 999;
      group.add(lMesh);
      labels.push(lMesh);
    }
  });

  scene.add(group);
  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'narrative-story',
    cardCount: count,
    cardSpacing: cardSpacing,
    cardH: cardH,
    scrollZ: 0,
    targetScrollZ: 0,
    sharedUniforms: sharedUniforms,
    isNarrativeStory: true,
    isScrollDriven: true,
  };
}

// ─────────────────────────────────────────────────────────────
// LAYOUT B: CODEX — Infinite interactive text list + hover detail plane
// Indrajaal-museum inspired: typography-driven, raycaster hover, lerp recycling
// ─────────────────────────────────────────────────────────────
function _buildCodexList(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var vpH = (options && options.viewportHeight) || 2;

  var cardH = vpH * 0.35;
  var cardAspect = cfg.cardAspect || 3 / 4;
  var cardW = cardH * cardAspect;
  var itemSpacing = cardH * 0.5;
  var lerpFactor = cfg.lerpFactor || 0.12;
  var hoverAspect = cfg.hoverPlaneAspect || 16 / 9;

  group.userData.isCodex = true;
  group.userData.scrollY = 0;
  group.userData.targetScrollY = 0;
  group.userData.lerpFactor = lerpFactor;
  group.userData.totalHeight = items.length * itemSpacing;

  var count = items.length;
  var loadedItems = [];
  var texCache = {};

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (t) {
          t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          t.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Codex texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (!loadedItems.length) {
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'codex-list',
      cardCount: 0,
      scrollY: 0,
      targetScrollY: 0,
    };
    return;
  }

  // Create text entry planes (typography-driven)
  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var yPos = -(idx * itemSpacing);

    // Text canvas for the entry name
    var tCanvas = document.createElement('canvas');
    var tCtx = tCanvas.getContext('2d');
    tCanvas.width = 1024;
    tCanvas.height = 128;
    tCtx.clearRect(0, 0, 1024, 128);
    tCtx.font = 'bold 52px Georgia, serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillStyle = '#d4af37';
    tCtx.fillText(entry.item.title || entry.item.subtitle || 'Item ' + (idx + 1), 512, 64);
    var tTex = new THREE.CanvasTexture(tCanvas);
    tTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
    var tMat = new THREE.MeshBasicMaterial({ map: tTex, transparent: true, depthTest: false, side: THREE.DoubleSide });
    var tW = cardW * 1.5;
    var tH = tW * (128 / 1024);
    var tMesh = new THREE.Mesh(_safePlaneGeometry(tW, tH, 'codex-text'), tMat);
    tMesh.position.set(0, yPos, 0);
    tMesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: entry.item.title || '',
      productHandle: entry.item.productHandle || null,
      collectionHandle: entry.item.collectionHandle || null,
      layout: 'codex-list',
      baseY: yPos,
      isTextEntry: true,
      itemIndex: idx,
    };
    group.add(tMesh);
    planes.push(tMesh);
  });

  // Floating detail plane (shows hovered item's image)
  var hoverW = cardW * 2.5;
  var hoverH = hoverW / hoverAspect;
  var hoverMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  var hoverMesh = new THREE.Mesh(_safePlaneGeometry(hoverW, hoverH, 'codex-hover'), hoverMat);
  hoverMesh.position.set(cardW * 1.2, 0, 0.5);
  hoverMesh.renderOrder = 1000;
  hoverMesh.userData = { isHoverPlane: true };
  group.add(hoverMesh);
  group.userData.hoverPlane = hoverMesh;

  scene.add(group);
  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'codex-list',
    cardCount: count,
    itemSpacing: itemSpacing,
    cardH: cardH,
    scrollY: 0,
    targetScrollY: 0,
    lerpFactor: lerpFactor,
    isCodex: true,
    isScrollDriven: true,
  };
}

// ─────────────────────────────────────────────────────────────
// LAYOUT C: ARTIFACT GALLERY — Floating grid + mouse parallax + glass shader
// Indrajaal-museum inspired: CSS Grid mapped to meshes, group parallax, hover distortion
// ─────────────────────────────────────────────────────────────
function _buildArtifactGallery(roomKey, scene, group, planes, labels, textures, textureLoader, items, options) {
  var cfg = options.layoutConfig || {};
  var vpH = (options && options.viewportHeight) || 2;
  var vpW = (options && options.viewportWidth) || 2;

  var gridCols = cfg.gridCols || 3;
  var cardH = vpH * 0.3;
  var cardAspect = cfg.cardAspect || 3 / 4;
  var cardW = cardH * cardAspect;
  var gridSpacing = cardW * 0.15;
  var parallaxStr = cfg.parallaxStrength || 0.0005;
  var glassDist = cfg.glassDistortion || 0.015;

  group.userData.isArtifactGallery = true;
  group.userData.parallaxStr = parallaxStr;
  group.userData.glassDist = glassDist;
  group.userData.mouseX = 0;
  group.userData.mouseY = 0;
  group.userData.targetRotY = 0;
  group.userData.targetRotX = 0;
  group.userData.currentRotY = 0;
  group.userData.currentRotX = 0;

  var count = items.length;
  var loadedItems = [];
  var texCache = {};

  items.forEach(function (item, index) {
    if (!item.imageSrc) return;
    if (!texCache[item.imageSrc]) {
      var tex = textureLoader.load(
        item.imageSrc,
        function (t) {
          t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          t.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Artifact texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (!loadedItems.length) {
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'artifact-gallery',
      cardCount: 0,
    };
    return;
  }

  // Glass shader for hover distortion
  var vertSrc = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n');

  var fragSrc = [
    'precision highp float;',
    'uniform sampler2D uTexture;',
    'uniform float uHover;',
    'uniform vec2 uMouse;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec2 dir = vUv - uMouse;',
    '  float dist = length(dir);',
    '  float glass = uHover * ' + glassDist.toFixed(4) + ' * (1.0 - smoothstep(0.0, 0.5, dist));',
    '  vec2 uv = vUv + dir * glass;',
    '  vec4 c = texture2D(uTexture, clamp(uv, 0.001, 0.999));',
    '  float vig = 1.0 - smoothstep(0.4, 0.9, length(vUv - 0.5));',
    '  gl_FragColor = vec4(c.rgb, c.a * vig);',
    '}',
  ].join('\n');

  var rows = Math.ceil(count / gridCols);
  var startX = -((gridCols - 1) * gridSpacing) / 2;
  var startY = ((rows - 1) * gridSpacing) / 2;

  loadedItems.forEach(function (entry, idx) {
    if (!entry) return;
    var col = idx % gridCols;
    var row = Math.floor(idx / gridCols);
    var x = startX + col * gridSpacing;
    var y = startY - row * gridSpacing;
    var z = Math.sin(col * 0.7) * 0.15 + Math.cos(row * 0.5) * 0.1;

    var geom = _safePlaneGeometry(cardW, cardH, 'artifact-card');
    var mat = new THREE.ShaderMaterial({
      vertexShader: vertSrc,
      fragmentShader: fragSrc,
      uniforms: {
        uTexture: { value: entry.tex },
        uHover: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
    var mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    mesh.userData = {
      roomKey: roomKey,
      galleryIndex: entry.index,
      title: entry.item.title || '',
      productHandle: entry.item.productHandle || null,
      collectionHandle: entry.item.collectionHandle || null,
      layout: 'artifact-gallery',
      baseX: x,
      baseY: y,
      baseZ: z,
      col: col,
      row: row,
    };
    group.add(mesh);
    planes.push(mesh);
  });

  scene.add(group);
  galleryStageRegistry[roomKey] = {
    group: group,
    planes: planes,
    labels: labels,
    textures: textures,
    layout: 'artifact-gallery',
    cardCount: count,
    gridCols: gridCols,
    gridSpacing: gridSpacing,
    cardH: cardH,
    cardW: cardW,
    parallaxStr: parallaxStr,
    isArtifactGallery: true,
  };
}

// ─────────────────────────────────────────────────────────────
// Gallery hint UI
// ─────────────────────────────────────────────────────────────

function showGalleryHint(roomKey) {
  var existing = document.getElementById('immersive-gallery-hint');
  if (existing) existing.remove();

  var l = getGalleryLayout(roomKey);
  var isScrollLayout = l === 'vertical' || l === 'asymmetric-gallery' || l === 'scroll-narrative';
  var hint = document.createElement('div');
  hint.id = 'immersive-gallery-hint';
  hint.className = 'immersive-gallery-hint';
  hint.innerHTML = isScrollLayout
    ? '<span class="immersive-gallery-hint__text">Scroll or drag to explore &middot; Click a card to view collection</span>'
    : '<span class="immersive-gallery-hint__text">Drag to browse &middot; Click a card to explore</span>';
  hint.setAttribute('aria-live', 'polite');
  document.body.appendChild(hint);

  setTimeout(function () {
    hint.classList.add('is-fading');
    setTimeout(function () {
      hint.remove();
    }, 600);
  }, 4000);
}

// Gallery carousel interaction - drag to rotate like Indrajaal
var galleryDragState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  velocity: 0,
  velocityX: 0,
  velocityY: 0,
};

function initGalleryCarousel(canvas) {
  if (!canvas) return;
  ListenerRegistry.cleanup('gallery-carousel');
  var state = galleryStageRegistry[currentRoomKey];
  var layout = state ? state.layout : 'arc';
  var isScrollLayout =
    layout === 'scroll-narrative' ||
    layout === 'vertical' ||
    layout === 'infinite-drag-gallery' ||
    layout === 'scroll-story' ||
    layout === 'scroll-tunnel';
  var isHelixLayout = layout === 'helix' || layout === 'scroll-narrative';
  var isGridLayout = layout === 'grid' || layout === 'masonry-featured';
  var isInfiniteDrag = layout === 'infinite-drag-gallery';
  var isScrollStory = layout === 'scroll-story';
  var isScrollTunnel = layout === 'scroll-tunnel';
  var isNarrativeStory = layout === 'narrative-story';
  var isCodexList = layout === 'codex-list';
  var isArtifactGallery = layout === 'artifact-gallery';

  var isIndrajaalGrid = layout === 'asymmetric-gallery';

  var startHandler = function (e) {
    // Guard: don't capture touch/click until user has entered the 3D experience
    if (
      window.ShahanaImmersive &&
      window.ShahanaImmersive.settings &&
      !window.ShahanaImmersive.settings.interactionEnabled
    )
      return;
    if (!galleryStageRegistry[currentRoomKey]) return;
    galleryDragState.isDragging = true;
    galleryDragState.startX = e.clientX || e.touches?.[0]?.clientX || 0;
    galleryDragState.startY = e.clientY || e.touches?.[0]?.clientY || 0;
    galleryDragState.lastX = galleryDragState.startX;
    galleryDragState.lastY = galleryDragState.startY;
    galleryDragState.velocityX = 0;
    galleryDragState.velocityY = 0;
    // Indrajaal grid: store initial target for drag-to-explore
    if (isIndrajaalGrid) {
      var s = galleryStageRegistry[currentRoomKey];
      if (s) {
        s.onX = s.targetX - galleryDragState.startX * 2.5;
        s.onY = s.targetY + galleryDragState.startY * 2.5;
      }
    }
    canvas.style.cursor = 'grabbing';
  };

  var moveHandler = function (e) {
    if (!galleryDragState.isDragging) return;
    var x = e.clientX || e.touches?.[0]?.clientX || 0;
    var y = e.clientY || e.touches?.[0]?.clientY || 0;
    var s = galleryStageRegistry[currentRoomKey];
    if (!s) return;

    var dx = x - galleryDragState.lastX;
    var dy = y - galleryDragState.lastY;

    if (isIndrajaalGrid) {
      // ── Indrajaal grid: drag-to-explore with row parallax ──
      var dragMult = 2.5;
      s.targetX = (s.onX || 0) + dx * dragMult;
      s.targetY = (s.onY || 0) - dy * dragMult;
      // Clamp to grid bounds (grid extends beyond viewport)
      var maxX = (s.gridW - (camera.right - camera.left)) * 0.5;
      var maxY = (s.gridH - (camera.top - camera.bottom)) * 0.5;
      if (maxX > 0) s.targetX = Math.max(-maxX, Math.min(maxX, s.targetX));
      if (maxY > 0) s.targetY = Math.max(-maxY, Math.min(maxY, s.targetY));
      galleryDragState.velocityX = dx * 0.8;
      galleryDragState.velocityY = dy * 0.8;
    } else if (isScrollLayout) {
      // Scroll-driven layouts: scroll-narrative, vertical
      // Y drag translates/scrolls, X drag adds subtle rotation
      var deltaY = dy * 0.012;
      var deltaX = dx * 0.003;
      // Vertical / scroll-narrative: standard scroll + tilt
      s.targetScrollY = Math.max(
        -(s.cardCount - 1) * s.cardSpacing * 0.5,
        Math.min(s.cardSpacing * 0.5, s.targetScrollY - deltaY),
      );
      s.targetRotationX = Math.max(-0.15, Math.min(0.15, s.targetRotationX + deltaX));
      galleryDragState.velocityX = dx * 0.5;
      galleryDragState.velocityY = dy * 0.5;
    } else if (isHelixLayout) {
      // Helix: X drag rotates around spiral, Y drag scrolls up/down
      s.targetRotationY += dx * 0.006;
      var _hh = ((s.totalAngle || 2.5 * Math.PI * 2) / (Math.PI * 2)) * (s.helixPitch || 2.8) * 0.5;
      s.targetScrollY = Math.max(-_hh, Math.min(_hh, s.targetScrollY - dy * 0.01));
      galleryDragState.velocityX = dx * 0.5;
      galleryDragState.velocityY = dy * 0.5;
    } else if (isGridLayout) {
      // Grid / masonry-featured: horizontal drag scrolls through items
      if (s.targetPage !== undefined) {
        s.targetPage -= dx * 0.004;
      } else {
        // Masonry: horizontal drag shifts the group
        s.targetRotationY += dx * 0.003;
      }
      galleryDragState.velocityX = dx * 0.5;
    } else if (isInfiniteDrag) {
      // Infinite drag gallery: direct velocity tracking for X + Y
      galleryDragState.velocityX = dx * 0.8;
      galleryDragState.velocityY = dy * 0.8;
      // Apply immediate position change for responsiveness
      if (s.group) {
        s.group.position.x += dx * 0.008;
        s.group.position.y -= dy * 0.008;
      }
    } else if (isScrollStory) {
      // Scroll story: drag Y moves through list (Y-axis)
      s.targetScrollY -= dy * 0.02;
      // No clamp — infinite scroll via modulo
      // Subtle X parallax
      s.group.position.x += dx * 0.003;
      galleryDragState.velocityY = dy * 0.5;
    } else if (isScrollTunnel) {
      // Scroll tunnel: drag Y moves camera through tunnel (Z-axis)
      s.targetScrollZ -= dy * 0.02;
      // Subtle X parallax
      s.group.position.x += dx * 0.003;
      galleryDragState.velocityY = dy * 0.5;
    } else if (isNarrativeStory) {
      // Narrative Story: drag Y scrolls through Z-axis story, X adds subtle tilt
      s.targetScrollZ -= dy * 0.025;
      s.targetRotationX = Math.max(-0.12, Math.min(0.12, s.targetRotationX + dx * 0.002));
      galleryDragState.velocityY = dy * 0.5;
    } else if (isCodexList) {
      // Codex: drag Y scrolls through text list (lerp-based)
      s.targetScrollY -= dy * 0.018;
      // No clamp — infinite scroll via modulo recycling
      galleryDragState.velocityY = dy * 0.5;
    } else if (isArtifactGallery) {
      // Artifact Gallery: subtle mouse-follow parallax (handled in animate loop)
      // Drag shifts group position slightly for tactile feel
      if (s.group) {
        s.group.position.x += dx * 0.004;
        s.group.position.y -= dy * 0.004;
      }
    } else {
      // Arc carousel: horizontal drag rotates
      var delta = dx * 0.008;
      s.targetAngle += delta;
      galleryDragState.velocity = delta;
    }
    galleryDragState.lastX = x;
    galleryDragState.lastY = y;
  };

  var endHandler = function () {
    galleryDragState.isDragging = false;
    canvas.style.cursor = 'grab';
  };

  var wheelHandler = function (e) {
    if (!galleryStageRegistry[currentRoomKey]) return;
    e.preventDefault();
    var s = galleryStageRegistry[currentRoomKey];
    if (!s) return;

    if (isIndrajaalGrid) {
      // ── Indrajaal grid: wheel adds to target position (drag-to-explore feel) ──
      s.targetX -= e.deltaX * 0.5 || 0;
      s.targetY += e.deltaY * 0.5 || 0;
    } else if (isScrollLayout) {
      s.targetScrollY = Math.max(
        -(s.cardCount - 1) * s.cardSpacing * 0.5,
        Math.min(s.cardSpacing * 0.5, s.targetScrollY - e.deltaY * 0.008),
      );
    } else if (isInfiniteDrag) {
      // Wheel adds to velocity for infinite drag
      galleryDragState.velocityY += e.deltaY * 0.05;
      galleryDragState.velocityX += e.deltaX * 0.05;
    } else if (isScrollStory) {
      // Wheel scrolls through story list (Y-axis)
      s.targetScrollY -= e.deltaY * 0.015;
      // No clamp — infinite scroll via modulo
    } else if (isScrollTunnel) {
      // Wheel scrolls through tunnel (Z-axis)
      s.targetScrollZ -= e.deltaY * 0.015;
      // No clamp — camera moves freely through tunnel
    } else if (isNarrativeStory) {
      // Wheel scrolls through Z-axis story
      s.targetScrollZ -= e.deltaY * 0.012;
    } else if (isCodexList) {
      // Wheel scrolls through text list
      s.targetScrollY -= e.deltaY * 0.01;
    } else if (isArtifactGallery) {
      // Wheel subtly shifts group for parallax feel
      if (s.group) s.group.position.y -= e.deltaY * 0.002;
    } else if (isHelixLayout) {
      s.targetRotationY += e.deltaY * 0.003;
    } else if (isGridLayout) {
      if (s.targetPage !== undefined) {
        s.targetPage -= e.deltaY * 0.002;
      } else {
        s.targetRotationY += e.deltaY * 0.002;
      }
    } else {
      s.targetAngle += e.deltaY * 0.002;
    }
  };

  // Mouse-move for Artifact Gallery parallax + Codex hover
  var mouseMoveHandler = function (e) {
    var s = galleryStageRegistry[currentRoomKey];
    if (!s) return;
    var rect = canvas.getBoundingClientRect();
    var mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    var my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    if (isArtifactGallery) {
      s.targetRotY = mx * 0.08;
      s.targetRotX = my * 0.04;
    }
    if (isCodexList && s.hoverPlane) {
      // Raycaster hover detection for codex text entries
      galleryMouse.x = mx;
      galleryMouse.y = my;
      galleryRaycaster.setFromCamera(galleryMouse, camera);
      var hits = galleryRaycaster.intersectObjects(s.planes, false);
      if (hits.length > 0) {
        var hit = hits[0].object;
        if (hit.userData && hit.userData.isTextEntry !== undefined) {
          // Show hover plane next to the text entry
          s.hoverPlane.position.set(hit.position.x + 1.2, hit.position.y, hit.position.z + 0.5);
          s.hoverPlane.material.opacity = Math.min(s.hoverPlane.material.opacity + 0.1, 0.95);
        }
      }
    }
  };
  ListenerRegistry.add('gallery-carousel-mouse', canvas, 'mousemove', mouseMoveHandler);

  canvas.style.cursor = 'grab';
  ListenerRegistry.add('gallery-carousel', canvas, 'mousedown', startHandler);
  // Issue 23: touchstart must be non-passive so the browser knows we may
  // call preventDefault on touchmove (needed for drag-to-rotate gallery).
  ListenerRegistry.add('gallery-carousel', canvas, 'touchstart', startHandler, { passive: false });
  ListenerRegistry.add('gallery-carousel', document, 'mousemove', moveHandler);
  ListenerRegistry.add('gallery-carousel', document, 'touchmove', moveHandler, { passive: false });
  ListenerRegistry.add('gallery-carousel', document, 'mouseup', endHandler);
  ListenerRegistry.add('gallery-carousel', document, 'touchend', endHandler);
  ListenerRegistry.add('gallery-carousel', canvas, 'wheel', wheelHandler, { passive: false });
}

function animateGalleryCarousel() {
  var state = galleryStageRegistry[currentRoomKey];
  if (!state || !state.group) return;

  var layout = state.layout;
  var isIndrajaalGrid = layout === 'asymmetric-gallery';
  var isScrollAnim =
    layout === 'scroll-narrative' ||
    layout === 'vertical' ||
    layout === 'scroll-story' ||
    layout === 'scroll-tunnel' ||
    layout === 'narrative-story' ||
    layout === 'codex-list';
  var isInfiniteDrag = layout === 'infinite-drag-gallery';
  var isScrollStory = layout === 'scroll-story';
  var isScrollTunnel = layout === 'scroll-tunnel';
  var isNarrativeStory = layout === 'narrative-story';
  var isCodexList = layout === 'codex-list';
  var isArtifactGallery = layout === 'artifact-gallery';

  // ── Indrajaal grid: drag-to-explore with LERP + row parallax ──
  if (isIndrajaalGrid) {
    var lerpFactor = 0.085;
    var needsUpdate = false;

    if (galleryDragState.isDragging) {
      needsUpdate = true;
    } else {
      // Inertia
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.targetX += galleryDragState.velocityX * 0.012;
        galleryDragState.velocityX *= 0.93;
        needsUpdate = true;
      }
      if (Math.abs(galleryDragState.velocityY) > 0.001) {
        state.targetY += galleryDragState.velocityY * 0.012;
        galleryDragState.velocityY *= 0.93;
        needsUpdate = true;
      }
    }

    // Clamp to grid bounds
    var maxX = (state.gridW - (camera.right - camera.left)) * 0.5;
    var maxY = (state.gridH - (camera.top - camera.bottom)) * 0.5;
    if (maxX > 0) state.targetX = Math.max(-maxX, Math.min(maxX, state.targetX));
    if (maxY > 0) state.targetY = Math.max(-maxY, Math.min(maxY, state.targetY));

    // LERP
    state.currentX += (state.targetX - state.currentX) * lerpFactor;
    state.currentY += (state.targetY - state.currentY) * lerpFactor;

    // Skip frame update if nothing changed (saves GPU)
    if (!needsUpdate) {
      var diffX = Math.abs(state.targetX - state.currentX);
      var diffY = Math.abs(state.targetY - state.currentY);
      if (diffX < 0.001 && diffY < 0.001) {
        // Still update shader time for subtle animation
        if (state.sharedUniforms) {
          state.sharedUniforms.uTime.value = performance.now() * 0.001;
        }
        return;
      }
    }

    // Apply position with row parallax per plane
    var vel = Math.abs(state.targetX - state.currentX) + Math.abs(state.targetY - state.currentY);

    state.planes.forEach(function (plane) {
      var pm = plane.userData.parallaxMult || 1;
      plane.position.x = plane.baseX + state.currentX * pm;
      plane.position.y = plane.baseY + state.currentY * pm;
    });

    return; // skip default scroll animation
  }

  if (isScrollAnim) {
    // ── Scroll-driven animation: scroll-narrative, vertical, scroll-story ──
    var scrollSpacing = layout === 'scroll-story' ? state.itemSpacing || 2.5 : state.cardSpacing || 3.5;

    // Inertia
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityY) > 0.001) {
        state.targetScrollY += galleryDragState.velocityY * 0.012;
        galleryDragState.velocityY *= 0.93;
      }
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.targetRotationX += galleryDragState.velocityX * 0.003;
        state.targetRotationX *= 0.93;
      }
    }

    // Clamp
    var maxScr = (state.cardCount - 1) * scrollSpacing * 0.5;
    state.targetScrollY = Math.max(-maxScr, Math.min(maxScr * 0.5, state.targetScrollY));
    state.targetRotationX = Math.max(-0.15, Math.min(0.15, state.targetRotationX));

    // Interpolate
    state.scrollY += (state.targetScrollY - state.scrollY) * 0.1;
    state.currentRotationX += (state.targetRotationX - state.currentRotationX) * 0.08;
    state.group.position.y = state.scrollY;
    state.group.rotation.x = state.currentRotationX;

    // Fade cards based on distance from center
    state.planes.forEach(function (plane) {
      var cardY = plane.userData.baseY + state.scrollY;
      var distFromCenter = Math.abs(cardY);
      var normalizedDist = Math.min(distFromCenter / (scrollSpacing * 2), 1);
      if (plane.material) {
        plane.material.opacity = 0.95 * (1 - normalizedDist * 0.7);
      }
    });

    // ── Scroll-story specific: LERP scroll + modulo recycling + opacity ──
    if (isScrollStory) {
      var lerp = state.lerpFactor || 0.1;
      var prev = state.currentScrollY;
      // Core LERP: current += (target - current) * factor
      state.currentScrollY += (state.targetScrollY - state.currentScrollY) * lerp;
      // Scroll velocity for shader
      var velocity = state.currentScrollY - prev;
      // Apply scroll to group Y position
      state.group.position.y = state.currentScrollY;
      // Modulo recycling: wrap items that exit viewport
      var totalH = state.totalHeight;
      var halfH = totalH / 2;
      state.planes.forEach(function (plane) {
        if (!plane.userData) return;
        var y = plane.userData.initialY + state.currentScrollY;
        // Modulo wrap for infinite scroll
        y = ((y + halfH) % totalH) - halfH;
        plane.position.y = y;
        // Opacity based on distance from center (hover revelation)
        var dist = Math.abs(y);
        var t = Math.min(dist / (state.itemSpacing * 2.0), 1.0);
        var opacity = 1.0 - t * t * (3.0 - 2.0 * t); // smoothstep
        if (plane.material && plane.material.opacity !== undefined) {
          plane.material.opacity = opacity;
        }
      });
      // Update shader uniforms
      if (state.sharedUniforms) {
        state.sharedUniforms.uTime.value = performance.now() * 0.001;
        state.sharedUniforms.uScrollY.value = state.currentScrollY;
        state.sharedUniforms.uVelocity.value = velocity;
      }
    }
    // ── Scroll-tunnel specific: move camera through Z-axis tunnel ──
    if (isScrollTunnel) {
      var prevZ = state.scrollZ;
      state.scrollZ += (state.targetScrollZ - state.scrollZ) * 0.08;
      var scrollVelocity = state.scrollZ - prevZ;
      // Move camera through tunnel
      if (camera) {
        camera.position.z = state.scrollZ;
      }
      // Subtle floating
      var time = performance.now() * 0.001;
      if (camera) {
        camera.position.y = Math.sin(time * 0.5) * 0.03;
      }
      // Update shader uniforms
      if (state.sharedUniforms) {
        state.sharedUniforms.uTime.value = time;
        state.sharedUniforms.uScrollZ.value = state.scrollZ;
        state.sharedUniforms.uFov.value = state.fov || 60;
      }
      // Opacity based on Z distance from camera
      state.planes.forEach(function (plane) {
        if (!plane.userData) return;
        var relZ = Math.abs(plane.userData.baseZ - state.scrollZ);
        var t = Math.min(relZ / (state.tunnelLength * 0.35), 1.0);
        var opacity = 1.0 - t * t * (3.0 - 2.0 * t);
        if (plane.material && plane.material.opacity !== undefined) {
          plane.material.opacity = opacity;
        }
      });
    }
  } else if (isNarrativeStory) {
    // ── Narrative Story: Z-axis scroll with floating oscillation + shader ──
    var _nsTime = performance.now() * 0.001;
    // Inertia
    if (!galleryDragState.isDragging && Math.abs(galleryDragState.velocityY) > 0.001) {
      state.targetScrollZ += galleryDragState.velocityY * 0.015;
      galleryDragState.velocityY *= 0.92;
    }
    // Lerp scrollZ
    state.scrollZ += (state.targetScrollZ - state.scrollZ) * 0.08;
    // Move camera through Z-axis tunnel
    if (camera) camera.position.z = 5 + state.scrollZ;
    // Floating oscillation on each card
    state.planes.forEach(function (plane) {
      if (!plane.userData) return;
      var baseZ = plane.userData.baseZ;
      var float = Math.sin(_nsTime * (state.floatAmp || 0.8) + plane.userData.galleryIndex * 1.2) * 0.06;
      plane.position.z = baseZ + state.scrollZ + float;
      // Fade based on distance from camera
      var dist = Math.abs(plane.position.z - camera.position.z);
      var t = Math.min(dist / 8, 1);
      if (plane.material) plane.material.opacity = 0.95 * (1 - t * t);
    });
    // Update shader uniforms
    if (state.sharedUniforms) {
      state.sharedUniforms.uTime.value = _nsTime;
      state.sharedUniforms.uScrollZ.value = state.scrollZ;
    }
  } else if (isCodexList) {
    // ── Codex: LERP scroll + modulo recycling + hover plane ──
    var _cdLerp = state.lerpFactor || 0.12;
    state.scrollY += (state.targetScrollY - state.scrollY) * _cdLerp;
    // Modulo recycling for infinite scroll
    var _cdTotalH = state.totalHeight || state.cardCount * (state.itemSpacing || 1.8);
    var _cdHalfH = _cdTotalH / 2;
    state.planes.forEach(function (plane) {
      if (!plane.userData) return;
      var y = plane.userData.baseY + state.scrollY;
      y = ((y + _cdHalfH) % _cdTotalH) - _cdHalfH;
      plane.position.y = y;
      var dist = Math.abs(y);
      var t = Math.min(dist / ((state.itemSpacing || 1.8) * 2), 1);
      if (plane.material) plane.material.opacity = 0.95 * (1 - t * t);
    });
    // Hover plane: find closest text entry to mouse and show its image
    if (state.hoverPlane && state.hoverPlane.material) {
      state.hoverPlane.material.opacity *= 0.9; // fade out when not hovering
    }
  } else if (isArtifactGallery) {
    // ── Artifact Gallery: mouse parallax + glass shader hover ──
    var _agTime = performance.now() * 0.001;
    // Smooth parallax rotation
    state.currentRotY += (state.targetRotY - state.currentRotY) * 0.05;
    state.currentRotX += (state.targetRotX - state.currentRotX) * 0.05;
    state.group.rotation.y = state.currentRotY;
    state.group.rotation.x = state.currentRotX;
    // Subtle floating
    state.group.position.y = Math.sin(_agTime * 0.3) * 0.02;
    // Update hover shader uniforms
    state.planes.forEach(function (plane) {
      if (!plane.material || !plane.material.uniforms) return;
      if (plane.material.uniforms.uHover) {
        plane.material.uniforms.uHover.value *= 0.92; // fade hover out
      }
    });
  } else if (isInfiniteDrag) {
    // ── Infinite drag gallery: X + Y velocity with friction, infinite wrap ──
    var friction = 0.95;
    var vpW = camera.right - camera.left;
    var vpH = camera.top - camera.bottom;
    var thresholdX = vpW / 2 + state.cardW * 0.5 + state.spacing;
    var thresholdY = vpH / 2 + state.cardH * 0.5 + state.spacing;
    var totalW = state.gridTotalW + state.spacing;
    var totalH = state.gridTotalH + state.spacing;

    // Apply velocity to group position
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.group.position.x += galleryDragState.velocityX * 0.008;
        galleryDragState.velocityX *= friction;
      }
      if (Math.abs(galleryDragState.velocityY) > 0.001) {
        state.group.position.y += galleryDragState.velocityY * 0.008;
        galleryDragState.velocityY *= friction;
      }
    }

    // Infinite wrap: reposition meshes that exit viewport
    var cam = camera;
    var vpLeft = cam.position.x + cam.left;
    var vpRight = cam.position.x + cam.right;
    var vpTop = cam.position.y + cam.top;
    var vpBottom = cam.position.y + cam.bottom;
    var tmpVec = new THREE.Vector3();

    state.planes.forEach(function (plane) {
      if (!plane.userData) return;
      plane.getWorldPosition(tmpVec);
      if (tmpVec.x > vpRight + thresholdX) {
        plane.userData.baseX -= totalW;
        plane.position.x = plane.userData.baseX;
      } else if (tmpVec.x < vpLeft - thresholdX) {
        plane.userData.baseX += totalW;
        plane.position.x = plane.userData.baseX;
      }
      plane.getWorldPosition(tmpVec);
      if (tmpVec.y > vpTop + thresholdY) {
        plane.userData.baseY -= totalH;
        plane.position.y = plane.userData.baseY;
      } else if (tmpVec.y < vpBottom - thresholdY) {
        plane.userData.baseY += totalH;
        plane.position.y = plane.userData.baseY;
      }
    });

    // Update shader uniforms
    if (state.useShader && state.sharedUniforms) {
      var speed = Math.sqrt(
        galleryDragState.velocityX * galleryDragState.velocityX +
          galleryDragState.velocityY * galleryDragState.velocityY,
      );
      state.sharedUniforms.uTime.value = performance.now() * 0.001;
      state.sharedUniforms.uVelocity.value = speed;
    }
  } else if (layout === 'helix' || layout === 'scroll-narrative') {
    // ── Helix / scroll-narrative animation ──
    // If scrollDriven, the scroll-narrative uses the scroll loop above (isScrollAnim).
    // This branch handles helix and scroll-narrative drag-to-rotate.
    // Drag X rotates around the helix, drag Y scrolls up/down through spiral.
    var _hr = state.helixRadius || 5;
    var _hp = state.helixPitch || 2.8;
    var _ht = state.totalAngle || 2.5 * Math.PI * 2;

    // Inertia
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.targetRotationY += galleryDragState.velocityX * 0.004;
        galleryDragState.velocityX *= 0.94;
      }
      if (Math.abs(galleryDragState.velocityY) > 0.001) {
        state.targetScrollY -= galleryDragState.velocityY * 0.008;
        galleryDragState.velocityY *= 0.94;
      }
    }

    // Clamp: scrollY maps to angular offset within the helix
    var _halfSpan = (_ht / (Math.PI * 2)) * _hp * 0.5;
    state.targetScrollY = Math.max(-_halfSpan, Math.min(_halfSpan, state.targetScrollY));

    // Smooth interpolation
    state.currentRotationY += (state.targetRotationY - state.currentRotationY) * 0.08;
    state.currentScrollY += (state.targetScrollY - state.currentScrollY) * 0.1;

    // Apply rotation to whole group (spins the helix)
    state.group.rotation.y = state.currentRotationY;
    // Apply vertical offset to whole group
    state.group.position.y = state.currentScrollY;

    // Fade cards based on angular distance from front-facing position
    state.planes.forEach(function (plane) {
      var _baseAngle = plane.userData.baseAngle || 0;
      var _cardY = plane.userData.baseY || 0;
      var _angleInHelix = _baseAngle + state.currentRotationY;
      var _yInHelix = _cardY + state.currentScrollY;
      // Fade based on how far from center Y
      var _distY = Math.abs(_yInHelix);
      var _norm = Math.min(_distY / (_halfSpan * 0.8 + 0.01), 1);
      if (plane.material) {
        plane.material.opacity = 0.95 * (1 - _norm * 0.6);
      }
    });
  } else if (layout === 'grid' || layout === 'masonry-featured') {
    // ── Grid / masonry-featured animation ──
    // Horizontal drag/scroll pages through the grid.
    var _gz = state.gridSpacingX || 3.2;

    // Inertia
    if (!galleryDragState.isDragging) {
      if (Math.abs(galleryDragState.velocityX) > 0.001) {
        state.targetPage -= galleryDragState.velocityX * 0.003;
        galleryDragState.velocityX *= 0.92;
      }
    }

    // Clamp to page bounds (continuous — can scroll smoothly between pages)
    var _maxPage = Math.max(0, (state.totalPages || 1) - 1);
    state.targetPage = Math.max(-0.5, Math.min(_maxPage + 0.5, state.targetPage));

    // Smooth interpolation of Z position (pages are 20 units apart in Z)
    state.currentZ += (state.targetPage * -20 - state.currentZ) * 0.08;
    state.currentPage = Math.round(state.targetPage);

    // Apply Z translation to group (slides pages in/out)
    state.group.position.z = state.currentZ;

    // Fade cards based on Z distance from camera (current page = fully visible)
    state.planes.forEach(function (plane) {
      var _pd = plane.userData.pageDepth || 0;
      var _zd = Math.abs(_pd - state.currentZ);
      var _gridNorm = Math.min(_zd / 15, 1);
      if (plane.material) {
        plane.material.opacity = 0.95 * (1 - _gridNorm * 0.85);
      }
    });
  } else {
    // ── Arc carousel animation (original) ──
    // Apply inertia when not dragging
    if (!galleryDragState.isDragging && Math.abs(galleryDragState.velocity) > 0.0001) {
      state.targetAngle += galleryDragState.velocity;
      galleryDragState.velocity *= 0.95;
    }
    // Smooth rotation
    state.currentAngle += (state.targetAngle - state.currentAngle) * 0.08;
    var count = state.planes.length;
    if (count < 2) return;
    var arcDegrees = state.arcDegrees || 140;
    var radius = state.radius || 7;
    var step = arcDegrees / (count - 1);
    var startAngle = -arcDegrees / 2;
    state.planes.forEach(function (plane, index) {
      var baseAngle = startAngle + step * index;
      var angleDeg = baseAngle + state.currentAngle * (180 / Math.PI);
      var rad = (angleDeg * Math.PI) / 180;
      var x = Math.sin(rad) * radius;
      var z = Math.cos(rad) * radius * -1;
      plane.position.x = x;
      plane.position.z = z;
    });
  }
}

var galleryRaycaster = new (window.THREE ? window.THREE.Raycaster : function () {})();
var galleryMouse = new (window.THREE ? window.THREE.Vector2 : function () {})();

function handleGalleryStageClick(event, camera, canvas) {
  // Issue 9: Don't process gallery clicks if user clicked a hotspot or UI element
  if (
    event.target &&
    event.target.closest(
      '[data-hotspot-btn], .immersive-header, .immersive-fab, .immersive-guided-prompt, .immersive-room-badge, .immersive-flash-sale-banner',
    )
  )
    return;
  if (!currentRoomKey || !galleryStageRegistry[currentRoomKey]) return;
  if (!window.THREE) return;

  var state = galleryStageRegistry[currentRoomKey];
  if (!state.planes || !state.planes.length) return;

  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX - rect.left) / rect.width;
  var y = (event.clientY - rect.top) / rect.height;
  galleryMouse.x = x * 2 - 1;
  galleryMouse.y = -(y * 2 - 1);

  galleryRaycaster.setFromCamera(galleryMouse, camera);
  var intersects = galleryRaycaster.intersectObjects(state.planes, true);
  if (!intersects.length) return;
  var mesh = intersects[0].object;
  var data = mesh.userData || {};

  if (data.productHandle && typeof window.openProductPanel === 'function') {
    window.openProductPanel(data.productHandle);
  } else if (data.collectionHandle && typeof window.openCollectionPanel === 'function') {
    window.openCollectionPanel(data.collectionHandle);
  }
}

// ---------------------------------------------------------------------------
// HOTSPOT CONFIGURATION
// ---------------------------------------------------------------------------

function getLiquidRoomConfig() {
  var configEl = document.getElementById('immersive-rooms-config');
  if (!configEl) return null;
  try {
    return JSON.parse(configEl.textContent);
  } catch (e) {
    // Silently fail for production
    return null;
  }
}

function getRoomConfigWithLiquidOverride(roomKey) {
  var jsConfig = STORE_ROOMS[roomKey];
  if (!jsConfig) return null;

  var liquidConfig = getLiquidRoomConfig();
  if (!liquidConfig || !liquidConfig[roomKey]) return jsConfig;

  var liquid = liquidConfig[roomKey];
  var merged = {};

  Object.keys(jsConfig).forEach(function (key) {
    merged[key] = jsConfig[key];
  });

  ['baseTextureUrl', 'mobileBaseTextureUrl', 'depthMapUrl', 'mobileDepthMapUrl', 'hotspots'].forEach(function (key) {
    if (
      liquid[key] != null &&
      liquid[key] !== '' &&
      !(typeof liquid[key] === 'string' && liquid[key].indexOf('null') !== -1)
    ) {
      merged[key] = liquid[key];
    }
  });

  return merged;
}

function getRoomData(roomKey) {
  var room =
    typeof getRoomConfigWithLiquidOverride === 'function'
      ? getRoomConfigWithLiquidOverride(roomKey)
      : STORE_ROOMS[roomKey];

  if (!room) {
    // Room config missing - silently skip
    return null;
  }

  return room;
}

var renderer;
var scene;
var camera;
var planeMesh;
var uniforms;
var currentRoomKey = null;
var currentRoomSubMode = null;
var transitioning = false;
var currentImageAspect = 16 / 9;
var activeTextureVariant = null; // 'mobile' | 'desktop' — tracks which room asset pair is on the plane
var lastResizeDims = { w: 0, h: 0, dpr: 0 };

function getTextureVariantKey() {
  return usesMobileImg ? 'mobile' : 'desktop';
}

function syncImageAspectFromTexture(texture) {
  if (texture && texture.image && texture.image.width && texture.image.height) {
    currentImageAspect = texture.image.width / texture.image.height;
    return true;
  }
  return false;
}

function applyRoomTexturesToScene(baseTexture, depthTexture, roomKey) {
  if (!uniforms || !baseTexture || !depthTexture) return;
  uniforms.uTexture1.value = baseTexture;
  uniforms.uDepth1.value = depthTexture;
  uniforms.uTexture2.value = baseTexture;
  uniforms.uDepth2.value = depthTexture;
  uniforms.uTransitionProgress.value = 0;
  syncImageAspectFromTexture(baseTexture);
  activeTextureVariant = getTextureVariantKey();
  lastResizeDims.w = 0;
  lastResizeDims.h = 0;
  lastResizeDims.dpr = 0;
  handleResize(roomKey || currentRoomKey);
}

function reloadCurrentRoomTextures() {
  if (!currentRoomKey) return;
  var roomData = getRoomTextureUrls(currentRoomKey);
  if (!roomData) return;
  loadRoomTextures(roomData, function (baseTexture, depthTexture) {
    applyRoomTexturesToScene(baseTexture, depthTexture, currentRoomKey);
    hideInitialLoader();
  });
}

var textureCache = [];
var textureRefCount = {};
var MAX_CACHED_TEXTURES = 5;
var galleryStageRegistry = {};

// ─────────────────────────────────────────────────────────────────────────────
// Animation Frame Scheduler - tracks all rAF calls for cleanup
// ─────────────────────────────────────────────────────────────────────────────
var _rafIds = [];
function scheduleRaf(callback) {
  var id = requestAnimationFrame(callback);
  _rafIds.push(id);
  return id;
}
function cancelAllRafs() {
  _rafIds.forEach(function (id) {
    cancelAnimationFrame(id);
  });
  _rafIds = [];
}

function getGalleryStageConfig(roomKey) {
  if (!window.immersiveWebglGalleryConfigs) return [];
  return window.immersiveWebglGalleryConfigs[roomKey] || [];
}

// Returns the gallery layout mode for a room key.
// 'vertical' = indrajaal-museum homepage style (scroll-driven vertical stack)
// 'arc' = original horizontal carousel (default fallback)
function getGalleryLayout(roomKey) {
  // 1. Read from immersive-canvas per-room layout settings (data-* attributes)
  var canvasSection = document.querySelector('.immersive-store');
  if (canvasSection) {
    var perRoomAttr = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
    var perRoomLayout = canvasSection.getAttribute(perRoomAttr);
    if (perRoomLayout) return perRoomLayout;
  }

  // 2. Read from immersive-webgl-gallery-config sections
  if (window.immersiveWebglGalleryLayouts && window.immersiveWebglGalleryLayouts[roomKey]) {
    return window.immersiveWebglGalleryLayouts[roomKey];
  }

  // 3. Fallback per room
  if (roomKey === 'designer_houses') return 'asymmetric-gallery';
  if (roomKey === 'occasions') return 'scroll-narrative';
  if (roomKey === 'featured_collections') return 'masonry-featured';
  return 'arc';
}

function loadGalleryConfigsFromDOM() {
  // Read from [data-immersive-webgl-gallery-config] DOM elements (output by
  // immersive-webgl-gallery-config sections in page.immersive.json).
  // Each section has data-room-key and data-layout attributes.
  var configEls = document.querySelectorAll('[data-immersive-webgl-gallery-config]');
  if (configEls.length) {
    window.immersiveWebglGalleryConfigs = {};
    configEls.forEach(function (configEl) {
      var roomKey = configEl.getAttribute('data-room-key') || 'storefront';
      var layout = configEl.getAttribute('data-layout') || null;
      var items = Array.prototype.slice
        .call(configEl.querySelectorAll('.immersive-webgl-gallery-config__item'))
        .map(function (itemEl) {
          var imgEl = itemEl.querySelector('.immersive-webgl-gallery-config__img');
          return {
            index: parseInt(itemEl.dataset.galleryIndex || '0', 10),
            room: itemEl.dataset.galleryRoom || roomKey,
            title: itemEl.dataset.galleryTitle || '',
            subtitle: itemEl.dataset.gallerySubtitle || '',
            productHandle: itemEl.dataset.galleryProductHandle || null,
            productId: itemEl.dataset.galleryProductId || null,
            collectionHandle: itemEl.dataset.galleryCollectionHandle || null,
            imageSrc: imgEl ? imgEl.src : null,
            imageWidth: imgEl ? parseInt(imgEl.getAttribute('width'), 10) || 1920 : 1920,
            imageHeight: imgEl ? parseInt(imgEl.getAttribute('height'), 10) || 1080 : 1080,
          };
        });
      window.immersiveWebglGalleryConfigs[roomKey] = items;
      // Store layout per-room so getGalleryLayout() can read it
      if (layout) {
        window.immersiveWebglGalleryLayouts = window.immersiveWebglGalleryLayouts || {};
        window.immersiveWebglGalleryLayouts[roomKey] = layout;
      }
    });
  }

  if (window.__IMMERSIVE_DEV__ && window.immersiveWebglGalleryConfigs) {
    var rooms = Object.keys(window.immersiveWebglGalleryConfigs).join(', ');
    var counts = {};
    Object.keys(window.immersiveWebglGalleryConfigs).forEach(function (k) {
      counts[k] = window.immersiveWebglGalleryConfigs[k].length;
    });
    console.log('[Immersive] Gallery configs loaded for rooms:', rooms, 'counts:', JSON.stringify(counts));
  }
}

var lastFrameTime = typeof performance !== 'undefined' ? performance.now() : 0;
var fpsCounter = 0;
var fpsTimer = typeof performance !== 'undefined' ? performance.now() : 0;
var animationFrameId = null;

var immersiveCanvasId = 'immersive-canvas';
var uiLayerId = 'ui-layer';
var glassPanelId = 'glass-panel';

var _immersiveInitBound = false;

var contentCache = {};
var contentCacheOrder = [];
var MAX_CACHE_ENTRIES = 20;
var CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute TTL for cached entries

// Runtime state — mirrors ShahanaImmersive.room for backward compatibility.
// Prefer ShahanaImmersive.room for new code; immersiveState is kept for existing callers.
var immersiveState = {
  currentRoom: 'lounge',
  mode: 'showroom',
  editorialRoom: null,
  lastHotspot: null,
  guided: false,
};

var shopRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
if (shopRoot.slice(-1) !== '/') shopRoot += '/';

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var isMobile = null;
var isTablet = null;
var usesMobileImg = null;
var canvasRect = null;

function evaluateDeviceFlags() {
  // Use actual device type from initDeviceOptimization, not viewport width
  // This prevents loading mobile images on desktop browsers with narrow windows
  var actualDeviceIsMobile = /iPhone|iPad|Android|Mobile/.test(navigator.userAgent);
  var actualDeviceIsTablet = /iPad|Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);

  // Only use viewport width as a secondary factor for responsive layout
  // but don't override the actual device type detection
  // Ensure we're setting global variables properly
  window.isMobile = actualDeviceIsMobile || window.innerWidth < 480;
  window.isTablet = actualDeviceIsTablet || (window.innerWidth >= 480 && window.innerWidth < 768);

  var connectionQuality = 1.0;
  if ('connection' in navigator && navigator.connection) {
    var effType = navigator.connection.effectiveType;
    var qualityMap = {
      'slow-2g': 0.5,
      '2g': 0.5,
      '3g': 0.75,
      '4g': 1.0,
    };
    connectionQuality = qualityMap[effType] || 1.0;

    if (navigator.connection.saveData) {
      connectionQuality = Math.min(connectionQuality, 0.5);
    }

    // Connection quality tracked silently
  }

  usesMobileImg = window.innerWidth < 1024 || connectionQuality < 0.75;
  textureWidth = usesMobileImg ? Math.floor(1200 * connectionQuality) : Math.floor(1920 * connectionQuality);
}

function updateCanvasRect() {
  if (renderer && renderer.domElement) {
    canvasRect = renderer.domElement.getBoundingClientRect();
  }
}

evaluateDeviceFlags();

var textureWidth = usesMobileImg ? 1200 : 1920;
var parallaxStrength = usesMobileImg ? 0.06 : 0.1;

var STATE_KEY = 'immersive_state';
var ONBOARDING_KEY = 'immersive_onboarding_seen';
var WISHLIST_KEY = 'immersive_wishlist';
// NOTE: localStorage stores UI state only (wishlist handles, browsing signals).
// No authentication tokens, personal data, or payment information is stored.
// These stores are accessible to any same-origin script per browser security model.
var PREFERRED_MODE_KEY = 'immersive_preferred_mode';

var _wishlistItems = [];
var _wishlistProductCache = {};
var wishlistPanelTrigger = null;
var activeHotspots = [];
var navigationHistory = [];

function saveState(patch) {
  saveImmersiveSessionState(patch);
}

function loadState() {
  return loadImmersiveSessionState();
}

function clearState() {
  clearImmersiveSessionState();
}

function writeImmersivePreference(storage) {
  try {
    (storage || localStorage).setItem(PREFERRED_MODE_KEY, '3d');
  } catch (e) {}
}

function clearImmersivePreference(storage) {
  try {
    (storage || localStorage).removeItem(PREFERRED_MODE_KEY);
  } catch (e) {}
}

function readImmersivePreference(storage) {
  try {
    return (storage || localStorage).getItem(PREFERRED_MODE_KEY) === '3d';
  } catch (e) {
    return false;
  }
}

var _navigationHistory = [];

function pushNavigationHistory(roomKey) {
  if (!roomKey) return;
  if (_navigationHistory.length > 0 && _navigationHistory[_navigationHistory.length - 1] === roomKey) {
    return;
  }
  _navigationHistory.push(roomKey);
  if (_navigationHistory.length > 20) {
    _navigationHistory.shift();
  }
  _saveNavHistory(_navigationHistory);
  updateBackButton();
}

function popNavigationHistory() {
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] popNavigationHistory - before:', JSON.stringify(_navigationHistory));
  }
  if (_navigationHistory.length > 1) {
    _navigationHistory.pop();
    _saveNavHistory(_navigationHistory);
    updateBackButton();
    var previousRoom = _navigationHistory[_navigationHistory.length - 1];
    if (window.__IMMERSIVE_DEV__) {
      console.log(
        '[Immersive] popNavigationHistory - after:',
        JSON.stringify(_navigationHistory),
        'returning:',
        previousRoom,
      );
    }
    return previousRoom;
  }
  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] popNavigationHistory - no history to pop');
  }
  return null;
}

// initWishlist is defined in immersive-features.js (more complete version)
// Kept here as a no-op in case something calls it before features loads.
function initWishlist() {
  // Delegated to immersive-features.js initWishlist (uses _wishlistItems)
}

function saveNavigationHistory() {
  _saveNavHistory(_navigationHistory);
}

function _loadNavHistory() {
  try {
    var sm = _sm();
    if (sm) {
      var stored = sm.get('immersive.navigation.history');
      if (Array.isArray(stored)) return stored;
    }
    return [];
  } catch (e) {
    return [];
  }
}

function updateBackButton() {
  var backBtn = document.querySelector('[data-immersive-back]');
  if (!backBtn) return;
  if (!_navigationHistory || _navigationHistory.length > 1) {
    backBtn.hidden = false;
    backBtn.disabled = false;
  } else {
    backBtn.hidden = true;
    backBtn.disabled = true;
  }
}

function initBackButton() {
  var backBtn = document.querySelector('[data-immersive-back]');
  if (!backBtn) return;
  _navigationHistory = _loadNavHistory();
  updateBackButton();
  backBtn.addEventListener('click', function () {
    if (window.__IMMERSIVE_DEV__) {
      console.log('[Back] Clicked, mode:', immersiveState.mode, 'history length:', _navigationHistory.length);
    }
    if (immersiveState.mode === 'editorial') {
      // Exiting editorial mode
      exitEditorialMode();
      return;
    }
    var panel = document.getElementById(glassPanelId);
    if (panel && !panel.hasAttribute('hidden')) {
      closePanel(panel);
    }
    var previousRoom = popNavigationHistory();
    if (previousRoom && typeof goToRoom === 'function') {
      goToRoom(previousRoom, false, true);
    }
  });
}

function initFab() {
  var fab = document.querySelector('[data-immersive-fab]');
  var trigger = fab && fab.querySelector('[data-fab-trigger]');
  var actionsContainer = fab && fab.querySelector('[data-fab-actions]');
  if (!fab || !trigger || !actionsContainer) return;

  var isOpen = false;
  // Issue 7: Shared drag state between mousedown/mousemove/mouseup
  var isDragging = false;
  var hasMoved = false;
  var dragStartX = 0;
  var dragStartY = 0;

  trigger.addEventListener('click', function (e) {
    // Issue 7: If user was dragging (not just clicking), suppress toggle
    if (hasMoved) {
      hasMoved = false;
      isDragging = false;
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    isOpen = !isOpen;
    trigger.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      actionsContainer.removeAttribute('hidden');
      fab.classList.add('immersive-fab--open');
    } else {
      actionsContainer.setAttribute('hidden', '');
      fab.classList.remove('immersive-fab--open');
    }
  });

  var startY, startTopPct, startRight;

  fab.addEventListener('mousedown', function (e) {
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startY = e.clientY;
    var style = window.getComputedStyle(fab);
    var topMatch = style.top.match(/([\d.]+)%/);
    startTopPct = topMatch ? parseFloat(topMatch[1]) : 50;
    var rightMatch = style.right.match(/([\d.]+)px/);
    startRight = rightMatch ? parseFloat(rightMatch[1]) : 20;
    fab.style.transition = 'none';
    fab.style.transform = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dx = Math.abs(e.clientX - dragStartX);
    var dy = Math.abs(e.clientY - dragStartY);
    // Only count as "moved" after 5px threshold
    if (dx > 5 || dy > 5) {
      hasMoved = true;
    }
    var deltaY = startY - e.clientY;
    var windowH = window.innerHeight;
    var newTopPct = startTopPct + (deltaY / windowH) * 100;
    fab.style.top = newTopPct + '%';
    fab.style.right = startRight + 'px';
  });

  document.addEventListener('mouseup', function () {
    if (isDragging) {
      isDragging = false;
      fab.style.transition = '';
      fab.style.transform = 'translateY(-50%)';
    }
  });

  fab.addEventListener('click', function (e) {
    // Issue 2: Wishlist FAB button should open the wishlist panel, not click
    // an arbitrary [data-wishlist-toggle] on the page (which could be a
    // product card toggle inside an open collection panel).
    var action = e.target.closest('[data-bottom-nav-wishlist]');
    if (action) {
      var wishlistPanel = document.getElementById('immersive-wishlist-panel');
      if (wishlistPanel) {
        // Toggle the wishlist panel visibility
        if (wishlistPanel.hasAttribute('hidden')) {
          wishlistPanel.removeAttribute('hidden');
          var closeBtn = wishlistPanel.querySelector('[data-wishlist-close]');
          if (closeBtn) closeBtn.focus();
        } else {
          wishlistPanel.setAttribute('hidden', '');
        }
      }
      return;
    }
    action = e.target.closest('[data-bottom-nav-cart]');
    if (action) {
      // Issue 2 (cart): Use Dawn's cart-drawer instead of [data-cart-toggle]
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        cartDrawer.open();
      }
      return;
    }
    action = e.target.closest('[data-bottom-nav-2d]');
    if (action) {
      window.location.href = '/';
    }
  });

  fab.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      trigger.setAttribute('aria-expanded', 'false');
      actionsContainer.setAttribute('hidden', '');
      fab.classList.remove('immersive-fab--open');
    }
  });
}

function initStoryModeListener() {
  window.addEventListener('immersive:story-mode-change', function (event) {
    var detail = event && event.detail ? event.detail : {};
    var active = !!detail.active;
    if (currentRoomKey === 'featured_collections') {
      currentRoomSubMode = active ? 'story' : null;
    } else {
      currentRoomSubMode = null;
    }
    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive] Story mode:', currentRoomSubMode);
    }
  });
}

var vertexShaderSource = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

var fragmentShaderSource = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture1;
  uniform sampler2D uDepth1;
  uniform sampler2D uTexture2;
  uniform sampler2D uDepth2;
  uniform float uTransitionProgress;
  uniform vec2 uMouse;
  uniform float uTiltOffsetX;
  uniform float uTiltOffsetY;
  uniform float uParallaxStrength;
  uniform float uScrollOffset;
  uniform float uScrollVignette;
  uniform float uScrollChroma;
  uniform float uAtmosphericMood;
  uniform float uTime;

  float noise(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec2 parallaxUv(vec2 uv, sampler2D depthTex, vec2 mouse) {
    float depthC = dot(texture2D(depthTex, uv).rgb, vec3(0.299, 0.587, 0.114));

    // Screen-space depth gradient — no texel size needed, works at any resolution
    float ddx = dFdx(depthC);
    float ddy = dFdy(depthC);
    float edgeGrad = length(vec2(ddx, ddy));

    // Attenuate parallax at depth discontinuities (prevents ghosting)
    float edgeFade = 1.0 - smoothstep(0.0, 0.12, edgeGrad);

    float d = depthC - 0.5;
    vec2 centeredMouse = mouse - 0.5;

    vec2 tiltOffset = vec2(uTiltOffsetX, uTiltOffsetY);
    vec2 offset = (centeredMouse + tiltOffset) * uParallaxStrength * d * edgeFade;

    float scrollWeight = d + 0.5;
    float backCounterShift = (1.0 - scrollWeight) * -0.08;
    float foreSinkingShift = scrollWeight * 0.25;
    float totalVerticalShift = (foreSinkingShift + backCounterShift) * uScrollOffset;

    return uv + offset + vec2(0.0, totalVerticalShift);
  }

  void main() {
    vec2 uv1 = parallaxUv(vUv, uDepth1, uMouse);
    vec2 uv2 = parallaxUv(vUv, uDepth2, uMouse);

    float chroma = uScrollChroma * 0.008;
    vec4 color1, color2;
    if (chroma > 0.0001) {
      vec2 rOffset = vec2(chroma, 0.0);
      vec2 bOffset = vec2(-chroma, 0.0);
      color1 = vec4(
        texture2D(uTexture1, uv1 + rOffset).r,
        texture2D(uTexture1, uv1).g,
        texture2D(uTexture1, uv1 + bOffset).b,
        1.0
      );
      color2 = vec4(
        texture2D(uTexture2, uv2 + rOffset).r,
        texture2D(uTexture2, uv2).g,
        texture2D(uTexture2, uv2 + bOffset).b,
        1.0
      );
    } else {
      color1 = texture2D(uTexture1, uv1);
      color2 = texture2D(uTexture2, uv2);
    }

    float t = clamp(uTransitionProgress, 0.0, 1.0);
    vec4 color = mix(color1, color2, t);

    float breathing = sin(uTime * 0.8) * 0.015 + 0.985;
    color.rgb *= breathing;

    float n = noise(vUv + fract(uTime));
    color.rgb += (n - 0.5) * 0.012;

    vec2 vigUv = vUv * 2.0 - 1.0;
    float vignette = 1.0 - dot(vigUv * vec2(0.6, 0.8), vigUv * vec2(0.6, 0.8));
    vignette = clamp(vignette, 0.0, 1.0);
    float vigStrength = 0.18 + uScrollVignette * 0.32;
    color.rgb *= mix(1.0 - vigStrength, 1.0, pow(vignette, 1.4));

    vec3 moodColor = vec3(1.1, 1.05, 0.9);
    color.rgb = mix(color.rgb, color.rgb * moodColor, uAtmosphericMood);

    gl_FragColor = color;
  }
`;

function getRoomTextureUrls(roomKey) {
  var room = getRoomData(roomKey);
  if (!room) {
    // Room definition not found - silently skip
    return null;
  }

  var mobile = usesMobileImg;
  var baseUrl = mobile && room.mobileBaseTextureUrl ? room.mobileBaseTextureUrl : room.baseTextureUrl;
  var depthUrl = mobile && room.mobileDepthMapUrl ? room.mobileDepthMapUrl : room.depthMapUrl;

  return { roomKey: roomKey, baseTextureUrl: baseUrl || null, depthMapUrl: depthUrl || null, hotspots: room.hotspots };
}

function preloadAdjacentRoomTextures(currentRoomKey) {
  var room = getRoomData(currentRoomKey);
  if (!room || !room.hotspots || !room.hotspots.length) return;

  var neighborKeys = new Set();

  room.hotspots.forEach(function (hotspot) {
    if (hotspot.targetRoom) {
      neighborKeys.add(hotspot.targetRoom);
    }
  });

  if (!neighborKeys.size) return;

  var preloadFn = function () {
    neighborKeys.forEach(function (roomKey) {
      var neighborData = getRoomTextureUrls(roomKey);
      if (!neighborData) return;
      loadRoomTextures(neighborData, function () {});
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadFn, { timeout: 1000 });
  } else {
    setTimeout(preloadFn, 250);
  }
}

function preloadRoom(roomKey) {
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) return;
  var cacheKey = roomData.baseTextureUrl + '|' + roomData.depthMapUrl;

  var isCached = textureCache.some(function (entry) {
    return entry && entry.key === cacheKey;
  });

  if (isCached) return;
  loadRoomTextures(roomData, function () {});
}

function showWelcomeToast() {
  try {
    if (hasSeenOnboarding()) return;
  } catch (e) {}
  // Issue 25: If onboarding overlay is present and enabled, skip welcome toast (redundant)
  var _ob = document.getElementById('immersive-onboarding');
  if (_ob && !_ob.hasAttribute('hidden') && _ob.getAttribute('data-show-once') !== 'false') return;
  var section = document.querySelector('[data-msg-welcome-toast]');
  var msg = section && section.getAttribute('data-msg-welcome-toast');
  if (!msg) return;
  var wrapper = document.querySelector('.immersive-store__canvas-wrapper');
  if (!wrapper) return;
  var toast = document.createElement('div');
  toast.className = 'immersive-welcome-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  if (!reduceMotion) toast.classList.add('immersive-welcome-toast--animate-in');

  var textSpan = document.createElement('span');
  textSpan.className = 'immersive-welcome-toast__text';
  textSpan.textContent = msg;

  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'immersive-welcome-toast__close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  toast.appendChild(textSpan);
  toast.appendChild(closeBtn);
  wrapper.appendChild(toast);
  var timer = setTimeout(function () {
    _dismissWelcomeToast(toast);
  }, 5000);
  closeBtn.addEventListener('click', function () {
    clearTimeout(timer);
    _dismissWelcomeToast(toast);
  });
}

function _dismissWelcomeToast(toast) {
  if (!toast || !toast.parentNode) return;
  if (reduceMotion) {
    toast.remove();
    return;
  }
  toast.classList.remove('immersive-welcome-toast--animate-in');
  toast.classList.add('immersive-welcome-toast--animate-out');
  setTimeout(function () {
    if (toast.parentNode) toast.remove();
  }, 300);
}

function initImmersiveScene() {
  var canvas = document.getElementById(immersiveCanvasId);
  var uiLayer = document.getElementById(uiLayerId);
  if (!canvas || !uiLayer) return;

  // Load fallback textures from data attributes before scene setup
  var fallbackWrapper = document.querySelector('.immersive-store__canvas-wrapper');
  loadFallbackTextures(fallbackWrapper);

  // Listen for gallery config ready events from data provider sections
  document.addEventListener('immersive:galleryConfigReady', function (evt) {
    var roomKey = evt.detail && evt.detail.roomKey;
    if (!roomKey || roomKey !== currentRoomKey) return;
    if (!getGalleryStageConfig(roomKey).length) return;
    // Dispose old stage if exists
    if (galleryStageRegistry[roomKey]) {
      disposeGalleryStage(roomKey);
    }
    var layout = getGalleryLayout(roomKey);
    // Read semantic layout name from per-room attribute to look up LAYOUT_REGISTRY config
    var sectionEl = document.querySelector('.immersive-store');
    var perRoomAttr = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
    var semanticLayout = sectionEl ? sectionEl.getAttribute(perRoomAttr) : null;
    var layoutConfig =
      semanticLayout && LAYOUT_REGISTRY && LAYOUT_REGISTRY[semanticLayout]
        ? LAYOUT_REGISTRY[semanticLayout].config
        : {};
    buildGalleryStageForRoom(roomKey, scene, {
      layout: layout,
      radius: 6,
      arcDegrees: 120,
      verticalOffset: 0.3,
      tiltDegrees: -3,
      cardSpacing: layoutConfig.spacing || 3.5,
      cardHeight: 2.2,
      cardAspect: 2 / 3,
      layoutConfig: layoutConfig,
    });
    if (renderer && renderer.domElement) {
      initGalleryCarousel(renderer.domElement);
    }
    // Hide hotspot buttons — gallery cards are the interaction
    var _uiLayer2 = document.getElementById('ui-layer');
    if (_uiLayer2) {
      _uiLayer2.querySelectorAll('.immersive-hotspot').forEach(function (btn) {
        btn.style.display = 'none';
      });
    }
    hideInitialLoader();
  });

  if (!window.THREE || !isWebGLSupported()) {
    showWebGLFallback(canvas);
    return;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] WebGL context creation failed:', e);
    showWebGLFallback(canvas);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.isMobile || isMobile ? 1.5 : 2));

  // Use canvas client dimensions so the renderer fills its container exactly
  var initWidth = canvas.clientWidth || window.innerWidth || canvas.offsetWidth;
  var initHeight = canvas.clientHeight || window.innerHeight || canvas.offsetHeight;
  if (initWidth === 0 || initHeight === 0) {
    showWebGLFallback(canvas);
    return;
  }
  renderer.setSize(initWidth, initHeight, false);

  // WebGL context loss recovery
  ListenerRegistry.add('webgl-context-lost', canvas, 'webglcontextlost', function (e) {
    e.preventDefault();
    if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] WebGL context lost');
    showWebGLFallback(canvas);
  });
  ListenerRegistry.add('webgl-context-restored', canvas, 'webglcontextrestored', function () {
    if (window.__IMMERSIVE_DEV__) console.log('[Immersive] WebGL context restored — reinitializing');
    initImmersiveScene();
  });

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;

  var geometry = _safePlaneGeometry(2, 2, 'main-scene-plane');
  var textureLoader = new THREE.TextureLoader();

  var placeholderData = new Uint8Array([0, 0, 0, 255]);
  var placeholder = new THREE.DataTexture(placeholderData, 1, 1);
  placeholder.minFilter = THREE.LinearFilter;
  placeholder.magFilter = THREE.LinearFilter;
  placeholder.needsUpdate = true;

  uniforms = {
    uTexture1: { value: placeholder },
    uDepth1: { value: placeholder },
    uTexture2: { value: placeholder },
    uDepth2: { value: placeholder },
    uTransitionProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uTiltOffsetX: { value: 0 },
    uTiltOffsetY: { value: 0 },
    uParallaxStrength: { value: parallaxStrength },
    uScrollOffset: { value: 0 },
    uScrollVignette: { value: 0 },
    uScrollChroma: { value: 0 },
    uAtmosphericMood: { value: 0 },
  };

  var material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    uniforms: uniforms,
    transparent: false,
  });

  planeMesh = new THREE.Mesh(geometry, material);
  scene.add(planeMesh);

  updateCanvasRect();
  window.addEventListener('mousemove', handleMouseMove);

  bindResizeHandling();
  handleResize();
  startAnimate();

  var canvasEl = renderer.domElement;
  canvasEl.addEventListener('click', function (event) {
    handleGalleryStageClick(event, camera, canvasEl);
  });

  // Global escape handler — exits gallery/editorial mode
  document.addEventListener('keydown', function onEscKey(e) {
    if (e.key === 'Escape' && immersiveState.mode === 'editorial' && immersiveState.editorialRoom) {
      if (typeof exitEditorialMode === 'function') exitEditorialMode();
    }
  });

  var state = loadState();
  var hasOpenPanel = (state.panel === 'product' && state.product) || (state.panel === 'collection' && state.collection);
  var startRoom = hasOpenPanel && state.room && getRoomData(state.room) ? state.room : 'storefront';

  if (!hasOpenPanel) clearState();

  // Load gallery configs from DOM before first room render
  loadGalleryConfigsFromDOM();

  // Also re-read after a short delay to catch sections that render late
  setTimeout(function () {
    loadGalleryConfigsFromDOM();
  }, 100);

  goToRoom(startRoom, true);
  pushNavigationHistory(startRoom);
  writeImmersivePreference();
  updateCameraForMode();

  if (state.panel === 'product' && state.product) {
    setTimeout(function () {
      openProductPanel(state.product, state.collection);
    }, 400);
  } else if (state.panel === 'collection' && state.collection) {
    setTimeout(function () {
      openCollectionPanel(state.collection);
    }, 400);
  }
}

function isWebGLSupported() {
  try {
    var testCanvas = document.createElement('canvas');
    return !!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

function hideInitialLoader() {
  var el = document.getElementById('immersive-initial-loader');
  if (el) el.classList.add('is-hidden');
}

function showWebGLFallback(canvas) {
  hideInitialLoader();
  var room = getRoomData('lounge');
  if (!room) return;
  var wrapper = canvas.parentElement;
  if (!wrapper) return;
  var img = document.createElement('img');
  var _fallbackImgTimeout = setTimeout(function () {
    if (!img.complete) {
      console.warn('[Immersive] Fallback image load timeout:', room.baseTextureUrl);
      img.style.display = 'none';
    }
  }, 30000);
  img.onload = function () {
    clearTimeout(_fallbackImgTimeout);
  };
  img.onerror = function () {
    clearTimeout(_fallbackImgTimeout);
  };
  img.src = room.baseTextureUrl;
  img.alt = '';
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
  wrapper.appendChild(img);
  canvas.style.display = 'none';
  renderHotspots('lounge');
}

// ---------------------------------------------------------------------------
var mouseTarget = { x: 0.5, y: 0.5 };
var mouseCurrent = { x: 0.5, y: 0.5 };
var lerpFactor = 0.08;

function handleMouseMove(event) {
  if (!canvasRect) updateCanvasRect();
  if (!canvasRect) return;
  var rect = canvasRect;
  mouseTarget.x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  mouseTarget.y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  if (Math.abs(mouseTarget.x - 0.5) > 0.01 || Math.abs(mouseTarget.y - 0.5) > 0.01) {
    // Mouse position tracked silently
  }
}

var resizeRaf = null;
var lastMobile = isMobile;
var lastOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';

function onWindowResize() {
  // Coalesce rapid resize events — reschedule RAF so the latest dimensions win
  if (resizeRaf !== null) {
    cancelAnimationFrame(resizeRaf);
  }
  resizeRaf = requestAnimationFrame(function () {
    resizeRaf = null;
    var wasMobile = window.isMobile || isMobile;
    var wasUsesMobileImg = usesMobileImg;
    evaluateDeviceFlags();
    updateCanvasRect();

    var currentOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    var orientationChanged = currentOrientation !== lastOrientation;
    var mobileImgChanged = usesMobileImg !== wasUsesMobileImg;

    // Mobile and desktop room canvases use separate assets — swap when variant changes
    if (mobileImgChanged && currentRoomKey) {
      renderHotspots(currentRoomKey);
      var roomData = getRoomTextureUrls(currentRoomKey);
      if (roomData) {
        loadRoomTextures(roomData, function (baseTexture, depthTexture) {
          applyRoomTexturesToScene(baseTexture, depthTexture, currentRoomKey);
          if (getGalleryStageConfig(currentRoomKey).length) {
            if (galleryStageRegistry[currentRoomKey]) {
              disposeGalleryStage(currentRoomKey);
            }
            var _sectionEl = document.querySelector('.immersive-store');
            var _perRoomAttr = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
            var _semanticLayout = _sectionEl ? _sectionEl.getAttribute(_perRoomAttr) : null;
            var _layoutConfig =
              _semanticLayout && LAYOUT_REGISTRY && LAYOUT_REGISTRY[_semanticLayout]
                ? LAYOUT_REGISTRY[_semanticLayout].config
                : {};
            buildGalleryStageForRoom(currentRoomKey, scene, {
              layout: getGalleryLayout(currentRoomKey),
              radius: 6,
              arcDegrees: 120,
              verticalOffset: 0.3,
              tiltDegrees: -3,
              cardSpacing: _layoutConfig.spacing || 3.5,
              cardHeight: 2.2,
              cardAspect: 2 / 3,
              layoutConfig: _layoutConfig,
            });
          }
          hideInitialLoader();
        });
      }
    } else {
      if (orientationChanged && currentRoomKey) {
        renderHotspots(currentRoomKey);
      }
      handleResize();
    }

    if (isMobile !== wasMobile || orientationChanged || mobileImgChanged) {
      lastMobile = isMobile;
      lastOrientation = currentOrientation;
    }
  });
}

var resizeObserver = null;
var orientationMediaQuery = null;
var orientationListener = null;

function bindResizeHandling() {
  var canvas = renderer && renderer.domElement;
  var wrapper = canvas && canvas.closest('.immersive-store__canvas-wrapper');

  // Observe wrapper only — observing canvas causes setSize() feedback loops
  if ('ResizeObserver' in window && wrapper) {
    resizeObserver = new ResizeObserver(function () {
      onWindowResize();
    });
    resizeObserver.observe(wrapper);
  }

  ListenerRegistry.add('window-resize', window, 'resize', onWindowResize);

  if (window.visualViewport) {
    ListenerRegistry.add('visual-viewport-resize', window.visualViewport, 'resize', onWindowResize);
    ListenerRegistry.add('visual-viewport-scroll', window.visualViewport, 'scroll', onWindowResize);
  }
}

function unbindResizeHandling() {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  ListenerRegistry.cleanup('window-resize');
  ListenerRegistry.cleanup('visual-viewport-resize');
  ListenerRegistry.cleanup('visual-viewport-scroll');
  if (orientationMediaQuery && orientationListener) {
    orientationMediaQuery.removeEventListener('change', orientationListener);
    orientationMediaQuery = null;
    orientationListener = null;
  }
}

function handleResize(roomKeyOverride) {
  if (!renderer || !camera) return;
  evaluateDeviceFlags();

  var expectedVariant = getTextureVariantKey();
  if (!roomKeyOverride && currentRoomKey && activeTextureVariant && activeTextureVariant !== expectedVariant) {
    reloadCurrentRoomTextures();
    return;
  }

  var canvas = renderer.domElement;
  var wrapper = canvas.closest('.immersive-store__canvas-wrapper');
  var dpr = Math.min(window.devicePixelRatio || 1, window.isMobile || isMobile ? 1.5 : 2);
  var width = (wrapper && wrapper.clientWidth) || canvas.clientWidth || window.innerWidth;
  var height = (wrapper && wrapper.clientHeight) || canvas.clientHeight || window.innerHeight;
  if (width === 0 || height === 0) return;

  if (width === lastResizeDims.w && height === lastResizeDims.h && dpr === lastResizeDims.dpr && !roomKeyOverride) {
    return;
  }
  lastResizeDims.w = width;
  lastResizeDims.h = height;
  lastResizeDims.dpr = dpr;

  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);

  // Update camera to match new aspect ratio
  var aspect = width / height;
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = aspect;
  } else {
    if (aspect < 1) {
      // PORTRAIT (Mobile): Keep fixed frustum height (±1) and scale
      // horizontal by aspect only. The 2×2 plane fills the full width;
      // vertical letterboxing is handled by the shader's vignette, not
      // by expanding the frustum which would crop the scene.
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
    } else {
      // DESKTOP (Landscape): Maintain default framing
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
    }
  }
  camera.updateProjectionMatrix();

  if (planeMesh) {
    var canvasAspect = width / height;
    var imageAspect = currentImageAspect;
    if (canvasAspect > imageAspect) {
      // Viewport wider than image — scale to fill width (object-fit: cover)
      planeMesh.scale.set(canvasAspect, canvasAspect / imageAspect, 1);
    } else {
      // Viewport taller than image — scale to fill height (preserve texture aspect)
      planeMesh.scale.set(imageAspect, 1, 1);
    }
    planeMesh.position.set(0, 0, 0);
  }
  if (immersiveState.mode === 'editorial') cacheEditorialOverlay();
}

var editorialScrollProgress = 0;
var editorialOverlayEl = null;
var editorialMaxScroll = 0;
var atmosphericMoodProgress = 0;

function cacheEditorialOverlay() {
  editorialOverlayEl = document.getElementById('immersive-editorial-overlay') || null;
  editorialMaxScroll = editorialOverlayEl ? editorialOverlayEl.scrollHeight - editorialOverlayEl.clientHeight : 0;
}

var tiltControlEnabled = false;
var tiltBeta = 0;
var tiltGamma = 0;
var tiltXSmoothed = 0;
var tiltYSmoothed = 0;
var tiltNormX = 0;
var tiltNormY = 0;

function handleDeviceOrientation(event) {
  tiltBeta = event.beta || 0;
  tiltGamma = event.gamma || 0;
}

function enableTiltControl() {
  if (tiltControlEnabled) return;
  if (!(window.isMobile || isMobile)) return;
  if (reduceMotion) return;
  if (!window.DeviceOrientationEvent) return;

  function startListening() {
    tiltControlEnabled = true;
    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
  }

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(function (state) {
        if (state === 'granted') {
          startListening();
        } else {
          tiltControlEnabled = false;
        }
      })
      .catch(function () {
        tiltControlEnabled = false;
      });
  } else {
    startListening();
  }
}

function disableTiltControl() {
  if (!tiltControlEnabled) return;
  tiltControlEnabled = false;
  window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
  tiltBeta = 0;
  tiltGamma = 0;
  tiltXSmoothed = 0;
  tiltYSmoothed = 0;
}

function initTiltControlToggle() {
  var toggleBtn = document.querySelector('[data-immersive-tilt-toggle]');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', function () {
    if (tiltControlEnabled) {
      disableTiltControl();
      toggleBtn.setAttribute('aria-pressed', 'false');
    } else {
      enableTiltControl();
      if (tiltControlEnabled) {
        toggleBtn.setAttribute('aria-pressed', 'true');
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKER — main animation loop via ImmersiveTheme.ticker
// ─────────────────────────────────────────────────────────────────────────────
var ticker = window.ImmersiveTheme && window.ImmersiveTheme.ticker;
var unsubscribeAnimate = null;

function startAnimate() {
  if (!ticker) return;
  if (unsubscribeAnimate) return;
  unsubscribeAnimate = ticker.subscribe(function (ts, dt) {
    animateFrame(ts, dt);
  });
}

function stopAnimate() {
  if (unsubscribeAnimate) {
    unsubscribeAnimate();
    unsubscribeAnimate = null;
  }
}

// Expose startAnimate/stopAnimate on the namespace for external cleanup
if (typeof window.ShahanaImmersive === 'object' && window.ShahanaImmersive !== null) {
  window.ShahanaImmersive.startAnimate = startAnimate;
  window.ShahanaImmersive.stopAnimate = stopAnimate;
}
if (typeof window.ImmersiveTheme === 'object' && window.ImmersiveTheme !== null) {
  window.ImmersiveTheme.startAnimate = startAnimate;
  window.ImmersiveTheme.stopAnimate = stopAnimate;
}

// Backward-compatible wrapper so any remaining animate() calls don't break
window.animate = function () {
  startAnimate();
};

function animateFrame(timestamp, delta) {
  if (!uniforms) return;

  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerpFactor;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerpFactor;
  uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);

  // Animate gallery carousel rotation
  if (galleryStageRegistry[currentRoomKey]) {
    animateGalleryCarousel();
  }

  if (!reduceMotion && activeHotspots.length > 0) {
    for (var i = 0; i < activeHotspots.length; i++) {
      var h = activeHotspots[i];
      var dx = mouseCurrent.x - h.x;
      var dy = mouseCurrent.y - h.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var scale = 1.0;
      if (dist < 0.15) {
        var proximity = 1.0 - dist / 0.15;
        scale = 1.0 + 0.3 * proximity;
      }
      h.el.style.setProperty('--hotspot-scale', scale);
    }
  }

  if (tiltControlEnabled && immersiveState.mode === 'showroom' && !reduceMotion) {
    if (typeof tiltBeta === 'undefined' || typeof tiltGamma === 'undefined') {
      disableTiltControl();
    } else {
      tiltNormX = Math.max(-1, Math.min(1, (tiltGamma || 0) / 45));
      tiltNormY = Math.max(-1, Math.min(1, ((tiltBeta || 0) - 45) / 45));
    }
  }
  tiltXSmoothed += (tiltNormX - tiltXSmoothed) * 0.1;
  tiltYSmoothed += (tiltNormY - tiltYSmoothed) * 0.1;

  if (uniforms.uTiltOffsetX && uniforms.uTiltOffsetY) {
    uniforms.uTiltOffsetX.value = tiltXSmoothed * 0.05;
    uniforms.uTiltOffsetY.value = tiltYSmoothed * 0.05;
  }

  if (!tiltControlEnabled && (tiltXSmoothed !== 0 || tiltYSmoothed !== 0)) {
    tiltXSmoothed *= 0.85;
    tiltYSmoothed *= 0.85;
    if (Math.abs(tiltXSmoothed) < 0.001) tiltXSmoothed = 0;
    if (Math.abs(tiltYSmoothed) < 0.001) tiltYSmoothed = 0;
    if (uniforms.uTiltOffsetX && uniforms.uTiltOffsetY) {
      uniforms.uTiltOffsetX.value = tiltXSmoothed * 0.05;
      uniforms.uTiltOffsetY.value = tiltYSmoothed * 0.05;
    }
  }

  if (immersiveState.mode === 'editorial') {
    if (!editorialOverlayEl) cacheEditorialOverlay();
    if (editorialOverlayEl && editorialMaxScroll > 0) {
      var targetProgress = editorialOverlayEl.scrollTop / editorialMaxScroll;
      editorialScrollProgress += (targetProgress - editorialScrollProgress) * 0.1;
      uniforms.uScrollOffset.value = editorialScrollProgress;
      if (!reduceMotion) {
        uniforms.uScrollVignette.value += (editorialScrollProgress - uniforms.uScrollVignette.value) * 0.06;
        uniforms.uScrollChroma.value += (editorialScrollProgress - uniforms.uScrollChroma.value) * 0.06;
        if (immersiveState.editorialRoom === 'featured_collections') {
          atmosphericMoodProgress += (editorialScrollProgress - atmosphericMoodProgress) * 0.04;
          uniforms.uAtmosphericMood.value = atmosphericMoodProgress;
        }
      }
    }
  } else if (editorialScrollProgress > 0.001) {
    editorialScrollProgress *= 0.85;
    uniforms.uScrollOffset.value = editorialScrollProgress;
    if (!reduceMotion) {
      uniforms.uScrollVignette.value *= 0.85;
      uniforms.uScrollChroma.value *= 0.85;
      atmosphericMoodProgress *= 0.85;
      uniforms.uAtmosphericMood.value = atmosphericMoodProgress;
    }
  } else {
    editorialScrollProgress = 0;
    atmosphericMoodProgress = 0;
    uniforms.uScrollOffset.value = 0;
    uniforms.uScrollVignette.value = 0;
    uniforms.uScrollChroma.value = 0;
    uniforms.uAtmosphericMood.value = 0;
  }

  var frameNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
  var lastNow = window._immersiveLastFrameTime || frameNow;
  var deltaSec = (frameNow - lastNow) / 1000;
  window._immersiveLastFrameTime = frameNow;
  applyRoomVisualProfile(currentRoomKey, currentRoomSubMode, deltaSec);

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  if (typeof performance !== 'undefined' && window.__IMMERSIVE_DEV__) {
    var frameTime = frameNow - lastFrameTime;
    lastFrameTime = frameNow;
    fpsCounter++;
    if (frameNow - fpsTimer > 1000) {
      var fps = Math.round((fpsCounter * 1000) / (frameNow - fpsTimer));
      fpsCounter = 0;
      fpsTimer = frameNow;
    }
    if (frameTime > 16.67) {
      console.warn('[Immersive] Frame budget exceeded', frameTime);
    }
  }
}

function updateRoomBadge(roomKey) {
  var badge = document.getElementById('immersive-room-badge');
  if (!badge) return;
  var nameEl = badge.querySelector('[data-room-badge-name]');
  var guidanceEl = badge.querySelector('[data-room-badge-guidance]');
  var name = badge.getAttribute('data-room-name-' + roomKey) || roomKey;
  var guidance = badge.getAttribute('data-room-guidance-' + roomKey) || '';
  if (nameEl) nameEl.textContent = name;
  if (guidanceEl) guidanceEl.textContent = guidance;
}

function goToRoom(roomKey, initial, skipHistory) {
  galleryDragState.isDragging = false;
  galleryDragState.velocity = 0;
  galleryDragState.velocityX = 0;
  galleryDragState.velocityY = 0;
  if (transitioning && !initial) return;
  var roomData = getRoomTextureUrls(roomKey);
  if (!roomData) {
    console.warn('[Immersive] goToRoom aborted: no texture data for room:', roomKey);
    return;
  }

  saveState({ room: roomKey, panel: null, product: null, collection: null });
  immersiveState.currentRoom = roomKey;
  // Gallery rooms pre-set mode/editorialRoom before calling goToRoom.
  // Don't override if already set to editorial.
  if (immersiveState.mode !== 'editorial') {
    immersiveState.mode = 'showroom';
    immersiveState.editorialRoom = null;
  }

  if (!initial && !skipHistory) {
    pushNavigationHistory(roomKey);
  }

  if (typeof trackRoomVisit === 'function') trackRoomVisit(roomKey);
  if (typeof clearLimitedTimeIntervals === 'function') clearLimitedTimeIntervals();

  var uiLayer = document.getElementById(uiLayerId);
  if (!uiLayer) return;

  // Update currentRoomKey before starting texture load so the stale-load
  // guard in _startRoomTextureLoad can correctly detect if user navigated
  // to a *different* room during the load (not just that it changed).
  currentRoomKey = roomKey;

  if (!initial) {
    transitioning = true;
    if (reduceMotion) {
      uiLayer.style.transition = '';
      uiLayer.style.opacity = '0';
      _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
    } else {
      uiLayer.style.transition = 'opacity 0.25s ease-in-out';
      uiLayer.style.opacity = '0';
      setTimeout(function () {
        _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
      }, 250);
    }
  } else {
    _startRoomTextureLoad(roomKey, roomData, uiLayer, initial);
  }
  // Clear any pending rAF IDs from previous room transition
  _rafIds = [];
}

function focusCodexSection() {
  var codex =
    document.querySelector('[data-codex-typo-index]') || document.querySelector('[data-codex-collections-grid]');
  if (!codex) return;
  try {
    codex.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    var rect = codex.getBoundingClientRect();
    var top = rect.top + window.pageYOffset - 80;
    window.scrollTo(0, top);
  }
}

function focusStoryRailSection() {
  var story = document.querySelector('[data-immersive-story-rail]');
  if (!story) return;
  try {
    story.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    var rect = story.getBoundingClientRect();
    var top = rect.top + window.pageYOffset - 80;
    window.scrollTo(0, top);
  }
}

function _startRoomTextureLoad(roomKey, roomData, uiLayer, initial) {
  // Capture expected room at time of request; reject stale loads
  var expectedRoom = roomKey;
  loadRoomTextures(roomData, function (baseTexture, depthTexture) {
    // Guard: skip stale texture loads if user navigated to a *different* room
    // after this request was initiated. currentRoomKey is updated to the new
    // room before this call, so "stale" means it points to neither null nor
    // the expected room (i.e. a newer navigation overrode this one).
    if (!initial && currentRoomKey !== null && currentRoomKey !== expectedRoom) return;
    if (initial || currentRoomKey === expectedRoom || currentRoomKey === null) {
      uniforms.uTexture1.value = baseTexture;
      uniforms.uDepth1.value = depthTexture;
      uniforms.uTexture2.value = baseTexture;
      uniforms.uDepth2.value = depthTexture;
      syncImageAspectFromTexture(baseTexture);
      activeTextureVariant = getTextureVariantKey();
      currentRoomKey = roomKey;
      uiLayer.style.transition = '';
      uiLayer.style.opacity = '1';
      // Build gallery stage OR render hotspots for this room.
      // Re-read gallery config from DOM each time (Method 2 has images,
      // Method 1 from section settings does not). Without this, cached
      // config may have imageSrc: null and gallery items are skipped.
      var galleryItems = getGalleryStageConfig(roomKey);
      if (!galleryItems.length) {
        // Fallback: read directly from [data-immersive-webgl-gallery-config] DOM
        var configEls = document.querySelectorAll('[data-immersive-webgl-gallery-config]');
        configEls.forEach(function (configEl) {
          var rk = configEl.getAttribute('data-room-key') || 'storefront';
          if (rk !== roomKey) return;
          if (!window.immersiveWebglGalleryConfigs) window.immersiveWebglGalleryConfigs = {};
          var items = Array.prototype.slice
            .call(configEl.querySelectorAll('.immersive-webgl-gallery-config__item'))
            .map(function (itemEl) {
              var imgEl = itemEl.querySelector('.immersive-webgl-gallery-config__img');
              return {
                index: parseInt(itemEl.dataset.galleryIndex || '0', 10),
                room: itemEl.dataset.galleryRoom || rk,
                title: itemEl.dataset.galleryTitle || '',
                subtitle: itemEl.dataset.gallerySubtitle || '',
                productHandle: itemEl.dataset.galleryProductHandle || null,
                productId: itemEl.dataset.galleryProductId || null,
                collectionHandle: itemEl.dataset.galleryCollectionHandle || null,
                imageSrc: imgEl ? imgEl.src : null,
                imageWidth: imgEl ? parseInt(imgEl.getAttribute('width'), 10) || 1920 : 1920,
                imageHeight: imgEl ? parseInt(imgEl.getAttribute('height'), 10) || 1080 : 1080,
              };
            });
          window.immersiveWebglGalleryConfigs[rk] = items;
          galleryItems = items;
        });
      }
      if (scene && galleryItems.length) {
        // Clear previous room's hotspots before building gallery
        var existingHotspots = uiLayer.querySelectorAll('.immersive-hotspot');
        existingHotspots.forEach(function (el) { el.remove(); });
        activeHotspots = [];
        buildGalleryStageForRoom(roomKey, scene, {
          layout: getGalleryLayout(roomKey),
          radius: 6,
          arcDegrees: 120,
          verticalOffset: 0.3,
          tiltDegrees: -3,
          cardHeight: 2.2,
          cardAspect: 2 / 3,
        });
        if (renderer && renderer.domElement) {
          initGalleryCarousel(renderer.domElement);
        }
      } else {
        renderHotspots(roomKey);
      }
      updateRoomBadge(roomKey);
      preloadAdjacentRoomTextures(roomKey);
      var tagline = document.getElementById('immersive-tagline');
      if (tagline) tagline.classList.remove('is-visible');
      hideInitialLoader();
      transitioning = false;
      showWelcomeToast();
      trackImmersiveEvent('room_viewed', { room_key: roomKey });
      handleResize(roomKey);
      return;
    }

    var oldBase = uniforms.uTexture1.value;
    var oldDepth = uniforms.uDepth1.value;

    uniforms.uTexture2.value = baseTexture;
    uniforms.uDepth2.value = depthTexture;

    var duration = reduceMotion ? 0 : 800;
    var start = performance.now();
    var startProgress = uniforms.uTransitionProgress.value;

    function step(now) {
      var elapsed = now - start;
      var t = Math.min(elapsed / duration, 1);
      var eased = t * t * (3 - 2 * t);
      uniforms.uTransitionProgress.value = startProgress + (1 - startProgress) * eased;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (oldBase && !isCachedTexture(oldBase)) oldBase.dispose();
        if (oldDepth && !isCachedTexture(oldDepth)) oldDepth.dispose();

        uniforms.uTexture1.value = uniforms.uTexture2.value;
        uniforms.uDepth1.value = uniforms.uDepth2.value;
        uniforms.uTransitionProgress.value = 0;
        currentRoomKey = roomKey;
        syncImageAspectFromTexture(uniforms.uTexture1.value);
        activeTextureVariant = getTextureVariantKey();
        lastResizeDims.w = 0;
        lastResizeDims.h = 0;
        lastResizeDims.dpr = 0;
        handleResize(roomKey);

        if (getGalleryStageConfig(roomKey).length) {
          var _sectionEl2 = document.querySelector('.immersive-store');
          var _perRoomAttr2 = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
          var _semanticLayout2 = _sectionEl2 ? _sectionEl2.getAttribute(_perRoomAttr2) : null;
          var _layoutConfig2 =
            _semanticLayout2 && LAYOUT_REGISTRY && LAYOUT_REGISTRY[_semanticLayout2]
              ? LAYOUT_REGISTRY[_semanticLayout2].config
              : {};
          buildGalleryStageForRoom(roomKey, scene, {
            layout: getGalleryLayout(roomKey),
            radius: 6,
            arcDegrees: 120,
            verticalOffset: 0.3,
            tiltDegrees: -3,
            cardSpacing: _layoutConfig2.spacing || 3.5,
            cardHeight: 2.2,
            cardAspect: 2 / 3,
            layoutConfig: _layoutConfig2,
          });
          initGalleryCarousel(renderer.domElement);

          // Hide hotspot buttons — gallery cards are the interaction
          var _uiLayer = document.getElementById('ui-layer');
          if (_uiLayer) {
            _uiLayer.querySelectorAll('.immersive-hotspot').forEach(function (btn) {
              btn.style.display = 'none';
            });
          }

          // Adjust atmosphere for gallery mode
          if (uniforms) {
            if (uniforms.uAtmosphericMood) uniforms.uAtmosphericMood.value = 0.6;
            if (uniforms.uScrollVignette) uniforms.uScrollVignette.value = 0.25;
          }

          // Show gallery hint
          if (typeof showGalleryHint === 'function') {
            showGalleryHint(roomKey);
          }
        } else {
          // Only render hotspots for non-gallery rooms
          renderHotspots(roomKey);
        }

        updateRoomBadge(roomKey);
        preloadAdjacentRoomTextures(roomKey);
        var tagline = document.getElementById('immersive-tagline');
        if (tagline) tagline.classList.remove('is-visible');
        trackImmersiveEvent('room_viewed', { room_key: roomKey });

        if (reduceMotion) {
          uiLayer.style.transition = '';
          uiLayer.style.opacity = '1';
          transitioning = false;
        } else {
          uiLayer.style.transition = 'opacity 0.25s ease-in-out';
          uiLayer.style.opacity = '1';
          setTimeout(function () {
            transitioning = false;
          }, 250);
        }
      }
    }

    requestAnimationFrame(step);
  });
}

function loadRoomTextures(roomData, callback, _retryCount) {
  var retryCount = _retryCount || 0;

  // If no depth map URL, use a flat placeholder (mid-gray = no displacement)
  if (!roomData.depthMapUrl) {
    var placeholder = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
    placeholder.minFilter = THREE.LinearFilter;
    placeholder.magFilter = THREE.LinearFilter;
    placeholder.needsUpdate = true;
    // Load base texture with fallback support
    loadTextureWithFallback(roomData.baseTextureUrl, fallbackBaseTexture).then(function (tex) {
      if (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        syncImageAspectFromTexture(tex);
        activeTextureVariant = getTextureVariantKey();
      }
      callback(tex, placeholder);
    });
    return;
  }

  var cacheKey = (roomData.baseTextureUrl || 'fallback-base') + '|' + (roomData.depthMapUrl || 'fallback-depth');

  var cachedIndex = textureCache.findIndex(function (entry) {
    return entry && entry.key === cacheKey;
  });

  if (cachedIndex !== -1) {
    var cached = textureCache.splice(cachedIndex, 1)[0];
    textureCache.unshift(cached);
    syncImageAspectFromTexture(cached.base);
    activeTextureVariant = getTextureVariantKey();
    callback(cached.base, cached.depth);
    return;
  }

  var loaded = { base: null, depth: null };
  var failed = false;

  var timeoutId = setTimeout(function () {
    if (!loaded.base || !loaded.depth) {
      onError('timeout');
    }
  }, 15000);

  function onBothLoaded() {
    if (!loaded.base || !loaded.depth) return;
    clearTimeout(timeoutId);

    if (loaded.base.image && loaded.depth.image) {
      textureCache.unshift({ key: cacheKey, base: loaded.base, depth: loaded.depth });
      textureRefCount[cacheKey] = (textureRefCount[cacheKey] || 0) + 1;
      if (textureCache.length > MAX_CACHED_TEXTURES) {
        var oldest = textureCache.pop();
        if (oldest && oldest.key) {
          textureRefCount[oldest.key] = (textureRefCount[oldest.key] || 1) - 1;
          var isActive =
            uniforms &&
            uniforms.uTexture1 &&
            uniforms.uDepth1 &&
            (uniforms.uTexture1.value === oldest.base || uniforms.uDepth1.value === oldest.depth);
          if (!isActive && textureRefCount[oldest.key] <= 0) {
            try {
              if (oldest.base) oldest.base.dispose();
              if (oldest.depth) oldest.depth.dispose();
            } catch (e) {}
            delete textureRefCount[oldest.key];
          }
        }
      }
    }

    syncImageAspectFromTexture(loaded.base);
    activeTextureVariant = getTextureVariantKey();
    callback(loaded.base, loaded.depth);
  }

  function onError(which) {
    if (failed) return;
    failed = true;
    clearTimeout(timeoutId);

    if (retryCount < 1) {
      setTimeout(function () {
        loadRoomTextures(roomData, callback, retryCount + 1);
      }, 1000);
      return;
    }

    if (!currentRoomKey) {
      var canvas = document.getElementById(immersiveCanvasId);
      if (canvas) showWebGLFallback(canvas);
    }
    if (typeof showFeedback === 'function') {
      showFeedback('Unable to load scene. Please check your connection and try again.', 'error');
    }
    transitioning = false;
  }

  // Load base texture with fallback
  loadTextureWithFallback(roomData.baseTextureUrl, fallbackBaseTexture).then(function (tex) {
    if (!tex) {
      onError('base');
      return;
    }
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    loaded.base = tex;
    onBothLoaded();
  });

  // Load depth texture with fallback
  loadTextureWithFallback(roomData.depthMapUrl, fallbackDepthTexture).then(function (tex) {
    if (!tex) {
      onError('depth');
      return;
    }
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    loaded.depth = tex;
    if (window.__IMMERSIVE_DEV__) {
      console.log(
        '[Immersive] Depth texture loaded for',
        roomData.roomKey,
        'size:',
        tex.image?.width + 'x' + tex.image?.height,
      );
    }
    onBothLoaded();
  });
}

function isCachedTexture(texture) {
  return textureCache.some(function (entry) {
    return entry.base === texture || entry.depth === texture;
  });
}

function renderHotspots(roomKey) {
  var room = getRoomData(roomKey);
  var uiLayer = document.getElementById(uiLayerId);
  if (!room || !uiLayer) return;

  function getEditorialSafeMinYPercent() {
    var header = document.querySelector('.immersive-header');
    if (!header) return null;
    var headerRect = header.getBoundingClientRect();
    var layerRect = uiLayer.getBoundingClientRect();
    if (!layerRect || !layerRect.height) return null;
    var safeTopPx = headerRect.bottom + 8;
    var safeTopRelativePx = safeTopPx - layerRect.top;
    var minY = (safeTopRelativePx / layerRect.height) * 100;
    return Math.max(0, Math.min(95, minY));
  }

  function render() {
    uiLayer.innerHTML = '';
    activeHotspots = [];
    var editorialMinYPercent = getEditorialSafeMinYPercent();

    var sortedHotspots = room.hotspots.slice().sort(function (a, b) {
      var ay = usesMobileImg && a.mobileY != null ? a.mobileY : a.y;
      var by = usesMobileImg && b.mobileY != null ? b.mobileY : b.y;
      var ax = usesMobileImg && a.mobileX != null ? a.mobileX : a.x;
      var bx = usesMobileImg && b.mobileX != null ? b.mobileX : b.x;
      if (Math.abs(ay - by) >= 10) return ay - by;
      return ax - bx;
    });

    sortedHotspots.forEach(function (hotspot) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'immersive-hotspot';
      button.setAttribute('tabindex', '0');
      button.setAttribute('aria-label', hotspot.label);
      button.setAttribute('data-hotspot-btn', '');
      var srSpan = document.createElement('span');
      srSpan.className = 'visually-hidden';
      srSpan.textContent = hotspot.label;
      button.appendChild(srSpan);

      var ringSpan = document.createElement('span');
      ringSpan.className = 'immersive-hotspot__ring';
      ringSpan.setAttribute('aria-hidden', 'true');
      button.appendChild(ringSpan);

      if (hotspot.label && hotspot.label.trim()) {
        var labelSpan = document.createElement('span');
        labelSpan.className = 'immersive-hotspot__label';
        labelSpan.setAttribute('aria-hidden', 'true');
        labelSpan.textContent = hotspot.label;
        button.appendChild(labelSpan);
      }

      button.style.position = 'absolute';
      var posX = usesMobileImg && hotspot.mobileX != null ? hotspot.mobileX : hotspot.x;
      var posY = usesMobileImg && hotspot.mobileY != null ? hotspot.mobileY : hotspot.y;
      if (hotspot.targetEditorialRoom && editorialMinYPercent !== null && posY < editorialMinYPercent) {
        posY = editorialMinYPercent;
      }
      button.style.left = posX + '%';
      button.style.top = posY + '%';

      activeHotspots.push({
        el: button,
        x: posX / 100,
        y: posY / 100,
      });

      button.addEventListener('click', function () {
        if (window.__IMMERSIVE_DEV__) {
          console.log('[Immersive] Hotspot clicked:', JSON.stringify(hotspot));
        }

        if (!hotspot.startExperience) {
          exitGuidedMode();
        }

        if (hotspot.targetEditorialRoom) {
          enterEditorialMode(hotspot.targetEditorialRoom, button);
        } else if (hotspot.targetRoom) {
          if (hotspot.startExperience) {
            activateGuidedMode();
            window.ShahanaImmersive.settings.interactionEnabled = true;
          }
          goToRoom(hotspot.targetRoom);
        } else if (hotspot.targetStory) {
          goToRoom(hotspot.target || 'featured_collections');
          currentRoomSubMode = 'story';
          setTimeout(focusStoryRailSection, 300);
        } else if (hotspot.targetCodex) {
          goToRoom('featured_collections');
          setTimeout(focusCodexSection, 300);
        } else if (hotspot.targetCollection) {
          openCollectionPanel(hotspot.targetCollection);
        }
      });

      if (hotspot.targetRoom || hotspot.targetEditorialRoom) {
        button.addEventListener(
          'mouseenter',
          function () {
            if (hotspot.targetRoom) {
              preloadRoom(hotspot.targetRoom);
            }
          },
          { once: true },
        );
      }

      uiLayer.appendChild(button);
    });
  }

  if (document.startViewTransition) {
    document.startViewTransition(render);
  } else {
    render();
  }
}

function openDialogFocus(panel, triggerEl) {
  if (!panel) return;
  panel._panelTrigger = triggerEl || null;
  var closeBtn = panel.querySelector('.immersive-store__panel-close');
  var firstFocusable =
    closeBtn ||
    panel.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
  if (firstFocusable) {
    requestAnimationFrame(function () {
      firstFocusable.focus();
    });
  }
  if (!panel._onEscapeKey) {
    panel._onEscapeKey = function (e) {
      if (e.key === 'Escape') closePanel(panel);
    };
    panel.addEventListener('keydown', panel._onEscapeKey);
  }
}

function closeDialogFocus(panel, triggerEl) {
  if (!panel) return;
  if (panel._onEscapeKey) {
    panel.removeEventListener('keydown', panel._onEscapeKey);
    panel._onEscapeKey = null;
  }
  var target = triggerEl || panel._panelTrigger;
  panel._panelTrigger = null;
  if (target && typeof target.focus === 'function') {
    requestAnimationFrame(function () {
      target.focus();
    });
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
}

function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstFocusableEl = focusableElements[0];
  const lastFocusableEl = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstFocusableEl) {
      lastFocusableEl.focus();
      event.preventDefault();
    }
  } else {
    // Tab
    if (document.activeElement === lastFocusableEl) {
      firstFocusableEl.focus();
      event.preventDefault();
    }
  }
}

function openPanel(panel, triggerEl) {
  if (!panel) return null;
  var closeBtn = panel.querySelector('.immersive-store__panel-close');
  if (closeBtn && !closeBtn._clickBound) {
    closeBtn._clickBound = true;
    ListenerRegistry.add('panel-close-' + panel.id, closeBtn, 'click', function () {
      closePanel(panel);
    });
  }
  panel.classList.remove('hidden');
  panel.removeAttribute('hidden');
  panel.setAttribute('data-open', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  // Store the trigger element to return focus later
  panel._panelTrigger = triggerEl;

  // Add focus trap
  const trapFocusHandler = trapFocus.bind(null, panel);
  ListenerRegistry.add('panel-trap-focus-' + panel.id, panel, 'keydown', trapFocusHandler);

  // Handle escape key
  const escapeHandler = function (e) {
    if (e.key === 'Escape') closePanel(panel);
  };
  ListenerRegistry.add('panel-escape-' + panel.id, panel, 'keydown', escapeHandler);

  var enteringClass =
    panel.id === 'glass-panel' ? 'immersive-store__panel--entering' : 'immersive-editorial-overlay--entering';
  if (!reduceMotion) {
    panel.classList.add(enteringClass);
    setTimeout(function () {
      panel.classList.remove(enteringClass);
      // Ensure focus is within the panel
      const focusable = getFocusableElements(panel);
      if (focusable.length > 0) focusable[0].focus();
      else panel.focus(); // Fallback to panel itself
    }, 350);
  } else {
    const focusable = getFocusableElements(panel);
    if (focusable.length > 0) focusable[0].focus();
    else panel.focus(); // Fallback to panel itself
  }
  return triggerEl;
}

function closePanel(panel) {
  if (!panel) return;

  // Remove focus trap and escape handler
  ListenerRegistry.cleanup('panel-trap-focus-' + panel.id);
  ListenerRegistry.cleanup('panel-escape-' + panel.id);

  panel.removeAttribute('data-open');
  panel.removeAttribute('role');
  panel.removeAttribute('aria-modal');

  // Return focus to the element that opened the panel
  if (panel._panelTrigger && typeof panel._panelTrigger.focus === 'function') {
    requestAnimationFrame(function () {
      panel._panelTrigger.focus();
    });
  }
  panel._panelTrigger = null;
  // Issue 5: Clear panel state from sessionStorage on close so a page
  // refresh doesn't reopen the panel with potentially stale data.
  if (typeof clearState === 'function') clearState();
  setTimeout(function () {
    panel.classList.add('hidden');
    panel.setAttribute('hidden', '');
  }, 400);
}

function setPanelRoomLabel(panel) {
  var labelEl = panel && panel.querySelector('[data-panel-room-label]');
  if (!labelEl) return;
  var badge = document.getElementById('immersive-room-badge');
  var roomName = badge ? badge.getAttribute('data-room-name-' + immersiveState.currentRoom) || '' : '';
  labelEl.textContent = roomName;
}

function fetchWithCache(url) {
  var cached = contentCache[url];
  if (cached) {
    // Check staleness — evict entries older than CACHE_TTL_MS
    if (cached.timestamp && Date.now() - cached.timestamp > CACHE_TTL_MS) {
      delete contentCache[url];
      var staleIdx = contentCacheOrder.indexOf(url);
      if (staleIdx > -1) contentCacheOrder.splice(staleIdx, 1);
      cached = null;
    }
  }
  if (cached) {
    var idx = contentCacheOrder.indexOf(url);
    if (idx > -1) contentCacheOrder.splice(idx, 1);
    contentCacheOrder.push(url);
    return Promise.resolve(cached.html);
  }
  var _ctrl = new AbortController();
  var _fetchTimeout = setTimeout(function () {
    _ctrl.abort();
  }, 30000);
  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, signal: _ctrl.signal })
    .then(function (response) {
      clearTimeout(_fetchTimeout);
      if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
      return response.text();
    })
    .catch(function (_fetchErr) {
      clearTimeout(_fetchTimeout);
      if (_fetchErr.name === 'AbortError') console.warn('[Immersive] Fetch timed out:', url);
      throw _fetchErr;
    })
    .then(function (html) {
      if (contentCacheOrder.length >= MAX_CACHE_ENTRIES) {
        var oldest = contentCacheOrder.shift();
        delete contentCache[oldest];
      }
      contentCache[url] = { html: html, timestamp: Date.now() };
      contentCacheOrder.push(url);
      return html;
    });
}

function fetchSectionHtml(path, sectionId, extraParams) {
  var url = path;
  var separator = url.indexOf('?') >= 0 ? '&' : '?';
  url += separator + 'sections=' + encodeURIComponent(sectionId);

  if (extraParams && typeof extraParams === 'object') {
    Object.keys(extraParams).forEach(function (key) {
      if (extraParams[key] != null) {
        url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(extraParams[key]);
      }
    });
  }

  var _ctrl2 = new AbortController();
  var _fetchTimeout2 = setTimeout(function () {
    _ctrl2.abort();
  }, 30000);
  return fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, signal: _ctrl2.signal })
    .then(function (response) {
      clearTimeout(_fetchTimeout2);
      if (!response.ok) return null;
      return response.json();
    })
    .catch(function (err) {
      clearTimeout(_fetchTimeout2);
      if (err.name === 'AbortError') console.warn('[Immersive] Fetch timed out:', url);
      return null;
    })
    .then(function (json) {
      if (!json || typeof json !== 'object') return null;
      var html = json[sectionId];
      if (!html) return null;
      return html;
    })
    .catch(function (err) {
      // Section Rendering error - tracked silently
      return null;
    });
}

function recordBrowsingSignal(roomKey) {
  if (!roomKey) return;
  try {
    var raw = loadBrowsingSignals();
    var signals = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(signals)) signals = [];
    signals.push(roomKey);
    if (signals.length > 50) signals = signals.slice(signals.length - 50);
    saveBrowsingSignals(signals);
  } catch (e) {}
}

function trackRoomVisit(roomKey) {
  if (_browsingContext && _browsingContext.visitedRooms.indexOf(roomKey) === -1) {
    _browsingContext.visitedRooms.push(roomKey);
  }
  evaluateRoomRecommendation();
}

var _browsingContext = { visitedRooms: [], savedProducts: [], viewedCollections: [], cartCollections: [] };

var BRIDAL_KEYWORDS = ['bridal', 'bride', 'wedding', 'mehndi', 'nikah', 'walima', 'barat'];
var DESIGNER_HOUSE_COLLECTIONS = ['suffuse', 'soraya', 'saad-bin-shahzad'];

function getRecommendation(context) {
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

function evaluateRoomRecommendation() {
  if (!_browsingContext.visitedRooms.length) return;
  var rec = getRecommendation(_browsingContext);
  if (!rec) return;
  try {
    if (isRoomDismissed(rec.roomKey)) return;
  } catch (e) {}
}

function showRoomRecommendation(rec) {
  var existing = document.querySelector('.immersive-rec-chip');
  if (existing) existing.remove();
}

function performEditorialUIActivation(overlay, canvas) {
  document.documentElement.classList.add('immersive-overlay-open');
  document.body.classList.add('immersive-overlay-open');
  if (canvas && !reduceMotion) {
    canvas.classList.add('editorial-blur');
  }
  overlay.removeAttribute('aria-hidden');
  overlay.classList.add('is-active');
  overlay.scrollTop = 0;

  var backBtn = document.getElementById('immersive-editorial-back');
  if (backBtn) {
    if (!reduceMotion) {
      overlay.classList.add('immersive-editorial-overlay--entering');
      setTimeout(function () {
        overlay.classList.remove('immersive-editorial-overlay--entering');
        backBtn.focus();
      }, 350);
    } else {
      requestAnimationFrame(function () {
        backBtn.focus();
      });
    }
    if (!backBtn._editorialBound) {
      backBtn._editorialBound = true;
      backBtn.addEventListener('click', exitEditorialMode);
    }
  }
}

function exitGuidedMode() {
  if (!immersiveState || !immersiveState.guided) return;

  immersiveState.guided = false;

  var prompt = document.getElementById('immersive-guided-prompt');
  if (prompt) {
    prompt.style.display = 'none';
    prompt.setAttribute('aria-hidden', 'true');
  }

  var progress = document.getElementById('immersive-guided-progress');
  if (progress) {
    progress.style.display = 'none';
    progress.setAttribute('aria-hidden', 'true');
  }

  if (window.__immersiveGuidedTimeout) {
    clearTimeout(window.__immersiveGuidedTimeout);
    window.__immersiveGuidedTimeout = null;
  }

  try {
    trackImmersiveEvent &&
      trackImmersiveEvent('guided_mode_exited', {
        room: immersiveState.currentRoom || null,
      });
  } catch (e) {}
}

function activateGuidedMode() {
  if (!immersiveState) return;

  immersiveState.guided = true;

  var prompt = document.getElementById('immersive-guided-prompt');
  if (prompt) {
    prompt.style.display = 'block';
    prompt.removeAttribute('aria-hidden');
  }

  var progress = document.getElementById('immersive-guided-progress');
  if (progress) {
    progress.style.display = 'flex';
    progress.removeAttribute('aria-hidden');
  }

  var progressDots = progress ? progress.querySelectorAll('.immersive-guided-progress__dot') : [];
  progressDots.forEach(function (dot, index) {
    dot.classList.remove('is-active', 'is-done');
    if (index === 0) dot.classList.add('is-active');
  });

  try {
    trackImmersiveEvent &&
      trackImmersiveEvent('guided_mode_entered', {
        room: immersiveState.currentRoom || null,
      });
  } catch (e) {}
}

function updateCameraForMode() {
  if (!camera) return;
  var strength = isMobile ? 0.06 : 0.1;
  if (uniforms && uniforms.uParallaxStrength) {
    uniforms.uParallaxStrength.value = strength;
  }
}

function updateBackToLoungeVisibility(roomKey) {
  var btn = document.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;
  btn.hidden = roomKey === 'lounge';
}

function readGalleryConfig() {
  var root = document.querySelector('[data-immersive-webgl-gallery-config]');
  if (!root) return [];

  var items = root.querySelectorAll('[data-gallery-index]');
  var result = [];

  items.forEach(function (item) {
    result.push({
      roomKey: root.getAttribute('data-room-key') || null,
      index: parseInt(item.getAttribute('data-gallery-index') || '0', 10),
      title: item.getAttribute('data-gallery-title') || '',
      subtitle: item.getAttribute('data-gallery-subtitle') || '',
      productHandle: item.getAttribute('data-gallery-product-handle') || '',
      collectionHandle: item.getAttribute('data-gallery-collection-handle') || '',
    });
  });

  return result;
}

window.readGalleryConfig = readGalleryConfig;

function openOverlay(overlayId, overlayContentId, fetchUrl, onOpenCallback) {
  var overlay = document.getElementById(overlayId);
  var overlayContent = document.getElementById(overlayContentId);

  if (!overlay || !overlayContent) return;

  // Clear previous room content to prevent flash of old content when switching rooms
  overlayContent.innerHTML = '';

  if (!contentCache[fetchUrl]) {
    overlayContent.innerHTML =
      '<div style="height:60vh;display:flex;align-items:center;justify-content:center;color:#d4af37;">Loading...</div>';
  }

  var performUIActivation = function () {
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('is-active');
    overlay.scrollTop = 0;
    if (typeof onOpenCallback === 'function') {
      onOpenCallback(overlay, overlayContent);
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(performUIActivation);
  } else {
    performUIActivation();
  }

  fetchWithCache(fetchUrl)
    .then(function (response) {
      // Handle Section Rendering API JSON response
      var html = response;
      try {
        var json = JSON.parse(response);
        // Extract HTML from first section key if JSON
        var sectionKeys = Object.keys(json);
        if (sectionKeys.length > 0 && typeof json[sectionKeys[0]] === 'string') {
          html = json[sectionKeys[0]];
        }
      } catch (e) {
        // Not JSON, use response as-is (plain HTML)
      }
      var temp = document.createElement('div');
      temp.innerHTML = html;
      var images = temp.querySelectorAll('img:not([loading])');
      for (var i = 0; i < images.length; i++) {
        images[i].setAttribute('loading', 'lazy');
      }
      // Strip <script> tags before inserting into overlay
      temp.querySelectorAll('script').forEach(function (s) {
        s.parentNode.removeChild(s);
      });
      overlayContent.innerHTML = temp.innerHTML;

      // Fix: Find the specific layout container and ensure it is visible inside the overlay
      var editorialSection = overlayContent.querySelector('.immersive-editorial');
      if (editorialSection) {
        editorialSection.style.setProperty('display', 'block', 'important');
      }

      // Initialize editorial layout-specific JS
      if (typeof initDesignersEditorial === 'function') initDesignersEditorial(overlayContent);
      if (typeof initOccasionsEditorial === 'function') initOccasionsEditorial(overlayContent);
      if (typeof initFeaturedCollectionsEditorial === 'function') initFeaturedCollectionsEditorial(overlayContent);
      if (typeof initCoverflow === 'function') initCoverflow(overlayContent);
      if (typeof initStacked === 'function') initStacked(overlayContent);
      if (typeof initPerspective === 'function') initPerspective(overlayContent);

      // Initialize quick view buttons on any product cards in the overlay
      var cards = overlayContent.querySelectorAll('.immersive-product-card');
      cards.forEach(function (card) {
        if (typeof initQuickViewButtons === 'function') initQuickViewButtons(card);
      });
    })
    .catch(function (err) {
      console.error('[Immersive] Overlay fetch failed:', err);
      // Fallback: use the source section's innerHTML which is already in the DOM
      var fallbackSection = document.querySelector(
        '.immersive-editorial[data-room-key="' +
          ((window.immersiveState && window.immersiveState.editorialRoom) || '') +
          '"]',
      );
      if (fallbackSection) {
        overlayContent.innerHTML = fallbackSection.innerHTML;
        var editorialSection = overlayContent.querySelector('.immersive-editorial');
        if (editorialSection) {
          editorialSection.style.setProperty('display', 'block', 'important');
        }
        if (typeof initDesignersEditorial === 'function') initDesignersEditorial(overlayContent);
        if (typeof initOccasionsEditorial === 'function') initOccasionsEditorial(overlayContent);
        if (typeof initFeaturedCollectionsEditorial === 'function') initFeaturedCollectionsEditorial(overlayContent);
      } else {
        overlayContent.innerHTML =
          '<div style="height:60vh;display:flex;align-items:center;justify-content:center;color:#d4af37;padding:2rem;text-align:center;">' +
          '<p>The story is temporarily unavailable.</p>' +
          '<p style="font-size:0.8rem;color:rgba(212,175,55,0.6);margin-top:1rem;">Please check your connection and try again.</p>' +
          '</div>';
      }
    });
}

// ---------------------------------------------------------------------------
// Shared editorial data layer -- cross-room state for the immersive overlay
// ---------------------------------------------------------------------------
var editorialData = {
  currentRoom: null,
  previousRoom: null,
  viewedProducts: [], // product handles seen across rooms
  viewedCollections: [], // collection handles seen across rooms
  navigationHistory: [], // room keys visited in this editorial session
  wishlistHandles: null, // cache of wishlist handles (synced from global _wishlistItems)

  enterRoom: function (roomKey) {
    if (this.currentRoom) {
      this.previousRoom = this.currentRoom;
    }
    this.currentRoom = roomKey;
    this.navigationHistory.push(roomKey);
    this.refreshWishlist();
  },

  exitRoom: function () {
    this.previousRoom = this.currentRoom;
    this.currentRoom = null;
  },

  getViewedProducts: function () {
    return this.viewedProducts.slice();
  },

  addViewedProduct: function (handle) {
    if (handle && this.viewedProducts.indexOf(handle) === -1) {
      this.viewedProducts.push(handle);
    }
  },

  addViewedCollection: function (handle) {
    if (handle && this.viewedCollections.indexOf(handle) === -1) {
      this.viewedCollections.push(handle);
    }
  },

  refreshWishlist: function () {
    if (typeof _wishlistItems !== 'undefined') {
      this.wishlistHandles = _wishlistItems.map(function (item) {
        return typeof item === 'string' ? item : item.handle;
      });
    }
  },

  isInWishlist: function (productHandle) {
    if (!this.wishlistHandles) this.refreshWishlist();
    return this.wishlistHandles && this.wishlistHandles.indexOf(productHandle) !== -1;
  },

  getNavigationHistory: function () {
    return this.navigationHistory.slice();
  },

  hasVisitedRoom: function (roomKey) {
    return this.navigationHistory.indexOf(roomKey) !== -1;
  },
};

// ---------------------------------------------------------------------------
// Editorial layout initializers
// ---------------------------------------------------------------------------

function initDesignersEditorial(root) {
  if (!root) return;
  var designersEl = root.querySelector('.immersive-designers');
  if (!designersEl) return;

  var markers = designersEl.querySelectorAll('.immersive-designers__marker');
  var heroStates = designersEl.querySelectorAll('.immersive-designers__hero-state');
  var productsContainer = designersEl.querySelector('.immersive-designers__products');
  if (!markers.length || !heroStates.length) return;

  function switchDesigner(index) {
    heroStates.forEach(function (state, i) {
      state.classList.toggle('is-active', i === index);
    });
    markers.forEach(function (marker, i) {
      marker.classList.toggle('is-active', i === index);
    });
  }

  markers.forEach(function (marker) {
    marker.addEventListener('click', function () {
      var idx = parseInt(marker.getAttribute('data-index'), 10);
      if (isNaN(idx)) return;
      switchDesigner(idx);

      // Load products for this designer's collection
      var collectionHandle = marker.getAttribute('data-collection-handle');
      if (collectionHandle && productsContainer) {
        if (typeof editorialData !== 'undefined') {
          editorialData.addViewedCollection(collectionHandle);
        }
        productsContainer.innerHTML = '<div class="immersive-editorial__loading">Loading...</div>';
        var fetchUrl = shopRoot + 'collections/' + collectionHandle + '?sections=immersive-product-grid';
        fetchWithCache(fetchUrl)
          .then(function (html) {
            if (html) {
              productsContainer.innerHTML = html;
              // Track viewed products
              var productHandles = productsContainer.querySelectorAll('[data-product-handle]');
              productHandles.forEach(function (el) {
                if (typeof editorialData !== 'undefined') {
                  editorialData.addViewedProduct(el.getAttribute('data-product-handle'));
                }
              });
              // Init product card clicks within editorial
              productHandles.forEach(function (card) {
                card.addEventListener('click', function (e) {
                  e.preventDefault();
                  var handle = card.getAttribute('data-product-handle');
                  if (handle) {
                    if (typeof editorialData !== 'undefined') {
                      editorialData.addViewedProduct(handle);
                    }
                    exitEditorialMode();
                    setTimeout(function () {
                      openProductPanel(handle, collectionHandle);
                    }, 120);
                  }
                });
              });
            } else {
              productsContainer.innerHTML = '<p class="immersive-editorial__empty">No products found.</p>';
            }
          })
          .catch(function () {
            productsContainer.innerHTML = '<p class="immersive-editorial__empty">Unable to load products.</p>';
          });
      }
    });
  });
}

function initOccasionsEditorial(root) {
  if (!root) return;
  // Occasions are primarily content-driven; collection links handled by overlay delegation
  // Add any occasion-specific JS here (e.g., scroll-triggered chapter reveals)
}

function initFeaturedCollectionsEditorial(root) {
  if (!root) return;
  // Featured collection items use data-collection, handled by overlay delegation
  // Add any codex-specific JS here (e.g., grid animation on scroll)
}
// All top-level `var` and `function` declarations are already on `window`,
// but we expose these explicitly for clarity and robustness.
// ---------------------------------------------------------------------------
window.STORE_ROOMS = STORE_ROOMS;
window.immersiveState = immersiveState;
window.contentCache = contentCache;
window.shopRoot = shopRoot;
window.reduceMotion = reduceMotion;
window.immersiveCanvasId = immersiveCanvasId;
window.uiLayerId = uiLayerId;
window.glassPanelId = glassPanelId;
window.currentRoomKey = currentRoomKey;

// Initialize device optimization on load
initDeviceOptimization();

// ---------------------------------------------------------------------------
// Auto-init: bind initImmersiveScene to DOMContentLoaded (with double-init guard)
// _immersiveInitBound is defined at top of file (line ~1583)
// ---------------------------------------------------------------------------
function safeBindImmersiveInit() {
  if (_immersiveInitBound) return;
  _immersiveInitBound = true;
  if (typeof initImmersiveScene === 'function') initImmersiveScene();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeBindImmersiveInit);
} else {
  safeBindImmersiveInit();
}
