/**
 * Immersive Theme State Manager
 *
 * Centralized state management for all immersive theme features.
 * Replaces direct localStorage/sessionStorage access and fragmented globals.
 *
 * @see https://shopify.dev/docs/themes/best-practices/javascript
 */

(function () {
  'use strict';

  // Storage prefixes
  var LOCAL_PREFIX = 'immersive:';
  var SESSION_PREFIX = 'immersive_session:';

  /**
   * Default state schema
   */
  var defaultState = {
    immersive: {
      browsing: {
        signals: [], // User behavior for recommendations (persistent)
      },
      ui: {
        fabPosition: null, // { x, y } - FAB position (persistent)
        filters: {}, // { [collectionHandle]: filterState } (session-only)
      },
      guided: {
        dismissedGlobal: false, // One-time dismissal (persistent)
        dismissedRooms: {}, // Room-specific dismissals (session-only)
      },
      recommendations: {
        dismissedRooms: {}, // Room rec dismissals (session-only)
      },
      session: {
        state: {}, // Runtime session state (session-only)
      },
      navigation: {
        history: [], // Room navigation history (session-only)
      },
    },
    wishlist: {
      items: [], // Array of product handles/IDs (persistent)
    },
    onboarding: {
      seen: false, // Onboarding completion flag (persistent)
    },
    preferredMode: null, // '3d' or null (persistent)
  };

  /**
   * Persistence configuration per state path
   * 'local' = localStorage (persistent across sessions)
   * 'session' = sessionStorage (reset each visit)
   * null = in-memory only
   */
  var persistenceConfig = {
    'immersive.browsing.signals': 'local',
    'immersive.ui.fabPosition': 'local',
    'immersive.ui.filters': 'session',
    'immersive.guided.dismissedGlobal': 'local',
    'immersive.guided.dismissedRooms': 'session',
    'immersive.recommendations.dismissedRooms': 'session',
    'immersive.session.state': 'session',
    'immersive.navigation.history': 'session',
    'wishlist.items': 'local',
    'onboarding.seen': 'local',
    preferredMode: 'local',
  };

  /**
   * Current state (in-memory source of truth)
   */
  var state = JSON.parse(JSON.stringify(defaultState));

  /**
   * Subscribers map: path -> Set<callback>
   */
  var subscribers = new Map();

  /**
   * Get value at path in state object
   * @param {string} path - Dot-notation path (e.g., 'immersive.ui.filters')
   * @returns {*} Value at path or undefined
   */
  function get(path) {
    var parts = path.split('.');
    var current = state;
    for (var i = 0; i < parts.length; i++) {
      if (current == null) return undefined;
      current = current[parts[i]];
    }
    return current;
  }

  /**
   * Set value at path in state object
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   * @param {Object} options - Options object
   * @param {boolean} [options.persist=true] - Whether to persist to storage
   */
  function set(path, value, options) {
    options = options || {};
    var parts = path.split('.');
    var current = state;

    for (var i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] == null) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    var oldValue = current[parts[parts.length - 1]];
    current[parts[parts.length - 1]] = value;

    // Persist if configured
    if (options.persist !== false && persistenceConfig[path]) {
      persist(path);
    }

    // Notify subscribers
    notify(path, value, oldValue);
  }

  /**
   * Persist state path to browser storage
   * @param {string} path - State path to persist
   */
  function persist(path) {
    var storageType = persistenceConfig[path];
    if (!storageType) return;

    var value = get(path);
    var key = (storageType === 'local' ? LOCAL_PREFIX : SESSION_PREFIX) + path;

    try {
      if (value === null || value === undefined) {
        (storageType === 'local' ? localStorage : sessionStorage).removeItem(key);
      } else {
        (storageType === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      if (window.__IMMERSIVE_DEV__) {
        console.warn('[Immersive StateManager] Storage write failed:', path, e);
      }
    }
  }

  /**
   * Load state from browser storage
   * @param {string} path - State path to load
   * @returns {boolean} True if loaded successfully
   */
  function load(path) {
    var storageType = persistenceConfig[path];
    if (!storageType) return false;

    var key = (storageType === 'local' ? LOCAL_PREFIX : SESSION_PREFIX) + path;

    try {
      var raw = (storageType === 'local' ? localStorage : sessionStorage).getItem(key);
      if (raw !== null) {
        var value = JSON.parse(raw);
        set(path, value, { persist: false });
        return true;
      }
    } catch (e) {
      if (window.__IMMERSIVE_DEV__) {
        console.warn('[Immersive StateManager] Storage read failed:', path, e);
      }
    }
    return false;
  }

  /**
   * Subscribe to state changes at a path
   * @param {string} path - State path to watch
   * @param {Function} callback - Callback invoked on change
   * @returns {Function} Unsubscribe function
   */
  function subscribe(path, callback) {
    if (!subscribers.has(path)) {
      subscribers.set(path, new Set());
    }
    subscribers.get(path).add(callback);

    return function unsubscribe() {
      var subs = subscribers.get(path);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          subscribers.delete(path);
        }
      }
    };
  }

  /**
   * Notify subscribers of state change
   * @param {string} path - Changed path
   * @param {*} newValue - New value
   * @param {*} oldValue - Old value
   */
  function notify(path, newValue, oldValue) {
    var subs = subscribers.get(path);
    if (subs) {
      subs.forEach(function (cb) {
        try {
          cb(newValue, oldValue, path);
        } catch (e) {
          if (window.__IMMERSIVE_DEV__) {
            console.error('[Immersive StateManager] Subscriber error:', e);
          }
        }
      });
    }
  }

  /**
   * Migrate legacy storage keys to new schema
   */
  function migrateLegacyKeys() {
    var migrations = [
      // Browsing signals (localStorage)
      {
        oldKey: 'immersive_browsing_signals',
        newPath: 'immersive.browsing.signals',
        storage: 'local',
        transform: function (val) {
          return val;
        },
      },
      // FAB position (localStorage)
      {
        oldKey: 'immersive_fab_position',
        newPath: 'immersive.ui.fabPosition',
        storage: 'local',
        transform: function (val) {
          return val;
        },
      },
      // Wishlist items (localStorage)
      {
        oldKey: 'immersive_wishlist_items',
        newPath: 'wishlist.items',
        storage: 'local',
        transform: function (val) {
          return val;
        },
      },
      // Onboarding seen (localStorage)
      {
        oldKey: 'immersive_onboarding_seen',
        newPath: 'onboarding.seen',
        storage: 'local',
        transform: function (val) {
          return !!val;
        },
      },
      // Preferred mode (localStorage)
      {
        oldKey: 'immersive_preferred_mode',
        newPath: 'preferredMode',
        storage: 'local',
        transform: function (val) {
          return val === '3d' ? '3d' : null;
        },
      },
      // Session state (sessionStorage)
      {
        oldKey: 'immersive_state',
        newPath: 'immersive.session.state',
        storage: 'session',
        transform: function (val) {
          return (typeof val === 'object' && val !== null && !Array.isArray(val)) ? val : {};
        },
      },
      // Navigation history (sessionStorage)
      {
        oldKey: 'immersive_nav_history',
        newPath: 'immersive.navigation.history',
        storage: 'session',
        transform: function (val) {
          return Array.isArray(val) ? val : [];
        },
      },
    ];

    migrations.forEach(function (migration) {
      try {
        var storage = migration.storage === 'local' ? localStorage : sessionStorage;
        var raw = storage.getItem(migration.oldKey);
        if (raw !== null) {
          var value = JSON.parse(raw);
          var transformed = migration.transform(value);
          set(migration.newPath, transformed, { persist: true });
          // Remove old key after successful migration
          storage.removeItem(migration.oldKey);
          if (window.__IMMERSIVE_DEV__) {
            console.log('[Immersive StateManager] Migrated:', migration.oldKey, '->', migration.newPath);
          }
        }
      } catch (e) {
        if (window.__IMMERSIVE_DEV__) {
          console.warn('[Immersive StateManager] Migration failed:', migration.oldKey, e);
        }
      }
    });
  }

  /**
   * Initialize state manager
   * Loads persisted state and migrates legacy keys
   */
  function init() {
    // Migrate legacy keys first
    migrateLegacyKeys();

    // Load all persisted state paths
    Object.keys(persistenceConfig).forEach(function (path) {
      load(path);
    });

    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive StateManager] Initialized', state);
    }
  }

  /**
   * Reset state to defaults (for testing/debugging)
   */
  function reset() {
    state = JSON.parse(JSON.stringify(defaultState));
    // Clear all storage
    Object.keys(localStorage).forEach(function (key) {
      if (key.indexOf(LOCAL_PREFIX) === 0) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(function (key) {
      if (key.indexOf(SESSION_PREFIX) === 0) {
        sessionStorage.removeItem(key);
      }
    });
  }

  /**
   * Get full state snapshot (for debugging)
   */
  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  // Expose API
  window.ImmersiveTheme = window.ImmersiveTheme || {};
  window.ImmersiveTheme.state = {
    get: get,
    set: set,
    subscribe: subscribe,
    init: init,
    reset: reset,
    getState: getState,
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Immersive Theme Tick Manager
 *
 * Centralized requestAnimationFrame loop for all animations.
 * Replaces scattered rAF calls to prevent battery drain, jank, and leaks.
 *
 * @see https://shopify.dev/docs/themes/best-practices/optimize-your-javascript
 */

(function() {
  'use strict';

  var subscribers = new Set();
  var isRunning = false;
  var frameId = null;
  var lastTimestamp = 0;

  /**
   * Main animation loop
   * @param {number} timestamp - DOMHighResTimeStamp from rAF
   */
  function loop(timestamp) {
    // Calculate delta time (ms since last frame)
    var deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Notify all subscribers
    subscribers.forEach(function(fn) {
      try {
        fn(timestamp, deltaTime);
      } catch (e) {
        if (window.__IMMERSIVE_DEV__) {
          console.error('[Immersive TickManager] Subscriber error:', e);
        }
      }
    });

    // Continue loop if there are subscribers
    if (subscribers.size > 0) {
      frameId = requestAnimationFrame(loop);
    } else {
      isRunning = false;
      frameId = null;
    }
  }

  /**
   * Start the animation loop
   */
  function start() {
    if (isRunning) return;
    isRunning = true;
    lastTimestamp = performance.now();
    frameId = requestAnimationFrame(loop);

    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive TickManager] Started');
    }
  }

  /**
   * Stop the animation loop
   */
  function stop() {
    if (!isRunning) return;
    isRunning = false;
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    if (window.__IMMERSIVE_DEV__) {
      console.log('[Immersive TickManager] Stopped');
    }
  }

  /**
   * Subscribe a callback to the tick loop
   * @param {Function} fn - Callback receiving (timestamp, deltaTime)
   * @returns {Function} Unsubscribe function
   */
  function subscribe(fn) {
    if (typeof fn !== 'function') {
      if (window.__IMMERSIVE_DEV__) {
        console.warn('[Immersive TickManager] subscribe() requires a function');
      }
      return function() {};
    }

    subscribers.add(fn);

    if (!isRunning) {
      start();
    }

    // Return unsubscribe function
    return function unsubscribe() {
      subscribers.delete(fn);

      // Auto-stop if no more subscribers
      if (subscribers.size === 0 && isRunning) {
        stop();
      }
    };
  }

  /**
   * Check if the tick manager is running
   * @returns {boolean}
   */
  function isRunningState() {
    return isRunning;
  }

  /**
   * Get number of active subscribers
   * @returns {number}
   */
  function getSubscriberCount() {
    return subscribers.size;
  }

  /**
   * Pause the tick loop temporarily (for debugging/testing)
   */
  function pause() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  /**
   * Resume the tick loop after pause
   */
  function resume() {
    if (subscribers.size > 0 && !isRunning) {
      start();
    }
  }

  // Expose API
  window.ImmersiveTheme = window.ImmersiveTheme || {};
  window.ImmersiveTheme.ticker = {
    subscribe: subscribe,
    start: start,
    stop: stop,
    isRunning: isRunningState,
    getCount: getSubscriberCount,
    pause: pause,
    resume: resume
  };

  // Auto-start on DOM ready if needed
  // (The loop will auto-stop when no subscribers remain)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Lazy start - only when first subscriber joins
    });
  }

})();
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
  designer_houses: {
    uAtmosphericMood: 0.6,
    uScrollVignette: 0.25,
    uScrollChroma: 0.12,
  },
  occasions: {
    uAtmosphericMood: 0.5,
    uScrollVignette: 0.18,
    uScrollChroma: 0.09,
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
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Story texture load error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
      labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Tunnel texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
      labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
    var arcCardAspect = options.cardAspect || 16 / 9;
    var arcCardW = arcCardH / arcCardAspect;
    var arcArcDeg = 120;
    var step = count > 1 ? arcArcDeg / (count - 1) : 0;
    var startAngle = -arcArcDeg / 2;

    items.forEach(function (item, index) {
      if (!item.imageSrc) return;

      var tex = textureLoader.load(
        item.imageSrc,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) {
            console.warn('[Immersive] Gallery texture load error:', err);
          }
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
        labelTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
  var vpH = camera.top - camera.bottom; // = 2
  var vpW = camera.right - camera.left; // = 2 * aspect
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
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Indrajaal texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
      tex.anisotropy = 8;
      texCache[item.imageSrc] = tex;
      textures.push(tex);
    }
    loadedItems.push({ item: item, tex: texCache[item.imageSrc], index: index });
  });

  if (loadedItems.length === 0) {
    scene.add(group);
    galleryStageRegistry[roomKey] = {
      group: group,
      planes: [],
      labels: [],
      textures: textures,
      layout: 'asymmetric-gallery',
      cardCount: 0,
      targetX: 0,
      currentX: 0,
      targetY: 0,
      currentY: 0,
      gridW: 0,
      gridH: 0,
      cols: cols,
      cardW: cardW,
      cardH: cardH,
      spacing: spacing,
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
    rowParallax.push(1 - r * 0.08);
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
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          texture.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Gallery texture load error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
          t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          t.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Narrative texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
      lTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
          t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          t.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Codex texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
    tTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
          t.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
          t.anisotropy = 8;
        },
        undefined,
        function (err) {
          if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Artifact texture error:', err);
        },
      );
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding || THREE.LinearEncoding;
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
      // Check if raycaster is properly initialized
      if (!galleryRaycaster || typeof galleryRaycaster.setFromCamera !== 'function') {
        return;
      }
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

  // Check if raycaster is properly initialized
  if (!galleryRaycaster || typeof galleryRaycaster.setFromCamera !== 'function') {
    if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Raycaster not available');
    return;
  }

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
  // 1. Authoritative: layout from immersive-webgl-gallery-config section (data-layout attr)
  //    This is the source of truth — each room's gallery section declares its layout.
  if (window.immersiveWebglGalleryLayouts && window.immersiveWebglGalleryLayouts[roomKey]) {
    return window.immersiveWebglGalleryLayouts[roomKey];
  }

  // 2. Override from schema dropdown (data-* attribute on .immersive-store)
  //    Merchants can override the default layout via Theme Editor.
  var canvasSection = document.querySelector('.immersive-store');
  if (canvasSection) {
    var perRoomAttr = 'data-' + roomKey.replace(/_/g, '-') + '-layout';
    var perRoomLayout = canvasSection.getAttribute(perRoomAttr);
    if (perRoomLayout) return perRoomLayout;
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

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP — Dispose Three.js resources to prevent memory leaks
// ─────────────────────────────────────────────────────────────────────────────
function cleanupImmersiveScene() {
  // Stop animation loop
  stopAnimate();

  // Dispose renderer
  if (renderer) {
    try {
      renderer.dispose();
      renderer = null;
    } catch (e) {
      if (window.__IMMERSIVE_DEV__) console.warn('[Immersive] Renderer disposal failed:', e);
    }
  }

  // Dispose scene and its children
  if (scene) {
    scene.traverse(function (obj) {
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
      scene.clear();
    } catch (e) {}
    scene = null;
  }

  // Clear camera reference
  camera = null;

  // Dispose main plane mesh resources
  if (planeMesh) {
    if (planeMesh.geometry) {
      try {
        planeMesh.geometry.dispose();
      } catch (e) {}
    }
    if (planeMesh.material) {
      try {
        planeMesh.material.dispose();
      } catch (e) {}
    }
    planeMesh = null;
  }

  // Dispose placeholder texture
  if (uniforms) {
    if (uniforms.uTexture1 && uniforms.uTexture1.value) {
      try {
        uniforms.uTexture1.value.dispose();
      } catch (e) {}
    }
    if (uniforms.uDepth1 && uniforms.uDepth1.value) {
      try {
        uniforms.uDepth1.value.dispose();
      } catch (e) {}
    }
    if (uniforms.uTexture2 && uniforms.uTexture2.value) {
      try {
        uniforms.uTexture2.value.dispose();
      } catch (e) {}
    }
    if (uniforms.uDepth2 && uniforms.uDepth2.value) {
      try {
        uniforms.uDepth2.value.dispose();
      } catch (e) {}
    }
    uniforms = null;
  }

  // Dispose all gallery stages
  Object.keys(galleryStageRegistry).forEach(function (roomKey) {
    disposeGalleryStage(roomKey);
  });

  // Cancel all RAFs
  cancelAllRafs();

  if (window.__IMMERSIVE_DEV__) {
    console.log('[Immersive] Scene cleanup complete');
  }
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
    // Cleanup existing resources before re-initialization
    cleanupImmersiveScene();
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
  ListenerRegistry.add('mousemove-global', window, 'mousemove', handleMouseMove);

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
    if (mobileImgChanged && currentRoomKey && !transitioning) {
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
            var _perRoomAttr = 'data-' + currentRoomKey.replace(/_/g, '-') + '-layout';
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
              viewportHeight: camera.top - camera.bottom,
              viewportWidth: camera.right - camera.left,
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
      if (window.__IMMERSIVE_DEV__) {
        console.log('[Immersive] goToRoom:', roomKey, 'galleryItems from config:', galleryItems.length);
      }
      if (!galleryItems.length) {
        // Fallback: read directly from [data-immersive-webgl-gallery-config] DOM
        var configEls = document.querySelectorAll('[data-immersive-webgl-gallery-config]');
        if (window.__IMMERSIVE_DEV__) {
          console.log('[Immersive] Fallback: found', configEls.length, 'gallery config elements');
        }
        configEls.forEach(function (configEl) {
          var rk = configEl.getAttribute('data-room-key') || 'storefront';
          if (window.__IMMERSIVE_DEV__) {
            console.log('[Immersive] Checking config element for room:', rk, 'looking for:', roomKey);
          }
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
          if (window.__IMMERSIVE_DEV__) {
            console.log('[Immersive] Fallback loaded', items.length, 'items for room:', roomKey);
          }
        });
      }
      if (window.__IMMERSIVE_DEV__) {
        console.log('[Immersive] Final galleryItems.length:', galleryItems.length, 'for room:', roomKey);
      }
      if (scene && galleryItems.length) {
        // Clear previous room's hotspots before building gallery
        var existingHotspots = uiLayer.querySelectorAll('.immersive-hotspot');
        existingHotspots.forEach(function (el) {
          el.remove();
        });
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
    var transitionUnsubscribe = null;

    function step(timestamp, delta) {
      var elapsed = timestamp - start;
      var t = Math.min(elapsed / duration, 1);
      var eased = t * t * (3 - 2 * t);
      uniforms.uTransitionProgress.value = startProgress + (1 - startProgress) * eased;

      if (t < 1) {
        // Animation continues via ticker subscription
        return;
      } else {
        // Animation complete
        if (transitionUnsubscribe) {
          transitionUnsubscribe();
          transitionUnsubscribe = null;
        }
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

    // Start transition animation via ticker
    if (ticker) {
      transitionUnsubscribe = ticker.subscribe(step);
    } else {
      // Fallback to rAF if ticker not available
      requestAnimationFrame(step);
    }
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

  if (document.startViewTransition && !document.viewTransition) {
    var transition = document.startViewTransition(render);
    transition.finished.catch(function (err) {
      console.warn('[Immersive] View Transition failed, re-rendering hotspots:', err);
      render();
    });
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

  if (document.startViewTransition && !document.viewTransition) {
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

// ─────────────────────────────────────────────────────────────
// Global HTML-escaping utility — used by wishlist panel, artifact study,
// product grid, and any innerHTML construction that interpolates data.
// ─────────────────────────────────────────────────────────────
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─────────────────────────────────────────────────────────────
// Safe JSON parsing wrapper
// ─────────────────────────────────────────────────────────────
function safeJSONParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback !== undefined ? fallback : null;
  }
}

// ─────────────────────────────────────────────────────────────
// Unified State Manager Integration
// ─────────────────────────────────────────────────────────────
// State manager (immersive-state-manager.js) is loaded before this file
// and defines window.ImmersiveTheme.state. No fallback shim needed.

// State accessor helpers — thin wrappers over ImmersiveTheme.state
function getState(key, defaultValue) {
  var sm = window.ImmersiveTheme && window.ImmersiveTheme.state;
  if (!sm) return defaultValue;
  return sm.get(key) !== undefined ? sm.get(key) : sm.load(key, defaultValue);
}

function setState(key, value) {
  var sm = window.ImmersiveTheme && window.ImmersiveTheme.state;
  if (sm) sm.set(key, value);
}

// ─────────────────────────────────────────────────────────────
// Unified Ticker Manager Integration
// ─────────────────────────────────────────────────────────────
// Tick manager (tick-manager.js) is loaded before this file
// and defines window.ImmersiveTheme.ticker. No fallback shim needed.

// Ticker accessor helpers — thin wrappers over ImmersiveTheme.ticker
function subscribeToTicker(callback) {
  var tk = window.ImmersiveTheme && window.ImmersiveTheme.ticker;
  return tk ? tk.subscribe(callback) : callback;
}

function unsubscribeFromTicker(callback) {
  var tk = window.ImmersiveTheme && window.ImmersiveTheme.ticker;
  if (tk) tk.unsubscribe(callback);
}

// Animation handle tracking for cleanup
var _animationHandles = [];

function registerAnimationHandle(handle) {
  _animationHandles.push(handle);
  return handle;
}

function clearAllAnimationHandles() {
  for (var i = 0; i < _animationHandles.length; i++) {
    if (_animationHandles[i]) {
      unsubscribeFromTicker(_animationHandles[i]);
    }
  }
  _animationHandles = [];
}

// ─────────────────────────────────────────────────────────────
// Skeleton Loaders for Panel Content
// ─────────────────────────────────────────────────────────────

function renderSkeletonGrid(count) {
  count = count || 6;
  var cards = '';
  for (var i = 0; i < count; i++) {
    cards +=
      '<div class="immersive-skeleton-card">' +
      '<div class="immersive-skeleton-card__image"></div>' +
      '<div class="immersive-skeleton-card__content">' +
      '<div class="immersive-skeleton-card__line immersive-skeleton-card__line--short"></div>' +
      '<div class="immersive-skeleton-card__line immersive-skeleton-card__line--medium"></div>' +
      '<div class="immersive-skeleton-card__line immersive-skeleton-card__line--long"></div>' +
      '</div>' +
      '</div>';
  }
  return '<div class="immersive-skeleton-grid">' + cards + '</div>';
}

function renderSkeletonProduct() {
  return (
    '<div class="immersive-skeleton-product">' +
    '<div class="immersive-skeleton-product__media"></div>' +
    '<div class="immersive-skeleton-product__details">' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--title"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--price"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--description"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--description"></div>' +
    '<div class="immersive-skeleton-product__line immersive-skeleton-product__line--description"></div>' +
    '<div class="immersive-skeleton-product__cta"></div>' +
    '</div>' +
    '</div>'
  );
}

// ─────────────────────────────────────────────────────────────
// Sanitize fetched section HTML before DOM insertion
// Strips <script> tags to prevent double-execution of Shopify
// section scripts that may already be loaded in the bundle.
// ─────────────────────────────────────────────────────────────

function setPanelHtml(container, html) {
  if (!container) return;
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('script').forEach(function (s) {
    s.parentNode.removeChild(s);
  });
  container.innerHTML = tmp.innerHTML;
}

// ─────────────────────────────────────────────────────────────
// Error feedback UI for panel surfaces
// ─────────────────────────────────────────────────────────────

function showErrorFeedback(panel, message) {
  if (!panel) return;
  var contentArea = panel.querySelector('.immersive-store__panel-content');
  var target = contentArea || panel;
  target.innerHTML =
    '<div class="immersive-store__error-feedback">' +
    '<p class="immersive-store__error-feedback__message">' +
    escapeHtml(message) +
    '</p>' +
    '<button type="button" class="immersive-store__error-feedback__close" data-close-panel>Close</button>' +
    '</div>';
  target.style.opacity = '1';
  panel.onclick = function (e) {
    if (e.target === panel || e.target.closest('[data-close-panel]')) {
      closePanel(panel);
    }
  };
  LoadingState.complete();
}

// ─────────────────────────────────────────────────────────────
// Wishlist item storage (consolidated with immersive-core.js)
// Now uses Unified State Manager instead of direct localStorage
// ─────────────────────────────────────────────────────────────

var _wishlistItems = [];

function getWishlistItems() {
  return _wishlistItems;
}

function setWishlistItems(items) {
  _wishlistItems = Array.isArray(items) ? items : [];
  _persistWishlist(); // Keep local storage in sync
}

// ─────────────────────────────────────────────────────────────
// Content Transition Helpers
// ─────────────────────────────────────────────────────────────

/* OVERRIDE NOTICE: Several functions defined in this file (e.g., showNextActions,
 * dismissNextActions, _nextActionsTimer, _nextActionsBar) are intentionally
 * minimal stubs that get overridden by immersive-init.js when all three files
 * load together. Additionally, this file overrides stubs from immersive-core.js
 * (e.g., getRecommendation, showRoomRecommendation, activateGuidedMode,
 * exitGuidedMode). Do NOT remove these stubs — they serve as fallbacks if
 * init.js is absent. */

function fadeInContent(container, html) {
  if (!container) return;
  // Strip <script> tags from fetched HTML before DOM insertion
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('script').forEach(function (s) {
    s.parentNode.removeChild(s);
  });
  var cleanHtml = tmp.innerHTML;
  if (reduceMotion) {
    container.innerHTML = cleanHtml;
    return;
  }
  container.style.transition = 'opacity 150ms ease-in-out';
  container.style.opacity = '0';
  setTimeout(function () {
    container.innerHTML = cleanHtml;
    container.style.opacity = '1';
  }, 150);
}

function transitionPanelContent(panel, renderCallback) {
  if (!panel) return;
  if (document.startViewTransition) {
    // Use skipTransition to avoid conflicting with editorial view transitions
    try {
      document.startViewTransition({ update: renderCallback, types: [] });
    } catch (e) {
      renderCallback();
    }
  } else {
    renderCallback();
  }
}

function openProductPanel(productHandle, collectionHandle) {
  try {
    exitGuidedMode();
    recordBrowsingSignal(immersiveState.currentRoom);
    saveState({ panel: 'product', product: productHandle, collection: collectionHandle || null });

    var path = shopRoot + 'products/' + productHandle;
    var extraParams = collectionHandle ? { collection_handle: collectionHandle } : null;
    var panel = document.getElementById(glassPanelId);
    if (!panel) return;

    var triggerEl = document.activeElement;

    if (window.__IMMERSIVE_DEV__) console.log('Fetching product:', productHandle, 'from collection:', collectionHandle);

    LoadingState.start();

    // Open panel and show skeleton immediately
    openPanel(panel, triggerEl);

    var contentArea = panel.querySelector('.immersive-store__panel-content');
    if (contentArea) {
      contentArea.innerHTML = renderSkeletonProduct();
      contentArea.style.opacity = '1';
    }

    // Fetch real content
    fetchSectionHtml(path, 'glass-product', extraParams)
      .then(function (html) {
        if (!html) {
          var errMsg = panel.getAttribute('data-msg-load-product-error') || 'Unable to load product. Please try again.';
          showErrorFeedback(panel, errMsg);
          closePanel(panel);
          LoadingState.complete();
          return;
        }

        function render() {
          if (contentArea) {
            fadeInContent(contentArea, html);
          } else {
            setPanelHtml(panel, html);
          }

          // Panel-specific setup
          setPanelRoomLabel(panel);
          setupVariantButtons(panel);
          setupBuyNowForm(panel);
          setupMediaThumbs(panel);
          setupImageParallax(panel);
          setupShareButton(panel);
          setupDeliveryDates(panel);
          setupVirtualTryOn(panel);
          loadProductRecommendations(panel);
          cacheWishlistProduct(productHandle, panel);
          syncAllWishlistToggles(panel);

          trackImmersiveEvent('panel_opened', {
            panel_type: 'product',
            product_handle: productHandle,
            collection_handle: collectionHandle || null,
          });

          // Exclusive panel click handler — replaces any previous handler when panel content changes.
          // Do not set panel.onclick elsewhere; use addEventListener if co-handlers are needed.
          panel.onclick = function (event) {
            if (event.target === panel) {
              closePanel(panel);
              return;
            }
            if (event.target.closest('.immersive-store__panel-close')) {
              closePanel(panel);
              return;
            }

            // Wishlist toggle — prevent product panel click-through
            var wlToggle = event.target.closest('[data-wishlist-toggle]');
            if (wlToggle) {
              event.preventDefault();
              event.stopPropagation();
              var wlHandle = wlToggle.getAttribute('data-product-handle');
              if (wlHandle) toggleWishlistItem(wlHandle, 'product_panel', wlToggle);
              return;
            }

            // Back button (PDP -> Collection)
            var backButton = event.target.closest('.glass-product-section__back');
            if (backButton) {
              var backHandle = backButton.getAttribute('data-collection-handle');
              if (backHandle) {
                event.preventDefault();
                openCollectionPanel(backHandle);
              }
              return;
            }

            // Breadcrumb navigation -- <a href> links with progressive enhancement.
            // preventDefault() stops the browser navigation so we can do smooth
            // in-scene transitions. The href still works without JS (Dawn pattern).
            var breadcrumbBtn = event.target.closest('[data-breadcrumb-action]');
            if (breadcrumbBtn) {
              event.preventDefault();
              var action = breadcrumbBtn.getAttribute('data-breadcrumb-action');
              if (action === 'go-home') {
                closePanel(panel);
                if (typeof goToRoom === 'function') goToRoom('storefront');
              } else if (action === 'close-panel') {
                closePanel(panel);
              } else if (action === 'open-collection') {
                var colHandle = breadcrumbBtn.getAttribute('data-collection-handle');
                if (colHandle) openCollectionPanel(colHandle);
              }
              return;
            }

            // Vendor name → open vendor collection panel
            var vendorBtn = event.target.closest('[data-vendor-collection]');
            if (vendorBtn) {
              var vendorHandle = vendorBtn.getAttribute('data-vendor-collection');
              if (vendorHandle) openCollectionPanel(vendorHandle);
              return;
            }

            // Prev/next product navigation
            var navBtn = event.target.closest('.glass-product-section__product-nav-btn[data-product-handle]');
            if (navBtn) {
              var navHandle = navBtn.getAttribute('data-product-handle');
              var navColHandle = navBtn.getAttribute('data-collection-handle');
              if (navHandle) openProductPanel(navHandle, navColHandle || collectionHandle);
              return;
            }

            // Related product click
            var relatedItem = event.target.closest('.glass-product-section__related-item');
            if (relatedItem) {
              var relatedHandle = relatedItem.getAttribute('data-product-handle');
              if (relatedHandle) {
                event.preventDefault();
                openProductPanel(relatedHandle, collectionHandle);
              }
              return;
            }

            // Any product link
            var productLink = event.target.closest('a[data-product-handle]');
            if (productLink) {
              var linkHandle = productLink.getAttribute('data-product-handle');
              if (linkHandle) {
                event.preventDefault();
                openProductPanel(linkHandle, collectionHandle);
              }
              return;
            }

            // Recommendation card links
            var recLink = event.target.closest('[data-related-root] a[href*="/products/"]');
            if (recLink) {
              var href = recLink.getAttribute('href') || '';
              var match = href.match(/\/products\/([^/?#]+)/);
              if (match) {
                event.preventDefault();
                openProductPanel(match[1], collectionHandle);
              }
              return;
            }
          };
        }

        transitionPanelContent(panel, render);
        LoadingState.complete();
      })
      .catch(function (error) {
        console.error('[Immersive] Panel fetch failed:', error);
        Analytics.trackError('product_panel_error', error.message);
        var errMsg =
          panel.getAttribute('data-msg-load-product-error') || 'Unable to load product. Please check your connection.';
        showErrorFeedback(panel, errMsg);
        closePanel(panel);
        LoadingState.complete();
      });
  } catch (e) {
    Analytics.trackError('product_panel_error', e.message);
    if (window.__IMMERSIVE_DEV__) console.error('[Immersive] openProductPanel error:', e);
    LoadingState.fail('An error occurred. Please try again.');
  }
}

// ─────────────────────────────────────────────────────────────
// Browsing signals — personalized room suggestions (Feature 6)
// ─────────────────────────────────────────────────────────────
function openCollectionPanel(collectionHandle) {
  // Validate that the collection handle looks like a valid slug
  // (non-empty, alphanumeric with hyphens, no spaces or special chars)
  if (!collectionHandle || !/^[\w-]+$/.test(collectionHandle)) {
    console.warn('[immersive] Invalid collection handle skipped:', collectionHandle);
    return;
  }
  try {
    exitGuidedMode();
    recordBrowsingSignal(immersiveState.currentRoom);
    saveState({ panel: 'collection', collection: collectionHandle, product: null });

    var path = shopRoot + 'collections/' + collectionHandle;
    var panel = document.getElementById(glassPanelId);
    if (!panel) return;

    var triggerEl = document.activeElement;

    if (window.__IMMERSIVE_DEV__) {
      if (window.__IMMERSIVE_DEV__) console.log('Fetching collection:', collectionHandle);
    }

    LoadingState.start();

    // Open panel and show skeleton immediately
    openPanel(panel, triggerEl);

    var contentArea = panel.querySelector('.immersive-store__panel-content');
    if (contentArea) {
      contentArea.innerHTML = renderSkeletonGrid(6);
      contentArea.style.opacity = '1';
    }

    // Fetch real content
    fetchSectionHtml(path, 'glass-panel', null)
      .then(function (html) {
        if (!html) {
          console.warn('[Immersive] glass-panel fetch returned empty for:', collectionHandle, 'URL:', path);
          var errMsg = panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please try again.';
          showErrorFeedback(panel, errMsg);
          closePanel(panel);
          LoadingState.complete();
          return;
        }

        function render() {
          if (contentArea) {
            fadeInContent(contentArea, html);
          } else {
            setPanelHtml(panel, html);
          }

          // Panel-specific setup
          setPanelRoomLabel(panel);
          setupVariantButtons(panel);
          setupBuyNowForm(panel);
          setupImageParallax(panel);
          setupVirtualTryOn(panel);
          syncAllWishlistToggles(panel);

          trackImmersiveEvent('panel_opened', {
            panel_type: 'collection',
            collection_handle: collectionHandle,
          });

          // Init filters after collection content loads
          var gridWrapper = panel.querySelector('.immersive-product-grid-wrapper');
          if (gridWrapper) {
            var collHandle = gridWrapper.closest('[data-collection-handle]')
              ? gridWrapper.closest('[data-collection-handle]').getAttribute('data-collection-handle')
              : collectionHandle;
            var currentRoomForFilters =
              (typeof immersiveState !== 'undefined' && immersiveState.currentRoom) || 'lounge';
            initImmersiveFilters(panel, collHandle || collectionHandle, currentRoomForFilters, 'glass-panel');
          }

          // Exclusive panel click handler — replaces any previous handler when panel content changes.
          // Do not set panel.onclick elsewhere; use addEventListener if co-handlers are needed.
          panel.onclick = function (event) {
            if (event.target === panel) {
              closePanel(panel);
              return;
            }
            if (event.target.closest('.immersive-store__panel-close')) {
              closePanel(panel);
              return;
            }

            // Breadcrumb navigation -- <a href> with progressive enhancement.
            var breadcrumbBtn = event.target.closest('[data-breadcrumb-action]');
            if (breadcrumbBtn) {
              event.preventDefault();
              var bAction = breadcrumbBtn.getAttribute('data-breadcrumb-action');
              if (bAction === 'go-home') {
                closePanel(panel);
                if (typeof goToRoom === 'function') goToRoom('storefront');
              } else if (bAction === 'close-panel') {
                closePanel(panel);
              } else if (bAction === 'open-collection') {
                var colHandle = breadcrumbBtn.getAttribute('data-collection-handle');
                if (colHandle) openCollectionPanel(colHandle);
              }
              return;
            }

            // Empty state action handling
            var emptyAction = event.target.closest('[data-empty-action]');
            if (emptyAction) {
              var action = emptyAction.getAttribute('data-empty-action');
              if (action) {
                handleEmptyStateAction(action);
              }
              return;
            }

            // Wishlist toggle — must be checked BEFORE product card click so
            // clicking the heart icon doesn't also open the product panel.
            var wishlistToggle = event.target.closest('[data-wishlist-toggle]');
            if (wishlistToggle) {
              event.preventDefault();
              event.stopPropagation();
              var wlHandle = wishlistToggle.getAttribute('data-product-handle');
              if (wlHandle) toggleWishlistItem(wlHandle, 'product_card', wishlistToggle);
              return;
            }

            // Product card click — intercept clicks on the article OR any child
            // element with data-product-handle (e.g. inner <a> links).
            // event.preventDefault() is called IMMEDIATELY before any other logic
            // so browser navigation on <a href> elements is cancelled synchronously.
            var cardOrLink = event.target.closest('.immersive-product-card, [data-product-handle]');
            if (cardOrLink) {
              event.preventDefault();
              var handle = cardOrLink.getAttribute('data-product-handle');
              if (!handle) {
                var parentCard = cardOrLink.closest('.immersive-product-card');
                handle = parentCard && parentCard.getAttribute('data-product-handle');
              }
              if (handle) {
                openProductPanel(handle, collectionHandle);
              }
              return;
            }
          };
        }

        transitionPanelContent(panel, render);
        LoadingState.complete();
      })
      .catch(function (error) {
        console.error('[Immersive] Panel fetch failed:', error);
        Analytics.trackError('collection_panel_error', error.message);
        var errMsg =
          panel.getAttribute('data-msg-load-error') || 'Unable to load content. Please check your connection.';
        showErrorFeedback(panel, errMsg);
        closePanel(panel);
        LoadingState.complete();
      });
  } catch (e) {
    Analytics.trackError('collection_panel_error', e.message);
    if (window.__IMMERSIVE_DEV__) console.error('[Immersive] openCollectionPanel error:', e);
    LoadingState.fail('An error occurred. Please try again.');
  }
}

// ─────────────────────────────────────────────────────────────
// Editorial overlay entry point (single, canonical implementation)
// ─────────────────────────────────────────────────────────────
function enterEditorialMode(roomKey, triggerEl) {
  if (window.__IMMERSIVE_DEV__)
    console.log('[Immersive] enterEditorialMode called with roomKey:', roomKey, 'triggerEl:', triggerEl);

  // Gallery rooms (designer_houses, occasions, featured_collections) render
  // entirely on the 3D canvas — no 2D overlay. The parallax background
  // loads normally, then the gallery builds on top.
  // Route through goToRoom which handles texture loading + gallery build.
  if (typeof getGalleryStageConfig === 'function' && getGalleryStageConfig(roomKey).length) {
    if (triggerEl) immersiveState.lastHotspot = triggerEl;
    // Set editorial state so camera/UI behave correctly for gallery mode
    immersiveState.mode = 'editorial';
    immersiveState.editorialRoom = roomKey;
    if (typeof updateCameraForMode === 'function') updateCameraForMode();
    goToRoom(roomKey);
    return;
  }

  immersiveState.mode = 'editorial';
  immersiveState.editorialRoom = roomKey;
  immersiveState.lastHotspot = triggerEl || null;
  if (typeof updateCameraForMode === 'function') updateCameraForMode();

  // Track in shared editorial data layer
  if (typeof editorialData !== 'undefined') {
    editorialData.enterRoom(roomKey);
  }

  // Reset scroll-linked state
  editorialScrollProgress = 0;
  if (uniforms && uniforms.uScrollOffset) {
    uniforms.uScrollOffset.value = 0;
    uniforms.uScrollVignette.value = 0;
    uniforms.uScrollChroma.value = 0;
    uniforms.uAtmosphericMood.value = 0;
  }
  cacheEditorialOverlay();
  updateCameraForMode();

  try {
    trackImmersiveEvent && trackImmersiveEvent('editorial_entered', { room: roomKey });
  } catch (e) {}

  var overlay = document.getElementById('immersive-editorial-overlay');
  var overlayContent = document.getElementById('immersive-editorial-overlay-content');
  var canvas = document.getElementById(immersiveCanvasId);

  if (!overlay || !overlayContent) {
    console.warn('[Immersive] Editorial overlay not found');
    return;
  }

  // Get section instance ID
  var sourceSection = document.querySelector('.immersive-editorial[data-room-key="' + roomKey + '"]');
  var sectionInstanceId = sourceSection && sourceSection.getAttribute('data-section-id');

  if (!sectionInstanceId) {
    console.warn('[Immersive] No immersive-editorial section instance found on page for room:', roomKey);
    if (sourceSection) {
      var tmp = document.createElement('div');
      tmp.innerHTML = sourceSection.innerHTML;
      tmp.querySelectorAll('script').forEach(function (s) { s.parentNode.removeChild(s); });
      overlayContent.innerHTML = tmp.innerHTML;
      performEditorialUIActivation(overlay, canvas);
    }
    return;
  }

  var fetchUrl = window.location.pathname + '?sections=' + encodeURIComponent(sectionInstanceId);
  if (window.__IMMERSIVE_DEV__)
    console.log(
      '[Immersive] Editorial fetch URL:',
      fetchUrl,
      'roomKey:',
      roomKey,
      'sectionInstanceId:',
      sectionInstanceId,
    );

  // Open overlay with callback for post-content setup
  openOverlay(
    'immersive-editorial-overlay',
    'immersive-editorial-overlay-content',
    fetchUrl,
    function (overlay, overlayContent) {
      performEditorialUIActivation(overlay, canvas);

      if (window.ImmersiveEditorial && window.ImmersiveEditorial.init) {
        window.ImmersiveEditorial.init(overlayContent);
      }

      if (window.ImmersiveCarousel && window.ImmersiveCarousel.init) {
        window.ImmersiveCarousel.init(overlayContent);
      }

      if (window.CodexCollectionsGrid && window.CodexCollectionsGrid.init) {
        window.CodexCollectionsGrid.init(overlayContent);
      }

      // Back to Lounge visibility + hero parallax
      updateBackToLoungeVisibility(roomKey);
      initEditorialHeroParallax();

      // Setup escape handler
      if (!overlay._onEscape) {
        overlay._onEscape = function (e) {
          if (e.key === 'Escape') exitEditorialMode();
        };
        overlay.addEventListener('keydown', overlay._onEscape);
      }

      // Setup collection click delegation
      if (!overlay._onClick) {
        overlay._onClick = function (e) {
          // Catch-all: prevent any <a> with href inside editorial overlay from navigating to 2D store
          var linkEl = e.target.closest('a[href]');
          if (linkEl && linkEl.closest('.immersive-editorial')) {
            // If it has a collection or product handle, handle it properly below
            var hasHandle =
              linkEl.hasAttribute('data-collection') ||
              linkEl.hasAttribute('data-collection-handle') ||
              linkEl.hasAttribute('data-product-handle');
            if (!hasHandle && !linkEl.getAttribute('href')?.startsWith('#')) {
              // External link (e.g. /pages/privacy-policy) -- allow it in a new tab
              if (linkEl.getAttribute('href')?.startsWith('http')) {
                linkEl.setAttribute('target', '_blank');
                linkEl.setAttribute('rel', 'noopener');
                return; // let it open in new tab
              }
              // Internal link without data handler -- prevent navigation
              e.preventDefault();
              return;
            }
          }

          var productLink = e.target.closest('[data-product-handle]');
          if (productLink) {
            var productHandle = productLink.getAttribute('data-product-handle');
            var productCollectionHandle = productLink.getAttribute('data-collection-handle');
            if (!productCollectionHandle) {
              var productCollectionRoot = productLink.closest('[data-collection-handle]');
              productCollectionHandle =
                productCollectionRoot && productCollectionRoot.getAttribute('data-collection-handle');
            }
            if (productHandle) {
              e.preventDefault();
              if (typeof editorialData !== 'undefined') {
                editorialData.addViewedProduct(productHandle);
                if (productCollectionHandle) editorialData.addViewedCollection(productCollectionHandle);
              }
              openProductPanel(productHandle, productCollectionHandle || null);
              return;
            }
          }
          var studyTrigger = e.target.closest('[data-artifact-open]');
          if (studyTrigger && studyTrigger.closest('.immersive-editorial')) {
            var hasCollectionRoute =
              studyTrigger.hasAttribute('data-collection') || studyTrigger.hasAttribute('data-collection-handle');
            if (!hasCollectionRoute) {
              e.preventDefault();
              return;
            }
          }
          var card = e.target.closest('[data-collection], [data-collection-handle]');
          if (!card) return;
          var handle = card.getAttribute('data-collection') || card.getAttribute('data-collection-handle');
          if (!handle) return;
          e.preventDefault();
          if (typeof editorialData !== 'undefined') {
            editorialData.addViewedCollection(handle);
          }
          exitEditorialMode();
          setTimeout(function () {
            openCollectionPanel(handle);
          }, 120);
        };
        overlay.addEventListener('click', overlay._onClick);
      }
    },
  );
}

// ─────────────────────────────────────────────────────────────
// Helper: Perform editorial overlay UI activation
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Editorial overlay exit point (paired with enterEditorialMode)
// ─────────────────────────────────────────────────────────────
function exitEditorialMode() {
  destroyEditorialHeroParallax();
  var overlay = document.getElementById('immersive-editorial-overlay');
  var canvas = document.getElementById(immersiveCanvasId);
  var triggerEl = immersiveState.lastHotspot;
  var galleryRoomKey = immersiveState.editorialRoom;

  var performUIDeactivation = function () {
    document.documentElement.classList.remove('immersive-overlay-open');
    document.body.classList.remove('immersive-overlay-open');

    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
      if (overlay._onEscape) {
        overlay.removeEventListener('keydown', overlay._onEscape);
        overlay._onEscape = null;
      }
      if (overlay._onClick) {
        overlay.removeEventListener('click', overlay._onClick);
        overlay._onClick = null;
      }
    }

    if (canvas) {
      canvas.classList.remove('editorial-blur');
    }

    // Clear editorial back button flag so it can be re-bound on next entry
    var _backBtn = document.getElementById('immersive-editorial-back');
    if (_backBtn) {
      _backBtn._editorialBound = false;
    }

    // Dispose 3D gallery stage if this was a gallery room
    if (galleryRoomKey && typeof disposeGalleryStage === 'function') {
      disposeGalleryStage(galleryRoomKey);
      // Re-show hotspot buttons that were hidden by gallery mode
      var _uiLayer = document.getElementById('ui-layer');
      if (_uiLayer) {
        _uiLayer.querySelectorAll('.immersive-hotspot').forEach(function (btn) {
          btn.style.display = '';
        });
      }
      // Reset cursor
      if (canvas) canvas.style.cursor = '';
    }

    immersiveState.mode = 'showroom';
    immersiveState.editorialRoom = null;
    editorialOverlayEl = null;
    editorialMaxScroll = 0;
    updateCameraForMode();

    if (triggerEl) {
      requestAnimationFrame(function () {
        triggerEl.focus();
      });
    }
  };

  if (document.startViewTransition && triggerEl) {
    // Clear any existing transition names first to avoid "duplicate" errors
    overlay.style.viewTransitionName = '';
    triggerEl.style.viewTransitionName = '';
    // Force reflow so the clear takes effect before we set the new name
    void overlay.offsetHeight;
    // Only apply viewTransitionName to the overlay to avoid "duplicate" errors
    overlay.style.viewTransitionName = 'editorial-morph';

    try {
      var transition = document.startViewTransition(performUIDeactivation);
      transition.finished.finally(function () {
        overlay.style.viewTransitionName = '';
        triggerEl.style.viewTransitionName = '';
        immersiveState.lastHotspot = null;
      });
    } catch (e) {
      // If view transition fails (e.g., invalid state), fall back to direct deactivation
      performUIDeactivation();
      immersiveState.lastHotspot = null;
    }
  } else {
    performUIDeactivation();
    immersiveState.lastHotspot = null;
  }
}

// ─────────────────────────────────────────────────────────────
// Close generic overlay (story rail, typo index) — does NOT
// touch immersiveState.mode unlike exitEditorialMode().
// Follows Dawn's CartNotification.close() pattern: remove
// overlay, restore focus, clean up listeners.
// ─────────────────────────────────────────────────────────────
function closeGenericOverlay() {
  var overlay = document.getElementById('immersive-editorial-overlay');
  var canvas = document.getElementById(immersiveCanvasId);

  if (overlay) {
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    if (overlay._onEscape) {
      overlay.removeEventListener('keydown', overlay._onEscape);
      overlay._onEscape = null;
    }
    if (overlay._onClick) {
      overlay.removeEventListener('click', overlay._onClick);
      overlay._onClick = null;
    }
    // Unbind the back button's overlay-specific handler
    var backBtn = document.getElementById('immersive-editorial-back');
    if (backBtn && backBtn._overlayBound) {
      backBtn.removeEventListener('click', closeGenericOverlay);
      backBtn._overlayBound = false;
    }
    if (canvas) {
      canvas.classList.remove('editorial-blur');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Generic overlay for non-editorial sections (story rail, typo index)
// ─────────────────────────────────────────────────────────────
function openImmersiveOverlay(sectionType, title) {
  var overlay = document.getElementById('immersive-editorial-overlay');
  var overlayContent = document.getElementById('immersive-editorial-overlay-content');
  var canvas = document.getElementById(immersiveCanvasId);

  if (!overlay || !overlayContent) return;

  // Clean up previous overlay instances before injecting new content
  if (window.ImmersiveStoryRail && window.ImmersiveStoryRail.destroy) {
    window.ImmersiveStoryRail.destroy();
  }
  if (window.CodexTypoIndex && window.CodexTypoIndex.destroy) {
    window.CodexTypoIndex.destroy();
  }

  var sectionEl = document.querySelector('[data-section-type="' + sectionType + '"]');
  if (!sectionEl) return;

  overlayContent.innerHTML = '';
  var clone = sectionEl.cloneNode(true);
  clone.removeAttribute('hidden');
  clone.style.display = '';
  overlayContent.appendChild(clone);

  if (window.ImmersiveStoryRail && window.ImmersiveStoryRail.init) {
    window.ImmersiveStoryRail.init(overlayContent);
  }

  if (window.CodexTypoIndex && window.CodexTypoIndex.init) {
    window.CodexTypoIndex.init(overlayContent);
  }

  activateGenericOverlay(overlay, canvas, title);
}

function activateGenericOverlay(overlay, canvas, title) {
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
    if (!backBtn._overlayBound) {
      backBtn._overlayBound = true;
      backBtn.addEventListener('click', closeGenericOverlay);
    }
  }

  if (!overlay._onEscape) {
    overlay._onEscape = function (e) {
      if (e.key === 'Escape') closeGenericOverlay();
    };
    overlay.addEventListener('keydown', overlay._onEscape);
  }
}

// Global trigger delegation for [data-immersive-overlay]
(function () {
  var _overlayBound = false;
  function bindOverlayTriggers() {
    if (_overlayBound) return;
    _overlayBound = true;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-immersive-overlay]');
      if (!trigger) return;

      var sectionType = trigger.getAttribute('data-immersive-overlay');
      var title = trigger.getAttribute('data-overlay-title') || '';
      if (!sectionType) return;

      e.preventDefault();
      openImmersiveOverlay(sectionType, title);
    });
  }

  document.addEventListener('DOMContentLoaded', bindOverlayTriggers);
  if (typeof window !== 'undefined' && window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', bindOverlayTriggers);
  }
})();

function setupVariantButtons(panel) {
  var buttons = panel.querySelectorAll('.immersive-variant-button, .glass-product-section__variant-button');
  var hiddenInput = panel.querySelector('.immersive-variant-input, .glass-product-section__variant-input');

  if (buttons.length === 0) return;

  buttons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      if (button.disabled) return;

      // Remove active state from all buttons
      buttons.forEach(function (btn) {
        btn.classList.remove('active');
      });

      // Add active state to clicked button
      button.classList.add('active');

      // Update hidden input
      var variantId = button.getAttribute('data-variant-id');
      if (hiddenInput && variantId) {
        hiddenInput.value = variantId;
      }
    });

    // Add keyboard navigation
    button.addEventListener('keydown', function (event) {
      if (button.disabled) return;

      // Enter or Space to activate
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }

      // Arrow key navigation
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        var nextIndex = index + 1;
        while (nextIndex < buttons.length) {
          if (!buttons[nextIndex].disabled) {
            buttons[nextIndex].focus();
            break;
          }
          nextIndex++;
        }
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        var prevIndex = index - 1;
        while (prevIndex >= 0) {
          if (!buttons[prevIndex].disabled) {
            buttons[prevIndex].focus();
            break;
          }
          prevIndex--;
        }
      }
    });
  });

  // Set first available variant as active
  var firstAvailable = panel.querySelector(
    '.immersive-variant-button:not([disabled]), .glass-product-section__variant-button:not([disabled])',
  );
  if (firstAvailable) {
    firstAvailable.click();
  }
}

function setupBuyNowForm(panel) {
  var forms = panel.querySelectorAll('form[data-product-form], .glass-product-section__form');
  var container = panel.querySelector('.glass-product-section');
  var msgSelectVariant = (container && container.getAttribute('data-error-select-variant')) || 'Please select a size';
  var msgAddToCart =
    (container && container.getAttribute('data-error-add-to-cart')) || 'Unable to add to cart. Please try again.';

  forms.forEach(function (form) {
    // Track which submit button was clicked so we can distinguish
    // add-to-cart (name="add") from payment_button accelerated checkout buttons
    var lastClickedSubmit = null;
    form.addEventListener(
      'click',
      function (e) {
        var btn = e.target.closest('[type="submit"], button[name]');
        if (btn) lastClickedSubmit = btn;
      },
      true,
    );

    form.addEventListener('submit', function (event) {
      // If the clicked button is NOT the add-to-cart button (e.g. it's a
      // payment_button / Buy Now), let Shopify handle it natively
      var isAddToCart =
        !lastClickedSubmit ||
        lastClickedSubmit.getAttribute('name') === 'add' ||
        lastClickedSubmit.classList.contains('glass-product-section__add-to-cart');

      if (!isAddToCart) {
        // Let the native form submit proceed for accelerated checkout buttons
        lastClickedSubmit = null;
        return;
      }

      event.preventDefault();
      lastClickedSubmit = null;

      // Validate variant selection
      var variantInput = form.querySelector(
        '.immersive-variant-input, .glass-product-section__variant-input, input[name="id"]',
      );
      if (!variantInput || !variantInput.value) {
        showErrorFeedback(panel, msgSelectVariant);
        return;
      }

      var formData = new FormData(form);
      // Ensure sections param is set for cart drawer to update correctly
      formData.set('sections', 'cart-drawer,cart-icon-bubble');
      formData.set('sections_url', window.location.pathname);

      var submitBtn = form.querySelector('[type="submit"][name="add"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-adding');
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding\u2026';
      }

      fetch(shopRoot + 'cart/add.js', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      })
        .then(function (response) {
          if (!response.ok) {
            return response.json().then(function (error) {
              throw new Error(error.description || msgAddToCart);
            });
          }
          return response.json();
        })
        .then(function () {
          // Reset submit button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-adding');
            if (submitBtn.dataset.originalText) submitBtn.textContent = submitBtn.dataset.originalText;
          }
          showCartFeedback(panel);

          try {
            var productHandleEl = panel.querySelector('[data-product-handle]');
            var productHandle = productHandleEl ? productHandleEl.getAttribute('data-product-handle') : null;
            trackImmersiveEvent('add_to_cart_checkout', { product_handle: productHandle });
          } catch (e) {}

          // Show next actions after add-to-cart
          try {
            var productCtx = panel.querySelector('[data-product-handle]');
            var productHandleForNext = productCtx ? productCtx.getAttribute('data-product-handle') : null;
            var vendorEl = panel.querySelector('[data-product-vendor]');
            var vendorForNext = vendorEl ? vendorEl.getAttribute('data-product-vendor') : null;
            if (typeof showAfterAddToCart === 'function' && productHandleForNext) {
              showAfterAddToCart({
                handle: productHandleForNext,
                vendor: vendorForNext || '',
                collectionHandle: null,
                roomKey: (immersiveState && immersiveState.currentRoom) || 'lounge',
              });
            }
          } catch (e) {}

          // Open Dawn's cart drawer if available, otherwise navigate to cart
          var cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && typeof cartDrawer.open === 'function') {
            // Refresh cart drawer contents then open it
            fetch(shopRoot + '?section_id=cart-drawer', {
              headers: { 'X-Requested-With': 'XMLHttpRequest' },
            })
              .then(function (r) {
                return r.text();
              })
              .then(function (html) {
                var temp = document.createElement('div');
                temp.innerHTML = html;
                var newDrawer = temp.querySelector('cart-drawer');
                if (newDrawer) {
                  cartDrawer.innerHTML = newDrawer.innerHTML;
                }
                cartDrawer.open();
              })
              .catch(function () {
                cartDrawer.open();
              });
          } else {
            window.location.href = shopRoot + 'cart';
          }

          // Sync FAB cart badge using Dawn's section rendering pattern
          fetch(shopRoot + '?section_id=cart-icon-bubble', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          })
            .then(function (r) {
              return r.text();
            })
            .then(function (html) {
              var temp = document.createElement('div');
              temp.innerHTML = html;
              var newBubble = temp.querySelector('.cart-count-bubble');
              var fabBadge = document.querySelector('[data-bottom-nav-cart-badge]');
              if (fabBadge && newBubble) {
                var countSpan = newBubble.querySelector('[aria-hidden]');
                var count = countSpan ? parseInt(countSpan.textContent, 10) : 0;
                fabBadge.textContent = count;
                fabBadge.hidden = count === 0;
              }
            })
            .catch(function () {});

          // Publish cart-update event so Dawn's own CartItems can react
          if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
            publish(PUB_SUB_EVENTS.cartUpdate, { source: 'immersive-store' });
          }
        })
        .catch(function (error) {
          console.error('Error adding to cart:', error);
          // Reset submit button state on error
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-adding');
            if (submitBtn.dataset.originalText) submitBtn.textContent = submitBtn.dataset.originalText;
          }
          showErrorFeedback(panel, error.message || msgAddToCart);
        });
    });
  });
}

