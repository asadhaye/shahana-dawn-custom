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
