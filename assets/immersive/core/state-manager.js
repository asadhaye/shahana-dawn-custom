/**
 * State Manager - Application state and persistence
 * Extracted from immersive-store.js
 *
 * Manages session state (room navigation, mode, editorial overlays) and
 * persistent preferences (3D mode preference). All storage operations are
 * wrapped in try/catch to handle private browsing environments gracefully.
 */

var STATE_KEY = 'immersive_state';
var ONBOARDING_KEY = 'immersive_onboarding_seen';
var WISHLIST_KEY = 'immersive_wishlist';
var PREFERRED_MODE_KEY = 'immersive_preferred_mode';

/**
 * Current immersive application state.
 * Tracks room navigation, mode (showroom/editorial/panel), and focus restoration.
 *
 * @type {Object}
 * @property {string} currentRoom - Current room key (e.g., 'storefront', 'lounge', 'designer_houses')
 * @property {string} mode - Current mode: 'showroom' | 'editorial' | 'panel'
 * @property {string|null} editorialRoom - Room key when in editorial mode; null otherwise
 * @property {HTMLElement|null} lastHotspot - DOM element for focus restoration after overlay close
 * @property {boolean} guided - Whether guided sequence mode is active
 * @property {Array<string>} navigationStack - History of visited rooms for back button
 */
var immersiveState = {
  currentRoom: 'storefront',
  mode: 'showroom',
  editorialRoom: null,
  lastHotspot: null, // To restore focus accurately
  guided: false, // Guided sequence mode
  navigationStack: [], // Navigation history for back button
};

/**
 * Saves or updates session state in sessionStorage.
 * Merges the provided patch object with existing state.
 * Silently fails in private browsing environments.
 *
 * @param {Object} patch - Object containing state properties to update
 * @returns {void}
 *
 * @example
 * saveState({ currentRoom: 'lounge', mode: 'showroom' });
 */
function saveState(patch) {
  try {
    var current = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
    sessionStorage.setItem(STATE_KEY, JSON.stringify(Object.assign(current, patch)));
  } catch (e) {
    // Silently fail in private browsing or when storage is unavailable
  }
}

/**
 * Loads session state from sessionStorage.
 * Returns empty object if state does not exist or storage is unavailable.
 * Silently fails in private browsing environments.
 *
 * @returns {Object} Current session state or empty object if unavailable
 *
 * @example
 * var state = loadState();
 * console.log(state.currentRoom); // 'storefront'
 */
function loadState() {
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}');
  } catch (e) {
    // Silently fail in private browsing or when storage is unavailable
    return {};
  }
}

/**
 * Clears session state from sessionStorage.
 * Silently fails in private browsing environments.
 *
 * @returns {void}
 *
 * @example
 * clearState();
 */
function clearState() {
  try {
    sessionStorage.removeItem(STATE_KEY);
  } catch (e) {
    // Silently fail in private browsing or when storage is unavailable
  }
}

/**
 * Writes the immersive mode preference to storage.
 * Sets `immersive_preferred_mode` to '3d' to indicate user prefers the 3D experience.
 * Called on successful immersive scene initialization.
 * Silently fails in private browsing environments.
 *
 * @param {Storage} [storage] - Storage object to use (defaults to localStorage).
 *                              Can be localStorage, sessionStorage, or a mock for testing.
 * @returns {void}
 *
 * @example
 * // Write to localStorage (default)
 * writeImmersivePreference();
 *
 * @example
 * // Write to sessionStorage
 * writeImmersivePreference(sessionStorage);
 *
 * @example
 * // Write to mock storage for testing
 * var mockStorage = {};
 * writeImmersivePreference(mockStorage);
 */
function writeImmersivePreference(storage) {
  try {
    (storage || localStorage).setItem(PREFERRED_MODE_KEY, '3d');
  } catch (e) {
    // Silently fail in private browsing or when storage is unavailable
  }
}

/**
 * Clears the immersive mode preference from storage.
 * Removes `immersive_preferred_mode` key to reset preference state.
 * Silently fails in private browsing environments.
 *
 * @param {Storage} [storage] - Storage object to use (defaults to localStorage).
 *                              Can be localStorage, sessionStorage, or a mock for testing.
 * @returns {void}
 *
 * @example
 * // Clear from localStorage (default)
 * clearImmersivePreference();
 *
 * @example
 * // Clear from sessionStorage
 * clearImmersivePreference(sessionStorage);
 */
function clearImmersivePreference(storage) {
  try {
    (storage || localStorage).removeItem(PREFERRED_MODE_KEY);
  } catch (e) {
    // Silently fail in private browsing or when storage is unavailable
  }
}

/**
 * Reads the immersive mode preference from storage.
 * Returns true if user has previously used the 3D experience (preference is set to '3d').
 * Returns false if preference is not set or storage is unavailable.
 * Silently fails in private browsing environments.
 *
 * @param {Storage} [storage] - Storage object to use (defaults to localStorage).
 *                              Can be localStorage, sessionStorage, or a mock for testing.
 * @returns {boolean} True if user prefers 3D mode, false otherwise
 *
 * @example
 * // Read from localStorage (default)
 * if (readImmersivePreference()) {
 *   showPreferenceBanner();
 * }
 *
 * @example
 * // Read from sessionStorage
 * var prefers3d = readImmersivePreference(sessionStorage);
 *
 * @example
 * // Read from mock storage for testing
 * var mockStorage = { getItem: function() { return '3d'; } };
 * var result = readImmersivePreference(mockStorage); // true
 */
function readImmersivePreference(storage) {
  try {
    return (storage || localStorage).getItem(PREFERRED_MODE_KEY) === '3d';
  } catch (e) {
    // Silently fail in private browsing or when storage is unavailable
    return false;
  }
}

/**
 * Public API for immersive state management.
 * Exported to window.ImmersiveStateManager for use in other scripts.
 *
 * @type {Object}
 * @property {Function} saveState - Save session state
 * @property {Function} loadState - Load session state
 * @property {Function} clearState - Clear session state
 * @property {Function} writeImmersivePreference - Write 3D mode preference
 * @property {Function} clearImmersivePreference - Clear 3D mode preference
 * @property {Function} readImmersivePreference - Read 3D mode preference
 *
 * @example
 * // Write preference on scene init
 * window.ImmersiveStateManager.writeImmersivePreference();
 *
 * @example
 * // Read preference on 2D pages
 * if (window.ImmersiveStateManager.readImmersivePreference()) {
 *   showPreferenceBanner();
 * }
 */
window.ImmersiveStateManager = {
  saveState: saveState,
  loadState: loadState,
  clearState: clearState,
  writeImmersivePreference: writeImmersivePreference,
  clearImmersivePreference: clearImmersivePreference,
  readImmersivePreference: readImmersivePreference,
};