function setupMediaThumbs(panel) {
  var mainContainer = panel.querySelector('[data-parallax-main]');
  if (!mainContainer) return;

  var thumbs = panel.querySelectorAll('.glass-product-section__thumb');
  if (!thumbs.length) return;

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var idx = parseInt(thumb.getAttribute('data-media-index'), 10);

      // Use the high-res data attributes for the main image
      var fullSrc = thumb.getAttribute('data-full-src');
      var fullSrcset = thumb.getAttribute('data-full-srcset') || '';
      var fullAlt = thumb.getAttribute('data-full-alt') || '';

      // Swap the main image src
      var mainImg = mainContainer.querySelector('[data-parallax-image]');
      if (mainImg && fullSrc) {
        mainImg.setAttribute('src', fullSrc);
        if (fullSrcset) mainImg.setAttribute('srcset', fullSrcset);
        mainImg.setAttribute('alt', fullAlt);

        // Reset parallax transform
        mainImg.style.transform = 'scale(1.06) translate(0px, 0px)';
      }

      // Active state on thumbs
      thumbs.forEach(function (t) {
        t.classList.remove('is-active');
      });
      thumb.classList.add('is-active');
    });
  });
}

function setupImageParallax(panel) {
  // Delegate to the global data-attribute-driven implementation
  // which is called once on init and re-called after panel content loads
  var root = panel || document;
  var containers = root.querySelectorAll('[data-parallax-container]');
  if (!containers.length || reduceMotion) return;

  containers.forEach(function (container) {
    if (container._parallaxBound) return; // avoid double-binding
    container._parallaxBound = true;

    var images = container.querySelectorAll('[data-parallax-image]');
    if (!images.length) return;

    var intensity = parseFloat(container.getAttribute('data-parallax-intensity') || '12');
    var rafPending = false;
    var lastX = 0;
    var lastY = 0;

    function applyParallax(x, y) {
      var rect = container.getBoundingClientRect();
      var cx = Math.max(-1, Math.min(1, ((x - rect.left) / rect.width - 0.5) * 2));
      var cy = Math.max(-1, Math.min(1, ((y - rect.top) / rect.height - 0.5) * 2));
      images.forEach(function (img) {
        img.style.transform = 'scale(1.06) translate(' + cx * intensity + 'px, ' + cy * intensity + 'px)';
      });
    }

    function resetParallax() {
      images.forEach(function (img) {
        img.style.transform = 'scale(1.06) translate(0px, 0px)';
      });
    }

    container.addEventListener('mousemove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () {
        applyParallax(lastX, lastY);
        rafPending = false;
      });
    });
    container.addEventListener('mouseleave', function () {
      rafPending = false;
      resetParallax();
    });
    container.addEventListener(
      'touchmove',
      function (e) {
        var t = e.touches[0];
        lastX = t.clientX;
        lastY = t.clientY;
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(function () {
          applyParallax(lastX, lastY);
          rafPending = false;
        });
      },
      { passive: true },
    );
    container.addEventListener('touchend', resetParallax);
  });
}

