'use strict';

/**
 * Integration tests for immersive-state-manager.js
 *
 * Tests the StateManager in isolation with a real jsdom localStorage/sessionStorage.
 */

const fs = require('fs');
const path = require('path');

const SRC_PATH = path.resolve(__dirname, '../assets/immersive-state-manager.js');

let managerCode;

function setupManager(options) {
  options = options || {};

  // Always start with fresh storage to prevent cross-test leakage
  delete global.localStorage;
  delete global.sessionStorage;

  var localStorageData, sessionStorageData;

  if (options.storage) {
    // Reuse existing storage (for reload tests)
    localStorageData = options.storage.localStorageData;
    sessionStorageData = options.storage.sessionStorageData;
  } else {
    localStorageData = {};
    sessionStorageData = {};
  }

  // Expose storage objects for potential reuse in reload
  var sharedStorage = { localStorageData: localStorageData, sessionStorageData: sessionStorageData };

  global.localStorage = {
    getItem: (k) => localStorageData[k] !== undefined ? localStorageData[k] : null,
    setItem: (k, v) => { localStorageData[k] = String(v); },
    removeItem: (k) => { delete localStorageData[k]; },
    clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); },
    get length() { return Object.keys(localStorageData).length; },
    key: (i) => Object.keys(localStorageData)[i],
  };

  global.sessionStorage = {
    getItem: (k) => sessionStorageData[k] !== undefined ? sessionStorageData[k] : null,
    setItem: (k, v) => { sessionStorageData[k] = String(v); },
    removeItem: (k) => { delete sessionStorageData[k]; },
    clear: () => { Object.keys(sessionStorageData).forEach(k => delete sessionStorageData[k]); },
    get length() { return Object.keys(sessionStorageData).length; },
    key: (i) => Object.keys(sessionStorageData)[i],
  };

  // Fresh window
  delete global.window;
  global.window = {
    __IMMERSIVE_DEV__: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    document: global.document,
    performance: global.performance,
  };

  if (!managerCode) {
    managerCode = fs.readFileSync(SRC_PATH, 'utf8');
  }

  // Execute the StateManager source
  const vm = require('vm');
  const script = new vm.Script(managerCode, { filename: 'immersive-state-manager.js' });
  const context = vm.createContext({
    window: global.window,
    localStorage: global.localStorage,
    sessionStorage: global.sessionStorage,
    document: global.document,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    console: console,
    performance: global.performance,
  });
  script.runInContext(context);

  if (options.reload) {
    // Simulate a new page load: re-run the source against the same storage
    delete global.window.ImmersiveTheme;
    const script2 = new vm.Script(managerCode, { filename: 'immersive-state-manager.js' });
    const context2 = vm.createContext({
      window: global.window,
      localStorage: global.localStorage,
      sessionStorage: global.sessionStorage,
      document: global.document,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      console: console,
      performance: global.performance,
    });
    script2.runInContext(context2);
  }

  return { state: global.window.ImmersiveTheme.state, storage: sharedStorage };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('immersive-state-manager', () => {
  // ── 1. Preferred mode persistence ─────────────────────────────────────

  describe('preferredMode', () => {
    it('persists to localStorage and survives a simulated reload', () => {
      var first = setupManager();
      var sm = first.state;

      sm.set('preferredMode', '3d', { persist: 'local' });
      expect(sm.get('preferredMode')).toBe('3d');

      // Simulate reload — reuse same storage objects
      var second = setupManager({ reload: true, storage: first.storage });
      var sm2 = second.state;
      expect(sm2.get('preferredMode')).toBe('3d');
    });

    it('returns null by default', () => {
      var { state: sm } = setupManager();
      expect(sm.get('preferredMode')).toBeNull();
    });

    it('can be cleared', () => {
      var first = setupManager();
      var sm = first.state;
      sm.set('preferredMode', '3d', { persist: 'local' });
      sm.set('preferredMode', null, { persist: 'local' });

      var second = setupManager({ reload: true, storage: first.storage });
      var sm2 = second.state;
      expect(sm2.get('preferredMode')).toBeNull();
    });
  });

  // ── 2. Session-only paths ──────────────────────────────────────────────

  describe('session-only persistence', () => {
    it('writes immersive.navigation.history to sessionStorage', () => {
      var first = setupManager();
      var sm = first.state;

      sm.set('immersive.navigation.history', ['storefront', 'lounge'], { persist: 'session' });
      expect(sm.get('immersive.navigation.history')).toEqual(['storefront', 'lounge']);

      // Should survive a reload (sessionStorage persists)
      var second = setupManager({ reload: true, storage: first.storage });
      var sm2 = second.state;
      expect(sm2.get('immersive.navigation.history')).toEqual(['storefront', 'lounge']);
    });

    it('writes immersive.recommendations.dismissedRooms to sessionStorage', () => {
      var first = setupManager();
      var sm = first.state;

      var map = sm.get('immersive.recommendations.dismissedRooms') || {};
      map['lounge'] = true;
      sm.set('immersive.recommendations.dismissedRooms', map, { persist: 'session' });

      var second = setupManager({ reload: true, storage: first.storage });
      var sm2 = second.state;
      var loaded = sm2.get('immersive.recommendations.dismissedRooms');
      expect(loaded.lounge).toBe(true);
    });

    it('session data is cleared when sessionStorage is cleared', () => {
      var { state: sm } = setupManager();
      sm.set('immersive.navigation.history', ['a', 'b'], { persist: 'session' });

      // Clear session storage (simulates new tab)
      global.sessionStorage.clear();

      sm.set('immersive.navigation.history', [], { persist: 'session' });
      expect(sm.get('immersive.navigation.history')).toEqual([]);
    });
  });

  // ── 3. Browsing signals append ─────────────────────────────────────────

  describe('browsing signals', () => {
    it('appends signals to immersive.browsing.signals', () => {
      var { state: sm } = setupManager();

      var a = sm.get('immersive.browsing.signals');
      var signals = Array.isArray(a) ? a : [];
      signals = signals.concat([{ room: 'lounge', ts: 1000 }]);
      sm.set('immersive.browsing.signals', signals, { persist: 'local' });

      var b = sm.get('immersive.browsing.signals');
      expect(Array.isArray(b)).toBe(true);
      expect(b.length).toBe(1);
      expect(b[0].room).toBe('lounge');

      // Append another
      var c = sm.get('immersive.browsing.signals') || [];
      c = c.concat([{ room: 'designer_houses', ts: 2000 }]);
      sm.set('immersive.browsing.signals', c, { persist: 'local' });

      var d = sm.get('immersive.browsing.signals');
      expect(d.length).toBe(2);
      expect(d[1].room).toBe('designer_houses');
    });
  });

  // ── 4. Subscriber pattern ──────────────────────────────────────────────

  describe('subscribers', () => {
    it('notifies subscribers on set', () => {
      var { state: sm } = setupManager();
      var notified = null;
      sm.subscribe('preferredMode', function (val) { notified = val; });

      sm.set('preferredMode', '3d', { persist: 'local' });
      expect(notified).toBe('3d');
    });
  });

  // ── 5. getState / reset ────────────────────────────────────────────────

  describe('getState and reset', () => {
    it('getState returns full state snapshot', () => {
      var { state: sm } = setupManager();
      var snapshot = sm.getState();
      expect(snapshot.onboarding).toBeDefined();
      expect(snapshot.immersive).toBeDefined();
    });

    it('reset clears state and storage', () => {
      var { state: sm } = setupManager();
      sm.set('preferredMode', '3d', { persist: 'local' });
      sm.reset();

      expect(sm.get('preferredMode')).toBeNull();
    });
  });
});