function setupDeliveryDates(panel) {
  var fromEl = panel.querySelector('.delivery-from');
  var toEl = panel.querySelector('.delivery-to');
  if (!fromEl || !toEl) return;

  function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  function skipWeekend(date) {
    var day = date.getDay();
    if (day === 0) date.setDate(date.getDate() + 1);
    else if (day === 6) date.setDate(date.getDate() + 2);
    return date;
  }
  function fmt(date) {
    var lang = document.documentElement.lang || 'en-GB';
    try {
      return date.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' });
    } catch (e) {
      return date.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  }

  var today = new Date();
  var fromDate = fmt(skipWeekend(addDays(today, 14)));
  var toDate = fmt(skipWeekend(addDays(today, 24)));

  // Use the localized template if available, otherwise fall back to direct span injection
  var templateEl = panel.querySelector('[data-delivery-template]');
  if (templateEl) {
    var tpl = templateEl.getAttribute('data-delivery-template') || '';
    templateEl.innerHTML = tpl
      .replace('[[from]]', '<strong>' + fromDate + '</strong>')
      .replace('[[to]]', '<strong>' + toDate + '</strong>');
  } else {
    fromEl.textContent = fromDate;
    toEl.textContent = toDate;
  }
}

function setupShareButton(panel) {
  var buttons = panel.querySelectorAll('.glass-product-section__share-btn');
  if (!buttons.length) return;

  var shareContainer = panel.querySelector('.glass-product-section__share-buttons');
  var copiedMsg = (shareContainer && shareContainer.getAttribute('data-copied-success')) || '\u2713 Copied!';

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var url = encodeURIComponent(btn.getAttribute('data-product-url') || window.location.href);
      var title = encodeURIComponent(btn.getAttribute('data-product-title') || document.title);
      var platform = btn.getAttribute('data-platform');
      var shareUrl;

      switch (platform) {
        case 'whatsapp':
          shareUrl = 'https://wa.me/?text=' + title + '%20' + url;
          break;
        case 'facebook':
          shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
          break;
        case 'instagram':
          // Instagram has no direct web share URL — copy link instead
          navigator.clipboard.writeText(decodeURIComponent(url)).then(function () {
            btn.textContent = copiedMsg;
            setTimeout(function () {
              btn.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> Instagram';
            }, 2500);
          });
          return;
        case 'tiktok':
          // TikTok has no direct web share — copy link
          navigator.clipboard.writeText(decodeURIComponent(url)).then(function () {
            btn.textContent = copiedMsg;
            setTimeout(function () {
              btn.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg> TikTok';
            }, 2500);
          });
          return;
        default:
          return;
      }

      window.open(shareUrl, '_blank', 'noopener,width=600,height=500');
    });
  });
}

function setupVirtualTryOn(panel) {
  var container = panel.querySelector('#virtual-tryon-container');
  if (!container) return;

  // If not signed in, the gate UI is shown — no JS needed
  if (container.getAttribute('data-signed-in') !== 'true') return;

  var userPhotoInput = container.querySelector('#virtual-tryon-user-photo');
  var tryOnBtn = container.querySelector('#virtual-tryon-btn');
  var resultImg = container.querySelector('#virtual-tryon-result-img');
  var resultContainer = container.querySelector('#virtual-tryon-result');
  var loadingSpinner = container.querySelector('#virtual-tryon-loading');
  var quotaBadge = container.querySelector('#vtryon-quota-badge');

  if (!userPhotoInput || !tryOnBtn) return;

  var productTitle = container.getAttribute('data-product-title') || '';
  var productImageUrlRaw = container.getAttribute('data-product-image-url') || '';
  var productImageUrl = productImageUrlRaw.startsWith('//')
    ? 'https:' + productImageUrlRaw
    : productImageUrlRaw.startsWith('/')
      ? window.location.origin + productImageUrlRaw
      : productImageUrlRaw;

  var customerId = container.getAttribute('data-customer-id') || '';
  var customerToken = container.getAttribute('data-customer-token') || '';
  var vtonApiUrl = container.getAttribute('data-api-url');
  var isRecentPurchaser = container.getAttribute('data-is-recent-purchaser') === 'true';
  var quotaMax = parseInt(container.getAttribute('data-quota-max') || '1', 10);

  // Localized strings from data-* attributes
  var msgErrorPhotoRead =
    container.getAttribute('data-error-photo-read') || 'Could not read your photo. Please try a different image.';
  var msgErrorQuotaExceeded = container.getAttribute('data-error-quota-exceeded') || 'You have used all your try-ons.';
  var msgErrorAuthRequired =
    container.getAttribute('data-error-auth-required') || 'Please sign in to use Virtual Try-On.';
  var msgStatusUploading = container.getAttribute('data-status-uploading') || 'Uploading your photo\u2026';
  var msgStatusProcessing =
    container.getAttribute('data-status-processing') || 'Processing embroidery & texture details\u2026';
  var msgStatusDraping = container.getAttribute('data-status-draping') || 'Generating realistic drapes\u2026';
  var msgStatusFinalizing =
    container.getAttribute('data-status-finalizing') || 'Finalizing your look\u2026 almost there!';
  var msgStatusSuccess = container.getAttribute('data-status-success') || 'Looking great!';

  // Show quota badge
  if (quotaBadge) {
    var quotaAvailableTpl = container.getAttribute('data-quota-available') || '{{ count }} try-ons available';
    quotaBadge.textContent = quotaAvailableTpl.replace('{{ count }}', quotaMax);
  }

  function trackTryOn(name, extra) {
    trackImmersiveEvent(
      name,
      Object.assign(
        {
          product_title: productTitle,
          customer_id_present: !!customerId,
        },
        extra || {},
      ),
    );
  }

  var userImageDataUrl = null;

  userPhotoInput.addEventListener('change', function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      tryOnBtn.disabled = true;
      return;
    }

    var uploadText = container.querySelector('.vtryon__upload-text');
    var uploadIcon = container.querySelector('.vtryon__upload-icon');
    var preview = container.querySelector('.vtryon__preview');
    if (uploadText) uploadText.textContent = file.name;

    var reader = new FileReader();
    reader.onload = function (e) {
      if (preview && uploadIcon) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        uploadIcon.style.display = 'none';
      }
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 768;
        canvas.height = 1024;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 768, 1024);
        var scale = Math.min(768 / img.width, 1024 / img.height);
        var x = (768 - img.width * scale) / 2;
        var y = (1024 - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        userImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        tryOnBtn.disabled = false;
      };
      img.onerror = function () {
        showError(msgErrorPhotoRead);
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      showError(msgErrorPhotoRead);
    };
    reader.readAsDataURL(file);
  });

  tryOnBtn.addEventListener('click', async function () {
    if (!userImageDataUrl) return;

    var statusText = container.querySelector('.vtryon__status');
    var errorBox = container.querySelector('.vtryon__error');
    var seconds = 0;
    var timer = null;

    function setStatus(msg) {
      if (statusText) statusText.textContent = msg;
    }
    function showError(msg) {
      if (errorBox) {
        errorBox.textContent = msg;
        // Do NOT toggle display — keep the live region in the accessibility tree
        // so screen readers announce the injected text. CSS hides it when empty.
      }
      setStatus('');
    }

    try {
      tryOnBtn.disabled = true;
      if (resultContainer) resultContainer.style.display = 'none';
      if (errorBox) errorBox.textContent = ''; // clear previous error without hiding the live region
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      trackTryOn('tryon_started', {});
      setStatus(msgStatusUploading);
      var blob = await (function () {
        return new Promise(function (resolve, reject) {
          var byteString = atob(userImageDataUrl.split(',')[1]);
          var ab = new ArrayBuffer(byteString.length);
          var ia = new Uint8Array(ab);
          for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          resolve(new Blob([ab], { type: 'image/jpeg' }));
        });
      })();

      var uploadRes = await fetch(vtonApiUrl + '/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
        signal: AbortSignal.timeout(15000),
      });
      var uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) throw new Error(uploadData.error || 'Upload failed');

      var userImageUrl = uploadData.url;

      // Step 2: Call /api/tryon with customer auth + quota fields
      setStatus(msgStatusProcessing);
      timer = setInterval(function () {
        seconds++;
        if (seconds === 10) setStatus(msgStatusDraping);
        if (seconds === 25) setStatus(msgStatusFinalizing);
      }, 1000);

      var tryonRes = await fetch(vtonApiUrl + '/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_image_url: userImageUrl,
          product_image_url: productImageUrl,
          garment_description: productTitle || 'Luxury Pakistani ethnic wear',
          full_body: true,
          customer_id: customerId,
          customer_token: customerToken,
          is_recent_purchaser: isRecentPurchaser,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!tryonRes.ok) {
        var errData = await tryonRes.json().catch(function () {
          return {};
        });
        // Handle quota exceeded with a friendly message
        if (errData.code === 'quota_exceeded') {
          throw new Error(errData.error || msgErrorQuotaExceeded);
        }
        if (errData.code === 'auth_required') {
          throw new Error(msgErrorAuthRequired);
        }
        throw new Error(errData.error || 'Try-on failed');
      }

      // Step 3: Result streamed as image/jpeg
      var imgBlob = await tryonRes.blob();
      var objectUrl = URL.createObjectURL(imgBlob);
      var objectUrlReused = false;

      // Update quota badge
      var quotaUsed = parseInt(tryonRes.headers.get('X-Quota-Used') || '1', 10);
      var quotaMaxHeader = parseInt(tryonRes.headers.get('X-Quota-Max') || String(quotaMax), 10);
      var remaining = quotaMaxHeader - quotaUsed;
      if (quotaBadge) {
        var quotaRemainingTpl = container.getAttribute('data-quota-remaining') || '{{ count }} try-ons remaining';
        quotaBadge.textContent = quotaRemainingTpl.replace('{{ count }}', remaining);
        if (remaining === 0) quotaBadge.style.color = 'rgba(252,165,165,0.8)';
      }

      setStatus(msgStatusSuccess);
      if (resultImg) {
        if (resultImg._objectUrl) URL.revokeObjectURL(resultImg._objectUrl);
        resultImg._objectUrl = objectUrl;
        resultImg.src = objectUrl;
        resultImg.hidden = false;
        objectUrlReused = true;
      }
      if (resultContainer) resultContainer.style.display = 'block';
      trackTryOn('tryon_completed', { quota_remaining: remaining });
    } catch (error) {
      if (!objectUrlReused && objectUrl) URL.revokeObjectURL(objectUrl);
      console.error('Try-on error:', error);
      showError(error.message);
      trackTryOn('tryon_failed', { error_message: error && error.message ? error.message : 'Unknown error' });
    } finally {
      clearInterval(timer);
      tryOnBtn.disabled = false;
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  });
}

function showCartFeedback(panel) {
  var glassPanel = document.getElementById(glassPanelId);
  var msg = (glassPanel && glassPanel.getAttribute('data-msg-added-to-cart')) || 'Added to cart!';
  var feedback = document.createElement('div');
  feedback.className = 'immersive-cart-feedback';
  feedback.textContent = msg;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  // Issue 19: Append to document.documentElement to avoid parent transform issues
  feedback.style.cssText =
    'position:fixed;top:20px;right:20px;background:rgba(212,175,55,0.95);color:#000;padding:1rem 1.5rem;border-radius:8px;z-index:99999;font-weight:600;pointer-events:none;';
  document.documentElement.appendChild(feedback);

  setTimeout(function () {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(function () {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 300);
  }, 2000);
}

function showImmersiveOnboardingIfNeeded() {
  var overlay = document.getElementById('immersive-onboarding');
  if (!overlay) return;

  // Respect the "show once" setting — if data-show-once="true", skip if already seen
  var showOnce = overlay.getAttribute('data-show-once') !== 'false';
  if (showOnce) {
    var seen = false;
    try {
      seen = !!localStorage.getItem(ONBOARDING_KEY);
    } catch (e) {
      // localStorage blocked (private browsing) — treat as unseen
    }
    if (seen) return;
  }

  var previousFocus = document.activeElement;
  overlay.removeAttribute('hidden');

  // Announce to screen readers that a modal dialog has opened.
  // Follows Dawn's CartDrawer pattern: aria-live region + focus management.
  var onboardingAnnouncer = document.getElementById('immersive-hotspot-announcer');
  if (onboardingAnnouncer) {
    var titleEl = overlay.querySelector('#immersive-onboarding-title');
    var descEl = overlay.querySelector('.immersive-onboarding__description');
    var titleText = titleEl ? titleEl.textContent.trim() : '';
    var descText = descEl ? descEl.textContent.trim() : '';
    onboardingAnnouncer.textContent = 'Dialog opened: ' + titleText + '. ' + descText;
  }

  var dismissBtn = overlay.querySelector('[data-onboarding-dismiss]');
  if (dismissBtn) {
    // Use Dawn's trapFocus() for proper focus confinement within the modal
    trapFocus(overlay, dismissBtn);

    function onEscape(e) {
      if (e.key === 'Escape') dismissBtn.click();
    }
    overlay.addEventListener('keydown', onEscape);

    dismissBtn.addEventListener('click', function onDismiss() {
      dismissBtn.removeEventListener('click', onDismiss);
      overlay.removeEventListener('keydown', onEscape);
      if (showOnce) {
        try {
          localStorage.setItem(ONBOARDING_KEY, '1');
        } catch (e) {}
      }
      overlay.setAttribute('hidden', '');
      // Use Dawn's removeTrapFocus to restore focus properly
      if (previousFocus && typeof previousFocus.focus === 'function') {
        removeTrapFocus(previousFocus);
      }
      // Clear the live region so the announcement doesn't repeat
      if (onboardingAnnouncer) {
        onboardingAnnouncer.textContent = '';
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Wishlist Manager
// ─────────────────────────────────────────────────────────────

function getWishlist() {
  return _wishlistItems.slice();
}

function _persistWishlist() {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(_wishlistItems));
  } catch (e) {}
}

function updateWishlistBadge() {
  var badge = document.querySelector('[data-wishlist-badge]');
  if (!badge) return;
  badge.textContent = _wishlistItems.length;
  badge.hidden = _wishlistItems.length === 0;
  if (typeof window.updateBottomNavBadges === 'function') {
    window.updateBottomNavBadges(_wishlistItems.length, null);
  }
}

function syncAllWishlistToggles(root) {
  var toggles = root.querySelectorAll('[data-wishlist-toggle]');
  for (var i = 0; i < toggles.length; i++) {
    var toggle = toggles[i];
    var handle = toggle.getAttribute('data-product-handle');
    var isSaved =
      handle &&
      _wishlistItems.some(function (item) {
        return (typeof item === 'string' ? item : item.handle) === handle;
      });
    toggle.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    toggle.classList.toggle('is-saved', !!isSaved);
    var labelSave = toggle.getAttribute('data-label-save');
    var labelSaved = toggle.getAttribute('data-label-saved');
    if (labelSave && labelSaved) {
      toggle.setAttribute('aria-label', isSaved ? labelSaved : labelSave);
    }
  }
}

function _triggerHeartPulse() {
  if (reduceMotion) return;
  var btn = document.querySelector('[data-wishlist-open]');
  if (!btn) return;
  btn.classList.remove('immersive-wishlist-btn--pulse');
  void btn.offsetWidth; // force reflow
  btn.classList.add('immersive-wishlist-btn--pulse');
  setTimeout(function () {
    btn.classList.remove('immersive-wishlist-btn--pulse');
  }, 600);
}

function _flyToWishlist(sourceEl) {
  if (reduceMotion || !sourceEl) return;
  var btn = document.querySelector('[data-wishlist-open]');
  if (!btn) return;
  var srcRect = sourceEl.getBoundingClientRect();
  var btnRect = btn.getBoundingClientRect();
  var token = document.createElement('div');
  token.className = 'immersive-fly-token';
  token.setAttribute('aria-hidden', 'true');
  token.style.left = srcRect.left + srcRect.width / 2 - 8 + 'px';
  token.style.top = srcRect.top + srcRect.height / 2 - 8 + 'px';
  document.body.appendChild(token);
  requestAnimationFrame(function () {
    var dx = btnRect.left + btnRect.width / 2 - 8 - (srcRect.left + srcRect.width / 2 - 8);
    var dy = btnRect.top + btnRect.height / 2 - 8 - (srcRect.top + srcRect.height / 2 - 8);
    token.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease';
    token.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.3)';
    token.style.opacity = '0';
  });
  setTimeout(function () {
    if (token.parentNode) token.parentNode.removeChild(token);
  }, 550);
}

function addToWishlist(handle, source, sourceEl) {
  if (!handle) return;
  // Check for existing entry (handle may be string or object)
  var alreadySaved = _wishlistItems.some(function (item) {
    return (typeof item === 'string' ? item : item.handle) === handle;
  });
  if (alreadySaved) return;
  _wishlistItems.push({ handle: handle, discoveryRoom: immersiveState.currentRoom || null });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  _triggerHeartPulse();
  _flyToWishlist(sourceEl);
  if (typeof recordBrowsingSignal === 'function') recordBrowsingSignal(immersiveState.currentRoom);
  trackImmersiveEvent('wishlist_add', { product_handle: handle, source: source || 'unknown' });
}

function removeFromWishlist(handle, source) {
  if (!handle) return;
  _wishlistItems = _wishlistItems.filter(function (item) {
    return (typeof item === 'string' ? item : item.handle) !== handle;
  });
  _persistWishlist();
  updateWishlistBadge();
  syncAllWishlistToggles(document);
  trackImmersiveEvent('wishlist_remove', { product_handle: handle, source: source || 'unknown' });
}

function toggleWishlistItem(handle, source, sourceEl) {
  var isSaved = _wishlistItems.some(function (item) {
    return (typeof item === 'string' ? item : item.handle) === handle;
  });
  if (isSaved) {
    removeFromWishlist(handle, source);
  } else {
    addToWishlist(handle, source, sourceEl);
  }
}

function cacheWishlistProduct(handle, panelEl) {
  if (!handle || !panelEl) return;
  var titleEl = panelEl.querySelector('.glass-product-section__title');
  var priceEl = panelEl.querySelector('.glass-product-section__price');
  var imgEl = panelEl.querySelector('.glass-product-section__media-main img');
  if (!titleEl) return;
  // Issue 15: Add timestamp so stale cache entries can be detected
  _wishlistProductCache[handle] = {
    title: titleEl.textContent.trim(),
    price: priceEl ? priceEl.textContent.trim() : '',
    imageSrc: imgEl ? imgEl.getAttribute('src') : '',
    _cachedAt: Date.now(),
  };
}

// Issue 15: Check if a cached product entry is stale (older than 30 minutes)
function isWishlistCacheStale(handle) {
  var cached = _wishlistProductCache[handle];
  if (!cached) return true;
  if (!cached._cachedAt) return true; // No timestamp = treat as stale
  return Date.now() - cached._cachedAt > 30 * 60 * 1000; // 30 minutes
}

function renderEmptyState(type) {
  if (type === 'wishlist') {
    return (
      '<div class="immersive-wishlist-empty">' +
      '<p>' +
      escapeHtml('Your wishlist is empty') +
      '</p>' +
      '<button type="button" class="immersive-wishlist-empty__browse" data-wishlist-browse>Browse Collections</button>' +
      '</div>'
    );
  }
  return '<div class="immersive-empty-state"><p>No items found.</p></div>';
}

function renderWishlistPanel() {
  var body = document.querySelector('[data-wishlist-body]');
  var panelEl = document.getElementById('immersive-wishlist-panel');
  if (!body || !panelEl) return;

  var emptyMsg =
    panelEl.getAttribute('data-msg-empty-encouragement') ||
    panelEl.getAttribute('data-msg-empty') ||
    "You haven't saved any products yet.";
  var viewMsg = panelEl.getAttribute('data-msg-view') || 'View product';
  var removeMsg = panelEl.getAttribute('data-msg-remove') || 'Remove from wishlist';

  if (_wishlistItems.length === 0) {
    body.innerHTML = renderEmptyState('wishlist');
    return;
  }

  // Group items by discoveryRoom
  var groups = {};
  var groupOrder = [];
  for (var i = 0; i < _wishlistItems.length; i++) {
    var item = _wishlistItems[i];
    var handle = typeof item === 'string' ? item : item.handle;
    var room = (typeof item === 'string' ? null : item.discoveryRoom) || null;
    var groupKey = room || '__saved__';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
      groupOrder.push(groupKey);
    }
    groups[groupKey].push(handle);
  }

  var roomBadgeEl = document.getElementById('immersive-room-badge');
  var html = '';

  for (var g = 0; g < groupOrder.length; g++) {
    var groupKey = groupOrder[g];
    var handles = groups[groupKey];

    // Resolve room label
    var roomLabel;
    if (groupKey === '__saved__') {
      roomLabel = 'Saved';
    } else {
      roomLabel = (roomBadgeEl && roomBadgeEl.getAttribute('data-room-name-' + groupKey)) || groupKey;
    }

    html += '<h3 class="immersive-wishlist__room-label">Found in: ' + escapeHtml(roomLabel) + '</h3>';

    for (var j = 0; j < handles.length; j++) {
      var handle = handles[j];
      var cached = _wishlistProductCache[handle] || {};
      var title = cached.title || handle;
      var price = cached.price || '';
      var imgSrc = cached.imageSrc || '';
      var imgHtml = imgSrc
        ? '<img src="' +
          escapeHtml(imgSrc) +
          '" alt="' +
          escapeHtml(title) +
          '" loading="lazy" width="80" height="107">'
        : '<div style="width:80px;height:107px;background:rgba(255,255,255,0.05);border-radius:0.25rem;"></div>';

      html +=
        '<article class="immersive-wishlist-card" data-wishlist-card data-product-handle="' +
        escapeHtml(handle) +
        '">' +
        imgHtml +
        '<div class="immersive-wishlist-card__info">' +
        '<p class="immersive-wishlist-card__title">' +
        escapeHtml(title) +
        '</p>' +
        '<p class="immersive-wishlist-card__price">' +
        escapeHtml(price) +
        '</p>' +
        '</div>' +
        '<div class="immersive-wishlist-card__actions">' +
        '<button type="button" data-wishlist-view data-product-handle="' +
        escapeHtml(handle) +
        '" aria-label="' +
        escapeHtml(viewMsg) +
        ' ' +
        escapeHtml(title) +
        '">' +
        escapeHtml(viewMsg) +
        '</button>' +
        '<button type="button" data-wishlist-remove data-product-handle="' +
        escapeHtml(handle) +
        '" aria-label="' +
        escapeHtml(removeMsg) +
        '">' +
        escapeHtml(removeMsg) +
        '</button>' +
        '</div>' +
        '</article>';
    }
  }

  body.innerHTML = html;
}

function openWishlistPanel() {
  var panel = document.getElementById('immersive-wishlist-panel');
  if (!panel) return;
  _wishlistPanelTrigger = document.activeElement;
  renderWishlistPanel();
  panel.removeAttribute('hidden');
  var closeBtn = panel.querySelector('[data-wishlist-close]');
  if (closeBtn) {
    requestAnimationFrame(function () {
      closeBtn.focus();
    });
  }
  // Wire focus trap and Escape via a lightweight inline handler
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusableElements(panel);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  function onEscape(e) {
    if (e.key === 'Escape') closeWishlistPanel();
  }
  panel._wlTrapFocus = trapFocus;
  panel._wlEscape = onEscape;
  panel.addEventListener('keydown', trapFocus);
  panel.addEventListener('keydown', onEscape);

  // Add click handler for empty state actions
  function handleWishlistClick(e) {
    var emptyAction = e.target.closest('[data-empty-action]');
    if (emptyAction) {
      var action = emptyAction.getAttribute('data-empty-action');
      if (action) {
        handleEmptyStateAction(action);
      }
      return;
    }
  }
  panel._wlClickHandler = handleWishlistClick;
  panel.addEventListener('click', handleWishlistClick);

  trackImmersiveEvent('wishlist_panel_opened', { item_count: _wishlistItems.length });
}

function closeWishlistPanel() {
  var panel = document.getElementById('immersive-wishlist-panel');
  if (!panel) return;
  if (panel._wlTrapFocus) panel.removeEventListener('keydown', panel._wlTrapFocus);
  if (panel._wlEscape) panel.removeEventListener('keydown', panel._wlEscape);
  if (panel._wlClickHandler) panel.removeEventListener('click', panel._wlClickHandler);
  panel.setAttribute('hidden', '');
  if (_wishlistPanelTrigger && typeof _wishlistPanelTrigger.focus === 'function') {
    requestAnimationFrame(function () {
      _wishlistPanelTrigger.focus();
    });
  }
  _wishlistPanelTrigger = null;
}

function initWishlist() {
  try {
    var stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    var raw = Array.isArray(stored) ? stored : [];
    var needsMigration = !localStorage.getItem(WISHLIST_KEY + '_v2');
    // Migrate old string-format items to object format (only once)
    _wishlistItems = raw.map(function (item) {
      if (typeof item === 'string') return { handle: item, discoveryRoom: null };
      return item;
    });
    if (needsMigration) {
      localStorage.setItem(WISHLIST_KEY + '_v2', '1');
    }
  } catch (e) {
    _wishlistItems = [];
  }
  updateWishlistBadge();
  syncAllWishlistToggles(document);

  // Single delegated listener for all wishlist interactions
  document.addEventListener('click', function (e) {
    // Open panel
    if (e.target.closest('[data-wishlist-open]')) {
      openWishlistPanel();
      return;
    }
    // Close panel
    if (e.target.closest('[data-wishlist-close]')) {
      closeWishlistPanel();
      return;
    }
    // Toggle (card or product panel)
    var toggle = e.target.closest('[data-wishlist-toggle]');
    if (toggle) {
      var handle = toggle.getAttribute('data-product-handle');
      var source = toggle.closest('#glass-panel') ? 'product_panel' : 'product_card';
      if (handle) toggleWishlistItem(handle, source, toggle);
      return;
    }
    // Remove from wishlist panel
    var removeBtn = e.target.closest('[data-wishlist-remove]');
    if (removeBtn) {
      var rHandle = removeBtn.getAttribute('data-product-handle');
      if (rHandle) {
        removeFromWishlist(rHandle, 'wishlist_panel');
        var card = removeBtn.closest('[data-wishlist-card]');
        if (card) card.parentNode.removeChild(card);
        // Show empty state if no cards remain
        var body = document.querySelector('[data-wishlist-body]');
        if (body && !body.querySelector('[data-wishlist-card]')) {
          renderWishlistPanel();
        }
      }
      return;
    }
    // View product from wishlist panel
    var viewBtn = e.target.closest('[data-wishlist-view]');
    if (viewBtn) {
      var vHandle = viewBtn.getAttribute('data-product-handle');
      if (vHandle) {
        trackImmersiveEvent('wishlist_view_product', { product_handle: vHandle });
        closeWishlistPanel();
        openProductPanel(vHandle, null);
      }
      return;
    }
  });
}

function loadProductRecommendations(panel) {
  var sectionEl = panel.querySelector('.glass-product-section');
  var relatedRoot = panel.querySelector('[data-related-root]');
  if (!sectionEl || !relatedRoot) return;

  var productId = sectionEl.getAttribute('data-product-id');
  if (!productId) return;

  // Use the existing Dawn related-products section for rendering
  var url =
    shopRoot +
    'recommendations/products?product_id=' +
    encodeURIComponent(productId) +
    '&limit=4&intent=related' +
    '&section_id=glass-product-recommendations';

  fetchWithCache(url)
    .then(function (html) {
      if (html && html.trim()) relatedRoot.innerHTML = html;
    })
    .catch(function () {
      // Silent failure — leave relatedRoot empty, panel remains usable
    });
}

function bindImmersiveNav() {
  // 1. Wire cart toggle to Dawn's cart-drawer web component
  var cartToggle = document.getElementById('cart-toggle');
  if (cartToggle) {
    cartToggle.addEventListener('click', function () {
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        cartDrawer.open(cartToggle);
      } else {
        window.location.href = shopRoot + 'cart';
      }
    });
  }

  // 1b. Wire 3D→2D mode switch — clears the 3D preference so the
  //     preference banner won't nudge the user back to 3D immediately.
  var modeSwitchBtn = document.querySelector('[data-mode-switch-2d]');
  if (modeSwitchBtn) {
    modeSwitchBtn.addEventListener('click', function () {
      clearImmersivePreference();
    });
  }

  // 2. Intercept menu-drawer link clicks so collection/product links open
  //    inside the glass panel instead of navigating away.
  var menuDrawerEl = document.getElementById('menu-drawer');
  if (menuDrawerEl) {
    menuDrawerEl.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href') || '';

      // Match /collections/{handle} — open collection panel
      var collectionMatch = href.match(/\/collections\/([^/?#]+)/);
      if (collectionMatch) {
        e.preventDefault();
        closeMenuDrawer();
        openCollectionPanel(collectionMatch[1]);
        return;
      }

      // Match /products/{handle} — open product panel
      var productMatch = href.match(/\/products\/([^/?#]+)/);
      if (productMatch) {
        e.preventDefault();
        closeMenuDrawer();
        openProductPanel(productMatch[1], null);
        return;
      }

      // All other links (pages, external, etc.) navigate normally —
      // just close the drawer first so it doesn't stay open mid-navigation
      closeMenuDrawer();
    });
  }
}

function closeMenuDrawer() {
  var details = document.getElementById('Details-menu-drawer-container');
  if (details) details.removeAttribute('open');
}

function bindCookieBanner() {
  var banner = document.getElementById('immersive-cookie-banner');
  if (!banner) return;

  var COOKIE_KEY = 'immersive_cookie_notice';
  try {
    if (localStorage.getItem(COOKIE_KEY)) return; // already dismissed
  } catch (e) {}

  // Show the banner
  banner.removeAttribute('hidden');

  function dismiss() {
    banner.setAttribute('hidden', '');
    try {
      localStorage.setItem(COOKIE_KEY, '1');
    } catch (e) {}
  }

  var acceptBtn = document.getElementById('immersive-cookie-accept');
  var declineBtn = document.getElementById('immersive-cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', dismiss);
  if (declineBtn) declineBtn.addEventListener('click', dismiss);
}

// ---------------------------------------------------------------------------
// ImmersiveEditorial — reusable timeline + dynamic product loader

// ---------------------------------------------------------------------------
// ImmersiveEditorial — reusable timeline + dynamic product loader
// Exposed on window.ImmersiveEditorial so enterEditorialMode can call
// ImmersiveEditorial.init(overlayContent) after injecting section HTML.
// Supports any editorial room that uses the .immersive-designers pattern.
// ---------------------------------------------------------------------------
(function () {
  // Section ID used with the Section Rendering API to fetch product grids.
  // Matches sections/immersive-designer-grid.liquid.
  var PRODUCTS_SECTION_ID = 'immersive-designer-grid';

  // Minimum px movement before a drag is committed (avoids accidental drags on click)
  var DRAG_THRESHOLD = 4;

  function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMoneyFromCents(cents) {
    var amount = Number(cents || 0) / 100;
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      try {
        return window.Shopify.formatMoney(cents);
      } catch (e) {}
    }
    return '$' + amount.toFixed(2);
  }

  function renderTimelineProductsFallback(productsContainer, products) {
    if (!productsContainer) return;
    if (!Array.isArray(products) || !products.length) {
      productsContainer.innerHTML = '';
      return;
    }
    var cards = products
      .map(function (product) {
        var title = escapeHtml(product.title || '');
        var handle = escapeHtml(product.handle || '');
        var productUrl = shopRoot + 'products/' + handle;
        var imgSrc = '';
        if (product.image && product.image.src) {
          imgSrc = product.image.src;
        } else if (Array.isArray(product.images) && product.images.length) {
          imgSrc = product.images[0];
        }
        var media = imgSrc
          ? '<a href="' +
            productUrl +
            '" class="immersive-product-link" data-product-handle="' +
            handle +
            '">' +
            '<img class="immersive-product-image" src="' +
            escapeHtml(imgSrc) +
            '" alt="' +
            title +
            '" loading="lazy">' +
            '</a>'
          : '<div class="immersive-product-image immersive-product-image-placeholder">No image</div>';
        return (
          '<article class="immersive-product-card" data-product-handle="' +
          handle +
          '">' +
          media +
          '<div class="immersive-product-info">' +
          '<h3 class="immersive-product-title"><a href="' +
          productUrl +
          '" class="immersive-product-title-link" data-product-handle="' +
          handle +
          '">' +
          title +
          '</a></h3>' +
          '<div class="immersive-product-price"><span>' +
          formatMoneyFromCents(product.price_min || product.price || 0) +
          '</span></div>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');
    productsContainer.innerHTML = '<div class="immersive-designer-grid">' + cards + '</div>';
  }

  // ---------------------------------------------------------------------------
  // Product loading via Section Rendering API
  // ---------------------------------------------------------------------------
  function loadTimelineCollection(markerEl, productsContainer, options) {
    if (!markerEl || !productsContainer) return;
    // Read canonical data-collection first; fall back to legacy data-collection-handle
    var handle = markerEl.getAttribute('data-collection') || markerEl.getAttribute('data-collection-handle') || '';
    if (!handle) {
      productsContainer.innerHTML = '';
      return;
    }
    var sectionId = (options && options.productsSectionId) || PRODUCTS_SECTION_ID;
    var url = '/collections/' + encodeURIComponent(handle) + '?sections=' + encodeURIComponent(sectionId);

    productsContainer.innerHTML =
      '<div class="immersive-designers__products-loading" aria-live="polite" role="status">' +
      (options && options.loadingText ? options.loadingText : 'Loading\u2026') +
      '</div>';

    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (response) {
        if (!response.ok) throw new Error('Network error ' + response.status);
        return response.json();
      })
      .then(function (json) {
        var html = json[sectionId];
        if (!html) {
          return fetch(shopRoot + 'collections/' + encodeURIComponent(handle) + '/products.json?limit=12', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          })
            .then(function (res) {
              if (!res.ok) throw new Error('Products API error ' + res.status);
              return res.json();
            })
            .then(function (productsJson) {
              renderTimelineProductsFallback(productsContainer, productsJson && productsJson.products);
            });
        }
        productsContainer.innerHTML = html;
      })
      .catch(function (err) {
        console.warn('[ImmersiveEditorial] Product load failed:', err);
        productsContainer.innerHTML = '';
      });
  }

  // ---------------------------------------------------------------------------
  // Timeline thumb positioning
  // ---------------------------------------------------------------------------
  function positionThumb(thumb, activeMarker, rail) {
    if (!thumb || !activeMarker || !rail) return;
    var railRect = rail.getBoundingClientRect();
    var markerRect = activeMarker.getBoundingClientRect();
    var left = markerRect.left - railRect.left;
    var width = markerRect.width;
    // Offset thumb to sit behind the rail's own padding
    thumb.style.left = left + 'px';
    thumb.style.width = width + 'px';
  }

  // ---------------------------------------------------------------------------
  // Activate a marker: update ARIA/classes, move thumb, load products
  // ---------------------------------------------------------------------------
  function activateMarker(markers, thumb, rail, productsContainer, index, options, root) {
    var target = markers[index];
    if (!target) return;

    for (var i = 0; i < markers.length; i++) {
      markers[i].classList.remove('is-active');
      markers[i].setAttribute('aria-pressed', 'false');
    }
    target.classList.add('is-active');
    target.setAttribute('aria-pressed', 'true');

    positionThumb(thumb, target, rail);
    loadTimelineCollection(target, productsContainer, options);

    // Kinetic Hero Transition
    var heroStates = root.querySelectorAll('.immersive-designers__hero-state');
    heroStates.forEach(function (state) {
      state.classList.remove('is-active');
      if (parseInt(state.getAttribute('data-hero-index'), 10) === index) {
        state.classList.add('is-active');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Snap to nearest marker based on pointer X position over the rail
  // ---------------------------------------------------------------------------
  function snapToNearest(markers, pointerX, railRect) {
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < markers.length; i++) {
      var rect = markers[i].getBoundingClientRect();
      var center = rect.left + rect.width / 2;
      var dist = Math.abs(pointerX - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  // ---------------------------------------------------------------------------
  // Wire up a single .immersive-designers container
  // ---------------------------------------------------------------------------
  function initDesignersTimeline(root, options) {
    if (root._designersTimelineInitialized) return;
    root._designersTimelineInitialized = true;

    var rail = root.querySelector('.immersive-designers__rail');
    var thumb = root.querySelector('.immersive-designers__thumb');
    var roomKey = root.getAttribute('data-room-key') || 'designers';
    var productsContainer = root.querySelector('.immersive-designers__products');

    if (!rail || !thumb || !productsContainer) return;

    var markers = Array.prototype.slice.call(rail.querySelectorAll('.immersive-designers__marker'));
    if (!markers.length) return;

    var activeIndex = 0;
    var dragging = false;
    var dragStartX = 0;
    var dragMoved = false;

    // Activate first marker on init (after layout is painted)
    requestAnimationFrame(function () {
      activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
    });

    // Click on a marker
    markers.forEach(function (marker, i) {
      marker.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      marker.addEventListener('click', function (event) {
        if (dragMoved) return; // swallow click that ended a drag
        event.preventDefault();
        event.stopPropagation();
        activeIndex = i;
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
      });
    });

    // Keyboard: arrow keys move between markers
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = clamp(activeIndex + 1, 0, markers.length - 1);
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
        markers[activeIndex].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = clamp(activeIndex - 1, 0, markers.length - 1);
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
        markers[activeIndex].focus();
      }
    });

    // Drag: pointer events on the rail for smooth scrubbing
    rail.addEventListener('pointerdown', function (e) {
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      rail.setPointerCapture(e.pointerId);
    });

    rail.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - dragStartX) > DRAG_THRESHOLD) {
        dragMoved = true;
      }
      if (!dragMoved) return;
      var railRect = rail.getBoundingClientRect();
      var nearest = snapToNearest(markers, e.clientX, railRect);
      if (nearest !== activeIndex) {
        activeIndex = nearest;
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
      }
    });

    rail.addEventListener('pointerup', function (e) {
      if (dragging && dragMoved) {
        var railRect = rail.getBoundingClientRect();
        activeIndex = snapToNearest(markers, e.clientX, railRect);
        activateMarker(markers, thumb, rail, productsContainer, activeIndex, options, root);
      }
      dragging = false;
    });

    rail.addEventListener('pointercancel', function () {
      dragging = false;
    });

    // Re-position thumb on resize (font/layout changes can shift markers)
    var resizeTimer;
    ListenerRegistry.add('rail-resize', window, 'resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var active = markers[activeIndex];
        if (active) positionThumb(thumb, active, rail);
      }, 120);
    });
  }

  function initStoryChapters(container) {
    var chapters = Array.prototype.slice.call(
      (container || document).querySelectorAll('.immersive-occasions__chapter'),
    );
    if (!chapters.length) return;
    if (!('IntersectionObserver' in window)) {
      chapters[0].classList.add('is-active');
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          chapters.forEach(function (chapter) {
            chapter.classList.remove('is-active');
          });
          entry.target.classList.add('is-active');
        });
      },
      { root: document.getElementById('immersive-editorial-overlay') || null, threshold: 0.45 },
    );
    chapters.forEach(function (chapter, index) {
      if (index === 0) chapter.classList.add('is-active');
      observer.observe(chapter);
    });
  }

  function initGalleryDrag(container) {
    var scrollers = Array.prototype.slice.call((container || document).querySelectorAll('.immersive-featured__grid'));
    scrollers.forEach(function (scroller) {
      if (scroller._immersiveGalleryBound) return;
      scroller._immersiveGalleryBound = true;
      var down = false;
      var startX = 0;
      var startScroll = 0;

      scroller.addEventListener(
        'wheel',
        function (event) {
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
          event.preventDefault();
          scroller.scrollLeft += event.deltaY;
        },
        { passive: false },
      );

      scroller.addEventListener('pointerdown', function (event) {
        down = true;
        startX = event.clientX;
        startScroll = scroller.scrollLeft;
        scroller.classList.add('is-dragging');
        scroller.setPointerCapture(event.pointerId);
      });

      scroller.addEventListener('pointermove', function (event) {
        if (!down) return;
        scroller.scrollLeft = startScroll - (event.clientX - startX);
      });

      function endDrag() {
        down = false;
        scroller.classList.remove('is-dragging');
      }

      scroller.addEventListener('pointerup', endDrag);
      scroller.addEventListener('pointercancel', endDrag);
      scroller.addEventListener('pointerleave', endDrag);
    });
  }

  function createMuseumChrome(root) {
    if (!root || root._museumChromeReady) return;
    root._museumChromeReady = true;
    root.setAttribute('data-museum-mode', 'codex');

    var nav = document.createElement('div');
    nav.className = 'immersive-museum-nav';
    nav.innerHTML =
      '<div class="immersive-museum-nav__title">INDEX</div>' +
      '<button type="button" class="immersive-museum-nav__mode is-active" data-museum-mode-btn="codex">CODEX</button>' +
      '<button type="button" class="immersive-museum-nav__mode" data-museum-mode-btn="story">STORY</button>' +
      '<div class="immersive-museum-nav__hint">DRAG/SCROLL TO EXPLORE | CLICK TO STUDY ARTIFACT</div>';
    root.insertBefore(nav, root.firstChild);

    nav.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-museum-mode-btn]');
      if (!btn) return;
      var mode = btn.getAttribute('data-museum-mode-btn');
      root.setAttribute('data-museum-mode', mode);
      nav.querySelectorAll('[data-museum-mode-btn]').forEach(function (item) {
        item.classList.toggle('is-active', item === btn);
      });
    });
  }

  function getArtifactData(trigger) {
    if (!trigger) return null;
    var image =
      trigger.getAttribute('data-artifact-image') ||
      (trigger.querySelector('img') && trigger.querySelector('img').getAttribute('src')) ||
      '';
    var title =
      trigger.getAttribute('data-artifact-title') ||
      trigger.getAttribute('data-designer-label') ||
      (trigger.querySelector('h3, .immersive-featured__item-heading, .immersive-occasions__chapter-heading') &&
        trigger.querySelector('h3, .immersive-featured__item-heading, .immersive-occasions__chapter-heading')
          .textContent) ||
      '';
    var body =
      trigger.getAttribute('data-artifact-body') ||
      (trigger.querySelector(
        '.immersive-featured__item-body, .immersive-occasions__chapter-body, .immersive-designers__manifest',
      ) &&
        trigger.querySelector(
          '.immersive-featured__item-body, .immersive-occasions__chapter-body, .immersive-designers__manifest',
        ).textContent) ||
      '';
    var collection = trigger.getAttribute('data-collection') || trigger.getAttribute('data-collection-handle') || '';
    return { image: image, title: title.trim(), body: body.trim(), collection: collection };
  }

  function openArtifactStudy(root, trigger) {
    var data = getArtifactData(trigger);
    if (!data || !data.title) return;
    var study = root.querySelector('.immersive-artifact-study');
    if (!study) {
      study = document.createElement('aside');
      study.className = 'immersive-artifact-study';
      study.setAttribute('aria-live', 'polite');
      root.appendChild(study);
    }
    study.innerHTML =
      '<button type="button" class="immersive-artifact-study__close" data-artifact-close>Close</button>' +
      (data.image ? '<img class="immersive-artifact-study__image" src="' + escapeHtml(data.image) + '" alt="">' : '') +
      '<div class="immersive-artifact-study__meta">Artifact study</div>' +
      '<h3 class="immersive-artifact-study__title">' +
      escapeHtml(data.title) +
      '</h3>' +
      (data.body ? '<p class="immersive-artifact-study__body">' + escapeHtml(data.body) + '</p>' : '') +
      (data.collection
        ? '<button type="button" class="immersive-artifact-study__cta" data-artifact-collection="' +
          escapeHtml(data.collection) +
          '">View collection</button>'
        : '');
    root.classList.add('is-studying-artifact');
    study.removeAttribute('hidden');
    var closeBtn = study.querySelector('[data-artifact-close]');
    if (closeBtn) closeBtn.focus();
  }

  function initArtifactStudy(container) {
    var roots = Array.prototype.slice.call(
      (container || document).querySelectorAll(
        '.immersive-editorial--layout-designers, .immersive-editorial--layout-occasions, .immersive-editorial--layout-featured_collections',
      ),
    );
    roots.forEach(function (root) {
      createMuseumChrome(root);
      if (root._artifactStudyBound) return;
      root._artifactStudyBound = true;
      root.addEventListener(
        'click',
        function (event) {
          var close = event.target.closest('[data-artifact-close]');
          if (close) {
            var study = root.querySelector('.immersive-artifact-study');
            if (study) study.setAttribute('hidden', '');
            root.classList.remove('is-studying-artifact');
            return;
          }
          var collectionBtn = event.target.closest('[data-artifact-collection]');
          if (collectionBtn) {
            var handle = collectionBtn.getAttribute('data-artifact-collection');
            if (handle) {
              event.preventDefault();
              exitEditorialMode();
              setTimeout(function () {
                openCollectionPanel(handle);
              }, 120);
            }
            return;
          }
          var trigger = event.target.closest('[data-artifact-open]');
          if (!trigger || !root.contains(trigger)) return;

          // ── Collection routing takes priority over artifact study ──
          //
          // Key principle: if the user deliberately clicked an element that
          // itself has data-artifact-open (e.g. a study badge), honor that
          // intent. Only promote collection routing when the artifact-open
          // attribute lives on a container ancestor and the actual click
          // target carries a collection route.
          //
          // Check in this order:
          //   1. If event.target IS the artifact-open element → only route
          //      to collection if the target itself has data-collection.
          //   2. If event.target is INSIDE an artifact-open container →
          //      check if the target (or its closest wrapper) has
          //      data-collection → route to collection.
          //   3. Otherwise → open artifact study.

          var targetIsArtifactOpen = event.target.hasAttribute('data-artifact-open');
          var collectionHandle = '';

          if (targetIsArtifactOpen) {
            // Case 1: user clicked directly on an artifact-open element.
            // Only promote to collection routing if this element itself
            // carries a collection handle.
            collectionHandle =
              event.target.getAttribute('data-collection') || event.target.getAttribute('data-collection-handle') || '';
          } else {
            // Case 2: user clicked inside an artifact-open container.
            // Check the actual click target for a collection route first.
            collectionHandle =
              event.target.getAttribute('data-collection') || event.target.getAttribute('data-collection-handle') || '';

            // Also check if the target is wrapped in a collection element
            // (e.g. an <a> with data-collection inside an <article>).
            if (!collectionHandle) {
              var targetCollectionWrapper = event.target.closest('[data-collection], [data-collection-handle]');
              if (targetCollectionWrapper && root.contains(targetCollectionWrapper)) {
                collectionHandle =
                  targetCollectionWrapper.getAttribute('data-collection') ||
                  targetCollectionWrapper.getAttribute('data-collection-handle') ||
                  '';
              }
            }
          }

          if (collectionHandle) {
            // Do NOT intercept — let the bubbling overlay handler route to
            // openCollectionPanel(). No preventDefault / stopPropagation.
            return;
          }

          // No collection route — safe to open artifact study
          event.preventDefault();
          event.stopPropagation();
          openArtifactStudy(root, trigger);
        },
        true,
      );
    });
  }

  function init(container, options) {
    var roots = (container || document).querySelectorAll('.immersive-designers');
    for (var i = 0; i < roots.length; i++) {
      initDesignersTimeline(roots[i], options || {});
    }
    initStoryChapters(container);
    initGalleryDrag(container);
    initArtifactStudy(container);
  }

  window.ImmersiveEditorial = { init: init };
})();

// ============================================================
// ImmersiveExclusiveCarousel — 3D CSS ring carousel with drag/snap
// ============================================================
(function () {
  var _carouselInstances = [];

  function initCarousel(section) {
    if (!section || section._carouselBound) return;
    if (window.innerWidth < 768) return;

    var stage = section.querySelector('[data-carousel-stage]');
    var ring = section.querySelector('[data-carousel-ring]');
    var panels = section.querySelectorAll('[data-carousel-panel]');
    var hint = section.querySelector('[data-carousel-hint]');

    if (!ring || !panels.length) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var radius = parseInt(section.getAttribute('data-ring-radius') || '420', 10);
    var friction = parseFloat(section.getAttribute('data-drag-friction') || '0.88');
    var snapStrength = parseFloat(section.getAttribute('data-snap-strength') || '0.12');

    var count = panels.length;
    var angleStep = 360 / count;

    panels.forEach(function (panel, i) {
      var angle = angleStep * i;
      panel.style.transform = 'rotateY(' + angle + 'deg) translateZ(' + radius + 'px)';
    });

    var currentAngle = 0;
    var targetAngle = 0;
    var velocity = 0;
    var isDragging = false;
    var lastX = 0;
    var rafId = null;

    var snapToNearest = function () {
      var nearest = Math.round(targetAngle / angleStep) * angleStep;
      targetAngle = nearest;
    };

    var animate = function () {
      rafId = null;

      if (!isDragging) {
        velocity *= friction;
        targetAngle += velocity;
        currentAngle += (targetAngle - currentAngle) * snapStrength;
      } else {
        currentAngle += (targetAngle - currentAngle) * 0.3;
      }

      ring.style.transform = 'rotateY(' + -currentAngle + 'deg)';

      panels.forEach(function (panel, i) {
        var panelAngle = (angleStep * i - currentAngle) % 360;
        while (panelAngle > 180) panelAngle -= 360;
        while (panelAngle < -180) panelAngle += 360;

        var absAngle = Math.abs(panelAngle);
        var opacity = absAngle > 90 ? 0 : 1 - (absAngle / 90) * 0.4;
        panel.style.opacity = opacity;
      });

      if (Math.abs(velocity) > 0.05 || Math.abs(targetAngle - currentAngle) > 0.05) {
        rafId = requestAnimationFrame(animate);
      }
    };

    var startRaf = function () {
      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    if (!prefersReducedMotion) {
      stage.addEventListener('pointerdown', function (e) {
        isDragging = true;
        lastX = e.clientX;
        velocity = 0;
        stage.setPointerCapture(e.pointerId);
        if (hint) hint.setAttribute('hidden', '');
        startRaf();
      });

      stage.addEventListener('pointermove', function (e) {
        if (!isDragging) return;
        var dx = e.clientX - lastX;
        lastX = e.clientX;
        velocity = dx * 0.4;
        targetAngle += dx * 0.25;
        startRaf();
      });

      stage.addEventListener('pointerup', function () {
        isDragging = false;
        snapToNearest();
        startRaf();
      });

      stage.addEventListener('pointercancel', function () {
        isDragging = false;
        snapToNearest();
        startRaf();
      });

      targetAngle = angleStep * 0.5;
      startRaf();
    } else {
      ring.style.transform = 'rotateY(0deg)';
      panels.forEach(function (panel) {
        panel.style.opacity = '1';
      });
    }

    section.addEventListener('click', function (e) {
      if (Math.abs(velocity) > 2) return;

      var card = e.target.closest('[data-carousel-panel]');
      if (!card) return;

      var handle = card.getAttribute('data-product-handle');
      if (!handle) return;

      if (typeof window.openProductPanel === 'function') {
        e.preventDefault();
        window.openProductPanel(handle);
      }
    });

    section._carouselBound = true;
    _carouselInstances.push({
      section: section,
      rafId: rafId,
      stop: function () {
        if (rafId) cancelAnimationFrame(rafId);
      },
    });
  }

  function initAll(container) {
    var roots = (container || document).querySelectorAll('[data-immersive-exclusive-carousel]');
    for (var i = 0; i < roots.length; i++) {
      initCarousel(roots[i]);
    }
  }

  function destroyAll() {
    _carouselInstances.forEach(function (inst) {
      inst.stop();
    });
    _carouselInstances = [];
  }

  window.ImmersiveCarousel = { init: initAll, initCarousel: initCarousel, destroy: destroyAll };
})();

// ============================================================
// CodexCollectionsGrid — filterable collection card grid
// ============================================================
(function () {
  function initCodexGrid(section) {
    if (!section || section._codexGridBound) return;

    var pills = section.querySelectorAll('[data-codex-filter]');
    var items = section.querySelectorAll('[data-codex-theme]');

    if (!pills.length) return;

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var filter = pill.getAttribute('data-codex-filter');

        pills.forEach(function (p) {
          var isActive = p === pill;
          p.classList.toggle('is-active', isActive);
          p.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        items.forEach(function (item) {
          var theme = item.getAttribute('data-codex-theme') || '';
          var visible = filter === 'all' || theme === filter;
          if (visible) {
            item.removeAttribute('hidden');
          } else {
            item.setAttribute('hidden', '');
          }
        });
      });
    });

    section.addEventListener('click', function (e) {
      var link = e.target.closest('[data-immersive-bridge]');
      if (!link) return;

      var card = link.closest('[data-codex-collection-card]');
      if (!card) return;

      var handle = card.getAttribute('data-collection-handle');
      if (!handle) return;

      if (typeof window.openCollectionPanel === 'function') {
        e.preventDefault();
        window.openCollectionPanel(handle);
      }
    });

    section._codexGridBound = true;
  }

  function initAll(container) {
    var roots = (container || document).querySelectorAll('[data-codex-collections-grid]');
    for (var i = 0; i < roots.length; i++) {
      initCodexGrid(roots[i]);
    }
  }

  window.CodexCollectionsGrid = { init: initAll, initCodexGrid: initCodexGrid };
})();

// ============================================================
// ImmersiveStoryRail — chapter reveal animations + marquee
// ============================================================
(function () {
  var _sectionObservers = [];

  function initStoryRail(section) {
    if (!section || section._storyRailBound) return;

    var chapters = section.querySelectorAll('[data-story-chapter]');
    if (!chapters.length) return;

    var sectionId = section.getAttribute('data-section-id') || null;
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function dispatchStoryMode(active) {
      try {
        window.dispatchEvent(
          new CustomEvent('immersive:story-mode-change', {
            detail: { active: active },
            bubbles: false,
          }),
        );
      } catch (e) {}
    }

    if (prefersReducedMotion) {
      chapters.forEach(function (ch) {
        ch.classList.add('is-visible');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      chapters.forEach(function (ch) {
        ch.classList.add('is-visible');
      });
      return;
    }

    var chapterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            chapterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );

    chapters.forEach(function (ch) {
      chapterObserver.observe(ch);
    });
    _sectionObservers.push(chapterObserver);

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          dispatchStoryMode(entry.isIntersecting);
        });
      },
      { threshold: 0.4 },
    );
    sectionObserver.observe(section);
    _sectionObservers.push(sectionObserver);

    if (sectionId && typeof window !== 'undefined' && window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:section:select', function (e) {
        if (!e.detail || e.detail.sectionId !== sectionId) return;
        chapters.forEach(function (ch) {
          ch.classList.add('is-visible');
        });
        dispatchStoryMode(true);
      });

      document.addEventListener('shopify:section:deselect', function (e) {
        if (!e.detail || e.detail.sectionId !== sectionId) return;
        dispatchStoryMode(false);
      });
    }

    section._storyRailBound = true;
  }

  function initAll(container) {
    var roots = (container || document).querySelectorAll('[data-immersive-story-rail]');
    for (var i = 0; i < roots.length; i++) {
      initStoryRail(roots[i]);
    }
  }

  function destroyAll() {
    _sectionObservers.forEach(function (obs) {
      obs.disconnect();
    });
    _sectionObservers = [];
  }

  window.ImmersiveStoryRail = { init: initAll, initStoryRail: initStoryRail, destroy: destroyAll };

  if (typeof window !== 'undefined' && window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (e) {
      var section = e.target && e.target.querySelector('[data-immersive-story-rail]');
      if (section) initStoryRail(section);
    });
  }
})();

// ============================================================
// CodexTypoIndex — scroll parallax + collection bridge + theme registry
// ============================================================
(function () {
  var _scrollCleanups = [];

  function initTypoIndex(section) {
    if (!section || section._typoIndexBound) return;

    var rows = section.querySelectorAll('[data-codex-typo-row]');
    if (!rows.length) return;

    var prefersReducedMotion = false;
    try {
      if (window.matchMedia) {
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    } catch (e) {}

    if (!prefersReducedMotion) {
      var scrollTarget = 0;
      var scrollCurrent = 0;
      var rafId = null;

      function onScroll() {
        scrollTarget = window.scrollY || window.pageYOffset;
        if (rafId === null) {
          rafId = requestAnimationFrame(tick);
        }
      }

      function tick() {
        rafId = null;
        scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;

        rows.forEach(function (row, i) {
          var direction = i % 2 === 0 ? 1 : -1;
          var offset = scrollCurrent * 0.012 * direction;
          if (offset > 24) offset = 24;
          if (offset < -24) offset = -24;
          row.style.transform = 'translateX(' + offset + 'px)';
        });

        if (Math.abs(scrollTarget - scrollCurrent) > 0.5) {
          rafId = requestAnimationFrame(tick);
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });

      var cleanup = function () {
        window.removeEventListener('scroll', onScroll);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };
      _scrollCleanups.push(cleanup);
    }

    section.addEventListener('click', function (e) {
      var link = e.target.closest('[data-immersive-bridge]');
      if (!link) return;

      var row = link.closest('[data-codex-typo-row]');
      if (!row) return;

      var handle = row.getAttribute('data-collection-handle');
      if (!handle) return;

      if (typeof window.openCollectionPanel === 'function') {
        e.preventDefault();
        window.openCollectionPanel(handle);
      }
    });

    if (!window.codexCollectionThemes) {
      window.codexCollectionThemes = {};
    }
    rows.forEach(function (row) {
      var handle = row.getAttribute('data-collection-handle');
      var theme = row.getAttribute('data-codex-theme');
      if (handle && theme) {
        window.codexCollectionThemes[handle] = theme;
      }
    });

    section._typoIndexBound = true;
  }

  function initAll(container) {
    var roots = (container || document).querySelectorAll('[data-codex-typo-index]');
    for (var i = 0; i < roots.length; i++) {
      initTypoIndex(roots[i]);
    }
  }

  function destroyAll() {
    _scrollCleanups.forEach(function (fn) {
      fn();
    });
    _scrollCleanups = [];
  }

  window.CodexTypoIndex = { init: initAll, initTypoIndex: initTypoIndex, destroy: destroyAll };

  // Expose destroy function globally so it can be called during section unload
  if (typeof window.ShahanaImmersive !== 'undefined') {
    if (!window.ShahanaImmersive.codexFeatures) {
      window.ShahanaImmersive.codexFeatures = {};
    }
    window.ShahanaImmersive.codexFeatures.destroyCodexTypoIndex = destroyAll;
  }

  if (typeof window !== 'undefined' && window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (e) {
      var section = e.target && e.target.querySelector('[data-codex-typo-index]');
      if (section) initTypoIndex(section);
    });
  }
})();

// ============================================================
// ImmersiveSearch — inline header search with Cmd/Ctrl+K
// ============================================================
// ImmersiveFilters — smart filters inside collection panels
// ============================================================

var FILTER_ALLOWED_PARAMS = ['filter.p.m.custom.color[]', 'filter.v.price.gte', 'filter.v.price.lte', 'sort_by'];

function saveFilters(roomKey, state) {
  try {
    sessionStorage.setItem('immersive_filters_' + roomKey, JSON.stringify(state));
  } catch (e) {}
}

function loadFilters(roomKey) {
  try {
    var raw = sessionStorage.getItem('immersive_filters_' + roomKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function buildFilterUrl(baseUrl, state) {
  var url = new URL(baseUrl, window.location.origin);
  // Remove any existing filter params
  FILTER_ALLOWED_PARAMS.forEach(function (key) {
    url.searchParams.delete(key);
  });
  // Also remove array-style color params
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

function renderActiveFilterChips(state) {
  var chips = '';
  if (state.colors && state.colors.length > 0) {
    for (var i = 0; i < state.colors.length; i++) {
      chips +=
        '<button type="button" class="immersive-filter-chip" data-remove-filter="color:' +
        escapeHtml(state.colors[i]) +
        '">' +
        '<span class="immersive-filter-chip__label">' +
        escapeHtml(state.colors[i]) +
        '</span>' +
        '<span class="immersive-filter-chip__remove" aria-label="Remove">&times;</span>' +
        '</button>';
    }
  }
  if (state.designers && state.designers.length > 0) {
    for (var j = 0; j < state.designers.length; j++) {
      chips +=
        '<button type="button" class="immersive-filter-chip" data-remove-filter="designer:' +
        escapeHtml(state.designers[j]) +
        '">' +
        '<span class="immersive-filter-chip__label">' +
        escapeHtml(state.designers[j]) +
        '</span>' +
        '<span class="immersive-filter-chip__remove" aria-label="Remove">&times;</span>' +
        '</button>';
    }
  }
  if (state.priceMin !== null && state.priceMin !== undefined && state.priceMin !== '') {
    chips +=
      '<button type="button" class="immersive-filter-chip" data-remove-filter="priceMin">' +
      '<span class="immersive-filter-chip__label">Min: $' +
      state.priceMin +
      '</span>' +
      '<span class="immersive-filter-chip__remove" aria-label="Remove">&times;</span>' +
      '</button>';
  }
  if (state.priceMax !== null && state.priceMax !== undefined && state.priceMax !== '') {
    chips +=
      '<button type="button" class="immersive-filter-chip" data-remove-filter="priceMax">' +
      '<span class="immersive-filter-chip__label">Max: $' +
      state.priceMax +
      '</span>' +
      '<span class="immersive-filter-chip__remove" aria-label="Remove">&times;</span>' +
      '</button>';
  }
  if (state.sortBy && state.sortBy !== 'manual') {
    chips +=
      '<button type="button" class="immersive-filter-chip" data-remove-filter="sortBy">' +
      '<span class="immersive-filter-chip__label">Sort: ' +
      escapeHtml(state.sortBy) +
      '</span>' +
      '<span class="immersive-filter-chip__remove" aria-label="Remove">&times;</span>' +
      '</button>';
  }
  chips +=
    '<button type="button" class="immersive-filter-chip immersive-filter-chip--clear" data-clear-all-filters>Clear All</button>';
  return chips;
}

function removeFilterChip(filterKey, currentState, applyFilters) {
  var parts = filterKey.split(':');
  var category = parts[0];
  var value = parts.length > 1 ? parts[1] : null;
  var newState = {
    colors: currentState.colors.slice(),
    priceMin: currentState.priceMin,
    priceMax: currentState.priceMax,
    designers: currentState.designers.slice(),
    sortBy: currentState.sortBy,
  };

  if (category === 'color') {
    newState.colors = newState.colors.filter(function (c) {
      return c !== value;
    });
  } else if (category === 'designer') {
    newState.designers = newState.designers.filter(function (d) {
      return d !== value;
    });
  } else if (category === 'priceMin') {
    newState.priceMin = null;
  } else if (category === 'priceMax') {
    newState.priceMax = null;
  } else if (category === 'sortBy') {
    newState.sortBy = 'manual';
  }

  applyFilters(newState);
}

function initImmersiveFilters(panelEl, collectionHandle, roomKey, sectionId) {
  if (!panelEl || !collectionHandle) return;

  var contentEl = panelEl.querySelector('.immersive-store__panel-content');
  if (!contentEl) return;

  var currentState = loadFilters(roomKey) || {
    colors: [],
    priceMin: null,
    priceMax: null,
    designers: [],
    sortBy: 'manual',
  };

  var baseUrl = '/collections/' + collectionHandle + '?section_id=' + (sectionId || 'immersive-product-grid');

  function applyFilters(state) {
    currentState = state;
    saveFilters(roomKey, state);

    // Update filter chips
    var chipsContainer = contentEl.querySelector('[data-filter-chips-container]');
    if (chipsContainer) {
      var hasActiveFilters =
        state.colors.length > 0 ||
        state.priceMin !== null ||
        state.priceMax !== null ||
        state.designers.length > 0 ||
        (state.sortBy && state.sortBy !== 'manual');

      if (hasActiveFilters) {
        chipsContainer.innerHTML = renderActiveFilterChips(state);
        chipsContainer.hidden = false;

        // Wire up chip removal handlers
        chipsContainer.querySelectorAll('[data-remove-filter]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var filterKey = btn.getAttribute('data-remove-filter');
            removeFilterChip(filterKey, currentState, applyFilters);
          });
        });

        // Wire up "Clear All" button
        var clearAllBtn = chipsContainer.querySelector('[data-clear-all-filters]');
        if (clearAllBtn) {
          clearAllBtn.addEventListener('click', function () {
            clearFilters();
          });
        }
      } else {
        chipsContainer.hidden = true;
        chipsContainer.innerHTML = '';
      }
    }

    var url = buildFilterUrl(baseUrl, state);
    fetchWithCache(url)
      .then(function (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var newGrid = tmp.querySelector('.immersive-product-grid-wrapper');
        var existingGrid = contentEl.querySelector('.immersive-product-grid-wrapper');
        if (newGrid && existingGrid) {
          existingGrid.replaceWith(newGrid);
        } else if (newGrid) {
          contentEl.appendChild(newGrid);
        }
        // Re-scan for limited-time indicators on new cards
        if (typeof scanLimitedTimeCards === 'function') scanLimitedTimeCards(contentEl);
      })
      .catch(function () {
        var errorMsg = panelEl.getAttribute('data-msg-load-collection-error') || 'Unable to load collection.';
        showFeedback(errorMsg, 'error');
      });
  }

  function clearFilters() {
    currentState = { colors: [], priceMin: null, priceMax: null, designers: [], sortBy: 'manual' };
    saveFilters(roomKey, currentState);

    // Hide filter chips
    var chipsContainer = contentEl.querySelector('[data-filter-chips-container]');
    if (chipsContainer) {
      chipsContainer.hidden = true;
      chipsContainer.innerHTML = '';
    }

    applyFilters(currentState);
    // Reset toolbar UI
    var toolbar = contentEl.querySelector('.immersive-filters');
    if (toolbar) {
      toolbar.querySelectorAll('.immersive-filters__color-swatch').forEach(function (s) {
        s.setAttribute('aria-pressed', 'false');
        s.classList.remove('is-active');
      });
      toolbar.querySelectorAll('.immersive-filters__designer-chip').forEach(function (c) {
        c.setAttribute('aria-pressed', 'false');
        c.classList.remove('is-active');
      });
      var minInput = toolbar.querySelector('[data-filter-price-min]');
      var maxInput = toolbar.querySelector('[data-filter-price-max]');
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';
      var sortSelect = toolbar.querySelector('[data-filter-sort]');
      if (sortSelect) sortSelect.value = 'manual';
    }
  }

  function buildToolbar() {
    // Extract colors and designers from rendered product cards
    var colors = [];
    var designers = [];
    contentEl.querySelectorAll('[data-product-handle]').forEach(function (card) {
      var color = card.getAttribute('data-product-color');
      var vendor = card.getAttribute('data-product-vendor');
      if (color && colors.indexOf(color) === -1) colors.push(color);
      if (vendor && designers.indexOf(vendor) === -1) designers.push(vendor);
    });

    var toolbar = document.createElement('div');
    toolbar.className = 'immersive-filters';
    toolbar.setAttribute('data-immersive-filters', '');

    // Sort
    var sortRow = document.createElement('div');
    sortRow.className = 'immersive-filters__row';
    var sortSelect = document.createElement('select');
    sortSelect.className = 'immersive-filters__sort';
    sortSelect.setAttribute('data-filter-sort', '');
    sortSelect.setAttribute('aria-label', 'Sort by');
    [
      { value: 'manual', label: 'Featured' },
      { value: 'price-ascending', label: 'Price: Low to High' },
      { value: 'price-descending', label: 'Price: High to Low' },
      { value: 'title-ascending', label: 'A–Z' },
    ].forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      if (currentState.sortBy === opt.value) o.selected = true;
      sortSelect.appendChild(o);
    });
    sortSelect.addEventListener('change', function () {
      currentState.sortBy = sortSelect.value;
      applyFilters(currentState);
    });
    sortRow.appendChild(sortSelect);

    // Price range
    var priceRow = document.createElement('div');
    priceRow.className = 'immersive-filters__row immersive-filters__price-row';
    var minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.className = 'immersive-filters__price-input';
    minInput.setAttribute('data-filter-price-min', '');
    minInput.placeholder = 'Min PKR';
    minInput.value = currentState.priceMin || '';
    var maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.className = 'immersive-filters__price-input';
    maxInput.setAttribute('data-filter-price-max', '');
    maxInput.placeholder = 'Max PKR';
    maxInput.value = currentState.priceMax || '';
    var priceApply = document.createElement('button');
    priceApply.type = 'button';
    priceApply.className = 'immersive-filters__price-apply';
    priceApply.textContent = 'Apply';
    priceApply.addEventListener('click', function () {
      currentState.priceMin = minInput.value ? Number(minInput.value) : null;
      currentState.priceMax = maxInput.value ? Number(maxInput.value) : null;
      applyFilters(currentState);
    });
    priceRow.appendChild(minInput);
    priceRow.appendChild(maxInput);
    priceRow.appendChild(priceApply);

    // Colors
    if (colors.length) {
      var colorRow = document.createElement('div');
      colorRow.className = 'immersive-filters__row immersive-filters__color-row';
      colors.forEach(function (color) {
        var swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'immersive-filters__color-swatch';
        swatch.setAttribute('aria-pressed', currentState.colors.indexOf(color) !== -1 ? 'true' : 'false');
        swatch.setAttribute('aria-label', color);
        swatch.setAttribute('title', color);
        swatch.style.background = color.toLowerCase();
        if (currentState.colors.indexOf(color) !== -1) swatch.classList.add('is-active');
        swatch.addEventListener('click', function () {
          var idx = currentState.colors.indexOf(color);
          if (idx === -1) {
            currentState.colors.push(color);
            swatch.setAttribute('aria-pressed', 'true');
            swatch.classList.add('is-active');
          } else {
            currentState.colors.splice(idx, 1);
            swatch.setAttribute('aria-pressed', 'false');
            swatch.classList.remove('is-active');
          }
          applyFilters(currentState);
        });
        colorRow.appendChild(swatch);
      });
      toolbar.appendChild(colorRow);
    }

    // Designers
    if (designers.length) {
      var designerRow = document.createElement('div');
      designerRow.className = 'immersive-filters__row immersive-filters__designer-row';
      designers.forEach(function (vendor) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'immersive-filters__designer-chip immersive-chip';
        chip.setAttribute('aria-pressed', currentState.designers.indexOf(vendor) !== -1 ? 'true' : 'false');
        chip.textContent = vendor;
        if (currentState.designers.indexOf(vendor) !== -1) chip.classList.add('is-active');
        chip.addEventListener('click', function () {
          var idx = currentState.designers.indexOf(vendor);
          if (idx === -1) {
            currentState.designers.push(vendor);
            chip.setAttribute('aria-pressed', 'true');
            chip.classList.add('is-active');
          } else {
            currentState.designers.splice(idx, 1);
            chip.setAttribute('aria-pressed', 'false');
            chip.classList.remove('is-active');
          }
          applyFilters(currentState);
        });
        designerRow.appendChild(chip);
      });
      toolbar.appendChild(designerRow);
    }

    toolbar.appendChild(sortRow);
    toolbar.appendChild(priceRow);

    // Clear all
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'immersive-filters__clear';
    clearBtn.textContent = 'Clear all';
    clearBtn.addEventListener('click', clearFilters);
    toolbar.appendChild(clearBtn);

    return toolbar;
  }

  // Inject toolbar before the product grid
  var existingToolbar = contentEl.querySelector('[data-immersive-filters]');
  if (!existingToolbar) {
    var grid = contentEl.querySelector('.immersive-product-grid-wrapper');
    if (grid) {
      var toolbar = buildToolbar();
      contentEl.insertBefore(toolbar, grid);
    }
  }

  // Apply saved filters on init if any are active
  var hasSavedFilters =
    currentState.colors.length ||
    currentState.priceMin ||
    currentState.priceMax ||
    currentState.designers.length ||
    (currentState.sortBy && currentState.sortBy !== 'manual');
  if (hasSavedFilters) {
    applyFilters(currentState);
  }
}

// ============================================================
// ImmersiveNextActions — contextual action chips after key events
// ============================================================

var _nextActionsTimer = null;
var _nextActionsBar = null;

function showNextActions(chips) {
  if (!_nextActionsBar) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clear existing
  clearTimeout(_nextActionsTimer);
  _nextActionsBar.innerHTML = '';

  // Build chips
  var inner = document.createElement('div');
  inner.className = 'immersive-next-actions__inner';

  chips.forEach(function (chip) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'immersive-next-actions__chip immersive-chip';
    btn.textContent = chip.label;
    btn.addEventListener('click', function () {
      dismissNextActions();
      if (typeof chip.action === 'function') chip.action();
    });
    inner.appendChild(btn);
  });

  // Close button
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'immersive-next-actions__close';
  closeBtn.setAttribute('aria-label', 'Dismiss');
  closeBtn.innerHTML =
    '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.addEventListener('click', dismissNextActions);
  inner.appendChild(closeBtn);

  _nextActionsBar.appendChild(inner);
  _nextActionsBar.hidden = false;
  if (!reduceMotion) _nextActionsBar.classList.add('is-visible');

  // Auto-dismiss after 6s
  _nextActionsTimer = setTimeout(dismissNextActions, 6000);
}

function dismissNextActions() {
  clearTimeout(_nextActionsTimer);
  if (_nextActionsBar) {
    _nextActionsBar.classList.remove('is-visible');
    _nextActionsBar.hidden = true;
    _nextActionsBar.innerHTML = '';
  }
}

function showAfterAddToCart(product) {
  if (!product) return;
  showNextActions([
    {
      label: 'Complete the look',
      action: function () {
        if (product.handle && typeof openProductPanel === 'function') {
          openProductPanel(product.handle);
        }
      },
    },
    {
      label: 'View cart',
      action: function () {
        var cartToggle = document.getElementById('cart-toggle');
        if (cartToggle) cartToggle.click();
      },
    },
  ]);
}

// ============================================================
// ImmersiveRoomRecommender — rule-based room suggestions
// ============================================================

// _browsingContext is defined in immersive-core.js — do not redeclare here.
// Features module references it via typeof check.

// BRIDAL_KEYWORDS and DESIGNER_HOUSE_COLLECTIONS are defined in immersive-core.js
// and accessed here via the global scope (no redeclaration needed).

function getRecommendation(context) {
  // Override hook for ML-driven scoring
  if (typeof window.ImmersiveRecommenderOverride === 'function') {
    try {
      var override = window.ImmersiveRecommenderOverride(context);
      if (override && override.roomKey) return override;
    } catch (e) {}
  }

  var visited = context.visitedRooms || [];
  var saved = context.savedProducts || [];
  var cart = context.cartCollections || [];

  // Rule 1: wishlist/cart contains bridal/mehndi → occasions
  var hasBridal = saved.concat(cart).some(function (h) {
    return BRIDAL_KEYWORDS.some(function (kw) {
      return h.indexOf(kw) !== -1;
    });
  });
  if (hasBridal && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your saves' };
  }

  // Rule 2: wishlist contains designer-house products → designer_houses
  var hasDesigner = saved.some(function (h) {
    return DESIGNER_HOUSE_COLLECTIONS.some(function (d) {
      return h.indexOf(d) !== -1;
    });
  });
  if (hasDesigner && visited.indexOf('designer_houses') === -1) {
    return { roomKey: 'designer_houses', label: 'Designer Houses', reason: 'Based on your saves' };
  }

  // Rule 3: visited designer_houses but not occasions
  if (visited.indexOf('designer_houses') !== -1 && visited.indexOf('occasions') === -1) {
    return { roomKey: 'occasions', label: 'Occasions', reason: 'Based on your browsing' };
  }

  // Rule 4: visited occasions but not featured_collections
  if (visited.indexOf('occasions') !== -1 && visited.indexOf('featured_collections') === -1) {
    return { roomKey: 'featured_collections', label: 'Featured Collections', reason: 'Based on your browsing' };
  }

  // Default fallback
  return { roomKey: 'lounge', label: 'Lounge', reason: 'Continue exploring' };
}

function evaluateRoomRecommendation() {
  if (!_browsingContext.visitedRooms.length) return;
  var rec = getRecommendation(_browsingContext);
  if (!rec) return;

  // Check if already dismissed this session
  try {
    if (sessionStorage.getItem('immersive_rec_dismissed_' + rec.roomKey)) return;
  } catch (e) {}

  showRoomRecommendation(rec);
}

function showRoomRecommendation(rec) {
  // Remove existing chip
  var existing = document.querySelector('.immersive-rec-chip');
  if (existing) existing.remove();

  var chip = document.createElement('div');
  chip.className = 'immersive-rec-chip';
  chip.setAttribute('role', 'complementary');
  chip.setAttribute('aria-label', rec.reason + ': ' + rec.label);

  var reason = document.createElement('span');
  reason.className = 'immersive-rec-chip__reason';
  reason.textContent = rec.reason;

  var label = document.createElement('button');
  label.type = 'button';
  label.className = 'immersive-rec-chip__label';
  label.textContent = rec.label + ' →';
  label.addEventListener('click', function () {
    chip.remove();
    if (typeof goToRoom === 'function') goToRoom(rec.roomKey);
  });

  var dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'immersive-rec-chip__dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss suggestion');
  dismiss.innerHTML = '×';
  dismiss.addEventListener('click', function () {
    try {
      sessionStorage.setItem('immersive_rec_dismissed_' + rec.roomKey, '1');
    } catch (e) {}
    chip.remove();
  });

  chip.appendChild(reason);
  chip.appendChild(label);
  chip.appendChild(dismiss);
  document.body.appendChild(chip);

  // Auto-dismiss after 10s
  setTimeout(function () {
    if (chip.parentNode) chip.remove();
  }, 10000);
}

function trackRoomVisit(roomKey) {
  if (_browsingContext.visitedRooms.indexOf(roomKey) === -1) {
    _browsingContext.visitedRooms.push(roomKey);
  }
  evaluateRoomRecommendation();
  syncVisitedRooms();
}

// ============================================================
// ImmersiveLimitedTime — countdown timers, low-stock badges, flash sale
// ============================================================

var _limitedTimeIntervals = [];
var _lowStockThreshold = 5;

function computeCountdown(endTime) {
  var now = Date.now();
  var end = endTime instanceof Date ? endTime.getTime() : new Date(endTime).getTime();
  if (isNaN(end) || end <= now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  var diff = Math.floor((end - now) / 1000);
  var days = Math.floor(diff / 86400);
  var hours = Math.floor((diff % 86400) / 3600);
  var minutes = Math.floor((diff % 3600) / 60);
  var seconds = diff % 60;
  return { days: days, hours: hours, minutes: minutes, seconds: seconds, expired: false };
}

function renderCountdown(endTime, containerEl) {
  if (!containerEl) return;
  var reduceMotionLT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var endDate = new Date(endTime);
  if (isNaN(endDate.getTime())) return; // silently skip invalid dates

  function update() {
    var state = computeCountdown(endDate);
    if (state.expired) {
      containerEl.innerHTML = '';
      return;
    }
    var parts = [];
    if (state.days > 0) parts.push(state.days + 'd');
    parts.push(pad(state.hours) + 'h');
    parts.push(pad(state.minutes) + 'm');
    parts.push(pad(state.seconds) + 's');
    containerEl.textContent = parts.join(' ');
    if (!reduceMotionLT) containerEl.classList.add('is-ticking');
  }

  update();
  var intervalId = setInterval(update, 1000);
  _limitedTimeIntervals.push(intervalId);
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function renderLowStockBadge(quantity, containerEl) {
  if (!containerEl || quantity === null || quantity === undefined || isNaN(quantity)) return;
  if (quantity > _lowStockThreshold) return;
  var badge = document.createElement('span');
  badge.className = 'immersive-low-stock-badge immersive-badge';
  badge.textContent = 'Only ' + quantity + ' left';
  containerEl.appendChild(badge);
}

function scanLimitedTimeCards(scopeEl) {
  var scope = scopeEl || document;
  scope.querySelectorAll('[data-sale-end-date]').forEach(function (card) {
    var endDate = card.getAttribute('data-sale-end-date');
    var qty = parseInt(card.getAttribute('data-inventory-quantity'), 10);
    var urgency = card.querySelector('[data-urgency-container]');
    if (!urgency) return;
    urgency.innerHTML = '';
    if (endDate) {
      var countdownEl = document.createElement('span');
      countdownEl.className = 'immersive-countdown';
      urgency.appendChild(countdownEl);
      renderCountdown(endDate, countdownEl);
    }
    if (!isNaN(qty)) {
      renderLowStockBadge(qty, urgency);
    }
  });
}

function showFlashSaleAlert() {
  var banners = document.querySelectorAll('[data-flash-sale-banner]');
  banners.forEach(function (banner) {
    var dismissKey = 'immersive_flash_dismissed';
    try {
      if (sessionStorage.getItem(dismissKey)) return;
    } catch (e) {}

    banner.hidden = false;

    var endDate = banner.getAttribute('data-sale-end-date');
    var countdownEl = banner.querySelector('[data-flash-countdown]');
    if (endDate && countdownEl) renderCountdown(endDate, countdownEl);

    var dismissBtn = banner.querySelector('[data-flash-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        banner.hidden = true;
        try {
          sessionStorage.setItem(dismissKey, '1');
        } catch (e) {}
      });
    }
  });
}

function clearLimitedTimeIntervals() {
  if (!_limitedTimeIntervals) return;
  _limitedTimeIntervals.forEach(function (id) {
    clearInterval(id);
  });
  _limitedTimeIntervals = [];
}

// Guard against double-init (theme editor fires section events rapidly)
// ─────────────────────────────────────────────────────────────
// Keyboard Navigation for Hotspots - Accessibility Enhancement
// ─────────────────────────────────────────────────────────────

// ── EditorialHeroParallax state ─────────────────────────────
var _ehpScrollTarget = 0;
var _ehpScrollCurrent = 0;
var _ehpRafId = null;
var _ehpOverlay = null;
var _ehpHeroImg = null;

// ── VisitedRoomsIndicator ───────────────────────────────────
var VISITED_ROOMS_EXCLUDE = ['lounge', 'storefront'];

// ============================================================
// EditorialBackToLounge
// ============================================================

function updateBackToLoungeVisibility(roomKey) {
  var btn = document.querySelector('[data-editorial-back-to-lounge]');
  if (!btn) return;
  btn.hidden = roomKey === 'lounge';
}

// ============================================================
// VisitedRoomsIndicator
// ============================================================

function syncVisitedRooms() {
  var picker = document.querySelector('[data-bottom-nav-room-picker]');
  if (!picker) return;

  var visitedLabel = picker.getAttribute('data-room-visited-label') || 'Visited';
  var visited = (_browsingContext && _browsingContext.visitedRooms) || [];
  var buttons = picker.querySelectorAll('[data-room-key]');

  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var key = btn.getAttribute('data-room-key');
    var isVisited = visited.indexOf(key) !== -1 && VISITED_ROOMS_EXCLUDE.indexOf(key) === -1;
    if (isVisited) {
      btn.classList.add('is-visited');
      btn.setAttribute('aria-description', visitedLabel);
    } else {
      btn.classList.remove('is-visited');
      btn.removeAttribute('aria-description');
    }
  }
}

// ============================================================
// EditorialHeroParallax
// ============================================================

function _ehpOnScroll() {
  if (!_ehpOverlay) return;
  _ehpScrollTarget = Math.min(Math.max(_ehpOverlay.scrollTop * 0.3, 0), 60);
}

function _ehpLoop() {
  _ehpScrollCurrent += (_ehpScrollTarget - _ehpScrollCurrent) * 0.08;
  if (_ehpHeroImg) {
    _ehpHeroImg.style.transform = 'translateY(' + _ehpScrollCurrent + 'px)';
  }
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

function initEditorialHeroParallax() {
  var reduceMotionEHP = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotionEHP) return;

  _ehpOverlay = document.getElementById('immersive-editorial-overlay');
  if (!_ehpOverlay) return;

  _ehpHeroImg = _ehpOverlay.querySelector('.immersive-editorial__hero-bg');
  if (!_ehpHeroImg) {
    destroyEditorialHeroParallax();
    return;
  }

  _ehpScrollTarget = 0;
  _ehpScrollCurrent = 0;

  _ehpOverlay.addEventListener('scroll', _ehpOnScroll, { passive: true });
  _ehpRafId = requestAnimationFrame(_ehpLoop);
}

function destroyEditorialHeroParallax() {
  if (_ehpOverlay) _ehpOverlay.removeEventListener('scroll', _ehpOnScroll);
  if (_ehpRafId !== null) {
    cancelAnimationFrame(_ehpRafId);
    _ehpRafId = null;
  }
  if (_ehpHeroImg) {
    _ehpHeroImg.style.transform = '';
  }
  _ehpOverlay = null;
  _ehpHeroImg = null;
  _ehpScrollTarget = 0;
  _ehpScrollCurrent = 0;
}

// Expose the destroy function globally so it can be called during section unload
if (typeof window.ShahanaImmersive !== 'undefined') {
  if (!window.ShahanaImmersive.editorialFeatures) {
    window.ShahanaImmersive.editorialFeatures = {};
  }
  window.ShahanaImmersive.editorialFeatures.destroyEditorialHeroParallax = destroyEditorialHeroParallax;
  window.ShahanaImmersive.editorialFeatures.cleanupGuidedModeTimers = cleanupGuidedModeTimers;
}

// ============================================================
// ProductCardTilt
// ============================================================

function _pctClamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function _pctApplyTilt() {
  if (!_pctActiveCard) {
    _pctRafPending = false;
    return;
  }
  var rotateY = _pctPendingNormX * 8;
  var rotateX = -_pctPendingNormY * 8;
  _pctActiveCard.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
  _pctRafPending = false;
}

// ============================================================
// GUIDED MODE — Concierge sequence
// Storefront → Lounge → Editorial → Collection → Product
// ============================================================

var _guidedIdleTimer = null;
var _guidedPromptTimer = null;
var _guidedStep = 0; // 0=lounge, 1=editorial, 2=collection, 3=product
var _guidedFeaturedWing = 'designer_houses'; // overridden from section setting on init

var GUIDED_IDLE_MS = 10000; // 10s before auto-advance
var GUIDED_PROMPT_MS = 3500; // 3.5s before showing soft prompt in lounge

// Steps: 0=lounge, 1=editorial, 2=collection, 3=product
var GUIDED_STEPS = ['lounge', 'editorial', 'collection', 'product'];

function activateGuidedMode() {
  // Don't restart if dismissed this session
  try {
    if (sessionStorage.getItem('immersive_guided_dismissed')) return;
  } catch (e) {}

  immersiveState.guided = true;
  _guidedStep = 0;
  _updateGuidedDots(0);
  _showGuidedProgress();
  _guidedStartIdleTimer();
}

function exitGuidedMode() {
  if (!immersiveState.guided) return;
  immersiveState.guided = false;
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);
  _guidedIdleTimer = null;
  _guidedPromptTimer = null;
  hideGuidedPrompt();
  _hideGuidedProgress();
  try {
    sessionStorage.setItem('immersive_guided_dismissed', '1');
  } catch (e) {}
}

function _guidedStartIdleTimer() {
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);

  if (!immersiveState.guided) return;

  // Show soft prompt after 3.5s
  _guidedPromptTimer = setTimeout(function () {
    if (immersiveState.guided) showGuidedPrompt();
  }, GUIDED_PROMPT_MS);

  // Auto-advance after 10s
  _guidedIdleTimer = setTimeout(function () {
    if (immersiveState.guided) {
      hideGuidedPrompt();
      _guidedAdvance();
    }
  }, GUIDED_IDLE_MS);
}

// Global cleanup function for guided mode timers that can be called during section unload
function cleanupGuidedModeTimers() {
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);
  _guidedIdleTimer = null;
  _guidedPromptTimer = null;
  hideGuidedPrompt();
  _hideGuidedProgress();
}

function _guidedResetIdleTimer() {
  if (!immersiveState.guided) return;
  clearTimeout(_guidedIdleTimer);
  clearTimeout(_guidedPromptTimer);
  hideGuidedPrompt();
  _guidedStartIdleTimer();
}

function _guidedAdvance() {
  if (!immersiveState.guided) return;

  _guidedStep++;
  _updateGuidedDots(_guidedStep);

  if (_guidedStep === 1) {
    // Step 1: Enter editorial of featured wing
    enterEditorialMode(_guidedFeaturedWing, null);
    // After editorial, guided mode waits for user to scroll/interact
    // Auto-advance to collection after idle
    _guidedStartIdleTimer();
  } else if (_guidedStep === 2) {
    // Step 2: Open the first collection from the featured wing
    exitEditorialMode();
    var firstCollection = _guidedGetFirstCollection(_guidedFeaturedWing);
    if (firstCollection) {
      setTimeout(function () {
        openCollectionPanel(firstCollection);
      }, 200);
    } else {
      // No collection configured — exit guided mode gracefully
      exitGuidedMode();
    }
  } else if (_guidedStep >= 3) {
    // Step 3+: Guided sequence complete — exit
    exitGuidedMode();
  }
}

function _guidedGetFirstCollection(wingKey) {
  var room = STORE_ROOMS[wingKey];
  if (!room || !room.hotspots) return null;
  for (var i = 0; i < room.hotspots.length; i++) {
    if (room.hotspots[i].targetCollection) return room.hotspots[i].targetCollection;
  }
  return null;
}

function showGuidedPrompt() {
  var prompt = document.getElementById('immersive-guided-prompt');
  if (!prompt) return;
  prompt.hidden = false;
  requestAnimationFrame(function () {
    prompt.classList.add('is-visible');
  });
}

function hideGuidedPrompt() {
  var prompt = document.getElementById('immersive-guided-prompt');
  if (!prompt) return;
  prompt.classList.remove('is-visible');
  // Hide after transition
  setTimeout(function () {
    if (!prompt.classList.contains('is-visible')) prompt.hidden = true;
  }, 500);
}

function _showGuidedProgress() {
  var el = document.getElementById('immersive-guided-progress');
  if (!el) return;
  el.hidden = false;
  requestAnimationFrame(function () {
    el.classList.add('is-visible');
  });
}

function _hideGuidedProgress() {
  var el = document.getElementById('immersive-guided-progress');
  if (!el) return;
  el.classList.remove('is-visible');
  setTimeout(function () {
    if (!el.classList.contains('is-visible')) el.hidden = true;
  }, 400);
}

function _updateGuidedDots(activeStep) {
  var dots = document.querySelectorAll('[data-guided-step]');
  for (var i = 0; i < dots.length; i++) {
    var step = parseInt(dots[i].getAttribute('data-guided-step'), 10);
    dots[i].classList.remove('is-active', 'is-done');
    if (step === activeStep) {
      dots[i].classList.add('is-active');
    } else if (step < activeStep) {
      dots[i].classList.add('is-done');
    }
  }
}
window.enterEditorialMode = enterEditorialMode;
